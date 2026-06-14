/**
 * One-time migration: backfill `slug` and `projectId` for every report
 * that was created before these fields were added.
 *
 * Run once:
 *   node server/scripts/migrateSlug.js
 */
import '../bootstrap.js';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Report from '../models/Report.js';
import Counter from '../models/Counter.js';
import { toSlug, uniqueSlug } from '../utils/slugUtils.js';

await connectDB();

const reports = await Report.find({
  $or: [{ slug: { $in: [null, ''] } }, { projectId: { $in: [null, ''] } }],
}).select('_id projectName slug projectId');

console.log(`Found ${reports.length} report(s) to migrate.`);

for (const report of reports) {
  const needsSlug      = !report.slug;
  const needsProjectId = !report.projectId;

  if (needsSlug) {
    report.slug = await uniqueSlug(Report, toSlug(report.projectName), report._id);
  }

  if (needsProjectId) {
    const seq = await Counter.next('report');
    report.projectId = `REP-${String(seq).padStart(3, '0')}`;
  }

  await report.save();
  console.log(`  ✓ ${report.projectName}  →  ${report.slug}  [${report.projectId}]`);
}

console.log('Migration complete.');
await mongoose.disconnect();
