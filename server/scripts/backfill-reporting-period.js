import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mongoose from 'mongoose';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../../.env') });

// "FY25" → "2025", "FY2025" → "2025", anything else is passed through as-is.
function normalizeLegacyFiscalYear(fiscalYear) {
  const match = String(fiscalYear || '').match(/(\d+)/);
  if (!match) return String(fiscalYear || '').trim();
  const n = parseInt(match[1], 10);
  return n < 100 ? `20${String(n).padStart(2, '0')}` : String(n);
}

async function backfill() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Raw collection access — `fiscalYear` was removed from the Report schema
  // when it was renamed to `reportingPeriod`, so it's no longer reachable
  // through the Mongoose model.
  const collection = mongoose.connection.collection('reports');

  const cursor = collection.find({
    fiscalYear:      { $exists: true },
    reportingPeriod: { $exists: false },
  });

  let count = 0;
  for await (const doc of cursor) {
    const reportingPeriod = normalizeLegacyFiscalYear(doc.fiscalYear);
    await collection.updateOne(
      { _id: doc._id },
      { $set: { reportingPeriod }, $unset: { fiscalYear: '' } }
    );
    console.log(`  ${doc.projectName || doc._id}: "${doc.fiscalYear}" → "${reportingPeriod}"`);
    count++;
  }

  console.log(`Done — migrated ${count} report(s)`);
  await mongoose.disconnect();
}

backfill().catch((err) => { console.error(err); process.exit(1); });
