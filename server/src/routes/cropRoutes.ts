import { Router, Request, Response } from 'express';
import { CROPS_DATA } from '../data/cropKnowledge';
import { calculateCropRecommendations } from '../services/recommendationEngine';
import { optionalAuthMiddleware, AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';

const router = Router();

// List all crops
router.get('/', async (req: Request, res: Response) => {
  const { category, search } = req.query;

  let crops = CROPS_DATA;

  if (category) {
    crops = crops.filter(c => c.category.toLowerCase() === (category as string).toLowerCase());
  }

  if (search) {
    const q = (search as string).toLowerCase();
    crops = crops.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        c.nameKannada.includes(q) ||
        c.nameTamil.includes(q) ||
        c.nameTelugu.includes(q) ||
        c.description.toLowerCase().includes(q)
    );
  }

  res.json({
    success: true,
    data: crops.map(c => ({
      id: c.id,
      name: c.name,
      nameKannada: c.nameKannada,
      nameTamil: c.nameTamil,
      nameTelugu: c.nameTelugu,
      category: c.category,
      idealSoilTypes: c.idealSoilTypes,
      waterRequirement: c.waterRequirement,
      durationDays: c.durationDays,
      seasons: c.seasons,
      estimatedCostPerAcre: c.estimatedCostPerAcre,
      potentialYieldPerAcre: c.potentialYieldPerAcre,
      imageUrl: c.imageUrl,
      description: c.description,
      descriptionKn: c.descriptionKn,
      descriptionTa: c.descriptionTa,
      descriptionTe: c.descriptionTe,
      stageCount: c.stages.length,
    })),
  });
});

// Get single crop by id or slug
router.get('/:id', (req: Request, res: Response) => {
  const q = (req.params.id || '').toLowerCase().trim();
  const crop = CROPS_DATA.find(
    c =>
      c.id.toLowerCase() === q ||
      c.id.replace('crop-', '').toLowerCase() === q ||
      c.name.toLowerCase().replace(/[^a-z0-9]/g, '').includes(q.replace(/[^a-z0-9]/g, '')) ||
      q.includes(c.id.replace('crop-', '').toLowerCase())
  );

  if (!crop) {
    return res.status(404).json({ success: false, message: 'Crop not found' });
  }

  res.json({
    success: true,
    data: crop,
  });
});

// Quick recommendation endpoint
router.post('/recommend', optionalAuthMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { soilType, waterSource, season, previousCrop, budget, ph, drainage } = req.body;

    const recommendations = calculateCropRecommendations({
      soilType: soilType || 'loamy',
      waterSource: waterSource || 'borewell',
      season: season || 'Kharif',
      previousCrop,
      budget,
      ph: ph ? parseFloat(ph) : undefined,
      drainage,
    });

    res.json({
      success: true,
      data: recommendations,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || 'Recommendation failed' });
  }
});

export default router;
