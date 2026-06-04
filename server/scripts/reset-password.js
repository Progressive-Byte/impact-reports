import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Admin from '../models/Admin.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env') });

const [,, username, newPassword] = process.argv;

if (!username || !newPassword) {
  console.error('Usage: node server/scripts/reset-password.js <username> <newPassword>');
  process.exit(1);
}

if (newPassword.length < 6) {
  console.error('Password must be at least 6 characters');
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI);
console.log('Connected to MongoDB Atlas');

const admin = await Admin.findOne({ username });
if (!admin) {
  console.error(`No admin found with username "${username}"`);
  process.exit(1);
}

// Hash directly — bypasses isModified() so it always runs regardless of current value
const hash = await bcrypt.hash(newPassword, 12);
await Admin.updateOne({ username }, { $set: { password: hash } });

console.log(`✓ Password for "${username}" has been bcrypt-hashed and saved`);
console.log(`  Username : ${username}`);
console.log(`  Password : ${newPassword}`);
console.log(`  Hash     : ${hash.substring(0, 20)}...`);
process.exit(0);
