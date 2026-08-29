const request = require('supertest');
const app = require('../app');
const db = require('./setup');
const User = require('../modules/academic-master/models/User');
const Student = require('../modules/academic-master/models/Student');
const Examination = require('../modules/examination/models/Examination');
const mongoose = require('mongoose');

beforeAll(async () => await db.connect());
afterEach(async () => await db.clearDatabase());
afterAll(async () => await db.closeDatabase());

describe('Examination Module API', () => {
  let adminToken, ctpoToken, studentToken;
  let sectionId = new mongoose.Types.ObjectId();
  let otherSectionId = new mongoose.Types.ObjectId();
  let student1Id, student2Id, subjectId, examId;

  beforeEach(async () => {
    // Create Users
    const admin = await User.create({ username: 'admin_ex', passwordHash: 'pwd', role: 'ADMIN' });
    const ctpo = await User.create({ username: 'ctpo_ex', passwordHash: 'pwd', role: 'CTPO', scope: { sectionId } });
    const studentUser = await User.create({ username: 'stu_ex', passwordHash: 'pwd', role: 'STUDENT' });

    adminToken = (await request(app).post('/api/v1/academic-master/auth/login').send({ username: 'admin_ex', password: 'pwd' })).body.data.token;
    ctpoToken = (await request(app).post('/api/v1/academic-master/auth/login').send({ username: 'ctpo_ex', password: 'pwd' })).body.data.token;
    studentToken = (await request(app).post('/api/v1/academic-master/auth/login').send({ username: 'stu_ex', password: 'pwd' })).body.data.token;

    // Create Students
    const s1 = await Student.create({
      rollNo: 'EX101', name: 'John', campusId: new mongoose.Types.ObjectId(), branchId: new mongoose.Types.ObjectId(), 
      year: 1, semesterId: new mongoose.Types.ObjectId(), sectionId: sectionId, userId: studentUser._id
    });
    student1Id = s1._id;

    const s2 = await Student.create({
      rollNo: 'EX102', name: 'Jane', campusId: new mongoose.Types.ObjectId(), branchId: new mongoose.Types.ObjectId(), 
      year: 1, semesterId: new mongoose.Types.ObjectId(), sectionId: otherSectionId
    });
    student2Id = s2._id;

    subjectId = new mongoose.Types.ObjectId();

    // Create Exam
    const ex = await Examination.create({
      semesterId: new mongoose.Types.ObjectId(),
      examinationType: 'MID_1',
      maxMarks: 30
    });
    examId = ex._id;
  });

  it('Admin should be able to create an Examination', async () => {
    const res = await request(app)
      .post('/api/v1/examination/examinations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ semesterId: new mongoose.Types.ObjectId().toString(), examinationType: 'SEMESTER', maxMarks: 70 });
    expect(res.statusCode).toEqual(201);
  });

  it('CTPO should get 403 Forbidden creating an Examination', async () => {
    const res = await request(app)
      .post('/api/v1/examination/examinations')
      .set('Authorization', `Bearer ${ctpoToken}`)
      .send({ semesterId: new mongoose.Types.ObjectId().toString(), examinationType: 'SEMESTER', maxMarks: 70 });
    expect(res.statusCode).toEqual(403);
  });

  it('CTPO should be able to enter marks for their assigned section', async () => {
    const res = await request(app)
      .post('/api/v1/examination/marks')
      .set('Authorization', `Bearer ${ctpoToken}`)
      .send({ studentId: student1Id.toString(), subjectId: subjectId.toString(), examinationId: examId.toString(), marks: 25 });
    expect(res.statusCode).toEqual(201);
  });

  it('CTPO should get 403 Forbidden entering marks for a student outside their section', async () => {
    const res = await request(app)
      .post('/api/v1/examination/marks')
      .set('Authorization', `Bearer ${ctpoToken}`)
      .send({ studentId: student2Id.toString(), subjectId: subjectId.toString(), examinationId: examId.toString(), marks: 25 });
    expect(res.statusCode).toEqual(403);
  });

  it('Should reject marks exceeding maxMarks', async () => {
    const res = await request(app)
      .post('/api/v1/examination/marks')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ studentId: student1Id.toString(), subjectId: subjectId.toString(), examinationId: examId.toString(), marks: 35 });
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toMatch(/cannot exceed maxMarks/);
  });
});
