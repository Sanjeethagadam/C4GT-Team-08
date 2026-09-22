
const mongoose = require('./backend/node_modules/mongoose');
const bcrypt = require('./backend/node_modules/bcryptjs');
async function run() {
  await mongoose.connect('mongodb://localhost:27017/academic_engagement_db');
  const User = require('./backend/src/modules/academic-master/models/User');
  const hash = await bcrypt.hash('password123', 10);
  await User.updateOne({ username: 'admin' }, { $set: { passwordHash: hash } });
  console.log('Password reset to password123');
  process.exit(0);
}
run();

