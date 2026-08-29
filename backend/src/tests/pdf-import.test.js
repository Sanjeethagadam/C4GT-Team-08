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

describe('JNTUK PDF Automation API', () => {
  let adminToken, s1Id, s2Id, subjectId, semesterId;

  beforeEach(async () => {
    const admin = await User.create({ username: 'admin_pdf', passwordHash: 'pwd', role: 'ADMIN' });
    adminToken = (await request(app).post('/api/v1/academic-master/auth/login').send({ username: 'admin_pdf', password: 'pwd' })).body.data.token;

    const sem = await Semester.create({ academicYearId: new mongoose.Types.ObjectId(), semesterCode: 'SEM1', year: 1 });
    semesterId = sem._id;

    const sub = await Subject.create({ subjectCode: 'SUB_PDF', subjectName: 'PDF Subject', semesterId });
    subjectId = sub._id;

    const s1 = await Student.create({
      rollNo: 'PDF101', name: 'John', campusId: new mongoose.Types.ObjectId(), branchId: new mongoose.Types.ObjectId(), 
      year: 1, semesterId, sectionId: new mongoose.Types.ObjectId()
    });
    s1Id = s1._id;

    const s2 = await Student.create({
      rollNo: 'PDF102', name: 'Jane', campusId: new mongoose.Types.ObjectId(), branchId: new mongoose.Types.ObjectId(), 
      year: 1, semesterId, sectionId: new mongoose.Types.ObjectId()
    });
    s2Id = s2._id;
  });

  it('Should extract PDF and return preview payload', async () => {
    // The python script will mock return rows for PDF101 (FAIL) and PDF102 (PASS)
    const res = await request(app)
      .post('/api/v1/results-backlogs/results/pdf/preview')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', Buffer.from('mock pdf'), 'results.pdf');

    expect(res.statusCode).toBe(200);
    expect(res.body.data.validRows.length).toBe(2); // Both mapped perfectly
    expect(res.body.data.errors.length).toBe(0);
    expect(res.body.data.totalExtracted).toBe(2);
    
    // Verify it correctly swapped the string rollNo for objectIds!
    expect(res.body.data.validRows[0].studentId).toBe(s1Id.toString());
  });

  it('Should catch unexpected PDF formats from Python script', async () => {
    // We mock the python error by injecting 'invalid' in the filename
    const res = await request(app)
      .post('/api/v1/results-backlogs/results/pdf/preview')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', Buffer.from('mock pdf'), 'invalid_format.pdf');

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain('unexpected PDF format');
  });

  it('Should confirm import and trigger processResult logic', async () => {
    // Mock the payload normally sent back from the frontend
    const payload = {
      validRows: [
        {
          studentId: s1Id.toString(),
          subjectId: subjectId.toString(),
          semesterId: semesterId.toString(),
          resultStatus: 'FAIL',
          grade: 'F',
          source: 'JNTUK_PDF'
        }
      ]
    };

    const res = await request(app)
      .post('/api/v1/results-backlogs/results/pdf/confirm')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(payload);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.successCount).toBe(1);

    // Verify backlog logic triggered
    const backlogs = await Backlog.find({ studentId: s1Id });
    expect(backlogs.length).toBe(1);
    expect(backlogs[0].status).toBe('ACTIVE');
  });
});
