import type { Request, Response } from 'express';
import { HttpError } from '../../middlewares/http-error.js';
import {
  createPageBodySchema,
  pageIdParamsSchema,
  pageTreeQuerySchema,
  updatePageBodySchema,
} from './pages.schema.js';
import {
  archivePage,
  createPage,
  getPageById,
  getPageTree,
  restorePage,
  softDeletePage,
  updatePage,
} from './pages.service.js';

export const pagesController = {
  getTree: async (req: Request, res: Response) => {
    if (req.auth === undefined) {
      throw new HttpError(401, 'Unauthorized');
    }
    const query = pageTreeQuerySchema.parse(req.query);
    const tree = await getPageTree(query.workspaceId, req.auth.userId);
    res.status(200).json({ tree });
  },

  getById: async (req: Request, res: Response) => {
    if (req.auth === undefined) {
      throw new HttpError(401, 'Unauthorized');
    }
    const { id } = pageIdParamsSchema.parse(req.params);
    const page = await getPageById(id, req.auth.userId);
    res.status(200).json({ page });
  },

  create: async (req: Request, res: Response) => {
    if (req.auth === undefined) {
      throw new HttpError(401, 'Unauthorized');
    }
    const body = createPageBodySchema.parse(req.body);
    const page = await createPage(req.auth.userId, body);
    res.status(201).json({ page });
  },

  patch: async (req: Request, res: Response) => {
    if (req.auth === undefined) {
      throw new HttpError(401, 'Unauthorized');
    }
    const { id } = pageIdParamsSchema.parse(req.params);
    const body = updatePageBodySchema.parse(req.body);
    const page = await updatePage(id, req.auth.userId, body);
    res.status(200).json({ page });
  },

  archive: async (req: Request, res: Response) => {
    if (req.auth === undefined) {
      throw new HttpError(401, 'Unauthorized');
    }
    const { id } = pageIdParamsSchema.parse(req.params);
    const page = await archivePage(id, req.auth.userId);
    res.status(200).json({ page });
  },

  restore: async (req: Request, res: Response) => {
    if (req.auth === undefined) {
      throw new HttpError(401, 'Unauthorized');
    }
    const { id } = pageIdParamsSchema.parse(req.params);
    const page = await restorePage(id, req.auth.userId);
    res.status(200).json({ page });
  },

  remove: async (req: Request, res: Response) => {
    if (req.auth === undefined) {
      throw new HttpError(401, 'Unauthorized');
    }
    const { id } = pageIdParamsSchema.parse(req.params);
    const page = await softDeletePage(id, req.auth.userId);
    res.status(200).json({ page });
  },
};
