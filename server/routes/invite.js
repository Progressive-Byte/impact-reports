import express from 'express';
import crypto from 'crypto';
import Invite from '../models/Invite.js';
import Admin from '../models/Admin.js';
import PlatformSettings from '../models/PlatformSettings.js';
import { protect } from '../middleware/auth.js';
import { sendInviteEmail } from '../utils/mailer.js';

// Strong password: min 12 chars + at least one number + at least one symbol
const isStrongPassword = (pw) =>
  pw.length >= 12 && /[0-9]/.test(pw) && /[^a-zA-Z0-9]/.test(pw);

const router = express.Router();

const sha256 = (val) => crypto.createHash('sha256').update(String(val)).digest('hex');

// POST /api/invite  — send invite (requires auth)
router.post('/', protect, async (req, res) => {
  try {
    const { email, role, region, department } = req.body;

    if (!email) return res.status(400).json({ message: 'Email is required' });
    if (!department?.trim()) return res.status(400).json({ message: 'Department is required' });
    if (!['superadmin', 'editor', 'viewer'].includes(role)) {
      return res.status(400).json({ message: 'Role must be superadmin, editor, or viewer' });
    }
    if (role === 'superadmin' && req.admin.role !== 'superadmin') {
      return res.status(403).json({ message: 'Only superadmin can invite superadmins' });
    }

    const existing = await Admin.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'An admin with this email already exists' });
    }

    // Remove any previous unused invites for this email
    await Invite.deleteMany({ email: email.toLowerCase(), used: false });

    const rawToken = crypto.randomBytes(32).toString('hex');
    await Invite.create({
      email: email.toLowerCase(),
      role,
      region:     region || 'global',
      department: department.trim(),
      tokenHash:  sha256(rawToken),
      expiresAt:  new Date(Date.now() + 48 * 60 * 60 * 1000),
    });

    await sendInviteEmail({ to: email, token: rawToken });
    res.json({ message: 'Invite sent successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/invite/validate?token=xxx  — public, check token validity
router.get('/validate', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: 'Token is required' });

    const invite = await Invite.findOne({
      tokenHash: sha256(token),
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!invite) {
      return res.status(400).json({ message: 'This invite link is invalid or has expired' });
    }

    const settings = await PlatformSettings.findOne({ key: 'platform' }).lean();
    res.json({
      email:                  invite.email,
      role:                   invite.role,
      region:                 invite.region,
      enforceStrongPasswords: settings?.enforceStrongPasswords ?? false,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/invite/register  — public, complete registration
router.post('/register', async (req, res) => {
  try {
    const { token, username, password } = req.body;

    if (!token || !username || !password) {
      return res.status(400).json({ message: 'Token, username and password are required' });
    }
    if (username.trim().length < 3) {
      return res.status(400).json({ message: 'Username must be at least 3 characters' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const settings = await PlatformSettings.findOne({ key: 'platform' }).lean();
    if (settings?.enforceStrongPasswords && !isStrongPassword(password)) {
      return res.status(400).json({
        message: 'Password must be at least 12 characters and include a number and a symbol',
      });
    }

    const invite = await Invite.findOne({
      tokenHash: sha256(token),
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!invite) {
      return res.status(400).json({ message: 'This invite link is invalid or has expired' });
    }

    const takenUsername = await Admin.findOne({ username: username.trim() });
    if (takenUsername) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    await Admin.create({
      username: username.trim(),
      email: invite.email,
      password,
      role: invite.role,
      region: invite.region,
      isActive: true,
    });

    invite.used = true;
    await invite.save();

    res.status(201).json({ message: 'Account created successfully. You can now log in.' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }
    res.status(500).json({ message: err.message });
  }
});

export default router;
