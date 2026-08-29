const request = require('supertest');
const app = require('../app');
const db = require('./setup');
const User = require('../modules/academic-master/models/User');
const Student = require('../modules/academic-master/models/Student');
const RiskThreshold = require('../modules/results-backlogs/models/RiskThreshold');
const RiskProfile = require('../modules/results-backlogs/models/RiskProfile');
const mongoose = require('mongoose');

beforeAll(async () => await db.connect());
afterEach(async () => await db.clearDatabase());
afterAll(async () => await db.closeDatabase());

describe('Academic Risk Engine API', () => {
  let adminToken, studentId, subject1Id, subject2Id, subject3Id, semesterId;

  beforeEach(async () => {
    // Create Admin User & Token
    const admin = await User.create({ username: 'admin_risk', passwordHash: 'pwd', role: 'ADMIN' });
    adminToken = (await request(app).post('/api/v1/academic-master/auth/login').send({ username: 'admin_risk', password: 'pwd' })).body.data.token;

    // Create Student & IDs
    const s1 = await Student.create({
      rollNo: 'RISK101', name: 'John', campusId: new mongoose.Types.ObjectId(), branchId: new mongoose.Types.ObjectId(), 
      year: 1, semesterId: new mongoose.Types.ObjectId(), sectionId: new mongoose.Types.ObjectId()
    });
    studentId = s1._id;
    subject1Id = new mongoose.Types.ObjectId();
    subject2Id = new mongoose.Types.ObjectId();
    subject3Id = new mongoose.Types.ObjectId();
    semesterId = new mongoose.Types.ObjectId();
  });

  it('Should evaluate to MEDIUM risk when failing 2 subjects with default thresholds', async () => {
    // Default thresholds in code: MEDIUM = 1, HIGH = 3. 
    // Failing 2 subjects should give MEDIUM.
    await request(app)
      .post('/api/v1/results-backlogs/results')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ studentId: studentId.toString(), subjectId: subject1Id.toString(), semesterId: semesterId.toString(), resultStatus: 'FAIL', grade: 'F', source: 'JNTUK' });
    
    await request(app)
      .post('/api/v1/results-backlogs/results')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ studentId: studentId.toString(), subjectId: subject2Id.toString(), semesterId: semesterId.toString(), resultStatus: 'FAIL', grade: 'F', source: 'JNTUK' });

    const profile = await RiskProfile.findOne({ studentId });
    expect(profile.riskLevel).toBe('MEDIUM');
    expect(profile.indicators[0]).toBe('2 Active Backlogs');
  });

  it('Should evaluate dynamically based on DB thresholds', async () => {
    // Override threshold: HIGH = 2 instead of default 3.
    const tRes = await request(app)
      .post('/api/v1/results-backlogs/risk-thresholds')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ key: 'HIGH_RISK_BACKLOGS', value: 2 });
    expect(tRes.statusCode).toBe(201);

    // Fail 2 subjects. With new threshold, it should be HIGH instead of MEDIUM.
    await request(app)
      .post('/api/v1/results-backlogs/results')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ studentId: studentId.toString(), subjectId: subject1Id.toString(), semesterId: semesterId.toString(), resultStatus: 'FAIL', grade: 'F', source: 'JNTUK' });
    
    await request(app)
      .post('/api/v1/results-backlogs/results')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ studentId: studentId.toString(), subjectId: subject2Id.toString(), semesterId: semesterId.toString(), resultStatus: 'FAIL', grade: 'F', source: 'JNTUK' });

    const profile = await RiskProfile.findOne({ studentId });
    expect(profile.riskLevel).toBe('HIGH');
  });
});
