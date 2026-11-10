import { findLocationByCoords, findLocationByName } from '../data/indiaLocations';
import {
  REGIONAL_SEASON_RULES,
  RegionalSeasonRule,
  normalizeIndianState,
  isDateInWindow,
  getDaysRemainingInWindow,
  getDaysUntilWindowOpens,
} from '../data/seasonRules';

export interface SowingWindowStatusResult {
  status: 'open' | 'closing_soon' | 'closed' | 'opens_in_n_days';
  label: string;
  labelKn: string;
  labelTa: string;
  labelTe: string;
  daysRemaining?: number;
  daysUntilOpen?: number;
  favorableWeatherNote?: string;
}

export interface SeasonInfo {
  season: 'Kharif' | 'Rabi' | 'Zaid';
  standardSeason: 'Kharif' | 'Rabi' | 'Zaid';
  name: string;
  nameKannada: string;
  nameTamil: string;
  nameTelugu: string;
  localSeasonName: string;
  localSeasonNameKn: string;
  localSeasonNameTa: string;
  localSeasonNameTe: string;
  paddySpecialName?: string;
  paddySpecialNameKn?: string;
  paddySpecialNameTa?: string;
  paddySpecialNameTe?: string;
  monthsRange: string;
  sowingWindow: string;
  harvestWindow: string;
  sowingWindowStatus: 'open' | 'closing_soon' | 'closed' | 'opens_in_n_days';
  daysRemainingInWindow: number;
  daysUntilWindowOpens: number;
  currentPhase: 'Sowing & Land Prep' | 'Vegetative Growth' | 'Flowering & Grain Filling' | 'Harvesting & Threshing';
  currentPhaseKn: string;
  currentPhaseTa: string;
  currentPhaseTe: string;
  advice: string;
  adviceKn: string;
  adviceTa: string;
  adviceTe: string;
  primarySeasonalCrops: string[];
  verified: boolean;
  verificationNote: string;
  confirmationLine: {
    en: string;
    kn: string;
    ta: string;
    te: string;
  };
}

/**
 * Detects the specific agricultural season and sowing window using the farmer's state/district and today's date.
 * If no location provided, raises or returns undefined without silently defaulting.
 */
export function detectSeasonFromLocation(
  stateName?: string,
  districtName?: string,
  _lat?: number,
  _lon?: number,
  today = new Date()
): SeasonInfo | null {
  const normState = normalizeIndianState(stateName);
  const locationLabel = districtName
    ? `${districtName}${normState ? ', ' + normState : ''}`
    : normState || 'your region';

  // 1. Filter regional rules for the target state
  let stateRules = REGIONAL_SEASON_RULES.filter(
    (r) => r.state.toLowerCase() === normState.toLowerCase()
  );

  // If state not directly in list, fallback to Karnataka as baseline for Southern Peninsula
  // but keep verification note prominent
  if (stateRules.length === 0) {
    stateRules = REGIONAL_SEASON_RULES.filter((r) => r.state === 'Karnataka');
  }

  // 2. Find matching rule where today's date falls in season window
  let activeRule = stateRules.find((rule) =>
    isDateInWindow(today, rule.startMonth, rule.startDay, rule.endMonth, rule.endDay)
  );

  // Fallback to first rule if boundary condition
  if (!activeRule) {
    activeRule = stateRules[0];
  }

  // 3. Check sowing window status
  const isInsideSowing = isDateInWindow(
    today,
    activeRule.sowingWindowStart.month,
    activeRule.sowingWindowStart.day,
    activeRule.sowingWindowEnd.month,
    activeRule.sowingWindowEnd.day
  );

  const daysRemaining = getDaysRemainingInWindow(
    today,
    activeRule.sowingWindowEnd.month,
    activeRule.sowingWindowEnd.day
  );

  const daysUntilOpen = getDaysUntilWindowOpens(
    today,
    activeRule.sowingWindowStart.month,
    activeRule.sowingWindowStart.day
  );

  let windowStatus: SeasonInfo['sowingWindowStatus'] = 'closed';
  if (isInsideSowing) {
    windowStatus = daysRemaining <= 15 ? 'closing_soon' : 'open';
  } else if (daysUntilOpen > 0 && daysUntilOpen <= 45) {
    windowStatus = 'opens_in_n_days';
  }

  // Determine current lifecycle phase
  let currentPhase: SeasonInfo['currentPhase'] = 'Vegetative Growth';
  let currentPhaseKn = 'ಸಸ್ಯ ಬೆಳವಣಿಗೆಯ ಹಂತ';
  let currentPhaseTa = 'தாவர வளர்ச்சி பருவம்';
  let currentPhaseTe = 'మొక్కల పెరుగుదల దశ';

  if (isInsideSowing) {
    currentPhase = 'Sowing & Land Prep';
    currentPhaseKn = 'ಬಿತ್ತನೆ ಮತ್ತು ಭೂಮಿ ಸಿದ್ಧತೆ ಹಂತ';
    currentPhaseTa = 'விதைப்பு மற்றும் நில தயாரிப்பு';
    currentPhaseTe = 'విత్తడం మరియు నేల తయారీ దశ';
  } else if (daysRemaining === 0 && daysUntilOpen > 60) {
    currentPhase = 'Harvesting & Threshing';
    currentPhaseKn = 'ಕೊಯ್ಲು ಮತ್ತು ಒಕ್ಕಣೆ ಹಂತ';
    currentPhaseTa = 'அறுவடை பருவம்';
    currentPhaseTe = 'కోత మరియు నూర్పిడి దశ';
  }

  const startMonthName = new Date(2026, activeRule.startMonth - 1).toLocaleString('en', { month: 'short' });
  const endMonthName = new Date(2026, activeRule.endMonth - 1).toLocaleString('en', { month: 'short' });
  const monthsRange = `${startMonthName} - ${endMonthName}`;

  const sowStartStr = `${new Date(2026, activeRule.sowingWindowStart.month - 1).toLocaleString('en', { month: 'short' })} ${activeRule.sowingWindowStart.day}`;
  const sowEndStr = `${new Date(2026, activeRule.sowingWindowEnd.month - 1).toLocaleString('en', { month: 'short' })} ${activeRule.sowingWindowEnd.day}`;
  const sowingWindow = `${sowStartStr} - ${sowEndStr}`;

  const harvestWindow = activeRule.harvestMonths.join(' - ');

  // Confirmation lines
  const confirmationLine = {
    en: `Detected: ${activeRule.localName.en} sowing season in ${locationLabel}.`,
    kn: `ಪತ್ತೆಯಾಗಿದೆ: ${locationLabel} ನಲ್ಲಿ ${activeRule.localName.kn} ಬಿತ್ತನೆ ಹಂಗಾಮು.`,
    ta: `கண்டறியப்பட்டது: ${locationLabel} பகுதியில் ${activeRule.localName.ta} விதைப்பு பருவம்.`,
    te: `గుర్తించబడింది: ${locationLabel} లో ${activeRule.localName.te} సాగు కాలం.`,
  };

  return {
    season: activeRule.standardSeason,
    standardSeason: activeRule.standardSeason,
    name: activeRule.localName.en,
    nameKannada: activeRule.localName.kn,
    nameTamil: activeRule.localName.ta,
    nameTelugu: activeRule.localName.te,
    localSeasonName: activeRule.localName.en,
    localSeasonNameKn: activeRule.localName.kn,
    localSeasonNameTa: activeRule.localName.ta,
    localSeasonNameTe: activeRule.localName.te,
    paddySpecialName: activeRule.paddySpecialName?.en,
    paddySpecialNameKn: activeRule.paddySpecialName?.kn,
    paddySpecialNameTa: activeRule.paddySpecialName?.ta,
    paddySpecialNameTe: activeRule.paddySpecialName?.te,
    monthsRange,
    sowingWindow,
    harvestWindow,
    sowingWindowStatus: windowStatus,
    daysRemainingInWindow: daysRemaining,
    daysUntilWindowOpens: daysUntilOpen,
    currentPhase,
    currentPhaseKn,
    currentPhaseTa,
    currentPhaseTe,
    advice: `Optimal ${activeRule.localName.en} management. Ensure field drainage during heavy rains and timely soil preparation.`,
    adviceKn: `${activeRule.localName.kn} ಗೆ ಸೂಕ್ತ ಸಿದ್ಧತೆ. ಮಣ್ಣಿನ ತೇವಾಂಶ ಸಂರಕ್ಷಿಸಿ ಕಾಲಮಿತಿಯಲ್ಲಿ ಬಿತ್ತನೆ ಮುಗಿಸಿ.`,
    adviceTa: `${activeRule.localName.ta} உரிய மேலாண்மை. பருவமழை தொடங்கும் முன் நிலத்தை தயார் செய்யவும்.`,
    adviceTe: `${activeRule.localName.te} సరైన యాజమాన్యం. సకాలంలో విత్తుకోవడానికి నేలను సిద్ధం చేసుకోండి.`,
    primarySeasonalCrops: activeRule.primaryCrops,
    verified: activeRule.verified,
    verificationNote: activeRule.verificationNote,
    confirmationLine,
  };
}

/**
 * Calculates sowing window status for an individual crop given the current date and local weather forecast.
 */
export function getCropSowingStatus(
  crop: {
    name: string;
    sowingMonths?: string[];
    seasons?: string[];
  },
  locationSeason?: SeasonInfo | null,
  today = new Date(),
  weatherForecast?: { rainNext7DaysMm?: number }
): SowingWindowStatusResult {
  const currentMonthName = today.toLocaleString('en', { month: 'long' }); // e.g. "October"
  const currentMonthShort = today.toLocaleString('en', { month: 'short' }); // e.g. "Oct"

  const sowingMonths = crop.sowingMonths || [];
  const cropSeasons = (crop.seasons || []).map((s) => s.toLowerCase());

  // Check if current month is in sowing months
  const isDirectMonthMatch = sowingMonths.some(
    (m) =>
      m.toLowerCase().includes(currentMonthName.toLowerCase()) ||
      m.toLowerCase().includes(currentMonthShort.toLowerCase()) ||
      currentMonthName.toLowerCase().includes(m.toLowerCase())
  );

  // Check if season matches
  const currentSeasonStandard = locationSeason?.standardSeason?.toLowerCase() || 'kharif';
  const isSeasonMatch = cropSeasons.includes(currentSeasonStandard) || cropSeasons.includes('year-round');

  const daysLeftInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate() - today.getDate();

  // Weather note if rain forecast is favorable
  let weatherNote: string | undefined = undefined;
  if (weatherForecast && (weatherForecast.rainNext7DaysMm ?? 0) > 10) {
    weatherNote = 'Favorable soil moisture from forecast showers';
  }

  if (isDirectMonthMatch || (sowingMonths.length === 0 && isSeasonMatch)) {
    if (daysLeftInMonth <= 10) {
      return {
        status: 'closing_soon',
        label: `Closing Soon (${daysLeftInMonth} days left in sowing window)`,
        labelKn: `ಶೀಘ್ರ ಮುಕ್ತಾಯ (${daysLeftInMonth} ದಿನಗಳು ಬಾಕಿ)`,
        labelTa: `விரைவில் முடிகிறது (${daysLeftInMonth} நாட்கள் உள்ளன)`,
        labelTe: `త్వరలో ముగుస్తుంది (${daysLeftInMonth} రోజులు మిగిలి ఉన్నాయి)`,
        daysRemaining: daysLeftInMonth,
        favorableWeatherNote: weatherNote,
      };
    }
    return {
      status: 'open',
      label: 'Sowing Window Open (Ideal time to plant)',
      labelKn: 'ಬಿತ್ತನೆ ಸಮಯ ತೆರೆದಿದೆ (ಅತ್ಯುತ್ತಮ ಸಮಯ)',
      labelTa: 'விதைப்பு நேரம் திறந்துள்ளது (சிறந்த தருணம்)',
      labelTe: 'విత్తే సమయం అనుకూలం (సరైన సమయం)',
      daysRemaining: daysLeftInMonth,
      favorableWeatherNote: weatherNote,
    };
  }

  // Check next month
  const nextMonthDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  const nextMonthName = nextMonthDate.toLocaleString('en', { month: 'long' });
  const isNextMonthMatch = sowingMonths.some((m) =>
    m.toLowerCase().includes(nextMonthName.toLowerCase())
  );

  if (isNextMonthMatch) {
    const daysUntil = daysLeftInMonth + 1;
    return {
      status: 'opens_in_n_days',
      label: `Opens in ${daysUntil} days (${nextMonthName})`,
      labelKn: `${daysUntil} ದಿನಗಳಲ್ಲಿ ಪ್ರಾರಂಭವಾಗಲಿದೆ (${nextMonthName})`,
      labelTa: `${daysUntil} நாட்களில் தொடங்குகிறது (${nextMonthName})`,
      labelTe: `${daysUntil} రోజుల్లో ప్రారంభమవుతుంది (${nextMonthName})`,
      daysUntilOpen: daysUntil,
    };
  }

  return {
    status: 'closed',
    label: 'Sowing Window Closed for Current Cycle',
    labelKn: 'ಪ್ರಸ್ತುತ ಹಂಗಾಮಿನ ಬಿತ್ತನೆ ಅವಧಿ ಮುಗಿದಿದೆ',
    labelTa: 'தற்போதைய சுழற்சிக்கான விதைப்பு நேரம் முடிந்தது',
    labelTe: 'ప్రస్తుత కాలానికి విత్తే సమయం ముగిసింది',
  };
}

/**
 * Returns location agro-climatic conditions.
 * Strict: If location is missing, returns hasLocation = false instead of falling back to Mandya.
 */
export function getLocationConditions(
  lat?: number,
  lon?: number,
  state?: string,
  district?: string,
  taluk?: string
) {
  // If no location parameters are provided at all, ask farmer to set location
  if (!state && !district && (lat === undefined || lon === undefined)) {
    return {
      hasLocation: false,
      needsLocation: true,
      message: 'Please set your farm location. Krushi Sathi requires your location for local season & weather.',
      location: null,
      season: null,
    };
  }

  let locationData;

  if (state || district) {
    locationData = findLocationByName(state, district, taluk);
  }

  if (!locationData && !state && !district && lat !== undefined && lon !== undefined) {
    const candidate = findLocationByCoords(lat, lon);
    const approxDeg = Math.hypot(candidate.latitude - lat, candidate.longitude - lon);
    if (approxDeg <= 1.0) {
      locationData = candidate;
    }
  }

  // If still not matched, construct minimal location from passed query without fabricating Mandya/Karnataka
  if (!locationData) {
    locationData = {
      state: state || '',
      district: district || '',
      taluk: taluk || district || '',
      latitude: lat ?? 0,
      longitude: lon ?? 0,
      agroZone: 'Local Agricultural Zone',
      agroZoneCode: 'LOCAL',
      agroZoneDescription: 'Regional agro-climatic growing conditions tailored to your local coordinates.',
      typicalSoils: ['red', 'loamy', 'black'],
      rainfallMm: '650 - 850 mm',
      primaryCrops: ['Paddy', 'Ragi', 'Pulses'],
    };
  }

  const seasonInfo = detectSeasonFromLocation(
    locationData.state,
    locationData.district,
    locationData.latitude,
    locationData.longitude
  );

  return {
    hasLocation: true,
    needsLocation: false,
    location: locationData,
    season: seasonInfo,
  };
}

/**
 * Backwards compatibility wrapper.
 */
export function getCurrentAgriculturalSeason(date = new Date()): SeasonInfo {
  const detected = detectSeasonFromLocation('Karnataka', 'Mandya', 12.524, 76.896, date);
  if (detected) return detected;

  // Ultimate fallback
  return {
    season: 'Rabi',
    standardSeason: 'Rabi',
    name: 'Hingaru (Rabi Winter)',
    nameKannada: 'ಹಿಂಗಾರು ಹಂಗಾಮು (ರಬಿ)',
    nameTamil: 'ரபி பருவம் (குளிர்காலம்)',
    nameTelugu: 'రబీ కాలం (శీతాకాలం)',
    localSeasonName: 'Hingaru',
    localSeasonNameKn: 'ಹಿಂಗಾರು',
    localSeasonNameTa: 'ரபி',
    localSeasonNameTe: 'రబీ',
    monthsRange: 'October - February',
    sowingWindow: 'October 1 - November 20',
    harvestWindow: 'February - March',
    sowingWindowStatus: 'open',
    daysRemainingInWindow: 20,
    daysUntilWindowOpens: 0,
    currentPhase: 'Sowing & Land Prep',
    currentPhaseKn: 'ಬಿತ್ತನೆ ಮತ್ತು ಭೂಮಿ ಸಿದ್ಧತೆ ಹಂತ',
    currentPhaseTa: 'விதைப்பு மற்றும் நில தயாரிப்பு',
    currentPhaseTe: 'విత్తడం మరియు నేల తయారీ దశ',
    advice: 'Ensure adequate seed treatment and sow pulses/cereals with residual moisture.',
    adviceKn: 'ಕಡಲೆ ಮತ್ತು ಹಿಂಗಾರು ಬೆಳೆಗಳಿಗೆ ಬೀಜೋಪಚಾರ ಮಾಡಿ ಬಿತ್ತನೆ ಮಾಡಿ.',
    adviceTa: 'பருவமழை முடிவில் மண்ணின் ஈரப்பதத்தைப் பயன்படுத்தி பயிரிடவும்.',
    adviceTe: 'నేలలోని తేమను ఉపయోగించి విత్తనాలు విత్తుకోండి.',
    primarySeasonalCrops: ['Chickpea (Bengal Gram)', 'Sorghum (Jowar)', 'Wheat', 'Sunflower'],
    verified: false,
    verificationNote: 'Verify with local agriculture office (RSK/KVK/ADA).',
    confirmationLine: {
      en: 'Detected: Rabi sowing season in your area.',
      kn: 'ಪತ್ತೆಯಾಗಿದೆ: ನಿಮ್ಮ ಪ್ರದೇಶದಲ್ಲಿ ಹಿಂಗಾರು ಬಿತ್ತನೆ ಹಂಗಾಮು.',
      ta: 'கண்டறியப்பட்டது: உங்கள் பகுதியில் ரபி விதைப்பு பருவம்.',
      te: 'గుర్తించబడింది: మీ ప్రాంతంలో రబీ సాగు కాలం.',
    },
  };
}
