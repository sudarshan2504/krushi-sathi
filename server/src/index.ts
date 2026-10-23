import app from './app';
import { config } from './config';
import prisma from './utils/prisma';

const port = config.port || 5000;

async function startServer() {
  try {
    // Test SQLite database connection
    await prisma.$connect();
    console.log('✅ SQLite Database connected via Prisma ORM');

    app.listen(port, () => {
      console.log(`🌾 Krishi Sathi Server running on http://localhost:${port}`);
      console.log(`🌾 Frontend expected at: ${config.clientUrl}`);
      console.log(`🌾 Demo OTP mode: Active (Use OTP: ${config.demoOtp})`);
      if (config.geminiApiKey) {
        console.log('🌾 AI Mode: Real Gemini AI (Configured)');
      } else {
        console.log('🌾 AI Mode: Local Rule-Based Agricultural Assistant (Mode B fallback)');
      }
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
