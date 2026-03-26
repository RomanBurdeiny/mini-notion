import { Router } from 'express';
import { asyncHandler } from '../../utils/async-handler.js';
import { requireAuth } from '../auth/auth.middleware.js';
import { pagesController } from './pages.controller.js';

export const pagesRouter = Router();

pagesRouter.use(requireAuth);

pagesRouter.get('/search', asyncHandler(pagesController.search));
pagesRouter.get('/tree', asyncHandler(pagesController.getTree));
pagesRouter.post('/', asyncHandler(pagesController.create));
pagesRouter.get('/:id', asyncHandler(pagesController.getById));
pagesRouter.patch('/:id/archive', asyncHandler(pagesController.archive));
pagesRouter.patch('/:id/restore', asyncHandler(pagesController.restore));
pagesRouter.patch('/:id', asyncHandler(pagesController.patch));
pagesRouter.delete('/:id', asyncHandler(pagesController.remove));
