require('dotenv').config();
const mongoose = require('mongoose');

async function getUsers() {
  await mongoose.connect(process.env.MONGODB_URI);
  const User = mongoose.model('User', new mongoose.Schema({
    username: String,
    role: String
  }), 'users');

  const users = await User.find({}).lean();
  console.log(users.map(u => `${u.role}: ${u.username}`).join('\n'));
  process.exit(0);
}

getUsers();
