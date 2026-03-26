import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../src/app.js';
import { parseEnv } from '../../src/config/env.js';
import { bearer, registerUser } from '../helpers/register-user.js';
import { resetDatabase } from '../helpers/reset-db.js';

const env = parseEnv();
const app = createApp(env);

function readPageId(res: { body: { page?: { id?: unknown } } }): string {
  const id = res.body.page?.id;
  if (typeof id !== 'string') {
    throw new Error('expected page id');
  }
  return id;
}

async function extraWorkspaceId(token: string, title: string): Promise<string> {
  const res = await request(app)
    .post('/api/workspaces')
    .set(bearer(token))
    .send({ title })
    .expect(201);
  const id = res.body.workspace?.id;
  if (typeof id !== 'string') {
    throw new Error('workspace id');
  }
  return id;
}

describe('pages API', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('requires auth for tree', async () => {
    await request(app).get('/api/pages/tree').query({ workspaceId: 'x' }).expect(401);
  });

  it('returns 400 when workspaceId is missing', async () => {
    const { token } = await registerUser(app, 'pg-q');
    await request(app).get('/api/pages/tree').set(bearer(token)).expect(400);
  });

  it('returns tree with nested pages', async () => {
    const { token } = await registerUser(app, 'pg-tree');
    const wsId = await extraWorkspaceId(token, 'Tree WS');

    const parent = await request(app)
      .post('/api/pages')
      .set(bearer(token))
      .send({ workspaceId: wsId, title: 'Root' })
      .expect(201);

    const parentId = readPageId(parent);

    await request(app)
      .post('/api/pages')
      .set(bearer(token))
      .send({ workspaceId: wsId, title: 'Child', parentPageId: parentId })
      .expect(201);

    const res = await request(app)
      .get('/api/pages/tree')
      .query({ workspaceId: wsId })
      .set(bearer(token))
      .expect(200);

    expect(res.body.tree).toHaveLength(1);
    expect(res.body.tree[0].title).toBe('Root');
    expect(res.body.tree[0].children).toHaveLength(1);
    expect(res.body.tree[0].children[0].title).toBe('Child');
  });

  it('excludes archived pages from tree', async () => {
    const { token } = await registerUser(app, 'pg-arch');
    const wsId = await extraWorkspaceId(token, 'Arch WS');

    const a = await request(app)
      .post('/api/pages')
      .set(bearer(token))
      .send({ workspaceId: wsId, title: 'A' })
      .expect(201);
    const aId = readPageId(a);

    const b = await request(app)
      .post('/api/pages')
      .set(bearer(token))
      .send({ workspaceId: wsId, title: 'B', parentPageId: aId })
      .expect(201);
    const bId = readPageId(b);

    await request(app).patch(`/api/pages/${bId}/archive`).set(bearer(token)).expect(200);

    const res = await request(app)
      .get('/api/pages/tree')
      .query({ workspaceId: wsId })
      .set(bearer(token))
      .expect(200);

    expect(res.body.tree).toHaveLength(1);
    expect(res.body.tree[0].children).toHaveLength(0);
  });

  it('blocks foreign workspace tree', async () => {
    const u1 = await registerUser(app, 'pg-f1');
    const u2 = await registerUser(app, 'pg-f2');
    const wsId = await extraWorkspaceId(u1.token, 'Foreign');

    await request(app)
      .get('/api/pages/tree')
      .query({ workspaceId: wsId })
      .set(bearer(u2.token))
      .expect(404);
  });

  it('creates page and fetches by id', async () => {
    const { token } = await registerUser(app, 'pg-get');
    const wsId = await extraWorkspaceId(token, 'Get WS');

    const created = await request(app)
      .post('/api/pages')
      .set(bearer(token))
      .send({ workspaceId: wsId, title: 'Doc', content: 'hello' })
      .expect(201);

    const id = readPageId(created);

    const res = await request(app).get(`/api/pages/${id}`).set(bearer(token)).expect(200);
    expect(res.body.page.title).toBe('Doc');
    expect(res.body.page.content).toBe('hello');
  });

  it('returns 404 for other users page', async () => {
    const u1 = await registerUser(app, 'pg-x1');
    const u2 = await registerUser(app, 'pg-x2');
    const ws = await extraWorkspaceId(u1.token, 'Iso');

    const created = await request(app)
      .post('/api/pages')
      .set(bearer(u1.token))
      .send({ workspaceId: ws, title: 'Private' })
      .expect(201);

    const id = readPageId(created);
    await request(app).get(`/api/pages/${id}`).set(bearer(u2.token)).expect(404);
  });

  it('returns 404 when parent belongs to another workspace', async () => {
    const { token } = await registerUser(app, 'pg-badpar');
    const ws1 = await extraWorkspaceId(token, 'WS1');
    const ws2 = await extraWorkspaceId(token, 'WS2');

    const p = await request(app)
      .post('/api/pages')
      .set(bearer(token))
      .send({ workspaceId: ws1, title: 'P' })
      .expect(201);
    const pId = readPageId(p);

    await request(app)
      .post('/api/pages')
      .set(bearer(token))
      .send({ workspaceId: ws2, title: 'Bad', parentPageId: pId })
      .expect(404);
  });

  it('patches page fields', async () => {
    const { token } = await registerUser(app, 'pg-patch');
    const wsId = await extraWorkspaceId(token, 'Patch WS');

    const created = await request(app)
      .post('/api/pages')
      .set(bearer(token))
      .send({ workspaceId: wsId, title: 'T1' })
      .expect(201);
    const id = readPageId(created);

    const res = await request(app)
      .patch(`/api/pages/${id}`)
      .set(bearer(token))
      .send({ title: 'T2', icon: '📌' })
      .expect(200);

    expect(res.body.page.title).toBe('T2');
    expect(res.body.page.icon).toBe('📌');
  });

  it('returns 400 for empty patch body', async () => {
    const { token } = await registerUser(app, 'pg-empt');
    const wsId = await extraWorkspaceId(token, 'Emp');

    const created = await request(app)
      .post('/api/pages')
      .set(bearer(token))
      .send({ workspaceId: wsId, title: 'E' })
      .expect(201);
    const id = readPageId(created);

    await request(app).patch(`/api/pages/${id}`).set(bearer(token)).send({}).expect(400);
  });

  it('rejects parent cycle on update', async () => {
    const { token } = await registerUser(app, 'pg-cycle');
    const wsId = await extraWorkspaceId(token, 'Cycle');

    const a = await request(app)
      .post('/api/pages')
      .set(bearer(token))
      .send({ workspaceId: wsId, title: 'A' })
      .expect(201);
    const aId = readPageId(a);

    const b = await request(app)
      .post('/api/pages')
      .set(bearer(token))
      .send({ workspaceId: wsId, title: 'B', parentPageId: aId })
      .expect(201);
    const bId = readPageId(b);

    await request(app)
      .patch(`/api/pages/${aId}`)
      .set(bearer(token))
      .send({ parentPageId: bId })
      .expect(400);
  });

  it('archive and restore flow', async () => {
    const { token } = await registerUser(app, 'pg-rs');
    const wsId = await extraWorkspaceId(token, 'RS');

    const created = await request(app)
      .post('/api/pages')
      .set(bearer(token))
      .send({ workspaceId: wsId, title: 'Fold' })
      .expect(201);
    const id = readPageId(created);

    const archived = await request(app)
      .patch(`/api/pages/${id}/archive`)
      .set(bearer(token))
      .expect(200);
    expect(archived.body.page.isArchived).toBe(true);

    const treeArchived = await request(app)
      .get('/api/pages/tree')
      .query({ workspaceId: wsId })
      .set(bearer(token))
      .expect(200);
    expect(treeArchived.body.tree).toHaveLength(0);

    const restored = await request(app)
      .patch(`/api/pages/${id}/restore`)
      .set(bearer(token))
      .expect(200);
    expect(restored.body.page.isArchived).toBe(false);

    const treeOk = await request(app)
      .get('/api/pages/tree')
      .query({ workspaceId: wsId })
      .set(bearer(token))
      .expect(200);
    expect(treeOk.body.tree).toHaveLength(1);
  });

  it('returns 400 when restore on active page', async () => {
    const { token } = await registerUser(app, 'pg-r400');
    const wsId = await extraWorkspaceId(token, 'R400');

    const created = await request(app)
      .post('/api/pages')
      .set(bearer(token))
      .send({ workspaceId: wsId, title: 'Active' })
      .expect(201);
    const id = readPageId(created);

    await request(app).patch(`/api/pages/${id}/restore`).set(bearer(token)).expect(400);
  });

  it('delete performs soft delete', async () => {
    const { token } = await registerUser(app, 'pg-del');
    const wsId = await extraWorkspaceId(token, 'Del');

    const created = await request(app)
      .post('/api/pages')
      .set(bearer(token))
      .send({ workspaceId: wsId, title: 'Gone' })
      .expect(201);
    const id = readPageId(created);

    const del = await request(app).delete(`/api/pages/${id}`).set(bearer(token)).expect(200);
    expect(del.body.page.isArchived).toBe(true);
  });

  it('returns search results for owned pages', async () => {
    const { token } = await registerUser(app, 'pg-search');
    const wsId = await extraWorkspaceId(token, 'Search WS');

    await request(app)
      .post('/api/pages')
      .set(bearer(token))
      .send({ workspaceId: wsId, title: 'UniqueAlphaTitle', content: 'beta content' })
      .expect(201);

    const res = await request(app)
      .get('/api/pages/search')
      .query({ q: 'UniqueAlpha' })
      .set(bearer(token))
      .expect(200);

    expect(Array.isArray(res.body.results)).toBe(true);
    expect(res.body.results.length).toBeGreaterThanOrEqual(1);
    const titles = res.body.results.map((p: { title: string }) => p.title);
    expect(titles).toContain('UniqueAlphaTitle');
  });
});
