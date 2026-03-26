import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { loadEnv } from './config/env.js';
import { errorHandler } from './middlewares/error-handler.js';
import { registerRoutes } from './modules/index.js';

const env = loadEnv();
const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

registerRoutes(app);

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`API listening on http://localhost:${env.PORT}`);
});
