import express from 'express';
import Admin from '../models/Admin.js';
import Report from '../models/Report.js';
import { protect } from '../middleware/auth.js';
import { parsePagination, buildMeta } from '../utils/pagination.js';
import { toSlug, uniqueSlug } from '../utils/slugUtils.js';

const router = express.Router();
router.use(protect);

// GET /api/admin/dashboard — role-scoped dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const isSuperAdmin = req.admin.role === 'superadmin';
    const reportFilter = isSuperAdmin ? {} : { assignedTo: req.admin._id };

    const [published, pendingDraft, rawReports] = await Promise.all([
      Report.countDocuments({ ...reportFilter, status: 'published' }),
      Report.countDocuments({ ...reportFilter, status: { $in: ['pending', 'draft'] } }),
      Report.find(reportFilter)
        .select('countries livesImpacted projectName status updatedAt')
        .lean(),
    ]);

    // Per-country beneficiary aggregation
    const countryMap = {};
    let totalLivesImpacted = 0;
    rawReports.forEach(r => {
      totalLivesImpacted += r.livesImpacted || 0;
      if (!r.countries?.length || !r.livesImpacted) return;
      const perCountry = Math.round(r.livesImpacted / r.countries.length);
      r.countries.forEach(c => {
        countryMap[c] = (countryMap[c] || 0) + perCountry;
      });
    });
    const regionData = Object.entries(countryMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([country, livesImpacted]) => ({ country, livesImpacted }));

    // Recent report activity for Content Feed
    const recentActivity = [...rawReports]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 5)
      .map(r => ({ projectName: r.projectName, status: r.status, updatedAt: r.updatedAt }));

    const result = {
      reportStats: { published, pendingDraft, total: rawReports.length },
      totalLivesImpacted,
      regionData,
      recentActivity,
    };

    if (isSuperAdmin) {
      const [totalAdmins, activeAdmins] = await Promise.all([
        Admin.countDocuments(),
        Admin.countDocuments({ isActive: true }),
      ]);
      result.adminStats = { total: totalAdmins, active: activeAdmins };
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

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

// GET /api/admin/admins?page=1&limit=10&q=search&status=active|inactive
router.get('/admins', async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 10, maxLimit: 100 });
    const { q, status, role } = req.query;

    const filter = {};
    if (q && q.trim()) {
      const regex = new RegExp(q.trim(), 'i');
      filter.$or = [{ username: regex }, { email: regex }, { region: regex }];
    }
    if (status === 'active')   filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;
    if (role && ['superadmin', 'admin'].includes(role)) filter.role = role;

    const [items, total] = await Promise.all([
      Admin.find(filter).select('-password').sort('-createdAt').skip(skip).limit(limit),
      Admin.countDocuments(filter),
    ]);

    res.json({ items, meta: buildMeta({ page, limit, total }) });
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

// POST /api/admin/backfill-slugs — superadmin only, fixes reports missing a real slug
router.post('/backfill-slugs', async (req, res) => {
  try {
    if (req.admin.role !== 'superadmin') {
      return res.status(403).json({ message: 'Only superadmin can run this' });
    }
    const isObjectId = /^[a-f\d]{24}$/i;
    const reports = await Report.find({
      $or: [
        { slug: { $exists: false } },
        { slug: '' },
        { slug: { $regex: /^[a-f\d]{24}$/i } },
      ],
    });

    const fixed = [];
    for (const report of reports) {
      const slug = await uniqueSlug(Report, toSlug(report.projectName), report._id);
      report.slug = slug;
      await report.save();
      fixed.push({ id: report._id, name: report.projectName, slug });
    }

    res.json({ fixed: fixed.length, reports: fixed });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
