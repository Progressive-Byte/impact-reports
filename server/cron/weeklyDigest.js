import cron from 'node-cron';
import { sendWeeklyDigest } from '../utils/sendWeeklyDigest.js';

// Every Monday at 08:00 AM (server local time)
// Cron syntax: minute hour day-of-month month day-of-week
//              0      8    *             *     1 (1 = Monday)
export function startWeeklyDigestCron() {
  cron.schedule('0 8 * * 1', async () => {
    console.log('[CRON] Running weekly digest job…');
    await sendWeeklyDigest();
  });
  console.log('[CRON] Weekly digest scheduled — every Monday at 08:00');
}
