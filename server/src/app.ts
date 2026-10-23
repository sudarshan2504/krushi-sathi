import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes';
import weatherRoutes from './routes/weatherRoutes';
import soilRoutes from './routes/soilRoutes';
import cropRoutes from './routes/cropRoutes';
import lifecycleRoutes from './routes/lifecycleRoutes';
import diseaseRoutes from './routes/diseaseRoutes';
import chatRoutes from './routes/chatRoutes';
import profileRoutes from './routes/profileRoutes';

import path from 'path';
import { config } from './config';

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

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
app.use('/api/chat', chatRoutes);
app.use('/api/profile', profileRoutes);

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
