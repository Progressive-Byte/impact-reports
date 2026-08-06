import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mongoose from 'mongoose';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../../.env') });

// One-time migration: converts the old fixed men/women/children percentage
// fields into the new freeform `demographics` array. Uses the raw driver
// (not the Report model) so it works whether or not the old fields are
// still declared on the schema.
async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  const col = mongoose.connection.db.collection('reports');

  const cursor = col.find({
    demographics: { $exists: false },
    $or: [
      { men: { $gt: 0 } },
      { women: { $gt: 0 } },
      { children: { $gt: 0 } },
    ],
  });

  let migrated = 0;
  for await (const doc of cursor) {
    const demographics = [
      { label: 'Men',              percentage: doc.men      ?? 0, icon: 'FiUser' },
      { label: 'Women',            percentage: doc.women    ?? 0, icon: 'FiUsers' },
      { label: 'Children (< 18)',  percentage: doc.children ?? 0, icon: 'FiSmile' },
    ];

    await col.updateOne(
      { _id: doc._id },
      {
        $set: { demographics, demographicsTitle: 'Recipient Demographics' },
        $unset: { men: '', women: '', children: '' },
      }
    );
    migrated++;
  }

  console.log(`Migrated ${migrated} report(s) to the new demographics format.`);
  await mongoose.disconnect();
  process.exit(0);
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
