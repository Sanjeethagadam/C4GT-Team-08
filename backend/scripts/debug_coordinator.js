require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const http = require('http');

async function apiRequest(path, method, token, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    if (body) {
      options.headers['Content-Type'] = 'application/json';
    }
    const req = http.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data ? JSON.parse(data) : null }));
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  
  const user = await User.findOne({ role: 'COORDINATOR' }).lean();
  const token = jwt.sign(
    { id: user._id, role: user.role, scopeRef: user.scopeRef, scope: user.scope },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
  
  const validRemedial = {
    date: new Date().toISOString(),
    startTime: '09:00',
    endTime: '11:00',
    venue: 'Room 101',
    topic: 'Valid Topic',
    facultyName: 'Valid Faculty',
    eligibleStudentIds: [new mongoose.Types.ObjectId().toString()]
  };

  const resValid = await apiRequest('/api/v1/academic-support/remedial-classes', 'POST', token, validRemedial);
  console.log("Remedial creation response status:", resValid.status);
  console.log("Remedial creation response body:", JSON.stringify(resValid.body, null, 2));

  await mongoose.disconnect();
}
run().catch(console.error);
