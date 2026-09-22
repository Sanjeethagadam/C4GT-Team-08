const http = require('http');

const login = (username, password) => {
  return new Promise((resolve) => {
    const data = JSON.stringify({ username, password });
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch(e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', e => resolve({ status: 500, data: e.message }));
    req.write(data);
    req.end();
  });
};

const testMe = (token) => {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/me',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode }));
    });
    req.on('error', e => resolve({ status: 500 }));
    req.end();
  });
};

const testDashboard = (token, role) => {
  let path = '';
  if (role === 'ADMIN') path = '/api/v1/analytics/admin-dashboard';
  else if (role === 'PRINCIPAL') path = '/api/v1/analytics/campus';
  else if (role === 'COORDINATOR') path = '/api/v1/analytics/campus';
  else if (role === 'HOD') path = '/api/v1/analytics/campus';
  else if (role === 'CTPO') path = '/api/v1/ctpo/dashboard';
  else if (role === 'STUDENT') path = '/api/v1/analytics/student/me';
  
  if (!path) return Promise.resolve({ status: 404 });

  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode }));
    });
    req.on('error', e => resolve({ status: 500 }));
    req.end();
  });
};

const testMyResults = (token) => {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/results-backlogs/semester-results',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode }));
    });
    req.on('error', e => resolve({ status: 500 }));
    req.end();
  });
}

const usersToTest = [
  { role: 'ADMIN', scope: 'Global', username: 'admin', password: 'admin123' },
  { role: 'PRINCIPAL', scope: 'Global', username: 'principal', password: 'password123' },
  { role: 'COORDINATOR', scope: 'Global', username: 'coordinator', password: 'password123' },
  { role: 'HOD', scope: 'Year 2', username: 'hod_year2', password: 'password123' },
  { role: 'HOD', scope: 'Year 3', username: 'hod_year3', password: 'password123' },
  { role: 'HOD', scope: 'Year 4', username: 'hod_year4', password: 'password123' },
  { role: 'CTPO', scope: 'Year 2', username: '25KTCSM', password: 'password123' },
  { role: 'CTPO', scope: 'Year 3', username: '24KTCSM', password: 'password123' },
  { role: 'CTPO', scope: 'Year 4', username: '23KTCSM', password: 'password123' },
  { role: 'STUDENT', scope: 'Student', username: '23B21A4348', password: '23B21A4348' }
];

const runTests = async () => {
  console.log('ROLE | SCOPE | LOGIN | AUTH CHECK | DASHBOARD | RESULT');
  console.log('---------------------------------------------------------');
  
  for (let u of usersToTest) {
    let resultStr = `${u.role} | ${u.scope} | `;
    
    // Test alternative CTPO password if password123 fails
    let res = await login(u.username, u.password);
    if (res.status === 401 && u.role === 'CTPO') {
      res = await login(u.username, u.username + '@');
    }
    
    let token = res.data?.token || res.data?.data?.token;

    if (res.status === 200 && token) {
      resultStr += '200 OK | ';
      
      const meRes = await testMe(token);
      resultStr += (meRes.status === 200 ? '200 OK' : meRes.status) + ' | ';
      
      const dashRes = await testDashboard(token, u.role);
      let dashStr = (dashRes.status === 200 ? '200 OK' : dashRes.status);
      
      let pass = (meRes.status === 200 && dashRes.status === 200);
      
      if (u.role === 'STUDENT') {
        const resultsRes = await testMyResults(token);
        if (resultsRes.status !== 200) {
            pass = false;
        }
        dashStr += ` (Results: ${resultsRes.status === 200 ? '200 OK' : resultsRes.status})`;
      }
      
      resultStr += dashStr + ' | ';
      
      if (pass) {
        resultStr += 'PASS';
      } else {
        resultStr += 'FAIL';
      }
    } else {
      resultStr += `${res.status} | - | - | FAIL`;
    }
    console.log(resultStr);
  }
};

runTests();
