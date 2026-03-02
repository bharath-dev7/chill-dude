import cors, { CorsOptions } from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { getCorsOrigins } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFound';
import authRoutes from './modules/auth/auth.routes';
import appRoutes from './modules/app/app.routes';
import googleRoutes from './routes/google';
import healthRoutes from './routes/health';

const app = express();
const allowedOrigins = getCorsOrigins();

const isOriginAllowed = (origin: string): boolean => {
  for (const pattern of allowedOrigins) {
    if (pattern === origin) {
      return true;
    }

    if (!pattern.includes('*')) {
      continue;
    }

    const regexPattern = `^${pattern
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*')}$`;

    if (new RegExp(regexPattern, 'i').test(origin)) {
      return true;
    }
  }

  return false;
};

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin || isOriginAllowed(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('CORS blocked: origin not allowed'));
  },
  credentials: true,
};

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/', (_req, res) => {
  res.json({
    message: 'Chill Dude API is running',
  });
});

app.use('/auth', authRoutes);
app.use('/api', healthRoutes);
app.use('/api', googleRoutes);
app.use('/api/app', appRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
