import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { parseEnv } from '../../config/env.js';
import { HttpError } from '../../middlewares/http-error.js';
import { TokenError, verifyAccessToken } from './token.js';

function extractBearerToken(header: string | undefined): string | undefined {
  if (header === undefined || header.length === 0) {
    return undefined;
  }
  const prefix = 'Bearer ';
  if (!header.startsWith(prefix)) {
    return undefined;
  }
  const token = header.slice(prefix.length).trim();
  return token.length > 0 ? token : undefined;
}

export const requireAuth: RequestHandler = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const token = extractBearerToken(req.headers.authorization);
  if (token === undefined) {
    next(new HttpError(401, 'Unauthorized'));
    return;
  }

  try {
    const env = parseEnv();
    const { userId } = verifyAccessToken(token, env.JWT_SECRET);
    req.auth = { userId };
    next();
  } catch (e) {
    if (e instanceof TokenError) {
      next(new HttpError(401, 'Unauthorized'));
      return;
    }
    next(e);
  }
};
