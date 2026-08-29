const mongoose = require('mongoose');
const User = require('./src/modules/academic-master/models/User');
const Section = require('./src/modules/academic-master/models/Section');
const Student = require('./src/modules/academic-master/models/Student');
const RemedialStudent = require('./src/modules/academic-support/models/RemedialStudent');
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
    .get('/api/v1/academic-support/remedial-classes')
    .set('Authorization', `Bearer ${token}`);
    
  if (res.status !== 200) {
    console.log(`[FAIL] ${roleDesc} received status ${res.status}`);
    return false;
  }

  const classes = res.body.data || [];
  const classIds = classes.map(c => c._id);
  
  // fetch enrolled students to verify constraints
  const enrollments = await RemedialStudent.find({ remedialClassId: { $in: classIds } });
  
  const checkResult = await checkFn({ classes, classIds, enrollments, user });
  const statusStr = checkResult ? 'PASS' : 'FAIL';
  
  console.log(`Role: ${roleDesc} (${username}) -> ${statusStr}`);
  console.log(`  Total classes: ${classes.length}`);
  return checkResult;
}

async function runTests() {
  await mongoose.connect(env.mongodbUri || 'mongodb://localhost:27017/academic-management');
  console.log('--- REMEDIAL CLASSES SCOPE TEST ---');

  // KIET/KIET+ HOD
  await testRole('hod_kiet_group_year1', 'KIET/KIET+ HOD', async (data) => {
    // Only assigned year (1), KIET + KIET+
    // But since campuses are objectIds, we can fetch their names
    const Campus = require('./src/modules/academic-master/models/Campus');
    const campusIds = [...new Set(data.classes.map(c => c.campusId.toString()))];
    const campuses = await Campus.find({ _id: { $in: campusIds } });
    const campusCodes = campuses.map(c => c.code);
    return campusCodes.every(c => c === 'KIET' || c === 'KIET+') && data.classes.every(c => c.year === 1);
  });

  // KIET-W HOD
  await testRole('hod_kietw_year1', 'KIET-W HOD', async (data) => {
    const Campus = require('./src/modules/academic-master/models/Campus');
    const campusIds = [...new Set(data.classes.map(c => c.campusId.toString()))];
    const campuses = await Campus.find({ _id: { $in: campusIds } });
    const campusCodes = campuses.map(c => c.code);
    // There shouldn't be any classes outside KIET-W year 1
    return campusCodes.every(c => c === 'KIET-W') && data.classes.every(c => c.year === 1);
  });

  // CTPO
  await testRole('ctpo_kiet', 'CTPO', async (data) => {
    // Only records applicable to assigned section
    const sectionId = data.user.scope.sectionId;
    const section = await Section.findById(sectionId);
    
    // Classes should belong to the same branchId and year as the section
    return data.classes.every(c => c.branchId.toString() === section.branchId.toString() && c.year === section.year);
  });

  // STUDENT
  await testRole('student_1', 'STUDENT', async (data) => {
    // Only permitted self-service data (classes the student is enrolled in, or none?)
    // Let's assume the student only sees classes where they are in RemedialStudent
    const student = await Student.findOne({ userId: data.user._id });
    const enrolled = await RemedialStudent.find({ studentId: student._id });
    const enrolledClassIds = enrolled.map(e => e.remedialClassId.toString());
    
    return data.classes.every(c => enrolledClassIds.includes(c._id.toString()));
  });

  process.exit(0);
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
