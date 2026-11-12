import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { resetAndSeedTestDb } from './testHelpers';
import { clearWeatherCachesForTest } from '../src/services/weatherService';

function buildOpenMeteoPayload() {
  const today = new Date();
  const times = Array.from({ length: 14 }, (_, idx) => {
    const d = new Date(today);
    d.setDate(today.getDate() + idx);
    return d.toISOString().split('T')[0];
  });

  return {
    current: {
      temperature_2m: 31.4,
      relative_humidity_2m: 62,
      weather_code: 2,
      wind_speed_10m: 11,
    },
    daily: {
      time: times,
      weather_code: times.map((_, i) => (i === 2 ? 61 : 2)),
      temperature_2m_max: times.map(() => 33),
      temperature_2m_min: times.map(() => 22),
      precipitation_probability_max: times.map((_, i) => (i === 2 ? 75 : 20)),
      precipitation_sum: times.map((_, i) => (i === 2 ? 9.5 : 0.2)),
    },
  };
}

describe('Weather & Reverse Geocoding Service & Routes', () => {
  beforeEach(async () => {
    vi.useRealTimers();
    clearWeatherCachesForTest();
    await resetAndSeedTestDb();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('uses provided lat/lon directly without substituting Mandya or Karnataka', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes('nominatim.openstreetmap.org')) {
        return new Response(
          JSON.stringify({
            address: {
              city: 'Thanjavur',
              state_district: 'Thanjavur District',
              state: 'Tamil Nadu',
              country: 'India',
            },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
      if (url.includes('api.open-meteo.com')) {
        return new Response(JSON.stringify(buildOpenMeteoPayload()), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`Unexpected fetch URL in weather test: ${url}`);
    });

    const res = await request(app).get('/api/weather?lat=10.7867&lon=79.1378');
    expect(res.status).toBe(200);
    expect(res.body.data.location).toBe('Thanjavur, Tamil Nadu');
    expect(res.body.data.state).toBe('Tamil Nadu');
    expect(res.body.data.location).not.toMatch(/Mandya|Karnataka/i);
    expect(res.body.data.isDemoFallback).toBe(false);
    expect(res.body.data.fiveDayRainProbability).toHaveLength(5);
    expect(res.body.data.farmingAlert).toBeTruthy();
    expect(res.body.data.farmingAlertKn).toBeTruthy();
    expect(res.body.data.farmingAlertTa).toBeTruthy();
    expect(res.body.data.farmingAlertTe).toBeTruthy();
    expect(fetchSpy).toHaveBeenCalled();
  });

  it('formats /api/weather/reverse labels cleanly and falls back to coordinates when Nominatim fails', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            address: {
              city: 'Mysuru',
              state_district: 'Mysuru District',
              state: 'Karnataka',
              country: 'India',
            },
          }),
          { status: 200 }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            address: {
              village: 'Koppa',
              state_district: 'Mandya District',
              state: 'Karnataka',
              country: 'India',
            },
          }),
          { status: 200 }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            address: {
              city: 'Delhi',
              state: 'Delhi',
            },
          }),
          { status: 200 }
        )
      )
      .mockRejectedValueOnce(new Error('Network down'));

    // City + State
    const cityRes = await request(app).get('/api/weather/reverse?lat=12.295&lon=76.639');
    expect(cityRes.status).toBe(200);
    expect(cityRes.body.data.location).toBe('Mysuru, Karnataka');

    // Village + District
    const villageRes = await request(app).get('/api/weather/reverse?lat=12.615&lon=76.955');
    expect(villageRes.status).toBe(200);
    expect(villageRes.body.data.location).toBe('Koppa, Mandya');

    // Deduplicated city == state
    const dedupRes = await request(app).get('/api/weather/reverse?lat=28.613&lon=77.209');
    expect(dedupRes.status).toBe(200);
    expect(dedupRes.body.data.location).toBe('Delhi');

    // Coordinate fallback on failure (never Mandya!)
    const failRes = await request(app).get('/api/weather/reverse?lat=15.123&lon=75.456');
    expect(failRes.status).toBe(200);
    expect(failRes.body.data.location).toBe('Your location (15.12°, 75.46°)');

    // Bounds validation
    const badRes = await request(app).get('/api/weather/reverse?lat=95.0&lon=77.0');
    expect(badRes.status).toBe(400);
  });

  it('returns cached stale real weather when API fails after TTL, throws without cache, and uses dynamic non-October dates on ?demo=true', async () => {
    // 1. Uncached API failure returns 500 rather than silent sample data
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes('nominatim')) {
        return new Response(
          JSON.stringify({ address: { city: 'Coimbatore', state: 'Tamil Nadu' } }),
          { status: 200 }
        );
      }
      return new Response('Upstream Error', { status: 503 });
    });

    const uncachedFail = await request(app).get('/api/weather?lat=11.016&lon=76.955');
    expect(uncachedFail.status).toBe(500);

    // 2. ?demo=true returns sample data with dynamic current dates (no hardcoded October dates)
    clearWeatherCachesForTest();
    const demoRes = await request(app).get('/api/weather?district=Mandya&demo=true');
    expect(demoRes.status).toBe(200);
    expect(demoRes.body.data.isDemoFallback).toBe(true);
    const todayIso = new Date().toISOString().split('T')[0];
    expect(demoRes.body.data.forecast7Days[0].date).toBe(todayIso);

    // 3. Cached real result returns with isStale: true when cache expires and upstream subsequently fails
    clearWeatherCachesForTest();
    vi.restoreAllMocks();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-06-15T08:00:00Z'));

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes('nominatim')) {
        return new Response(
          JSON.stringify({ address: { city: 'Mysuru', state: 'Karnataka' } }),
          { status: 200 }
        );
      }
      return new Response(JSON.stringify(buildOpenMeteoPayload()), { status: 200 });
    });

    const freshRes = await request(app).get('/api/weather?lat=12.30&lon=76.64');
    expect(freshRes.status).toBe(200);
    expect(freshRes.body.data.isStale).toBeUndefined();
    expect(freshRes.body.data.isDemoFallback).toBe(false);

    // Advance 25 minutes so cache is past 20-min TTL, then fail Open-Meteo
    vi.advanceTimersByTime(25 * 60 * 1000);
    vi.restoreAllMocks();
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('Down', { status: 500 }));

    const staleRes = await request(app).get('/api/weather?lat=12.30&lon=76.64');
    expect(staleRes.status).toBe(200);
    expect(staleRes.body.data.isStale).toBe(true);
    expect(staleRes.body.data.isDemoFallback).toBe(false);
    expect(staleRes.body.data.dataSource).toMatch(/Cached/i);
  });
});
