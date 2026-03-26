import type { Request, Response } from 'express';
import { HttpError } from '../../middlewares/http-error.js';
import { createWorkspaceBodySchema, workspaceIdParamsSchema } from './workspaces.schema.js';
import { createWorkspace, getWorkspaceById, listWorkspaces } from './workspaces.service.js';

export const workspacesController = {
  list: async (req: Request, res: Response) => {
    if (req.auth === undefined) {
      throw new HttpError(401, 'Unauthorized');
    }
    const workspaces = await listWorkspaces(req.auth.userId);
    res.status(200).json({ workspaces });
  },

  getById: async (req: Request, res: Response) => {
    if (req.auth === undefined) {
      throw new HttpError(401, 'Unauthorized');
    }
    const { id } = workspaceIdParamsSchema.parse(req.params);
    const workspace = await getWorkspaceById(id, req.auth.userId);
    res.status(200).json({ workspace });
  },

  create: async (req: Request, res: Response) => {
    if (req.auth === undefined) {
      throw new HttpError(401, 'Unauthorized');
    }
    const body = createWorkspaceBodySchema.parse(req.body);
    const workspace = await createWorkspace(req.auth.userId, body);
    res.status(201).json({ workspace });
  },
};
