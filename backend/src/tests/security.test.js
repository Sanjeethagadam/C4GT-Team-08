process.env.TEST_RATE_LIMIT = 'true';
const request = require('supertest');
const app = require('../app');
const db = require('./setup');
const User = require('../modules/academic-master/models/User');
const AuditLog = require('../modules/audit/models/AuditLog');
const RiskThreshold = require('../modules/results-backlogs/models/RiskThreshold');
const mongoose = require('mongoose');

beforeAll(async () => await db.connect());
afterEach(async () => await db.clearDatabase());
afterAll(async () => await db.closeDatabase());

describe('Security Hardening & Phase 12 Tests', () => {
  let ipCounter = 1;
  let adminToken;
  beforeEach(async () => {
    ipCounter++;
    await User.create({ username: 'admin_sec', passwordHash: 'pwd', role: 'ADMIN' });
    const res = await request(app).post('/api/v1/academic-master/auth/login')
      .set('X-Forwarded-For', `10.0.0.${ipCounter}`)
      .send({ username: 'admin_sec', password: 'pwd' });
    if (!res.body.data) console.error("Login failed in beforeEach:", res.body);
    adminToken = res.body.data.accessToken || res.body.data.token;
  });

  describe('1. Rate Limiting', () => {
    it('Should block excessively frequent login requests (429)', async () => {
      // 5 allowed attempts
      for (let i = 0; i < 5; i++) {
        await request(app).post('/api/v1/academic-master/auth/login')
          .set('X-Forwarded-For', '192.168.1.100')
          .send({ username: 'fake', password: 'pwd' });
      }
      
      const res = await request(app).post('/api/v1/academic-master/auth/login')
        .set('X-Forwarded-For', '192.168.1.100')
        .send({ username: 'fake', password: 'pwd' });
      expect(res.statusCode).toBe(429);
      expect(res.text).toContain('Too many login attempts');
    });
  });

  describe('2. Input Sanitization & Validation', () => {
    it('Should strip NoSQL injection payloads ($) and fail validation naturally', async () => {
      const res = await request(app).post('/api/v1/academic-master/auth/login')
        .set('X-Forwarded-For', '10.0.0.2')
        .send({ 
          username: { '$gt': '' }, 
          password: 'pwd' 
        });
      // The $gt becomes gt, resulting in { gt: '' } instead of a string, so validation fails
      expect(res.statusCode).not.toBe(200); 
    });

    it('Should block unexpected extra fields from being sent to endpoints (Strict Validation)', async () => {
      const res = await request(app)
        .post('/api/v1/academic-master/campuses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Campus 1', code: 'C1', malicious_field: 'delete_all' });
      
      if (res.statusCode !== 400) console.error("Validation Test Failed:", res.body);
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('Unexpected fields detected');
      expect(res.body.message).toContain('malicious_field');
    });
  });

  describe('3. Account Lockout', () => {
    it('Should lock account after 5 failed attempts', async () => {
      await User.create({ username: 'target', passwordHash: 'pwd1', role: 'STUDENT' });
      
      for (let i = 0; i < 5; i++) {
        await request(app).post('/api/v1/academic-master/auth/login')
          .set('X-Forwarded-For', `10.0.0.${i + 10}`) // bypass rate limit per IP
          .send({ username: 'target', password: 'wrong' });
      }

      // 6th attempt should return 403 Forbidden because it is locked (not 401 Invalid Creds)
      const res = await request(app).post('/api/v1/academic-master/auth/login')
        .set('X-Forwarded-For', `10.0.0.20`)
        .send({ username: 'target', password: 'wrong' });
      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain('Account locked');
    });
  });

  describe('4. Audit Logging', () => {
    it('Should automatically generate an AuditLog entry when a sensitive model is created', async () => {
      const res = await request(app)
        .post('/api/v1/results-backlogs/risk-thresholds')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ key: 'TEST_THRESH', value: 10 });
      
      if (res.statusCode !== 201) console.error("Audit Test Failed:", res.body);
      expect(res.statusCode).toBe(201);

      // Verify Audit Log
      const logs = await AuditLog.find();
      expect(logs.length).toBe(1);
      expect(['CREATE', 'UPDATE']).toContain(logs[0].action);
      expect(logs[0].resourceType).toBe('RiskThreshold');
      expect(logs[0].afterValue.key).toBe('TEST_THRESH');
    });
  });
});
