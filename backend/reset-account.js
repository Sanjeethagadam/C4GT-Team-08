require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/modules/academic-master/models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/academic-management';
const username = 'hod_kiet_cseai';

async function resetAccount() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const result = await User.updateMany(
      {},
      { 
        $set: { 
          failedLoginAttempts: 0, 
          lockoutUntil: null 
        } 
      }
    );

    console.log(`Successfully reset all accounts. Modified ${result.modifiedCount} document(s).`);

  } catch (error) {
    console.error('Error resetting account:', error);
  } finally {
    await mongoose.disconnect();
  }
}

resetAccount();
