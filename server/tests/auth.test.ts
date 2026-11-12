import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import { spawnSync } from 'child_process';
import path from 'path';
import app from '../src/app';
import { resetAndSeedTestDb } from './testHelpers';

describe('Authentication & Startup Security Guardrails', () => {
  beforeEach(async () => {
    vi.useRealTimers();
    process.env.DEMO_MODE = 'true';
    process.env.DEMO_OTP_ENABLED = 'true';
    await resetAndSeedTestDb();
  });

  afterEach(() => {
    vi.useRealTimers();
    process.env.DEMO_MODE = 'true';
    process.env.DEMO_OTP_ENABLED = 'true';
  });

  it('completes OTP send and verify flow for login', async () => {
    const sendRes = await request(app)
      .post('/api/auth/send-otp')
      .send({ phone: '9876543210', purpose: 'login' });

    expect(sendRes.status).toBe(200);
    expect(sendRes.body.success).toBe(true);
    expect(sendRes.body.data.isExistingUser).toBe(true);

    const verifyRes = await request(app)
      .post('/api/auth/verify-otp')
      .send({ phone: '9876543210', otp: '123456', purpose: 'login' });

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.success).toBe(true);
    expect(typeof verifyRes.body.data.token).toBe('string');
    expect(verifyRes.body.data.user.phone).toBe('9876543210');

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${verifyRes.body.data.token}`);
    expect(meRes.status).toBe(200);
    expect(meRes.body.data.name).toBe('Ramesh Kumar');
  });

  it('rejects wrong OTP, enforces too-many-attempts lockout, and rejects expired OTP', async () => {
    const phone = '9880011223';
    await request(app).post('/api/auth/send-otp').send({ phone, purpose: 'register' });

    for (let i = 0; i < 5; i++) {
      const badRes = await request(app)
        .post('/api/auth/verify-otp')
        .send({ phone, otp: '000000', purpose: 'register' });
      expect(badRes.status).toBe(400);
      expect(badRes.body.message).toMatch(/Invalid OTP/i);
    }

    const lockedRes = await request(app)
      .post('/api/auth/verify-otp')
      .send({ phone, otp: '123456', purpose: 'register' });
    expect(lockedRes.status).toBe(400);
    expect(lockedRes.body.message).toMatch(/Too many failed attempts/i);

    // Expiry check using fake timers (mock Date only so async I/O timers work normally)
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-06-01T10:00:00Z'));
    await request(app).post('/api/auth/send-otp').send({ phone, purpose: 'register' });
    vi.advanceTimersByTime(6 * 60 * 1000);

    const expiredRes = await request(app)
      .post('/api/auth/verify-otp')
      .send({ phone, otp: '123456', purpose: 'register' });
    expect(expiredRes.status).toBe(400);
    expect(expiredRes.body.message).toMatch(/expired/i);
  });

  it('requires verified OTP for registration and blocks existing phone takeover', async () => {
    const freshPhone = '9770011223';

    // Unverified direct register attempt must fail with 401
    const unverified = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Seetha', phone: freshPhone, district: 'Mysuru', state: 'Karnataka' });
    expect(unverified.status).toBe(401);

    // Takeover attempt on existing seeded phone 9876543210 must return 409
    const takeoverSend = await request(app)
      .post('/api/auth/send-otp')
      .send({ phone: '9876543210', purpose: 'register' });
    expect(takeoverSend.status).toBe(409);

    const takeoverReg = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Hacker', phone: '9876543210', otp: '123456' });
    expect(takeoverReg.status).toBe(409);

    // Proper verified register succeeds with 201 and one-time token cannot be reused
    await request(app).post('/api/auth/send-otp').send({ phone: freshPhone, purpose: 'register' });
    const verified = await request(app)
      .post('/api/auth/verify-otp')
      .send({ phone: freshPhone, otp: '123456', purpose: 'register' });
    expect(verified.status).toBe(200);
    const verificationToken = verified.body.data.verificationToken;
    expect(verificationToken).toBeTruthy();

    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Seetha Devi',
        phone: freshPhone,
        verificationToken,
        district: 'Mysuru',
        state: 'Karnataka',
        language: 'kn',
        farmSize: 3.0,
      });
    expect(regRes.status).toBe(201);
    expect(regRes.body.data.user.phone).toBe(freshPhone);
    expect(regRes.body.data.token).toBeTruthy();
  });

  it('enforces DEMO_MODE=true for /demo-login and returns 404 when disabled', async () => {
    process.env.DEMO_MODE = 'false';
    const disabledRes = await request(app).post('/api/auth/demo-login').send({});
    expect(disabledRes.status).toBe(404);

    process.env.DEMO_MODE = 'true';
    const enabledRes = await request(app).post('/api/auth/demo-login').send({});
    expect(enabledRes.status).toBe(200);
    expect(enabledRes.body.data.user.phone).toBe('9876543210');
    expect(enabledRes.body.data.token).toBeTruthy();
  });

  it('requires valid JWT on /api/auth/me', async () => {
    const noAuth = await request(app).get('/api/auth/me');
    expect(noAuth.status).toBe(401);

    const badAuth = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid.jwt.token');
    expect(badAuth.status).toBe(401);
  });

  it('aborts startup cleanly if JWT_SECRET is missing or uses a known insecure placeholder', () => {
    const serverDir = path.resolve(__dirname, '..');
    const tsxCli = path.join(path.dirname(require.resolve('tsx/package.json')), 'dist/cli.mjs');
    const missingEnv = { ...process.env, SKIP_DOTENV: 'true', NODE_ENV: 'production' };
    delete missingEnv.JWT_SECRET;

    const missingRun = spawnSync(process.execPath, [
      tsxCli,
      '-e',
      "import('./src/config.ts')",
    ], {
      cwd: serverDir,
      env: missingEnv,
      encoding: 'utf-8',
    });
    expect(missingRun.status).not.toBe(0);
    expect(`${missingRun.stderr}\n${missingRun.stdout}`).toMatch(/FATAL: JWT_SECRET/i);

    const placeholderRun = spawnSync(process.execPath, [
      tsxCli,
      '-e',
      "import('./src/config.ts')",
    ], {
      cwd: serverDir,
      env: {
        ...missingEnv,
        JWT_SECRET: 'krishi-sathi-local-jwt-secret-key-492716',
      },
      encoding: 'utf-8',
    });
    expect(placeholderRun.status).not.toBe(0);
    expect(`${placeholderRun.stderr}\n${placeholderRun.stdout}`).toMatch(/FATAL: JWT_SECRET/i);
  });
});
