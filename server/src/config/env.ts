import { config as loadDotenv } from 'dotenv';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().optional(),
  JWT_SECRET: z.string().optional(),
  JWT_EXPIRES_IN: z.string().default('7d'),
});

export type Env = z.infer<typeof envSchema> & {
  DATABASE_URL: string;
  JWT_SECRET: string;
};

const DEV_DB =
  'postgresql://mini_notion:mini_notion@localhost:5432/mini_notion?schema=public';

const TEST_DB =
  'postgresql://mini_notion:mini_notion@localhost:5432/mini_notion_test?schema=public';

const DEV_JWT = 'dev-only-change-me-before-any-real-auth';

/**
 * Loads `.env` from cwd unless `process.env` was already populated (e.g. tests).
 */
export function loadDotenvIfPresent(): void {
  loadDotenv();
}

export function parseEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const parsed = envSchema.safeParse(source);
  if (!parsed.success) {
    throw new Error(`Invalid environment: ${parsed.error.message}`);
  }

  const data = parsed.data;

  if (data.NODE_ENV === 'production') {
    if (!data.DATABASE_URL?.trim()) {
      throw new Error('DATABASE_URL is required in production');
    }
    if (!data.JWT_SECRET?.trim()) {
      throw new Error('JWT_SECRET is required in production');
    }
  }

  const defaultDb = data.NODE_ENV === 'test' ? TEST_DB : DEV_DB;

  return {
    ...data,
    DATABASE_URL: data.DATABASE_URL?.trim() || defaultDb,
    JWT_SECRET: data.JWT_SECRET?.trim() || DEV_JWT,
  };
}
