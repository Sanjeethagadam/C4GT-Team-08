const request = require('supertest');
const app = require('../app');
const db = require('./setup');
const User = require('../modules/academic-master/models/User');
const Student = require('../modules/academic-master/models/Student');
const Backlog = require('../modules/results-backlogs/models/Backlog');
const Result = require('../modules/results-backlogs/models/Result');
const RemedialClass = require('../modules/academic-support/models/RemedialClass');
const Notification = require('../modules/academic-support/models/Notification');
const mongoose = require('mongoose');

beforeAll(async () => await db.connect());
afterEach(async () => await db.clearDatabase());
afterAll(async () => await db.closeDatabase());

describe('Academic Support Module API', () => {
  let coordToken, adminToken, student1Id, student2Id, subjectId, rClassId;

  beforeEach(async () => {
    // Users & Tokens
    const admin = await User.create({ username: 'admin_support', passwordHash: 'pwd', role: 'ADMIN' });
    const coord = await User.create({ username: 'coord_support', passwordHash: 'pwd', role: 'COORDINATOR' });
    adminToken = (await request(app).post('/api/v1/academic-master/auth/login').send({ username: 'admin_support', password: 'pwd' })).body.data.token;
    coordToken = (await request(app).post('/api/v1/academic-master/auth/login').send({ username: 'coord_support', password: 'pwd' })).body.data.token;

    subjectId = new mongoose.Types.ObjectId();
    
    // Students
    const s1 = await Student.create({
      rollNo: 'SUPP101', name: 'John', campusId: new mongoose.Types.ObjectId(), branchId: new mongoose.Types.ObjectId(), 
      year: 1, semesterId: new mongoose.Types.ObjectId(), sectionId: new mongoose.Types.ObjectId()
    });
    student1Id = s1._id;

    const s2 = await Student.create({
      rollNo: 'SUPP102', name: 'Jane', campusId: new mongoose.Types.ObjectId(), branchId: new mongoose.Types.ObjectId(), 
      year: 1, semesterId: new mongoose.Types.ObjectId(), sectionId: new mongoose.Types.ObjectId()
    });
    student2Id = s2._id;

    // Create Backlog for Student 1 (simulate processResult by creating manually for test isolated scope, or trigger the route)
    // We will trigger the result route to test the Backlog Notification hook!
    await request(app)
      .post('/api/v1/results-backlogs/results')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ studentId: student1Id.toString(), subjectId: subjectId.toString(), semesterId: new mongoose.Types.ObjectId().toString(), resultStatus: 'FAIL', grade: 'F', source: 'JNTUK' });

    // Create Remedial Class
    const rc = await RemedialClass.create({
      subjectId, campusId: new mongoose.Types.ObjectId(), branchId: new mongoose.Types.ObjectId(), 
      year: 1, coordinatorId: coord._id, schedule: 'Mondays 4PM'
    });
    rClassId = rc._id;
  });

  it('Should send a notification when a backlog is generated', async () => {
    const notifications = await Notification.find({ recipientStudentId: student1Id, notificationType: 'BACKLOG' });
    expect(notifications.length).toBe(1);
    expect(notifications[0].message).toContain('new Backlog');
  });

  it('Should block Remedial assignment if student has no ACTIVE backlog for the subject', async () => {
    // Student 2 has no backlog
    const res = await request(app)
      .post('/api/v1/academic-support/remedialstudents')
      .set('Authorization', `Bearer ${coordToken}`)
      .send({ remedialClassId: rClassId.toString(), studentId: student2Id.toString() });
    
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain('Ineligible');
  });

  it('Should allow Remedial assignment if student has an ACTIVE backlog and send Notification', async () => {
    // Student 1 has a backlog
    const res = await request(app)
      .post('/api/v1/academic-support/remedialstudents')
      .set('Authorization', `Bearer ${coordToken}`)
      .send({ remedialClassId: rClassId.toString(), studentId: student1Id.toString() });
    
    expect(res.statusCode).toBe(201);

    // Verify Notification
    const notifications = await Notification.find({ recipientStudentId: student1Id, notificationType: 'REMEDIAL' });
    expect(notifications.length).toBe(1);
  });
});
