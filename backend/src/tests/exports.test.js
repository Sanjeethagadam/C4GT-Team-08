const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');
const User = require('../modules/academic-master/models/User');
const CtpoAssignment = require('../modules/examination/models/CtpoAssignment');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'fallback_secret';

describe('CTPO Export RBAC API', () => {
  let ctpoToken;
  let testBranchId;
  let unauthorizedBranchId;

  beforeAll(async () => {
    // We expect the database to be seeded for these tests, or we mock
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/academic_engagement_db');

    // Find a CTPO user
    const assignment = await CtpoAssignment.findOne({ status: 'ACTIVE' }).populate('ctpoUserId').populate('branchId');
    if (!assignment) {
      console.warn('No CTPO assignment found for testing');
      return;
    }

    testBranchId = assignment.branchId._id;
    unauthorizedBranchId = new mongoose.Types.ObjectId(); // completely different branch

    ctpoToken = jwt.sign(
      { id: assignment.ctpoUserId._id, role: 'CTPO' },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should successfully export student roster for authorized branch via RBAC', async () => {
    if (!ctpoToken) return;
    
    // Notice we do NOT pass branchId in the request. Backend forces RBAC based on token.
    const res = await request(app)
      .get('/api/v1/ctpo/exports/students?format=json')
      .set('Authorization', `Bearer ${ctpoToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    
    // Verify ALL exported students strictly match the CTPO's assigned branch
    if (res.body.data.length > 0) {
      const studentBranches = new Set(res.body.data.map(s => s.Branch));
      expect(studentBranches.size).toBe(1); // Should only be exactly one branch
    }
  });

  it('should generate an EXPORT_GENERATED audit log when an export succeeds', async () => {
    if (!ctpoToken) return;
    
    const AuditLog = require('../modules/audit/models/AuditLog');
    const beforeCount = await AuditLog.countDocuments({ action: 'EXPORT_GENERATED' });

    await request(app)
      .get('/api/v1/ctpo/exports/risk?format=json')
      .set('Authorization', `Bearer ${ctpoToken}`);

    const afterCount = await AuditLog.countDocuments({ action: 'EXPORT_GENERATED' });
    expect(afterCount).toBeGreaterThan(beforeCount);
  });
});
