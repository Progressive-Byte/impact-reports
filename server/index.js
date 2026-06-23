import './bootstrap.js'; // must be first — loads .env before any other module reads process.env
import { fileURLToPath } from 'url';
import path from 'path';
import { dirname, join } from 'path';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import inviteRoutes from './routes/invite.js';
import reportRoutes from './routes/reports.js';
import uploadRoutes from './routes/upload.js';
import publicRoutes from './routes/public.js';
import configRoutes from './routes/config.js';
import notificationRoutes from './routes/notifications.js';
import subscriberRoutes from './routes/subscribers.js';
import { startWeeklyDigestCron } from './cron/weeklyDigest.js';
import { startLogArchivalCron } from './cron/logArchival.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

connectDB();

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5174').split(',').map(s => s.trim());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use('/api', (_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/invite', inviteRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/config', configRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/subscribers', subscriberRoutes);

app.get('/api/health', (_, res) => res.json({ status: 'ok', timestamp: new Date() }));

const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
  // serve built frontend only in production
  app.use(express.static(path.join(__dirname, '../dist')));

  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) return;
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5173;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  startWeeklyDigestCron();
  startLogArchivalCron();
});
