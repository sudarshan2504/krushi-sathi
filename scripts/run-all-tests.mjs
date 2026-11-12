import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const steps = [
  { name: '1. Server Unit & Integration Tests (Vitest)', cmd: 'npm --workspace=server test' },
  { name: '2. Client Unit & Component Tests (Vitest)', cmd: 'npm --workspace=client test' },
  { name: '3. Full Playwright E2E & UI Audit Suite', cmd: 'npx playwright test' },
];

const startedAt = Date.now();
const timings = [];

for (const step of steps) {
  console.log(`\n============================================================`);
  console.log(`[run-all-tests] Running: ${step.name}`);
  console.log(`============================================================\n`);

  const stepStart = Date.now();
  try {
    execSync(step.cmd, { cwd: rootDir, stdio: 'inherit' });
    const elapsedSec = ((Date.now() - stepStart) / 1000).toFixed(1);
    timings.push({ name: step.name, status: 'PASSED', elapsedSec });
  } catch (err) {
    const elapsedSec = ((Date.now() - stepStart) / 1000).toFixed(1);
    console.error(`\n[run-all-tests] FAILED: ${step.name} after ${elapsedSec}s`);
    process.exit(typeof err?.status === 'number' && err.status !== 0 ? err.status : 1);
  }
}

const totalSec = ((Date.now() - startedAt) / 1000).toFixed(1);
console.log(`\n============================================================`);
console.log(`[run-all-tests] ALL SUITES PASSED in ${totalSec}s`);
for (const t of timings) {
  console.log(`  - ${t.name}: ${t.status} (${t.elapsedSec}s)`);
}
console.log(`============================================================\n`);

