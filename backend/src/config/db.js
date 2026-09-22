const mongoose = require('mongoose');

let isConnecting = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    console.warn('⚠️ No MONGODB_URI or MONGO_URI found in environment variables.');
    return null;
  }
  if (mongoose.connection.readyState === 1 || isConnecting) return;
  isConnecting = true;
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    isConnecting = false;
    return conn;
  } catch (error) {
    isConnecting = false;
    console.error(`⚠️ MongoDB Connection Error: ${error.message}`);
    if (error.message.includes('SSL') || error.message.includes('whitelist') || error.message.includes('Could not connect to any servers')) {
      console.error('💡 Atlas Tip: Add 0.0.0.0/0 (or your current IP) in MongoDB Atlas -> Security -> Network Access -> IP Access List.');
    }
    // Automatically retry connecting every 6 seconds
    setTimeout(connectDB, 6000);
  }
};

module.exports = connectDB;
