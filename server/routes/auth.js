import crypto from 'crypto';
import express from 'express';
import jwt from 'jsonwebtoken';
import XLSX from 'xlsx';
import { verifyTOTP } from '../utils/totp.js';
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

// POST /api/auth/verify-2fa — validates login OTP or TOTP code, returns full JWT
router.post('/verify-2fa', async (req, res) => {
  try {
    const { username, code, method = 'email' } = req.body;
    if (!username || !code) {
      return res.status(400).json({ message: 'Username and code are required' });
    }

    const admin = await Admin.findOne({ username });
    if (!admin || !admin.isActive) {
      return res.status(400).json({ message: 'Invalid session' });
    }

    if (method === 'totp') {
      // ── Authenticator app ──
      const rate = totpRateCheck(username);
      if (!rate.allowed) {
        return res.status(429).json({
          message: `Too many attempts. Try again in ${rate.remaining} minute${rate.remaining === 1 ? '' : 's'}.`,
        });
      }
      if (!admin.totpEnabled || !admin.totpSecret) {
        return res.status(400).json({ message: 'Authenticator app is not configured for this account' });
      }
      if (!verifyTOTP(code.trim(), admin.totpSecret)) {
        return res.status(400).json({ message: 'Incorrect code. Check your authenticator app.' });
      }
      if (admin.totpLastUsedCode === code.trim()) {
        return res.status(400).json({ message: 'This code has already been used. Wait for the next one.' });
      }
      admin.totpLastUsedCode = code.trim();
      totpRateClear(username);
    } else {
      // ── Email OTP ──
      if (!admin.loginOTPCode || !admin.loginOTPExpires || admin.loginOTPExpires < new Date()) {
        return res.status(400).json({ message: 'Code is invalid or has expired' });
      }
      if (admin.loginOTPCode !== hashCode(code.trim())) {
        return res.status(400).json({ message: 'Incorrect verification code' });
      }
      admin.loginOTPCode    = undefined;
      admin.loginOTPExpires = undefined;
    }

    admin.lastLogin           = new Date();
    admin.failedLoginAttempts = 0;
    await admin.save({ validateBeforeSave: false });

    ActivityLog.create({ type: 'login', username: admin.username, role: admin.role, ip: clientIp(req) }).catch(() => {});

    const settings = await PlatformSettings.findOne({ key: 'platform' }).lean();
    const sessionTimeoutMinutes = settings?.sessionTimeoutMinutes ?? 30;

    res.json({
      token:                signToken(admin._id, sessionTimeoutMinutes * 60),
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

// DELETE /api/auth/logs/purge — permanently delete logs older than 1 year, superadmin only
router.delete('/logs/purge', protect, async (req, res) => {
  if (req.admin.role !== 'superadmin') {
    return res.status(403).json({ message: 'Superadmin only' });
  }
  try {
    const cutoff = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    const result = await ActivityLog.deleteMany({ createdAt: { $lt: cutoff } });

    // Record who performed the purge so it appears at the top of the log
    await ActivityLog.create({
      type:     'purge',
      username: req.admin.username,
      role:     req.admin.role,
      ip:       clientIp(req),
      details:  `${result.deletedCount} record${result.deletedCount !== 1 ? 's' : ''} deleted`,
    });

    res.json({ message: 'Audit logs purged', deleted: result.deletedCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/logs — live logs from the last 30 days, newest first (max 500 rows)
router.get('/logs', protect, async (_req, res) => {
  try {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [logs, total] = await Promise.all([
      ActivityLog
        .find({ archivedAt: null, createdAt: { $gte: since } })
        .sort({ createdAt: -1 })
        .limit(500)
        .lean(),
      ActivityLog.countDocuments({ archivedAt: null, createdAt: { $gte: since } }),
    ]);
    res.json({ logs, meta: { total, windowDays: 30 } });
  } catch {
    res.status(500).json({ message: 'Failed to load activity logs' });
  }
});

// GET /api/auth/logs/export?format=csv|excel&scope=year|all|custom&from=YYYY-MM-DD&to=YYYY-MM-DD
// scope=year (default): last 365 days
// scope=all: full audit trail
// scope=custom: date range specified by `from` and `to` (ISO date strings, inclusive)
router.get('/logs/export', protect, async (req, res) => {
  if (req.admin.role !== 'superadmin') {
    return res.status(403).json({ message: 'Superadmin only' });
  }
  try {
    const rawScope = req.query.scope;
    const scope    = rawScope === 'all' ? 'all' : rawScope === 'custom' ? 'custom' : 'year';
    const format   = req.query.format === 'excel' ? 'excel' : 'csv';
    const today    = new Date().toISOString().split('T')[0];

    let filter;
    let filenameSuffix;

    if (scope === 'all') {
      filter         = {};
      filenameSuffix = `all-${today}`;
    } else if (scope === 'custom') {
      const fromStr = (req.query.from || '').trim();
      const toStr   = (req.query.to   || '').trim();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(fromStr) || !/^\d{4}-\d{2}-\d{2}$/.test(toStr)) {
        return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
      }
      const fromDate = new Date(`${fromStr}T00:00:00.000Z`);
      const toDate   = new Date(`${toStr}T23:59:59.999Z`);
      if (isNaN(fromDate) || isNaN(toDate)) {
        return res.status(400).json({ message: 'Invalid date values' });
      }
      if (fromDate > toDate) {
        return res.status(400).json({ message: 'Start date must be on or before end date' });
      }
      filter         = { createdAt: { $gte: fromDate, $lte: toDate } };
      filenameSuffix = `${fromStr}-to-${toStr}`;
    } else {
      filter         = { createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) } };
      filenameSuffix = `1year-${today}`;
    }

    const ALLOWED_COLS = ['Type', 'Username', 'Role', 'IP', 'Timestamp', 'Archived', 'Details'];

    // Parse optional columns whitelist — default: all columns
    const reqCols = (req.query.columns || '')
      .split(',').map(c => c.trim()).filter(c => ALLOWED_COLS.includes(c));
    const selectedCols = reqCols.length > 0 ? reqCols : ALLOWED_COLS;

    const logs     = await ActivityLog.find(filter).sort({ createdAt: -1 }).lean();
    const filename = `activity-logs-${filenameSuffix}`;

    const allRows = logs.map(l => ({
      Type:      l.type,
      Username:  l.username,
      Role:      l.role       || '',
      IP:        l.ip         || '',
      Timestamp: new Date(l.createdAt).toISOString(),
      Archived:  l.archivedAt ? new Date(l.archivedAt).toISOString() : '',
      Details:   l.details    || '',
    }));

    // Keep only the columns the caller requested
    const rows = allRows.map(r =>
      Object.fromEntries(selectedCols.map(c => [c, r[c] ?? '']))
    );

    if (format === 'csv') {
      const escape = (v) => {
        const s = v == null ? '' : String(v).replace(/"/g, '""');
        return /[",\n\r]/.test(s) ? `"${s}"` : s;
      };
      const header = selectedCols.join(',');
      const body   = rows.map(r => selectedCols.map(c => escape(r[c])).join(',')).join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      return res.send(`${header}\n${body}`);
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
