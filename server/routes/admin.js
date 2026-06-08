import express from 'express';
import Admin from '../models/Admin.js';
import { protect } from '../middleware/auth.js';
import { parsePagination, buildMeta } from '../utils/pagination.js';

const router = express.Router();
router.use(protect);

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const totalAdmins = await Admin.countDocuments();
    const activeAdmins = await Admin.countDocuments({ isActive: true });
    res.json({ totalAdmins, activeAdmins });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/admins
router.get('/admins', async (req, res) => {
  try {
    const admins = await Admin.find().select('-password').sort('-createdAt');
    res.json(admins);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/admin/admins
router.post('/admins', async (req, res) => {
  try {
    if (req.admin.role !== 'superadmin') {
      return res.status(403).json({ message: 'Only superadmin can create admins' });
    }
    const { username, email, password, role } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email and password are required' });
    }
    const admin = await Admin.create({ username, email, password, role });
    res.status(201).json(admin.toSafeObject());
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/admin/admins/:id
router.delete('/admins/:id', async (req, res) => {
  try {
    if (req.admin.role !== 'superadmin') {
      return res.status(403).json({ message: 'Only superadmin can delete admins' });
    }
    if (req.params.id === req.admin._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }
    await Admin.findByIdAndDelete(req.params.id);
    res.json({ message: 'Admin deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/admin/admins/:id/toggle
router.patch('/admins/:id/toggle', async (req, res) => {
  try {
    if (req.admin.role !== 'superadmin') {
      return res.status(403).json({ message: 'Only superadmin can change admin status' });
    }
    const admin = await Admin.findById(req.params.id).select('-password');
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    admin.isActive = !admin.isActive;
    await admin.save({ validateBeforeSave: false });
    res.json(admin);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/admin/admins/:id  — full edit (superadmin only)
router.put('/admins/:id', async (req, res) => {
  try {
    if (req.admin.role !== 'superadmin') {
      return res.status(403).json({ message: 'Only superadmin can edit users' });
    }
    const { username, email, region, role } = req.body;
    const update = {};
    if (username) update.username = username.trim();
    if (email)    update.email    = email.toLowerCase().trim();
    if (region)   update.region   = region;
    if (role && ['superadmin', 'admin'].includes(role)) update.role = role;

    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, select: '-password', runValidators: true }
    );
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    res.json(admin);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Username or email already in use' });
    }
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/admin/admins/:id/role
router.patch('/admins/:id/role', async (req, res) => {
  try {
    if (req.admin.role !== 'superadmin') {
      return res.status(403).json({ message: 'Only superadmin can change roles' });
    }
    const { role } = req.body;
    if (!['superadmin', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Role must be superadmin or admin' });
    }
    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, select: '-password' }
    );
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    res.json(admin);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/admin/settings/password
router.put('/settings/password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both current and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }
    const admin = await Admin.findById(req.admin._id);
    const valid = await admin.comparePassword(currentPassword);
    if (!valid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    admin.password = newPassword;
    await admin.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/admin/settings/profile
router.put('/settings/profile', async (req, res) => {
  try {
    const { username, email } = req.body;
    const admin = await Admin.findById(req.admin._id);
    if (username) admin.username = username;
    if (email) admin.email = email;
    await admin.save();
    res.json(admin.toSafeObject());
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Username or email already in use' });
    }
    res.status(500).json({ message: err.message });
  }
});

export default router;
