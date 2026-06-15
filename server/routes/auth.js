import express from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import PlatformSettings from '../models/PlatformSettings.js';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';

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
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Read session timeout from platform settings (fallback: 30 min)
    const settings = await PlatformSettings.findOne({ key: 'platform' }).lean();
    const sessionTimeoutMinutes = settings?.sessionTimeoutMinutes ?? 30;
    const expiresInSeconds      = sessionTimeoutMinutes * 60;

    admin.lastLogin = new Date();
    await admin.save({ validateBeforeSave: false });

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

export default router;
