import crypto from 'crypto';
import express from 'express';
import jwt from 'jsonwebtoken';
import XLSX from 'xlsx';
import Admin from '../models/Admin.js';
import PlatformSettings from '../models/PlatformSettings.js';
import Notification from '../models/Notification.js';
import ActivityLog from '../models/ActivityLog.js';
import { protect } from '../middleware/auth.js';
import { send2FACode, sendPasswordResetEmail } from '../utils/mailer.js';

const clientIp = (req) =>
  req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || 'unknown';

const FAILED_LOGIN_THRESHOLD = 3;

const router = express.Router();

const signToken = (id, expiresInSeconds) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: expiresInSeconds });

const signTempToken = (id) =>
  jwt.sign({ id, pending2FA: true }, process.env.JWT_SECRET, { expiresIn: '10m' });

const hashCode = (val) =>
  crypto.createHash('sha256').update(val).digest('hex');

// POST /api/auth/login — validates credentials, emails OTP
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    const admin = await Admin.findOne({ username });
    if (!admin || !admin.isActive) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const valid = await admin.comparePassword(password);
    if (!valid) {
      const updatedAdmin = await Admin.findByIdAndUpdate(
        admin._id,
        { $inc: { failedLoginAttempts: 1 } },
        { new: true }
      );
      const attempts = updatedAdmin.failedLoginAttempts;
      if (attempts >= FAILED_LOGIN_THRESHOLD) {
        const settings = await PlatformSettings.findOne({ key: 'platform' }).lean();
        if (settings?.failedLoginWarnings !== false) {
          await Notification.create({
            type:    'failed_login',
            title:   'Failed-login warning',
            message: `${attempts} consecutive failed login attempt${attempts === 1 ? '' : 's'} detected for account "${username}".`,
          });
          await Admin.findByIdAndUpdate(admin._id, { $set: { failedLoginAttempts: 0 } });
        }
      }
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate 6-digit OTP, store hash + 10-min expiry
    const code = String(Math.floor(100000 + Math.random() * 900000));
    admin.twoFactorCode    = hashCode(code);
    admin.twoFactorExpires = new Date(Date.now() + 10 * 60 * 1000);
    await admin.save({ validateBeforeSave: false });

    // Fire-and-forget — if email fails, still return tempToken so user sees the OTP step
    send2FACode({ to: admin.email, code }).catch(() => {});

    return res.json({
      twoFactorRequired: true,
      tempToken:         signTempToken(admin._id),
      email:             admin.email.replace(/(.{2}).+(@.+)/, '$1***$2'), // masked for display
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/verify-2fa — validates OTP, returns real JWT
router.post('/verify-2fa', async (req, res) => {
  try {
    const { tempToken, code } = req.body;
    if (!tempToken || !code) {
      return res.status(400).json({ message: 'Token and code are required' });
    }

    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ message: 'Session expired. Please log in again.' });
    }
    if (!decoded.pending2FA) {
      return res.status(401).json({ message: 'Invalid session token' });
    }

    const admin = await Admin.findById(decoded.id);
    if (!admin || !admin.isActive) {
      return res.status(401).json({ message: 'Account not found or inactive' });
    }

    if (!admin.twoFactorCode || !admin.twoFactorExpires || admin.twoFactorExpires < new Date()) {
      return res.status(401).json({ message: 'Verification code expired. Please log in again.' });
    }

    if (admin.twoFactorCode !== hashCode(code.trim())) {
      return res.status(401).json({ message: 'Incorrect verification code' });
    }

    // Clear OTP
    admin.twoFactorCode    = undefined;
    admin.twoFactorExpires = undefined;
    admin.lastLogin           = new Date();
    admin.failedLoginAttempts = 0;
    await admin.save({ validateBeforeSave: false });

    ActivityLog.create({ type: 'login', username: admin.username, role: admin.role, ip: clientIp(req) }).catch(() => {});

    const settings = await PlatformSettings.findOne({ key: 'platform' }).lean();
    const sessionTimeoutMinutes = settings?.sessionTimeoutMinutes ?? 30;
    const expiresInSeconds      = sessionTimeoutMinutes * 60;

    res.json({
      token:                signToken(admin._id, expiresInSeconds),
      admin:                admin.toSafeObject(),
      sessionTimeoutMinutes,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/forgot-password — sends reset link to email
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    // Always return success to avoid leaking which emails are registered
    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (admin && admin.isActive) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      admin.passwordResetToken   = hashCode(rawToken);
      admin.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await admin.save({ validateBeforeSave: false });
      sendPasswordResetEmail({ to: admin.email, token: rawToken }).catch(() => {});
    }
    res.json({ message: 'If that email is registered, a reset link has been sent.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/reset-password — validates token, sets new password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const hashed = hashCode(token);
    const admin  = await Admin.findOne({
      passwordResetToken:   hashed,
      passwordResetExpires: { $gt: new Date() },
    });
    if (!admin) {
      return res.status(400).json({ message: 'Reset link is invalid or has expired' });
    }

    admin.password             = password; // pre-save hook will hash it
    admin.passwordResetToken   = undefined;
    admin.passwordResetExpires = undefined;
    await admin.save();

    res.json({ message: 'Password updated successfully. You can now log in.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, (req, res) => {
  res.json({ admin: req.admin });
});

// POST /api/auth/logout — records the logout event; session teardown is client-side
router.post('/logout', protect, async (req, res) => {
  try {
    await ActivityLog.create({ type: 'logout', username: req.admin.username, role: req.admin.role, ip: clientIp(req) });
  } catch { /* ignore */ }
  res.json({ message: 'Logged out' });
});

// GET /api/auth/logs — last 50 login/logout events, newest first
router.get('/logs', protect, async (_req, res) => {
  try {
    const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(50).lean();
    res.json({ logs });
  } catch {
    res.status(500).json({ message: 'Failed to load activity logs' });
  }
});

// GET /api/auth/logs/export?format=csv|excel — superadmin only, downloads all logs
router.get('/logs/export', protect, async (req, res) => {
  if (req.admin.role !== 'superadmin') {
    return res.status(403).json({ message: 'Superadmin only' });
  }
  try {
    const logs = await ActivityLog.find().sort({ createdAt: -1 }).lean();
    const format   = req.query.format === 'excel' ? 'excel' : 'csv';
    const date     = new Date().toISOString().split('T')[0];
    const filename = `activity-logs-${date}`;

    const rows = logs.map(l => ({
      Type:      l.type,
      Username:  l.username,
      Role:      l.role      || '',
      IP:        l.ip        || '',
      Timestamp: new Date(l.createdAt).toISOString(),
    }));

    if (format === 'csv') {
      const header = 'Type,Username,Role,IP,Timestamp\n';
      const body   = rows.map(r => `${r.Type},${r.Username},${r.Role},${r.IP},${r.Timestamp}`).join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      return res.send(header + body);
    }

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Activity Logs');
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);
    return res.send(buf);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
