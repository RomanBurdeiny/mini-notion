import type { Express } from 'express';
import { authRouter } from './auth/auth.routes.js';
import { healthRouter } from './health/health.routes.js';

export function registerRoutes(app: Express) {
  app.use('/api/health', healthRouter);
  app.use('/api/auth', authRouter);
}
