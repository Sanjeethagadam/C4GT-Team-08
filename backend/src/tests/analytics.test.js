const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../modules/academic-master/models/User');
const Student = require('../modules/academic-master/models/Student');
const Semester = require('../modules/academic-master/models/Semester');
const CtpoAssignment = require('../modules/examination/models/CtpoAssignment');
const jwt = require('jsonwebtoken');

describe('Analytics Module Scoping', () => {
  let studentToken, ctpoToken, hodToken, principalToken, coordToken;
  let studentUser, ctpoUser, hodUser, principalUser, coordUser;
  let campusId, branchId, studentId;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test_secret';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/academic_engagement_db_test_analytics');
    }
    
    // Use unique usernames so we don't need to delete all users
    campusId = new mongoose.Types.ObjectId();
    branchId = new mongoose.Types.ObjectId();

    const student = await Student.create({
      name: 'Analytics Student',
      rollNo: 'ANLY001',
      email: 'anly001@example.com',
      gender: 'Male',
      doB: '2000-01-01',
      category: 'General',
      isActive: true,
      branchId,
      campusId,
      semesterId: new mongoose.Types.ObjectId(),
      year: 1
    });
    studentId = student._id;

    studentUser = await User.create({ username: 'a.s1', passwordHash: 'h', role: 'STUDENT', scopeRef: { type: 'Student', refId: studentId } });
    ctpoUser = await User.create({ username: 'a.c1', passwordHash: 'h', role: 'CTPO', scopeRef: { type: 'Campus', refId: campusId } });
    hodUser = await User.create({ username: 'a.h1', passwordHash: 'h', role: 'HOD', scopeRef: null, scope: { year: 4 } });
    principalUser = await User.create({ username: 'a.p1', passwordHash: 'h', role: 'PRINCIPAL' });
    coordUser = await User.create({ username: 'a.co1', passwordHash: 'h', role: 'COORDINATOR', scopeRef: { type: 'Branch', refId: branchId } });

    const semester = await Semester.create({
      academicYearId: new mongoose.Types.ObjectId(),
      code: '2-1',
      semesterCode: '2-1',
      year: 2,
      part: 1,
      name: 'Year 2 Sem 1',
      status: 'ACTIVE'
    });

    await CtpoAssignment.create({
      ctpoUserId: ctpoUser._id,
      branchId,
      campusId,
      academicYearId: semester.academicYearId,
      assignedBy: principalUser._id,
      sectionId: new mongoose.Types.ObjectId(),
      semesterId: semester._id,
      status: 'ACTIVE'
    });

    studentToken = jwt.sign({ id: studentUser._id, role: 'STUDENT', scopeRef: studentUser.scopeRef }, process.env.JWT_SECRET);
    ctpoToken = jwt.sign({ id: ctpoUser._id, role: 'CTPO', scopeRef: ctpoUser.scopeRef }, process.env.JWT_SECRET);
    hodToken = jwt.sign({ id: hodUser._id, role: 'HOD', scopeRef: hodUser.scopeRef, scope: hodUser.scope }, process.env.JWT_SECRET);
    principalToken = jwt.sign({ id: principalUser._id, role: 'PRINCIPAL', scopeRef: principalUser.scopeRef }, process.env.JWT_SECRET);
    coordToken = jwt.sign({ id: coordUser._id, role: 'COORDINATOR', scopeRef: coordUser.scopeRef }, process.env.JWT_SECRET);
  });

  afterAll(async () => {
    // Delete specifically what we created
    await User.deleteMany({ username: { $in: ['a.s1', 'a.c1', 'a.h1', 'a.p1', 'a.co1'] } });
    await Student.deleteOne({ _id: studentId });
    await Semester.deleteMany({});
    await CtpoAssignment.deleteMany({});
  });

  it('Principal should access all campus stats', async () => {
    const res = await request(app).get('/api/v1/analytics/campus').set('Authorization', `Bearer ${principalToken}`);
    expect(res.statusCode).toBe(200);
  });

  it('HOD should access branch stats', async () => {
    const res = await request(app).get('/api/v1/analytics/campus').set('Authorization', `Bearer ${hodToken}`);
    expect(res.statusCode).toBe(200);
    // Could intercept and verify query building if needed
  });

  it('CTPO should access campus stats', async () => {
    const res = await request(app).get('/api/v1/analytics/campus').set('Authorization', `Bearer ${ctpoToken}`);
    expect(res.statusCode).toBe(200);
  });

  it('Student /me endpoint should return personal data only', async () => {
    const res = await request(app).get('/api/v1/analytics/student/me').set('Authorization', `Bearer ${studentToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('backlogs');
    expect(res.body.data).toHaveProperty('results');
  });

  it('Other roles should not access /student/me', async () => {
    const res = await request(app).get('/api/v1/analytics/student/me').set('Authorization', `Bearer ${hodToken}`);
    expect(res.statusCode).toBe(403);
  });
});
