import mongoose from 'mongoose';

let cachedDb: typeof mongoose | null = null;

export const connectToDatabase = async () => {
  if (cachedDb) return cachedDb;
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/resume-builder';
  try {
    const db = await mongoose.connect(uri);
    cachedDb = db;
    console.log('✅ MongoDB connected');
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
};
