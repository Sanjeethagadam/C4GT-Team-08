const mongoose = require('mongoose');
const User = require('./src/modules/academic-master/models/User');
const Student = require('./src/modules/academic-master/models/Student');
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
    console.log(`[FAIL] User ${username} not found for ${roleDesc}.`);
    return false;
  }
  const { token } = (function(){
     const jwt = require('jsonwebtoken');
     return { token: jwt.sign({ id: user._id, role: user.role, scope: user.scope || {} }, env.jwtSecret, { expiresIn: '1h' }) };
  })();

  const res = await request(app)
    .get('/api/v1/results-backlogs/risk') // <-- Actually check if this endpoint exists and maps to riskProfile
    .set('Authorization', `Bearer ${token}`);
    
  if (res.status !== 200) {
    console.log(`[FAIL] ${roleDesc} received status ${res.status}`);
    // Wait, let's just log and return so we can see why it failed if it does.
    console.log(res.body);
    return false;
  }

  const risks = res.body.data || [];
  const distinctStudentIds = [...new Set(risks.map(r => r.studentId.toString()))];
  
  const students = await Student.find({ _id: { $in: distinctStudentIds } }).populate('campusId');
  const campuses = [...new Set(students.map(s => s.campusId ? s.campusId.code : 'UNKNOWN'))];
  const years = [...new Set(students.map(s => s.year))];
  
  // Also, extract risk-level distribution
  const riskLevels = {};
  for (const risk of risks) {
    const level = risk.riskLevel || 'UNKNOWN';
    riskLevels[level] = (riskLevels[level] || 0) + 1;
  }
  
  const checkResult = checkFn({ risks, distinctStudentIds, campuses, years, user, students, riskLevels });
  const statusStr = checkResult ? 'PASS' : 'FAIL';
  
  console.log(`Role: ${roleDesc} (${username}) -> ${statusStr}`);
  console.log(`  Total risk records: ${risks.length}`);
  console.log(`  Distinct students: ${distinctStudentIds.length}`);
  console.log(`  Campuses: ${campuses.join(', ')}`);
  console.log(`  Years: ${years.join(', ')}`);
  console.log(`  Risk-level distribution: ${JSON.stringify(riskLevels)}`);
  return checkResult;
}

async function runTests() {
  await mongoose.connect(env.mongodbUri || 'mongodb://localhost:27017/academic-management');
  console.log('--- RISK SCOPE TEST ---');

  await testRole('hod_kiet_group_year1', 'KIET/KIET+ HOD', (data) => {
    return data.campuses.every(c => c === 'KIET' || c === 'KIET+') && (data.years.length === 0 || (data.years.length === 1 && data.years[0] === 1));
  });

  await testRole('hod_kietw_year1', 'KIET-W HOD', (data) => {
    return data.campuses.every(c => c === 'KIET-W') && (data.years.length === 0 || (data.years.length === 1 && data.years[0] === 1));
  });

  await testRole('ctpo_kiet', 'CTPO', (data) => {
    const sectionIds = [...new Set(data.students.map(s => s.sectionId.toString()))];
    return sectionIds.length <= 1 && (sectionIds.length === 0 || sectionIds[0] === data.user.scope.sectionId.toString());
  });

  await testRole('student_1', 'STUDENT', (data) => {
    return data.distinctStudentIds.length <= 1 && (data.students.length === 0 || data.students[0].userId.toString() === data.user._id.toString());
  });

  process.exit(0);
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
