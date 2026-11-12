import { execSync } from 'child_process';
import path from 'path';

export async function setup() {
  const serverRoot = path.resolve(__dirname, '..');
  const testDbPath = path.join(serverRoot, 'prisma', 'test.db');
  const dbUrl = `file:${testDbPath.replace(/\\/g, '/')}`;

  process.env.NODE_ENV = 'test';
  process.env.SKIP_DOTENV = 'true';
  process.env.DATABASE_URL = dbUrl;
  process.env.JWT_SECRET = 'krishi-sathi-phase-c-vitest-strong-secret-987654321';

  execSync('npx prisma db push --force-reset --skip-generate', {
    cwd: serverRoot,
    env: {
      ...process.env,
      DATABASE_URL: dbUrl,
    },
    stdio: 'pipe',
  });
}

