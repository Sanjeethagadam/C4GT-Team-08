const mongoose = require('mongoose');
const AuditLog = require('../modules/audit/models/AuditLog');
const auditService = require('../modules/audit/services/audit.service');
require('dotenv').config();

describe('AuditLog System', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/academic_engagement_db');
  }, 15000);

  afterAll(async () => {
    await AuditLog.deleteMany({ reason: 'TEST_AUDIT' });
    await mongoose.connection.close();
  });

  it('should successfully log a valid action', async () => {
    const actorId = new mongoose.Types.ObjectId();
    const logData = {
      actor: actorId,
      role: 'CTPO',
      action: 'EXPORT_GENERATED',
      entityType: 'Export',
      reason: 'TEST_AUDIT',
      timestamp: new Date(),
      oldValue: { password: 'secretpassword', sensitive: true }
    };

    const result = await auditService.logAction(logData);
    
    expect(result).toBeDefined();
    expect(result.actor.toString()).toBe(actorId.toString());
    expect(result.action).toBe('EXPORT_GENERATED');
    
    // Validate sanitize function (passwords should be stripped)
    expect(result.oldValue.password).toBeUndefined();
    expect(result.oldValue.sensitive).toBe(true);
  });

  it('should fail validation if action is invalid', async () => {
    const actorId = new mongoose.Types.ObjectId();
    const logData = {
      actor: actorId,
      role: 'CTPO',
      action: 'INVALID_ACTION', // Not in enum
      entityType: 'Test',
      reason: 'TEST_AUDIT'
    };

    const result = await auditService.logAction(logData);
    // Since logAction catches errors, we need to manually try creating
    try {
      await AuditLog.create(logData);
      fail('Should have thrown validation error');
    } catch (err) {
      expect(err.name).toBe('ValidationError');
    }
  });
});
