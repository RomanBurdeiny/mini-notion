import 'dotenv/config';
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

const DEV_DB = 'postgresql://postgres:postgres@localhost:5432/mini_notion?schema=public';
const DEV_JWT = 'dev-only-change-me-before-any-real-auth';

export function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
    process.exit(1);
  }
  const data = parsed.data;
  if (data.NODE_ENV === 'production') {
    if (!data.DATABASE_URL?.trim()) {
      console.error('DATABASE_URL is required in production');
      process.exit(1);
    }
    if (!data.JWT_SECRET?.trim()) {
      console.error('JWT_SECRET is required in production');
      process.exit(1);
    }
  }
  return {
    ...data,
    DATABASE_URL: data.DATABASE_URL?.trim() || DEV_DB,
    JWT_SECRET: data.JWT_SECRET?.trim() || DEV_JWT,
  };
}
