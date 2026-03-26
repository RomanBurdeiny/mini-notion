import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../src/app.js';
import { parseEnv } from '../../src/config/env.js';
import { bearer, registerUser } from '../helpers/register-user.js';
import { resetDatabase } from '../helpers/reset-db.js';

const env = parseEnv();
const app = createApp(env);

describe('workspaces API', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('returns 401 without token for list', async () => {
    await request(app).get('/api/workspaces').expect(401);
  });

  it('lists workspaces for owner including default from registration', async () => {
    const { token } = await registerUser(app, 'ws-a');

    const res = await request(app).get('/api/workspaces').set(bearer(token)).expect(200);

    expect(Array.isArray(res.body.workspaces)).toBe(true);
    expect(res.body.workspaces.length).toBeGreaterThanOrEqual(1);
    const titles = res.body.workspaces.map((w: { title: string }) => w.title);
    expect(titles).toContain('My workspace');
  });

  it('creates a workspace', async () => {
    const { token } = await registerUser(app, 'ws-b');

    const res = await request(app)
      .post('/api/workspaces')
      .set(bearer(token))
      .send({ title: 'Side project' })
      .expect(201);

    expect(res.body.workspace.title).toBe('Side project');
    expect(res.body.workspace.ownerId).toBeDefined();
  });

  it('returns 400 on invalid create body', async () => {
    const { token } = await registerUser(app, 'ws-c');

    await request(app)
      .post('/api/workspaces')
      .set(bearer(token))
      .send({ title: '' })
      .expect(400);
  });

  it('gets workspace by id when owner', async () => {
    const { token } = await registerUser(app, 'ws-d');

    const created = await request(app)
      .post('/api/workspaces')
      .set(bearer(token))
      .send({ title: 'Owned' })
      .expect(201);

    const id = created.body.workspace.id;
    if (typeof id !== 'string') {
      throw new Error('expected id');
    }

    const res = await request(app).get(`/api/workspaces/${id}`).set(bearer(token)).expect(200);

    expect(res.body.workspace.id).toBe(id);
    expect(res.body.workspace.title).toBe('Owned');
  });

  it('returns 404 when accessing another user workspace', async () => {
    const u1 = await registerUser(app, 'ws-u1');
    const u2 = await registerUser(app, 'ws-u2');

    const created = await request(app)
      .post('/api/workspaces')
      .set(bearer(u1.token))
      .send({ title: 'Secret' })
      .expect(201);

    const id = created.body.workspace.id;
    if (typeof id !== 'string') {
      throw new Error('expected id');
    }

    await request(app).get(`/api/workspaces/${id}`).set(bearer(u2.token)).expect(404);
  });
});
