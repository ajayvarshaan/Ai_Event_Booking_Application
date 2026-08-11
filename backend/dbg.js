require('dotenv/config');
const mongoose = require('mongoose');

(async () => {
  const uri = process.env.MONGODB_URI;
  console.log('URI host:', (uri||'').split('@')[1] || uri);
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 20000 });
    console.log('CONNECTED');
    const db = mongoose.connection.db;
    const cols = await db.listCollections().toArray();
    console.log('Collections:', cols.map(c => c.name).join(', '));
    const Event = mongoose.model('Event', new mongoose.Schema({
      title: String, description: String, date: Date, time: String, location: String,
      category: String, price: Number, capacity: Number, availableSeats: Number,
      image: String, organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }, { collection: 'events' }));
    const User = mongoose.model('User', new mongoose.Schema({ name: String, email: String }, { collection: 'users' }));
    const events = await Event.find().populate('organizer', 'name email');
    console.log('EVENTS COUNT:', events.length);
    console.log('first:', JSON.stringify(events[0], null, 2));
  } catch (e) {
    console.log('ERROR:', e.message);
    console.log('STACK:', e.stack);
  } finally {
    await mongoose.disconnect().catch(()=>{});
    process.exit(0);
  }
})();
