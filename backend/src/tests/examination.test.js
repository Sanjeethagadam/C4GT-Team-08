const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../app');
const User = require('../modules/academic-master/models/User');
const AcademicYear = require('../modules/academic-master/models/AcademicYear');
const Semester = require('../modules/academic-master/models/Semester');
const Campus = require('../modules/academic-master/models/Campus');
const Branch = require('../modules/academic-master/models/Branch');
const CampusBranchAvailability = require('../modules/academic-master/models/CampusBranchAvailability');
const Subject = require('../modules/academic-master/models/Subject');
const SubjectBranchMapping = require('../modules/academic-master/models/SubjectBranchMapping');
const Student = require('../modules/academic-master/models/Student');
const Examination = require('../modules/examination/models/Examination');
const Timetable = require('../modules/examination/models/Timetable');
const Marks = require('../modules/examination/models/Marks');

let adminToken;
let studentToken;
let academicYearId;
let semesterId;
let branchId;
let campusId;
let subjectId;
let studentId;
let examinationId;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test_secret';
  await mongoose.connect(process.env.MONGODB_URI_TEST_EXAM || 'mongodb://localhost:27017/academic_engagement_db_test_exam');
  
  // Clear DB
  await User.deleteMany({});
  await AcademicYear.deleteMany({});
  await Semester.deleteMany({});
  await Campus.deleteMany({});
  await Branch.deleteMany({});
  await CampusBranchAvailability.deleteMany({});
  await Subject.deleteMany({});
  await SubjectBranchMapping.deleteMany({});
  await Student.deleteMany({});
  await Examination.deleteMany({});
  await Timetable.deleteMany({});
  await Marks.deleteMany({});

  // Setup Admin
  const admin = await User.create({ name: 'Admin', username: 'admin', email: 'admin@test.com', passwordHash: 'password123', role: 'ADMIN', status: 'ACTIVE' });
  adminToken = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

  // Setup Student User
  const studentUser = await User.create({ name: 'Student', username: 'student', email: 'student@test.com', passwordHash: 'password123', role: 'STUDENT', status: 'ACTIVE' });
  studentToken = jwt.sign({ id: studentUser._id, role: studentUser.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

  // Setup Academic structure
  const ay = await AcademicYear.create({ academicYear: '2023-2024', yearString: '2023-2024', startDate: new Date('2023-08-01'), endDate: new Date('2024-07-31'), status: 'ACTIVE' });
  academicYearId = ay._id;

  const sem = await Semester.create({ academicYearId, semesterCode: '1-1', semesterName: 'Year 1 Sem 1', year: 1, status: 'ACTIVE' });
  semesterId = sem._id;

  const camp = await Campus.create({ name: 'Main Campus', code: 'MC' });
  campusId = camp._id;

  const branch = await Branch.create({ name: 'Computer Science', code: 'CSE' });
  branchId = branch._id;

  await CampusBranchAvailability.create({ campusId, branchId, available: true });

  const subj = await Subject.create({ subjectCode: 'CS101', subjectName: 'Intro to CS', semesterId });
  subjectId = subj._id;

  await SubjectBranchMapping.create({ subjectId, branchId, semesterId, status: 'ACTIVE' });

  const stu = await Student.create({
    userId: studentUser._id,
    name: 'Test Student',
    htno: '24B21A0501',
    rollNo: '24B21A0501',
    campusId,
    branchId,
    semesterId,
    year: 1,
    batch: '2023'
  });
  studentId = stu._id;
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Examination Foundation (Phase 4A)', () => {

  describe('1. Examination Model & APIs', () => {
    it('Admin can create valid Examination', async () => {
      const res = await request(app)
        .post('/api/v1/examination/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          examType: 'MID1',
          academicYearId,
          semesterId
        });
      
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.examType).toBe('MID1');
      examinationId = res.body.data._id;
    });

    it('Duplicate examination is prevented', async () => {
      const res = await request(app)
        .post('/api/v1/examination/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          examType: 'MID1',
          academicYearId,
          semesterId
        });
      
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('List examinations works', async () => {
      const res = await request(app)
        .get('/api/v1/examination/events')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
    });
  });

  describe('2. Timetable Model & APIs', () => {
    it('Admin can create valid Timetable', async () => {
      const res = await request(app)
        .post('/api/v1/examination/timetable')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          examinationId,
          subjectId,
          branchId,
          examDate: '2026-10-01',
          startTime: '09:00 AM',
          endTime: '12:00 PM'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.startTime).toBe('09:00 AM');
    });
  });

  describe('3. Marks Model & APIs', () => {
    it('Enter valid marks', async () => {
      const res = await request(app)
        .post('/api/v1/examination/marks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          studentId,
          examinationId,
          subjectId,
          marksObtained: 18,
          maxMarks: 20,
          status: 'PRESENT'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('Marks exceeding maxMarks are prevented', async () => {
      const res = await request(app)
        .post('/api/v1/examination/marks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          studentId,
          examinationId,
          subjectId,
          marksObtained: 25,
          maxMarks: 20,
          status: 'PRESENT'
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/cannot exceed max marks/);
    });

    it('Duplicate marks are prevented', async () => {
      const res = await request(app)
        .post('/api/v1/examination/marks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          studentId,
          examinationId,
          subjectId,
          marksObtained: 15,
          maxMarks: 20,
          status: 'PRESENT'
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/already entered/);
    });

    it('Invalid subject/student is caught', async () => {
      const res = await request(app)
        .post('/api/v1/examination/marks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          studentId: new mongoose.Types.ObjectId(),
          examinationId,
          subjectId,
          marksObtained: 15,
          maxMarks: 20,
          status: 'PRESENT'
        });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Student not found');
    });
  });

  describe('4. RBAC & Lookup', () => {
    it('Student cannot enter marks', async () => {
      const res = await request(app)
        .post('/api/v1/examination/marks')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          studentId,
          examinationId,
          subjectId,
          marksObtained: 15,
          maxMarks: 20,
          status: 'PRESENT'
        });

      expect(res.status).toBe(403);
    });

    it('Student lookup endpoint works', async () => {
      const res = await request(app)
        .get(`/api/v1/examination/marks/student/${studentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
    });

    it('Internal marks endpoint returns NOT_DEFINED pending authoritative rule', async () => {
      const res = await request(app)
        .get('/api/v1/examination/marks/internal')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('NOT_DEFINED');
      expect(res.body.data.reason).toBe('PENDING_AUTHORITATIVE_RULE');
    });
  });
});
