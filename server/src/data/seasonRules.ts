/**
 * Regional Agro-Climatic Season Rules for South India (Karnataka, Tamil Nadu, Kerala, Andhra Pradesh, Telangana)
 *
 * Each region has distinct agricultural seasons, local terminology, and sowing windows.
 * NOTE: All dates are baseline agro-meteorological guidelines.
 * Verification flag: verified = false (verify with local RSK/KVK/ADA offices).
 */

export interface RegionalSeasonRule {
  id: string;
  state: string;
  regionName: string;
  standardSeason: 'Kharif' | 'Rabi' | 'Zaid';
  localName: {
    en: string;
    kn: string;
    ta: string;
    te: string;
  };
  paddySpecialName?: {
    en: string;
    kn: string;
    ta: string;
    te: string;
  };
  startMonth: number; // 1-12
  startDay: number;
  endMonth: number;
  endDay: number;
  sowingWindowStart: { month: number; day: number };
  sowingWindowEnd: { month: number; day: number };
  peakSowingMonths: string[];
  harvestMonths: string[];
  primaryCrops: string[];
  verified: boolean;
  verificationNote: string;
}

export const REGIONAL_SEASON_RULES: RegionalSeasonRule[] = [
  // ==========================================
  // KARNATAKA
  // ==========================================
  {
    id: 'ka-mungaru-kharif',
    state: 'Karnataka',
    regionName: 'Karnataka Plains & Ghats',
    standardSeason: 'Kharif',
    localName: {
      en: 'Mungaru (Kharif Monsoon)',
      kn: 'ಮುಂಗಾರು ಹಂಗಾಮು (ಖಾರೀಫ್)',
      ta: 'முங்காரூ (காரிப் பருவமழை)',
      te: 'ముంగారు (ఖరీఫ్ వర్షాకాలం)',
    },
    startMonth: 6,
    startDay: 1,
    endMonth: 10,
    endDay: 15,
    sowingWindowStart: { month: 6, day: 1 },
    sowingWindowEnd: { month: 7, day: 25 },
    peakSowingMonths: ['June', 'July'],
    harvestMonths: ['October', 'November'],
    primaryCrops: ['Paddy (Rice)', 'Finger Millet (Ragi)', 'Maize', 'Red Gram (Tur)', 'Cotton', 'Groundnut'],
    verified: false,
    verificationNote: 'Verify with UAS Bangalore / Dharwad Package of Practices or local Raitha Samparka Kendra (RSK).',
  },
  {
    id: 'ka-hingaru-rabi',
    state: 'Karnataka',
    regionName: 'Karnataka Plains & Ghats',
    standardSeason: 'Rabi',
    localName: {
      en: 'Hingaru (Rabi Winter)',
      kn: 'ಹಿಂಗಾರು ಹಂಗಾಮು (ರಬಿ)',
      ta: 'ஹிங்காரூ (ரபி குளிர்காலம்)',
      te: 'హింగారు (రబీ శీతాకాలం)',
    },
    startMonth: 10,
    startDay: 16,
    endMonth: 2,
    endDay: 15,
    sowingWindowStart: { month: 9, day: 25 },
    sowingWindowEnd: { month: 11, day: 20 },
    peakSowingMonths: ['October', 'November'],
    harvestMonths: ['February', 'March'],
    primaryCrops: ['Chickpea (Bengal Gram)', 'Sorghum (Jowar)', 'Wheat', 'Sunflower', 'Safflower', 'Rabi Onion'],
    verified: false,
    verificationNote: 'Verify with local RSK / KVK; depends on North-East monsoon withdrawal and residual soil moisture.',
  },
  {
    id: 'ka-bisilu-zaid',
    state: 'Karnataka',
    regionName: 'Karnataka Plains & Ghats',
    standardSeason: 'Zaid',
    localName: {
      en: 'Bisilu (Summer / Zaid)',
      kn: 'ಬೇಸಿಗೆ ಹಂಗಾಮು (ಬಿಸಿಲು/ಜಾಯಿದ್)',
      ta: 'கோடைப் பருவம் (ஜாயித்)',
      te: 'వేసవి కాలం (జాయద్)',
    },
    startMonth: 2,
    startDay: 16,
    endMonth: 5,
    endDay: 31,
    sowingWindowStart: { month: 1, day: 15 },
    sowingWindowEnd: { month: 3, day: 15 },
    peakSowingMonths: ['February', 'March'],
    harvestMonths: ['April', 'May'],
    primaryCrops: ['Watermelon', 'Green Gram (Moong)', 'Black Gram (Urad)', 'Cucumber', 'Summer Groundnut', 'Vegetables'],
    verified: false,
    verificationNote: 'Verify with RSK; requires assured irrigation (borewell / canal).',
  },

  // ==========================================
  // TAMIL NADU
  // ==========================================
  {
    id: 'tn-kuruvai',
    state: 'Tamil Nadu',
    regionName: 'Cauvery Delta & Northern Tamil Nadu',
    standardSeason: 'Kharif',
    localName: {
      en: 'Kuruvai (Early Monsoon Sowing)',
      kn: 'ಕುರುವೈ (ಆರಂಭಿಕ ಮುಂಗಾರು)',
      ta: 'குறுவை பருவம் (முன் காரிப்)',
      te: 'కురువై (ముందస్తు ఖరీఫ్)',
    },
    paddySpecialName: {
      en: 'Kuruvai Paddy Season',
      kn: 'ಕುರುವೈ ಭತ್ತದ ಹಂಗಾಮು',
      ta: 'குறுவை நெல் பருவம்',
      te: 'కురువై వరి సీజన్',
    },
    startMonth: 5,
    startDay: 15,
    endMonth: 8,
    endDay: 31,
    sowingWindowStart: { month: 6, day: 1 },
    sowingWindowEnd: { month: 7, day: 15 },
    peakSowingMonths: ['June', 'July'],
    harvestMonths: ['September', 'October'],
    primaryCrops: ['Short Duration Paddy (ADT 43, ASD 16)', 'Cotton', 'Sesame', 'Vegetables'],
    verified: false,
    verificationNote: 'Verify with TNAU Agritech Portal or Assistant Director of Agriculture (ADA) for Mettur water release schedule.',
  },
  {
    id: 'tn-samba',
    state: 'Tamil Nadu',
    regionName: 'Cauvery Delta & Central Tamil Nadu',
    standardSeason: 'Kharif',
    localName: {
      en: 'Samba (Main North-East Monsoon Season)',
      kn: 'ಸಾಂಬಾ ಹಂಗಾಮು (ಮುಖ್ಯ ಮಳೆಗಾಲ)',
      ta: 'சம்பா பருவம் (முதன்மை பருவம்)',
      te: 'సాంబా కాలం (ప్రధాన వర్షాకాలం)',
    },
    paddySpecialName: {
      en: 'Samba Medium/Long Duration Paddy',
      kn: 'ಸಾಂಬಾ ಮಧ್ಯಮಾವಧಿ ಭತ್ತ',
      ta: 'சம்பா நடுத்தர/நீண்டகால நெல்',
      te: 'సాంబా వరి పంట',
    },
    startMonth: 8,
    startDay: 1,
    endMonth: 1,
    endDay: 15,
    sowingWindowStart: { month: 8, day: 15 },
    sowingWindowEnd: { month: 10, day: 15 },
    peakSowingMonths: ['August', 'September', 'October'],
    harvestMonths: ['January', 'February'],
    primaryCrops: ['Medium Duration Paddy (CR 1009, CO 51)', 'Sugarcane', 'Maize', 'Black Gram'],
    verified: false,
    verificationNote: 'Verify with TNAU / District Collectorate for NE monsoon onset predictions.',
  },
  {
    id: 'tn-thaladi-navarai',
    state: 'Tamil Nadu',
    regionName: 'Tamil Nadu Plains & Coastal Belt',
    standardSeason: 'Rabi',
    localName: {
      en: 'Thaladi / Navarai (Late Rabi & Winter)',
      kn: 'ತಾಳಡಿ / ನವರೈ (ಹಿಂಗಾರು ಚಳಿಗಾಲ)',
      ta: 'தாளடி / நவரை பருவம் (ரபி & குளிர்காலம்)',
      te: 'తాళడి / నవరై (రబీ & శీతాకాలం)',
    },
    paddySpecialName: {
      en: 'Thaladi Second Crop Paddy',
      kn: 'ತಾಳಡಿ ಎರಡನೇ ಬೆಳೆ ಭತ್ತ',
      ta: 'தாளடி இரண்டாம் நெல் பயிர்',
      te: 'తాళడి రెండో వరి పంట',
    },
    startMonth: 10,
    startDay: 15,
    endMonth: 3,
    endDay: 15,
    sowingWindowStart: { month: 10, day: 15 },
    sowingWindowEnd: { month: 11, day: 30 },
    peakSowingMonths: ['October', 'November'],
    harvestMonths: ['February', 'March'],
    primaryCrops: ['Paddy', 'Groundnut', 'Black Gram (Urad)', 'Green Gram (Moong)', 'Gingelly (Sesame)'],
    verified: false,
    verificationNote: 'Verify with local TNAU KVK; uses tail-end NE monsoon showers and residual moisture.',
  },
  {
    id: 'tn-chithirai-summer',
    state: 'Tamil Nadu',
    regionName: 'Tamil Nadu Irrigated Tracts',
    standardSeason: 'Zaid',
    localName: {
      en: 'Chithirai Pattam (Summer Sowing)',
      kn: 'ಚಿತ್ತಿರೈ ಪಟ್ಟಂ (ಬೇಸಿಗೆ ಬಿತ್ತನೆ)',
      ta: 'சித்திரை பட்டம் (கோடை விதைப்பு)',
      te: 'చిత్రై పట్టం (వేసవి విత్తనం)',
    },
    startMonth: 2,
    startDay: 1,
    endMonth: 5,
    endDay: 15,
    sowingWindowStart: { month: 2, day: 1 },
    sowingWindowEnd: { month: 3, day: 20 },
    peakSowingMonths: ['February', 'March'],
    harvestMonths: ['May', 'June'],
    primaryCrops: ['Watermelon', 'Muskmelon', 'Cucumber', 'Summer Bhendi', 'Gingelly'],
    verified: false,
    verificationNote: 'Verify with local ADA office; requires high heat tolerance and drip fertigation.',
  },

  // ==========================================
  // KERALA
  // ==========================================
  {
    id: 'kl-virippu',
    state: 'Kerala',
    regionName: 'Kerala Coastal & Midland Agro-Zone',
    standardSeason: 'Kharif',
    localName: {
      en: 'Virippu (Autumn / First Crop Season)',
      kn: 'ವಿರಿಪ್ಪು (ಮೊದಲ ಬೆಳೆ ಹಂಗಾಮು)',
      ta: 'விரிப்பு (முதல் பயிர் பருவம்)',
      te: 'విరిప్పు (మొదటి పంట కాలం)',
    },
    startMonth: 4,
    startDay: 15,
    endMonth: 8,
    endDay: 31,
    sowingWindowStart: { month: 5, day: 1 },
    sowingWindowEnd: { month: 6, day: 15 },
    peakSowingMonths: ['May', 'June'],
    harvestMonths: ['September', 'October'],
    primaryCrops: ['Paddy (Uma, Jyothi)', 'Tapioca (Cassava)', 'Banana (Nendran)', 'Ginger', 'Turmeric'],
    verified: false,
    verificationNote: 'Verify with Kerala Agricultural University (KAU) Package of Practices.',
  },
  {
    id: 'kl-mundakan',
    state: 'Kerala',
    regionName: 'Kerala Wetlands & Highlands',
    standardSeason: 'Rabi',
    localName: {
      en: 'Mundakan (Winter / Second Crop Season)',
      kn: 'ಮುಂಡಕನ್ (ಎರಡನೇ ಬೆಳೆ ಹಂಗಾಮು)',
      ta: 'முண்டகன் (இரண்டாம் பயிர் பருவம்)',
      te: 'ముండకన్ (రెండో పంట కాలం)',
    },
    startMonth: 9,
    startDay: 1,
    endMonth: 1,
    endDay: 15,
    sowingWindowStart: { month: 9, day: 15 },
    sowingWindowEnd: { month: 10, day: 31 },
    peakSowingMonths: ['September', 'October'],
    harvestMonths: ['December', 'January'],
    primaryCrops: ['Paddy', 'Vegetables', 'Pulses', 'Fodder Grass'],
    verified: false,
    verificationNote: 'Verify with KAU Krishi Bhavan officers; dependent on NE monsoon retreat.',
  },
  {
    id: 'kl-puncha',
    state: 'Kerala',
    regionName: 'Kuttanad & Kole Wetlands',
    standardSeason: 'Zaid',
    localName: {
      en: 'Puncha (Summer / Third Crop Season)',
      kn: 'ಪುಂಚಾ (ಬೇಸಿಗೆ ಮೂರನೇ ಬೆಳೆ ಹಂಗಾಮು)',
      ta: 'புஞ்சா (கோடை மூன்றாம் பயிர் பருவம்)',
      te: 'పుంచా (వేసవి మూడో పంట కాలం)',
    },
    startMonth: 12,
    startDay: 15,
    endMonth: 4,
    endDay: 15,
    sowingWindowStart: { month: 12, day: 15 },
    sowingWindowEnd: { month: 1, day: 25 },
    peakSowingMonths: ['December', 'January'],
    harvestMonths: ['March', 'April'],
    primaryCrops: ['Paddy (below sea level tracts)', 'Watermelon', 'Cucumber', 'Cowpea'],
    verified: false,
    verificationNote: 'Verify with Kuttanad Padashekara Samithi & KAU Rice Research Station Moncompu.',
  },

  // ==========================================
  // ANDHRA PRADESH & TELANGANA
  // ==========================================
  {
    id: 'ap-ts-sarva-kharif',
    state: 'Andhra Pradesh',
    regionName: 'Godavari / Krishna Delta & Rayalaseema',
    standardSeason: 'Kharif',
    localName: {
      en: 'Sarva / Kharif (Monsoon Sowing)',
      kn: 'ಸರ್ವ / ಖಾರೀಫ್ (ಮುಂಗಾರು)',
      ta: 'சார்வா / காரிப் (பருவமழை விதைப்பு)',
      te: 'సర్వ / ఖరీఫ్ (వర్షాకాలం సాగు)',
    },
    startMonth: 6,
    startDay: 1,
    endMonth: 10,
    endDay: 31,
    sowingWindowStart: { month: 6, day: 1 },
    sowingWindowEnd: { month: 7, day: 31 },
    peakSowingMonths: ['June', 'July'],
    harvestMonths: ['October', 'November'],
    primaryCrops: ['Paddy (BPT 5204)', 'Cotton', 'Chilli', 'Red Gram', 'Maize', 'Groundnut'],
    verified: false,
    verificationNote: 'Verify with ANGRAU / PJTSAU Package of Practices and local Rythu Bharosa Kendram (RBK).',
  },
  {
    id: 'ap-ts-dalwa-rabi',
    state: 'Andhra Pradesh',
    regionName: 'Godavari / Krishna Delta & Rayalaseema',
    standardSeason: 'Rabi',
    localName: {
      en: 'Dalwa / Rabi (Winter Season)',
      kn: 'ದಾಲ್ವ / ರಬಿ (ಚಳಿಗಾಲದ ಬೆಳೆ)',
      ta: 'தால்வா / ரபி (குளிர்கால பயிர்)',
      te: 'దాల్వా / రబీ (శీతాకాలం సాగు)',
    },
    startMonth: 11,
    startDay: 1,
    endMonth: 3,
    endDay: 31,
    sowingWindowStart: { month: 10, day: 15 },
    sowingWindowEnd: { month: 12, day: 10 },
    peakSowingMonths: ['October', 'November'],
    harvestMonths: ['February', 'March'],
    primaryCrops: ['Paddy (Dalwa)', 'Bengal Gram (Chickpea)', 'Black Gram (Zero Till)', 'Maize', 'Sunflower'],
    verified: false,
    verificationNote: 'Verify with local RBK / KVK; zero-till pulse sowing directly into rice fallows.',
  },
  {
    id: 'ap-ts-edagaru-zaid',
    state: 'Andhra Pradesh',
    regionName: 'Andhra Pradesh & Telangana Irrigated Tracts',
    standardSeason: 'Zaid',
    localName: {
      en: 'Edagaru / Summer (Zaid Season)',
      kn: 'ಎಡಗಾರು / ಜಾಯಿದ್ (ಬೇಸಿಗೆ ಹಂಗಾಮು)',
      ta: 'எடகாரூ / ஜாயித் (கோடைக்காலம்)',
      te: 'ఎడగారు / జాయద్ (వేసవి సాగు)',
    },
    startMonth: 2,
    startDay: 1,
    endMonth: 5,
    endDay: 31,
    sowingWindowStart: { month: 1, day: 20 },
    sowingWindowEnd: { month: 3, day: 10 },
    peakSowingMonths: ['February', 'March'],
    harvestMonths: ['April', 'May'],
    primaryCrops: ['Watermelon', 'Green Gram', 'Sesame', 'Summer Groundnut', 'Vegetables'],
    verified: false,
    verificationNote: 'Verify with PJTSAU / ANGRAU guidelines; borewell water adequacy required.',
  },
];

/**
 * Normalizes state name to match regional season rules.
 */
export function normalizeIndianState(rawState?: string): string {
  if (!rawState) return '';
  const s = rawState.trim().toLowerCase();
  if (s.includes('karnat') || s.includes('ka')) return 'Karnataka';
  if (s.includes('tamil') || s.includes('tn')) return 'Tamil Nadu';
  if (s.includes('keral') || s.includes('kl')) return 'Kerala';
  if (s.includes('telang') || s.includes('tg') || s.includes('ts')) return 'Andhra Pradesh'; // Shares similar agro-climatic calendar
  if (s.includes('andhra') || s.includes('ap')) return 'Andhra Pradesh';
  return rawState.trim();
}

/**
 * Checks if a target date falls inside a seasonal date window (handles crossing New Year boundaries).
 */
export function isDateInWindow(
  date: Date,
  startMonth: number,
  startDay: number,
  endMonth: number,
  endDay: number
): boolean {
  const m = date.getMonth() + 1; // 1-12
  const d = date.getDate();

  const currentVal = m * 100 + d;
  const startVal = startMonth * 100 + startDay;
  const endVal = endMonth * 100 + endDay;

  if (startVal <= endVal) {
    // Standard window in same calendar year (e.g. Jun 1 to Oct 15)
    return currentVal >= startVal && currentVal <= endVal;
  } else {
    // Window wraps over December-January (e.g. Oct 16 to Feb 15)
    return currentVal >= startVal || currentVal <= endVal;
  }
}

/**
 * Calculate days remaining in sowing window from today.
 */
export function getDaysRemainingInWindow(today: Date, endMonth: number, endDay: number): number {
  const year = today.getFullYear();
  let targetYear = year;

  // If window ends earlier in year than today, it ends next year
  const m = today.getMonth() + 1;
  const d = today.getDate();
  const currentVal = m * 100 + d;
  const endVal = endMonth * 100 + endDay;

  if (endVal < currentVal) {
    targetYear = year + 1;
  }

  const targetDate = new Date(targetYear, endMonth - 1, endDay);
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Calculate days until window opens.
 */
export function getDaysUntilWindowOpens(today: Date, startMonth: number, startDay: number): number {
  const year = today.getFullYear();
  let targetYear = year;

  const m = today.getMonth() + 1;
  const d = today.getDate();
  const currentVal = m * 100 + d;
  const startVal = startMonth * 100 + startDay;

  if (startVal < currentVal) {
    targetYear = year + 1;
  }

  const targetDate = new Date(targetYear, startMonth - 1, startDay);
  const diffTime = targetDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
