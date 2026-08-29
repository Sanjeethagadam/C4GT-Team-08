const mongoose = require('mongoose');
const User = require('./src/modules/academic-master/models/User');
const Student = require('./src/modules/academic-master/models/Student');
const request = require('supertest');
const express = require('express');

// Setting up the basic app structure to test the endpoint
const app = express();
app.use(express.json());
// mock audit context for tests if needed, or simply let the app handle it
const { auditContext } = require('./src/middlewares/auditContext');
app.use((req, res, next) => {
  auditContext.run(new Map(), () => {
    next();
  });
});
app.use('/api/v1', require('./src/routes/index')); 

const env = require('./src/config/env');

async function verify() {
  await mongoose.connect(env.mongodbUri || 'mongodb://localhost:27017/academic-management');
  
  const ctpo = await User.findOne({ role: 'CTPO' });
  if (!ctpo) {
    console.error("CTPO user not found!");
    process.exit(1);
  }

  const { token } = await require('./src/modules/academic-master/controllers/auth.controller').__test_generateTokens ? 
     await require('./src/modules/academic-master/controllers/auth.controller').__test_generateTokens(ctpo) :
     (function(){
       const jwt = require('jsonwebtoken');
       return { token: jwt.sign({ id: ctpo._id, role: ctpo.role, scope: ctpo.scope || {} }, env.jwtSecret, { expiresIn: '1h' }) };
     })();

  const res = await request(app)
    .get('/api/v1/academic-master/students?limit=2000')
    .set('Authorization', `Bearer ${token}`);

  const students = res.body.data || [];
  const sectionIds = new Set(students.map(s => s.sectionId ? s.sectionId.toString() : 'missing'));
  
  const allMatch = students.every(s => s.sectionId && s.sectionId.toString() === ctpo.scope.sectionId.toString());

  console.log("CTPO username:", ctpo.username);
  console.log("CTPO role:", ctpo.role);
  console.log("CTPO scope.sectionId:", ctpo.scope.sectionId);
  console.log("HTTP status:", res.status);
  console.log("Total students returned:", students.length);
  console.log("Distinct sectionIds:", sectionIds.size);
  console.log("First student sectionId:", students.length > 0 ? students[0].sectionId : 'N/A');
  console.log("Whether every returned student's sectionId equals CTPO scope.sectionId:", allMatch);

  process.exit(0);
}

verify().catch(err => {
  console.error(err);
  process.exit(1);
});
