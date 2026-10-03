const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../modules/academic-master/models/User');
const Student = require('../modules/academic-master/models/Student');
const RiskConfig = require('../modules/results-backlogs/models/RiskConfig');
const RiskProfile = require('../modules/results-backlogs/models/RiskProfile');
const SemesterResult = require('../modules/results-backlogs/models/SemesterResult');
const Backlog = require('../modules/results-backlogs/models/Backlog');
const riskService = require('../modules/results-backlogs/services/risk.service');
const jwt = require('jsonwebtoken');

let adminToken;
let testStudent;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test_secret';
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/academic_engagement_db_test_risk');
  }
  const adminUser = await User.create({
    name: 'Admin Risk User',
    username: 'admin.risk',
    passwordHash: 'password123',
    role: 'ADMIN',
    isActive: true
  });
  adminToken = jwt.sign({ id: adminUser._id, role: adminUser.role }, process.env.JWT_SECRET || 'test_secret');

  testStudent = await Student.create({
    name: 'Risk Test Student',
    rollNo: 'RISK001',
    email: 'risk001@example.com',
    gender: 'Male',
    doB: '2000-01-01',
    category: 'General',
    isActive: true,
    campusId: new mongoose.Types.ObjectId(),
    branchId: new mongoose.Types.ObjectId(),
    semesterId: new mongoose.Types.ObjectId(),
    year: 1
  });
});

afterAll(async () => {
  await RiskConfig.deleteMany({});
  await RiskProfile.deleteMany({});
  await Student.deleteMany({ rollNo: 'RISK001' });
  await User.deleteMany({ username: 'admin.risk' });
  await SemesterResult.deleteMany({ studentId: testStudent._id });
  await Backlog.deleteMany({ studentId: testStudent._id });
  
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }

});

describe('Risk Engine Module', () => {
  const semesterId = new mongoose.Types.ObjectId();

  it('should return NOT_CONFIGURED when no risk configs exist', async () => {
    // Clear configs just in case
    await RiskConfig.deleteMany({});
    const profile = await riskService.calculateRiskForStudent(testStudent._id, semesterId);
    
    expect(profile.riskLevel).toBe('NOT_CONFIGURED');
    expect(profile.factors).toContain('No risk configurations defined');
  });

  it('should create and update Risk Configs (ADMIN)', async () => {
    const res = await request(app)
      .post('/api/v1/results-backlogs/risk/config')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        indicator: 'BACKLOGS',
        thresholds: {
          CRITICAL: 5,
          HIGH: 3,
          MEDIUM: 1,
          LOW: 0
        },
        isActive: true
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.data.indicator).toBe('BACKLOGS');
  });

  it('should calculate risk properly when backlogs exist based on new config', async () => {
    // Give student 4 active backlogs
    for (let i = 0; i < 4; i++) {
      await Backlog.create({
        studentId: testStudent._id,
        subjectId: new mongoose.Types.ObjectId(),
        academicSemesterId: semesterId,
        branchCode: 'CSM',
        status: 'ACTIVE'
      });
    }

    const profile = await riskService.calculateRiskForStudent(testStudent._id, semesterId);
    
    // Config: >=5 CRITICAL, >=3 HIGH. Student has 4 => HIGH
    expect(profile.riskLevel).toBe('HIGH');
    expect(profile.factors).toContain('4 Active Backlog(s)');
  });
});
