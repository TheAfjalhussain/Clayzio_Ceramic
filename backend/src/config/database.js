/**
 * ============================================
 * 🗄️ DATABASE CONNECTION
 * ============================================
 * MongoDB connection using Mongoose
 */

import mongoose from 'mongoose';

/**
 * Connect to MongoDB database
 * Handles connection events and errors
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Connection event handlers
    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB Error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB Disconnected. Reconnecting...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB Reconnected');
    });

  } catch (error) {
    console.error(`❌ MongoDB Connection Failed: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
