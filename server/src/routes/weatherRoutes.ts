import { Router, Request, Response } from 'express';
import { fetchWeatherData, DISTRICT_COORDINATES } from '../services/weatherService';

const router = Router();

// Get weather forecast
router.get('/', async (req: Request, res: Response) => {
  try {
    const district = (req.query.district as string) || 'Mandya';
    const lat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
    const lon = req.query.lon ? parseFloat(req.query.lon as string) : undefined;

    const weather = await fetchWeatherData(district, lat, lon);
    res.json({
      success: true,
      data: weather,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve weather data' });
  }
});

// Get available locations/districts
router.get('/districts', (_req: Request, res: Response) => {
  const districts = Object.keys(DISTRICT_COORDINATES).map(name => ({
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
