import dotenv from 'dotenv';
import path from 'path';

// Load .env from server directory or root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'krishi-sathi-local-jwt-secret-key-492716',
  demoOtp: process.env.DEMO_OTP || '123456',
  demoOtpEnabled: process.env.DEMO_OTP_ENABLED === 'true',
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID || '',
  firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
  firebasePrivateKey: process.env.FIREBASE_PRIVATE_KEY || '',
  claudeModel: process.env.CLAUDE_MODEL || 'claude-haiku-5-5',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-3.5-flash',
  groqApiKey: process.env.GROQ_API_KEY || '',
  openRouterApiKey: process.env.OPENROUTER_API_KEY || '',
  openRouterModel: process.env.OPENROUTER_MODEL || 'nvidia/nemotron-3.5-lightning:free',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  allowedOrigins: process.env.ALLOWED_ORIGINS || '',
};

// Enforce JWT_SECRET security check in production
if (config.nodeEnv === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16)) {
  console.warn('SECURITY WARNING: JWT_SECRET should be explicitly configured with a strong key in production.');
}

