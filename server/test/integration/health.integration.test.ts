import request from 'supertest';
import { createApp } from '../../src/app.js';
import { parseEnv } from '../../src/config/env.js';

describe('GET /api/health', () => {
  const env = parseEnv();
  const app = createApp(env);

  it('responds with 200 and payload', async () => {
    const res = await request(app).get('/api/health').expect(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
