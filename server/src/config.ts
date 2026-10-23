import dotenv from 'dotenv';
import path from 'path';

// Load .env from server directory or root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'krishi-sathi-local-jwt-secret-key-492716',
  demoOtp: process.env.DEMO_OTP || '123456',
  claudeModel: process.env.CLAUDE_MODEL || 'claude-haiku-5-5',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-3.5-flash',
  groqApiKey: process.env.GROQ_API_KEY || '',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
};

