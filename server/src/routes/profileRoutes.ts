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
    } = req.body;

    const latVal = latitude !== undefined && latitude !== null ? parseFloat(latitude) : undefined;
    const lonVal = longitude !== undefined && longitude !== null ? parseFloat(longitude) : undefined;

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name !== undefined ? name.trim() : user.name,
        state: state || user.state,
        district: district || user.district,
        village: village !== undefined ? village : user.village,
        taluk: taluk !== undefined ? taluk : user.taluk,
        farmSize: farmSize ? parseFloat(farmSize) : user.farmSize,
        farmUnit: farmUnit || user.farmUnit,
        language: language || user.language,
        avatar: avatar !== undefined ? avatar : user.avatar,
        latitude: latVal !== undefined && !isNaN(latVal) && latVal >= -90 && latVal <= 90 ? latVal : undefined,
        longitude: lonVal !== undefined && !isNaN(lonVal) && lonVal >= -180 && lonVal <= 180 ? lonVal : undefined,
        locationAccuracy: locationAccuracy !== undefined ? parseFloat(locationAccuracy) || null : undefined,
        locationSource: locationSource !== undefined ? String(locationSource) : undefined,
      },
    });

    res.json({
      success: true,
      data: updated,
      message: 'Profile updated successfully',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

export default router;
