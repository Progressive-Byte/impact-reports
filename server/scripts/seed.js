require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB Atlas');

  const existing = await Admin.findOne({ username: 'admin' });
  if (existing) {
    console.log('✓ Default admin already exists — skipping seed');
    process.exit(0);
  }

  await Admin.create({
    username: 'admin',
    email: 'admin@humanconcernusa.org',
    password: 'admin123',
    role: 'superadmin',
    isActive: true,
  });

  console.log('✓ Default admin created:');
  console.log('  Username : admin');
  console.log('  Password : admin123');
  console.log('  Role     : superadmin');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
