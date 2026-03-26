import { Router } from 'express';
import { asyncHandler } from '../../utils/async-handler.js';
import { requireAuth } from '../auth/auth.middleware.js';
import { workspacesController } from './workspaces.controller.js';

export const workspacesRouter = Router();

workspacesRouter.use(requireAuth);

workspacesRouter.get('/', asyncHandler(workspacesController.list));
workspacesRouter.post('/', asyncHandler(workspacesController.create));
workspacesRouter.get('/:id', asyncHandler(workspacesController.getById));
