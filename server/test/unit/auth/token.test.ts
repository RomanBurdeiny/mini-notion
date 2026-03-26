import { describe, expect, it } from 'vitest';
import { signAccessToken, TokenError, verifyAccessToken } from '../../../src/modules/auth/token.js';

describe('token utils', () => {
  const secret = 'unit-test-secret-at-least-32-chars-long';
  const userId = 'user_123';

  it('signs and verifies an access token', () => {
    const token = signAccessToken({
      userId,
      secret,
      expiresIn: '1h',
    });

    const result = verifyAccessToken(token, secret);
    expect(result.userId).toBe(userId);
  });

  it('throws TokenError when secret mismatches', () => {
    const token = signAccessToken({
      userId,
      secret,
      expiresIn: '1h',
    });

    expect(() => verifyAccessToken(token, 'wrong-secret-that-is-also-long-enough')).toThrow(TokenError);
  });

  it('throws TokenError for malformed token', () => {
    expect(() => verifyAccessToken('not-a-jwt', secret)).toThrow(TokenError);
  });
});
