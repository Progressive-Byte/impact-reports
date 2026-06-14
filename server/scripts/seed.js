import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mongoose from 'mongoose';
import Admin from '../models/Admin.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../../.env') });

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);

  const existing = await Admin.findOne({ username: 'admin' });
  if (existing) {
    process.exit(0);
  }

  await Admin.create({
    username: 'admin',
    email: 'admin@humanconcernusa.org',
    password: 'admin123',
    role: 'superadmin',
    isActive: true,
  });

  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
