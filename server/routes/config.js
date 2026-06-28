import express from 'express';
import PlatformSettings from '../models/PlatformSettings.js';
import { protect } from '../middleware/auth.js';
import { sendWeeklyDigest } from '../utils/sendWeeklyDigest.js';

const router = express.Router();

// GET /api/config/donate — public; returns the global donation URL
router.get('/donate', async (_req, res) => {
  try {
    const settings = await PlatformSettings.findOne({ key: 'platform' }).lean();
    res.json({ url: settings?.donationUrl || '' });
  } catch {
    res.json({ url: '' });
  }
});

// GET /api/config/regions — public; returns DB regions
router.get('/regions', async (_req, res) => {
  try {
    const settings = await PlatformSettings.findOne({ key: 'platform' }).lean();
    res.json({ regions: settings?.regions || [] });
  } catch {
    res.json({ regions: [] });
  }
});

// PUT /api/config/regions — superadmin only, replaces the full region list
router.put('/regions', protect, async (req, res) => {
  if (req.admin.role !== 'superadmin') {
    return res.status(403).json({ message: 'Superadmin only' });
  }
  const { regions } = req.body;
  if (!Array.isArray(regions) || regions.length === 0) {
    return res.status(400).json({ message: 'At least one region is required' });
  }
  const cleaned = regions.map(r => r.trim()).filter(Boolean);
  if (cleaned.length === 0) {
    return res.status(400).json({ message: 'At least one region is required' });
  }
  try {
    const settings = await PlatformSettings.findOneAndUpdate(
      { key: 'platform' },
      { $set: { regions: cleaned } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();
    res.json({ regions: settings.regions });
  } catch {
    res.status(500).json({ message: 'Failed to save regions' });
  }
});

// GET /api/config/sectors — public; returns DB sectors
router.get('/sectors', async (_req, res) => {
  try {
    const settings = await PlatformSettings.findOne({ key: 'platform' }).lean();
    res.json({ sectors: settings?.sectors || [] });
  } catch {
    res.json({ sectors: [] });
  }
});

// PUT /api/config/sectors — superadmin only, replaces the full sector list
router.put('/sectors', protect, async (req, res) => {
  if (req.admin.role !== 'superadmin') {
    return res.status(403).json({ message: 'Superadmin only' });
  }
  const { sectors } = req.body;
  if (!Array.isArray(sectors) || sectors.length === 0) {
    return res.status(400).json({ message: 'At least one sector is required' });
  }
  const cleaned = sectors.map(s => s.trim()).filter(Boolean);
  if (cleaned.length === 0) {
    return res.status(400).json({ message: 'At least one sector is required' });
  }
  try {
    const settings = await PlatformSettings.findOneAndUpdate(
      { key: 'platform' },
      { $set: { sectors: cleaned } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();
    res.json({ sectors: settings.sectors });
  } catch {
    res.status(500).json({ message: 'Failed to save sectors' });
  }
});

// GET /api/config/departments — public; returns DB departments
router.get('/departments', async (_req, res) => {
  try {
    const settings = await PlatformSettings.findOne({ key: 'platform' }).lean();
    res.json({ departments: settings?.departments || [] });
  } catch {
    res.json({ departments: [] });
  }
});

// PUT /api/config/departments — superadmin only, replaces the full department list
router.put('/departments', protect, async (req, res) => {
  if (req.admin.role !== 'superadmin') {
    return res.status(403).json({ message: 'Superadmin only' });
  }
  const { departments } = req.body;
  if (!Array.isArray(departments) || departments.length === 0) {
    return res.status(400).json({ message: 'At least one department is required' });
  }
  const cleaned = departments.map(d => d.trim()).filter(Boolean);
  if (cleaned.length === 0) {
    return res.status(400).json({ message: 'At least one department is required' });
  }
  try {
    const settings = await PlatformSettings.findOneAndUpdate(
      { key: 'platform' },
      { $set: { departments: cleaned } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();
    res.json({ departments: settings.departments });
  } catch {
    res.status(500).json({ message: 'Failed to save departments' });
  }
});

// GET /api/config/social-links — public; returns only visible social media links
router.get('/social-links', async (_req, res) => {
  try {
    const settings = await PlatformSettings.findOne({ key: 'platform' }).lean();
    const links   = settings?.socialLinks        || {};
    const visible = settings?.socialLinksVisible || {};
    const KEYS    = ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube'];
    const result  = {};
    KEYS.forEach(k => { result[k] = visible[k] !== false ? (links[k] || '') : ''; });
    res.json(result);
  } catch {
    res.json({});
  }
});

// GET /api/config/settings — protected, returns platform settings
router.get('/settings', protect, async (_req, res) => {
  try {
    const settings = await PlatformSettings.findOne({ key: 'platform' }).lean();
    res.json({
      defaultRegion:          settings?.defaultRegion          || '',
      sessionTimeoutMinutes:  settings?.sessionTimeoutMinutes  ?? 30,
      enforceStrongPasswords: settings?.enforceStrongPasswords ?? false,
      failedLoginWarnings:    settings?.failedLoginWarnings    ?? true,
      weeklyDigest:           settings?.weeklyDigest           ?? false,
      require2fa:             settings?.require2fa             ?? false,
      donationUrl:            settings?.donationUrl            || '',
      socialLinks:            settings?.socialLinks            || {},
      socialLinksVisible:     settings?.socialLinksVisible     || {},
    });
  } catch {
    res.status(500).json({ message: 'Failed to load settings' });
  }
});

// PATCH /api/config/settings — superadmin only, updates platform settings
router.patch('/settings', protect, async (req, res) => {
  if (req.admin.role !== 'superadmin') {
    return res.status(403).json({ message: 'Superadmin only' });
  }
  try {
    const { defaultRegion, sessionTimeoutMinutes, enforceStrongPasswords, failedLoginWarnings, weeklyDigest, require2fa, socialLinks, socialLinksVisible } = req.body;
    const update = {};
    if (defaultRegion          !== undefined) update.defaultRegion          = defaultRegion;
    if (sessionTimeoutMinutes  !== undefined) update.sessionTimeoutMinutes  = Number(sessionTimeoutMinutes);
    if (enforceStrongPasswords !== undefined) update.enforceStrongPasswords = Boolean(enforceStrongPasswords);
    if (failedLoginWarnings    !== undefined) update.failedLoginWarnings    = Boolean(failedLoginWarnings);
    if (weeklyDigest           !== undefined) update.weeklyDigest           = Boolean(weeklyDigest);
    if (require2fa             !== undefined) update.require2fa             = Boolean(require2fa);
    const SOCIAL_KEYS = ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube'];
    if (socialLinks !== undefined) {
      SOCIAL_KEYS.forEach(k => {
        if (socialLinks[k] !== undefined) update[`socialLinks.${k}`] = String(socialLinks[k]).trim();
      });
    }
    if (socialLinksVisible !== undefined) {
      SOCIAL_KEYS.forEach(k => {
        if (socialLinksVisible[k] !== undefined) update[`socialLinksVisible.${k}`] = Boolean(socialLinksVisible[k]);
      });
    }

    const settings = await PlatformSettings.findOneAndUpdate(
      { key: 'platform' },
      { $set: update },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();
    res.json({
      defaultRegion:          settings.defaultRegion,
      sessionTimeoutMinutes:  settings.sessionTimeoutMinutes,
      enforceStrongPasswords: settings.enforceStrongPasswords,
      failedLoginWarnings:    settings.failedLoginWarnings,
      weeklyDigest:           settings.weeklyDigest,
      require2fa:             settings.require2fa,
      socialLinks:            settings.socialLinks        || {},
      socialLinksVisible:     settings.socialLinksVisible || {},
    });
  } catch {
    res.status(500).json({ message: 'Failed to save settings' });
  }
});

// POST /api/config/send-weekly-digest — superadmin only, manual trigger for testing
router.post('/send-weekly-digest', protect, async (req, res) => {
  if (req.admin.role !== 'superadmin') {
    return res.status(403).json({ message: 'Superadmin only' });
  }
  try {
    await sendWeeklyDigest();
    res.json({ message: 'Weekly digest sent' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
