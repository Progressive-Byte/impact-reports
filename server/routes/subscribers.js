import express from 'express';
import Subscriber from '../models/Subscriber.js';
import { protect } from '../middleware/auth.js';
import { parsePagination, buildMeta } from '../utils/pagination.js';

const router = express.Router();

// POST /api/subscribers/subscribe — public, no auth
router.post('/subscribe', async (req, res) => {
  const email = (req.body.email || '').trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'A valid email address is required.' });
  }
  try {
    await Subscriber.create({ email });
    return res.status(201).json({ message: 'Subscribed successfully.' });
  } catch (err) {
    if (err.code === 11000) {
      // Already subscribed — treat as success so we don't leak whether an email exists
      return res.status(200).json({ message: 'Already subscribed.' });
    }
    console.error(err);
    return res.status(500).json({ message: 'Subscription failed. Please try again.' });
  }
});

// GET /api/subscribers — superadmin only, paginated list
router.get('/', protect, async (req, res) => {
  if (req.admin.role !== 'superadmin') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 20 });
  const q = (req.query.q || '').trim();

  const filter = q ? { email: { $regex: q, $options: 'i' } } : {};

  const [items, total] = await Promise.all([
    Subscriber.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Subscriber.countDocuments(filter),
  ]);

  return res.json({ items, meta: buildMeta({ page, limit, total }) });
});

export default router;
