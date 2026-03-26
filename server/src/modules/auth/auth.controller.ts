import type { Request, Response } from 'express';
import { parseEnv } from '../../config/env.js';
import { HttpError } from '../../middlewares/http-error.js';
import { loginBodySchema, registerBodySchema } from './auth.schema.js';
import { getUserById, loginUser, registerUser } from './auth.service.js';

export const authController = {
  register: async (req: Request, res: Response) => {
    const body = registerBodySchema.parse(req.body);
    const env = parseEnv();
    const result = await registerUser(body, {
      JWT_SECRET: env.JWT_SECRET,
      JWT_EXPIRES_IN: env.JWT_EXPIRES_IN,
    });
    res.status(201).json(result);
  },

  login: async (req: Request, res: Response) => {
    const body = loginBodySchema.parse(req.body);
    const env = parseEnv();
    const result = await loginUser(body, {
      JWT_SECRET: env.JWT_SECRET,
      JWT_EXPIRES_IN: env.JWT_EXPIRES_IN,
    });
    res.status(200).json(result);
  },

  me: async (req: Request, res: Response) => {
    if (req.auth === undefined) {
      throw new HttpError(401, 'Unauthorized');
    }
    const { userId } = req.auth;
    const user = await getUserById(userId);
    res.status(200).json({ user });
  },
};
