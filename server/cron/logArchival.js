import cron from 'node-cron';
import ActivityLog from '../models/ActivityLog.js';

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

async function archiveOldLogs() {
  try {
    const cutoff = new Date(Date.now() - ONE_YEAR_MS);
    const result = await ActivityLog.updateMany(
      { createdAt: { $lt: cutoff }, archivedAt: null },
      { $set: { archivedAt: new Date() } }
    );
    if (result.modifiedCount > 0) {
      console.log(`[CRON] Log archival: soft-deleted ${result.modifiedCount} record(s) older than 1 year`);
    } else {
      console.log('[CRON] Log archival: no records to archive');
    }
  } catch (err) {
    console.error('[CRON] Log archival failed:', err.message);
  }
}

// 02:00 AM on the 1st of every month
export function startLogArchivalCron() {
  cron.schedule('0 2 1 * *', archiveOldLogs);
  console.log('[CRON] Log archival scheduled — 1st of every month at 02:00');
}

// Exported for manual trigger (e.g. admin action or tests)
export { archiveOldLogs };
