import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes';
import weatherRoutes from './routes/weatherRoutes';
import soilRoutes from './routes/soilRoutes';
import cropRoutes from './routes/cropRoutes';
import lifecycleRoutes from './routes/lifecycleRoutes';
import diseaseRoutes from './routes/diseaseRoutes';
import chatRoutes from './routes/chatRoutes';
import profileRoutes from './routes/profileRoutes';
import locationRoutes from './routes/locationRoutes';
import seasonRoutes from './routes/seasonRoutes';
import marketRoutes from './routes/marketRoutes';
import { devCropRouter, cropCreditsRouter } from './routes/devCropRoutes';

import path from 'path';
import { config } from './config';

const app = express();

// Security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Middleware
// Strict CORS derived dynamically from CLIENT_URL (plus Capacitor origins)
const CAPACITOR_ORIGINS = ['capacitor://localhost', 'http://localhost', 'https://localhost'];

function getAllowedCorsOrigins(): Set<string> {
  const allowed = new Set<string>(CAPACITOR_ORIGINS);
  const sources = [
    process.env.CLIENT_URL !== undefined ? process.env.CLIENT_URL : config.clientUrl,
    process.env.ALLOWED_ORIGINS !== undefined ? process.env.ALLOWED_ORIGINS : config.allowedOrigins,
  ];

  for (const rawList of sources) {
    if (!rawList) continue;
    for (const item of rawList.split(',')) {
      const normalized = item.trim().replace(/\/$/, '');
      if (normalized) {
        allowed.add(normalized);
      }
    }
  }
  return allowed;
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile native apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.replace(/\/$/, '');
      if (getAllowedCorsOrigins().has(normalizedOrigin)) {
        return callback(null, true);
      }

      callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Static uploads serving for user profile avatars
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Root Route: Automatically redirects web browsers to the frontend app, or returns API overview
app.get('/', (req: Request, res: Response) => {
  const targetUrl = config.clientUrl || 'http://localhost:5173';
  if (req.accepts('html')) {
    return res.redirect(targetUrl);
  }
  return res.json({
    status: 'ok',
    appName: 'Krushi Sathi — Your Farming Companion API',
    frontendUrl: targetUrl,
    message: `Backend API server is running. Visit the web app at ${targetUrl}`,
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      weather: '/api/weather',
      soil: '/api/soil',
      crops: '/api/crops',
      lifecycle: '/api/lifecycle',
      diseases: '/api/diseases',
      chat: '/api/chat',
      profile: '/api/profile',
    },
  });
});

app.get('/api', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    appName: 'Krushi Sathi — Your Farming Companion API',
    version: '1.0.0',
    healthCheck: '/api/health',
  });
});

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    appName: 'Krushi Sathi — Your Farming Companion API',
    version: '1.0.0',
    mode: 'Development & Local Demonstration',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/soil', soilRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/lifecycle', lifecycleRoutes);
app.use('/api/diseases', diseaseRoutes);
app.use('/api/market-prices', marketRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/season', seasonRoutes);
app.use('/api/dev/crops', devCropRouter);
app.use('/api/crops/credits', cropCreditsRouter);

// 404 Route Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'API endpoint not found' });
});

// Centralized Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('API Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

export default app;
