import { CROPS_DATA, CropData } from '../data/cropKnowledge';

export interface SoilAssessmentInput {
  soilType: string; // red, black, sandy, clay, loamy, unknown
  waterSource: string; // rainfed, borewell, canal, tank, other
  irrigationType?: string; // drip, sprinkler, flood, none
  season?: string; // Kharif, Rabi, Zaid, Year-round
  ph?: number | null;
  nitrogen?: number | null;
  phosphorus?: number | null;
  potassium?: number | null;
  previousCrop?: string | null;
  budget?: string | null; // low, medium, high
  drainage?: string | null; // good, moderate, poor, waterlogged
}

export interface RecommendationResult {
  cropId: string;
  name: string;
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
  estimatedCost: string;
  potentialYield: string;
  risks: string[];
  benefits: string[];
  imageUrl: string;
}

/**
 * Multi-criteria agricultural suitability scoring engine:
 * 1. Soil Compatibility (30 points): Matches user's soil texture to crop's optimal soil types.
 * 2. Water & Irrigation Adequacy (25 points): Checks if user's water source satisfies crop water demands.
 * 3. Seasonal Alignment (20 points): Matches current / planned sowing season to crop seasons.
 * 4. Soil pH & Nutrient Suitability (10 points): If pH known, awards bonus if inside optimal agronomic range.
 * 5. Crop Rotation & Predecessor Bonus (10 points): Avoids continuous monoculture, awards bonus for legume/cereal rotation.
 * 6. Drainage & Land Risk Suitability (5 points): Checks for waterlogging vulnerability vs crop tolerance.
 */
export function calculateCropRecommendations(input: SoilAssessmentInput): RecommendationResult[] {
  const normSoil = (input.soilType || 'unknown').toLowerCase();
  const normWater = (input.waterSource || 'rainfed').toLowerCase();
  const normSeason = (input.season || 'kharif').toLowerCase();
  const userPh = input.ph && input.ph > 0 ? input.ph : null;
  const userBudget = (input.budget || 'medium').toLowerCase();
  const normDrainage = (input.drainage || 'good').toLowerCase();

  const results: RecommendationResult[] = [];

  for (const crop of CROPS_DATA) {
    let score = 0;
    const keyReasons: string[] = [];

    // --- 1. Soil Texture Matching (Max 30) ---
    const idealSoils = crop.idealSoilTypes.map(s => s.toLowerCase());
    if (normSoil === 'unknown') {
      // Moderate baseline score when farmer doesn't know soil
      score += 18;
      keyReasons.push('Broadly adaptable across typical regional soils');
    } else if (idealSoils.includes(normSoil)) {
      score += 30;
      keyReasons.push(`Grows exceptionally well in your ${crop.idealSoilTypes.join(', ')} soil`);
    } else if (
      (normSoil === 'red' && idealSoils.includes('loamy')) ||
      (normSoil === 'black' && idealSoils.includes('clay')) ||
      (normSoil === 'sandy' && idealSoils.includes('loamy'))
    ) {
      score += 20;
      keyReasons.push(`Moderately suited to your ${normSoil} soil with organic manuring`);
    } else {
      score += 10;
    }

    // --- 2. Water Availability & Irrigation Matching (Max 25) ---
    const isWaterAbundant = normWater === 'canal' || normWater === 'borewell';
    const isRainfedOnly = normWater === 'rainfed';

    if (crop.waterRequirement === 'High') {
      if (isWaterAbundant) {
        score += 25;
        keyReasons.push('Matches your assured water availability (Borewell/Canal)');
      } else if (normWater === 'tank') {
        score += 18;
        keyReasons.push('Suitable if tank retains water throughout the 110-day cycle');
      } else {
        // High water crop under rainfed condition is risky
        score += 5;
      }
    } else if (crop.waterRequirement === 'Moderate') {
      if (isWaterAbundant || normWater === 'tank') {
        score += 24;
        keyReasons.push('Moderate water requirement easily fulfilled by your water source');
      } else {
        score += 18;
        keyReasons.push('Tolerates intermittent rainfall with proper in-situ moisture conservation');
      }
    } else {
      // Low water requirement (e.g. Ragi, Chickpea)
      if (isRainfedOnly) {
        score += 25;
        keyReasons.push('Ideal for rainfed cultivation; high drought resilience');
      } else {
        score += 22;
        keyReasons.push('Very low water demand; saves electricity and groundwater');
      }
    }

    // --- 3. Seasonal Match (Max 20) ---
    const cropSeasons = crop.seasons.map(s => s.toLowerCase());
    if (cropSeasons.some(s => normSeason.includes(s) || s.includes(normSeason))) {
      score += 20;
      keyReasons.push('Well aligned with the current cropping season');
    } else {
      score += 8;
    }

    // --- 4. Soil pH & Nutrient Suitability (Max 10) ---
    if (userPh !== null) {
      if (userPh >= crop.minPh && userPh <= crop.maxPh) {
        score += 10;
        keyReasons.push(`Soil pH (${userPh}) falls right in the optimal range (${crop.minPh} - ${crop.maxPh})`);
      } else if (Math.abs(userPh - (crop.minPh + crop.maxPh) / 2) <= 1.0) {
        score += 6;
      } else {
        score += 2;
      }
    } else {
      score += 7; // Neutral fallback when farmer hasn't tested pH
    }

    // --- 5. Crop Rotation & Predecessor Compatibility (Max 10) ---
    const prev = (input.previousCrop || '').toLowerCase();
    if (prev) {
      const isPulse = crop.category === 'pulse' || crop.category === 'oilseed';
      const prevWasCereal = prev.includes('paddy') || prev.includes('rice') || prev.includes('maize') || prev.includes('wheat') || prev.includes('ragi');
      const prevWasSame = prev.includes(crop.name.toLowerCase().split(' ')[0]);

      if (prevWasSame) {
        // Continuous monoculture penalty
        score -= 5;
      } else if (prevWasCereal && isPulse) {
        score += 10;
        keyReasons.push(`Great rotation choice after ${input.previousCrop} to restore soil nitrogen`);
      } else {
        score += 7;
      }
    } else {
      score += 7;
    }

    // --- 6. Drainage and Soil Problems (Max 5) ---
    if (normDrainage === 'waterlogged' || normDrainage === 'poor') {
      if (crop.id === 'crop-paddy-rice') {
        score += 5;
        keyReasons.push('Tolerates submerged, waterlogged conditions');
      } else {
        score -= 8; // Cotton, Maize, Tomato fail under waterlogged conditions
      }
    } else {
      score += 5;
    }

    // Clamp score between 35 and 97%
    const finalScore = Math.min(97, Math.max(35, Math.round(score)));

    let matchTier: RecommendationResult['matchTier'] = 'Moderate';
    if (finalScore >= 85) matchTier = 'Best Match';
    else if (finalScore >= 75) matchTier = 'Highly Suitable';
    else if (finalScore >= 65) matchTier = 'Suitable';

    // Build synthesized explanation
    const explanation = `This crop scored ${finalScore}% suitability for your field condition. ${keyReasons.slice(0, 3).join('. ')}.`;

    results.push({
      cropId: crop.id,
      name: crop.name,
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
      estimatedCost: crop.estimatedCostPerAcre,
      potentialYield: crop.potentialYieldPerAcre,
      risks: crop.risks,
      benefits: crop.benefits,
      imageUrl: crop.imageUrl,
    });
  }

  // Sort descending by suitability score
  results.sort((a, b) => b.suitabilityScore - a.suitabilityScore);

  return results;
}
