const request = require('supertest');
const app = require('../app');
const db = require('./setup');
const User = require('../modules/academic-master/models/User');
const Student = require('../modules/academic-master/models/Student');
const Subject = require('../modules/academic-master/models/Subject');
const Semester = require('../modules/academic-master/models/Semester');
const Backlog = require('../modules/results-backlogs/models/Backlog');
const mongoose = require('mongoose');

beforeAll(async () => await db.connect());
afterEach(async () => await db.clearDatabase());
afterAll(async () => await db.closeDatabase());

describe('Historical Data Import API', () => {
  let adminToken, studentId, subjectId, semesterId;
  let rollNo = 'IMP101';
  let subjectCode = 'SUB101';
  let semesterCode = 'SEM1';

  beforeEach(async () => {
    // Admin User & Token
    const admin = await User.create({ username: 'admin_imp', passwordHash: 'pwd', role: 'ADMIN' });
    adminToken = (await request(app).post('/api/v1/academic-master/auth/login').send({ username: 'admin_imp', password: 'pwd' })).body.data.token;

    // Create Base Entities
    const sem = await Semester.create({ academicYearId: new mongoose.Types.ObjectId(), semesterCode, year: 1 });
    semesterId = sem._id;

    const sub = await Subject.create({ subjectCode, subjectName: 'Test Subject', semesterId });
    subjectId = sub._id;

    const s1 = await Student.create({
      rollNo, name: 'John', campusId: new mongoose.Types.ObjectId(), branchId: new mongoose.Types.ObjectId(), 
      year: 1, semesterId, sectionId: new mongoose.Types.ObjectId()
    });
    studentId = s1._id;
  });

  it('Should successfully process a valid CSV and derive a Backlog', async () => {
    const csvContent = `rollNo,subjectCode,semesterCode,resultStatus,grade,source,reportedBacklogCount
${rollNo},${subjectCode},${semesterCode},FAIL,F,IMPORT,1`;

    const res = await request(app)
      .post('/api/v1/results-backlogs/results/import')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', Buffer.from(csvContent), 'data.csv');

    expect(res.statusCode).toBe(200);
    expect(res.body.data.successCount).toBe(1);
    expect(res.body.data.failureCount).toBe(0);

    // Verify derived backlog
    const backlogs = await Backlog.find({ studentId });
    expect(backlogs.length).toBe(1);
    expect(backlogs[0].status).toBe('ACTIVE');
  });

  it('Should flag mismatch if reported backlog count differs from derived', async () => {
    const csvContent = `rollNo,subjectCode,semesterCode,resultStatus,grade,source,reportedBacklogCount
${rollNo},${subjectCode},${semesterCode},FAIL,F,IMPORT,5`; // Derives 1, reports 5

    const res = await request(app)
      .post('/api/v1/results-backlogs/results/import')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', Buffer.from(csvContent), 'data.csv');

    expect(res.statusCode).toBe(200);
    expect(res.body.data.successCount).toBe(1); // Row was still valid and processed
    expect(res.body.data.mismatchWarnings.length).toBe(1);
    expect(res.body.data.mismatchWarnings[0]).toContain('does not match reported');
  });

  it('Should catch and report invalid roll numbers without failing the whole batch', async () => {
    const csvContent = `rollNo,subjectCode,semesterCode,resultStatus,grade,source,reportedBacklogCount
INVALID,${subjectCode},${semesterCode},FAIL,F,IMPORT,0
${rollNo},${subjectCode},${semesterCode},PASS,A,IMPORT,0`;

    const res = await request(app)
      .post('/api/v1/results-backlogs/results/import')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', Buffer.from(csvContent), 'data.csv');

    expect(res.statusCode).toBe(200);
    expect(res.body.data.successCount).toBe(1); // The PASS row succeeded
    expect(res.body.data.failureCount).toBe(1); // The INVALID row failed
    expect(res.body.data.errors[0]).toContain('Invalid rollNo');
  });
});
