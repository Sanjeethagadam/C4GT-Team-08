const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../modules/academic-master/models/User');
const RemedialClass = require('../modules/academic-support/models/RemedialClass');
const GuestLecture = require('../modules/academic-support/models/GuestLecture');
const Student = require('../modules/academic-master/models/Student');
const Backlog = require('../modules/results-backlogs/models/Backlog');
const jwt = require('jsonwebtoken');

let adminToken, coordinatorToken;
let testStudent, testSubjectId;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test_secret';
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/academic_engagement_db_test_support');
  }
  const adminUser = await User.create({
    name: 'Admin User',
    username: 'admin.support',
    passwordHash: 'password123',
    role: 'ADMIN',
    isActive: true
  });
  adminToken = jwt.sign({ id: adminUser._id, role: adminUser.role }, process.env.JWT_SECRET || 'test_secret');

  const coordUser = await User.create({
    name: 'Coord User',
    username: 'coord.support',
    passwordHash: 'password123',
    role: 'COORDINATOR',
    isActive: true
  });
  coordinatorToken = jwt.sign({ id: coordUser._id, role: coordUser.role }, process.env.JWT_SECRET || 'test_secret');

  testStudent = await Student.create({
    name: 'Test Student',
    rollNo: 'TEST12345',
    email: 'test@example.com',
    year: 1,
    status: 'ACTIVE',
    semesterId: new mongoose.Types.ObjectId(),
    branchId: new mongoose.Types.ObjectId(),
    campusId: new mongoose.Types.ObjectId()
  });

  testSubjectId = new mongoose.Types.ObjectId();

  await Backlog.create({
    studentId: testStudent._id,
    subjectId: testSubjectId,
    status: 'ACTIVE',
    credits: 3,
    branchCode: 'CSE',
    academicSemesterId: new mongoose.Types.ObjectId()
  });
});

afterAll(async () => {
  await RemedialClass.deleteMany({});
  await GuestLecture.deleteMany({});
  await Backlog.deleteMany({});
  await Student.deleteMany({});
  await User.deleteMany({ username: { $in: ['admin.support', 'coord.support'] } });
  
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }

});

describe('Academic Support Module - Remedial Classes', () => {
  let remedialId;
  it('should create a new remedial class by coordinator', async () => {
    const res = await request(app)
      .post('/api/v1/academic-support/remedial-classes')
      .set('Authorization', `Bearer ${coordinatorToken}`)
      .send({
        date: '2026-09-10',
        startTime: '10:00',
        endTime: '11:00',
        venue: 'Room 101',
        subjectId: testSubjectId,
        topic: 'Data Structures Refresher',
        facultyName: 'Dr. Smith'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.topic).toBe('Data Structures Refresher');
    remedialId = res.body.data._id;
  });

  it('should get all remedial classes', async () => {
    const res = await request(app)
      .get('/api/v1/academic-support/remedial-classes')
      .set('Authorization', `Bearer ${coordinatorToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('should update a remedial class', async () => {
    const res = await request(app)
      .put(`/api/v1/academic-support/remedial-classes/${remedialId}`)
      .set('Authorization', `Bearer ${coordinatorToken}`)
      .send({
        date: '2026-09-10',
        startTime: '10:00',
        endTime: '11:00',
        venue: 'Room 101',
        topic: 'Data Structures Refresher',
        facultyName: 'Dr. Smith',
        status: 'COMPLETED'
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe('COMPLETED');
  });

  it('should delete a remedial class', async () => {
    const res = await request(app)
      .delete(`/api/v1/academic-support/remedial-classes/${remedialId}`)
      .set('Authorization', `Bearer ${coordinatorToken}`);
    expect(res.statusCode).toBe(200);
  });
});

describe('Academic Support Module - Guest Lectures', () => {
  let lectureId;
  it('should create a guest lecture', async () => {
    const res = await request(app)
      .post('/api/v1/academic-support/guest-lectures')
      .set('Authorization', `Bearer ${coordinatorToken}`)
      .send({
        date: '2026-10-10',
        startTime: '14:00',
        endTime: '16:00',
        venue: 'Auditorium',
        topic: 'AI Trends',
        speakerName: 'John Doe',
        organization: 'Tech Corp',
        targetYear: ['1']
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.topic).toBe('AI Trends');
    lectureId = res.body.data._id;
  });

  it('should update a guest lecture', async () => {
    const res = await request(app)
      .put(`/api/v1/academic-support/guest-lectures/${lectureId}`)
      .set('Authorization', `Bearer ${coordinatorToken}`)
      .send({
        date: '2026-10-10',
        startTime: '14:00',
        endTime: '16:00',
        venue: 'Auditorium',
        topic: 'AI Trends',
        speakerName: 'John Doe',
        status: 'CANCELLED'
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe('CANCELLED');
  });

  it('should delete a guest lecture', async () => {
    const res = await request(app)
      .delete(`/api/v1/academic-support/guest-lectures/${lectureId}`)
      .set('Authorization', `Bearer ${coordinatorToken}`);
    expect(res.statusCode).toBe(200);
  });
});
