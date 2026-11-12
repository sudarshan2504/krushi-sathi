import { Router, Request, Response } from 'express';
import {
  fetchWeatherData,
  reverseGeocodeCoords,
  DISTRICT_COORDINATES,
} from '../services/weatherService';
import { INDIA_LOCATIONS } from '../data/indiaLocations';
import { getLocationConditions } from '../services/seasonService';
import { createRateLimiter } from '../middleware/rateLimiter';

const router = Router();

const reverseGeocodeRateLimiter = createRateLimiter({
  keyPrefix: 'weather-reverse',
  windowMs: 60 * 1000,
  maxRequests: () => {
    const envMax = parseInt(process.env.REVERSE_GEOCODE_RATE_LIMIT_MAX || '', 10);
    if (!isNaN(envMax) && envMax > 0) return envMax;
    return process.env.NODE_ENV === 'production' ? 30 : 120;
  },
  message: 'Too many reverse-geocoding requests. Please wait a moment before trying again.',
});

// 1. Get structured India locations (States -> Districts -> Taluks) for dropdown selection
router.get('/locations', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: INDIA_LOCATIONS,
  });
});

// 2. Reverse-geocode coordinates to a readable place (village/town, district, state)
router.get('/reverse', reverseGeocodeRateLimiter, async (req: Request, res: Response) => {
  try {
    const latStr = req.query.lat as string | undefined;
    const lonStr = req.query.lon as string | undefined;

    if (latStr === undefined || lonStr === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing lat or lon query parameter for reverse geocoding.',
      });
    }

    const lat = parseFloat(latStr);
    const lon = parseFloat(lonStr);

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid lat or lon numeric values.',
      });
    }

    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return res.status(400).json({
        success: false,
        message: 'Coordinates out of geographical bounds.',
      });
    }

    const result = await reverseGeocodeCoords(lat, lon);
    res.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Failed to reverse geocode coordinates',
    });
  }
});

// 3. Get location-based conditions (Agro-climatic zone, season, live weather, typical soils)
router.get('/location-conditions', async (req: Request, res: Response) => {
  try {
    const lat = req.query.lat !== undefined ? parseFloat(req.query.lat as string) : undefined;
    const lon = req.query.lon !== undefined ? parseFloat(req.query.lon as string) : undefined;
    const state = req.query.state as string | undefined;
    const district = req.query.district as string | undefined;
    const taluk = req.query.taluk as string | undefined;

    const hasValidCoords = lat !== undefined && !isNaN(lat) && lon !== undefined && !isNaN(lon);
    if (!district && !state && !hasValidCoords) {
      return res.status(400).json({
        success: false,
        needsLocation: true,
        message: 'Farm location is missing. Please provide your district or GPS coordinates.',
      });
    }

    const conditions = getLocationConditions(
      hasValidCoords ? lat : undefined,
      hasValidCoords ? lon : undefined,
      state,
      district,
      taluk
    );
    const targetDistrict = district || conditions.location?.district;
    const weather = await fetchWeatherData(
      targetDistrict,
      hasValidCoords ? lat : undefined,
      hasValidCoords ? lon : undefined
    );

    res.json({
      success: true,
      data: {
        ...conditions,
        weather,
      },
    });
  } catch (err: any) {
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Failed to retrieve location conditions',
    });
  }
});

// 4. Get weather forecast
router.get('/', async (req: Request, res: Response) => {
  try {
    const district = req.query.district as string | undefined;
    const rawLat = req.query.lat as string | undefined;
    const rawLon = req.query.lon as string | undefined;
    const hasLatOrLon = rawLat !== undefined || rawLon !== undefined;
    const lat = rawLat !== undefined ? parseFloat(rawLat) : undefined;
    const lon = rawLon !== undefined ? parseFloat(rawLon) : undefined;
    const allowDemo = req.query.demo === 'true';

    if (hasLatOrLon) {
      if (
        rawLat === undefined ||
        rawLon === undefined ||
        lat === undefined ||
        lon === undefined ||
        isNaN(lat) ||
        isNaN(lon) ||
        lat < -90 ||
        lat > 90 ||
        lon < -180 ||
        lon > 180
      ) {
        return res.status(400).json({
          success: false,
          message: 'Invalid coordinates. Provide valid lat (-90..90) and lon (-180..180).',
        });
      }
    }

    if (!district && (lat === undefined || lon === undefined)) {
      return res.status(400).json({
        success: false,
        needsLocation: true,
        message: 'Farm location is missing. Please set your farm location (district or GPS coordinates).',
      });
    }

    const weather = await fetchWeatherData(district, lat, lon, allowDemo);
    res.json({
      success: true,
      data: weather,
    });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message || 'Failed to retrieve weather data' });
  }
});

// 5. Get available districts (convenience list for the "Change" sheet)
router.get('/districts', (_req: Request, res: Response) => {
  const districts = Object.keys(DISTRICT_COORDINATES).map((name) => ({
    name,
    state: DISTRICT_COORDINATES[name].state,
    lat: DISTRICT_COORDINATES[name].lat,
    lon: DISTRICT_COORDINATES[name].lon,
  }));

  res.json({
    success: true,
    data: districts,
  });
});

export default router;
