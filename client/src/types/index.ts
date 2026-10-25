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

export interface Disease {
  id: string;
  name: string;
  nameKannada: string;
  nameTamil: string;
  nameTelugu: string;
  affectedCrops: string[];
  symptoms: string;
  symptomsKn?: string;
  symptomsTa?: string;
  symptomsTe?: string;
  conditions: string;
  prevention: string;
  preventionKn?: string;
  preventionTa?: string;
  preventionTe?: string;
  ipmSteps: string[];
  ipmStepsKn?: string[];
  ipmStepsTa?: string[];
  ipmStepsTe?: string[];
  expertAdvice: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  imageUrl?: string;
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

