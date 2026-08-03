import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mongoose from 'mongoose';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../../.env') });

// `sector` was changed from a single String to a [String] array so a report
// can belong to multiple sectors. Legacy documents still store a plain string
// ("Disaster Relief & Recovery") or nothing at all — normalize both to arrays.
async function backfill() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const collection = mongoose.connection.collection('reports');
  const cursor = collection.find({ sector: { $not: { $type: 'array' } } });

  let count = 0;
  for await (const doc of cursor) {
    const sector = typeof doc.sector === 'string' && doc.sector.trim()
      ? [doc.sector.trim()]
      : [];
    await collection.updateOne({ _id: doc._id }, { $set: { sector } });
    console.log(`  ${doc.projectName || doc._id}: ${JSON.stringify(doc.sector)} → ${JSON.stringify(sector)}`);
    count++;
  }

  console.log(`Done — migrated ${count} report(s)`);
  await mongoose.disconnect();
}

backfill().catch((err) => { console.error(err); process.exit(1); });
