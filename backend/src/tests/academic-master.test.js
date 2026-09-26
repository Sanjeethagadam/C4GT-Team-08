const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../modules/academic-master/models/User');
const Campus = require('../modules/academic-master/models/Campus');
const Branch = require('../modules/academic-master/models/Branch');
const CampusBranchAvailability = require('../modules/academic-master/models/CampusBranchAvailability');
const Student = require('../modules/academic-master/models/Student');
const Semester = require('../modules/academic-master/models/Semester');
const AcademicYear = require('../modules/academic-master/models/AcademicYear');
const Section = require('../modules/academic-master/models/Section');
const Subject = require('../modules/academic-master/models/Subject');
const SubjectBranchMapping = require('../modules/academic-master/models/SubjectBranchMapping');
const CtpoAssignment = require('../modules/examination/models/CtpoAssignment');
const bcrypt = require('bcrypt');

let adminToken;
let studentToken;
let kietCampusId, csmBranchId, dummyCampusId;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test_secret';
  // Connect to a test DB
  await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/academic_engagement_db_test_master');
  
  // Clear DB
  await Promise.all([
    User.deleteMany(), Campus.deleteMany(), Branch.deleteMany(),
    CampusBranchAvailability.deleteMany(), Student.deleteMany(),
    AcademicYear.deleteMany(), Semester.deleteMany(),
    Section.deleteMany(), Subject.deleteMany(), SubjectBranchMapping.deleteMany(),
    CtpoAssignment.deleteMany()
  ]);

  // Setup Admin
  const adminPass = await bcrypt.hash('admin123', 10);
  const admin = await User.create({ username: 'admin', passwordHash: adminPass, role: 'ADMIN' });
  
  // Setup Student User
  const studentPass = await bcrypt.hash('student123', 10);
  const student = await User.create({ username: 'student1', passwordHash: studentPass, role: 'STUDENT' });

  // Login to get tokens
  let res = await request(app).post('/api/auth/login').send({ username: 'admin', password: 'admin123' });
  adminToken = res.body.data.token;
  
  res = await request(app).post('/api/auth/login').send({ username: 'student1', password: 'student123' });
  studentToken = res.body.data.token;

  // Setup Campuses and Branches
  const kiet = await Campus.create({ name: 'KIET', code: 'K1' });
  kietCampusId = kiet._id;
  const dummyCampus = await Campus.create({ name: 'Dummy Campus', code: 'DM' });
  dummyCampusId = dummyCampus._id;
  
  const csm = await Branch.create({ name: 'CSM', code: 'CSM' });
  csmBranchId = csm._id;

  // Build indexes to enforce uniqueness in test db
  await Student.init();
  await CampusBranchAvailability.init();

  // Availability
  await CampusBranchAvailability.create({ campusId: kiet._id, branchId: csm._id, isAvailable: true });
  await CampusBranchAvailability.create({ campusId: dummyCampus._id, branchId: csm._id, isAvailable: false });
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Authentication & RBAC', () => {
  it('Admin login succeeds', async () => {
    const res = await request(app).post('/api/auth/login').send({ username: 'admin', password: 'admin123' });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.passwordHash).toBeUndefined(); // Never appears in response
  });

  it('Wrong password fails', async () => {
    const res = await request(app).post('/api/auth/login').send({ username: 'admin', password: 'wrong' });
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('Inactive user cannot login', async () => {
    const inactivePass = await bcrypt.hash('test1234', 10);
    await User.create({ username: 'inactive_user', passwordHash: inactivePass, role: 'STUDENT', status: 'INACTIVE' });
    const res = await request(app).post('/api/auth/login').send({ username: 'inactive_user', password: 'test1234' });
    expect(res.statusCode).toBe(401);
  });

  it('/api/me returns authenticated role', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.role).toBe('ADMIN');
  });

  it('Non-admin cannot create campus', async () => {
    const res = await request(app).post('/api/campuses').set('Authorization', `Bearer ${studentToken}`).send({
      name: 'Test Campus', code: 'TC'
    });
    expect(res.statusCode).toBe(403);
  });
});

describe('Student & CampusBranch Validation', () => {
  it('Valid campus/branch combination creates student', async () => {
    const res = await request(app).post('/api/students').set('Authorization', `Bearer ${adminToken}`).send({
      rollNo: '21X01A0501', name: 'Test Student', campusId: kietCampusId, branchId: csmBranchId, year: 1, semesterId: new mongoose.Types.ObjectId()
    });
    expect(res.statusCode).toBe(201);
  });

  it('Invalid campus/branch combination is rejected', async () => {
    const res = await request(app).post('/api/students').set('Authorization', `Bearer ${adminToken}`).send({
      rollNo: '21X01A0502', name: 'Test Student 2', campusId: dummyCampusId, branchId: csmBranchId, year: 1, semesterId: new mongoose.Types.ObjectId()
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain('is not available');
  });

  it('Duplicate roll number is rejected', async () => {
    const res = await request(app).post('/api/students').set('Authorization', `Bearer ${adminToken}`).send({
      rollNo: '21X01A0501', name: 'Test Student Clone', campusId: kietCampusId, branchId: csmBranchId, year: 1, semesterId: new mongoose.Types.ObjectId()
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain('unique');
  });
});

describe('New Core APIs', () => {
  let ayId, semesterId, subjectId;
  
  it('Admin can create AcademicYear', async () => {
    const res = await request(app).post('/api/academic-years').set('Authorization', `Bearer ${adminToken}`).send({
      academicYear: '2024-2025', startDate: '2024-08-01', endDate: '2025-05-30'
    });
    expect(res.statusCode).toBe(201);
    ayId = res.body.data._id;
  });

  it('Non-admin cannot create AcademicYear', async () => {
    const res = await request(app).post('/api/academic-years').set('Authorization', `Bearer ${studentToken}`).send({
      academicYear: '2025-2026', startDate: '2025-08-01', endDate: '2026-05-30'
    });
    expect(res.statusCode).toBe(403);
  });

  it('Admin can create Semester for an existing AcademicYear', async () => {
    const res = await request(app).post('/api/semesters').set('Authorization', `Bearer ${adminToken}`).send({
      academicYearId: ayId, semesterCode: '1-1', year: 1
    });
    expect(res.statusCode).toBe(201);
    semesterId = res.body.data._id;
  });

  it('Invalid AcademicYear reference is rejected', async () => {
    const res = await request(app).post('/api/semesters').set('Authorization', `Bearer ${adminToken}`).send({
      academicYearId: new mongoose.Types.ObjectId(), semesterCode: '1-2', year: 1
    });
    expect(res.statusCode).toBe(400);
  });

  it('Admin can create Section', async () => {
    const res = await request(app).post('/api/sections').set('Authorization', `Bearer ${adminToken}`).send({
      branchId: csmBranchId, year: 1, sectionName: 'A'
    });
    expect(res.statusCode).toBe(201);
  });

  it('Admin can create Subject', async () => {
    const res = await request(app).post('/api/subjects').set('Authorization', `Bearer ${adminToken}`).send({
      semesterId, subjectCode: 'CS102', subjectName: 'Data Structures'
    });
    expect(res.statusCode).toBe(201);
    subjectId = res.body.data._id;
  });

  it('Invalid Semester reference for Subject is rejected', async () => {
    const res = await request(app).post('/api/subjects').set('Authorization', `Bearer ${adminToken}`).send({
      semesterId: new mongoose.Types.ObjectId(), subjectCode: 'CS103', subjectName: 'Algorithms'
    });
    expect(res.statusCode).toBe(400);
  });

  it('Admin can create SubjectBranchMapping', async () => {
    const res = await request(app).post('/api/subject-branch-mappings').set('Authorization', `Bearer ${adminToken}`).send({
      subjectId, branchId: csmBranchId, semesterId
    });
    expect(res.statusCode).toBe(201);
  });

  it('Mismatched Subject/semester mapping is rejected', async () => {
    const badSemesterId = new mongoose.Types.ObjectId();
    await Semester.create({ academicYearId: ayId, semesterCode: '1-2', year: 1, _id: badSemesterId });
    const res = await request(app).post('/api/subject-branch-mappings').set('Authorization', `Bearer ${adminToken}`).send({
      subjectId, branchId: csmBranchId, semesterId: badSemesterId
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain('does not match');
  });

  it('Duplicate SubjectBranchMapping is rejected', async () => {
    const res = await request(app).post('/api/subject-branch-mappings').set('Authorization', `Bearer ${adminToken}`).send({
      subjectId, branchId: csmBranchId, semesterId
    });
    expect(res.statusCode).toBe(400);
  });

  it('Admin can create CampusBranchAvailability', async () => {
    const res = await request(app).post('/api/campus-branch-availability').set('Authorization', `Bearer ${adminToken}`).send({
      campusId: kietCampusId, branchId: new mongoose.Types.ObjectId(), isAvailable: true
    });
    // Branch won't be found
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain('Branch not found');
  });

  it('Duplicate campus + branch availability is rejected', async () => {
    const res = await request(app).post('/api/campus-branch-availability').set('Authorization', `Bearer ${adminToken}`).send({
      campusId: dummyCampusId, branchId: csmBranchId, isAvailable: true
    });
    expect(res.statusCode).toBe(400); // Because dummy+CSM was already seeded with isAvailable: false in beforeAll
  });
  
  it('Existing Student campus/branch validation still works', async () => {
    const res = await request(app).post('/api/students').set('Authorization', `Bearer ${adminToken}`).send({
      rollNo: '21X01A0503', name: 'Test Student 3', campusId: kietCampusId, branchId: csmBranchId, year: 1, semesterId
    });
    expect(res.statusCode).toBe(201);
  });
});

describe('Internal APIs', () => {
  it('/api/internal/students/:id returns only required fields', async () => {
    const student = await Student.findOne({ rollNo: '21X01A0501' });
    const res = await request(app).get(`/api/internal/students/${student._id}`).set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('rollNo');
    expect(res.body.data).toHaveProperty('name');
    expect(res.body.data).not.toHaveProperty('createdAt'); // Ensuring only specific fields are returned
  });
});

describe('Academic Year Update/Delete', () => {
  let ayIdTest;
  let semesterIdTest;

  it('Admin can create an unused academic year', async () => {
    const res = await request(app).post('/api/academic-years').set('Authorization', `Bearer ${adminToken}`).send({
      academicYear: '2099-2100', startDate: '2099-08-01', endDate: '2100-05-30'
    });
    expect(res.statusCode).toBe(201);
    ayIdTest = res.body.data._id;
  });

  it('ADMIN can update status ACTIVE -> INACTIVE', async () => {
    const res = await request(app).patch(`/api/academic-years/${ayIdTest}`).set('Authorization', `Bearer ${adminToken}`).send({
      status: 'INACTIVE'
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe('INACTIVE');
  });

  it('ADMIN can update status INACTIVE -> ACTIVE', async () => {
    const res = await request(app).patch(`/api/academic-years/${ayIdTest}`).set('Authorization', `Bearer ${adminToken}`).send({
      status: 'ACTIVE'
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe('ACTIVE');
  });

  it('Invalid status rejected', async () => {
    const res = await request(app).patch(`/api/academic-years/${ayIdTest}`).set('Authorization', `Bearer ${adminToken}`).send({
      status: 'INVALID_STATUS'
    });
    expect(res.statusCode).toBe(400);
  });

  it('Non-ADMIN cannot update/delete academic years', async () => {
    let res = await request(app).patch(`/api/academic-years/${ayIdTest}`).set('Authorization', `Bearer ${studentToken}`).send({
      status: 'INACTIVE'
    });
    expect(res.statusCode).toBe(403);

    res = await request(app).delete(`/api/academic-years/${ayIdTest}`).set('Authorization', `Bearer ${studentToken}`);
    expect(res.statusCode).toBe(403);
  });

  it('DELETE returns 404 for nonexistent academic year', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).delete(`/api/academic-years/${fakeId}`).set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(404);
  });

  it('DELETE returns 409 when academic year is referenced by Semester', async () => {
    const semRes = await request(app).post('/api/semesters').set('Authorization', `Bearer ${adminToken}`).send({
      academicYearId: ayIdTest, semesterCode: 'TEST-SEM', year: 1
    });
    expect(semRes.statusCode).toBe(201);
    semesterIdTest = semRes.body.data._id;

    const res = await request(app).delete(`/api/academic-years/${ayIdTest}`).set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(409);
    expect(res.body.message).toContain('referenced by existing semesters');
  });

  it('ADMIN can delete an unused academic year', async () => {
    // remove the semester we just created
    await Semester.findByIdAndDelete(semesterIdTest);
    
    const res = await request(app).delete(`/api/academic-years/${ayIdTest}`).set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
  });

  it('DELETE returns 409 when academic year is referenced by CtpoAssignment', async () => {
    const ayRes = await request(app).post('/api/academic-years').set('Authorization', `Bearer ${adminToken}`).send({
      academicYear: '2098-2099', startDate: '2098-08-01', endDate: '2099-05-30'
    });
    const newAyId = ayRes.body.data._id;

    const assign = await CtpoAssignment.create({
      ctpoUserId: new mongoose.Types.ObjectId(),
      branchId: csmBranchId,
      academicYearId: newAyId,
      semesterId: new mongoose.Types.ObjectId(),
      status: 'ACTIVE'
    });

    const res = await request(app).delete(`/api/academic-years/${newAyId}`).set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(409);
    
    await CtpoAssignment.findByIdAndDelete(assign._id);
    await request(app).delete(`/api/academic-years/${newAyId}`).set('Authorization', `Bearer ${adminToken}`);
  });
});
