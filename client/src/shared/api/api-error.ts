export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

function errorMessageFromBody(body: unknown): string | undefined {
  if (body !== null && typeof body === 'object' && 'error' in body) {
    const candidate = (body as { error: unknown }).error;
    if (typeof candidate === 'string' && candidate.length > 0) {
      return candidate;
    }
  }
  return undefined;
}

export async function parseJsonResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  let body: unknown = null;
  if (text.length > 0) {
    try {
      body = JSON.parse(text) as unknown;
    } catch {
      throw new ApiError(res.status, 'Invalid JSON response', text);
    }
  }

  if (!res.ok) {
    const message = errorMessageFromBody(body) ?? (res.statusText || 'Request failed');
    throw new ApiError(res.status, message, body);
  }

  return body as T;
}
