require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/event-booking';

const ADMIN_EMAIL = 'admin@eventbooking.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

mongoose.connect(uri).then(async () => {
  const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const result = await mongoose.connection.db.collection('users').updateOne(
    { email: ADMIN_EMAIL },
    {
      $set: {
        name: 'Admin User',
        email: ADMIN_EMAIL,
        password: hash,
        role: 'admin'
      },
      $setOnInsert: { createdAt: new Date(), updatedAt: new Date() }
    },
    { upsert: true }
  );
  if (result.upsertedCount === 1) {
    console.log(`Admin user created: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD} (role: admin)`);
  } else {
    console.log(`Admin user already existed; password reset to: ${ADMIN_PASSWORD} (role: admin)`);
  }
  process.exit(0);
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
