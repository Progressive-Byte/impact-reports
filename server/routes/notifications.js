import express from 'express';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

// GET /api/notifications — last 30 notifications, newest first
router.get('/', async (_req, res) => {
  try {
    const [notifications, unreadCount] = await Promise.all([
      Notification.find().sort({ createdAt: -1 }).limit(30).lean(),
      Notification.countDocuments({ read: false }),
    ]);
    res.json({ notifications, unreadCount });
  } catch {
    res.status(500).json({ message: 'Failed to load notifications' });
  }
});

// PATCH /api/notifications/read-all — mark all as read
router.patch('/read-all', async (_req, res) => {
  try {
    await Notification.updateMany({ read: false }, { $set: { read: true } });
    res.json({ message: 'All notifications marked as read' });
  } catch {
    res.status(500).json({ message: 'Failed to update notifications' });
  }
});

// PATCH /api/notifications/:id/read — mark one as read
router.patch('/:id/read', async (req, res) => {
  try {
    const n = await Notification.findByIdAndUpdate(
      req.params.id,
      { $set: { read: true } },
      { new: true }
    );
    if (!n) return res.status(404).json({ message: 'Notification not found' });
    res.json({ notification: n });
  } catch {
    res.status(500).json({ message: 'Failed to update notification' });
  }
});

export default router;
