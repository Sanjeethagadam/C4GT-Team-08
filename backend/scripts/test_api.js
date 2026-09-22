require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const http = require('http');

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
  
  const user = await User.findOne({ username: '23KTCAI' }).lean();
  const payload = { id: user._id, role: user.role, scopeRef: user.scopeRef, scope: user.scope };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

  const resultsRes = await apiGet('/api/v1/ctpo/results', token);
  
  let validGradePoints = 0;
  let hasMissingGradePoints = false;
  let codeAbsent = true;

  if (resultsRes.status === 200 && resultsRes.body.data) {
    const data = resultsRes.body.data.results || resultsRes.body.data;
    const r32 = data.filter(r => r.academicSemesterId?.semesterCode === '3-2');
    
    r32.forEach(r => {
      if (r.gradePoint === null && r.grade !== 'CM' && r.grade !== 'COMPLETED') {
        hasMissingGradePoints = true;
      } else if (r.gradePoint !== null && r.gradePoint !== undefined) {
        validGradePoints++;
      }
      
      // Simulating frontend response - checking if the object contains what the UI expects
      if (r.isOfficial !== true) hasMissingGradePoints = true;
    });
    console.log(`Verified 23KTCAI: 3-2 results found=${r32.length}, valid grade points=${validGradePoints}`);
    console.log(`Grade point mapping working correctly: ${!hasMissingGradePoints}`);
  }
  
  await mongoose.disconnect();
}
run().catch(console.error);
