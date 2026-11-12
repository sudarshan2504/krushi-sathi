import { MsEdgeTTS } from 'msedge-tts';

/**
 * E2E server preload: isolates all outbound network calls so Playwright E2E
 * tests run deterministically offline without hitting live weather, geocoding,
 * IP-location, LLM, or Cloud TTS APIs.
 */

// 1. Short-circuit Edge Neural TTS immediately (<1ms) instead of timing out 7s on WebSocket
MsEdgeTTS.prototype.setMetadata = async function () {
  throw new Error('E2E preload: Edge Neural TTS stubbed for fast browser fallback');
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function buildDynamicOpenMeteoForecast(lat: number, lon: number) {
  const today = new Date();
  const times = Array.from({ length: 14 }, (_, idx) => {
    const d = new Date(today);
    d.setDate(today.getDate() + idx);
    return d.toISOString().split('T')[0];
  });

  // Produce deterministic, location-distinct readings
  let tempCurrent = 29;
  let humidity = 62;
  let wind = 10;
  let weatherCode = 2;

  if (Math.abs(lat - 13.0827) < 0.25 && Math.abs(lon - 80.2707) < 0.25) {
    // Chennai coastal profile
    tempCurrent = 33.4;
    humidity = 74;
    wind = 15;
    weatherCode = 1;
  } else if (Math.abs(lat - 12.295) < 0.25 && Math.abs(lon - 76.639) < 0.25) {
    // Mysuru
    tempCurrent = 27.6;
    humidity = 65;
    wind = 9;
    weatherCode = 2;
  } else if (Math.abs(lat - 12.524) < 0.25 && Math.abs(lon - 76.896) < 0.25) {
    // Mandya
    tempCurrent = 28.8;
    humidity = 58;
    wind = 11;
    weatherCode = 0;
  }

  return {
    current: {
      temperature_2m: tempCurrent,
      relative_humidity_2m: humidity,
      weather_code: weatherCode,
      wind_speed_10m: wind,
    },
    daily: {
      time: times,
      weather_code: times.map((_, i) => (i === 3 ? 61 : weatherCode)),
      temperature_2m_max: times.map((_, i) => Math.round(tempCurrent + 2 + (i % 2))),
      temperature_2m_min: times.map((_, i) => Math.round(tempCurrent - 7 - (i % 2))),
      precipitation_probability_max: times.map((_, i) => (i === 3 ? 65 : 15 + (i % 3) * 5)),
      precipitation_sum: times.map((_, i) => (i === 3 ? 8.2 : 0.0)),
    },
  };
}

function buildNominatimReversePayload(lat: number, lon: number): { status: number; body: unknown } {
  // Sentinel coordinates to test reverse-geocode failure -> "Your location (lat, lon)"
  if (Math.abs(lat - 11.1111) < 0.02 && Math.abs(lon - 77.1111) < 0.02) {
    return { status: 404, body: { error: 'E2E sentinel: Unable to geocode' } };
  }

  // Chennai (outside 14 districts)
  if (Math.abs(lat - 13.0827) < 0.15 && Math.abs(lon - 80.2707) < 0.15) {
    return {
      status: 200,
      body: {
        address: {
          city: 'Chennai',
          state_district: 'Chennai District',
          state: 'Tamil Nadu',
          country: 'India',
        },
        display_name: 'Chennai, Tamil Nadu, India',
      },
    };
  }

  // Nellore (also outside 14 districts)
  if (Math.abs(lat - 14.4426) < 0.15 && Math.abs(lon - 79.9865) < 0.15) {
    return {
      status: 200,
      body: {
        address: {
          city: 'Nellore',
          state_district: 'SPSR Nellore District',
          state: 'Andhra Pradesh',
          country: 'India',
        },
        display_name: 'Nellore, Andhra Pradesh, India',
      },
    };
  }

  // Sentinel Open-Meteo error coord (reverse succeeds cleanly first)
  if (Math.abs(lat - 9.9999) < 0.05 && Math.abs(lon - 77.9999) < 0.05) {
    return {
      status: 200,
      body: {
        address: {
          city: 'Dindigul',
          state_district: 'Dindigul District',
          state: 'Tamil Nadu',
          country: 'India',
        },
        display_name: 'Dindigul, Tamil Nadu, India',
      },
    };
  }

  // Thanjavur
  if (Math.abs(lat - 10.7867) < 0.15 && Math.abs(lon - 79.1378) < 0.15) {
    return {
      status: 200,
      body: {
        address: {
          city: 'Thanjavur',
          state_district: 'Thanjavur District',
          state: 'Tamil Nadu',
          country: 'India',
        },
        display_name: 'Thanjavur, Tamil Nadu, India',
      },
    };
  }

  // Mysuru
  if (Math.abs(lat - 12.295) < 0.15 && Math.abs(lon - 76.639) < 0.15) {
    return {
      status: 200,
      body: {
        address: {
          city: 'Mysuru',
          state_district: 'Mysuru District',
          state: 'Karnataka',
          country: 'India',
        },
        display_name: 'Mysuru, Karnataka, India',
      },
    };
  }

  // Mandya / Koppa village
  if (Math.abs(lat - 12.5244) < 0.15 && Math.abs(lon - 76.8969) < 0.15) {
    return {
      status: 200,
      body: {
        address: {
          village: 'Koppa',
          county: 'Maddur Taluk',
          state_district: 'Mandya District',
          state: 'Karnataka',
          country: 'India',
        },
        display_name: 'Koppa, Mandya, Karnataka, India',
      },
    };
  }

  // Bengaluru
  if (Math.abs(lat - 12.9716) < 0.15 && Math.abs(lon - 77.5946) < 0.15) {
    return {
      status: 200,
      body: {
        address: {
          city: 'Bengaluru',
          state_district: 'Bengaluru Urban District',
          state: 'Karnataka',
          country: 'India',
        },
        display_name: 'Bengaluru, Karnataka, India',
      },
    };
  }

  return {
    status: 200,
    body: {
      address: {
        town: 'Tumakuru',
        state_district: 'Tumakuru District',
        state: 'Karnataka',
        country: 'India',
      },
      display_name: 'Tumakuru, Karnataka, India',
    },
  };
}

const originalFetch = globalThis.fetch.bind(globalThis);

globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();

    // Allow local/loopback traffic untouched
    if (host === 'localhost' || host === '127.0.0.1' || host === '::1') {
      return originalFetch(input, init);
    }

    // Open-Meteo Forecast API
    if (host === 'api.open-meteo.com') {
      const lat = parseFloat(parsed.searchParams.get('latitude') || '12.524');
      const lon = parseFloat(parsed.searchParams.get('longitude') || '76.896');

      // Sentinel coordinates to test uncached Open-Meteo failure -> Weather Unavailable + Retry
      if (Math.abs(lat - 9.9999) < 0.05 && Math.abs(lon - 77.9999) < 0.05) {
        return new Response('E2E sentinel: Open-Meteo upstream error', { status: 500 });
      }

      return jsonResponse(buildDynamicOpenMeteoForecast(lat, lon), 200);
    }

    // Nominatim Reverse & Search API
    if (host === 'nominatim.openstreetmap.org') {
      if (parsed.pathname.includes('/reverse')) {
        const lat = parseFloat(parsed.searchParams.get('lat') || '0');
        const lon = parseFloat(parsed.searchParams.get('lon') || '0');
        const { status, body } = buildNominatimReversePayload(lat, lon);
        return jsonResponse(body, status);
      }

      if (parsed.pathname.includes('/search')) {
        const q = (parsed.searchParams.get('q') || '').toLowerCase();
        if (q.includes('chennai')) {
          return jsonResponse([
            {
              lat: '13.0827',
              lon: '80.2707',
              name: 'Chennai',
              address: { city: 'Chennai', state: 'Tamil Nadu', country: 'India' },
            },
          ]);
        }
        return jsonResponse([
          {
            lat: '12.2958',
            lon: '76.6394',
            name: 'Mysuru',
            address: { city: 'Mysuru', state: 'Karnataka', country: 'India' },
          },
        ]);
      }
    }

    // IP Geolocation APIs
    if (host === 'ipapi.co' || host === 'ip-api.com') {
      return jsonResponse({
        latitude: 12.2958,
        longitude: 76.6394,
        lat: 12.2958,
        lon: 76.6394,
        city: 'Mysuru',
        region: 'Karnataka',
        regionName: 'Karnataka',
        country_name: 'India',
        country: 'India',
        status: 'success',
      });
    }

    // Gemini / OpenRouter LLM stubs (backup safety if called despite empty keys)
    if (host === 'generativelanguage.googleapis.com' || host === 'openrouter.ai') {
      return jsonResponse({ error: { message: 'Stubbed in E2E preload' } }, 503);
    }

    console.warn(`[e2e-preload] Blocked unexpected outbound fetch to: ${url}`);
    return jsonResponse({ error: 'Blocked outbound fetch in E2E mode' }, 502);
  } catch {
    return originalFetch(input, init);
  }
};

console.log('[e2e-preload] Outbound network & Edge TTS mocks active');

