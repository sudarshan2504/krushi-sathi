import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';
import { createCropPlan, getCropPlanDetails, toggleTaskCompletion } from '../services/lifecycleService';

const router = Router();

// Get all crop plans of authenticated farmer
router.get('/plans', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const plans = await prisma.cropPlan.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        crop: true,
        tasks: true,
      },
    });

    const formattedPlans = plans.map(p => {
      const total = p.tasks.length;
      const completed = p.tasks.filter(t => t.isCompleted).length;
      return {
        id: p.id,
        cropId: p.cropId,
        cropName: p.cropName,
        fieldName: p.fieldName,
        areaAcre: p.areaAcre,
        startDate: p.startDate,
        status: p.status,
        crop: p.crop,
        totalTasks: total,
        completedTasks: completed,
        progressPercentage: total > 0 ? Math.round((completed / total) * 100) : 0,
        currentStage: p.tasks.find(t => !t.isCompleted)?.stage || 'Completed',
      };
    });

    res.json({
      success: true,
      data: formattedPlans,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve crop plans' });
  }
});

// Create new crop plan
router.post('/plans', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { cropId, fieldName, areaAcre } = req.body;

    if (!cropId) {
      return res.status(400).json({ success: false, message: 'Crop ID is required' });
    }

    const plan = await createCropPlan({
      userId: user.id,
      cropId,
      fieldName: fieldName || 'Main Field',
      areaAcre: areaAcre ? parseFloat(areaAcre) : user.farmSize || 1.0,
    });

    res.json({
      success: true,
      data: plan,
      message: 'Crop lifecycle plan created! You can now track stage tasks from sowing to harvest.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to create crop plan' });
  }
});

// Get single crop plan with all stages and tasks
router.get('/plans/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const plan = await getCropPlanDetails(req.params.id);
    if (!plan || plan.userId !== req.user!.id) {
      return res.status(404).json({ success: false, message: 'Crop plan not found' });
    }

    res.json({
      success: true,
      data: plan,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve plan details' });
  }
});

// Toggle task completion
router.patch('/tasks/:taskId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const { isCompleted } = req.body;

    if (typeof isCompleted !== 'boolean') {
      return res.status(400).json({ success: false, message: 'isCompleted boolean is required' });
    }

    // Verify task belongs to user's plan
    const task = await prisma.cropTask.findUnique({
      where: { id: taskId },
      include: { cropPlan: true },
    });

    if (!task || task.cropPlan.userId !== req.user!.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized task modification' });
    }

    const result = await toggleTaskCompletion(taskId, isCompleted);

    res.json({
      success: true,
      data: result,
      message: isCompleted ? 'Task marked as completed!' : 'Task uncompleted',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to toggle task' });
  }
});

// Delete crop plan
router.delete('/plans/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const plan = await prisma.cropPlan.findUnique({
      where: { id: req.params.id },
    });

    if (!plan || plan.userId !== req.user!.id) {
      return res.status(404).json({ success: false, message: 'Crop plan not found' });
    }

    await prisma.cropPlan.delete({
      where: { id: req.params.id },
    });

    res.json({
      success: true,
      message: 'Crop plan deleted successfully',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to delete crop plan' });
  }
});

export default router;
