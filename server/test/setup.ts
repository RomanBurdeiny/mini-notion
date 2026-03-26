import { config } from 'dotenv';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const serverDir = fileURLToPath(new URL('..', import.meta.url));
config({ path: resolve(serverDir, '.env.test') });

process.env.NODE_ENV = 'test';
