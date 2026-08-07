require('dotenv').config();
const mongoose = require('mongoose');


mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/event-booking')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });


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

const User = mongoose.model('User', userSchema);
const Event = mongoose.model('Event', eventSchema);


const today = new Date();
const futureDate = (daysFromNow) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date;
};

const sampleEvents = [
  {
    title: 'Summer Music Festival 2025',
    description: 'Join us for an amazing outdoor music festival featuring top artists from around the world. Experience live performances, food trucks, and great vibes!',
    date: futureDate(45), 
    time: '18:00',
    location: 'Central Park, New York',
    category: 'music',
    price: 75,
    capacity: 500,
    availableSeats: 500,
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=300&fit=crop'
  },
  {
    title: 'Tech Conference 2025',
    description: 'Annual technology conference featuring keynote speakers, workshops, and networking opportunities. Learn about the latest trends in AI, Web3, and Cloud Computing.',
    date: futureDate(30), 
    time: '09:00',
    location: 'Convention Center, San Francisco',
    category: 'tech',
    price: 150,
    capacity: 300,
    availableSeats: 300,
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop'
  },
  {
    title: 'Food & Wine Expo',
    description: 'Taste exquisite dishes from renowned chefs and sample fine wines from around the world. A culinary experience you won\'t forget!',
    date: futureDate(60), 
    time: '12:00',
    location: 'Grand Hotel, Chicago',
    category: 'other',
    price: 50,
    capacity: 200,
    availableSeats: 200,
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop'
  },
  {
    title: 'Marathon Championship',
    description: 'Annual city marathon with professional and amateur categories. Run through scenic routes and compete for prizes!',
    date: futureDate(90), 
    time: '06:00',
    location: 'City Stadium, Boston',
    category: 'sports',
    price: 30,
    capacity: 1000,
    availableSeats: 1000,
    image: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=400&h=300&fit=crop'
  },
  {
    title: 'Business Leadership Summit',
    description: 'Connect with industry leaders and learn strategies for business growth. Featuring panel discussions, workshops, and networking sessions.',
    date: futureDate(50), 
    time: '08:30',
    location: 'Business Center, Seattle',
    category: 'business',
    price: 200,
    capacity: 150,
    availableSeats: 150,
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=300&fit=crop'
  },
  {
    title: 'Jazz Night Live',
    description: 'An intimate evening of smooth jazz featuring local and international artists. Enjoy cocktails and great music in a cozy atmosphere.',
    date: futureDate(20), 
    time: '20:00',
    location: 'Blue Note Club, New Orleans',
    category: 'music',
    price: 45,
    capacity: 100,
    availableSeats: 100,
    image: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400&h=300&fit=crop'
  },
  {
    title: 'Startup Pitch Competition',
    description: 'Watch innovative startups pitch their ideas to top investors. Network with entrepreneurs and learn about the latest business trends.',
    date: futureDate(15), 
    time: '14:00',
    location: 'Innovation Hub, Austin',
    category: 'business',
    price: 25,
    capacity: 250,
    availableSeats: 250,
    image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=300&fit=crop'
  },
  {
    title: 'Rock Concert Extravaganza',
    description: 'Epic rock concert featuring legendary bands and rising stars. Get ready for an unforgettable night of music!',
    date: futureDate(7), 
    time: '19:30',
    location: 'Madison Square Garden, New York',
    category: 'music',
    price: 95,
    capacity: 800,
    availableSeats: 800,
    image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&h=300&fit=crop'
  }
];

async function seedDatabase() {
  try {
    
    let adminUser = await User.findOne({ email: 'admin@eventbooking.com' });
    
    if (!adminUser) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@eventbooking.com',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('✅ Admin user created');
      console.log('   Email: admin@eventbooking.com');
      console.log('   Password: admin123');
    } else {
      console.log('✅ Admin user already exists');
    }

    
    await Event.deleteMany({});
    console.log('✅ Cleared existing events');

    
    const eventsWithOrganizer = sampleEvents.map(event => ({
      ...event,
      organizer: adminUser._id
    }));

    await Event.insertMany(eventsWithOrganizer);
    console.log(`✅ Added ${sampleEvents.length} sample events`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📝 You can now:');
    console.log('   1. Login with: admin@eventbooking.com / admin123');
    console.log('   2. Browse events at: http://localhost:3000');
    console.log('   3. Create more events as admin');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
