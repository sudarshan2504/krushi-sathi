import { PrismaClient } from '@prisma/client';
import { CROPS_DATA } from '../src/data/cropKnowledge';
import { DISEASES_DATA } from '../src/data/diseaseKnowledge';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Krishi Sathi database seed...');

  // 1. Seed or update demo farmer Ramesh Kumar (matches reference mockup)
  const demoFarmer = await prisma.user.upsert({
    where: { phone: '9876543210' },
    update: {
      name: 'Ramesh Kumar',
      state: 'Karnataka',
      district: 'Mandya',
      village: 'Koppa, Maddur',
      farmSize: 2.5,
      farmUnit: 'Acres',
      language: 'en',
    },
    create: {
      phone: '9876543210',
      name: 'Ramesh Kumar',
      state: 'Karnataka',
      district: 'Mandya',
      village: 'Koppa, Maddur',
      farmSize: 2.5,
      farmUnit: 'Acres',
      language: 'en',
    },
  });

  console.log(`👤 Seeded demo farmer: ${demoFarmer.name} (${demoFarmer.phone})`);

  // 2. Seed all Crops
  for (const crop of CROPS_DATA) {
    await prisma.crop.upsert({
      where: { id: crop.id },
      update: {
        name: crop.name,
        scientificName: crop.scientificName,
        nameKannada: crop.nameKannada,
        nameTamil: crop.nameTamil,
        nameTelugu: crop.nameTelugu,
        category: crop.category,
        idealSoilTypes: JSON.stringify(crop.idealSoilTypes),
        minPh: crop.minPh,
        maxPh: crop.maxPh,
        waterRequirement: crop.waterRequirement,
        waterMm: crop.waterMm,
        durationDays: crop.durationDays,
        durationMin: crop.durationMin,
        durationMax: crop.durationMax,
        seasons: JSON.stringify(crop.seasons),
        estimatedCostPerAcre: crop.estimatedCostPerAcre,
        potentialYieldPerAcre: crop.potentialYieldPerAcre,
        marketDemand: crop.marketDemand,
        description: crop.description,
        descriptionKn: crop.descriptionKn,
        descriptionTa: crop.descriptionTa,
        descriptionTe: crop.descriptionTe,
        imageUrl: crop.imageUrl,
        risks: JSON.stringify(crop.risks),
        benefits: JSON.stringify(crop.benefits),
      },
      create: {
        id: crop.id,
        name: crop.name,
        scientificName: crop.scientificName,
        nameKannada: crop.nameKannada,
        nameTamil: crop.nameTamil,
        nameTelugu: crop.nameTelugu,
        category: crop.category,
        idealSoilTypes: JSON.stringify(crop.idealSoilTypes),
        minPh: crop.minPh,
        maxPh: crop.maxPh,
        waterRequirement: crop.waterRequirement,
        waterMm: crop.waterMm,
        durationDays: crop.durationDays,
        durationMin: crop.durationMin,
        durationMax: crop.durationMax,
        seasons: JSON.stringify(crop.seasons),
        estimatedCostPerAcre: crop.estimatedCostPerAcre,
        potentialYieldPerAcre: crop.potentialYieldPerAcre,
        marketDemand: crop.marketDemand,
        description: crop.description,
        descriptionKn: crop.descriptionKn,
        descriptionTa: crop.descriptionTa,
        descriptionTe: crop.descriptionTe,
        imageUrl: crop.imageUrl,
        risks: JSON.stringify(crop.risks),
        benefits: JSON.stringify(crop.benefits),
      },
    });
  }
  console.log(`🌾 Seeded ${CROPS_DATA.length} agricultural crops`);

  // 3. Seed all Diseases
  for (const d of DISEASES_DATA) {
    await prisma.diseaseKnowledge.upsert({
      where: { id: d.id },
      update: {
        name: d.name,
        nameKannada: d.nameKannada,
        nameTamil: d.nameTamil,
        nameTelugu: d.nameTelugu,
        affectedCrops: JSON.stringify(d.affectedCrops),
        symptoms: d.symptoms,
        symptomsKn: d.symptomsKn,
        symptomsTa: d.symptomsTa,
        symptomsTe: d.symptomsTe,
        conditions: d.conditions,
        prevention: d.prevention,
        preventionKn: d.preventionKn,
        preventionTa: d.preventionTa,
        preventionTe: d.preventionTe,
        ipmSteps: JSON.stringify(d.ipmSteps),
        ipmStepsKn: JSON.stringify(d.ipmStepsKn),
        ipmStepsTa: JSON.stringify(d.ipmStepsTa),
        ipmStepsTe: JSON.stringify(d.ipmStepsTe),
        expertAdvice: d.expertAdvice,
        severity: d.severity,
        imageUrl: d.imageUrl,
      },
      create: {
        id: d.id,
        name: d.name,
        nameKannada: d.nameKannada,
        nameTamil: d.nameTamil,
        nameTelugu: d.nameTelugu,
        affectedCrops: JSON.stringify(d.affectedCrops),
        symptoms: d.symptoms,
        symptomsKn: d.symptomsKn,
        symptomsTa: d.symptomsTa,
        symptomsTe: d.symptomsTe,
        conditions: d.conditions,
        prevention: d.prevention,
        preventionKn: d.preventionKn,
        preventionTa: d.preventionTa,
        preventionTe: d.preventionTe,
        ipmSteps: JSON.stringify(d.ipmSteps),
        ipmStepsKn: JSON.stringify(d.ipmStepsKn),
        ipmStepsTa: JSON.stringify(d.ipmStepsTa),
        ipmStepsTe: JSON.stringify(d.ipmStepsTe),
        expertAdvice: d.expertAdvice,
        severity: d.severity,
        imageUrl: d.imageUrl,
      },
    });
  }
  console.log(`🐛 Seeded ${DISEASES_DATA.length} crop pests and diseases`);

  // 4. Seed a completed Soil Assessment for Ramesh
  const existingAssessment = await prisma.soilAssessment.findFirst({
    where: { userId: demoFarmer.id },
  });

  if (!existingAssessment) {
    const assessment = await prisma.soilAssessment.create({
      data: {
        userId: demoFarmer.id,
        state: 'Karnataka',
        district: 'Mandya',
        village: 'Koppa',
        farmSize: 2.5,
        farmUnit: 'Acres',
        soilType: 'clay',
        ph: 6.8,
        nitrogen: 280,
        phosphorus: 22,
        potassium: 190,
        waterSource: 'canal',
        irrigationType: 'flood',
        season: 'Kharif',
        sowingMonth: 'July',
        previousCrop: 'Sugarcane',
        budget: 'medium',
        drainage: 'good',
      },
    });

    console.log(`📋 Seeded demo soil assessment (ID: ${assessment.id})`);
  }

  // 5. Seed an active Crop Plan (Paddy Rice) for Ramesh with realistic stage progress
  const existingPlan = await prisma.cropPlan.findFirst({
    where: { userId: demoFarmer.id, cropId: 'crop-paddy-rice' },
  });

  if (!existingPlan) {
    const paddyKnowledge = CROPS_DATA.find(c => c.id === 'crop-paddy-rice')!;
    const plan = await prisma.cropPlan.create({
      data: {
        userId: demoFarmer.id,
        cropId: 'crop-paddy-rice',
        cropName: 'Paddy (Rice)',
        fieldName: 'North Canal Field',
        areaAcre: 1.5,
        currentStageIndex: 1,
        status: 'active',
      },
    });

    // Populate stage tasks
    let taskCount = 0;
    for (const stg of paddyKnowledge.stages) {
      for (const [idx, t] of stg.tasks.entries()) {
        const isCompleted = stg.stageOrder === 1 || (stg.stageOrder === 2 && idx === 0);
        await prisma.cropTask.create({
          data: {
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
            isCompleted,
            completedAt: isCompleted ? new Date() : null,
          },
        });
        taskCount++;
      }
    }
    console.log(`🌾 Seeded active Paddy plan with ${taskCount} lifecycle tasks`);
  }

  // 6. Seed a sample chat conversation
  const existingChat = await prisma.chatConversation.findFirst({
    where: { userId: demoFarmer.id },
  });

  if (!existingChat) {
    const conv = await prisma.chatConversation.create({
      data: {
        userId: demoFarmer.id,
        title: 'Stem borer prevention in paddy',
      },
    });

    await prisma.chatMessage.createMany({
      data: [
        {
          conversationId: conv.id,
          role: 'user',
          content: 'What should I do if dead hearts appear in my paddy crop?',
          language: 'en',
          mode: 'local',
        },
        {
          conversationId: conv.id,
          role: 'assistant',
          content: 'Dead hearts in paddy are caused by the Yellow Stem Borer larva boring inside the tiller stem.\n\nImmediate Actions:\n1. Clip and destroy seedling leaf tips holding egg masses.\n2. Install 5 pheromone traps per acre to catch adult moths.\n3. Release Trichogramma japonicum egg parasitoid cards (40,000 eggs/acre).\n4. If more than 5% dead hearts occur, apply Cartap Hydrochloride 50% SP (2g/L water) or Chlorantraniliprole 0.4% G.',
          language: 'en',
          mode: 'local_demo',
        },
      ],
    });
    console.log(`💬 Seeded sample AI chat conversation`);
  }

  console.log('✅ Seed complete! All demo data loaded into SQLite database.');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
