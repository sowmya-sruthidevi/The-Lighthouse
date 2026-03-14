import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Notice from './models/Notice.js';

dotenv.config();

const updateNotices = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        const result = await Notice.updateMany(
            { status: { $exists: false } },
            { $set: { status: 'approved' } }
        );
        console.log(`${result.modifiedCount} notices updated to approved.`);

        const result2 = await Notice.updateMany(
            { status: 'pending' },
            { $set: { status: 'approved' } }
        );
        console.log(`${result2.modifiedCount} pending notices updated to approved.`);

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

updateNotices();
