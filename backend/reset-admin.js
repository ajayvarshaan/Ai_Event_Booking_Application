require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/event-booking';

mongoose.connect(uri).then(async () => {
  const hash = await bcrypt.hash('admin123', 10);
  const result = await mongoose.connection.db.collection('users').updateOne(
    { email: 'admin@eventbooking.com' },
    { $set: { password: hash } }
  );
  if (result.modifiedCount === 1) {
    console.log('Admin password successfully reset to: admin123');
  } else {
    console.log('No user found with email admin@eventbooking.com');
  }
  process.exit(0);
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
