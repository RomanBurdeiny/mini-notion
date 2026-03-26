import { z } from 'zod';

export const registerBodySchema = z
  .object({
    email: z.string().trim().min(1).max(255).email(),
    password: z.string().min(8).max(128),
    name: z.string().trim().min(1).max(120),
  })
  .strict();

export type RegisterInput = z.infer<typeof registerBodySchema>;

export const loginBodySchema = z
  .object({
    email: z.string().trim().min(1).max(255).email(),
    password: z.string().min(1).max(128),
  })
  .strict();

export type LoginInput = z.infer<typeof loginBodySchema>;
