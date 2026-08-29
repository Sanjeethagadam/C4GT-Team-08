const request = require('supertest');
const app = require('../app');
const db = require('./setup');
const Campus = require('../modules/academic-master/models/Campus');
const User = require('../modules/academic-master/models/User');

beforeAll(async () => await db.connect());
afterEach(async () => await db.clearDatabase());
afterAll(async () => await db.closeDatabase());

describe('Campus API', () => {
  let adminToken;
  beforeEach(async () => {
    const admin = await User.create({ username: 'admin', passwordHash: 'pwd', role: 'ADMIN' });
    adminToken = (await request(app).post('/api/v1/academic-master/auth/login').send({ username: 'admin', password: 'pwd' })).body.data.token;
  });

  it('should create a new campus', async () => {
    const res = await request(app)
      .post('/api/v1/academic-master/campuses')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'KIET Main Campus',
        code: 'KIET',
        status: 'ACTIVE'
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBeTruthy();
    expect(res.body.data.name).toEqual('KIET Main Campus');
  });

  it('should get all campuses', async () => {
    await Campus.create({ name: 'KIET+', code: 'KIETP' });
    const res = await request(app)
      .get('/api/v1/academic-master/campuses')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.data.length).toBe(1);
  });
});
