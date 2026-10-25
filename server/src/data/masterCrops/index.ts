import { CropMasterRecord, CropMasterRecordSchema } from '../../types/cropMasterSchema';
import { CEREALS_MILLETS } from './cerealsMillets';
import { PULSES } from './pulses';
import { VEGETABLES } from './vegetables';
import { FRUITS } from './fruits';
import { FLOWERS } from './flowers';
import { PLANTATION_CASH } from './plantationCash';
import { SPICES } from './spices';
import { OILSEEDS } from './oilseeds';
import { FODDER } from './fodder';
import { MEDICINAL_FORESTRY } from './medicinal';
import { ADDITIONAL_SOUTH_INDIAN_CROPS } from './additionalSouthIndianCrops';
import { EXTENDED_CATALOG_BATCH_4 } from './extendedCatalogBatch4';
import { EXTENDED_CATALOG_BATCH_5 } from './extendedCatalogBatch5';

const ALL_RAW_CROPS: CropMasterRecord[] = [
  ...CEREALS_MILLETS,
  ...PULSES,
  ...VEGETABLES,
  ...FRUITS,
  ...FLOWERS,
  ...PLANTATION_CASH,
  ...SPICES,
  ...OILSEEDS,
  ...FODDER,
  ...MEDICINAL_FORESTRY,
  ...ADDITIONAL_SOUTH_INDIAN_CROPS,
  ...EXTENDED_CATALOG_BATCH_4,
  ...EXTENDED_CATALOG_BATCH_5,
];

// Deduplicate by ID and ensure alphabetical sorting
const seenIds = new Set<string>();
export const MASTER_CROPS_CATALOG: CropMasterRecord[] = [];

for (const crop of ALL_RAW_CROPS) {
  if (!seenIds.has(crop.id)) {
    // Validate record against Zod schema
    const validation = CropMasterRecordSchema.safeParse(crop);
    if (!validation.success) {
      console.warn(`[Validation Warning] Crop ${crop.id} has schema validation issues:`, validation.error.format());
    }
    seenIds.add(crop.id);
    MASTER_CROPS_CATALOG.push(crop);
  }
}

// Sort alphabetically by English name
MASTER_CROPS_CATALOG.sort((a, b) => a.name.localeCompare(b.name));

export interface CatalogFilterOptions {
  letter?: string;
  category?: string;
  season?: string;
  duration?: string;
  soilType?: string;
  waterNeed?: string;
  search?: string;
  page?: number;
  limit?: number;
  farmerSoilType?: string;
  farmerSeason?: string;
  farmerTaluk?: string;
  recommendedOnly?: boolean;
}

export function isCropRecommendedForFarmer(
  crop: CropMasterRecord,
  farmerSoil?: string,
  farmerSeason?: string,
  farmerTaluk?: string
): boolean {
  if (!farmerSoil && !farmerSeason && !farmerTaluk) return false;

  let matches = 0;
  if (farmerSoil && crop.idealSoilTypes.some(s => s.toLowerCase() === farmerSoil.toLowerCase())) {
    matches++;
  }
  if (farmerSeason && crop.seasons.some(s => s.toLowerCase().includes(farmerSeason.toLowerCase()) || farmerSeason.toLowerCase().includes(s.toLowerCase()))) {
    matches++;
  }
  if (farmerTaluk && (crop.suitableAgroZones?.length ?? 0) > 0) {
    // If taluk provided and crop has regional zones
    matches++;
  }

  return matches >= 2;
}

export function queryCropCatalog(options: CatalogFilterOptions = {}) {
  const {
    letter,
    category,
    season,
    duration,
    soilType,
    waterNeed,
    search,
    page = 1,
    limit = 24,
    farmerSoilType,
    farmerSeason,
    farmerTaluk,
    recommendedOnly = false,
  } = options;

  let filtered = [...MASTER_CROPS_CATALOG];

  // A-Z letter filter
  if (letter && letter !== 'All') {
    filtered = filtered.filter(c => c.alphabeticalKey.toUpperCase() === letter.toUpperCase());
  }

  // Category filter
  if (category && category !== 'all') {
    filtered = filtered.filter(c => {
      if (category === 'cereal_millet') return c.category === 'cereal_millet';
      return c.category.toLowerCase() === category.toLowerCase();
    });
  }

  // Season filter
  if (season && season !== 'all') {
    const sNorm = season.toLowerCase();
    filtered = filtered.filter(c =>
      c.seasons.some(s => s.toLowerCase().includes(sNorm) || sNorm.includes(s.toLowerCase())) ||
      c.seasons.includes('Year-round')
    );
  }

  // Duration filter (short / medium / long / perennial)
  if (duration && duration !== 'all') {
    filtered = filtered.filter(c => c.durationType === duration.toLowerCase());
  }

  // Soil type filter
  if (soilType && soilType !== 'all') {
    const soilNorm = soilType.toLowerCase();
    filtered = filtered.filter(c => c.idealSoilTypes.some(st => st.toLowerCase() === soilNorm));
  }

  // Water requirement
  if (waterNeed && waterNeed !== 'all') {
    filtered = filtered.filter(c => c.waterRequirement.toLowerCase() === waterNeed.toLowerCase());
  }

  // Multilingual search (English, Kannada, Tamil, Telugu, and Scientific Name)
  if (search && search.trim()) {
    const query = search.trim().toLowerCase();
    filtered = filtered.filter(c =>
      c.name.toLowerCase().includes(query) ||
      c.scientificName.toLowerCase().includes(query) ||
      c.nameKannada.toLowerCase().includes(query) ||
      c.nameTamil.toLowerCase().includes(query) ||
      c.nameTelugu.toLowerCase().includes(query) ||
      c.category.toLowerCase().includes(query)
    );
  }

  // Filter recommended only
  if (recommendedOnly && (farmerSoilType || farmerSeason || farmerTaluk)) {
    filtered = filtered.filter(c => isCropRecommendedForFarmer(c, farmerSoilType, farmerSeason, farmerTaluk));
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const currentPage = Math.max(1, Math.min(page, totalPages));
  const startIndex = (currentPage - 1) * limit;
  const paginatedCrops = filtered.slice(startIndex, startIndex + limit);

  // Annotate with recommendation flag
  const annotatedCrops = paginatedCrops.map(c => ({
    ...c,
    isRecommendedForFarmer: isCropRecommendedForFarmer(c, farmerSoilType, farmerSeason, farmerTaluk),
  }));

  return {
    crops: annotatedCrops,
    pagination: {
      total,
      page: currentPage,
      limit,
      totalPages,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1,
    },
  };
}

export function getCropById(id: string): CropMasterRecord | undefined {
  return MASTER_CROPS_CATALOG.find(c => c.id === id);
}

export function getConfidenceReport() {
  const high = MASTER_CROPS_CATALOG.filter(c => c.confidence === 'high');
  const medium = MASTER_CROPS_CATALOG.filter(c => c.confidence === 'medium');
  const low = MASTER_CROPS_CATALOG.filter(c => c.confidence === 'low');

  return {
    total: MASTER_CROPS_CATALOG.length,
    highConfidenceCount: high.length,
    mediumConfidenceCount: medium.length,
    lowConfidenceCount: low.length,
    lowConfidenceCrops: low.map(c => ({
      id: c.id,
      name: c.name,
      scientificName: c.scientificName,
      category: c.category,
      note: c.confidenceNote,
    })),
    mediumConfidenceCrops: medium.map(c => ({
      id: c.id,
      name: c.name,
      scientificName: c.scientificName,
      category: c.category,
      note: c.confidenceNote,
    })),
  };
}
