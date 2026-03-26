import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';
import { z } from 'zod';

export class TokenError extends Error {
  constructor() {
    super('Invalid or expired token');
    this.name = 'TokenError';
  }
}

const payloadSchema = z.object({
  sub: z.string().min(1),
});

export function signAccessToken(options: {
  userId: string;
  secret: string;
  expiresIn: string;
}): string {
  const secret: Secret = options.secret;
  // `jsonwebtoken` typings narrow `expiresIn`; runtime accepts ms-style strings (e.g. "7d", "1h").
  const signOptions = { expiresIn: options.expiresIn } as SignOptions;
  return jwt.sign({ sub: options.userId }, secret, signOptions);
}

export function verifyAccessToken(token: string, secret: string): { userId: string } {
  let decoded: jwt.JwtPayload | string;
  try {
    decoded = jwt.verify(token, secret, { algorithms: ['HS256'] });
  } catch {
    throw new TokenError();
  }

  if (typeof decoded === 'string') {
    throw new TokenError();
  }

  const parsed = payloadSchema.safeParse(decoded);
  if (!parsed.success) {
    throw new TokenError();
  }

  return { userId: parsed.data.sub };
}
