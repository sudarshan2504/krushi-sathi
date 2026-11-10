import dotenv from 'dotenv';
import path from 'path';

// Load server/.env in non-test environments unless explicitly skipped
if (process.env.SKIP_DOTENV !== 'true' && process.env.NODE_ENV !== 'test') {
  dotenv.config({ path: path.resolve(__dirname, '../.env') });
}

const KNOWN_INSECURE_SECRETS = new Set([
  'krishi-sathi-local-jwt-secret-key-492716',
  'replace-with-a-long-random-jwt-secret-min-32-chars',
  'your_jwt_secret',
  'changeme',
  'secret',
]);

const rawJwtSecret = process.env.JWT_SECRET?.trim();
if (!rawJwtSecret || rawJwtSecret.length < 16 || KNOWN_INSECURE_SECRETS.has(rawJwtSecret)) {
  throw new Error(
    'FATAL: JWT_SECRET environment variable is missing, too short (<16 chars), or uses an insecure placeholder. Server startup aborted.'
  );
}

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: rawJwtSecret,
  demoMode: process.env.DEMO_MODE === 'true',
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


