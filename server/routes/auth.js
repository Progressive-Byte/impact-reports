import express from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import PlatformSettings from '../models/PlatformSettings.js';
import Notification from '../models/Notification.js';
import ActivityLog from '../models/ActivityLog.js';
import { protect } from '../middleware/auth.js';

const clientIp = (req) =>
  req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || 'unknown';

const FAILED_LOGIN_THRESHOLD = 3;

const router = express.Router();

const signToken = (id, expiresInSeconds) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: expiresInSeconds });

// POST /api/auth/login
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
      // Increment consecutive failed attempts
      const updatedAdmin = await Admin.findByIdAndUpdate(
        admin._id,
        { $inc: { failedLoginAttempts: 1 } },
        { new: true }
      );
      const attempts = updatedAdmin.failedLoginAttempts;

      // Fire a notification if threshold reached and warning setting is on
      if (attempts >= FAILED_LOGIN_THRESHOLD) {
        const settings = await PlatformSettings.findOne({ key: 'platform' }).lean();
        if (settings?.failedLoginWarnings !== false) {
          await Notification.create({
            type:    'failed_login',
            title:   'Failed-login warning',
            message: `${attempts} consecutive failed login attempt${attempts === 1 ? '' : 's'} detected for account "${username}".`,
          });
          // Reset counter so the next threshold cycle starts fresh
          await Admin.findByIdAndUpdate(admin._id, { $set: { failedLoginAttempts: 0 } });
        }
      }

      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Read session timeout from platform settings (fallback: 30 min)
    const settings = await PlatformSettings.findOne({ key: 'platform' }).lean();
    const sessionTimeoutMinutes = settings?.sessionTimeoutMinutes ?? 30;
    const expiresInSeconds      = sessionTimeoutMinutes * 60;

    // Reset failed attempts on successful login
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

export default router;
