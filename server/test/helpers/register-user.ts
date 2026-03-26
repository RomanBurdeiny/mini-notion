import request from 'supertest';
import type { Express } from 'express';

export type RegisteredUser = {
  token: string;
  userId: string;
};

export async function registerUser(app: Express, key: string): Promise<RegisteredUser> {
  const res = await request(app)
    .post('/api/auth/register')
    .send({
      email: `user-${key}@example.com`,
      password: 'password123',
      name: 'Tester',
    });

  if (res.status !== 201) {
    throw new Error(`register failed: ${res.status}`);
  }

  const token = res.body.accessToken;
  const userId = res.body.user?.id;
  if (typeof token !== 'string' || typeof userId !== 'string') {
    throw new Error('invalid register response');
  }

  return { token, userId };
}

export function bearer(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
}
