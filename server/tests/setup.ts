import path from 'path';

const serverRoot = path.resolve(__dirname, '..');
const testDbPath = path.join(serverRoot, 'prisma', 'test.db');

process.env.NODE_ENV = 'test';
process.env.SKIP_DOTENV = 'true';
process.env.DATABASE_URL = `file:${testDbPath.replace(/\\/g, '/')}`;
process.env.JWT_SECRET = 'krishi-sathi-phase-c-vitest-strong-secret-987654321';
process.env.DEMO_MODE = 'true';
process.env.DEMO_OTP_ENABLED = 'true';
process.env.GEMINI_API_KEY = '';
process.env.OPENROUTER_API_KEY = '';
process.env.CLIENT_URL = 'http://localhost:5173';
process.env.ALLOWED_ORIGINS = '';

