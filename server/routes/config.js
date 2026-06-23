import express from 'express';
import { REGIONS } from '../config/regions.js';
import PlatformSettings from '../models/PlatformSettings.js';
import { protect } from '../middleware/auth.js';
import { sendWeeklyDigest } from '../utils/sendWeeklyDigest.js';

const router = express.Router();

// GET /api/config/regions — public; returns DB regions, falls back to hardcoded defaults
router.get('/regions', async (_req, res) => {
  try {
    const settings = await PlatformSettings.findOne({ key: 'platform' }).lean();
    const regions = settings?.regions?.length ? settings.regions : REGIONS;
    res.json({ regions });
  } catch {
    res.json({ regions: REGIONS });
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
    const { defaultRegion, sessionTimeoutMinutes, enforceStrongPasswords, failedLoginWarnings, weeklyDigest, require2fa } = req.body;
    const update = {};
    if (defaultRegion          !== undefined) update.defaultRegion          = defaultRegion;
    if (sessionTimeoutMinutes  !== undefined) update.sessionTimeoutMinutes  = Number(sessionTimeoutMinutes);
    if (enforceStrongPasswords !== undefined) update.enforceStrongPasswords = Boolean(enforceStrongPasswords);
    if (failedLoginWarnings    !== undefined) update.failedLoginWarnings    = Boolean(failedLoginWarnings);
    if (weeklyDigest           !== undefined) update.weeklyDigest           = Boolean(weeklyDigest);
    if (require2fa             !== undefined) update.require2fa             = Boolean(require2fa);

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
