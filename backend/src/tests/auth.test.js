const request = require('supertest');
const app = require('../app');
const db = require('./setup');
const User = require('../modules/academic-master/models/User');
const Student = require('../modules/academic-master/models/Student');
const mongoose = require('mongoose');

beforeAll(async () => await db.connect());
afterEach(async () => await db.clearDatabase());
afterAll(async () => await db.closeDatabase());

describe('Auth & Authorization API', () => {
  let adminToken, ctpoToken, studentToken, adminId, ctpoId, studentId, studentRecordId;
  const sectionId = new mongoose.Types.ObjectId();
  const otherSectionId = new mongoose.Types.ObjectId();

  beforeEach(async () => {
    // Create Users
    const adminUser = await User.create({ username: 'admin', passwordHash: 'password', role: 'ADMIN' });
    const ctpoUser = await User.create({ username: 'ctpo1', passwordHash: 'password', role: 'CTPO', scope: { sectionId } });
    const studentUser = await User.create({ username: 'student1', passwordHash: 'password', role: 'STUDENT' });

    adminId = adminUser._id;
    ctpoId = ctpoUser._id;
    studentId = studentUser._id;

    // Login to get tokens
    const adminRes = await request(app).post('/api/v1/academic-master/auth/login').send({ username: 'admin', password: 'password' });
    adminToken = adminRes.body.data.token;

    const ctpoRes = await request(app).post('/api/v1/academic-master/auth/login').send({ username: 'ctpo1', password: 'password' });
    ctpoToken = ctpoRes.body.data.token;

    const studentRes = await request(app).post('/api/v1/academic-master/auth/login').send({ username: 'student1', password: 'password' });
    studentToken = studentRes.body.data.token;

    // Create Student Records
    const s1 = await Student.create({
      rollNo: '101', name: 'John Doe', 
      campusId: new mongoose.Types.ObjectId(), branchId: new mongoose.Types.ObjectId(), 
      year: 1, semesterId: new mongoose.Types.ObjectId(), sectionId: sectionId,
      userId: studentId
    });
    studentRecordId = s1._id;

    await Student.create({
      rollNo: '102', name: 'Jane Doe', 
      campusId: new mongoose.Types.ObjectId(), branchId: new mongoose.Types.ObjectId(), 
      year: 1, semesterId: new mongoose.Types.ObjectId(), sectionId: otherSectionId
    });
  });

  it('should authenticate successfully with valid credentials', async () => {
    const res = await request(app).post('/api/v1/academic-master/auth/login').send({ username: 'admin', password: 'password' });
    expect(res.statusCode).toEqual(200);
    expect(res.body.data.token).toBeDefined();
  });

  it('should reject login with invalid credentials', async () => {
    const res = await request(app).post('/api/v1/academic-master/auth/login').send({ username: 'admin', password: 'wrong' });
    expect(res.statusCode).toEqual(401);
  });

  it('Admin should be able to create a Campus (write access)', async () => {
    const res = await request(app)
      .post('/api/v1/academic-master/campuses')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Test Campus', code: 'TC', status: 'ACTIVE' });
    expect(res.statusCode).toEqual(201);
  });

  it('CTPO should get 403 Forbidden when attempting to create a Campus (write access)', async () => {
    const res = await request(app)
      .post('/api/v1/academic-master/campuses')
      .set('Authorization', `Bearer ${ctpoToken}`)
      .send({ name: 'Test Campus', code: 'TC', status: 'ACTIVE' });
    expect(res.statusCode).toEqual(403);
  });

  it('CTPO should only see students in their section', async () => {
    const res = await request(app)
      .get('/api/v1/academic-master/students')
      .set('Authorization', `Bearer ${ctpoToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].rollNo).toBe('101');
  });

  it('Student should only be able to view their own record', async () => {
    const res = await request(app)
      .get(`/api/v1/academic-master/students/${studentRecordId}`)
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.data.rollNo).toBe('101');
  });

  it('Student should get 403 Forbidden trying to view another student', async () => {
    const otherStudent = await Student.findOne({ rollNo: '102' });
    const res = await request(app)
      .get(`/api/v1/academic-master/students/${otherStudent._id}`)
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.statusCode).toEqual(403);
  });
});
