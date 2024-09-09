import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Logging from '../utils/Logging';

dotenv.config();

const connectDB = async (startServer: () => void): Promise<void> => {
  try {
    Logging.info('Attempting to connect to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI as string);
    Logging.info('MongoDB Connected Successfully');
    startServer();
  } catch (err) {
    Logging.error('Failed to connect to MongoDB');
    Logging.error(err);
    process.exit(1);
  }
};

export default connectDB;