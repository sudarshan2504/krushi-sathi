import { Router, Request, Response } from 'express';
import {
  detectSeasonFromLocation,
  getCropSowingStatus,
} from '../services/seasonService';
import { REGIONAL_SEASON_RULES } from '../data/seasonRules';
import { CROPS_DATA } from '../data/cropKnowledge';

const router = Router();

/**
 * 1. Automatically detect current agricultural season and sowing window from location + date
 * GET /api/season/detect?state=...&district=...&lat=...&lon=...
 */
router.get('/detect', async (req: Request, res: Response) => {
  try {
    const state = req.query.state as string | undefined;
    const district = req.query.district as string | undefined;
    const lat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
    const lon = req.query.lon ? parseFloat(req.query.lon as string) : undefined;

    // Strict location check: Never silently default to Mandya
    if (!state && !district && (lat === undefined || lon === undefined)) {
      return res.status(400).json({
        success: false,
        needsLocation: true,
        message: 'Farm location required. Please select your district or enable GPS location.',
      });
    }

    const detected = detectSeasonFromLocation(state, district, lat, lon);
    if (!detected) {
      return res.status(404).json({
        success: false,
        message: 'Could not determine seasonal calendar for this location.',
      });
    }

    // Compute sowing window status for all crops
    const cropStatuses = CROPS_DATA.map((crop) => ({
      cropId: crop.id,
      cropName: crop.name,
      sowingMonths: crop.sowingMonths,
      seasons: crop.seasons,
      sowingStatus: getCropSowingStatus(crop, detected),
    }));

    return res.json({
      success: true,
      data: {
        season: detected,
        cropStatuses,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error('Season detection error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to detect agricultural season',
    });
  }
});

/**
 * 2. Get list of regional season rules for verification
 * GET /api/season/verification-list
 */
router.get('/verification-list', (_req: Request, res: Response) => {
  const list = REGIONAL_SEASON_RULES.map((rule) => ({
    id: rule.id,
    state: rule.state,
    regionName: rule.regionName,
    standardSeason: rule.standardSeason,
    localName: rule.localName,
    sowingWindow: `${rule.sowingWindowStart.month}/${rule.sowingWindowStart.day} to ${rule.sowingWindowEnd.month}/${rule.sowingWindowEnd.day}`,
    peakSowingMonths: rule.peakSowingMonths,
    harvestMonths: rule.harvestMonths,
    primaryCrops: rule.primaryCrops,
    verified: rule.verified,
    verificationNote: rule.verificationNote,
  }));

  return res.json({
    success: true,
    totalRules: list.length,
    unverifiedCount: list.filter((r) => !r.verified).length,
    data: list,
  });
});

/**
 * 3. Crop Sowing Window Status for a specific crop
 * GET /api/season/crop-status/:cropId?state=...&district=...
 */
router.get('/crop-status/:cropId', (req: Request, res: Response) => {
  const { cropId } = req.params;
  const state = req.query.state as string | undefined;
  const district = req.query.district as string | undefined;

  const crop = CROPS_DATA.find((c) => c.id === cropId);
  if (!crop) {
    return res.status(404).json({ success: false, message: 'Crop not found' });
  }

  const detected = detectSeasonFromLocation(state, district);
  const status = getCropSowingStatus(crop, detected);

  return res.json({
    success: true,
    data: {
      cropId: crop.id,
      cropName: crop.name,
      season: detected,
      sowingStatus: status,
    },
  });
});

export default router;
