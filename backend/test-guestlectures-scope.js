const mongoose = require('mongoose');
const User = require('./src/modules/academic-master/models/User');
const Student = require('./src/modules/academic-master/models/Student');
const Section = require('./src/modules/academic-master/models/Section');
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

async function testRole(username, roleDesc, checkFn) {
  const user = await User.findOne({ username });
  if (!user) {
    console.log(`[FAIL] User ${username} not found.`);
    return false;
  }
  const { token } = (function(){
     const jwt = require('jsonwebtoken');
     return { token: jwt.sign({ id: user._id, role: user.role, scope: user.scope || {} }, env.jwtSecret, { expiresIn: '1h' }) };
  })();

  const res = await request(app)
    .get('/api/v1/academic-support/guestlectures')
    .set('Authorization', `Bearer ${token}`);
    
  if (res.status !== 200) {
    console.log(`[FAIL] ${roleDesc} received status ${res.status}`);
    return false;
  }

  const lectures = res.body.data || [];
  
  const checkResult = await checkFn({ lectures, user });
  const statusStr = checkResult ? 'PASS' : 'FAIL';
  
  const Campus = require('./src/modules/academic-master/models/Campus');
  const campusIds = [...new Set(lectures.map(l => l.campusId.toString()))];
  const campusesObj = await Campus.find({ _id: { $in: campusIds } });
  const campuses = campusesObj.map(c => c.code);
  const years = [...new Set(lectures.map(l => l.year))];
  
  console.log(`Role: ${roleDesc} (${username}) -> ${statusStr}`);
  console.log(`  Total records: ${lectures.length}`);
  console.log(`  Distinct students: N/A (Guest Lectures are class-wide)`);
  console.log(`  Campuses: ${campuses.join(', ')}`);
  console.log(`  Years: ${years.join(', ')}`);
  return checkResult;
}

async function runTests() {
  await mongoose.connect(env.mongodbUri || 'mongodb://localhost:27017/academic-management');
  console.log('--- GUEST LECTURES SCOPE TEST ---');

  await testRole('hod_kiet_group_year1', 'KIET/KIET+ HOD', async (data) => {
    const Campus = require('./src/modules/academic-master/models/Campus');
    const campusIds = [...new Set(data.lectures.map(c => c.campusId.toString()))];
    const campuses = await Campus.find({ _id: { $in: campusIds } });
    const campusCodes = campuses.map(c => c.code);
    return campusCodes.every(c => c === 'KIET' || c === 'KIET+') && data.lectures.every(c => c.year === 1);
  });

  await testRole('hod_kietw_year1', 'KIET-W HOD', async (data) => {
    const Campus = require('./src/modules/academic-master/models/Campus');
    const campusIds = [...new Set(data.lectures.map(c => c.campusId.toString()))];
    const campuses = await Campus.find({ _id: { $in: campusIds } });
    const campusCodes = campuses.map(c => c.code);
    return campusCodes.every(c => c === 'KIET-W') && data.lectures.every(c => c.year === 1);
  });

  await testRole('ctpo_kiet', 'CTPO', async (data) => {
    const section = await Section.findById(data.user.scope.sectionId);
    return data.lectures.every(c => c.branchId.toString() === section.branchId.toString() && c.year === section.year);
  });

  await testRole('student_1', 'STUDENT', async (data) => {
    const student = await Student.findOne({ userId: data.user._id });
    return data.lectures.every(c => c.campusId.toString() === student.campusId.toString() && c.branchId.toString() === student.branchId.toString() && c.year === student.year);
  });

  process.exit(0);
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
