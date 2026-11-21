import { z } from 'zod';
import bannedList from '../config/bannedPesticides.json';
import { DISEASES_DATA } from '../data/diseaseKnowledge';
import { config } from '../config';

export const TopFindingSchema = z.object({
  name: z.string(),
  localNames: z.object({
    en: z.string().optional(),
    kn: z.string().optional(),
    ta: z.string().optional(),
    te: z.string().optional(),
  }).default({}),
  type: z.enum([
    'disease',
    'pest',
    'nutrient_deficiency',
    'environmental_stress',
    'healthy',
    'unclear',
  ]).default('disease'),
  confidence: z.number().min(0).max(100),
  severity: z.enum(['low', 'medium', 'high']).default('medium'),
  spreadRisk: z.string().default('moderate'),
  observedSymptoms: z.array(z.string()).default([]),
  likelyCauses: z.array(z.string()).default([]),
});

export const ChemicalTreatmentSchema = z.object({
  activeIngredient: z.string(),
  class: z.string().default('Fungicide/Insecticide'),
  purpose: z.string().default('Target pathogen/pest control'),
  applicationNotes: z.string().default('Follow the product label for dose, interval and waiting period'),
});

export const TreatmentSchema = z.object({
  immediateSteps: z.array(z.string()).default([]),
  culturalAndOrganic: z.array(z.string()).default([]),
  chemical: z.array(ChemicalTreatmentSchema).default([]),
  safetyPrecautions: z.array(z.string()).default([]),
  preventionTips: z.array(z.string()).default([]),
  recheckInDays: z.number().default(5),
  whenToSeeExpert: z.string().default('Consult nearest Krishi Vigyan Kendra (KVK) or agriculture officer if symptoms spread.'),
});

export const DiseaseReportSchema = z.object({
  imageQuality: z.enum(['good', 'fair', 'poor']),
  retakeTip: z.string().optional(),
  crop: z.object({
    name: z.string(),
    scientificName: z.string().optional(),
    confidence: z.number().min(0).max(100).default(80),
  }),
  status: z.enum([
    'healthy',
    'disease',
    'pest',
    'nutrient_deficiency',
    'environmental_stress',
    'unclear',
  ]),
  topFindings: z.array(TopFindingSchema).max(3).default([]),
  treatment: TreatmentSchema,
  disclaimer: z.string(),
  generatedAt: z.string(),
  model: z.string(),
  isSample: z.boolean().optional().default(false),
  verifiedSource: z.enum(['verified entry', 'AI-generated, verify with an expert']).default('AI-generated, verify with an expert'),
  helpline: z.string().default('1800-180-1551'),
});

export type DiseaseReportData = z.infer<typeof DiseaseReportSchema>;

const DOSE_REGEX = /\b\d+(\.\d+)?\s*(g|gm|gms|gram|grams|ml|milliliter|millilitres|l|liter|liters|litres|kg|ppm|%)\b(\s*(\/|per)\s*(l|liter|litre|acre|ha|pump|bucket|knapsack))?/gi;
const TANK_MIX_REGEX = /(mix with|tank[- ]?mix|combine with other|cocktail of)/gi;

/**
 * Strips numeric dose statements and enforces standardized label compliance.
 */
export function sanitizeDoseAndMixing(text: string): string {
  let cleaned = text.replace(DOSE_REGEX, '');
  cleaned = cleaned.replace(TANK_MIX_REGEX, 'do not mix with other products unless certified on product label');
  // Collapse duplicate spaces or empty brackets
  cleaned = cleaned.replace(/\(\s*\)/g, '').replace(/\s{2,}/g, ' ').trim();
  if (!cleaned.toLowerCase().includes('follow the product label')) {
    cleaned = cleaned ? `${cleaned}. (Follow the product label for dose, interval and waiting period).` : 'Follow the product label for dose, interval and waiting period.';
  }
  return cleaned;
}

/**
 * Applies safety layer:
 * 1. Filter out banned active ingredients from Government of India / CIB&RC blocklist
 * 2. Strip numeric dosages and avoid recommending chemical mixes
 * 3. Enforce organic/cultural options before chemical ones
 * 4. Handle low-confidence (<60%): status unclear, expert helpline pushed to top
 * 5. Cross-check against curated diseaseKnowledge
 */
export function applySafetyAndCrossCheck(
  report: DiseaseReportData,
  userLanguage: string = 'en'
): DiseaseReportData {
  const result: DiseaseReportData = JSON.parse(JSON.stringify(report));
  const bannedSet = new Set(
    (bannedList.bannedActiveIngredients || []).map((entry: any) => {
      const name = typeof entry === 'string' ? entry : entry?.name;
      return (name || '').toLowerCase().trim();
    })
  );
  const helpline = config.kisanHelpline || '1800-180-1551';
  result.helpline = helpline;

  // 1. Filter banned chemicals
  result.treatment.chemical = (result.treatment.chemical || []).filter(chem => {
    const ai = (chem.activeIngredient || '').toLowerCase().trim();
    const purpose = (chem.purpose || '').toLowerCase();
    const notes = (chem.applicationNotes || '').toLowerCase();

    for (const banned of bannedSet) {
      if (ai.includes(banned) || purpose.includes(banned) || notes.includes(banned)) {
        return false;
      }
    }
    return true;
  });

  // 2. Sanitize doses in chemical recommendations
  result.treatment.chemical = result.treatment.chemical.map(chem => ({
    ...chem,
    applicationNotes: sanitizeDoseAndMixing(chem.applicationNotes || ''),
  }));

  // Sanitize immediate steps
  result.treatment.immediateSteps = (result.treatment.immediateSteps || []).map(step =>
    step.replace(DOSE_REGEX, '[follow label dosage]').replace(TANK_MIX_REGEX, 'use separately as per label')
  );

  // 3. Mandatory Safety Precautions
  const standardPrecautions = [
    'Wear protective mask, gloves and eye protection (PPE) when handling any agricultural treatment.',
    'Wash hands thoroughly with soap after application. Keep all products strictly away from children and farm animals.',
    'Do not spray during high winds, rain, or peak midday heat (spray early morning or late afternoon).',
    'Do not mix chemical products together unless explicitly permitted by the official product label.',
    'Strictly observe the Pre-Harvest Interval (waiting period) stated on the product container before harvesting.',
  ];

  const mergedPrecautions = Array.from(new Set([...(result.treatment.safetyPrecautions || []), ...standardPrecautions]));
  result.treatment.safetyPrecautions = mergedPrecautions;

  // 4. Low-confidence handling (<60%)
  const topFinding = result.topFindings?.[0];
  const isLowConfidence = !topFinding || topFinding.confidence < 60;

  if (isLowConfidence) {
    result.status = 'unclear';
    const lowConfNotice = `Confidence is low (${topFinding ? topFinding.confidence : 0}%). Contact Kisan Call Centre (Toll-Free ${helpline}) or visit your nearest Krishi Vigyan Kendra (KVK) / Raitha Samparka Kendra for in-person diagnosis.`;
    
    result.retakeTip = result.retakeTip || 'Please take a closer, well-lit photo showing both healthy and symptomatic leaf surfaces in natural daylight.';
    result.treatment.immediateSteps.unshift(lowConfNotice);
    result.treatment.whenToSeeExpert = `Immediate: Low diagnosis confidence. Reach out to Kisan Call Centre (${helpline}) or your local Agricultural Extension Officer.`;
    result.verifiedSource = 'AI-generated, verify with an expert';
  } else {
    // 5. Cross-check against curated diseaseKnowledge
    const findingName = (topFinding.name || '').toLowerCase();
    const matchingCurated = DISEASES_DATA.find(d => {
      const dName = d.name.toLowerCase();
      const matchName = findingName.includes(dName) || dName.includes(findingName);
      return matchName;
    });

    if (matchingCurated) {
      result.verifiedSource = 'verified entry';
      // Enhance local names if missing
      if (!topFinding.localNames?.kn && matchingCurated.nameKannada) {
        topFinding.localNames = {
          ...topFinding.localNames,
          kn: matchingCurated.nameKannada,
          ta: matchingCurated.nameTamil,
          te: matchingCurated.nameTelugu,
        };
      }
      // Incorporate verified IPM steps into cultural & organic options without numeric doses
      const vettedIpm = (matchingCurated.ipmSteps || []).map(sanitizeDoseAndMixing);
      result.treatment.culturalAndOrganic = Array.from(
        new Set([...(result.treatment.culturalAndOrganic || []), ...vettedIpm.slice(0, 3)])
      );
    } else {
      result.verifiedSource = 'AI-generated, verify with an expert';
    }
  }

  return result;
}
