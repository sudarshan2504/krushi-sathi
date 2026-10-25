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

    if (!soilType || !waterSource) {
      return res.status(400).json({ success: false, message: 'Soil type and water source are required' });
    }

    // Save assessment to database
    const assessment = await prisma.soilAssessment.create({
      data: {
        userId: user.id,
        state: state || user.state || 'Karnataka',
        district: district || user.district || '',
        village: village || user.village || '',
        taluk: taluk || user.taluk || null,
        farmSize: farmSize ? parseFloat(farmSize) : user.farmSize || 2.5,
        farmUnit: farmUnit || user.farmUnit || 'Acres',
        landSizeGuntas: landSizeGuntas ? parseFloat(landSizeGuntas) : null,
        soilType: soilType.toLowerCase(),
        soilColour: soilColour || null,
        soilTexture: soilTexture || null,
        moistureLevel: moistureLevel || null,
        organicMatter: organicMatter || null,
        category: category || null,
        ph: ph ? parseFloat(ph) : null,
        nitrogen: nitrogen ? parseFloat(nitrogen) : null,
        phosphorus: phosphorus ? parseFloat(phosphorus) : null,
        potassium: potassium ? parseFloat(potassium) : null,
        npkNitrogen: npkNitrogen || null,
        npkPhosphorus: npkPhosphorus || null,
        npkPotassium: npkPotassium || null,
        waterSource: waterSource.toLowerCase(),
        irrigationType: irrigationType ? irrigationType.toLowerCase() : null,
        season: season || 'Kharif',
        sowingMonth: sowingMonth || null,
        previousCrop: previousCrop || null,
        budget: budget ? budget.toLowerCase() : 'medium',
        drainage: drainage ? drainage.toLowerCase() : 'good',
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
    res.status(500).json({ success: false, message: err.message || 'Failed to process soil assessment' });
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
