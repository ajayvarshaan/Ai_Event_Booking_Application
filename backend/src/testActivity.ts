import 'dotenv/config';
import { connectDB } from './config/db';
import Activity from './models/Activity';
import User from './models/User';

const testActivityLogging = async () => {
  try {
    await connectDB();
    console.log('Connected to database');

    
    const user = await User.findOne();
    if (!user) {
      console.log('No users found. Please create a user first.');
      process.exit(1);
    }

    console.log('Found user:', user.name, user.email);

    
    const activity = await Activity.create({
      user: user._id,
      userName: user.name,
      userEmail: user.email,
      action: 'user_login',
      description: `Test activity for ${user.name}`
    });

    console.log('Activity created successfully:', activity._id);

    
    const activities = await Activity.find().sort({ createdAt: -1 }).limit(10);
    console.log(`Total activities in database: ${activities.length}`);
    activities.forEach(act => {
      console.log(`- ${act.action}: ${act.description} (${act.createdAt})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
};

testActivityLogging();
