import type { Express } from 'express';
import { authRouter } from './auth/auth.routes.js';
import { healthRouter } from './health/health.routes.js';
import { pagesRouter } from './pages/pages.routes.js';
import { workspacesRouter } from './workspaces/workspaces.routes.js';

export function registerRoutes(app: Express) {
  app.use('/api/health', healthRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/workspaces', workspacesRouter);
  app.use('/api/pages', pagesRouter);
}
