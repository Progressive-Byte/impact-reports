import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mongoose from 'mongoose';
import Report from '../models/Report.js';
import { toSlug, uniqueSlug } from '../utils/slugUtils.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../../.env') });

const isObjectId = (s) => /^[a-f\d]{24}$/i.test(s);

async function backfill() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Find reports with no slug, empty slug, or slug that is just the ObjectId
  const reports = await Report.find({
    $or: [
      { slug: { $exists: false } },
      { slug: '' },
      { slug: { $regex: /^[a-f\d]{24}$/i } },
    ],
  });

  console.log(`Found ${reports.length} report(s) to backfill`);

  for (const report of reports) {
    const base = toSlug(report.projectName);
    const slug = await uniqueSlug(Report, base, report._id);
    report.slug = slug;
    await report.save();
    console.log(`  ${report.projectName} → ${slug}`);
  }

  console.log('Done');
  await mongoose.disconnect();
}

backfill().catch((err) => { console.error(err); process.exit(1); });
