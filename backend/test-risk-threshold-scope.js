const mongoose = require('mongoose');
const User = require('./src/modules/academic-master/models/User');
const request = require('supertest');
const express = require('express');
const env = require('./src/config/env');

const app = express();
app.use(express.json());
const { auditContext } = require('./src/middlewares/auditContext');
app.use((req, res, next) => {
  auditContext.run(new Map(), () => { next(); });
});
app.use('/api/v1', require('./src/routes/index'));

async function testRole(username, roleDesc, expectedStatus) {
  const user = await User.findOne({ username });
  if (!user) return false;
  
  const jwt = require('jsonwebtoken');
  const token = jwt.sign({ id: user._id, role: user.role, scope: user.scope || {} }, env.jwtSecret, { expiresIn: '1h' });

  const res = await request(app).get('/api/v1/results-backlogs/risk-thresholds').set('Authorization', `Bearer ${token}`);
  
  if (res.status === expectedStatus) {
    console.log(`Role: ${roleDesc} (${username}) -> PASS (Status: ${res.status})`);
    return true;
  } else {
    console.log(`[FAIL] ${roleDesc} expected ${expectedStatus} but got ${res.status}`);
    return false;
  }
}

async function runTests() {
  await mongoose.connect(env.mongodbUri || 'mongodb://localhost:27017/academic-management');
  console.log('--- RISK THRESHOLD RESTRICTION TEST ---');
  // HODs, CTPOs, and Students should get 403 Forbidden
  await testRole('hod_kiet_group_year1', 'KIET/KIET+ HOD', 403);
  await testRole('hod_kietw_year1', 'KIET-W HOD', 403);
  await testRole('ctpo_kiet', 'CTPO', 403);
  await testRole('student_1', 'STUDENT', 403);
  
  // Need to test ADMIN or PRINCIPAL too
  const adminUser = await User.findOne({ role: 'ADMIN' });
  if (adminUser) {
    await testRole(adminUser.username, 'ADMIN', 200);
  }
  
  process.exit(0);
}

runTests();
