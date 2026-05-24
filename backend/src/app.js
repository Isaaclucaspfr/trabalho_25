import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import routes from './routes/index.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import { env } from './config/env.js';
import { swaggerSpec } from './docs/swagger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.frontendUrl }));
app.use(express.json());
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api', routes);

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use(errorMiddleware);
