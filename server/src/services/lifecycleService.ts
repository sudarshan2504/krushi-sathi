import prisma from '../utils/prisma';
import { CROPS_DATA } from '../data/cropKnowledge';

export async function createCropPlan(data: {
  userId: string;
  cropId: string;
  fieldName?: string;
  areaAcre?: number;
}) {
  // Find crop from database or data file
  let crop = await prisma.crop.findUnique({
    where: { id: data.cropId },
  });

  const cropKnowledge = CROPS_DATA.find(c => c.id === data.cropId) || CROPS_DATA[0];

  if (!crop) {
    // If not seeded yet, create crop record
    crop = await prisma.crop.create({
      data: {
        id: cropKnowledge.id,
        name: cropKnowledge.name,
        scientificName: cropKnowledge.scientificName,
        nameKannada: cropKnowledge.nameKannada,
        nameTamil: cropKnowledge.nameTamil,
        nameTelugu: cropKnowledge.nameTelugu,
        category: cropKnowledge.category,
        idealSoilTypes: JSON.stringify(cropKnowledge.idealSoilTypes),
        minPh: cropKnowledge.minPh,
        maxPh: cropKnowledge.maxPh,
        waterRequirement: cropKnowledge.waterRequirement,
        waterMm: cropKnowledge.waterMm,
        durationDays: cropKnowledge.durationDays,
        durationMin: cropKnowledge.durationMin,
        durationMax: cropKnowledge.durationMax,
        seasons: JSON.stringify(cropKnowledge.seasons),
        estimatedCostPerAcre: cropKnowledge.estimatedCostPerAcre,
        potentialYieldPerAcre: cropKnowledge.potentialYieldPerAcre,
        marketDemand: cropKnowledge.marketDemand,
        description: cropKnowledge.description,
        descriptionKn: cropKnowledge.descriptionKn,
        descriptionTa: cropKnowledge.descriptionTa,
        descriptionTe: cropKnowledge.descriptionTe,
        imageUrl: cropKnowledge.imageUrl,
        risks: JSON.stringify(cropKnowledge.risks),
        benefits: JSON.stringify(cropKnowledge.benefits),
      },
    });
  }

  // Create CropPlan
  const plan = await prisma.cropPlan.create({
    data: {
      userId: data.userId,
      cropId: crop.id,
      cropName: crop.name,
      fieldName: data.fieldName || 'Main Field',
      areaAcre: data.areaAcre || 1.0,
      currentStageIndex: 0,
      status: 'active',
    },
  });

  // Seed tasks from template stages
  const tasksToCreate: any[] = [];
  for (const stg of cropKnowledge.stages) {
    for (const t of stg.tasks) {
      tasksToCreate.push({
        cropPlanId: plan.id,
        stage: stg.stage,
        stageOrder: stg.stageOrder,
        dayRange: stg.dayRange,
        dayOffset: stg.dayOffset,
        title: t.title,
        titleKn: t.titleKn,
        titleTa: t.titleTa,
        titleTe: t.titleTe,
        description: t.description,
        descriptionKn: stg.descriptionKn,
        descriptionTa: stg.descriptionTa,
        descriptionTe: stg.descriptionTe,
        category: stg.category,
        materialsNeeded: JSON.stringify(stg.materialsNeeded),
        importantTip: stg.importantTip,
        importantTipKn: stg.importantTipKn,
        importantTipTa: stg.importantTipTa,
        importantTipTe: stg.importantTipTe,
        isCompleted: false,
      });
    }
  }

  await prisma.cropTask.createMany({
    data: tasksToCreate,
  });

  return getCropPlanDetails(plan.id);
}

export async function getCropPlanDetails(planId: string) {
  const plan = await prisma.cropPlan.findUnique({
    where: { id: planId },
    include: {
      crop: true,
      tasks: {
        orderBy: [{ stageOrder: 'asc' }, { id: 'asc' }],
      },
    },
  });

  if (!plan) return null;

  const totalTasks = plan.tasks.length;
  const completedTasks = plan.tasks.filter(t => t.isCompleted).length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Group tasks by stage
  const stagesMap = new Map<string, any>();
  for (const task of plan.tasks) {
    if (!stagesMap.has(task.stage)) {
      stagesMap.set(task.stage, {
        stage: task.stage,
        stageOrder: task.stageOrder,
        dayRange: task.dayRange,
        dayOffset: task.dayOffset,
        importantTip: task.importantTip,
        importantTipKn: task.importantTipKn,
        importantTipTa: task.importantTipTa,
        importantTipTe: task.importantTipTe,
        materialsNeeded: task.materialsNeeded ? JSON.parse(task.materialsNeeded) : [],
        tasks: [],
      });
    }
    stagesMap.get(task.stage).tasks.push(task);
  }

  const stages = Array.from(stagesMap.values()).sort((a, b) => a.stageOrder - b.stageOrder);

  return {
    ...plan,
    totalTasks,
    completedTasks,
    progressPercentage,
    stages,
  };
}

export async function toggleTaskCompletion(taskId: string, isCompleted: boolean) {
  const task = await prisma.cropTask.update({
    where: { id: taskId },
    data: {
      isCompleted,
      completedAt: isCompleted ? new Date() : null,
    },
  });

  const updatedPlan = await getCropPlanDetails(task.cropPlanId);
  return {
    task,
    plan: updatedPlan,
  };
}
