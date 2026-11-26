export interface User {
  id: string;
  name: string;
  phone: string;
  language: 'en' | 'kn' | 'ta' | 'te';
  state: string;
  district: string;
  village?: string | null;
  taluk?: string | null;
  farmSize?: number | null;
  farmUnit: string;
  avatar?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  locationAccuracy?: number | null;
  locationSource?: 'gps' | 'ip' | 'manual' | string | null;
}

export interface WeatherDay {
  date: string;
  dayName: string;
  weatherCode: number;
  condition: string;
  icon: string;
  tempMax: number;
  tempMin: number;
  rainChance: number;
  precipitationMm: number;
}

export interface WeatherData {
  location: string;
  state: string;
  district: string;
  latitude: number;
  longitude: number;
  temperature: number;
  condition: string;
  weatherCode: number;
  icon: string;
  humidity: number;
  windSpeedKmH: number;
  rainfallProbability: number;
  expectedPrecipitationMm: number;
  weekRange: string;
  nextWeekRange: string;
  nextWeekSummary: string;
  forecast7Days: WeatherDay[];
  forecast8To14Days: WeatherDay[];
  farmingAlert: string;
  farmingAlertKn: string;
  farmingAlertTa: string;
  farmingAlertTe: string;
  lastUpdated: string;
  isDemoFallback: boolean;
  dataSource: string;
  isStale?: boolean;
  agroZone?: string;
  agroZoneCode?: string;
  agroZoneDescription?: string;
  typicalSoils?: string[];
  taluk?: string;
  seasonInfo?: {
    season: 'Kharif' | 'Rabi' | 'Zaid';
    name: string;
    nameKannada: string;
    nameTamil: string;
    nameTelugu: string;
    monthsRange: string;
    currentPhase: string;
    currentPhaseKn: string;
    currentPhaseTa: string;
    currentPhaseTe: string;
    advice: string;
    adviceKn: string;
    adviceTa: string;
    adviceTe: string;
    primarySeasonalCrops: string[];
  };
}

export interface RecommendationResult {
  cropId: string;
  name: string;
  nameKannada: string;
  nameTamil: string;
  nameTelugu: string;
  category: string;
  suitabilityScore: number;
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
  imageStatus?: 'pending-review' | 'approved' | 'use-fallback';
  scientificName?: string;
  durationType?: 'short' | 'medium' | 'long' | 'perennial';
  sowingMonths?: string[];
  harvestMonths?: string[];
  gestationYears?: number;
  intercroppingOptions?: string[];
  roiEstimate?: string;
  isSeasonalFruit?: boolean;
  isLongTerm?: boolean;
  fruitingTime?: string;
  suitableAgroZones?: string[];
  marketDemand?: string;
  sowingWindowStatus?: {
    status: 'open' | 'closing_soon' | 'closed' | 'opens_in_n_days';
    label: string;
    labelKn?: string;
    labelTa?: string;
    labelTe?: string;
    daysRemaining?: number;
    daysUntilOpen?: number;
    favorableWeatherNote?: string;
  };
  detectedSeasonName?: string;
}

export interface CropCategory {
  id: string;
  name: string;
  nameKannada: string;
  nameTamil: string;
  nameTelugu: string;
  icon: string;
  count: number;
}

export interface CropItem {
  id: string;
  name: string;
  scientificName?: string;
  nameKannada: string;
  nameTamil: string;
  nameTelugu: string;
  category: string;
  idealSoilTypes: string[];
  minPh: number;
  maxPh: number;
  waterRequirement: 'Low' | 'Moderate' | 'High';
  waterMm?: string;
  durationDays: string;
  durationMin?: number;
  durationMax?: number;
  seasons: string[];
  minTemp?: number;
  maxTemp?: number;
  rainfallMm?: string;
  estimatedCostPerAcre: string;
  potentialYieldPerAcre: string;
  marketDemand: 'High' | 'Moderate' | 'Very High';
  description: string;
  descriptionKn: string;
  descriptionTa: string;
  descriptionTe: string;
  imageUrl: string;
  imageStatus?: 'pending-review' | 'approved' | 'use-fallback';
  risks: string[];
  benefits: string[];
  durationType?: 'short' | 'medium' | 'long' | 'perennial';
  sowingMonths?: string[];
  harvestMonths?: string[];
  gestationYears?: number;
  intercroppingOptions?: string[];
  roiEstimate?: string;
  isSeasonalFruit?: boolean;
  isLongTerm?: boolean;
  fruitingTime?: string;
  suitableAgroZones?: string[];
  stages?: any[];
}

export interface CropTask {
  id: string;
  cropPlanId: string;
  stage: string;
  stageOrder: number;
  dayRange: string;
  dayOffset: number;
  title: string;
  titleKn?: string;
  titleTa?: string;
  titleTe?: string;
  description: string;
  descriptionKn?: string;
  descriptionTa?: string;
  descriptionTe?: string;
  category: string;
  materialsNeeded?: string;
  importantTip?: string;
  importantTipKn?: string;
  importantTipTa?: string;
  importantTipTe?: string;
  isCompleted: boolean;
  completedAt?: string | null;
}

export interface CropStageGroup {
  stage: string;
  stageOrder: number;
  dayRange: string;
  dayOffset: number;
  importantTip?: string;
  importantTipKn?: string;
  importantTipTa?: string;
  importantTipTe?: string;
  materialsNeeded?: string[];
  tasks: CropTask[];
}

export interface CropPlan {
  id: string;
  userId: string;
  cropId: string;
  cropName: string;
  fieldName?: string;
  areaAcre?: number;
  startDate: string;
  status: 'active' | 'completed' | 'abandoned';
  currentStage?: string;
  currentStageIndex: number;
  totalTasks: number;
  completedTasks: number;
  progressPercentage: number;
  tasks?: CropTask[];
  stages?: CropStageGroup[];
  crop?: any;
}

export interface SymptomTag {
  id: string;
  slug: string;
  plantPart: string;
  pattern: string;
  colour?: string | null;
  spread?: string | null;
  stage?: string | null;
  labelEn: string;
  labelKn: string;
  labelTa: string;
  labelTe: string;
  icon?: string | null;
}

export interface ProblemImage {
  id?: string;
  path: string;
  caption: string;
  captionKn?: string | null;
  captionTa?: string | null;
  captionTe?: string | null;
  kind: 'symptom_closeup' | 'field_view' | 'pest_or_pathogen' | 'healthy_comparison';
  source?: string | null;
  author?: string | null;
  licence?: string | null;
  attribution?: string | null;
  isPrimary?: boolean;
}

export interface ProblemCropRef {
  id?: string;
  cropId?: string | null;
  cropName: string;
  cropSlug: string;
  importance: 'primary' | 'secondary' | 'minor';
}

export interface ProblemItem {
  id: string;
  slug: string;
  name: string;
  nameKn?: string;
  nameTa?: string;
  nameTe?: string;
  scientificName?: string;
  type: 'insect_pest' | 'fungal' | 'bacterial' | 'viral' | 'nematode' | 'mite' | 'weed' | 'nutrient_deficiency' | 'abiotic_stress';
  severity: 'low' | 'medium' | 'high' | 'critical';
  symptoms: string;
  symptomsKn?: string;
  symptomsTa?: string;
  symptomsTe?: string;
  cause?: string;
  favourableConditions?: string;
  favourableHumidity?: string;
  favourableTemp?: string;
  favourableSeasons?: string[];
  affectedStages?: string[];
  spreadPattern?: string;
  culturalControl?: string;
  culturalControlKn?: string;
  culturalControlTa?: string;
  culturalControlTe?: string;
  biologicalControl?: string;
  biologicalControlKn?: string;
  biologicalControlTa?: string;
  biologicalControlTe?: string;
  organicControl?: string;
  organicControlKn?: string;
  organicControlTa?: string;
  organicControlTe?: string;
  chemicalControl?: string;
  chemicalControlKn?: string;
  chemicalControlTa?: string;
  chemicalControlTe?: string;
  preventionSteps?: string[];
  preventionStepsKn?: string[];
  preventionStepsTa?: string[];
  preventionStepsTe?: string[];
  ipmSteps?: string[];
  ipmStepsKn?: string[];
  ipmStepsTa?: string[];
  ipmStepsTe?: string[];
  safetyNotes?: string;
  lookAlikes?: Array<{ name: string; difference: string }>;
  whenToCallExpert?: string;
  whenToCallExpertKn?: string;
  whenToCallExpertTa?: string;
  whenToCallExpertTe?: string;
  confidence?: string;
  sources?: string;
  verified?: boolean;
  images: ProblemImage[];
  crops: ProblemCropRef[];
  symptomTags?: Array<{ symptomTag: SymptomTag; weight: number; isPrimary: boolean }>;

  // Backward-compatible properties
  nameKannada: string;
  nameTamil: string;
  nameTelugu: string;
  affectedCrops: string[];
  cropSlugs?: string[];
  conditions?: string;
  prevention?: string;
  preventionKn?: string;
  preventionTa?: string;
  preventionTe?: string;
  expertAdvice?: string;
  expertAdviceKn?: string;
  expertAdviceTa?: string;
  expertAdviceTe?: string;
  imageUrl?: string;
}

export type Disease = ProblemItem;

export interface FindingItem {
  name: string;
  localNames?: { en?: string; kn?: string; ta?: string; te?: string };
  type: 'disease' | 'pest' | 'nutrient_deficiency' | 'environmental_stress' | 'healthy' | 'unclear';
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  spreadRisk?: string;
  observedSymptoms: string[];
  likelyCauses: string[];
}

export interface ChemicalItem {
  activeIngredient: string;
  class: string;
  purpose: string;
  applicationNotes: string;
}

export interface TreatmentData {
  immediateSteps: string[];
  culturalAndOrganic: string[];
  chemical: ChemicalItem[];
  safetyPrecautions: string[];
  preventionTips: string[];
  recheckInDays: number;
  whenToSeeExpert: string;
}

export interface CropHealthReport {
  id?: string;
  cropId?: string;
  imageQuality: 'good' | 'fair' | 'poor';
  retakeTip?: string;
  crop: {
    name: string;
    scientificName?: string;
    confidence: number;
  };
  status: 'healthy' | 'disease' | 'pest' | 'nutrient_deficiency' | 'environmental_stress' | 'unclear';
  topFindings: FindingItem[];
  treatment: TreatmentData;
  disclaimer: string;
  generatedAt: string;
  model: string;
  isSample?: boolean;
  verifiedSource?: 'verified entry' | 'AI-generated, verify with an expert';
  helpline?: string;
  thumbnailPath?: string;
}

export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  speechContent?: string;
  language?: string;
  mode?: 'gemini' | 'local_demo' | 'real_ai' | 'local';
  modelUsed?: string;
  sources?: string[];
  createdAt?: string;
}

export interface CropImage {
  type: 'plant' | 'flower' | 'fruit' | 'produce' | 'grain' | 'seed' | 'leaf';
  path: string;
  source: string;
  author: string;
  license: string;
  attributionUrl?: string;
  originalUrl?: string;
}

export interface CropCatalogItem extends CropItem {
  alphabeticalKey: string;
  confidence: 'high' | 'medium' | 'low';
  confidenceNote?: string;
  images: CropImage[];
  isRecommendedForFarmer?: boolean;
}

export interface CatalogPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface CatalogResponse {
  success: boolean;
  data: CropCatalogItem[];
  pagination: CatalogPagination;
}

export interface ImageCreditItem {
  cropId: string;
  cropName: string;
  scientificName: string;
  category: string;
  imagePath: string;
  imageType: string;
  source: string;
  author: string;
  license: string;
  attributionUrl?: string;
}

export interface MandiPriceItem {
  id: string;
  commodity: string;
  commodityKannada: string;
  category: string;
  variety: string;
  state: string;
  district: string;
  districtKannada: string;
  market: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  priceUnit: string;
  arrivalQuantity?: number;
  arrivalDate: string;
  source: string;
  updatedAt: string;
}

export interface MarketSummaryData {
  totalCommodities: number;
  totalMarkets: number;
  totalDistricts: number;
  totalRecords: number;
  latestArrivalDate: string;
  lastSync: {
    status: string;
    startedAt: string;
    completedAt: string | null;
    recordsFetched: number;
    recordsInserted: number;
    source: string;
    message?: string;
  } | null;
}

export interface MarketFilterOptions {
  states: string[];
  districts: Array<{ name: string; nameKannada: string }>;
  markets: Array<{ id: string; name: string; district: string; state: string }>;
  categories: string[];
  commodities: Array<{ id: string; name: string; category: string; nameKannada: string }>;
}

export interface CropPriceComparisonItem {
  market: string;
  district: string;
  variety: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  arrivalDate: string;
  arrivalQuantity?: number;
  source: string;
}

export interface CropPriceDetailsData {
  commodity: string;
  nameKannada: string;
  category: string;
  varieties: string[];
  summary: {
    minPrice: number;
    maxPrice: number;
    avgModalPrice: number;
    totalMarketsReporting: number;
    latestDate: string;
  };
  comparison: CropPriceComparisonItem[];
}

export interface PriceHistoryPoint {
  date: string;
  modalPrice: number;
  minPrice: number;
  maxPrice: number;
  marketsReporting: number;
  markets: Array<{ market: string; district: string; modalPrice: number }>;
}

export interface CropPriceHistoryData {
  commodity: string;
  timeframe: string;
  dataPointsCount: number;
  history: PriceHistoryPoint[];
}

export interface SyncLogEntry {
  id: string;
  source: string;
  startedAt: string;
  completedAt: string | null;
  recordsFetched: number;
  recordsInserted: number;
  recordsUpdated: number;
  recordsFailed: number;
  status: string;
  errorMessage?: string | null;
}


