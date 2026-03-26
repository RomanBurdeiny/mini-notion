import { z } from 'zod';

const stringFromQuery = z.preprocess((val) => {
  if (typeof val === 'string') {
    return val;
  }
  if (Array.isArray(val) && typeof val[0] === 'string') {
    return val[0];
  }
  return val;
}, z.string().min(1));

export const pageTreeQuerySchema = z
  .object({
    workspaceId: stringFromQuery,
  })
  .strict();

export type PageTreeQuery = z.infer<typeof pageTreeQuerySchema>;

export const pageIdParamsSchema = z
  .object({
    id: z.string().min(1),
  })
  .strict();

export const createPageBodySchema = z
  .object({
    workspaceId: z.string().min(1),
    title: z.string().trim().min(1).max(500),
    content: z.string().max(1_000_000).optional().default(''),
    icon: z.string().max(64).nullable().optional(),
    parentPageId: z.string().min(1).nullable().optional(),
  })
  .strict();

export type CreatePageInput = z.infer<typeof createPageBodySchema>;

export const updatePageBodySchema = z
  .object({
    title: z.string().trim().min(1).max(500).optional(),
    content: z.string().max(1_000_000).optional(),
    icon: z.string().max(64).nullable().optional(),
    parentPageId: z.string().min(1).nullable().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export type UpdatePageInput = z.infer<typeof updatePageBodySchema>;
