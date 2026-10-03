const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../modules/academic-master/models/User');
const Student = require('../modules/academic-master/models/Student');
const Semester = require('../modules/academic-master/models/Semester');
const CtpoAssignment = require('../modules/examination/models/CtpoAssignment');
const Notification = require('../modules/notifications/models/Notification');
const RiskConfig = require('../modules/results-backlogs/models/RiskConfig');
const riskService = require('../modules/results-backlogs/services/risk.service');
const notificationService = require('../modules/notifications/services/notification.service');
const jwt = require('jsonwebtoken');

describe('Notifications Module', () => {
  let student1Token, student2Token, ctpoToken;
  let student1User, student2User, ctpoUser;
  let student1, student2;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test_secret';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/academic_engagement_db_test_notif');
    }
    
    // Clear old data
    await Notification.deleteMany({});
    await User.deleteMany({});
    await Student.deleteMany({});
    await RiskConfig.deleteMany({});

    // Create Students
    student1 = await Student.create({
      name: 'Notif Student 1',
      rollNo: 'NOTIF001',
      email: 'notif001@example.com',
      gender: 'Male',
      doB: '2000-01-01',
      category: 'General',
      isActive: true,
      branchId: new mongoose.Types.ObjectId(),
      campusId: new mongoose.Types.ObjectId(),
      semesterId: new mongoose.Types.ObjectId(),
      year: 1
    });

    student2 = await Student.create({
      name: 'Notif Student 2',
      rollNo: 'NOTIF002',
      email: 'notif002@example.com',
      gender: 'Female',
      doB: '2000-01-01',
      category: 'General',
      isActive: true,
      branchId: new mongoose.Types.ObjectId(),
      campusId: new mongoose.Types.ObjectId(),
      semesterId: new mongoose.Types.ObjectId(),
      year: 1
    });

    // Create Users
    student1User = await User.create({
      username: 'notif.s1',
      passwordHash: 'hashed',
      role: 'STUDENT',
      scopeRef: { type: 'Student', refId: student1._id }
    });

    student2User = await User.create({
      username: 'notif.s2',
      passwordHash: 'hashed',
      role: 'STUDENT',
      scopeRef: { type: 'Student', refId: student2._id }
    });

    ctpoUser = await User.create({
      username: 'notif.ctpo',
      passwordHash: 'hashed',
      role: 'CTPO',
      scopeRef: { type: 'Campus', refId: student1.campusId } // matching student 1 campus
    });

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
      branchId: student1.branchId,
      campusId: student1.campusId,
      academicYearId: semester.academicYearId,
      assignedBy: new mongoose.Types.ObjectId(),
      sectionId: new mongoose.Types.ObjectId(),
      semesterId: semester._id,
      status: 'ACTIVE'
    });

    // Generate tokens
    student1Token = jwt.sign({ id: student1User._id, role: 'STUDENT' }, process.env.JWT_SECRET);
    student2Token = jwt.sign({ id: student2User._id, role: 'STUDENT' }, process.env.JWT_SECRET);
    ctpoToken = jwt.sign({ id: ctpoUser._id, role: 'CTPO' }, process.env.JWT_SECRET);

    // Setup Risk Config
    await RiskConfig.create({ indicator: 'BACKLOGS', isActive: true, thresholds: { CRITICAL: 5, HIGH: 3, MEDIUM: 2, LOW: 1 } });
  });

  afterAll(async () => {
    await Notification.deleteMany({});
    await User.deleteMany({});
    await Student.deleteMany({});
    await RiskConfig.deleteMany({});
    await Semester.deleteMany({});
    await CtpoAssignment.deleteMany({});
  });

  it('should isolate recipients (Student 1 should not see Student 2 notifications)', async () => {
    await notificationService.createNotification({
      recipientUserId: student2User._id,
      recipientRole: 'STUDENT',
      title: 'Secret Alert',
      message: 'For student 2 only',
      notificationType: 'SYSTEM'
    });

    const res = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${student1Token}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(0);

    const res2 = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${student2Token}`);
    expect(res2.body.data.length).toBe(1);
    expect(res2.body.data[0].title).toBe('Secret Alert');
  });

  it('should return correct unread count', async () => {
    const res = await request(app)
      .get('/api/v1/notifications/unread-count')
      .set('Authorization', `Bearer ${student2Token}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.data.count).toBe(1);
  });

  it('should mark a notification as read', async () => {
    const notifs = await notificationService.getUserNotifications(student2User._id);
    const notifId = notifs[0]._id;

    const res = await request(app)
      .put(`/api/v1/notifications/${notifId}/read`)
      .set('Authorization', `Bearer ${student2Token}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.data.isRead).toBe(true);

    const countRes = await request(app).get('/api/v1/notifications/unread-count').set('Authorization', `Bearer ${student2Token}`);
    expect(countRes.body.data.count).toBe(0);
  });

  it('should mark all notifications as read', async () => {
    await notificationService.createNotification({
      recipientUserId: student1User._id, recipientRole: 'STUDENT', title: 'A1', message: 'M1', notificationType: 'SYSTEM'
    });
    await notificationService.createNotification({
      recipientUserId: student1User._id, recipientRole: 'STUDENT', title: 'A2', message: 'M2', notificationType: 'SYSTEM'
    });

    let countRes = await request(app).get('/api/v1/notifications/unread-count').set('Authorization', `Bearer ${student1Token}`);
    expect(countRes.body.data.count).toBe(2);

    const res = await request(app)
      .put('/api/v1/notifications/mark-all-read')
      .set('Authorization', `Bearer ${student1Token}`);
    
    expect(res.statusCode).toBe(200);

    countRes = await request(app).get('/api/v1/notifications/unread-count').set('Authorization', `Bearer ${student1Token}`);
    expect(countRes.body.data.count).toBe(0);
  });

  it('should trigger Risk notification to Student and CTPO only when transitioning to HIGH or CRITICAL', async () => {
    // 1. Manually set risk to LOW to simulate transition
    const RiskProfile = require('../modules/results-backlogs/models/RiskProfile');
    const academicSemesterId = new mongoose.Types.ObjectId();
    
    await RiskProfile.create({
      studentId: student1._id,
      academicSemesterId,
      riskLevel: 'LOW',
      factors: []
    });

    // 2. Clear old notifications
    await Notification.deleteMany({});

    // 3. Create 3 backlogs for student1 to make it HIGH risk
    const Backlog = require('../modules/results-backlogs/models/Backlog');
    for (let i = 0; i < 3; i++) {
      await Backlog.create({
        studentId: student1._id,
        subjectId: new mongoose.Types.ObjectId(),
        academicSemesterId,
        branchCode: 'CSM',
        status: 'ACTIVE'
      });
    }

    // 4. Calculate Risk
    await riskService.calculateRiskForStudent(student1._id, academicSemesterId);

    // 5. Verify Student 1 got notification
    const stRes = await request(app).get('/api/v1/notifications').set('Authorization', `Bearer ${student1Token}`);
    expect(stRes.body.data.length).toBe(1);
    expect(stRes.body.data[0].notificationType).toBe('RISK');
    expect(stRes.body.data[0].title).toBe('Academic Risk Alert: HIGH');

    // 6. Verify CTPO got notification
    const ctpoRes = await request(app).get('/api/v1/notifications').set('Authorization', `Bearer ${ctpoToken}`);
    expect(ctpoRes.body.data.length).toBe(1);
    
    // 7. Verify Student 2 did NOT get notification
    const st2Res = await request(app).get('/api/v1/notifications').set('Authorization', `Bearer ${student2Token}`);
    expect(st2Res.body.data.length).toBe(0);

    // 8. Calculate risk again without changes (should not duplicate)
    await riskService.calculateRiskForStudent(student1._id, academicSemesterId);
    const ctpoResAfter = await request(app).get('/api/v1/notifications').set('Authorization', `Bearer ${ctpoToken}`);
    expect(ctpoResAfter.body.data.length).toBe(1); // Still 1
  });
});
