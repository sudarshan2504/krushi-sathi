import prisma from '../src/utils/prisma';
import { CROPS_DATA } from '../src/data/cropKnowledge';
import { clearAuthStoresForTest } from '../src/services/authService';
import { clearWeatherCachesForTest } from '../src/services/weatherService';
import { resetRateLimiters } from '../src/middleware/rateLimiter';

export async function resetAndSeedTestDb() {
  clearAuthStoresForTest();
  clearWeatherCachesForTest();
  resetRateLimiters();

  await prisma.chatMessage.deleteMany();
  await prisma.chatConversation.deleteMany();
  await prisma.diseaseReport.deleteMany();
  await prisma.cropTask.deleteMany();
  await prisma.cropPlan.deleteMany();
  await prisma.cropRecommendation.deleteMany();
  await prisma.soilAssessment.deleteMany();
  await prisma.reminder.deleteMany();
  await prisma.diagnosisFeedback.deleteMany();
  await prisma.problemImage.deleteMany();
  await prisma.problemSymptom.deleteMany();
  await prisma.problemCrop.deleteMany();
  await prisma.problem.deleteMany();
  await prisma.symptomTag.deleteMany();
  await prisma.user.deleteMany();

  const paddy = CROPS_DATA[0];
  await prisma.crop.upsert({
    where: { id: paddy.id },
    update: {},
    create: {
      id: paddy.id,
      name: paddy.name,
      scientificName: paddy.scientificName,
      nameKannada: paddy.nameKannada,
      nameTamil: paddy.nameTamil,
      nameTelugu: paddy.nameTelugu,
      category: paddy.category,
      idealSoilTypes: JSON.stringify(paddy.idealSoilTypes),
      minPh: paddy.minPh,
      maxPh: paddy.maxPh,
      waterRequirement: paddy.waterRequirement,
      waterMm: paddy.waterMm,
      durationDays: paddy.durationDays,
      durationMin: paddy.durationMin,
      durationMax: paddy.durationMax,
      seasons: JSON.stringify(paddy.seasons),
      estimatedCostPerAcre: paddy.estimatedCostPerAcre,
      potentialYieldPerAcre: paddy.potentialYieldPerAcre,
      marketDemand: paddy.marketDemand,
      description: paddy.description,
      descriptionKn: paddy.descriptionKn,
      descriptionTa: paddy.descriptionTa,
      descriptionTe: paddy.descriptionTe,
      imageUrl: paddy.imageUrl,
      risks: JSON.stringify(paddy.risks),
      benefits: JSON.stringify(paddy.benefits),
    },
  });

  await prisma.user.create({
    data: {
      phone: '9876543210',
      name: 'Ramesh Kumar',
      state: 'Karnataka',
      district: 'Mandya',
      taluk: 'Maddur',
      hobli: 'Koppa',
      village: 'Koppa',
      farmSize: 2.5,
      farmUnit: 'Acres',
      language: 'en',
    },
  });
}

