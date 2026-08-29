require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/modules/academic-master/models/User');
const Student = require('./src/modules/academic-master/models/Student');
const Campus = require('./src/modules/academic-master/models/Campus');
const Branch = require('./src/modules/academic-master/models/Branch');
const { getStudentQueryScope, isStudentInScope } = require('./src/utils/scopeFilter');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/academic-management';

async function test() {
  await mongoose.connect(MONGODB_URI);
  
  const hod1 = await User.findOne({ username: 'hod_kiet_group_year1' }).populate('scope.campusIds');
  console.log('--- hod_kiet_group_year1 ---');
  console.log('Campuses:', hod1.scope.campusIds.map(c => c.code).join(', '));
  console.log('Year:', hod1.scope.year);
  
  const query = getStudentQueryScope(hod1);
  const students = await Student.find(query).populate('campusId').populate('branchId');
  console.log('Students visible:', students.length);
  const campusCounts = {};
  const branchCounts = {};
  students.forEach(s => {
    campusCounts[s.campusId.code] = (campusCounts[s.campusId.code] || 0) + 1;
    branchCounts[s.branchId.code] = (branchCounts[s.branchId.code] || 0) + 1;
  });
  console.log('Visible by Campus:', campusCounts);
  console.log('Visible by Branch:', branchCounts);
  
  console.log('\n--- hod_kietw_year1 ---');
  const hodW1 = await User.findOne({ username: 'hod_kietw_year1' }).populate('scope.campusIds');
  console.log('Campuses:', hodW1.scope.campusIds.map(c => c.code).join(', '));
  console.log('Year:', hodW1.scope.year);
  const queryW = getStudentQueryScope(hodW1);
  const studentsW = await Student.find(queryW).populate('campusId').populate('branchId');
  console.log('Students visible:', studentsW.length);
  const campusCountsW = {};
  studentsW.forEach(s => {
    campusCountsW[s.campusId.code] = (campusCountsW[s.campusId.code] || 0) + 1;
  });
  console.log('Visible by Campus:', campusCountsW);
  
  await mongoose.disconnect();
}

test().catch(console.error);
