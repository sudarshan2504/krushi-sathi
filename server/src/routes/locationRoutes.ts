import { Router, Request, Response } from 'express';
import { reverseGeocode, getLocationFromIp } from '../services/locationService';

const router = Router();

/**
 * POST /api/location/reverse-geocode
 * Converts lat/lon into village, taluk, district, and state.
 * Privacy note: coordinates are NEVER printed in server logs.
 */
router.post('/reverse-geocode', async (req: Request, res: Response) => {
  try {
    const { latitude, longitude, accuracy } = req.body;

    const lat = typeof latitude === 'number' ? latitude : parseFloat(latitude);
    const lon = typeof longitude === 'number' ? longitude : parseFloat(longitude);
    const acc = accuracy ? (typeof accuracy === 'number' ? accuracy : parseFloat(accuracy)) : undefined;

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({
        success: false,
        message: 'Valid latitude and longitude numbers are required',
      });
    }

    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return res.status(400).json({
        success: false,
        message: 'Coordinates out of geographical bounds',
      });
    }

    const result = await reverseGeocode(lat, lon, acc);

    res.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to reverse geocode location',
    });
  }
});

/**
 * GET /api/location/ip-location
 * Approximate IP-based location fallback when geolocation is denied or times out.
 */
router.get('/ip-location', async (req: Request, res: Response) => {
  try {
    // Extract client IP if behind reverse proxy
    const forwarded = req.headers['x-forwarded-for'];
    const clientIp = typeof forwarded === 'string'
      ? forwarded.split(',')[0].trim()
      : req.socket.remoteAddress;

    const result = await getLocationFromIp(clientIp);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Could not determine location from IP',
      });
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve IP location',
    });
  }
});

export default router;
