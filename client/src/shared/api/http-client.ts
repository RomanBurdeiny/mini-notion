import { apiUrl } from '../config/env';
import { tokenStorage } from '../lib/token-storage';
import { parseJsonResponse } from './api-error';

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

export type HttpOptions = Omit<RequestInit, 'body' | 'method'> & {
  method?: HttpMethod;
  body?: unknown;
  skipAuth?: boolean;
};

export async function httpJson<T>(path: string, options: HttpOptions = {}): Promise<T> {
  const { body, skipAuth, method = 'GET', headers: initHeaders, ...rest } = options;
  const headers = new Headers(initHeaders);

  if (body !== undefined && !(body instanceof FormData)) {
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
  }

  if (!skipAuth) {
    const token = tokenStorage.get();
    if (token !== null && token.length > 0) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const url = apiUrl(path);
  const res = await fetch(url, {
    ...rest,
    method,
    headers,
    body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
  });

  return parseJsonResponse<T>(res);
}
