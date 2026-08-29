const http = require('http');

async function loginAndFetch(username, role) {
  const reqData = JSON.stringify({ username, password: 'password' });
  const loginOpts = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/academic-master/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': reqData.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(loginOpts, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (!parsed.success || !parsed.data) {
            return reject('Login failed for ' + username + ': ' + data);
          }
          const token = parsed.data.token;
          fetchStudents(token, username, role).then(resolve).catch(reject);
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.write(reqData);
    req.end();
  });
}

function fetchStudents(token, username, role) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/academic-master/students',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    };
    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          console.log(`${role} (${username}) can see ${parsed.data.length} students.`);
          resolve();
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function test() {
  await loginAndFetch('admin', 'ADMIN');
  await loginAndFetch('principal', 'PRINCIPAL');
  await loginAndFetch('hod_kiet_cseai', 'HOD');
  await loginAndFetch('ctpo_kiet', 'CTPO');
  await loginAndFetch('student_1', 'STUDENT');
}
test().catch(console.error);
