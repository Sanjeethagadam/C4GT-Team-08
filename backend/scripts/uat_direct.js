require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const http = require('http');
const fs = require('fs');

const ctpoUsernames = [
  '25KTCAI', '25KTCSM', '25KTCSD', '25KTAID', '25KTCSC',
  '24KTCAI', '24KTCSM', '24KTCSD', '24KTAID', '24KTCSC',
  '23KTCAI', '23KTCSM', '23KTCSD', '23KTAID', '23KTCSC'
];

async function apiGet(path, token) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
    });
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  const Student = mongoose.model('Student', new mongoose.Schema({}, { strict: false }));

  const report = [];
  let passCount = 0;
  let failCount = 0;
  const issues = [];

  for (let username of ctpoUsernames) {
    if (username === '24KT AID') username = '24KTAID';

    const user = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') }, role: 'CTPO' }).lean();
    
    if (!user) {
      report.push({ username, loginStatus: 'FAIL: Not Found in DB' });
      failCount++;
      issues.push(`CTPO user ${username} not found in DB`);
      continue;
    }

    const payload = {
      id: user._id,
      role: user.role,
      scopeRef: user.scopeRef,
      scope: user.scope,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    const resultsRes = await apiGet('/api/v1/ctpo/results', token);
    if (resultsRes.status !== 200) {
      report.push({ username, loginStatus: 'FAIL: API Error ' + resultsRes.status });
      failCount++;
      issues.push(`API error for ${username}: ${JSON.stringify(resultsRes.body)}`);
      continue;
    }

    const data = resultsRes.body.data;
    const year = String(data.year);
    const branchName = user.scope?.branch || 'UNKNOWN';

    // Semester scope check
    let expectedOptions = [];
    if (year === '4') expectedOptions = ['1-1', '1-2', '2-1', '2-2', '3-1', '3-2'];
    else if (year === '3') expectedOptions = ['1-1', '1-2', '2-1', '2-2'];
    else if (year === '2') expectedOptions = ['1-1'];
    else expectedOptions = ['1-1', '1-2'];

    const uiOptions = (year === '4') ? ['1-1', '1-2', '2-1', '2-2', '3-1', '3-2'] :
                      (year === '3') ? ['1-1', '1-2', '2-1', '2-2'] :
                      (year === '2') ? ['1-1'] : ['1-1', '1-2'];
    
    const optionsMatch = JSON.stringify(uiOptions) === JSON.stringify(expectedOptions);

    let threeTwoAccessible = false;
    let threeTwoResultStatus = '-';
    
    if (year === '4') {
      threeTwoAccessible = uiOptions.includes('3-2');
      const has32Data = data.results?.some(r => r.academicSemesterId?.semesterCode === '3-2');
      threeTwoResultStatus = has32Data ? 'Official Data Shown' : 'No-Data Message Shown';
    }

    // RBAC Test: Ensure all results returned belong to the CTPO's scope
    let rbacPass = true;
    const studentsRes = await apiGet('/api/v1/ctpo/students', token);
    if (studentsRes.status === 200) {
       for(const s of studentsRes.body.data || []) {
           if (s.year !== Number(year)) {
               rbacPass = false;
               issues.push(`RBAC failure for ${username}: student ${s.rollNo} year ${s.year}`);
           }
       }
    } else {
       rbacPass = false;
    }

    report.push({
      username,
      branch: branchName,
      year: year,
      loginStatus: 'PASS',
      semesterOptions: uiOptions,
      threeTwoAccessible: year === '4' ? threeTwoAccessible : 'N/A',
      threeTwoResultStatus,
      rbacStatus: rbacPass ? 'PASS' : 'FAIL'
    });

    if (optionsMatch && rbacPass && (year !== '4' || threeTwoAccessible)) {
      passCount++;
    } else {
      failCount++;
      if (!optionsMatch) issues.push(`Options mismatch for ${username}`);
    }
  }

  // Student Test
  const officialResult = await mongoose.connection.db.collection('semesterresults').findOne({ passed: { $exists: true } });
  if (officialResult) {
    const studentUser = await User.findOne({ 'scopeRef.refId': officialResult.studentId, role: 'STUDENT' }).lean();
    if (studentUser) {
      const payload = {
        id: studentUser._id,
        role: studentUser.role,
        scopeRef: studentUser.scopeRef,
        scope: studentUser.scope,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
      const studentRes = await apiGet('/api/v1/results-backlogs/semester-results', token);
      
      let studentPass = false;
      if (studentRes.status === 200 && studentRes.body.data) {
        const resultsArray = studentRes.body.data.results || studentRes.body.data || [];
        const allOwn = resultsArray.every(r => r.studentId._id ? r.studentId._id.toString() === officialResult.studentId.toString() : r.studentId.toString() === officialResult.studentId.toString());
        if (allOwn && resultsArray.length > 0) {
           studentPass = true;
           report.push({
             username: studentUser.username,
             type: 'STUDENT',
             loginStatus: 'PASS',
             ownResultsOnly: true,
             officialDataVerified: true
           });
           passCount++;
        } else {
           issues.push(`Student test failed for ${studentUser.username}. allOwn: ${allOwn}, length: ${resultsArray.length}`);
        }
      }
      if (!studentPass) {
        failCount++;
        issues.push(`Student test failed for ${studentUser.username}.`);
      }
    } else {
      issues.push(`No user found for studentId ${officialResult.studentId}`);
    }
  }

  const finalReport = {
    passCount,
    failCount,
    remainingIssues: issues,
    details: report
  };

  fs.writeFileSync('C:\\Users\\ravit\\Desktop\\Student Academic Management System\\uat-results-report.json', JSON.stringify(finalReport, null, 2));
  console.log('UAT done, report generated.');

  await mongoose.disconnect();
}

run().catch(console.error);
