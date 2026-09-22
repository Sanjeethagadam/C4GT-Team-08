
const mongoose = require('./backend/node_modules/mongoose');
const dotenv = require('./backend/node_modules/dotenv');
dotenv.config({ path: './backend/.env' });
const jwt = require('./backend/node_modules/jsonwebtoken');

async function test() {
  await mongoose.connect('mongodb://localhost:27017/academic_engagement_db');
  const User = require('./backend/src/modules/academic-master/models/User');
  const admin = await User.findOne({ role: 'ADMIN' });
  const adminToken = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

  const res = await fetch('http://localhost:5000/api/v1/analytics/admin-dashboard', {
        headers: { 'Authorization': 'Bearer ' + adminToken }
  });
  console.log('Status:', res.status);
  const data = await res.json();
  console.log('Body:', JSON.stringify(data, null, 2));
  process.exit(0);
}
test();

