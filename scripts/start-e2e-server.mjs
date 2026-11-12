import fs from 'fs';
import path from 'path';
import { execFileSync, spawn } from 'child_process';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const serverDir = path.join(rootDir, 'server');
const require = createRequire(import.meta.url);

// Resolve Prisma & tsx CLIs directly to avoid Windows shell quoting issues
const prismaCli = path.join(
  path.dirname(require.resolve('prisma/package.json', { paths: [serverDir, rootDir] })),
  'build/index.js'
);
const tsxCli = path.join(
  path.dirname(require.resolve('tsx/package.json', { paths: [serverDir, rootDir] })),
  'dist/cli.mjs'
);

// Clean isolated E2E SQLite database (never touch krishi_sathi.db or test.db)
const e2eDbPath = path.join(serverDir, 'prisma', 'e2e.db');
for (const suffix of ['', '-journal', '-wal', '-shm']) {
  fs.rmSync(`${e2eDbPath}${suffix}`, { force: true });
}

const e2eDbUrl = `file:${e2eDbPath.replace(/\\/g, '/')}`;

const env = {
  ...process.env,
  SKIP_DOTENV: 'true',
  NODE_ENV: 'development',
  PORT: '5010',
  DATABASE_URL: e2eDbUrl,
  DEMO_MODE: 'true',
  DEMO_OTP: '123456',
  DEMO_OTP_ENABLED: 'true',
  JWT_SECRET: 'krishi-sathi-e2e-test-secret-minimum-32-chars',
  CLIENT_URL: 'http://127.0.0.1:5174',
  ALLOWED_ORIGINS: 'http://localhost:5174,http://127.0.0.1:5174',
  AUTH_RATE_LIMIT_MAX: '1000',
  REVERSE_GEOCODE_RATE_LIMIT_MAX: '1000',
  CHAT_RATE_LIMIT_MAX: '1000',
  TTS_RATE_LIMIT_MAX: '1000',
  DIAGNOSE_RATE_LIMIT_MAX: '1000',
  ANALYZE_PHOTO_RATE_LIMIT_MAX: '1000',
  GEMINI_API_KEY: '',
  OPENROUTER_API_KEY: '',
};

console.log('[start-e2e-server] Pushing Prisma schema to isolated server/prisma/e2e.db...');
execFileSync(process.execPath, [prismaCli, 'db', 'push', '--force-reset', '--skip-generate'], {
  cwd: serverDir,
  env,
  stdio: 'inherit',
});

console.log('[start-e2e-server] Seeding base data (prisma/seed.ts)...');
execFileSync(process.execPath, [tsxCli, 'prisma/seed.ts'], {
  cwd: serverDir,
  env,
  stdio: 'inherit',
});

console.log('[start-e2e-server] Seeding crop health catalog (prisma/seedCropHealth.ts)...');
execFileSync(process.execPath, [tsxCli, 'prisma/seedCropHealth.ts'], {
  cwd: serverDir,
  env,
  stdio: 'inherit',
});

console.log('[start-e2e-server] Launching E2E server on port 5010...');
const child = spawn(process.execPath, [tsxCli, 'scripts/e2e-server.ts'], {
  cwd: serverDir,
  env,
  stdio: 'inherit',
});

function shutdown(signal) {
  if (!child.killed) {
    child.kill(signal);
  }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

child.on('exit', (code, signal) => {
  if (signal) {
    process.exit(0);
  }
  process.exit(code ?? 0);
});

