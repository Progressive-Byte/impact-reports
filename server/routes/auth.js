import crypto from 'crypto';
import express from 'express';
import jwt from 'jsonwebtoken';
import XLSX from 'xlsx';
import { authenticator } from 'otplib';
import Admin from '../models/Admin.js';
import PlatformSettings from '../models/PlatformSettings.js';
import Notification from '../models/Notification.js';
import ActivityLog from '../models/ActivityLog.js';
import { protect } from '../middleware/auth.js';
import { sendResetOTPEmail, sendLoginOTPEmail } from '../utils/mailer.js';

const clientIp = (req) =>
  req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || 'unknown';

const FAILED_LOGIN_THRESHOLD = 3;

const router = express.Router();

const signToken = (id, expiresInSeconds) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: expiresInSeconds });

const signResetToken = (id) =>
  jwt.sign({ id, pendingReset: true }, process.env.JWT_SECRET, { expiresIn: '15m' });

const hashCode = (val) =>
  crypto.createHash('sha256').update(val).digest('hex');

// In-memory TOTP rate limiter: max 5 wrong attempts per 15-minute window
const totpAttempts = new Map();
const TOTP_MAX = 5;
const TOTP_WINDOW_MS = 15 * 60 * 1000;

function totpRateCheck(username) {
  const now   = Date.now();
  const entry = totpAttempts.get(username);
  if (!entry || entry.resetAt <= now) {
    totpAttempts.set(username, { count: 1, resetAt: now + TOTP_WINDOW_MS });
    return { allowed: true };
  }
  if (entry.count >= TOTP_MAX) {
    return { allowed: false, remaining: Math.ceil((entry.resetAt - now) / 60000) };
  }
  entry.count++;
  return { allowed: true };
}

function totpRateClear(username) { totpAttempts.delete(username); }

// POST /api/auth/login — validates credentials, returns JWT directly
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

    const settings = await PlatformSettings.findOne({ key: 'platform' }).lean();

    // 2FA — defer JWT; if TOTP not set up, always send email OTP immediately
    if (settings?.require2fa) {
      const methods = admin.totpEnabled ? ['totp', 'email'] : ['email'];
      admin.failedLoginAttempts = 0;

      if (!admin.totpEnabled) {
        // No authenticator app — send email OTP straight away
        const code = String(Math.floor(100000 + Math.random() * 900000));
        admin.loginOTPCode    = hashCode(code);
        admin.loginOTPExpires = new Date(Date.now() + 5 * 60 * 1000);
        sendLoginOTPEmail({ to: admin.email, code }).catch(() => {});
      }

      await admin.save({ validateBeforeSave: false });
      return res.json({ twoFaRequired: true, methods });
    }

    const sessionTimeoutMinutes = settings?.sessionTimeoutMinutes ?? 30;
    const expiresInSeconds      = sessionTimeoutMinutes * 60;

    admin.lastLogin           = new Date();
    admin.failedLoginAttempts = 0;
    await admin.save({ validateBeforeSave: false });

    ActivityLog.create({ type: 'login', username: admin.username, role: admin.role, ip: clientIp(req) }).catch(() => {});

    res.json({
      token:                signToken(admin._id, expiresInSeconds),
      admin:                admin.toSafeObject(),
      sessionTimeoutMinutes,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/verify-2fa — validates login OTP, returns full JWT
router.post('/verify-2fa', async (req, res) => {
  try {
    const { username, code } = req.body;
    if (!username || !code) {
      return res.status(400).json({ message: 'Username and code are required' });
    }
    const admin = await Admin.findOne({ username });
    if (
      !admin || !admin.isActive ||
      !admin.loginOTPCode || !admin.loginOTPExpires ||
      admin.loginOTPExpires < new Date()
    ) {
      return res.status(400).json({ message: 'Code is invalid or has expired' });
    }
    if (admin.loginOTPCode !== hashCode(code.trim())) {
      return res.status(400).json({ message: 'Incorrect verification code' });
    }

    admin.loginOTPCode    = undefined;
    admin.loginOTPExpires = undefined;
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

// POST /api/auth/resend-2fa-otp — regenerates login OTP for an active 2FA session
router.post('/resend-2fa-otp', async (req, res) => {
  try {
    const { username } = req.body;
    const admin = await Admin.findOne({ username });
    if (admin && admin.isActive) {
      const code = String(Math.floor(100000 + Math.random() * 900000));
      admin.loginOTPCode    = hashCode(code);
      admin.loginOTPExpires = new Date(Date.now() + 5 * 60 * 1000);
      await admin.save({ validateBeforeSave: false });
      sendLoginOTPEmail({ to: admin.email, code }).catch(() => {});
    }
    res.json({ message: 'If a 2FA session is active, a new code has been sent.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/forgot-password — sends 6-digit OTP to the registered email
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    // Always return success to avoid leaking which emails are registered
    if (admin && admin.isActive) {
      const code = String(Math.floor(100000 + Math.random() * 900000));
      admin.resetOTPCode    = hashCode(code);
      admin.resetOTPExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min
      await admin.save({ validateBeforeSave: false });
      sendResetOTPEmail({ to: admin.email, code }).catch(() => {});
    }
    res.json({ message: 'If that email is registered, a verification code has been sent.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/verify-reset-otp — validates OTP, returns short-lived reset token
router.post('/verify-reset-otp', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ message: 'Email and code are required' });
    }
    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (
      !admin ||
      !admin.resetOTPCode ||
      !admin.resetOTPExpires ||
      admin.resetOTPExpires < new Date()
    ) {
      return res.status(400).json({ message: 'Code is invalid or has expired' });
    }
    if (admin.resetOTPCode !== hashCode(code.trim())) {
      return res.status(400).json({ message: 'Incorrect verification code' });
    }
    // Clear the OTP now that it's been used
    admin.resetOTPCode    = undefined;
    admin.resetOTPExpires = undefined;
    await admin.save({ validateBeforeSave: false });

    res.json({ resetToken: signResetToken(admin._id) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/reset-password — validates reset token, sets new password
router.post('/reset-password', async (req, res) => {
  try {
    const { resetToken, password } = req.body;
    if (!resetToken || !password) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({ message: 'Reset session expired. Please start again.' });
    }
    if (!decoded.pendingReset) {
      return res.status(400).json({ message: 'Invalid reset token' });
    }

    const admin = await Admin.findById(decoded.id);
    if (!admin || !admin.isActive) {
      return res.status(400).json({ message: 'Account not found' });
    }

    admin.password = password; // pre-save hook re-hashes
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

// POST /api/auth/logout
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

// GET /api/auth/logs/export?format=csv|excel — superadmin only
router.get('/logs/export', protect, async (req, res) => {
  if (req.admin.role !== 'superadmin') {
    return res.status(403).json({ message: 'Superadmin only' });
  }
  try {
    const logs     = await ActivityLog.find().sort({ createdAt: -1 }).lean();
    const format   = req.query.format === 'excel' ? 'excel' : 'csv';
    const date     = new Date().toISOString().split('T')[0];
    const filename = `activity-logs-${date}`;
    const rows     = logs.map(l => ({
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
