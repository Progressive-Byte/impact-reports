import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import inviteRoutes from './routes/invite.js';
import reportRoutes from './routes/reports.js';
import uploadRoutes from './routes/upload.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '.env') });

connectDB();

const app = express();

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173'], credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(join(__dirname, 'uploads')));
app.use('/api', (_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/invite', inviteRoutes);
app.use('/api/reports', reportRoutes);

app.get('/api/health', (_, res) => res.json({ status: 'ok', timestamp: new Date() }));

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
