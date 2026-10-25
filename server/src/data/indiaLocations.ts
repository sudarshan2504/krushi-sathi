export interface TalukLocation {
  name: string;
  nameKannada?: string;
  nameTamil?: string;
  nameTelugu?: string;
  latitude: number;
  longitude: number;
  typicalSoils: string[];
  primaryCrops: string[];
}

export interface DistrictLocation {
  name: string;
  nameKannada?: string;
  nameTamil?: string;
  nameTelugu?: string;
  latitude: number;
  longitude: number;
  agroZone: string;
  agroZoneCode: string;
  agroZoneDescription: string;
  typicalSoils: string[];
  rainfallMm: string;
  taluks: TalukLocation[];
}

export interface StateLocation {
  state: string;
  districts: DistrictLocation[];
}

export const INDIA_LOCATIONS: StateLocation[] = [
  {
    state: 'Karnataka',
    districts: [
      {
        name: 'Mandya',
        nameKannada: 'ಮಂಡ್ಯ',
        latitude: 12.5244,
        longitude: 76.8969,
        agroZone: 'Southern Dry Zone',
        agroZoneCode: 'ACZ-6',
        agroZoneDescription: 'Canal-irrigated Cauvery basin with high paddy and sugarcane productivity, alongside red gravelly rainfed uplands.',
        typicalSoils: ['red', 'loamy', 'alluvial', 'clay'],
        rainfallMm: '670 - 750 mm',
        taluks: [
          { name: 'Mandya', nameKannada: 'ಮಂಡ್ಯ', latitude: 12.5244, longitude: 76.8969, typicalSoils: ['alluvial', 'red'], primaryCrops: ['Paddy', 'Sugarcane', 'Ragi'] },
          { name: 'Maddur', nameKannada: 'ಮದ್ದೂರು', latitude: 12.5843, longitude: 77.0452, typicalSoils: ['red', 'loamy'], primaryCrops: ['Paddy', 'Tender Coconut', 'Ragi'] },
          { name: 'Malavalli', nameKannada: 'ಮಳವಳ್ಳಿ', latitude: 12.3855, longitude: 77.0583, typicalSoils: ['red', 'loamy'], primaryCrops: ['Ragi', 'Paddy', 'Mulberry'] },
          { name: 'Srirangapatna', nameKannada: 'ಶ್ರೀರಂಗಪಟ್ಟಣ', latitude: 12.4238, longitude: 76.6834, typicalSoils: ['alluvial', 'clay'], primaryCrops: ['Paddy', 'Sugarcane', 'Banana'] },
          { name: 'Pandavapura', nameKannada: 'ಪಾಂಡವಪುರ', latitude: 12.4965, longitude: 76.6698, typicalSoils: ['red', 'loamy'], primaryCrops: ['Sugarcane', 'Paddy', 'Vegetables'] },
          { name: 'Nagamangala', nameKannada: 'ನಾಗಮಂಗಲ', latitude: 12.8214, longitude: 76.7571, typicalSoils: ['red', 'sandy'], primaryCrops: ['Ragi', 'Horsegram', 'Coconut'] },
          { name: 'KR Pet', nameKannada: 'ಕೆ.ಆರ್. ಪೇಟೆ', latitude: 12.6644, longitude: 76.4912, typicalSoils: ['red', 'alluvial'], primaryCrops: ['Paddy', 'Sugarcane', 'Coconut'] }
        ]
      },
      {
        name: 'Mysuru',
        nameKannada: 'ಮೈಸೂರು',
        latitude: 12.2958,
        longitude: 76.6394,
        agroZone: 'Southern Dry Zone',
        agroZoneCode: 'ACZ-6',
        agroZoneDescription: 'Rolling plateau with fertile red sandy loam, supporting cotton, tobacco, ragi and canal paddy.',
        typicalSoils: ['red', 'loamy', 'black'],
        rainfallMm: '750 - 850 mm',
        taluks: [
          { name: 'Mysuru', nameKannada: 'ಮೈಸೂರು', latitude: 12.2958, longitude: 76.6394, typicalSoils: ['red', 'loamy'], primaryCrops: ['Ragi', 'Vegetables', 'Flowers'] },
          { name: 'Nanjangud', nameKannada: 'ನಂಜನಗೂಡು', latitude: 12.1198, longitude: 76.6806, typicalSoils: ['black', 'alluvial'], primaryCrops: ['Nanjangud Rasabale Banana', 'Paddy', 'Cotton'] },
          { name: 'Hunsur', nameKannada: 'ಹುಣಸೂರು', latitude: 12.3082, longitude: 76.2917, typicalSoils: ['red', 'loamy'], primaryCrops: ['Tobacco', 'Maize', 'Ginger'] },
          { name: 'Periyapatna', nameKannada: 'ಪಿರಿಯಾಪಟ್ಟಣ', latitude: 12.3411, longitude: 75.9961, typicalSoils: ['red', 'laterite'], primaryCrops: ['Tobacco', 'Ginger', 'Turmeric'] },
          { name: 'T Narasipura', nameKannada: 'ಟಿ. ನರಸೀಪುರ', latitude: 12.2127, longitude: 76.9038, typicalSoils: ['alluvial', 'red'], primaryCrops: ['Paddy', 'Sugarcane', 'Banana'] },
          { name: 'HD Kote', nameKannada: 'ಹೆಚ್.ಡಿ. ಕೋಟೆ', latitude: 11.9841, longitude: 76.3314, typicalSoils: ['red', 'black'], primaryCrops: ['Cotton', 'Ragi', 'Pulses'] }
        ]
      },
      {
        name: 'Shivamogga',
        nameKannada: 'ಶಿವಮೊಗ್ಗ',
        latitude: 13.9299,
        longitude: 75.5681,
        agroZone: 'Southern Transition Zone',
        agroZoneCode: 'ACZ-7',
        agroZoneDescription: 'Gateway to Western Ghats with high rainfall, laterite valleys and premier arecanut-pepper plantations.',
        typicalSoils: ['laterite', 'red', 'clay', 'alluvial'],
        rainfallMm: '1500 - 3000 mm',
        taluks: [
          { name: 'Shivamogga', nameKannada: 'ಶಿವಮೊಗ್ಗ', latitude: 13.9299, longitude: 75.5681, typicalSoils: ['alluvial', 'red'], primaryCrops: ['Paddy', 'Arecanut', 'Maize'] },
          { name: 'Thirthahalli', nameKannada: 'ತೀರ್ಥಹಳ್ಳಿ', latitude: 13.6934, longitude: 75.2449, typicalSoils: ['laterite', 'red'], primaryCrops: ['Arecanut', 'Black Pepper', 'Banana'] },
          { name: 'Sagar', nameKannada: 'ಸಾಗರ', latitude: 14.1670, longitude: 75.0298, typicalSoils: ['laterite', 'clay'], primaryCrops: ['Arecanut', 'Paddy', 'Ginger'] },
          { name: 'Bhadravathi', nameKannada: 'ಭದ್ರಾವತಿ', latitude: 13.8400, longitude: 75.7027, typicalSoils: ['alluvial', 'red'], primaryCrops: ['Paddy', 'Sugarcane', 'Arecanut'] },
          { name: 'Shikaripura', nameKannada: 'ಶಿಕಾರಿಪುರ', latitude: 14.2694, longitude: 75.3524, typicalSoils: ['red', 'black'], primaryCrops: ['Maize', 'Paddy', 'Cotton'] },
          { name: 'Soraba', nameKannada: 'ಸೊರಬ', latitude: 14.3855, longitude: 75.0934, typicalSoils: ['laterite', 'clay'], primaryCrops: ['Paddy', 'Arecanut', 'Ginger'] }
        ]
      },
      {
        name: 'Kalaburagi',
        nameKannada: 'ಕಲಬುರಗಿ',
        latitude: 17.3297,
        longitude: 76.8343,
        agroZone: 'North Eastern Dry Zone',
        agroZoneCode: 'ACZ-2',
        agroZoneDescription: 'Deep black cotton soils of the Deccan trap, the pulse bowl of Karnataka with GI-tagged Gulbarga Tur.',
        typicalSoils: ['black', 'clay'],
        rainfallMm: '700 - 820 mm',
        taluks: [
          { name: 'Kalaburagi', nameKannada: 'ಕಲಬುರಗಿ', latitude: 17.3297, longitude: 76.8343, typicalSoils: ['black'], primaryCrops: ['Red Gram (Tur)', 'Jowar', 'Soybean'] },
          { name: 'Aland', nameKannada: 'ಆಳಂದ', latitude: 17.5647, longitude: 76.5683, typicalSoils: ['black'], primaryCrops: ['Red Gram', 'Jowar', 'Chickpea'] },
          { name: 'Sedam', nameKannada: 'ಸೇಡಂ', latitude: 17.1818, longitude: 77.2882, typicalSoils: ['black', 'clay'], primaryCrops: ['Red Gram', 'Cotton', 'Sunflower'] },
          { name: 'Chincholi', nameKannada: 'ಚಿಂಚೋಳಿ', latitude: 17.4665, longitude: 77.4241, typicalSoils: ['black', 'red'], primaryCrops: ['Red Gram', 'Jowar', 'Sesamum'] },
          { name: 'Jewargi', nameKannada: 'ಜೇವರ್ಗಿ', latitude: 17.0142, longitude: 76.7725, typicalSoils: ['black'], primaryCrops: ['Red Gram', 'Chickpea', 'Sunflower'] }
        ]
      },
      {
        name: 'Dharwad',
        nameKannada: 'ಧಾರವಾಡ',
        latitude: 15.4589,
        longitude: 75.0078,
        agroZone: 'Northern Transition Zone',
        agroZoneCode: 'ACZ-8',
        agroZoneDescription: 'Highly productive transition belt with medium to deep black soils, renowned for hybrid cotton, soybean and chilli.',
        typicalSoils: ['black', 'loamy', 'red'],
        rainfallMm: '750 - 900 mm',
        taluks: [
          { name: 'Dharwad', nameKannada: 'ಧಾರವಾಡ', latitude: 15.4589, longitude: 75.0078, typicalSoils: ['black', 'red'], primaryCrops: ['Soybean', 'Cotton', 'Groundnut'] },
          { name: 'Hubballi', nameKannada: 'ಹುಬ್ಬಳ್ಳಿ', latitude: 15.3647, longitude: 75.1240, typicalSoils: ['black'], primaryCrops: ['Cotton', 'Chilli', 'Soybean'] },
          { name: 'Kalghatgi', nameKannada: 'ಕಲಘಟಗಿ', latitude: 15.1804, longitude: 74.9749, typicalSoils: ['red', 'laterite'], primaryCrops: ['Paddy', 'Sugarcane', 'Ginger'] },
          { name: 'Kundgol', nameKannada: 'ಕುಂದಗೋಳ', latitude: 15.2575, longitude: 75.2536, typicalSoils: ['black'], primaryCrops: ['Chilli', 'Cotton', 'Groundnut'] },
          { name: 'Navalgund', nameKannada: 'ನವಲಗುಂದ', latitude: 15.5658, longitude: 75.3619, typicalSoils: ['black', 'clay'], primaryCrops: ['Byadgi Chilli', 'Chickpea', 'Wheat'] }
        ]
      },
      {
        name: 'Haveri',
        nameKannada: 'ಹಾವೇರಿ',
        latitude: 14.7954,
        longitude: 75.3991,
        agroZone: 'Northern Transition Zone',
        agroZoneCode: 'ACZ-8',
        agroZoneDescription: 'Heart of Byadagi Chilli and red seed cotton, with diversified black and red loam soils.',
        typicalSoils: ['black', 'red', 'loamy'],
        rainfallMm: '750 - 850 mm',
        taluks: [
          { name: 'Byadgi', nameKannada: 'ಬ್ಯಾಡಗಿ', latitude: 14.6787, longitude: 75.4854, typicalSoils: ['black', 'red'], primaryCrops: ['Byadgi Chilli', 'Cotton', 'Groundnut'] },
          { name: 'Haveri', nameKannada: 'ಹಾವೇರಿ', latitude: 14.7954, longitude: 75.3991, typicalSoils: ['black', 'loamy'], primaryCrops: ['Maize', 'Cotton', 'Soybean'] },
          { name: 'Ranebennur', nameKannada: 'ರಾಣೆಬೆನ್ನೂರು', latitude: 14.6214, longitude: 75.6262, typicalSoils: ['red', 'black'], primaryCrops: ['Vegetable Seeds', 'Cotton', 'Maize'] }
        ]
      },
      {
        name: 'Chikkamagaluru',
        nameKannada: 'ಚಿಕ್ಕಮಗಳೂರು',
        latitude: 13.3161,
        longitude: 75.7720,
        agroZone: 'Hilly Zone',
        agroZoneCode: 'ACZ-9',
        agroZoneDescription: 'High-altitude Western Ghats rainforest and slopes, the coffee capital of India with rich humus laterite soil.',
        typicalSoils: ['laterite', 'red', 'loamy'],
        rainfallMm: '1800 - 3500 mm',
        taluks: [
          { name: 'Chikkamagaluru', nameKannada: 'ಚಿಕ್ಕಮಗಳೂರು', latitude: 13.3161, longitude: 75.7720, typicalSoils: ['laterite', 'red'], primaryCrops: ['Coffee (Arabica)', 'Black Pepper', 'Cardamom'] },
          { name: 'Mudigere', nameKannada: 'ಮೂಡಿಗೆರೆ', latitude: 13.1364, longitude: 75.6375, typicalSoils: ['laterite'], primaryCrops: ['Coffee', 'Cardamom', 'Black Pepper'] },
          { name: 'Koppa', nameKannada: 'ಕೊಪ್ಪ', latitude: 13.5298, longitude: 75.3582, typicalSoils: ['laterite', 'clay'], primaryCrops: ['Arecanut', 'Coffee', 'Paddy'] },
          { name: 'Tarikere', nameKannada: 'ತರೀಕೆರೆ', latitude: 13.7126, longitude: 75.8142, typicalSoils: ['red', 'black'], primaryCrops: ['Arecanut', 'Paddy', 'Banana'] }
        ]
      },
      {
        name: 'Dakshina Kannada',
        nameKannada: 'ದಕ್ಷಿಣ ಕನ್ನಡ',
        latitude: 12.8703,
        longitude: 74.8806,
        agroZone: 'Coastal Zone',
        agroZoneCode: 'ACZ-10',
        agroZoneDescription: 'Coastal plains and foothills with heavy southwest monsoon rainfall, laterite soils, and arecanut-coconut-rubber-paddy cropping.',
        typicalSoils: ['laterite', 'alluvial', 'sandy'],
        rainfallMm: '3500 - 4500 mm',
        taluks: [
          { name: 'Mangaluru', nameKannada: 'ಮಂಗಳೂರು', latitude: 12.8703, longitude: 74.8806, typicalSoils: ['alluvial', 'sandy'], primaryCrops: ['Paddy', 'Coconut', 'Vegetables'] },
          { name: 'Bantwal', nameKannada: 'ಬಂಟ್ವಾಳ', latitude: 12.8942, longitude: 75.0354, typicalSoils: ['laterite', 'alluvial'], primaryCrops: ['Arecanut', 'Black Pepper', 'Rubber'] },
          { name: 'Puttur', nameKannada: 'ಪುತ್ತೂರು', latitude: 12.7661, longitude: 75.2018, typicalSoils: ['laterite'], primaryCrops: ['Arecanut', 'Cashew', 'Rubber'] },
          { name: 'Belthangady', nameKannada: 'ಬೆಳ್ತಂಗಡಿ', latitude: 13.0003, longitude: 75.2952, typicalSoils: ['laterite', 'red'], primaryCrops: ['Arecanut', 'Rubber', 'Paddy'] },
          { name: 'Sullia', nameKannada: 'ಸುಳ್ಯ', latitude: 12.5615, longitude: 75.3907, typicalSoils: ['laterite'], primaryCrops: ['Rubber', 'Arecanut', 'Black Pepper'] }
        ]
      }
    ]
  },
  {
    state: 'Tamil Nadu',
    districts: [
      {
        name: 'Coimbatore',
        nameTamil: 'கோயம்புத்தூர்',
        latitude: 11.0168,
        longitude: 76.9558,
        agroZone: 'Western Zone',
        agroZoneCode: 'TN-WZ',
        agroZoneDescription: 'Semi-arid plateau protected by Nilgiri shadow, ideal for cotton, maize, vegetables and poultry integration.',
        typicalSoils: ['red', 'black', 'loamy'],
        rainfallMm: '650 - 720 mm',
        taluks: [
          { name: 'Pollachi', nameTamil: 'பொள்ளாச்சி', latitude: 10.6609, longitude: 77.0048, typicalSoils: ['red', 'alluvial'], primaryCrops: ['Coconut', 'Cocoa', 'Vegetables'] },
          { name: 'Mettupalayam', nameTamil: 'மேட்டுப்பாளையம்', latitude: 11.3000, longitude: 76.9400, typicalSoils: ['red', 'loamy'], primaryCrops: ['Banana', 'Arecanut', 'Vegetables'] },
          { name: 'Sulur', nameTamil: 'சூலூர்', latitude: 11.0247, longitude: 77.1264, typicalSoils: ['black', 'red'], primaryCrops: ['Cotton', 'Maize', 'Sorghum'] }
        ]
      },
      {
        name: 'Thanjavur',
        nameTamil: 'தஞ்சாவூர்',
        latitude: 10.7870,
        longitude: 79.1378,
        agroZone: 'Cauvery Delta Zone',
        agroZoneCode: 'TN-CDZ',
        agroZoneDescription: 'The rice bowl of Tamil Nadu with deep alluvial delta soils and canal irrigation from Grand Anicut.',
        typicalSoils: ['alluvial', 'clay'],
        rainfallMm: '950 - 1100 mm',
        taluks: [
          { name: 'Thanjavur', nameTamil: 'தஞ்சாவூர்', latitude: 10.7870, longitude: 79.1378, typicalSoils: ['alluvial'], primaryCrops: ['Paddy (Kuruvai/Samba)', 'Black Gram', 'Banana'] },
          { name: 'Kumbakonam', nameTamil: 'கும்பகோணம்', latitude: 10.9602, longitude: 79.3845, typicalSoils: ['alluvial', 'clay'], primaryCrops: ['Paddy', 'Sugarcane', 'Betel Vine'] }
        ]
      }
    ]
  },
  {
    state: 'Andhra Pradesh',
    districts: [
      {
        name: 'Guntur',
        nameTelugu: 'గుంటూరు',
        latitude: 16.3067,
        longitude: 80.4365,
        agroZone: 'Krishna Agro-Climatic Zone',
        agroZoneCode: 'AP-KZ',
        agroZoneDescription: 'World-famous chilli and tobacco capital with deep black cotton soils and Krishna canal irrigation.',
        typicalSoils: ['black', 'alluvial', 'clay'],
        rainfallMm: '850 - 950 mm',
        taluks: [
          { name: 'Guntur', nameTelugu: 'గుంటూరు', latitude: 16.3067, longitude: 80.4365, typicalSoils: ['black'], primaryCrops: ['Guntur Chilli', 'Cotton', 'Tobacco'] },
          { name: 'Tenali', nameTelugu: 'తెనాలి', latitude: 16.2437, longitude: 80.6400, typicalSoils: ['alluvial', 'clay'], primaryCrops: ['Paddy', 'Black Gram', 'Banana'] }
        ]
      }
    ]
  },
  {
    state: 'Telangana',
    districts: [
      {
        name: 'Warangal',
        nameTelugu: 'వరంగల్',
        latitude: 17.9689,
        longitude: 79.5941,
        agroZone: 'Central Telangana Zone',
        agroZoneCode: 'TG-CZ',
        agroZoneDescription: 'Red sandy loam and black cotton soils with prominent cotton, chilli, paddy and maize cultivation.',
        typicalSoils: ['red', 'black', 'loamy'],
        rainfallMm: '900 - 1050 mm',
        taluks: [
          { name: 'Warangal', nameTelugu: 'వరంగల్', latitude: 17.9689, longitude: 79.5941, typicalSoils: ['red', 'black'], primaryCrops: ['Cotton', 'Red Chilli', 'Paddy'] },
          { name: 'Jangaon', nameTelugu: 'జనగామ', latitude: 17.7247, longitude: 79.1554, typicalSoils: ['red', 'loamy'], primaryCrops: ['Cotton', 'Maize', 'Paddy'] }
        ]
      }
    ]
  }
];

export interface MatchedLocationInfo {
  state: string;
  district: string;
  taluk?: string;
  latitude: number;
  longitude: number;
  agroZone: string;
  agroZoneCode: string;
  agroZoneDescription: string;
  typicalSoils: string[];
  rainfallMm?: string;
  primaryCrops?: string[];
}

// Helper to look up nearest location by lat/long coordinates
export function findLocationByCoords(lat: number, lon: number): MatchedLocationInfo {
  let closestDist = Infinity;
  let match: MatchedLocationInfo = {
    state: 'Karnataka',
    district: 'Mandya',
    taluk: 'Mandya',
    latitude: 12.5244,
    longitude: 76.8969,
    agroZone: 'Southern Dry Zone',
    agroZoneCode: 'ACZ-6',
    agroZoneDescription: 'Canal-irrigated Cauvery basin with high paddy, sugarcane and ragi productivity.',
    typicalSoils: ['red', 'loamy', 'alluvial'],
    rainfallMm: '650 - 850 mm',
    primaryCrops: ['Paddy', 'Sugarcane', 'Ragi'],
  };

  for (const s of INDIA_LOCATIONS) {
    for (const d of s.districts) {
      for (const t of d.taluks) {
        const dist = Math.hypot(t.latitude - lat, t.longitude - lon);
        if (dist < closestDist) {
          closestDist = dist;
          match = {
            state: s.state,
            district: d.name,
            taluk: t.name,
            latitude: t.latitude || d.latitude,
            longitude: t.longitude || d.longitude,
            agroZone: d.agroZone,
            agroZoneCode: d.agroZoneCode,
            agroZoneDescription: d.agroZoneDescription,
            typicalSoils: t.typicalSoils || d.typicalSoils,
            rainfallMm: d.rainfallMm,
            primaryCrops: t.primaryCrops || [],
          };
        }
      }
    }
  }

  return match;
}

// Helper to look up location by state, district, and optional taluk
export function findLocationByName(stateName?: string, districtName?: string, talukName?: string): MatchedLocationInfo | null {
  const normState = (stateName || '').toLowerCase().trim();
  const normDistrict = (districtName || '').toLowerCase().trim();
  const normTaluk = (talukName || '').toLowerCase().trim();

  let stateObj = normState
    ? INDIA_LOCATIONS.find(s => s.state.toLowerCase().includes(normState) || normState.includes(s.state.toLowerCase()))
    : undefined;

  let distObj;
  if (stateObj && normDistrict) {
    distObj = stateObj.districts.find(d => d.name.toLowerCase().includes(normDistrict) || normDistrict.includes(d.name.toLowerCase()));
  } else if (normDistrict) {
    for (const s of INDIA_LOCATIONS) {
      const foundDist = s.districts.find(d => d.name.toLowerCase().includes(normDistrict) || normDistrict.includes(d.name.toLowerCase()));
      if (foundDist) {
        stateObj = s;
        distObj = foundDist;
        break;
      }
    }
  } else if (stateObj) {
    distObj = stateObj.districts[0];
  }

  if (!distObj || !stateObj) {
    return null;
  }

  const talukObj = normTaluk ? distObj.taluks.find(t => t.name.toLowerCase().includes(normTaluk) || normTaluk.includes(t.name.toLowerCase())) : distObj.taluks[0];

  return {
    state: stateObj.state,
    district: distObj.name,
    taluk: talukObj?.name || distObj.taluks[0]?.name,
    latitude: talukObj?.latitude || distObj.latitude,
    longitude: talukObj?.longitude || distObj.longitude,
    agroZone: distObj.agroZone,
    agroZoneCode: distObj.agroZoneCode,
    agroZoneDescription: distObj.agroZoneDescription,
    typicalSoils: talukObj?.typicalSoils || distObj.typicalSoils,
    rainfallMm: distObj.rainfallMm,
    primaryCrops: talukObj?.primaryCrops || [],
  };
}

