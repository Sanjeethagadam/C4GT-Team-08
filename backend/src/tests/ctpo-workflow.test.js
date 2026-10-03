const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../app');
const User = require('../modules/academic-master/models/User');
const AcademicYear = require('../modules/academic-master/models/AcademicYear');
const Semester = require('../modules/academic-master/models/Semester');
const Campus = require('../modules/academic-master/models/Campus');
const Branch = require('../modules/academic-master/models/Branch');
const Section = require('../modules/academic-master/models/Section');
const Subject = require('../modules/academic-master/models/Subject');
const Student = require('../modules/academic-master/models/Student');
const Examination = require('../modules/examination/models/Examination');
const CtpoAssignment = require('../modules/examination/models/CtpoAssignment');
const Marks = require('../modules/examination/models/Marks');

let adminToken;
let hodToken;
let ctpo1Token;
let ctpo2Token;
let studentToken;

let campusId, branchId, academicYearId, semesterId, sectionId, subject1Id, subject2Id;
let ctpo1UserId, ctpo2UserId, studentUserId, studentId;
let examinationId;
let assignmentId1, assignmentId2;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test_secret';
  await mongoose.connect(process.env.MONGODB_URI_TEST_CTPO || 'mongodb://localhost:27017/academic_engagement_db_test_ctpo');
  
  // Clean DB
  await mongoose.connection.db.dropDatabase();
  await User.deleteMany({});
  await AcademicYear.deleteMany({});
  await Semester.deleteMany({});
  await Campus.deleteMany({});
  await Branch.deleteMany({});
  await Section.deleteMany({});
  await Subject.deleteMany({});
  await Student.deleteMany({});
  await Examination.deleteMany({});
  await CtpoAssignment.deleteMany({});
  await Marks.deleteMany({});

  // Setup Users
  const admin = await User.create({ name: 'Admin', username: 'admin', email: 'a@a.com', passwordHash: 'pwd', role: 'ADMIN', status: 'ACTIVE' });
  adminToken = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

  const hod = await User.create({ name: 'HOD', username: 'hod', email: 'h@h.com', passwordHash: 'pwd', role: 'HOD', status: 'ACTIVE' });
  hodToken = jwt.sign({ id: hod._id, role: hod.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

  const ctpo1 = await User.create({ name: 'CTPO1', username: 'ctpo1', email: 'c1@c.com', passwordHash: 'pwd', role: 'CTPO', status: 'ACTIVE' });
  ctpo1UserId = ctpo1._id;
  ctpo1Token = jwt.sign({ id: ctpo1._id, role: ctpo1.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

  const ctpo2 = await User.create({ name: 'CTPO2', username: 'ctpo2', email: 'c2@c.com', passwordHash: 'pwd', role: 'CTPO', status: 'ACTIVE' });
  ctpo2UserId = ctpo2._id;
  ctpo2Token = jwt.sign({ id: ctpo2._id, role: ctpo2.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

  const stuUser = await User.create({ name: 'Student', username: 'stu', email: 's@s.com', passwordHash: 'pwd', role: 'STUDENT', status: 'ACTIVE' });
  studentUserId = stuUser._id;
  studentToken = jwt.sign({ id: stuUser._id, role: stuUser.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

  // Setup Academic Data
  const ay = await AcademicYear.create({ academicYear: '2023-2024', yearString: '2023-2024', startDate: new Date(), endDate: new Date(), status: 'ACTIVE' });
  academicYearId = ay._id;

  const sem = await Semester.create({ academicYearId, semesterCode: '1-1', semesterName: 'Sem 1', year: 1, status: 'ACTIVE' });
  semesterId = sem._id;

  const camp = await Campus.create({ name: 'Main', code: 'MC' });
  campusId = camp._id;

  const br = await Branch.create({ name: 'CSE', code: 'CSE' });
  branchId = br._id;

  const sec = await Section.create({ branchId, semesterId, sectionName: 'A', year: 1 });
  sectionId = sec._id;

  const sub1 = await Subject.create({ subjectCode: 'CS101', subjectName: 'Intro', semesterId });
  subject1Id = sub1._id;
  
  const sub2 = await Subject.create({ subjectCode: 'CS102', subjectName: 'DS', semesterId });
  subject2Id = sub2._id;

  const stu = await Student.create({
    userId: studentUserId, name: 'Student Name', htno: '24B21A0501', rollNo: '24B21A0501', 
    campusId, branchId, semesterId, sectionId, year: 1, batch: '2023'
  });
  studentId = stu._id;

  const exam = await Examination.create({ examType: 'MID1', academicYearId, semesterId, status: 'ACTIVE' });
  examinationId = exam._id;
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Phase 4B - CTPO Assignment & Mark Entry', () => {

  describe('1. CTPO Assignment', () => {
    it('ADMIN can assign CTPO', async () => {
      const res = await request(app).post('/api/v1/examination/ctpo-assignments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ctpoUserId: ctpo1UserId, campusId, branchId, academicYearId, semesterId, sectionId, studentCategory: 'DAY_SCHOLAR'
        });
      
      expect(res.status).toBe(201);
      assignmentId1 = res.body.data._id;
    });

    it('Duplicate ACTIVE assignment rejected', async () => {
      const res = await request(app).post('/api/v1/examination/ctpo-assignments')
        .set('Authorization', `Bearer ${hodToken}`)
        .send({
          ctpoUserId: ctpo2UserId, campusId, branchId, academicYearId, semesterId, sectionId, studentCategory: 'DAY_SCHOLAR'
        });
      
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/ACTIVE CTPO assignment already exists/);
    });

    it('HOD can assign different category to same CTPO', async () => {
      const res = await request(app).post('/api/v1/examination/ctpo-assignments')
        .set('Authorization', `Bearer ${hodToken}`)
        .send({
          ctpoUserId: ctpo1UserId, campusId, branchId, academicYearId, semesterId, sectionId, studentCategory: 'HOSTELLER'
        });
      
      expect(res.status).toBe(201);
      assignmentId2 = res.body.data._id;
    });

    it('Explicit reassignment deactivates old and activates new', async () => {
      const res = await request(app).post('/api/v1/examination/ctpo-assignments/reassign')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          oldAssignmentId: assignmentId2,
          newCtpoUserId: ctpo2UserId
        });
      
      expect(res.status).toBe(200);
      expect(res.body.data.ctpoUserId).toBe(ctpo2UserId.toString());
      
      const oldAssig = await CtpoAssignment.findById(assignmentId2);
      expect(oldAssig.status).toBe('INACTIVE');
      assignmentId2 = res.body.data._id; // update to new active assignment
    });
    
    it('CTPO sees only active own assignments', async () => {
      const res = await request(app).get('/api/v1/examination/ctpo-assignments')
        .set('Authorization', `Bearer ${ctpo1Token}`);
      
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1); // DAY_SCHOLAR only
      expect(res.body.data[0]._id).toBe(assignmentId1.toString());
    });
  });

  describe('2. Bulk Mark Entry Workflow', () => {
    it('Fetch Dataset returns assigned students', async () => {
      const res = await request(app).get(`/api/v1/examination/marks/dataset?assignmentId=${assignmentId1}&examinationId=${examinationId}`)
        .set('Authorization', `Bearer ${ctpo1Token}`);
      
      expect(res.status).toBe(200);
      expect(res.body.data.students.length).toBe(1);
    });

    it('CTPO can save draft marks', async () => {
      const res = await request(app).post('/api/v1/examination/marks/bulk')
        .set('Authorization', `Bearer ${ctpo1Token}`)
        .send({
          assignmentId: assignmentId1,
          examinationId,
          subjectId: subject1Id,
          isSubmit: false, // Save Draft
          marksData: [{
            studentId,
            marksObtained: 15,
            maxMarks: 20,
            status: 'PRESENT'
          }]
        });
      
      expect(res.status).toBe(200);
      const mark = await Marks.findOne({ studentId, examinationId, subjectId: subject1Id });
      expect(mark.draft).toBe(true);
      expect(mark.marksObtained).toBe(15);
    });

    it('CTPO can edit and submit marks', async () => {
      const res = await request(app).post('/api/v1/examination/marks/bulk')
        .set('Authorization', `Bearer ${ctpo1Token}`)
        .send({
          assignmentId: assignmentId1,
          examinationId,
          subjectId: subject1Id,
          isSubmit: true, // Submit
          marksData: [{
            studentId,
            marksObtained: 18,
            maxMarks: 20,
            status: 'PRESENT'
          }]
        });
      
      expect(res.status).toBe(200);
      const mark = await Marks.findOne({ studentId, examinationId, subjectId: subject1Id });
      expect(mark.draft).toBe(false);
      expect(mark.marksObtained).toBe(18);
      expect(mark.submittedAt).toBeDefined();
    });

    it('Marks > max rejected', async () => {
      const res = await request(app).post('/api/v1/examination/marks/bulk')
        .set('Authorization', `Bearer ${ctpo1Token}`)
        .send({
          assignmentId: assignmentId1, examinationId, subjectId: subject1Id, isSubmit: true,
          marksData: [{ studentId, marksObtained: 25, maxMarks: 20, status: 'PRESENT' }]
        });
      expect(res.status).toBe(400);
    });

    it('CTPO cannot edit another assignment', async () => {
      const res = await request(app).post('/api/v1/examination/marks/bulk')
        .set('Authorization', `Bearer ${ctpo1Token}`) // CTPO1 trying to edit CTPO2's assignment
        .send({
          assignmentId: assignmentId2, examinationId, subjectId: subject1Id, isSubmit: false,
          marksData: [{ studentId, marksObtained: 18, maxMarks: 20, status: 'PRESENT' }]
        });
      expect(res.status).toBe(403);
    });
  });
});
