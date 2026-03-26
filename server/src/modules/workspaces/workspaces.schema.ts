import { z } from 'zod';

export const createWorkspaceBodySchema = z
  .object({
    title: z.string().trim().min(1).max(200),
  })
  .strict();

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceBodySchema>;

export const workspaceIdParamsSchema = z
  .object({
    id: z.string().min(1),
  })
  .strict();
