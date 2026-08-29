const request = require('supertest');
const app = require('../app');
const db = require('./setup');
const User = require('../modules/academic-master/models/User');
const Student = require('../modules/academic-master/models/Student');
const Result = require('../modules/results-backlogs/models/Result');
const Backlog = require('../modules/results-backlogs/models/Backlog');
const mongoose = require('mongoose');

beforeAll(async () => await db.connect());
afterEach(async () => await db.clearDatabase());
afterAll(async () => await db.closeDatabase());

describe('Analytics Engine API', () => {
  let principalToken, ctpoToken, s1Id, s2Id, campusId, section1Id, section2Id;

  beforeEach(async () => {
    campusId = new mongoose.Types.ObjectId();
    section1Id = new mongoose.Types.ObjectId();
    section2Id = new mongoose.Types.ObjectId();

    // 1. Principal (Sees whole campus)
    const pUser = await User.create({ username: 'prin', passwordHash: 'pwd', role: 'PRINCIPAL', scope: { campusId } });
    principalToken = (await request(app).post('/api/v1/academic-master/auth/login').send({ username: 'prin', password: 'pwd' })).body.data.token;

    // 2. CTPO (Sees only section 1)
    const cUser = await User.create({ username: 'ctpo', passwordHash: 'pwd', role: 'CTPO', scope: { sectionId: section1Id } });
    ctpoToken = (await request(app).post('/api/v1/academic-master/auth/login').send({ username: 'ctpo', password: 'pwd' })).body.data.token;

    // 3. Students
    // Student 1 is in Section 1 (Visible to CTPO and Principal)
    const s1 = await Student.create({
      rollNo: 'A1', name: 'John', campusId, branchId: new mongoose.Types.ObjectId(), 
      year: 1, semesterId: new mongoose.Types.ObjectId(), sectionId: section1Id
    });
    s1Id = s1._id;

    // Student 2 is in Section 2 (Visible ONLY to Principal, not CTPO)
    const s2 = await Student.create({
      rollNo: 'A2', name: 'Jane', campusId, branchId: new mongoose.Types.ObjectId(), 
      year: 1, semesterId: new mongoose.Types.ObjectId(), sectionId: section2Id
    });
    s2Id = s2._id;

    // Generate Results
    await Result.create({ studentId: s1Id, subjectId: new mongoose.Types.ObjectId(), semesterId: new mongoose.Types.ObjectId(), resultStatus: 'FAIL', grade: 'F', source: 'TEST' });
    await Backlog.create({ studentId: s1Id, subjectId: new mongoose.Types.ObjectId(), semesterId: new mongoose.Types.ObjectId(), resultId: new mongoose.Types.ObjectId(), status: 'ACTIVE' });

    await Result.create({ studentId: s2Id, subjectId: new mongoose.Types.ObjectId(), semesterId: new mongoose.Types.ObjectId(), resultStatus: 'FAIL', grade: 'F', source: 'TEST' });
    await Backlog.create({ studentId: s2Id, subjectId: new mongoose.Types.ObjectId(), semesterId: new mongoose.Types.ObjectId(), resultId: new mongoose.Types.ObjectId(), status: 'ACTIVE' });
  });

  it('Should compute results distribution based on scope (Principal sees 2 fails, CTPO sees 1 fail)', async () => {
    const resP = await request(app).get('/api/v1/analytics/results').set('Authorization', `Bearer ${principalToken}`);
    expect(resP.statusCode).toBe(200);
    const failCountP = resP.body.data.find(d => d._id === 'FAIL').count;
    expect(failCountP).toBe(2); // Sees both students

    const resC = await request(app).get('/api/v1/analytics/results').set('Authorization', `Bearer ${ctpoToken}`);
    expect(resC.statusCode).toBe(200);
    const failCountC = resC.body.data.find(d => d._id === 'FAIL').count;
    expect(failCountC).toBe(1); // Sees only John in Section 1
  });

  it('Should compute campus KPIs dynamically', async () => {
    const resP = await request(app).get('/api/v1/analytics/campus').set('Authorization', `Bearer ${principalToken}`);
    expect(resP.statusCode).toBe(200);
    expect(resP.body.data.totalStudents).toBe(2);
    expect(resP.body.data.totalBacklogs).toBe(2);
  });
});
