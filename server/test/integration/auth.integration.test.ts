import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../src/app.js';
import { prisma } from '../../src/config/db.js';
import { parseEnv } from '../../src/config/env.js';
import { resetDatabase } from '../helpers/reset-db.js';

const env = parseEnv();
const app = createApp(env);

describe('auth API', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  describe('POST /api/auth/register', () => {
    it('creates user, default workspace, returns token and user', async () => {
      const payload = {
        email: 'new-user@example.com',
        password: 'password123',
        name: 'Ada',
      };

      const res = await request(app).post('/api/auth/register').send(payload).expect(201);

      expect(typeof res.body.accessToken).toBe('string');
      expect(res.body.accessToken.length).toBeGreaterThan(10);
      expect(res.body.user).toMatchObject({
        email: 'new-user@example.com',
        name: 'Ada',
      });
      expect(res.body.user.id).toBeDefined();
      expect(res.body.user.passwordHash).toBeUndefined();

      const workspaces = await prisma.workspace.findMany({ where: { ownerId: res.body.user.id } });
      expect(workspaces).toHaveLength(1);
      expect(workspaces[0].title).toBe('My workspace');
    });

    it('returns 409 when email already exists', async () => {
      const payload = {
        email: 'DUPLICATE@example.com',
        password: 'password123',
        name: 'First',
      };

      await request(app).post('/api/auth/register').send(payload).expect(201);

      const dup = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'different123',
          name: 'Second',
        })
        .expect(409);

      expect(dup.body.error).toBe('Email already in use');
    });

    it('returns 400 for invalid payload', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'not-email', password: 'short', name: '' })
        .expect(400);

      expect(res.body.error).toBe('Validation failed');
    });

    it('returns 400 when extra fields are present', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'clean@example.com',
          password: 'password123',
          name: 'Ada',
          isAdmin: true,
        })
        .expect(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('returns token for valid credentials', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ email: 'login@example.com', password: 'password123', name: 'Bob' })
        .expect(201);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'login@example.com', password: 'password123' })
        .expect(200);

      expect(typeof res.body.accessToken).toBe('string');
      expect(res.body.user.email).toBe('login@example.com');
    });

    it('returns 401 for invalid credentials', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ email: 'foo@example.com', password: 'password123', name: 'Foo' })
        .expect(201);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'foo@example.com', password: 'wrong-password' })
        .expect(401);

      expect(res.body.error).toBe('Invalid email or password');
    });

    it('returns 401 for unknown email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'missing@example.com', password: 'password123' })
        .expect(401);

      expect(res.body.error).toBe('Invalid email or password');
    });

    it('returns 400 for invalid payload', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'not-email', password: '' })
        .expect(400);
      expect(res.body.error).toBe('Validation failed');
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns current user when token is valid', async () => {
      const created = await request(app)
        .post('/api/auth/register')
        .send({ email: 'me@example.com', password: 'password123', name: 'Me' })
        .expect(201);

      const token = created.body.accessToken;
      if (typeof token !== 'string') {
        throw new Error('expected accessToken string');
      }

      const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`).expect(200);

      expect(res.body.user).toMatchObject({
        email: 'me@example.com',
        name: 'Me',
      });
    });

    it('returns 401 without token', async () => {
      const res = await request(app).get('/api/auth/me').expect(401);
      expect(res.body.error).toBe('Unauthorized');
    });

    it('returns 401 for malformed Authorization header', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Basic abc')
        .expect(401);
      expect(res.body.error).toBe('Unauthorized');
    });

    it('returns 401 for invalid JWT', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer not-a-real-token')
        .expect(401);
      expect(res.body.error).toBe('Unauthorized');
    });
  });
});
