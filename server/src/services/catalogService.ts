import fs from 'fs';
import path from 'path';
import { MASTER_CROPS_CATALOG, isCropRecommendedForFarmer } from '../data/masterCrops/index';
import { CropMasterRecord } from '../types/cropMasterSchema';
import { getCropImageMetadataMap } from './cropImageService';

const CROPS_CATALOG_JSON_PATH = path.resolve(__dirname, '../data/cropsCatalog.json');

let cachedCatalog: CropMasterRecord[] | null = null;
let lastMtime: number = 0;

function enrichCatalogCrop(crop: CropMasterRecord): CropMasterRecord {
  const metaMap = getCropImageMetadataMap();
  const meta = metaMap.get(crop.id);

  if (meta) {
    if (meta.status === 'use-fallback') {
      return {
        ...crop,
        imageStatus: meta.status,
        imageUrl: '',
        images: [],
      };
    }

    const localPath = `/crops/${crop.id}.webp`;
    return {
      ...crop,
      imageStatus: meta.status,
      imageUrl: localPath,
      images: [
        {
          type: 'plant',
          path: localPath,
          source: meta.source,
          author: meta.photographer,
          license: meta.license,
          attributionUrl: meta.sourceUrl || '',
        },
      ],
    };
  }

  return crop;
}

export function getActiveCatalog(): CropMasterRecord[] {
  try {
    if (fs.existsSync(CROPS_CATALOG_JSON_PATH)) {
      const stats = fs.statSync(CROPS_CATALOG_JSON_PATH);
      if (!cachedCatalog || stats.mtimeMs > lastMtime) {
        const raw = fs.readFileSync(CROPS_CATALOG_JSON_PATH, 'utf-8');
        cachedCatalog = JSON.parse(raw);
        lastMtime = stats.mtimeMs;
      }
      return cachedCatalog || MASTER_CROPS_CATALOG;
    }
  } catch (err) {
    console.error('Error reading cropsCatalog.json, falling back to master catalog:', err);
  }
  return MASTER_CROPS_CATALOG;
}

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

export function queryCatalog(options: CatalogFilterOptions) {
  const catalog = getActiveCatalog();
  const {
    letter = 'All',
    category = 'all',
    season = 'all',
    duration = 'all',
    soilType = 'all',
    waterNeed = 'all',
    search = '',
    page = 1,
    limit = 24,
    farmerSoilType,
    farmerSeason,
    farmerTaluk,
    recommendedOnly = false,
  } = options;

  let filtered = [...catalog];

  // A-Z letter filter
  if (letter && letter !== 'All') {
    filtered = filtered.filter(c => (c.alphabeticalKey || c.name[0] || '').toUpperCase() === letter.toUpperCase());
  }

  // Category filter
  if (category && category !== 'all') {
    const catNorm = category.toLowerCase();
    filtered = filtered.filter(c => {
      if (catNorm === 'cereal_millet' || catNorm === 'cereal' || catNorm === 'millet') {
        return c.category === 'cereal_millet';
      }
      return c.category.toLowerCase() === catNorm;
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

  // Duration filter
  if (duration && duration !== 'all') {
    const dNorm = duration.toLowerCase();
    filtered = filtered.filter(c => c.durationType === dNorm);
  }

  // Soil type filter
  if (soilType && soilType !== 'all') {
    const soilNorm = soilType.toLowerCase();
    filtered = filtered.filter(c => c.idealSoilTypes.some(st => st.toLowerCase() === soilNorm));
  }

  // Water need filter
  if (waterNeed && waterNeed !== 'all') {
    const wNorm = waterNeed.toLowerCase();
    filtered = filtered.filter(c => c.waterRequirement.toLowerCase() === wNorm);
  }

  // Multilingual search query
  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.scientificName.toLowerCase().includes(q) ||
      c.nameKannada.toLowerCase().includes(q) ||
      c.nameTamil.toLowerCase().includes(q) ||
      c.nameTelugu.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q)
    );
  }

  // Recommendation filter
  if (recommendedOnly && (farmerSoilType || farmerSeason || farmerTaluk)) {
    filtered = filtered.filter(c => isCropRecommendedForFarmer(c, farmerSoilType, farmerSeason, farmerTaluk));
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const currentPage = Math.max(1, Math.min(page, totalPages));
  const startIndex = (currentPage - 1) * limit;
  const paginatedCrops = filtered.slice(startIndex, startIndex + limit);

  const annotatedCrops = paginatedCrops.map(c => ({
    ...enrichCatalogCrop(c),
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

export function getCatalogCropById(id: string): (CropMasterRecord & { isRecommendedForFarmer?: boolean }) | undefined {
  const catalog = getActiveCatalog();
  const q = id.toLowerCase().trim();
  const found = catalog.find(
    c =>
      c.id.toLowerCase() === q ||
      c.id.replace('crop-', '').toLowerCase() === q ||
      c.name.toLowerCase().replace(/[^a-z0-9]/g, '') === q.replace(/[^a-z0-9]/g, '')
  );
  return found ? enrichCatalogCrop(found) : undefined;
}

export function getCatalogCredits() {
  const catalog = getActiveCatalog().map(enrichCatalogCrop);
  const credits: Array<{
    cropId: string;
    cropName: string;
    scientificName: string;
    category: string;
    imagePath: string;
    path: string;
    imageType: string;
    source: string;
    author: string;
    photographer: string;
    license: string;
    attributionUrl?: string;
    sourceUrl?: string;
  }> = [];

  for (const crop of catalog) {
    if (crop.imageStatus !== 'use-fallback' && crop.images && crop.images.length > 0) {
      for (const img of crop.images) {
        credits.push({
          cropId: crop.id,
          cropName: crop.name,
          scientificName: crop.scientificName,
          category: crop.category,
          imagePath: img.path,
          path: img.path,
          imageType: img.type,
          source: img.source,
          author: img.author,
          photographer: img.author,
          license: img.license,
          attributionUrl: img.attributionUrl,
          sourceUrl: img.attributionUrl,
        });
      }
    }
  }

  // Also include records from crops-images.json not already in catalog credits
  const metaMap = getCropImageMetadataMap();
  for (const [key, item] of metaMap.entries()) {
    if (key !== item.cropId) continue;
    if (item.status !== 'use-fallback' && !credits.some(c => c.cropId === item.cropId)) {
      credits.push({
        cropId: item.cropId,
        cropName: item.name,
        scientificName: item.scientificName,
        category: item.category || 'general',
        imagePath: `/crops/${item.cropId}.webp`,
        path: `/crops/${item.cropId}.webp`,
        imageType: 'plant',
        source: item.source,
        author: item.photographer,
        photographer: item.photographer,
        license: item.license,
        attributionUrl: item.sourceUrl,
        sourceUrl: item.sourceUrl,
      });
    }
  }

  return {
    totalImages: credits.length,
    credits,
  };
}

export function getCatalogConfidenceReport() {
  const catalog = getActiveCatalog();
  const high = catalog.filter(c => c.confidence === 'high');
  const medium = catalog.filter(c => c.confidence === 'medium');
  const low = catalog.filter(c => c.confidence === 'low');

  return {
    total: catalog.length,
    highConfidenceCount: high.length,
    mediumConfidenceCount: medium.length,
    lowConfidenceCount: low.length,
    lowConfidenceCrops: low.map(c => ({
      id: c.id,
      name: c.name,
      scientificName: c.scientificName,
      category: c.category,
      note: c.confidenceNote,
      guidance: 'Verify Package of Practices with local KVK / Raitha Samparka Kendra / Dept of Agriculture',
    })),
    mediumConfidenceCrops: medium.map(c => ({
      id: c.id,
      name: c.name,
      scientificName: c.scientificName,
      category: c.category,
      note: c.confidenceNote,
      guidance: 'Verify soil test and micro-climate suitability with local agricultural officer',
    })),
  };
}
