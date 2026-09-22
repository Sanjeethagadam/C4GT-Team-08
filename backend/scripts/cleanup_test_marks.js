require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const http = require('http');

async function apiRequest(path, method, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: { 'Authorization': `Bearer ${token}` }
    };
    const req = http.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data ? JSON.parse(data) : null }));
    });
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  const Marks = require('../src/modules/examination/models/Marks');

  const targetIds = [
    '6aa7ee7b8628855b86a4fb26', '6aa7ee7b8628855b86a4fb27',
    '6aa7ee808628855b86a4fb28', '6aa7ee808628855b86a4fb29',
    '6aa7ee8d8628855b86a4fb2a', '6aa7ee8d8628855b86a4fb2b',
    '6aa7ee928628855b86a4fb2e', '6aa7ee928628855b86a4fb2f',
    '6aa7ee9b8628855b86a4fb30', '6aa7ee9b8628855b86a4fb31',
    '6aa7ee9e8628855b86a4fb32', '6aa7ee9e8628855b86a4fb33'
  ];

  const totalBefore = await Marks.countDocuments();
  console.log(`Total marks before deletion: ${totalBefore}`);

  const deleteResult = await Marks.deleteMany({ _id: { $in: targetIds } });
  console.log(`Deleted count: ${deleteResult.deletedCount}`);

  const totalAfter = await Marks.countDocuments();
  console.log(`Total marks after deletion: ${totalAfter}`);
  console.log(`Legitimate marks preserved: ${totalBefore - deleteResult.deletedCount}`);
  
  const remainingTestRecords = await Marks.countDocuments({ _id: { $in: targetIds } });
  console.log(`UAT test records remaining: ${remainingTestRecords}`);

  // API Check
  const usersToTest = ['25KTCAI', '24KTCAI', '23KTCAI'];
  for (const username of usersToTest) {
    const user = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } }).lean();
    if (user) {
      const payload = { id: user._id, role: user.role, scopeRef: user.scopeRef, scope: user.scope };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

      const perfRes = await apiRequest('/api/v1/ctpo/performance', 'GET', token);
      if (perfRes.status === 200 && perfRes.body && perfRes.body.data) {
        const kpis = perfRes.body.data.kpis;
        console.log(`Performance for ${username}: Average=${kpis.averageMarks}%, Highest=${kpis.highestAverage}%, Lowest=${kpis.lowestAverage}%`);
      } else {
        console.log(`Failed to fetch performance for ${username}`);
      }
    }
  }

  await mongoose.disconnect();
}

run().catch(console.error);
