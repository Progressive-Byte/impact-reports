import express from 'express';
import { REGIONS } from '../config/regions.js';

const router = express.Router();

// ── GET /api/config/regions ──────────────────────────────────────────
// Public — no auth required. Returns the org's fixed region taxonomy.
router.get('/regions', (_req, res) => {
  res.json({ regions: REGIONS });
});

export default router;
