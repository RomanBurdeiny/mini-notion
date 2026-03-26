import type { User } from '@entities/user/model/types';
import { httpJson } from '@shared/api/http-client';

export type AuthResponse = {
  accessToken: string;
  user: User;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = LoginPayload & {
  name: string;
};

export async function loginRequest(payload: LoginPayload): Promise<AuthResponse> {
  return httpJson<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: payload,
    skipAuth: true,
  });
}

export async function registerRequest(payload: RegisterPayload): Promise<AuthResponse> {
  return httpJson<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: payload,
    skipAuth: true,
  });
}

export async function meRequest(): Promise<{ user: User }> {
  return httpJson<{ user: User }>('/api/auth/me', { method: 'GET' });
}
