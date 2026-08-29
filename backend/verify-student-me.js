const mongoose = require('mongoose');
const User = require('./src/modules/academic-master/models/User');
const request = require('supertest');
const express = require('express');
const env = require('./src/config/env');

const app = express();
app.use(express.json());
const { auditContext } = require('./src/middlewares/auditContext');
app.use((req, res, next) => {
  auditContext.run(new Map(), () => {
    next();
  });
});
app.use('/api/v1', require('./src/routes/index'));

async function verify() {
  await mongoose.connect(env.mongodbUri || 'mongodb://localhost:27017/academic-management');
  
  const studentUser = await User.findOne({ role: 'STUDENT' });
  if (!studentUser) {
    console.error("Student user not found!");
    process.exit(1);
  }

  const { token } = await require('./src/modules/academic-master/controllers/auth.controller').__test_generateTokens ? 
     await require('./src/modules/academic-master/controllers/auth.controller').__test_generateTokens(studentUser) :
     (function(){
       const jwt = require('jsonwebtoken');
       return { token: jwt.sign({ id: studentUser._id, role: studentUser.role, scope: studentUser.scope || {} }, env.jwtSecret, { expiresIn: '1h' }) };
     })();

  console.log("Testing GET /students...");
  const resGetAll = await request(app)
    .get('/api/v1/academic-master/students')
    .set('Authorization', `Bearer ${token}`);
  console.log(`Status for GET /students: ${resGetAll.status}`);

  console.log("Testing GET /students/me...");
  const resGetMe = await request(app)
    .get('/api/v1/academic-master/students/me')
    .set('Authorization', `Bearer ${token}`);
  console.log(`Status for GET /students/me: ${resGetMe.status}`);
  
  const returnedStudent = resGetMe.body.data || null;
  console.log("Returned exactly 1 student object:", !!returnedStudent && !Array.isArray(returnedStudent));
  console.log("Returned student userId matches logged-in user id:", !!returnedStudent && returnedStudent.userId.toString() === studentUser._id.toString());
  
  process.exit(0);
}

verify().catch(err => {
  console.error(err);
  process.exit(1);
});
