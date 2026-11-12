import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';

const router = Router();

// Get full farmer profile with stats
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;

    // Fetch user's soil assessments count & latest
    const assessments = await prisma.soilAssessment.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // Fetch crop plans (active & completed)
    const plans = await prisma.cropPlan.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        crop: true,
        tasks: true,
      },
    });

    const activePlans = plans.filter(p => p.status === 'active');
    const pastPlans = plans.filter(p => p.status !== 'active');

    let totalCompletedTasks = 0;
    let totalTasksCount = 0;
    for (const p of plans) {
      totalCompletedTasks += p.tasks.filter(t => t.isCompleted).length;
      totalTasksCount += p.tasks.length;
    }

    // Chat conversations count
    const chatCount = await prisma.chatConversation.count({
      where: { userId: user.id },
    });

    res.json({
      success: true,
      data: {
        user,
        stats: {
          assessmentCount: assessments.length,
          activeCropCount: activePlans.length,
          totalCompletedTasks,
          totalTasksCount,
          chatCount,
        },
        assessments,
        currentCrops: activePlans.map(p => ({
          planId: p.id,
          cropName: p.cropName,
          category: p.crop.category,
          fieldName: p.fieldName,
          areaAcre: p.areaAcre,
          startDate: p.startDate,
          imageUrl: p.crop.imageUrl,
          completedTasks: p.tasks.filter(t => t.isCompleted).length,
          totalTasks: p.tasks.length,
          progressPercentage: p.tasks.length > 0
            ? Math.round((p.tasks.filter(t => t.isCompleted).length / p.tasks.length) * 100)
            : 0,
        })),
        previousCrops: pastPlans.map(p => ({
          planId: p.id,
          cropName: p.cropName,
          status: p.status,
          startDate: p.startDate,
        })),
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch farmer profile' });
  }
});

// Update profile details
router.put('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const {
      name,
      state,
      district,
      village,
      taluk,
      farmSize,
      farmUnit,
      language,
      avatar,
      latitude,
      longitude,
      locationAccuracy,
      locationSource,
    } = req.body || {};

    const VALID_LANGS = ['en', 'kn', 'ta', 'te'];

    if (name !== undefined && (typeof name !== 'string' || !name.trim())) {
      return res.status(400).json({ success: false, message: 'Name must be a non-empty string' });
    }
    if (language !== undefined && (typeof language !== 'string' || !VALID_LANGS.includes(language.trim()))) {
      return res.status(400).json({ success: false, message: 'Invalid language selection. Allowed: en, kn, ta, te' });
    }

    let parsedFarmSize = user.farmSize;
    if (farmSize !== undefined && farmSize !== null && farmSize !== '') {
      parsedFarmSize = Number(farmSize);
      if (!Number.isFinite(parsedFarmSize) || parsedFarmSize <= 0 || parsedFarmSize > 100000) {
        return res.status(400).json({ success: false, message: 'farmSize must be a positive number' });
      }
    }

    let latVal: number | undefined;
    if (latitude !== undefined && latitude !== null && latitude !== '') {
      latVal = Number(latitude);
      if (!Number.isFinite(latVal) || latVal < -90 || latVal > 90) {
        return res.status(400).json({ success: false, message: 'latitude must be between -90 and 90' });
      }
    }

    let lonVal: number | undefined;
    if (longitude !== undefined && longitude !== null && longitude !== '') {
      lonVal = Number(longitude);
      if (!Number.isFinite(lonVal) || lonVal < -180 || lonVal > 180) {
        return res.status(400).json({ success: false, message: 'longitude must be between -180 and 180' });
      }
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name !== undefined ? name.trim() : user.name,
        state: typeof state === 'string' && state.trim() ? state.trim() : user.state,
        district: typeof district === 'string' && district.trim() ? district.trim() : user.district,
        village: village !== undefined ? village : user.village,
        taluk: taluk !== undefined ? taluk : user.taluk,
        farmSize: parsedFarmSize,
        farmUnit: typeof farmUnit === 'string' && farmUnit.trim() ? farmUnit.trim() : user.farmUnit,
        language: language !== undefined ? language.trim() : user.language,
        avatar: avatar !== undefined ? avatar : user.avatar,
        latitude: latVal,
        longitude: lonVal,
        locationAccuracy: locationAccuracy !== undefined && locationAccuracy !== null ? parseFloat(locationAccuracy) || null : undefined,
        locationSource: locationSource !== undefined ? String(locationSource) : undefined,
      },
    });

    res.json({
      success: true,
      data: updated,
      message: 'Profile updated successfully',
    });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message || 'Failed to update profile' });
  }
});

export default router;
