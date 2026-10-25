import { findLocationByCoords, findLocationByName } from '../data/indiaLocations';

export interface SeasonInfo {
  season: 'Kharif' | 'Rabi' | 'Zaid';
  name: string;
  nameKannada: string;
  nameTamil: string;
  nameTelugu: string;
  monthsRange: string;
  sowingWindow: string;
  harvestWindow: string;
  currentPhase: 'Sowing & Land Prep' | 'Vegetative Growth' | 'Flowering & Grain Filling' | 'Harvesting & Threshing';
  currentPhaseKn: string;
  currentPhaseTa: string;
  currentPhaseTe: string;
  advice: string;
  adviceKn: string;
  adviceTa: string;
  adviceTe: string;
  primarySeasonalCrops: string[];
}

export function getCurrentAgriculturalSeason(date = new Date()): SeasonInfo {
  const month = date.getMonth(); // 0 = Jan, 5 = June, 9 = Oct

  // Kharif: June (5) to October (9)
  if (month >= 5 && month <= 9) {
    let phase: SeasonInfo['currentPhase'] = 'Vegetative Growth';
    let phaseKn = 'ಸಸ್ಯ ಬೆಳವಣಿಗೆ ಹಂತ';
    let phaseTa = 'தாவர வளர்ச்சி பருவம்';
    let phaseTe = 'మొక్కల ఏపుగా పెరిగే దశ';

    if (month === 5 || month === 6) {
      phase = 'Sowing & Land Prep';
      phaseKn = 'ಬಿತ್ತನೆ ಮತ್ತು ಭೂಮಿ ಸಿದ್ಧತೆ';
      phaseTa = 'விதைப்பு மற்றும் நில தயாரிப்பு';
      phaseTe = 'విత్తడం మరియు భూమి తయారీ';
    } else if (month === 9) {
      phase = 'Harvesting & Threshing';
      phaseKn = 'ಕೊಯ್ಲು ಮತ್ತು ಒಕ್ಕಣೆ';
      phaseTa = 'அறுவடை மற்றும் கதிரடித்தல்';
      phaseTe = 'కోత మరియు నూర్పిడి';
    } else {
      phase = 'Flowering & Grain Filling';
      phaseKn = 'ಹೂಬಿಡುವ ಮತ್ತು ಕಾಳು ತುಂಬುವ ಹಂತ';
      phaseTa = 'பூக்கும் மற்றும் மணி பிடிக்கும் பருவம்';
      phaseTe = 'పూత మరియు గింజ పాలు పోసుకునే దశ';
    }

    return {
      season: 'Kharif',
      name: 'Kharif (Monsoon Season)',
      nameKannada: 'ಮುಂಗಾರು ಹಂಗಾಮು (ಖಾರೀಫ್)',
      nameTamil: 'காரிப் பருவம் (தென்மேற்கு பருவமழை)',
      nameTelugu: 'ఖరీఫ్ కాలం (వర్షాకాలం)',
      monthsRange: 'June - October',
      sowingWindow: 'June 1 - July 15',
      harvestWindow: 'October 15 - November 30',
      currentPhase: phase,
      currentPhaseKn: phaseKn,
      currentPhaseTa: phaseTa,
      currentPhaseTe: phaseTe,
      advice: 'Ensure adequate drainage in low-lying plots. Top dress with Nitrogen fertilizer during active tillering.',
      adviceKn: 'ಗದ್ದೆಯಲ್ಲಿ ಹೆಚ್ಚುವರಿ ನೀರು ಬಸಿದು ಹೋಗಲು ಒಳಚರಂಡಿ ಕಾಲುವೆ ನಿರ್ಮಿಸಿ. ಕವಲೊಡೆಯುವ ಹಂತದಲ್ಲಿ ಯೂರಿಯಾ ಗೊಬ್ಬರ ನೀಡಿ.',
      adviceTa: 'வயலில் தேங்கும் உபரி நீரை வடிக்கவும். தூர்கட்டும் பருவத்தில் தழைச்சத்து உரம் இடவும்.',
      adviceTe: 'మురుగునీరు నిలవకుండా కాలువలు తీయండి. పిలకలు తొడిగే దశలో నత్రజని ఎరువులు వేయండి.',
      primarySeasonalCrops: ['Paddy', 'Ragi', 'Maize', 'Cotton', 'Red Gram', 'Soybean', 'Groundnut', 'Chilli']
    };
  }

  // Rabi: October/November (10) to February (1)
  if (month === 10 || month === 11 || month === 0 || month === 1) {
    let phase: SeasonInfo['currentPhase'] = 'Vegetative Growth';
    let phaseKn = 'ಬೆಳವಣಿಗೆಯ ಹಂತ';
    let phaseTa = 'வளர்ச்சிப் பருவம்';
    let phaseTe = 'పెరుగుదల దశ';

    if (month === 10 || month === 11) {
      phase = 'Sowing & Land Prep';
      phaseKn = 'ಹಿಂಗಾರು ಬಿತ್ತನೆ ಹಂತ';
      phaseTa = 'குளிர்கால விதைப்பு பருவம்';
      phaseTe = 'రబీ విత్తే సమయం';
    } else if (month === 1) {
      phase = 'Harvesting & Threshing';
      phaseKn = 'ಕೊಯ್ಲು ಮತ್ತು ಒಕ್ಕಣೆ';
      phaseTa = 'அறுவடை பருவம்';
      phaseTe = 'కోత మరియు నూర్పిడి';
    } else {
      phase = 'Flowering & Grain Filling';
      phaseKn = 'ಕಾಳು ತುಂಬುವ ಹಂತ';
      phaseTa = 'தானிய திரட்சி பருவம்';
      phaseTe = 'గింజ ముదిరే దశ';
    }

    return {
      season: 'Rabi',
      name: 'Rabi (Winter Season)',
      nameKannada: 'ಹಿಂಗಾರು ಹಂಗಾಮು (ರಬಿ)',
      nameTamil: 'ரபி பருவம் (குளிர்காலம்)',
      nameTelugu: 'రబీ కాలం (శీతాకాలం)',
      monthsRange: 'October - March',
      sowingWindow: 'October 15 - November 20',
      harvestWindow: 'February 15 - March 30',
      currentPhase: phase,
      currentPhaseKn: phaseKn,
      currentPhaseTa: phaseTa,
      currentPhaseTe: phaseTe,
      advice: 'Take advantage of residual soil moisture after Kharif. Provide life-saving irrigation at pod development.',
      adviceKn: 'ಹಿಂಗಾರು ತೇವಾಂಶದಲ್ಲಿ ಕಡಲೆ, ಗೋಧಿ, ಜೋಳ ಬಿತ್ತನೆ ಮಾಡಿ. ಕಾಯಿ ಕಟ್ಟುವಾಗ ಒಮ್ಮೆ ನೀರು ಹಾಯಿಸಿ.',
      adviceTa: 'மண்ணில் உள்ள ஈரப்பதத்தைப் பயன்படுத்தி கடலை, கோதுமை பயிரிடவும். காய் பிடிக்கும் போது நீர் பாய்ச்சவும்.',
      adviceTe: 'నేలలోని తేమను ఉపయోగించి శనగ, గోధుమ, జొన్నలు విత్తండి. కాయ కట్టే దశలో ఒక తడి ఇవ్వండి.',
      primarySeasonalCrops: ['Chickpea (Bengal Gram)', 'Wheat', 'Jowar (Rabi)', 'Sunflower', 'Mustard', 'Onion']
    };
  }

  // Zaid / Summer: March (2) to May (4)
  let phase: SeasonInfo['currentPhase'] = 'Vegetative Growth';
  let phaseKn = 'ಬೆಳವಣಿಗೆ ಹಂತ';
  let phaseTa = 'வளர்ச்சிப் பருவம்';
  let phaseTe = 'పెరుగుదల దశ';

  if (month === 2) {
    phase = 'Sowing & Land Prep';
    phaseKn = 'ಬೇಸಿಗೆ ಬಿತ್ತನೆ ಹಂತ';
    phaseTa = 'கோடை விதைப்பு';
    phaseTe = 'వేసవి విత్తే సమయం';
  } else {
    phase = 'Harvesting & Threshing';
    phaseKn = 'ಬೇಸಿಗೆ ಹಣ್ಣುಗಳ ಕೊಯ್ಲು';
    phaseTa = 'கோடை பழ அறுவடை';
    phaseTe = 'వేసవి పండ్ల కోత';
  }

  return {
    season: 'Zaid',
    name: 'Zaid (Summer Season)',
    nameKannada: 'ಬೇಸಿಗೆ ಹಂಗಾಮು (ಜಾಯಿದ್)',
    nameTamil: 'ஜாயித் பருவம் (கோடைக்காலம்)',
    nameTelugu: 'జాయద్ కాలం (ఎండాకాలం)',
    monthsRange: 'March - May',
    sowingWindow: 'February 15 - March 15',
    harvestWindow: 'April 20 - May 30',
    currentPhase: phase,
    currentPhaseKn: phaseKn,
    currentPhaseTa: phaseTa,
    currentPhaseTe: phaseTe,
    advice: 'Use drip irrigation and mulch to save 40% water. Best time for Watermelon, Cucumber, Summer Moong and Muskmelon.',
    adviceKn: 'ಹನಿ ನೀರಾವರಿ ಮತ್ತು ಮಲ್ಚಿಂಗ್ ಬಳಸಿ ನೀರು ಉಳಿಸಿ. ಕಲ್ಲಂಗಡಿ, ಸೌತೆಕಾಯಿ, ಹೆಸರುಕಾಳುಗಳಿಗೆ ಅತ್ಯುತ್ತಮ ಸಮಯ.',
    adviceTa: 'சொட்டுநீர் மற்றும் மல்ச்சிங் பயன்படுத்தி நீரை சேமிக்கவும். தர்பூசணி மற்றும் கோடை பாசிப்பயறுக்கு ஏற்ற காலம்.',
    adviceTe: 'డ్రిప్ మరియు మల్చింగ్ ద్వారా నీటిని ఆదా చేయండి. పుచ్చకాయ, దోసకాయ, వేసవి పెసలు సాగుకు అత్యంత అనువైన సమయం.',
    primarySeasonalCrops: ['Watermelon', 'Muskmelon', 'Green Gram (Moong)', 'Bhendi (Okra)', 'Cucumber', 'Fodder Cowpea']
  };
}

export function getLocationConditions(lat: number, lon: number, state?: string, district?: string, taluk?: string) {
  let locationData;

  if (state && district) {
    locationData = findLocationByName(state, district, taluk);
  }

  if (!locationData && lat && lon) {
    locationData = findLocationByCoords(lat, lon);
  }

  const seasonInfo = getCurrentAgriculturalSeason();

  return {
    location: locationData || {
      state: 'Karnataka',
      district: 'Mandya',
      taluk: 'Mandya',
      latitude: 12.5244,
      longitude: 76.8969,
      agroZone: 'Southern Dry Zone',
      agroZoneCode: 'ACZ-6',
      agroZoneDescription: 'Canal-irrigated Cauvery basin with high paddy and sugarcane productivity.',
      typicalSoils: ['red', 'loamy', 'alluvial'],
      rainfallMm: '670 - 750 mm',
      primaryCrops: ['Paddy', 'Sugarcane', 'Ragi']
    },
    season: seasonInfo
  };
}
