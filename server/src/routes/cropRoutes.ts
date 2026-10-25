import { Router, Request, Response } from 'express';
import { CROPS_DATA } from '../data/cropKnowledge';
import { calculateCropRecommendations } from '../services/recommendationEngine';
import { optionalAuthMiddleware, AuthRequest } from '../middleware/auth';
import {
  queryCatalog,
  getCatalogCropById,
  getCatalogCredits,
  getCatalogConfidenceReport,
} from '../services/catalogService';
import prisma from '../utils/prisma';

const router = Router();

// Standard categories metadata with translations and icons
export const CROP_CATEGORIES = [
  {
    id: 'cereal_millet',
    aliases: ['cereal', 'millet', 'cereals', 'millets', 'cereal_millet'],
    name: 'Cereals & Millets',
    nameKannada: 'ಧಾನ್ಯಗಳು & ಸಿರಿಧಾನ್ಯಗಳು',
    nameTamil: 'தானியங்கள் & சிறுதானியங்கள்',
    nameTelugu: 'ధాన్యాలు & చిరుధాన్యాలు',
    icon: 'Wheat',
    badge: 'Staple Food',
    description: 'Paddy, Ragi, Maize, Jowar, Bajra & Wheat',
  },
  {
    id: 'pulse',
    aliases: ['pulse', 'pulses', 'legume'],
    name: 'Pulses & Legumes',
    nameKannada: 'ದ್ವಿದಳ ಧಾನ್ಯಗಳು / ಬೇಳೆಕಾಳುಗಳು',
    nameTamil: 'பயறு & பருப்பு வகைகள்',
    nameTelugu: 'పప్పుధాన్యాలు',
    icon: 'Bean',
    badge: 'Soil Enriching',
    description: 'Tur, Moong, Urad, Chickpea & Cowpea',
  },
  {
    id: 'vegetable',
    aliases: ['vegetable', 'vegetables', 'commercial_vegetable'],
    name: 'Vegetables',
    nameKannada: 'ತರಕಾರಿಗಳು',
    nameTamil: 'காய்கறிகள்',
    nameTelugu: 'కూరగాయలు',
    icon: 'Carrot',
    badge: 'Quick Cash Flow',
    description: 'Tomato, Chilli, Onion, Brinjal, Bhendi & Potato',
  },
  {
    id: 'fruit',
    aliases: ['fruit', 'fruits', 'seasonal_fruit'],
    name: 'Fruits (Seasonal)',
    nameKannada: 'ಹಣ್ಣಿನ ಬೆಳೆಗಳು (ಋತುಮಾನ)',
    nameTamil: 'பழங்கள் (பருவகாலம்)',
    nameTelugu: 'పండ్ల తోటలు (సీజనల్)',
    icon: 'Apple',
    badge: 'High Value',
    description: 'Mango, Watermelon, Banana, Papaya & Guava',
  },
  {
    id: 'flower',
    aliases: ['flower', 'flowers', 'commercial_flower'],
    name: 'Flowers (Commercial)',
    nameKannada: 'ವಾಣಿಜ್ಯ ಹೂಗಳು',
    nameTamil: 'மலர்கள் (வணிக மலர்)',
    nameTelugu: 'వాణిజ్య పూలు',
    icon: 'Flower2',
    badge: 'Festival Boom',
    description: 'Marigold, Jasmine, Chrysanthemum & Rose',
  },
  {
    id: 'plantation',
    aliases: ['plantation', 'long_term', 'agroforestry', 'commercial_tree'],
    name: 'Plantation & Long-Term',
    nameKannada: 'ತೋಟಗಾರಿಕೆ & ದೀರ್ಘಾವಧಿ ಬೆಳೆಗಳು',
    nameTamil: 'தோட்டக்கலை & நீண்டகால பயிர்கள்',
    nameTelugu: 'తోట పంటలు & దీర్ఘకాలిక పంటలు',
    icon: 'Trees',
    badge: '30+ Years ROI',
    description: 'Areca nut, Coconut, Coffee, Rubber & Sandalwood',
  },
  {
    id: 'spice',
    aliases: ['spice', 'spices', 'condiment'],
    name: 'Spices & Condiments',
    nameKannada: 'ಮಸಾಲೆ ಬೆಳೆಗಳು',
    nameTamil: 'நறுமணப் பயிர்கள்',
    nameTelugu: 'సుగంధ ద్రవ్యాలు',
    icon: 'Sparkles',
    badge: 'Export Demand',
    description: 'Turmeric, Ginger, Black Pepper & Cardamom',
  },
  {
    id: 'oilseed',
    aliases: ['oilseed', 'oilseeds', 'commercial'],
    name: 'Oilseeds',
    nameKannada: 'ಎಣ್ಣೆಕಾಳು ಬೆಳೆಗಳು',
    nameTamil: 'எண்ணெய் வித்துக்கள்',
    nameTelugu: 'నూనెగింజలు',
    icon: 'Droplets',
    badge: 'MSP Backed',
    description: 'Groundnut, Sunflower, Mustard & Soybean',
  },
  {
    id: 'fodder',
    aliases: ['fodder', 'green_fodder', 'forage'],
    name: 'Fodder Crops',
    nameKannada: 'ಪೌಷ್ಟಿಕ ಮೇವಿನ ಬೆಳೆಗಳು',
    nameTamil: 'தீவனப் பயிர்கள்',
    nameTelugu: 'పశుగ్రాస పంటలు',
    icon: 'Layers',
    badge: 'Dairy Multiplier',
    description: 'Super Napier CO-5, Fodder Sorghum & Fodder Cowpea',
  },
];

// Helper to test if crop matches a category
function matchesCategory(cropCategory: string, queryCategory: string): boolean {
  const normCrop = (cropCategory || '').toLowerCase();
  const normQ = (queryCategory || '').toLowerCase();
  if (normCrop === normQ) return true;

  const foundCat = CROP_CATEGORIES.find(c => c.id === normQ || c.aliases.includes(normQ));
  if (foundCat) {
    return foundCat.id === normCrop || foundCat.aliases.includes(normCrop);
  }
  return false;
}

// 1. Categories Metadata Endpoint (MUST be before /:id)
router.get('/categories', (req: Request, res: Response) => {
  const categoriesWithCounts = CROP_CATEGORIES.map(cat => {
    const count = CROPS_DATA.filter(crop => matchesCategory(crop.category, cat.id)).length;
    return {
      ...cat,
      cropCount: count,
    };
  });

  res.json({
    success: true,
    data: categoriesWithCounts,
  });
});

// 2. Seasonal Fruits Endpoint (MUST be before /:id)
router.get('/seasonal-fruits', (req: Request, res: Response) => {
  const { season } = req.query;

  let fruits = CROPS_DATA.filter(c => c.category === 'fruit' || c.isSeasonalFruit);

  if (season) {
    const s = (season as string).toLowerCase();
    fruits = fruits.filter(f => f.seasons.some(sn => sn.toLowerCase().includes(s)));
  }

  res.json({
    success: true,
    data: fruits.map(f => ({
      id: f.id,
      name: f.name,
      nameKannada: f.nameKannada,
      nameTamil: f.nameTamil,
      nameTelugu: f.nameTelugu,
      category: f.category,
      fruitingTime: f.fruitingTime || 'Seasonal',
      gestationYears: f.gestationYears || 1,
      sowingMonths: f.sowingMonths || [],
      harvestMonths: f.harvestMonths || [],
      potentialYieldPerAcre: f.potentialYieldPerAcre,
      estimatedCostPerAcre: f.estimatedCostPerAcre,
      waterRequirement: f.waterRequirement,
      imageUrl: f.imageUrl,
      description: f.description,
      descriptionKn: f.descriptionKn,
      descriptionTa: f.descriptionTa,
      descriptionTe: f.descriptionTe,
      benefits: f.benefits,
    })),
  });
});

// 3. Long-Term & Plantation Crops Endpoint (MUST be before /:id)
router.get('/long-term', (req: Request, res: Response) => {
  const plantationCrops = CROPS_DATA.filter(
    c => c.category === 'plantation' || c.isLongTerm || c.durationType === 'perennial'
  );

  res.json({
    success: true,
    data: plantationCrops.map(c => ({
      id: c.id,
      name: c.name,
      nameKannada: c.nameKannada,
      nameTamil: c.nameTamil,
      nameTelugu: c.nameTelugu,
      category: c.category,
      gestationYears: c.gestationYears ?? 4,
      intercroppingOptions: c.intercroppingOptions || ['Pulses', 'Vegetables', 'Banana'],
      roiEstimate: c.roiEstimate || '₹1.5L - ₹3.0L / acre / year at maturity',
      estimatedCostPerAcre: c.estimatedCostPerAcre,
      potentialYieldPerAcre: c.potentialYieldPerAcre,
      waterRequirement: c.waterRequirement,
      idealSoilTypes: c.idealSoilTypes,
      imageUrl: c.imageUrl,
      description: c.description,
      descriptionKn: c.descriptionKn,
      descriptionTa: c.descriptionTa,
      descriptionTe: c.descriptionTe,
      benefits: c.benefits,
      risks: c.risks,
    })),
  });
});

// 3.1 A-Z Crop Catalog Endpoint
router.get('/catalog', (req: Request, res: Response) => {
  try {
    const {
      letter,
      category,
      season,
      duration,
      soilType,
      waterNeed,
      search,
      page,
      limit,
      farmerSoilType,
      farmerSeason,
      farmerTaluk,
      recommendedOnly,
    } = req.query;

    const result = queryCatalog({
      letter: letter as string | undefined,
      category: category as string | undefined,
      season: season as string | undefined,
      duration: duration as string | undefined,
      soilType: soilType as string | undefined,
      waterNeed: waterNeed as string | undefined,
      search: search as string | undefined,
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 24,
      farmerSoilType: farmerSoilType as string | undefined,
      farmerSeason: farmerSeason as string | undefined,
      farmerTaluk: farmerTaluk as string | undefined,
      recommendedOnly: recommendedOnly === 'true',
    });

    res.json({
      success: true,
      data: result.crops,
      pagination: result.pagination,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching catalog' });
  }
});

// 3.2 Single Crop Catalog Detail Endpoint
router.get('/catalog/:id', (req: Request, res: Response) => {
  const crop = getCatalogCropById(req.params.id);
  if (!crop) {
    return res.status(404).json({ success: false, message: 'Crop not found in master catalog' });
  }
  res.json({
    success: true,
    data: crop,
  });
});

// 3.3 Image Credits and Licensing Endpoint
router.get('/credits', (req: Request, res: Response) => {
  const creditsData = getCatalogCredits();
  res.json({
    success: true,
    data: creditsData,
  });
});

// 3.4 Data Quality & Confidence Report Endpoint
router.get('/confidence-report', (req: Request, res: Response) => {
  const report = getCatalogConfidenceReport();
  res.json({
    success: true,
    data: report,
  });
});

// 4. List all crops with multi-filter
router.get('/', async (req: Request, res: Response) => {
  const { category, search, durationType, season, isSeasonalFruit, isLongTerm } = req.query;

  let crops = CROPS_DATA;

  if (category && category !== 'all') {
    crops = crops.filter(c => matchesCategory(c.category, category as string));
  }

  if (durationType && durationType !== 'all') {
    crops = crops.filter(c => c.durationType === durationType);
  }

  if (season && season !== 'all') {
    const s = (season as string).toLowerCase();
    crops = crops.filter(c => c.seasons.some(sn => sn.toLowerCase().includes(s)));
  }

  if (isSeasonalFruit === 'true') {
    crops = crops.filter(c => c.category === 'fruit' || c.isSeasonalFruit);
  }

  if (isLongTerm === 'true') {
    crops = crops.filter(c => c.category === 'plantation' || c.isLongTerm || c.durationType === 'perennial');
  }

  if (search) {
    const q = (search as string).toLowerCase();
    crops = crops.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        c.scientificName.toLowerCase().includes(q) ||
        c.nameKannada.includes(q) ||
        c.nameTamil.includes(q) ||
        c.nameTelugu.includes(q) ||
        c.description.toLowerCase().includes(q)
    );
  }

  res.json({
    success: true,
    totalCount: crops.length,
    data: crops.map(c => ({
      id: c.id,
      name: c.name,
      scientificName: c.scientificName,
      nameKannada: c.nameKannada,
      nameTamil: c.nameTamil,
      nameTelugu: c.nameTelugu,
      category: c.category,
      idealSoilTypes: c.idealSoilTypes,
      waterRequirement: c.waterRequirement,
      durationDays: c.durationDays,
      durationType: c.durationType || 'medium',
      seasons: c.seasons,
      sowingMonths: c.sowingMonths,
      harvestMonths: c.harvestMonths,
      gestationYears: c.gestationYears,
      intercroppingOptions: c.intercroppingOptions,
      roiEstimate: c.roiEstimate,
      isSeasonalFruit: c.isSeasonalFruit,
      isLongTerm: c.isLongTerm,
      fruitingTime: c.fruitingTime,
      estimatedCostPerAcre: c.estimatedCostPerAcre,
      potentialYieldPerAcre: c.potentialYieldPerAcre,
      imageUrl: c.imageUrl,
      description: c.description,
      descriptionKn: c.descriptionKn,
      descriptionTa: c.descriptionTa,
      descriptionTe: c.descriptionTe,
      stageCount: c.stages.length,
    })),
  });
});

// 5. Get single crop by id or slug
router.get('/:id', (req: Request, res: Response) => {
  const q = (req.params.id || '').toLowerCase().trim();
  const crop = CROPS_DATA.find(
    c =>
      c.id.toLowerCase() === q ||
      c.id.replace('crop-', '').toLowerCase() === q ||
      c.name.toLowerCase().replace(/[^a-z0-9]/g, '').includes(q.replace(/[^a-z0-9]/g, '')) ||
      q.includes(c.id.replace('crop-', '').toLowerCase())
  );

  if (!crop) {
    const masterCrop = getCatalogCropById(q);
    if (masterCrop) {
      return res.json({
        success: true,
        data: masterCrop,
      });
    }
    return res.status(404).json({ success: false, message: 'Crop not found' });
  }

  res.json({
    success: true,
    data: crop,
  });
});

// 6. Quick recommendation endpoint
router.post('/recommend', optionalAuthMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const {
      soilType,
      waterSource,
      season,
      previousCrop,
      budget,
      ph,
      drainage,
      category,
      organicMatter,
      moistureLevel,
      npkNitrogen,
      npkPhosphorus,
      npkPotassium,
      agroZone,
    } = req.body;

    const recommendations = calculateCropRecommendations({
      soilType: soilType || 'loamy',
      waterSource: waterSource || 'borewell',
      season: season || 'Kharif',
      previousCrop,
      budget,
      ph: ph ? parseFloat(ph) : undefined,
      drainage,
      category,
      organicMatter,
      moistureLevel,
      npkNitrogen,
      npkPhosphorus,
      npkPotassium,
      agroZone,
    });

    res.json({
      success: true,
      data: recommendations,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || 'Recommendation failed' });
  }
});

export default router;
