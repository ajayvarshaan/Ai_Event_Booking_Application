require('dotenv').config();
const mongoose = require('mongoose');


mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/event-booking')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const bookingSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  seats: Number,
  totalPrice: Number,
  status: String
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String
}, { timestamps: true });

const eventSchema = new mongoose.Schema({
  title: String,
  description: String,
  date: Date,
  time: String,
  location: String,
  category: String,
  price: Number,
  capacity: Number,
  availableSeats: Number,
  image: String,
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);
const User = mongoose.model('User', userSchema);
const Event = mongoose.model('Event', eventSchema);

async function checkBookings() {
  try {
    console.log('\n📊 Checking Bookings...\n');

    
    const allBookings = await Booking.find().populate('user', 'name email role').populate('event', 'title');
    
    console.log(`Total Bookings: ${allBookings.length}\n`);

    
    const bookingsByUser = {};
    
    allBookings.forEach(booking => {
      const userId = booking.user?._id?.toString() || 'unknown';
      const userName = booking.user?.name || 'Unknown User';
      const userEmail = booking.user?.email || 'No Email';
      const userRole = booking.user?.role || 'No Role';
      
      if (!bookingsByUser[userId]) {
        bookingsByUser[userId] = {
          name: userName,
          email: userEmail,
          role: userRole,
          bookings: []
        };
      }
      
      bookingsByUser[userId].bookings.push({
        id: booking._id,
        event: booking.event?.title || 'Unknown Event',
        seats: booking.seats,
        totalPrice: booking.totalPrice,
        status: booking.status,
        createdAt: booking.createdAt
      });
    });

    
    console.log('📋 Bookings by User:\n');
    
    for (const [userId, userData] of Object.entries(bookingsByUser)) {
      console.log(`👤 ${userData.name} (${userData.email}) - ${userData.role}`);
      console.log(`   User ID: ${userId}`);
      console.log(`   Total Bookings: ${userData.bookings.length}`);
      
      userData.bookings.forEach((booking, index) => {
        console.log(`   ${index + 1}. ${booking.event}`);
        console.log(`      - Seats: ${booking.seats}`);
        console.log(`      - Price: $${booking.totalPrice}`);
        console.log(`      - Status: ${booking.status}`);
        console.log(`      - Booking ID: ${booking.id}`);
        console.log(`      - Created: ${booking.createdAt}`);
      });
      console.log('');
    }

    
    console.log('\n🔍 Checking for Duplicate Bookings...\n');
    
    let duplicatesFound = false;
    
    for (const [userId, userData] of Object.entries(bookingsByUser)) {
      const bookingMap = new Map();
      
      userData.bookings.forEach(booking => {
        const key = `${booking.event}-${booking.seats}-${booking.status}`;
        
        if (bookingMap.has(key)) {
          duplicatesFound = true;
          console.log(`⚠️  Potential duplicate found for ${userData.name}:`);
          console.log(`   Event: ${booking.event}`);
          console.log(`   Booking IDs: ${bookingMap.get(key)} and ${booking.id}`);
          console.log('');
        } else {
          bookingMap.set(key, booking.id);
        }
      });
    }

    if (!duplicatesFound) {
      console.log('✅ No duplicate bookings found!\n');
    }

    
    console.log('\n📊 Summary:\n');
    console.log(`Total Users with Bookings: ${Object.keys(bookingsByUser).length}`);
    console.log(`Total Bookings: ${allBookings.length}`);
    
    const adminBookings = Object.values(bookingsByUser)
      .filter(u => u.role === 'admin')
      .reduce((sum, u) => sum + u.bookings.length, 0);
    
    const userBookings = Object.values(bookingsByUser)
      .filter(u => u.role === 'user')
      .reduce((sum, u) => sum + u.bookings.length, 0);
    
    console.log(`Admin Bookings: ${adminBookings}`);
    console.log(`User Bookings: ${userBookings}`);
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkBookings();
