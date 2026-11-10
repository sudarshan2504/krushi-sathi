import { z } from 'zod';

export const CropImageSchema = z.object({
  type: z.enum(['plant', 'flower', 'fruit', 'grain', 'seed', 'leaf', 'produce', 'general']),
  path: z.string(), // e.g. "/crops/paddy-rice/plant.webp"
  source: z.string(), // "Wikimedia Commons", "Pexels", "Pixabay", "PlantVillage"
  author: z.string(),
  license: z.string(), // e.g. "CC-BY-SA 4.0", "Public Domain", "CC-BY 2.0"
  attributionUrl: z.string(),
  originalUrl: z.string().optional(),
});

export type CropImage = z.infer<typeof CropImageSchema>;

export const CropMasterRecordSchema = z.object({
  id: z.string(),
  name: z.string(),
  scientificName: z.string(),
  nameKannada: z.string(),
  nameTamil: z.string(),
  nameTelugu: z.string(),
  category: z.enum([
    'cereal_millet',
    'pulse',
    'vegetable',
    'fruit',
    'flower',
    'plantation',
    'cash',
    'spice',
    'oilseed',
    'fodder',
    'medicinal'
  ]),
  alphabeticalKey: z.string().length(1), // 'A' - 'Z'
  confidence: z.enum(['high', 'medium', 'low']),
  confidenceNote: z.string().default('Package of practices aligned with UASB/TNAU agronomic guides. Verify regional variety adaptations with your local Agriculture Department / KVK.'),
  imageStatus: z.enum(['pending-review', 'approved', 'use-fallback']).optional(),
  images: z.array(CropImageSchema).default([]),
  idealSoilTypes: z.array(z.string()),
  minPh: z.number(),
  maxPh: z.number(),
  waterRequirement: z.enum(['Low', 'Moderate', 'High']),
  waterMm: z.string(),
  durationDays: z.string(),
  durationMin: z.number(),
  durationMax: z.number(),
  durationType: z.enum(['short', 'medium', 'long', 'perennial']),
  seasons: z.array(z.string()),
  sowingMonths: z.array(z.string()).default([]),
  harvestMonths: z.array(z.string()).default([]),
  minTemp: z.number(),
  maxTemp: z.number(),
  rainfallMm: z.string(),
  seedRate: z.string().default(''),
  spacing: z.string().default(''),
  fertilizerSchedule: z.string().default(''),
  harvestSigns: z.string().default(''),
  storageAdvice: z.string().default(''),
  estimatedCostPerAcre: z.string(),
  potentialYieldPerAcre: z.string(),
  returnsEstimate: z.string().default(''),
  roiEstimate: z.string().default(''),
  gestationYears: z.number().optional(),
  intercroppingOptions: z.array(z.string()).default([]),
  marketDemand: z.enum(['Low', 'Moderate', 'High', 'Very High']),
  description: z.string(),
  descriptionKn: z.string(),
  descriptionTa: z.string(),
  descriptionTe: z.string(),
  imageUrl: z.string().default(''),
  risks: z.array(z.string()).default([]),
  benefits: z.array(z.string()).default([]),
  suitableAgroZones: z.array(z.string()).default([]),
  stages: z.array(
    z.object({
      stage: z.string(),
      stageOrder: z.number(),
      dayRange: z.string(),
      dayOffset: z.number(),
      title: z.string(),
      titleKn: z.string(),
      titleTa: z.string(),
      titleTe: z.string(),
      description: z.string(),
      descriptionKn: z.string(),
      descriptionTa: z.string(),
      descriptionTe: z.string(),
      category: z.string(),
      materialsNeeded: z.array(z.string()),
      importantTip: z.string(),
      importantTipKn: z.string(),
      importantTipTa: z.string(),
      importantTipTe: z.string(),
      tasks: z.array(
        z.object({
          title: z.string(),
          titleKn: z.string(),
          titleTa: z.string(),
          titleTe: z.string(),
          description: z.string(),
        })
      ),
    })
  ).default([]),
  diseases: z.array(
    z.object({
      name: z.string(),
      nameKn: z.string(),
      nameTa: z.string(),
      nameTe: z.string(),
      symptoms: z.string(),
      symptomsKn: z.string(),
      symptomsTa: z.string(),
      symptomsTe: z.string(),
      prevention: z.string(),
      preventionKn: z.string(),
      preventionTa: z.string(),
      preventionTe: z.string(),
      organicRemedy: z.string().default(''),
      chemicalRemedy: z.string().default(''),
      imageUrl: z.string().default(''),
      imageAttribution: z.string().default('PlantVillage Dataset (CC-BY 4.0)'),
    })
  ).default([]),
});

export type CropMasterRecord = z.input<typeof CropMasterRecordSchema>;
export type CropMasterRecordParsed = z.output<typeof CropMasterRecordSchema>;
