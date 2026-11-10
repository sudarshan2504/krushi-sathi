import { CROPS_DATA, CropData } from '../data/cropKnowledge';
import { detectSeasonFromLocation, getCropSowingStatus } from './seasonService';
import { getCropImageMetadataMap } from './cropImageService';

export interface SoilAssessmentInput {
  soilType: string; // red, black, sandy, clay, loamy, alluvial, laterite, unknown
  soilColour?: string | null; // red, dark_brown, black, yellowish, light_grey
  soilTexture?: string | null; // fine_clayey, medium_loamy, coarse_sandy, silty
  moistureLevel?: string | null; // dry, slightly_moist, optimal, wet_waterlogged
  organicMatter?: string | null; // low, medium, high
  waterSource: string; // rainfed, borewell, canal, tank, other
  irrigationType?: string | null; // drip, sprinkler, flood, furrow, none
  season?: string | null; // Kharif, Rabi, Zaid, Year-round
  ph?: number | null;
  nitrogen?: number | null;
  phosphorus?: number | null;
  potassium?: number | null;
  npkNitrogen?: string | null; // Low, Medium, High
  npkPhosphorus?: string | null; // Low, Medium, High
  npkPotassium?: string | null; // Low, Medium, High
  previousCrop?: string | null;
  budget?: string | null; // low, medium, high
  drainage?: string | null; // good, moderate, poor, waterlogged
  category?: string | null; // filter by category: cereal_millet, pulse, vegetable, fruit, flower, plantation, spice, oilseed, fodder, all
  agroZone?: string | null; // e.g. "Southern Transition Zone", "Coastal Zone", "Northern Dry Zone"
  state?: string | null;
  district?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  landSize?: number | null;
  landSizeGuntas?: number | null;
}

export interface RecommendationResult {
  cropId: string;
  name: string;
  scientificName?: string;
  nameKannada: string;
  nameTamil: string;
  nameTelugu: string;
  category: string;
  suitabilityScore: number; // percentage 0-100
  matchTier: 'Best Match' | 'Highly Suitable' | 'Suitable' | 'Moderate';
  explanation: string;
  keyReasons: string[];
  soilRequirements: string;
  waterRequirements: string;
  growingDuration: string;
  durationType?: string;
  estimatedCost: string;
  potentialYield: string;
  roiEstimate?: string;
  gestationYears?: number;
  isSeasonalFruit?: boolean;
  isLongTerm?: boolean;
  fruitingTime?: string;
  intercroppingOptions?: string[];
  risks: string[];
  benefits: string[];
  imageUrl: string;
  imageStatus?: 'pending-review' | 'approved' | 'use-fallback';
  sowingWindowStatus?: {
    status: 'open' | 'closing_soon' | 'closed' | 'opens_in_n_days';
    label: string;
    labelKn?: string;
    labelTa?: string;
    labelTe?: string;
    daysRemaining?: number;
    daysUntilOpen?: number;
  };
  detectedSeasonName?: string;
}

/**
 * Advanced multi-criteria agricultural recommendation engine:
 * 1. Soil Type & Texture Match (25 pts): 7 soil types + texture cues (clayey, loamy, sandy, alluvial, laterite).
 * 2. Water Availability & Method (20 pts): Matches water source & irrigation method (drip, sprinkler, rainfed).
 * 3. Seasonal & Climatic Alignment (15 pts): Kharif/Rabi/Zaid alignment + agro-climatic zone suitability.
 * 4. Soil pH & NPK Fertility (15 pts): pH range + Low/Med/High NPK nutrient match.
 * 5. Organic Matter & Drainage Safety (15 pts): Organic matter suitability + drainage risks (waterlogging vs root rot).
 * 6. Crop Rotation & Predecessor Bonus (10 pts): Prevents monoculture, awards bonus for legume/cereal rotation.
 */
export function calculateCropRecommendations(input: SoilAssessmentInput): RecommendationResult[] {
  // Automatically detect regional season from location
  const detectedSeason = detectSeasonFromLocation(
    input.state || undefined,
    input.district || undefined,
    input.latitude || undefined,
    input.longitude || undefined
  );

  const normSoil = (input.soilType || 'unknown').toLowerCase();
  const normWater = (input.waterSource || 'rainfed').toLowerCase();
  const activeSeason = detectedSeason?.standardSeason || input.season || 'Kharif';
  const normSeason = activeSeason.toLowerCase();
  const userPh = input.ph && input.ph > 0 ? input.ph : null;
  const userBudget = (input.budget || 'medium').toLowerCase();
  const normDrainage = (input.drainage || 'good').toLowerCase();
  const userOrganic = (input.organicMatter || 'medium').toLowerCase();
  const userCategory = (input.category || 'all').toLowerCase();
  const userZone = (input.agroZone || '').toLowerCase();

  // If user specifically requested a category, filter first or prioritize
  let candidateCrops = CROPS_DATA;
  if (userCategory && userCategory !== 'all') {
    const directMatches = candidateCrops.filter(
      c =>
        c.category.toLowerCase() === userCategory ||
        (userCategory === 'cereal_millet' && (c.category === 'cereal' || c.category === 'millet')) ||
        (userCategory === 'fruit' && c.isSeasonalFruit) ||
        (userCategory === 'plantation' && (c.isLongTerm || c.durationType === 'perennial'))
    );
    if (directMatches.length > 0) {
      candidateCrops = directMatches;
    }
  }

  const results: RecommendationResult[] = [];

  for (const crop of candidateCrops) {
    let score = 0;
    const keyReasons: string[] = [];

    // --- 1. Soil Type & Texture Matching (Max 25) ---
    const idealSoils = crop.idealSoilTypes.map(s => s.toLowerCase());
    if (normSoil === 'unknown') {
      score += 15;
      keyReasons.push('Adaptable across typical regional soil types');
    } else if (idealSoils.includes(normSoil)) {
      score += 25;
      keyReasons.push(`Ideal fit for your ${crop.idealSoilTypes.join(', ')} soil`);
    } else if (
      (normSoil === 'red' && idealSoils.includes('loamy')) ||
      (normSoil === 'black' && idealSoils.includes('clay')) ||
      (normSoil === 'sandy' && idealSoils.includes('loamy')) ||
      (normSoil === 'laterite' && (idealSoils.includes('red') || idealSoils.includes('laterite'))) ||
      (normSoil === 'alluvial' && (idealSoils.includes('loamy') || idealSoils.includes('clay')))
    ) {
      score += 18;
      keyReasons.push(`Grows well in your ${normSoil} soil with recommended organic manuring`);
    } else {
      score += 8;
    }

    // Laterite special bonus for plantation/spices (Arecanut, Coffee, Pepper, Rubber)
    if (normSoil === 'laterite' && (crop.category === 'plantation' || crop.category === 'spice')) {
      score += 4;
      keyReasons.push('Western Ghats laterite soil is naturally suited for this crop');
    }

    // --- 2. Water Availability & Irrigation Matching (Max 20) ---
    const isWaterAbundant = normWater === 'canal' || normWater === 'borewell';
    const isRainfedOnly = normWater === 'rainfed';

    if (crop.waterRequirement === 'High') {
      if (isWaterAbundant) {
        score += 20;
        keyReasons.push('Matches your assured water source (Borewell/Canal)');
      } else if (normWater === 'tank') {
        score += 14;
        keyReasons.push('Suitable if tank maintains adequate seasonal water levels');
      } else {
        score += 4; // High water crop under rainfed is very risky
      }
    } else if (crop.waterRequirement === 'Moderate') {
      if (isWaterAbundant || normWater === 'tank') {
        score += 19;
        keyReasons.push('Water needs comfortably supported by your water source');
      } else {
        score += 14;
        keyReasons.push('Tolerates intermittent rains with in-situ moisture conservation');
      }
    } else {
      // Low water requirement
      if (isRainfedOnly) {
        score += 20;
        keyReasons.push('Drought-hardy champion; ideal for rainfed farming');
      } else {
        score += 18;
        keyReasons.push('Low water footprint; saves precious groundwater and pump electricity');
      }
    }

    // Drip bonus
    if (input.irrigationType === 'drip' && (crop.category === 'vegetable' || crop.category === 'fruit')) {
      score += 3;
      keyReasons.push('Micro-irrigation & fertigation significantly boosts yield');
    }

    // --- 3. Seasonal & Climatic Match & Sowing Window Status (Max 25) ---
    const cropSeasons = crop.seasons.map(s => s.toLowerCase());
    const isYearRound = cropSeasons.includes('year-round') || crop.durationType === 'perennial';
    if (isYearRound || cropSeasons.some(s => normSeason.includes(s) || s.includes(normSeason))) {
      score += 15;
      keyReasons.push(`Aligned with ${detectedSeason?.localSeasonName || activeSeason} season`);
    } else {
      score += 5;
    }

    // Sowing window status calculation
    const sowingStatus = getCropSowingStatus(crop, detectedSeason);
    if (sowingStatus.status === 'open') {
      score += 10;
      keyReasons.push(sowingStatus.label);
    } else if (sowingStatus.status === 'closing_soon') {
      score += 8;
      keyReasons.push(sowingStatus.label);
    } else if (sowingStatus.status === 'opens_in_n_days') {
      score += 5;
      keyReasons.push(sowingStatus.label);
    }

    // Agro-climatic zone bonus
    if (userZone && crop.suitableAgroZones) {
      const matchZone = crop.suitableAgroZones.some(z => z.toLowerCase().includes(userZone) || userZone.includes(z.toLowerCase()));
      if (matchZone) {
        score += 4;
        keyReasons.push(`Highly recommended for your agro-climatic zone (${input.agroZone})`);
      }
    }

    // --- 4. Soil pH & Nutrient Suitability (Max 15) ---
    if (userPh !== null) {
      if (userPh >= crop.minPh && userPh <= crop.maxPh) {
        score += 8;
        keyReasons.push(`Soil pH (${userPh}) is in the optimal agronomic range (${crop.minPh} - ${crop.maxPh})`);
      } else if (Math.abs(userPh - (crop.minPh + crop.maxPh) / 2) <= 1.0) {
        score += 5;
      } else {
        score += 2;
      }
    } else {
      score += 6; // Neutral default
    }

    // NPK nutrient matching
    const nLevel = (input.npkNitrogen || '').toLowerCase();
    const pLevel = (input.npkPhosphorus || '').toLowerCase();
    const kLevel = (input.npkPotassium || '').toLowerCase();

    if (nLevel === 'low' && (crop.category === 'pulse' || crop.id === 'crop-groundnut-peanut' || crop.id === 'crop-fodder-cowpea')) {
      score += 5;
      keyReasons.push('Naturally fixes atmospheric Nitrogen into your nitrogen-deficient soil');
    } else if (kLevel === 'high' && (crop.category === 'fruit' || crop.id === 'crop-banana-grandnaine' || crop.id === 'crop-onion-bulb')) {
      score += 4;
      keyReasons.push('Takes advantage of available soil potassium for heavy fruit/bulb yield');
    } else if (pLevel === 'high' || pLevel === 'medium') {
      score += 3;
    } else {
      score += 2;
    }

    // --- 5. Organic Matter & Drainage Matching (Max 15) ---
    if (userOrganic === 'high') {
      if (crop.category === 'spice' || crop.category === 'vegetable' || crop.category === 'fruit') {
        score += 7;
        keyReasons.push('Thrives in high organic matter with vigorous root development');
      } else {
        score += 5;
      }
    } else if (userOrganic === 'low') {
      if (crop.category === 'cereal_millet' || crop.category === 'pulse') {
        score += 6;
        keyReasons.push('Hardy crop that builds soil organic matter over time');
      } else {
        score += 3;
      }
    } else {
      score += 5;
    }

    // Drainage checks
    if (normDrainage === 'waterlogged' || normDrainage === 'poor') {
      if (crop.id === 'crop-paddy-rice') {
        score += 8;
        keyReasons.push('Naturally thrives in standing water and puddled fields');
      } else if (crop.id === 'crop-papaya-redlady' || crop.id === 'crop-ginger-cochin' || crop.id === 'crop-cotton-commercial') {
        score -= 15; // Severe penalty: will rot within 24-48 hours
      } else {
        score -= 6;
      }
    } else {
      score += 7;
      if (crop.id === 'crop-papaya-redlady' || crop.id === 'crop-ginger-cochin') {
        keyReasons.push('Good drainage protects delicate root crowns from rot');
      }
    }

    // --- 6. Crop Rotation & Predecessor Compatibility (Max 10) ---
    const prev = (input.previousCrop || '').toLowerCase();
    if (prev) {
      const isPulse = crop.category === 'pulse' || crop.category === 'oilseed';
      const prevWasCereal = prev.includes('paddy') || prev.includes('rice') || prev.includes('maize') || prev.includes('wheat') || prev.includes('ragi');
      const prevWasSame = prev.includes(crop.name.toLowerCase().split(' ')[0]);

      if (prevWasSame) {
        score -= 5; // Monoculture pest buildup penalty
      } else if (prevWasCereal && isPulse) {
        score += 10;
        keyReasons.push(`Ideal crop rotation after ${input.previousCrop} to break pest cycles`);
      } else {
        score += 6;
      }
    } else {
      score += 6;
    }

    // Budget check
    if (userBudget === 'low' && crop.estimatedCostPerAcre.includes('₹50,000')) {
      score -= 4; // High investment crop for low budget
    } else if (userBudget === 'low' && (crop.category === 'cereal_millet' || crop.category === 'pulse')) {
      score += 3;
      keyReasons.push('Low initial input cost fits your budget comfortably');
    }

    // Clamp score between 35 and 98%
    const finalScore = Math.min(98, Math.max(35, Math.round(score)));

    let matchTier: RecommendationResult['matchTier'] = 'Moderate';
    if (finalScore >= 85) matchTier = 'Best Match';
    else if (finalScore >= 75) matchTier = 'Highly Suitable';
    else if (finalScore >= 65) matchTier = 'Suitable';

    // Build synthesized plain-language explanation
    const reasonsSummary = keyReasons.slice(0, 3).join('. ');
    const explanation = `${crop.name} scored ${finalScore}% suitability for your field. ${reasonsSummary}.`;

    const meta = getCropImageMetadataMap().get(crop.id);
    const resolvedImageStatus = meta?.status || (crop.imageUrl ? 'approved' : 'use-fallback');
    const resolvedImageUrl = resolvedImageStatus === 'use-fallback' ? '' : `/crops/${crop.id}.webp`;

    results.push({
      cropId: crop.id,
      name: crop.name,
      scientificName: crop.scientificName,
      nameKannada: crop.nameKannada,
      nameTamil: crop.nameTamil,
      nameTelugu: crop.nameTelugu,
      category: crop.category,
      suitabilityScore: finalScore,
      matchTier,
      explanation,
      keyReasons: keyReasons.slice(0, 4),
      soilRequirements: crop.idealSoilTypes.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ') + ` (pH ${crop.minPh}-${crop.maxPh})`,
      waterRequirements: `${crop.waterRequirement} (${crop.waterMm})`,
      growingDuration: crop.durationDays,
      durationType: crop.durationType || 'medium',
      estimatedCost: crop.estimatedCostPerAcre,
      potentialYield: crop.potentialYieldPerAcre,
      roiEstimate: crop.roiEstimate,
      gestationYears: crop.gestationYears,
      isSeasonalFruit: crop.isSeasonalFruit,
      isLongTerm: crop.isLongTerm,
      fruitingTime: crop.fruitingTime,
      intercroppingOptions: crop.intercroppingOptions,
      risks: crop.risks,
      benefits: crop.benefits,
      imageUrl: resolvedImageUrl,
      imageStatus: resolvedImageStatus,
      sowingWindowStatus: sowingStatus,
      detectedSeasonName: detectedSeason?.localSeasonName || detectedSeason?.name,
    });
  }

  // Sort descending by suitability score
  results.sort((a, b) => b.suitabilityScore - a.suitabilityScore);

  return results;
}
