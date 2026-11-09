import { Router, Request, Response } from 'express';
import {
  fetchWeatherData,
  reverseGeocodeCoords,
  DISTRICT_COORDINATES,
} from '../services/weatherService';
import { INDIA_LOCATIONS } from '../data/indiaLocations';
import { getLocationConditions } from '../services/seasonService';

const router = Router();

// 1. Get structured India locations (States -> Districts -> Taluks) for dropdown selection
router.get('/locations', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: INDIA_LOCATIONS,
  });
});

// 2. Reverse-geocode coordinates to a readable place (village/town, district, state)
router.get('/reverse', async (req: Request, res: Response) => {
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

    const result = await reverseGeocodeCoords(lat, lon);
    res.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to reverse geocode coordinates',
    });
  }
});

// 3. Get location-based conditions (Agro-climatic zone, season, live weather, typical soils)
router.get('/location-conditions', async (req: Request, res: Response) => {
  try {
    const lat = req.query.lat ? parseFloat(req.query.lat as string) : 12.5244;
    const lon = req.query.lon ? parseFloat(req.query.lon as string) : 76.8969;
    const state = req.query.state as string;
    const district = req.query.district as string;
    const taluk = req.query.taluk as string;

    const conditions = getLocationConditions(lat, lon, state, district, taluk);
    const targetDistrict = conditions.location?.district || district || 'Mandya';
    const weather = await fetchWeatherData(targetDistrict, lat, lon);

    res.json({
      success: true,
      data: {
        ...conditions,
        weather,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve location conditions' });
  }
});

// 4. Get weather forecast
router.get('/', async (req: Request, res: Response) => {
  try {
    const district = req.query.district as string | undefined;
    const lat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
    const lon = req.query.lon ? parseFloat(req.query.lon as string) : undefined;
    const allowDemo = req.query.demo === 'true';

    if (!district && (lat === undefined || isNaN(lat) || lon === undefined || isNaN(lon))) {
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
    res.status(500).json({ success: false, message: err.message || 'Failed to retrieve weather data' });
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
