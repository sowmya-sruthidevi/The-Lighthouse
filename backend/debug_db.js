import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Notice from './models/Notice.js';
import User from './models/User.js';

dotenv.config();

const checkDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const notices = await Notice.find({});
    console.log(`Found ${notices.length} notices`);

    for (const notice of notices) {
      console.log(`Notice: ${notice.title}`);
      console.log(`- ID: ${notice._id}`);
      console.log(`- Author ID: ${notice.author}`);
      
      const user = await User.findById(notice.author);
      if (user) {
        console.log(`- Author Name: ${user.name}`);
        console.log(`- Author Role: ${user.role}`);
      } else {
        console.log(`- Author NOT FOUND in Users collection!`);
      }
    }

    mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
};

checkDB();
