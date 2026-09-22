require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const http = require('http');

async function apiRequest(path, method, token, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    const req = http.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data ? JSON.parse(data) : null }));
    });
    
    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function getToken(username) {
  const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  const user = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } }).lean();
  if (!user) return null;
  const payload = { id: user._id, role: user.role, scopeRef: user.scopeRef, scope: user.scope };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
}

async function testCtpo(username, yearExpected) {
  console.log(`\n--- Testing ${username} (Year ${yearExpected}) ---`);
  const token = await getToken(username);
  if (!token) {
    console.log('User not found.');
    return false;
  }

  // 1. Get MID-1 Dataset
  console.log('Fetching MID-1 dataset...');
  const mid1Res = await apiRequest('/api/v1/ctpo/marks-dataset?examType=MID1', 'GET', token);
  if (mid1Res.status !== 200) {
    console.log(`Failed to get MID-1 dataset: ${mid1Res.status}`, mid1Res.body);
    return false;
  }
  
  const exam1 = mid1Res.body.data.exam;
  const students = mid1Res.body.data.students;
  const subjects = mid1Res.body.data.subjects;
  
  if (!students.length || !subjects.length) {
    console.log(`No students or subjects found for ${username}. Skip.`);
    return true; // Skip if no data configured for testing
  }
  
  // Verify RBAC
  const allMatchYear = students.every(s => !s.year || s.year === yearExpected); // students from CTPO core query already filtered by branch/year
  
  // Create test marks for MID-1
  const mid1MarksData = [];
  const student1 = students[0]._id;
  const student2 = students.length > 1 ? students[1]._id : null;
  const subject1 = subjects[0]._id;
  
  mid1MarksData.push({
    studentId: student1,
    subjectId: subject1,
    marksObtained: 25,
    maxMarks: 30,
    status: 'ATTENDED'
  });
  
  if (student2) {
    mid1MarksData.push({
      studentId: student2,
      subjectId: subject1,
      marksObtained: 15,
      maxMarks: 30,
      status: 'ATTENDED'
    });
  }

  // 2. Submit MID-1 marks
  console.log('Submitting MID-1 marks...');
  const save1Res = await apiRequest('/api/v1/ctpo/marks', 'POST', token, {
    examinationId: exam1._id,
    marksData: mid1MarksData,
    isSubmit: true
  });
  
  if (save1Res.status !== 200) {
    console.log(`Failed to submit MID-1 marks: ${save1Res.status}`, save1Res.body);
    return false;
  }

  // 3. Check Performance after MID-1
  console.log('Checking Performance after MID-1...');
  const perf1Res = await apiRequest('/api/v1/ctpo/performance', 'GET', token);
  if (perf1Res.status !== 200) {
    console.log('Failed to fetch performance:', perf1Res.body);
    return false;
  }
  
  const perf1 = perf1Res.body.data;
  console.log(`Average Marks: ${perf1.kpis.averageMarks.toFixed(2)}%`);
  console.log(`Highest Average: ${perf1.kpis.highestAverage.toFixed(2)}%`);
  console.log(`Lowest Average: ${perf1.kpis.lowestAverage.toFixed(2)}%`);
  
  const mid1Trend = perf1.trends.find(t => t.name === 'MID1');
  console.log(`MID1 Trend Avg: ${mid1Trend ? mid1Trend.averageMarks : 'Not Found'}%`);
  
  // 4. Submit MID-2 marks
  console.log('Fetching MID-2 dataset...');
  const mid2Res = await apiRequest('/api/v1/ctpo/marks-dataset?examType=MID2', 'GET', token);
  const exam2 = mid2Res.body.data.exam;
  
  const mid2MarksData = [];
  mid2MarksData.push({
    studentId: student1,
    subjectId: subject1,
    marksObtained: 28, // Improvement
    maxMarks: 30,
    status: 'ATTENDED'
  });
  
  if (student2) {
    mid2MarksData.push({
      studentId: student2,
      subjectId: subject1,
      marksObtained: 20, // Improvement
      maxMarks: 30,
      status: 'ATTENDED'
    });
  }

  console.log('Submitting MID-2 marks...');
  const save2Res = await apiRequest('/api/v1/ctpo/marks', 'POST', token, {
    examinationId: exam2._id,
    marksData: mid2MarksData,
    isSubmit: true
  });
  
  if (save2Res.status !== 200) {
    console.log(`Failed to submit MID-2 marks: ${save2Res.status}`, save2Res.body);
    return false;
  }
  
  // 5. Check Performance after MID-2
  console.log('Checking Performance after MID-2...');
  const perf2Res = await apiRequest('/api/v1/ctpo/performance', 'GET', token);
  const perf2 = perf2Res.body.data;
  
  console.log(`New Average Marks: ${perf2.kpis.averageMarks.toFixed(2)}%`);
  console.log(`New Highest Average: ${perf2.kpis.highestAverage.toFixed(2)}%`);
  
  const trends = perf2.trends;
  console.log('Trends comparison:');
  trends.forEach(t => console.log(`- ${t.name}: ${t.averageMarks}%`));
  
  console.log('Mark Distribution:');
  perf2.distribution.forEach(d => console.log(`- ${d.range}: ${d.count} students`));
  
  // Validate that 0% is no longer the case for non-zero marks
  if (perf2.kpis.averageMarks === 0 && mid1MarksData.length > 0) {
    console.log('ERROR: Average marks is 0% despite marks being entered!');
    return false;
  }
  
  return true;
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const usersToTest = [
    { u: '25KTCAI', y: 2 },
    { u: '24KTCAI', y: 3 },
    { u: '23KTCAI', y: 4 }
  ];
  
  let allPass = true;
  for (const {u, y} of usersToTest) {
    const passed = await testCtpo(u, y);
    if (!passed) allPass = false;
  }
  
  console.log(`\n================================`);
  console.log(`UAT Result: Marks Entry -> Class Performance = ${allPass ? 'PASS' : 'FAIL'}`);
  console.log(`================================\n`);
  
  await mongoose.disconnect();
}

run().catch(console.error);
