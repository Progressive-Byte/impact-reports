import express from 'express';
import { REGIONS } from '../config/regions.js';
import PlatformSettings from '../models/PlatformSettings.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET /api/config/regions — public, returns the fixed region taxonomy
router.get('/regions', (_req, res) => {
  res.json({ regions: REGIONS });
});

// GET /api/config/settings — protected, returns platform settings
router.get('/settings', protect, async (_req, res) => {
  try {
    const settings = await PlatformSettings.findOne({ key: 'platform' }).lean();
    res.json({ defaultRegion: settings?.defaultRegion || '' });
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
    const { defaultRegion } = req.body;
    const settings = await PlatformSettings.findOneAndUpdate(
      { key: 'platform' },
      { $set: { defaultRegion: defaultRegion ?? '' } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();
    res.json({ defaultRegion: settings.defaultRegion });
  } catch {
    res.status(500).json({ message: 'Failed to save settings' });
  }
});

export default router;
