import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';
import { calculateCropRecommendations } from '../services/recommendationEngine';

const router = Router();

// Submit Soil & Field Assessment
router.post('/assessments', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const {
      state,
      district,
      village,
      farmSize,
      farmUnit,
      soilType,
      ph,
      nitrogen,
      phosphorus,
      potassium,
      waterSource,
      irrigationType,
      season,
      sowingMonth,
      previousCrop,
      budget,
      drainage,
      soilIssues,
      soilColour,
      soilTexture,
      moistureLevel,
      organicMatter,
      taluk,
      landSizeGuntas,
      category,
      npkNitrogen,
      npkPhosphorus,
      npkPotassium,
      agroZone,
    } = req.body;

    if (typeof soilType !== 'string' || !soilType.trim() || typeof waterSource !== 'string' || !waterSource.trim()) {
      return res.status(400).json({ success: false, message: 'Valid soil type and water source are required' });
    }

    let parsedPh: number | null = null;
    if (ph !== undefined && ph !== null && ph !== '') {
      parsedPh = Number(ph);
      if (!Number.isFinite(parsedPh) || parsedPh < 0 || parsedPh > 14) {
        return res.status(400).json({ success: false, message: 'Soil pH must be a number between 0 and 14' });
      }
    }

    let parsedFarmSize = user.farmSize || 2.5;
    if (farmSize !== undefined && farmSize !== null && farmSize !== '') {
      parsedFarmSize = Number(farmSize);
      if (!Number.isFinite(parsedFarmSize) || parsedFarmSize <= 0 || parsedFarmSize > 100000) {
        return res.status(400).json({ success: false, message: 'farmSize must be a positive number' });
      }
    }

    const parseOptionalNonNegative = (val: unknown, field: string): number | null => {
      if (val === undefined || val === null || val === '') return null;
      const n = Number(val);
      if (!Number.isFinite(n) || n < 0) {
        const err: any = new Error(`${field} must be a non-negative number`);
        err.status = 400;
        throw err;
      }
      return n;
    };

    const parsedN = parseOptionalNonNegative(nitrogen, 'nitrogen');
    const parsedP = parseOptionalNonNegative(phosphorus, 'phosphorus');
    const parsedK = parseOptionalNonNegative(potassium, 'potassium');
    const parsedGuntas = parseOptionalNonNegative(landSizeGuntas, 'landSizeGuntas');

    // Save assessment to database
    const assessment = await prisma.soilAssessment.create({
      data: {
        userId: user.id,
        state: state || user.state || 'Karnataka',
        district: district || user.district || '',
        village: village || user.village || '',
        taluk: taluk || user.taluk || null,
        farmSize: parsedFarmSize,
        farmUnit: farmUnit || user.farmUnit || 'Acres',
        landSizeGuntas: parsedGuntas,
        soilType: soilType.trim().toLowerCase(),
        soilColour: soilColour || null,
        soilTexture: soilTexture || null,
        moistureLevel: moistureLevel || null,
        organicMatter: organicMatter || null,
        category: category || null,
        ph: parsedPh,
        nitrogen: parsedN,
        phosphorus: parsedP,
        potassium: parsedK,
        npkNitrogen: npkNitrogen || null,
        npkPhosphorus: npkPhosphorus || null,
        npkPotassium: npkPotassium || null,
        waterSource: waterSource.trim().toLowerCase(),
        irrigationType: irrigationType ? String(irrigationType).toLowerCase() : null,
        season: season || 'Kharif',
        sowingMonth: sowingMonth || null,
        previousCrop: previousCrop || null,
        budget: budget ? String(budget).toLowerCase() : 'medium',
        drainage: drainage ? String(drainage).toLowerCase() : 'good',
        soilIssues: soilIssues || null,
      },
    });

    // Run crop recommendation algorithm with rich context
    const recommendations = calculateCropRecommendations({
      soilType: assessment.soilType,
      soilColour: assessment.soilColour,
      soilTexture: assessment.soilTexture,
      moistureLevel: assessment.moistureLevel,
      organicMatter: assessment.organicMatter,
      waterSource: assessment.waterSource,
      irrigationType: assessment.irrigationType || undefined,
      season: assessment.season,
      state: assessment.state,
      district: assessment.district,
      latitude: user.latitude || undefined,
      longitude: user.longitude || undefined,
      ph: assessment.ph,
      nitrogen: assessment.nitrogen,
      phosphorus: assessment.phosphorus,
      potassium: assessment.potassium,
      npkNitrogen: assessment.npkNitrogen,
      npkPhosphorus: assessment.npkPhosphorus,
      npkPotassium: assessment.npkPotassium,
      previousCrop: assessment.previousCrop,
      budget: assessment.budget,
      drainage: assessment.drainage,
      category: assessment.category,
      agroZone: agroZone || undefined,
      landSize: assessment.farmSize,
      landSizeGuntas: assessment.landSizeGuntas,
    });

    // Save recommendation results
    await prisma.cropRecommendation.create({
      data: {
        userId: user.id,
        soilAssessmentId: assessment.id,
        results: JSON.stringify(recommendations),
      },
    });

    res.json({
      success: true,
      data: {
        assessment,
        recommendations,
      },
      message: 'Soil assessment completed and recommendations generated successfully!',
    });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message || 'Failed to process soil assessment' });
  }
});

// Get user's past soil assessments
router.get('/assessments', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const assessments = await prisma.soilAssessment.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        cropRecommendations: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    res.json({
      success: true,
      data: assessments.map(a => ({
        ...a,
        latestRecommendations: a.cropRecommendations[0]?.results
          ? JSON.parse(a.cropRecommendations[0].results)
          : null,
      })),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch assessments' });
  }
});

// Get single assessment
router.get('/assessments/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const assessment = await prisma.soilAssessment.findUnique({
      where: { id: req.params.id },
      include: {
        cropRecommendations: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!assessment || assessment.userId !== req.user!.id) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    res.json({
      success: true,
      data: {
        ...assessment,
        recommendations: assessment.cropRecommendations[0]?.results
          ? JSON.parse(assessment.cropRecommendations[0].results)
          : null,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch assessment' });
  }
});

export default router;
