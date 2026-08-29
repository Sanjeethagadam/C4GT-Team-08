const request = require('supertest');
const app = require('../app');
const db = require('./setup');
const User = require('../modules/academic-master/models/User');
const Student = require('../modules/academic-master/models/Student');
const Subject = require('../modules/academic-master/models/Subject');
const Semester = require('../modules/academic-master/models/Semester');
const Result = require('../modules/results-backlogs/models/Result');
const Backlog = require('../modules/results-backlogs/models/Backlog');
const mongoose = require('mongoose');

beforeAll(async () => await db.connect());
afterEach(async () => await db.clearDatabase());
afterAll(async () => await db.closeDatabase());

describe('Results & Backlogs Module API', () => {
  let adminToken, studentId, subjectId, semesterId;

  beforeEach(async () => {
    // Create Admin User & Token
    const admin = await User.create({ username: 'admin_rb', passwordHash: 'pwd', role: 'ADMIN' });
    adminToken = (await request(app).post('/api/v1/academic-master/auth/login').send({ username: 'admin_rb', password: 'pwd' })).body.data.token;

    // Create Student & IDs
    const s1 = await Student.create({
      rollNo: 'RB101', name: 'John', campusId: new mongoose.Types.ObjectId(), branchId: new mongoose.Types.ObjectId(), 
      year: 1, semesterId: new mongoose.Types.ObjectId(), sectionId: new mongoose.Types.ObjectId()
    });
    studentId = s1._id;
    subjectId = new mongoose.Types.ObjectId();
    semesterId = new mongoose.Types.ObjectId();
  });

  it('Should create an ACTIVE backlog when a FAIL result is posted', async () => {
    const res = await request(app)
      .post('/api/v1/results-backlogs/results')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        studentId: studentId.toString(), subjectId: subjectId.toString(), semesterId: semesterId.toString(),
        resultStatus: 'FAIL', grade: 'F', source: 'JNTUK'
      });
    expect(res.statusCode).toEqual(201);

    const backlogs = await Backlog.find({ studentId, subjectId });
    expect(backlogs.length).toBe(1);
    expect(backlogs[0].status).toBe('ACTIVE');
  });

  it('Should clear an ACTIVE backlog when a PASS result is posted later', async () => {
    // 1. Post FAIL
    await request(app)
      .post('/api/v1/results-backlogs/results')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        studentId: studentId.toString(), subjectId: subjectId.toString(), semesterId: semesterId.toString(),
        resultStatus: 'FAIL', grade: 'F', source: 'JNTUK'
      });
    
    // 2. Verify it's active
    let backlog = await Backlog.findOne({ studentId, subjectId });
    expect(backlog.status).toBe('ACTIVE');

    const sem2Id = new mongoose.Types.ObjectId();

    // 3. Post PASS in next semester
    const passRes = await request(app)
      .post('/api/v1/results-backlogs/results')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        studentId: studentId.toString(), subjectId: subjectId.toString(), semesterId: sem2Id.toString(),
        resultStatus: 'PASS', grade: 'A', source: 'JNTUK'
      });
    expect(passRes.statusCode).toEqual(201);

    // 4. Verify it's cleared
    backlog = await Backlog.findOne({ studentId, subjectId });
    expect(backlog.status).toBe('CLEARED');
  });
});
