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

(async () => {
  await connectDB();

  const reports = await Report.find({
    $or: [{ slug: { $in: [null, ''] } }, { projectId: { $in: [null, ''] } }],
  }).select('_id projectName slug projectId');

  console.log(`Found ${reports.length} report(s) to migrate.`);

  for (const report of reports) {
    if (!report.slug) {
      report.slug = await uniqueSlug(Report, toSlug(report.projectName), report._id);
    }
    if (!report.projectId) {
      const seq = await Counter.next('report');
      report.projectId = `REP-${String(seq).padStart(3, '0')}`;
    }
    await report.save();
    console.log(`  ✓ ${report.projectName}  →  ${report.slug}  [${report.projectId}]`);
  }

  console.log('Migration complete.');
  await mongoose.disconnect();
})();
