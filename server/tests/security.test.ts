import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { resetAndSeedTestDb } from './testHelpers';

async function getDemoToken(): Promise<string> {
  const res = await request(app).post('/api/auth/demo-login').send({});
  return res.body.data.token;
}

describe('Security Controls: Auth Guards, Rate Limiters, Helmet & Strict CORS', () => {
  beforeEach(async () => {
    process.env.DEMO_MODE = 'true';
    delete process.env.AUTH_RATE_LIMIT_MAX;
    delete process.env.TTS_RATE_LIMIT_MAX;
    delete process.env.DIAGNOSE_RATE_LIMIT_MAX;
    delete process.env.REVERSE_GEOCODE_RATE_LIMIT_MAX;
    await resetAndSeedTestDb();
  });

  afterEach(() => {
    delete process.env.AUTH_RATE_LIMIT_MAX;
    delete process.env.TTS_RATE_LIMIT_MAX;
    delete process.env.DIAGNOSE_RATE_LIMIT_MAX;
    delete process.env.REVERSE_GEOCODE_RATE_LIMIT_MAX;
  });

  it('protects /chat/keys, /chat/tts, /diseases/diagnose, and /diseases/analyze-photo with 401 when unauthenticated', async () => {
    const keysRes = await request(app).post('/api/chat/keys').send({ geminiApiKey: 'test' });
    expect(keysRes.status).toBe(401);

    const ttsRes = await request(app).post('/api/chat/tts').send({ text: 'Hello farmer' });
    expect(ttsRes.status).toBe(401);

    const diagRes = await request(app).post('/api/diseases/diagnose').send({ crop: 'Paddy' });
    expect(diagRes.status).toBe(401);

    const photoRes = await request(app)
      .post('/api/diseases/analyze-photo')
      .send({ crop: 'Paddy', photos: ['data:image/png;base64,iVBOR'] });
    expect(photoRes.status).toBe(401);
  });

  it('enforces rate limiters with 429 and Retry-After headers', async () => {
    process.env.AUTH_RATE_LIMIT_MAX = '2';
    const a1 = await request(app).post('/api/auth/demo-login').send({});
    const a2 = await request(app).post('/api/auth/demo-login').send({});
    const a3 = await request(app).post('/api/auth/demo-login').send({});
    expect(a1.status).toBe(200);
    expect(a2.status).toBe(200);
    expect(a3.status).toBe(429);
    expect(a3.headers['retry-after']).toBeDefined();

    const token = a1.body.data.token;

    process.env.TTS_RATE_LIMIT_MAX = '2';
    const t1 = await request(app)
      .post('/api/chat/tts')
      .set('Authorization', `Bearer ${token}`)
      .send({ text: 'One', provider: 'browser' });
    const t2 = await request(app)
      .post('/api/chat/tts')
      .set('Authorization', `Bearer ${token}`)
      .send({ text: 'Two', provider: 'browser' });
    const t3 = await request(app)
      .post('/api/chat/tts')
      .set('Authorization', `Bearer ${token}`)
      .send({ text: 'Three', provider: 'browser' });
    expect(t1.status).toBe(200);
    expect(t2.status).toBe(200);
    expect(t3.status).toBe(429);

    process.env.DIAGNOSE_RATE_LIMIT_MAX = '2';
    const d1 = await request(app)
      .post('/api/diseases/diagnose')
      .set('Authorization', `Bearer ${token}`)
      .send({ crop: 'Paddy', plantPart: 'leaf' });
    const d2 = await request(app)
      .post('/api/diseases/diagnose')
      .set('Authorization', `Bearer ${token}`)
      .send({ crop: 'Paddy', plantPart: 'stem' });
    const d3 = await request(app)
      .post('/api/diseases/diagnose')
      .set('Authorization', `Bearer ${token}`)
      .send({ crop: 'Paddy', plantPart: 'root' });
    expect(d1.status).toBe(200);
    expect(d2.status).toBe(200);
    expect(d3.status).toBe(429);
  });

  it('includes Helmet security headers on API responses', async () => {
    const token = await getDemoToken();
    const res = await request(app)
      .get('/api/health')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
  });

  it('applies strict CORS allowing CLIENT_URL and Capacitor origins while rejecting unknown origins', async () => {
    const allowedOrigins = [
      'http://localhost:5173',
      'capacitor://localhost',
      'http://localhost',
      'https://localhost',
    ];

    for (const origin of allowedOrigins) {
      const res = await request(app).get('/api/health').set('Origin', origin);
      expect(res.status).toBe(200);
      expect(res.headers['access-control-allow-origin']).toBe(origin);
    }

    const evilRes = await request(app).get('/api/health').set('Origin', 'https://evil.example.com');
    expect(evilRes.headers['access-control-allow-origin']).toBeUndefined();
  });
});

