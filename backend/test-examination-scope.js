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

async function testRole(username, roleDesc) {
  const user = await User.findOne({ username });
  if (!user) return false;
  
  const jwt = require('jsonwebtoken');
  const token = jwt.sign({ id: user._id, role: user.role, scope: user.scope || {} }, env.jwtSecret, { expiresIn: '1h' });

  const res = await request(app).get('/api/v1/examination/examinations').set('Authorization', `Bearer ${token}`);
  if (res.status !== 200) {
    console.log(`[FAIL] ${roleDesc} received status ${res.status}`);
    return false;
  }
  
  const data = res.body.data || [];
  console.log(`Role: ${roleDesc} (${username}) -> PASS (Records: ${data.length})`);
  return true;
}

async function runTests() {
  await mongoose.connect(env.mongodbUri || 'mongodb://localhost:27017/academic-management');
  console.log('--- EXAMINATION SCOPE TEST ---');
  await testRole('hod_kiet_group_year1', 'KIET/KIET+ HOD');
  await testRole('hod_kietw_year1', 'KIET-W HOD');
  await testRole('ctpo_kiet', 'CTPO');
  await testRole('student_1', 'STUDENT');
  process.exit(0);
}

runTests();
