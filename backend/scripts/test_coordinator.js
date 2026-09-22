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

  const tokens = {};
  
  // Find users for roles: COORDINATOR, ADMIN, HOD, PRINCIPAL
  const roles = ['COORDINATOR', 'ADMIN', 'HOD', 'PRINCIPAL'];
  for (const role of roles) {
    const user = await User.findOne({ role }).lean();
    if (user) {
      tokens[role] = jwt.sign(
        { id: user._id, role: user.role, scopeRef: user.scopeRef, scope: user.scope },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );
    } else {
      console.log(`No user found for role ${role}`);
    }
  }

  const results = {
    analytics: [],
    validation: [],
    regression: []
  };

  const cToken = tokens['COORDINATOR'];

  // Test Analytics RBAC for Coordinator
  const analyticsTests = [
    { endpoint: '/api/v1/analytics/academic', role: 'COORDINATOR', expectedStatus: 403 },
    { endpoint: '/api/v1/analytics/results', role: 'COORDINATOR', expectedStatus: 403 },
    { endpoint: '/api/v1/analytics/backlogs', role: 'COORDINATOR', expectedStatus: 403 },
    { endpoint: '/api/v1/analytics/risk', role: 'COORDINATOR', expectedStatus: 403 },
    { endpoint: '/api/v1/analytics/campus', role: 'COORDINATOR', expectedStatus: 200 },
    { endpoint: '/api/v1/analytics/remedial', role: 'COORDINATOR', expectedStatus: 200 },
    { endpoint: '/api/v1/analytics/guest-lectures', role: 'COORDINATOR', expectedStatus: 200 }
  ];

  for (const t of analyticsTests) {
    const res = await apiRequest(t.endpoint, 'GET', tokens[t.role]);
    const pass = res.status === t.expectedStatus || (res.status === 200 && t.expectedStatus === 200);
    results.analytics.push({
      endpoint: t.endpoint,
      role: t.role,
      expectedStatus: t.expectedStatus,
      actualStatus: res.status,
      pass
    });
  }

  // Regression test: HOD and PRINCIPAL should access academic analytics
  for (const role of ['HOD', 'PRINCIPAL', 'ADMIN']) {
    if (!tokens[role]) continue;
    const res = await apiRequest('/api/v1/analytics/academic', 'GET', tokens[role]);
    results.regression.push({
      endpoint: '/api/v1/analytics/academic',
      role,
      expectedStatus: 200,
      actualStatus: res.status,
      pass: res.status === 200
    });
  }

  // Validation tests for POST Remedial Class
  const invalidRemedial = {
    date: 'invalid-date',
    startTime: '10:00', // start >= end
    endTime: '09:00',
    venue: '',
    topic: '',
    facultyName: ''
  };

  const resInvalid = await apiRequest('/api/v1/academic-support/remedial-classes', 'POST', cToken, invalidRemedial);
  results.validation.push({
    test: 'Invalid Remedial Class Payload',
    expectedStatus: 400,
    actualStatus: resInvalid.status,
    pass: resInvalid.status === 400
  });

  const validRemedial = {
    date: new Date().toISOString(),
    startTime: '09:00',
    endTime: '11:00',
    venue: 'Room 101',
    topic: 'Valid Topic',
    facultyName: 'Valid Faculty',
    eligibleStudentIds: [new mongoose.Types.ObjectId().toString()]
  };

  const resValid = await apiRequest('/api/v1/academic-support/remedial-classes', 'POST', cToken, validRemedial);
  if (resValid.status !== 201) {
    console.log("Remedial creation failed:", resValid.body);
  }
  results.validation.push({
    test: 'Valid Remedial Class Payload',
    expectedStatus: 201,
    actualStatus: resValid.status === 201 ? 201 : resValid.status,
    pass: resValid.status === 201 || resValid.status === 200
  });
  
  if (resValid.status === 201 || resValid.status === 200) {
     const createdId = resValid.body.data._id;
     await apiRequest(`/api/v1/academic-support/remedial-classes/${createdId}`, 'DELETE', cToken);
  }

  // Guest Lecture validation
  const invalidGuest = {
    date: new Date().toISOString(),
    startTime: '14:00',
    endTime: '14:00', // equal
    venue: 'Auditorium',
    topic: 'Tech',
    speakerName: '' // Missing speaker
  };
  const resGuestInvalid = await apiRequest('/api/v1/academic-support/guest-lectures', 'POST', cToken, invalidGuest);
  results.validation.push({
    test: 'Invalid Guest Lecture Payload (startTime=endTime, missing speaker)',
    expectedStatus: 400,
    actualStatus: resGuestInvalid.status,
    pass: resGuestInvalid.status === 400
  });

  const validGuest = {
    date: new Date().toISOString(),
    startTime: '14:00',
    endTime: '16:00',
    venue: 'Auditorium',
    topic: 'Tech',
    speakerName: 'John Doe'
  };
  const resGuestValid = await apiRequest('/api/v1/academic-support/guest-lectures', 'POST', cToken, validGuest);
  results.validation.push({
    test: 'Valid Guest Lecture Payload',
    expectedStatus: 201,
    actualStatus: resGuestValid.status === 201 ? 201 : resGuestValid.status,
    pass: resGuestValid.status === 201 || resGuestValid.status === 200
  });

  if (resGuestValid.status === 201 || resGuestValid.status === 200) {
     const createdId = resGuestValid.body.data._id;
     await apiRequest(`/api/v1/academic-support/guest-lectures/${createdId}`, 'DELETE', cToken);
  }

  const fs = require('fs');
  fs.writeFileSync('C:\\Users\\ravit\\.gemini\\antigravity-ide\\brain\\95fb3250-108c-45e5-8141-e6ce6e9a5a72\\coordinator-security-validation.json', JSON.stringify(results, null, 2));

  await mongoose.disconnect();
  console.log('UAT Complete. Results saved.');
}

run().catch(console.error);
