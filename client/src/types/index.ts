export interface User {
  id: string;
  name: string;
  phone: string;
  language: 'en' | 'kn' | 'ta' | 'te';
  state: string;
  district: string;
  village?: string | null;
  farmSize?: number | null;
  farmUnit: string;
  avatar?: string | null;
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
