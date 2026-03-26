import { createApp } from './app.js';
import { disconnectPrisma } from './config/db.js';
import { loadDotenvIfPresent, parseEnv } from './config/env.js';
import { logger } from './config/logger.js';

loadDotenvIfPresent();

let env;
try {
  env = parseEnv();
} catch (e) {
  console.error(e);
  process.exit(1);
}

const app = createApp(env);

const server = app.listen(env.PORT, () => {
  logger.info(`API listening on http://localhost:${env.PORT}`);
});

async function shutdown(signal: string) {
  logger.info(`${signal} received, shutting down`);
  await new Promise<void>((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
  await disconnectPrisma();
  process.exit(0);
}

process.once('SIGINT', () => void shutdown('SIGINT'));
process.once('SIGTERM', () => void shutdown('SIGTERM'));
