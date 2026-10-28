import { PrismaClient } from '@prisma/client';
import { SYMPTOM_TAGS_DATA } from '../src/data/seedProblems';
import { PROBLEMS_DATA } from '../src/data/problemsData';
import { PROBLEMS_DATA_PART2 } from '../src/data/problemsDataPart2';
import { PROBLEMS_DATA_PART3 } from '../src/data/problemsDataPart3';
import { PROBLEMS_DATA_PART4 } from '../src/data/problemsDataPart4';
import { PROBLEMS_DATA_PART5 } from '../src/data/problemsDataPart5';

const prisma = new PrismaClient();

// Additional crops to ensure all categories (Cereals, Millets, Pulses, Oilseeds, Vegetables, Fruits, Flowers, Plantation, Spices, Medicinal) are represented in DB
const ADDITIONAL_CROPS = [
  {
    id: 'crop-sugarcane',
    name: 'Sugarcane',
    scientificName: 'Saccharum officinarum',
    nameKannada: 'ಕಬ್ಬು',
    nameTamil: 'கரும்பு',
    nameTelugu: 'చెరకు',
    category: 'commercial',
    idealSoilTypes: JSON.stringify(['loamy', 'clay', 'alluvial']),
    minPh: 6.0,
    maxPh: 8.0,
    waterRequirement: 'High',
    waterMm: '1500-2500',
    durationDays: '300-365 days',
    durationMin: 300,
    durationMax: 365,
    seasons: JSON.stringify(['Kharif', 'Rabi']),
    estimatedCostPerAcre: '₹45,000 - ₹60,000',
    potentialYieldPerAcre: '40 - 60 tonnes',
    marketDemand: 'Very High',
    description: 'High biomass commercial cash crop essential for sugar and jaggery production in southern states.',
    descriptionKn: 'ಸಕ್ಕರೆ ಮತ್ತು ಬೆಲ್ಲ ಉತ್ಪಾದನೆಗೆ ಅತ್ಯಗತ್ಯವಾದ ಪ್ರಮುಖ ವಾಣಿಜ್ಯ ಬೆಳೆ.',
    descriptionTa: 'சர்க்கரை மற்றும் வெல்லம் உற்பத்திக்கு ஏற்ற முக்கிய பணப்பயிர்.',
    descriptionTe: 'చక్కెర మరియు బెల్లం తయారీకి ముఖ్యమైన ప్రధాన వాణిజ్య పంట.',
    imageUrl: '/crops/crop-sugarcane.webp',
    risks: JSON.stringify(['Water shortage during elongation', 'Red rot disease', 'Early shoot borer']),
    benefits: JSON.stringify(['Assured mill procurement', 'High tonnage per acre', 'Good biomass for co-generation']),
  },
  {
    id: 'crop-chilli',
    name: 'Chilli (Green / Dry)',
    scientificName: 'Capsicum annuum',
    nameKannada: 'ಮೆಣಸಿನಕಾಯಿ',
    nameTamil: 'மிளகாய்',
    nameTelugu: 'మిరప',
    category: 'spices',
    idealSoilTypes: JSON.stringify(['loamy', 'black', 'red']),
    minPh: 6.0,
    maxPh: 7.5,
    waterRequirement: 'Moderate',
    waterMm: '600-800',
    durationDays: '150-180 days',
    durationMin: 150,
    durationMax: 180,
    seasons: JSON.stringify(['Kharif', 'Rabi']),
    estimatedCostPerAcre: '₹35,000 - ₹50,000',
    potentialYieldPerAcre: '8 - 12 quintals dry / 60 - 80 q green',
    marketDemand: 'Very High',
    description: 'Vital cash and spice crop widely grown in Byadagi, Guntur, and Tamil Nadu belts.',
    descriptionKn: 'ಬ್ಯಾಡಗಿ ಮತ್ತು ಗುಂಟೂರು ವಲಯಗಳಲ್ಲಿ ವ್ಯಾಪಕವಾಗಿ ಬೆಳೆಯುವ ಪ್ರಮುಖ ಸಾಂಬಾರ ಬೆಳೆ.',
    descriptionTa: 'தென்னிந்தியாவில் பரவலாக பயிரிடப்படும் முக்கிய கார நறுமண பயிர்.',
    descriptionTe: 'గుంటూరు మరియు రాయలసీమ ప్రాంతాల్లో విరివిగా సాగయ్యే ప్రధాన మసాలా పంట.',
    imageUrl: '/crops/crop-chilli.webp',
    risks: JSON.stringify(['Thrips and mites murda complex', 'Anthracnose fruit rot', 'Heavy rain flower drop']),
    benefits: JSON.stringify(['High market returns', 'Continuous pickings', 'Excellent dry storage life']),
  },
  {
    id: 'crop-onion',
    name: 'Onion',
    scientificName: 'Allium cepa',
    nameKannada: 'ಈರುಳ್ಳಿ',
    nameTamil: 'வெங்காயம்',
    nameTelugu: 'ఉల్లిపాయ',
    category: 'vegetable',
    idealSoilTypes: JSON.stringify(['loamy', 'sandy-loam', 'alluvial']),
    minPh: 6.0,
    maxPh: 7.5,
    waterRequirement: 'Moderate',
    waterMm: '400-600',
    durationDays: '100-130 days',
    durationMin: 100,
    durationMax: 130,
    seasons: JSON.stringify(['Kharif', 'Rabi', 'Late Kharif']),
    estimatedCostPerAcre: '₹30,000 - ₹45,000',
    potentialYieldPerAcre: '80 - 120 quintals',
    marketDemand: 'Very High',
    description: 'Major bulb vegetable cultivated across Chitradurga, Gadag, Nashik, and Perambalur belts.',
    descriptionKn: 'ಚಿತ್ರದುರ್ಗ ಮತ್ತು ಗದಗ ಭಾಗದಲ್ಲಿ ವ್ಯಾಪಕವಾಗಿ ಬೆಳೆಯುವ ಪ್ರಮುಖ ಗೆಡ್ಡೆ ತರಕಾರಿ.',
    descriptionTa: 'பெரம்பலூர் மற்றும் திண்டுக்கல் பகுதிகளில் அதிகமாக பயிரிடப்படும் பயிர்.',
    descriptionTe: 'రాయలసీమ మరియు కర్నూలు ప్రాంతాల్లో విస్తారంగా సాగయ్యే ప్రధాన కూరగాయ.',
    imageUrl: '/crops/crop-onion.webp',
    risks: JSON.stringify(['Purple blotch disease', 'Onion thrips', 'Price volatility']),
    benefits: JSON.stringify(['Short duration', 'Strong domestic consumption', 'Good intercropping option']),
  },
  {
    id: 'crop-okra',
    name: 'Okra (Bhendi)',
    scientificName: 'Abelmoschus esculentus',
    nameKannada: 'ಬೆಂಡೆಕಾಯಿ',
    nameTamil: 'வெண்டை',
    nameTelugu: 'బెండకాయ',
    category: 'vegetable',
    idealSoilTypes: JSON.stringify(['loamy', 'sandy-loam', 'clay-loam']),
    minPh: 6.0,
    maxPh: 7.5,
    waterRequirement: 'Moderate',
    waterMm: '400-500',
    durationDays: '90-110 days',
    durationMin: 90,
    durationMax: 110,
    seasons: JSON.stringify(['Kharif', 'Zaid', 'Rabi']),
    estimatedCostPerAcre: '₹20,000 - ₹30,000',
    potentialYieldPerAcre: '40 - 60 quintals',
    marketDemand: 'High',
    description: 'Quick-maturing warm season vegetable offering regular daily or alternate-day harvest income.',
    descriptionKn: 'ದಿನಬಿಟ್ಟು ದಿನ ಕೊಯ್ಲು ಮಾಡಿ ನಿರಂತರ ಆದಾಯ ನೀಡುವ ಜನಪ್ರಿಯ ತರಕಾರಿ ಬೆಳೆ.',
    descriptionTa: 'தொடர் வருமானம் தரக்கூடிய முக்கியமான தினசரி அறுவடை காய்கறி பயிர்.',
    descriptionTe: 'రోజు మార్చి రోజు కోతలతో స్థిరమైన ఆదాయాన్నిచ్చే ప్రముఖ కూరగాయ పంట.',
    imageUrl: '/crops/crop-okra.webp',
    risks: JSON.stringify(['Yellow vein mosaic virus', 'Shoot and fruit borer', 'Powdery mildew']),
    benefits: JSON.stringify(['Frequent cash flow', 'Short vegetative cycle', 'High culinary demand']),
  },
  {
    id: 'crop-banana',
    name: 'Banana',
    scientificName: 'Musa paradisiaca',
    nameKannada: 'ಬಾಳೆ',
    nameTamil: 'வாழை',
    nameTelugu: 'అరటి',
    category: 'fruit',
    idealSoilTypes: JSON.stringify(['loamy', 'clay-loam', 'alluvial']),
    minPh: 6.5,
    maxPh: 7.5,
    waterRequirement: 'High',
    waterMm: '1800-2200',
    durationDays: '300-365 days',
    durationMin: 300,
    durationMax: 365,
    seasons: JSON.stringify(['Perennial', 'Kharif', 'Rabi']),
    estimatedCostPerAcre: '₹60,000 - ₹90,000',
    potentialYieldPerAcre: '25 - 40 tonnes',
    marketDemand: 'Very High',
    description: 'Major perennial fruit crop yielding grand naine, robusta, and elakki bunches year-round.',
    descriptionKn: 'ವರ್ಷಪೂರ್ತಿ ಉತ್ತಮ ಇಳುವರಿ ಮತ್ತು ಆದಾಯ ನೀಡುವ ಪ್ರಮುಖ ಹಣ್ಣಿನ ಬೆಳೆ.',
    descriptionTa: 'ஆண்டு முழுவதும் அறுவடை செய்யக்கூடிய முக்கிய பழப்பயிர்.',
    descriptionTe: 'ఏడాది పొడవునా గెలలు కాసే ముఖ్యమైన వాణిజ్య పండ్ల తోట.',
    imageUrl: '/crops/crop-banana.webp',
    risks: JSON.stringify(['Panama wilt race 1 and TR4', 'Sigatoka leaf spot', 'High wind lodging']),
    benefits: JSON.stringify(['Heavy yield per acre', 'Continuous suckers / ratoon cycles', 'Leaves and flowers sellable']),
  },
  {
    id: 'crop-mango',
    name: 'Mango',
    scientificName: 'Mangifera indica',
    nameKannada: 'ಮಾವು',
    nameTamil: 'மாம்பழம்',
    nameTelugu: 'మామిడి',
    category: 'fruit',
    idealSoilTypes: JSON.stringify(['alluvial', 'red-loam', 'laterite']),
    minPh: 5.5,
    maxPh: 7.5,
    waterRequirement: 'Moderate',
    waterMm: '750-1200',
    durationDays: 'Perennial',
    durationMin: 365,
    durationMax: 1000,
    seasons: JSON.stringify(['Summer', 'Rabi']),
    estimatedCostPerAcre: '₹25,000 - ₹40,000 (bearing)',
    potentialYieldPerAcre: '4 - 8 tonnes',
    marketDemand: 'Very High',
    description: 'The king of fruits, dominating southern orchards with Alphonso, Banganapalli, Kesar, and Mallika.',
    descriptionKn: 'ಹಣ್ಣುಗಳ ರಾಜ ಎಂದೇ ಖ್ಯಾತವಾದ ಬಾದಾಮಿ, ಮಲ್ಲಿಕಾ, ರಸಪೂರಿ ತಳಿಗಳ ಪ್ರಸಿದ್ಧ ಹಣ್ಣಿನ ಬೆಳೆ.',
    descriptionTa: 'பழங்களின் அரசன்; அல்போன்சா, பங்கனப்பள்ளி போன்ற ரகங்கள் கொண்ட முக்கிய பழத்தோட்டம்.',
    descriptionTe: 'బంగినపల్లి, తోతాపురి వంటి ప్రసిద్ధ రకాలతో పండ్ల రారాజుగా వెలుగొందే తోట పంట.',
    imageUrl: '/crops/crop-mango.webp',
    risks: JSON.stringify(['Anthracnose blossom blight', 'Powdery mildew on panicles', 'Fruit fly and stone weevil']),
    benefits: JSON.stringify(['Long productive life (30+ years)', 'Export market potential', 'Intercropping in early years']),
  },
  {
    id: 'crop-coconut',
    name: 'Coconut',
    scientificName: 'Cocos nucifera',
    nameKannada: 'ತೆಂಗು',
    nameTamil: 'தென்னை',
    nameTelugu: 'కొబ్బరి',
    category: 'plantation',
    idealSoilTypes: JSON.stringify(['sandy-loam', 'coastal', 'alluvial', 'red-loam']),
    minPh: 5.2,
    maxPh: 8.0,
    waterRequirement: 'High',
    waterMm: '1200-2000',
    durationDays: 'Perennial',
    durationMin: 365,
    durationMax: 2000,
    seasons: JSON.stringify(['Perennial']),
    estimatedCostPerAcre: '₹35,000 - ₹50,000 (bearing)',
    potentialYieldPerAcre: '8,000 - 12,000 nuts',
    marketDemand: 'Very High',
    description: 'Kalpavriksha plantation palm providing tender nuts, copra, coir, and shells for 60+ years.',
    descriptionKn: 'ಕಲ್ಪವೃಕ್ಷ ಎಂದು ಕರೆಯಲ್ಪಡುವ, ಎಳನೀರು ಮತ್ತು ಕೊಬ್ಬರಿಗೆ ಹೆಸರುವಾಸಿಯಾದ ಶಾಶ್ವತ ತೋಟದ ಬೆಳೆ.',
    descriptionTa: 'கற்பகத்தரு; இளநீர், கொப்பரை மற்றும் நார் தரும் வாழ்நாள் தோட்டப்பயிர்.',
    descriptionTe: 'కల్పవృక్షం; కొబ్బరి బొండాలు, కొబ్బరి మరియు పీచు ఇచ్చే దీర్ఘకాలిక తోట పంట.',
    imageUrl: '/crops/crop-coconut.webp',
    risks: JSON.stringify(['Rhinoceros beetle & red palm weevil', 'Bud rot in heavy monsoon', 'Root wilt and Eriophyid mite']),
    benefits: JSON.stringify(['Monthly harvest income', 'Multitier cropping with cocoa/banana/spices', 'Drought resilient when mature']),
  },
  {
    id: 'crop-arecanut',
    name: 'Arecanut (Betelnut)',
    scientificName: 'Areca catechu',
    nameKannada: 'ಅಡಿಕೆ',
    nameTamil: 'பாக்கு',
    nameTelugu: 'పోక చెట్టు',
    category: 'plantation',
    idealSoilTypes: JSON.stringify(['laterite', 'red-loam', 'clay-loam']),
    minPh: 5.5,
    maxPh: 7.0,
    waterRequirement: 'High',
    waterMm: '1500-2500',
    durationDays: 'Perennial',
    durationMin: 365,
    durationMax: 1500,
    seasons: JSON.stringify(['Perennial']),
    estimatedCostPerAcre: '₹40,000 - ₹65,000 (bearing)',
    potentialYieldPerAcre: '10 - 15 quintals chali',
    marketDemand: 'Very High',
    description: 'High-value commercial plantation palm in Malnad and coastal Karnataka (Shivamogga, Chikkamagaluru, Dakshina Kannada).',
    descriptionKn: 'ಮಲೆನಾಡು ಮತ್ತು ಕರಾವಳಿ ಭಾಗದ ಪ್ರಮುಖ ವಾಣಿಜ್ಯ ತೋಟದ ಬೆಳೆ.',
    descriptionTa: 'மேற்கு தொடர்ச்சி மலை மற்றும் காவிரி படுகையில் பயிரிடப்படும் முக்கிய பணப்பயிர்.',
    descriptionTe: 'అధిక విలువ కలిగిన ముఖ్యమైన వాణిజ్య తోట పంట.',
    imageUrl: '/crops/crop-arecanut.webp',
    risks: JSON.stringify(['Koleroga fruit rot during heavy monsoon', 'Yellow leaf disease', 'Root grub']),
    benefits: JSON.stringify(['Exceptionally high economic returns', 'Excellent intercropping with pepper and banana', 'Stable cooperative marketing (CAMPCO)']),
  },
  {
    id: 'crop-pomegranate',
    name: 'Pomegranate',
    scientificName: 'Punica granatum',
    nameKannada: 'ದಾಳಿಂಬೆ',
    nameTamil: 'மாதுளை',
    nameTelugu: 'దానిమ్మ',
    category: 'fruit',
    idealSoilTypes: JSON.stringify(['loamy', 'black', 'alluvial']),
    minPh: 6.5,
    maxPh: 8.5,
    waterRequirement: 'Moderate',
    waterMm: '600-900',
    durationDays: 'Perennial',
    durationMin: 365,
    durationMax: 1000,
    seasons: JSON.stringify(['Ambe Bahar', 'Mrig Bahar', 'Hasta Bahar']),
    estimatedCostPerAcre: '₹70,000 - ₹1,00,000',
    potentialYieldPerAcre: '6 - 10 tonnes',
    marketDemand: 'Very High',
    description: 'High-value arid horticulture crop celebrated for ruby-red arils of the Bhagwa variety.',
    descriptionKn: 'ಭಗವಾ ತಳಿಯ ಕೆಂಪು ಮುತ್ತಿನಂತಹ ಕಾಳುಗಳಿಗೆ ಹೆಸರುವಾಸಿಯಾದ ಅಧಿಕ ಮೌಲ್ಯದ ಹಣ್ಣಿನ ಬೆಳೆ.',
    descriptionTa: 'பகவா ரகம் கொண்ட அதிக வருமானம் தரும் முக்கிய பழப்பயிர்.',
    descriptionTe: 'భగ్వా రకంతో అత్యధిక లాభాలనిచ్చే ప్రసిద్ధ వాణిజ్య పండ్ల తోట.',
    imageUrl: '/crops/crop-pomegranate.webp',
    risks: JSON.stringify(['Bacterial blight (Telya)', 'Anar butterfly fruit borer', 'Wilt complex']),
    benefits: JSON.stringify(['Very high market price', 'Drought tolerant once established', 'High export demand']),
  },
  {
    id: 'crop-pigeonpea',
    name: 'Red Gram / Tur (Pigeonpea)',
    scientificName: 'Cajanus cajan',
    nameKannada: 'ತೊಗರಿ',
    nameTamil: 'துவரை',
    nameTelugu: 'కంది',
    category: 'pulse',
    idealSoilTypes: JSON.stringify(['black', 'loamy', 'alluvial']),
    minPh: 6.5,
    maxPh: 7.5,
    waterRequirement: 'Moderate',
    waterMm: '600-800',
    durationDays: '150-180 days',
    durationMin: 150,
    durationMax: 180,
    seasons: JSON.stringify(['Kharif']),
    estimatedCostPerAcre: '₹15,000 - ₹22,000',
    potentialYieldPerAcre: '6 - 10 quintals',
    marketDemand: 'Very High',
    description: 'Premier protein pulse crop of Kalaburagi (Tur Bowl of Karnataka) and Telangana.',
    descriptionKn: 'ಕರ್ನಾಟಕದ ತೊಗರಿ ಕಣಜ ಕಲಬುರಗಿಯ ಪ್ರಮುಖ ದ್ವಿದಳ ಧಾನ್ಯ ಬೆಳೆ.',
    descriptionTa: 'தினசரி உணவில் சாம்பாருக்கு பயன்படும் முக்கிய பருப்பு பயிர்.',
    descriptionTe: 'తెలంగాణ మరియు రాయలసీమలో విస్తారంగా పండించే ప్రధాన పప్పుధాన్య పంట.',
    imageUrl: '/crops/crop-pigeonpea.webp',
    risks: JSON.stringify(['Sterility mosaic disease', 'Fusarium wilt', 'Pod borer complex']),
    benefits: JSON.stringify(['Deep taproot enriches soil nitrogen', 'Stalks serve as rural fuel', 'High MSP support']),
  },
  {
    id: 'crop-marigold',
    name: 'Marigold',
    scientificName: 'Tagetes erecta',
    nameKannada: 'ಚೆಂಡು ಹೂವು',
    nameTamil: 'சாமந்தி / செண்டுமல்லி',
    nameTelugu: 'బంతి పువ్వు',
    category: 'flower',
    idealSoilTypes: JSON.stringify(['loamy', 'sandy-loam', 'red']),
    minPh: 6.0,
    maxPh: 7.5,
    waterRequirement: 'Moderate',
    waterMm: '400-500',
    durationDays: '90-110 days',
    durationMin: 90,
    durationMax: 110,
    seasons: JSON.stringify(['Kharif', 'Rabi', 'Zaid']),
    estimatedCostPerAcre: '₹20,000 - ₹30,000',
    potentialYieldPerAcre: '40 - 60 quintals',
    marketDemand: 'High',
    description: 'Popular loose flower crop for festive garlands, temple offerings, and lutein dye extraction.',
    descriptionKn: 'ಹಬ್ಬ ಹರಿದಿನಗಳ ಅಲಂಕಾರ ಮತ್ತು ಮಾಲೆಗಳಿಗೆ ಅತಿ ಹೆಚ್ಚು ಬೇಡಿಕೆಯಿರುವ ಹೂವಿನ ಬೆಳೆ.',
    descriptionTa: 'திருவிழாக்கள் மற்றும் மாலை தயாரிப்பிற்கு பயன்படும் முக்கிய மலர்ப்பயிர்.',
    descriptionTe: 'పండుగలు మరియు పూజలకు అత్యంత గిరాకీ ఉండే ప్రముఖ పూల పంట.',
    imageUrl: '/crops/crop-marigold.webp',
    risks: JSON.stringify(['Damping off in seedlings', 'Alternaria leaf spot', 'Flower bud caterpillar']),
    benefits: JSON.stringify(['Nematicidal root exudates clean soil', 'Trap crop in cotton and tomato', 'Quick returns']),
  },
  {
    id: 'crop-ashwagandha',
    name: 'Ashwagandha (Indian Ginseng)',
    scientificName: 'Withania somnifera',
    nameKannada: 'ಅಶ್ವಗಂಧ',
    nameTamil: 'அமுக்கிராங்கிழங்கு',
    nameTelugu: 'అశ్వగంధ',
    category: 'medicinal',
    idealSoilTypes: JSON.stringify(['sandy-loam', 'red-loam', 'gravelly']),
    minPh: 7.0,
    maxPh: 8.5,
    waterRequirement: 'Low',
    waterMm: '300-500',
    durationDays: '150-180 days',
    durationMin: 150,
    durationMax: 180,
    seasons: JSON.stringify(['Late Kharif', 'Rabi']),
    estimatedCostPerAcre: '₹18,000 - ₹25,000',
    potentialYieldPerAcre: '3 - 5 quintals dried roots',
    marketDemand: 'High',
    description: 'Renowned Ayurvedic adaptogenic medicinal herb grown for its therapeutic alkaloid-rich roots.',
    descriptionKn: 'ಔಷಧೀಯ ಗುಣಗಳುಳ್ಳ ಬೇರುಗಳಿಗಾಗಿ ಬೆಳೆಯಲಾಗುವ ಆಯುರ್ವೇದೀಯ ಗಿಡಮೂಲಿಕೆ ಬೆಳೆ.',
    descriptionTa: 'சித்த மற்றும் ஆயுர்வேத மருத்துவத்தில் பயன்படும் முக்கிய மருத்துவ பயிர்.',
    descriptionTe: 'ఆయుర్వేద ఔషధాలలో విశేషంగా వాడే ప్రముఖ ఔషధ మూలికా పంట.',
    imageUrl: '/crops/crop-ashwagandha.webp',
    risks: JSON.stringify(['Seedling blight', 'Leaf spot and rot in continuous rain', 'Poor root development in heavy clay']),
    benefits: JSON.stringify(['Drought hardy', 'Low pest incidence', 'High pharmaceutical export demand']),
  }
];

async function seedCropHealth() {
  console.log('🚀 Starting Crop Health Database Seeding (Phase A)...');

  // 1. Upsert Additional Crops
  console.log('\n🌾 Upserting Crops for complete category coverage...');
  for (const crop of ADDITIONAL_CROPS) {
    await prisma.crop.upsert({
      where: { id: crop.id },
      update: crop,
      create: crop,
    });
  }
  const allCrops = await prisma.crop.findMany({ select: { id: true, name: true, category: true } });
  console.log(`✅ Total crops available in DB: ${allCrops.length}`);

  // Create crop lookup helper
  const cropMap = new Map<string, string>();
  for (const c of allCrops) {
    cropMap.set(c.id.toLowerCase(), c.id);
    cropMap.set(c.name.toLowerCase(), c.id);
    // also normalize without brackets e.g. "paddy (rice)" -> "paddy"
    const simple = c.name.split('(')[0].trim().toLowerCase();
    cropMap.set(simple, c.id);
  }

  // 2. Seed Symptom Tags
  console.log('\n🏷️  Seeding Symptom Tags...');
  let tagCount = 0;
  for (const tag of SYMPTOM_TAGS_DATA) {
    await prisma.symptomTag.upsert({
      where: { slug: tag.slug },
      update: {
        plantPart: tag.plantPart,
        pattern: tag.pattern,
        colour: tag.colour,
        spread: tag.spread,
        stage: tag.stage,
        labelEn: tag.labelEn,
        labelKn: tag.labelKn,
        labelTa: tag.labelTa,
        labelTe: tag.labelTe,
        icon: tag.icon,
      },
      create: {
        slug: tag.slug,
        plantPart: tag.plantPart,
        pattern: tag.pattern,
        colour: tag.colour,
        spread: tag.spread,
        stage: tag.stage,
        labelEn: tag.labelEn,
        labelKn: tag.labelKn,
        labelTa: tag.labelTa,
        labelTe: tag.labelTe,
        icon: tag.icon,
      },
    });
    tagCount++;
  }
  console.log(`✅ Seeded ${tagCount} structured Symptom Tags.`);

  // 3. Combine All 54 Problems
  const ALL_PROBLEMS = [
    ...PROBLEMS_DATA,
    ...PROBLEMS_DATA_PART2,
    ...PROBLEMS_DATA_PART3,
    ...PROBLEMS_DATA_PART4,
    ...PROBLEMS_DATA_PART5,
  ];

  console.log(`\n🐛 Seeding ${ALL_PROBLEMS.length} authentic Problems with ICAR / UAS / TNAU data...`);

  const lowConfidenceReviewList: Array<{ slug: string; name: string; confidence: string; source: string }> = [];

  for (const p of ALL_PROBLEMS) {
    // Record for low-confidence check
    if (p.confidence !== 'verified') {
      lowConfidenceReviewList.push({
        slug: p.slug,
        name: p.name,
        confidence: p.confidence,
        source: p.sources,
      });
    }

    // 3a. Upsert Problem
    const problemRecord = await prisma.problem.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        nameKn: p.nameKn,
        nameTa: p.nameTa,
        nameTe: p.nameTe,
        scientificName: p.scientificName,
        type: p.type,
        severity: p.severity,
        symptoms: p.symptoms,
        symptomsKn: p.symptomsKn,
        symptomsTa: p.symptomsTa,
        symptomsTe: p.symptomsTe,
        cause: p.cause,
        favourableConditions: p.favourableConditions,
        favourableHumidity: p.favourableHumidity,
        favourableTemp: p.favourableTemp,
        favourableSeasons: JSON.stringify(p.favourableSeasons),
        affectedStages: JSON.stringify(p.affectedStages),
        spreadPattern: p.spreadPattern,
        culturalControl: p.culturalControl,
        culturalControlKn: p.culturalControlKn,
        culturalControlTa: p.culturalControlTa,
        culturalControlTe: p.culturalControlTe,
        biologicalControl: p.biologicalControl,
        biologicalControlKn: p.biologicalControlKn,
        biologicalControlTa: p.biologicalControlTa,
        biologicalControlTe: p.biologicalControlTe,
        organicControl: p.organicControl,
        organicControlKn: p.organicControlKn,
        organicControlTa: p.organicControlTa,
        organicControlTe: p.organicControlTe,
        chemicalControl: p.chemicalControl,
        chemicalControlKn: p.chemicalControlKn,
        chemicalControlTa: p.chemicalControlTa,
        chemicalControlTe: p.chemicalControlTe,
        preventionSteps: JSON.stringify(p.preventionSteps),
        preventionStepsKn: JSON.stringify(p.preventionStepsKn),
        preventionStepsTa: JSON.stringify(p.preventionStepsTa),
        preventionStepsTe: JSON.stringify(p.preventionStepsTe),
        ipmSteps: JSON.stringify(p.ipmSteps),
        ipmStepsKn: JSON.stringify(p.ipmStepsKn),
        ipmStepsTa: JSON.stringify(p.ipmStepsTa),
        ipmStepsTe: JSON.stringify(p.ipmStepsTe),
        safetyNotes: p.safetyNotes,
        lookAlikes: JSON.stringify(p.lookAlikes),
        whenToCallExpert: p.whenToCallExpert,
        whenToCallExpertKn: p.whenToCallExpertKn,
        whenToCallExpertTa: p.whenToCallExpertTa,
        whenToCallExpertTe: p.whenToCallExpertTe,
        confidence: p.confidence,
        sources: p.sources,
        verified: p.confidence === 'verified',
      },
      create: {
        slug: p.slug,
        name: p.name,
        nameKn: p.nameKn,
        nameTa: p.nameTa,
        nameTe: p.nameTe,
        scientificName: p.scientificName,
        type: p.type,
        severity: p.severity,
        symptoms: p.symptoms,
        symptomsKn: p.symptomsKn,
        symptomsTa: p.symptomsTa,
        symptomsTe: p.symptomsTe,
        cause: p.cause,
        favourableConditions: p.favourableConditions,
        favourableHumidity: p.favourableHumidity,
        favourableTemp: p.favourableTemp,
        favourableSeasons: JSON.stringify(p.favourableSeasons),
        affectedStages: JSON.stringify(p.affectedStages),
        spreadPattern: p.spreadPattern,
        culturalControl: p.culturalControl,
        culturalControlKn: p.culturalControlKn,
        culturalControlTa: p.culturalControlTa,
        culturalControlTe: p.culturalControlTe,
        biologicalControl: p.biologicalControl,
        biologicalControlKn: p.biologicalControlKn,
        biologicalControlTa: p.biologicalControlTa,
        biologicalControlTe: p.biologicalControlTe,
        organicControl: p.organicControl,
        organicControlKn: p.organicControlKn,
        organicControlTa: p.organicControlTa,
        organicControlTe: p.organicControlTe,
        chemicalControl: p.chemicalControl,
        chemicalControlKn: p.chemicalControlKn,
        chemicalControlTa: p.chemicalControlTa,
        chemicalControlTe: p.chemicalControlTe,
        preventionSteps: JSON.stringify(p.preventionSteps),
        preventionStepsKn: JSON.stringify(p.preventionStepsKn),
        preventionStepsTa: JSON.stringify(p.preventionStepsTa),
        preventionStepsTe: JSON.stringify(p.preventionStepsTe),
        ipmSteps: JSON.stringify(p.ipmSteps),
        ipmStepsKn: JSON.stringify(p.ipmStepsKn),
        ipmStepsTa: JSON.stringify(p.ipmStepsTa),
        ipmStepsTe: JSON.stringify(p.ipmStepsTe),
        safetyNotes: p.safetyNotes,
        lookAlikes: JSON.stringify(p.lookAlikes),
        whenToCallExpert: p.whenToCallExpert,
        whenToCallExpertKn: p.whenToCallExpertKn,
        whenToCallExpertTa: p.whenToCallExpertTa,
        whenToCallExpertTe: p.whenToCallExpertTe,
        confidence: p.confidence,
        sources: p.sources,
        verified: p.confidence === 'verified',
      },
    });

    // 3b. Seed ProblemCrop Relations
    // Remove existing relations for clean idempotency
    await prisma.problemCrop.deleteMany({ where: { problemId: problemRecord.id } });
    for (const cropRef of p.crops) {
      // Find matching crop in DB
      let targetCropId = cropMap.get(cropRef.cropSlug.toLowerCase()) ||
        cropMap.get(cropRef.cropName.toLowerCase()) ||
        cropMap.get(`crop-${cropRef.cropSlug.toLowerCase()}`);

      // Handle common aliases
      if (!targetCropId) {
        if (cropRef.cropSlug === 'paddy' || cropRef.cropSlug === 'rice') targetCropId = 'crop-paddy-rice';
        else if (cropRef.cropSlug === 'ragi' || cropRef.cropSlug === 'finger-millet') targetCropId = 'crop-ragi-finger-millet';
        else if (cropRef.cropSlug === 'maize' || cropRef.cropSlug === 'corn') targetCropId = 'crop-maize-corn';
        else if (cropRef.cropSlug === 'groundnut' || cropRef.cropSlug === 'peanut') targetCropId = 'crop-groundnut-peanut';
        else if (cropRef.cropSlug === 'tomato') targetCropId = 'crop-tomato-vegetable';
        else if (cropRef.cropSlug === 'cotton') targetCropId = 'crop-cotton-cash';
        else if (cropRef.cropSlug === 'chickpea') targetCropId = 'crop-chickpea-gram';
        else if (cropRef.cropSlug === 'sugarcane') targetCropId = 'crop-sugarcane';
        else if (cropRef.cropSlug === 'chilli') targetCropId = 'crop-chilli';
        else if (cropRef.cropSlug === 'onion' || cropRef.cropSlug === 'garlic') targetCropId = 'crop-onion';
        else if (cropRef.cropSlug === 'okra' || cropRef.cropSlug === 'bhendi') targetCropId = 'crop-okra';
        else if (cropRef.cropSlug === 'banana') targetCropId = 'crop-banana';
        else if (cropRef.cropSlug === 'mango') targetCropId = 'crop-mango';
        else if (cropRef.cropSlug === 'coconut') targetCropId = 'crop-coconut';
        else if (cropRef.cropSlug === 'arecanut') targetCropId = 'crop-arecanut';
        else if (cropRef.cropSlug === 'pomegranate') targetCropId = 'crop-pomegranate';
        else if (cropRef.cropSlug === 'red-gram' || cropRef.cropSlug === 'pigeonpea') targetCropId = 'crop-pigeonpea';
        else if (cropRef.cropSlug === 'greengram' || cropRef.cropSlug === 'green-gram') targetCropId = 'crop-pigeonpea'; // fallback pulse
      }

      await prisma.problemCrop.create({
        data: {
          problemId: problemRecord.id,
          cropId: targetCropId || null,
          cropName: cropRef.cropName,
          cropSlug: cropRef.cropSlug,
          importance: cropRef.importance,
        },
      });
    }

    // 3c. Seed ProblemSymptom Relations
    await prisma.problemSymptom.deleteMany({ where: { problemId: problemRecord.id } });
    for (const sym of p.symptomTags) {
      const tagRecord = await prisma.symptomTag.findUnique({ where: { slug: sym.tagSlug } });
      if (tagRecord) {
        await prisma.problemSymptom.create({
          data: {
            problemId: problemRecord.id,
            symptomTagId: tagRecord.id,
            weight: sym.weight,
            isPrimary: sym.isPrimary,
          },
        });
      }
    }

    // 3d. Seed ProblemImages
    await prisma.problemImage.deleteMany({ where: { problemId: problemRecord.id } });
    for (const img of p.images) {
      await prisma.problemImage.create({
        data: {
          problemId: problemRecord.id,
          path: img.path,
          caption: img.caption,
          captionKn: img.captionKn,
          captionTa: img.captionTa,
          captionTe: img.captionTe,
          kind: img.kind,
          source: img.source,
          author: img.author,
          licence: img.licence,
          attribution: img.attribution,
          isPrimary: img.isPrimary,
        },
      });
    }
  }

  console.log(`\n🎉 Successfully seeded all ${ALL_PROBLEMS.length} Problems, Symptoms, Crops & Images!`);

  // Report Low Confidence Items
  console.log('\n======================================================');
  console.log('📋 VERIFICATION REPORT FOR ICAR / UAS BANGALORE / TNAU:');
  console.log('======================================================');
  if (lowConfidenceReviewList.length === 0) {
    console.log('✅ All 54 problem entries are marked "verified" based on ICAR, UAS Bangalore, UAS Dharwad, IIHR and TNAU publications.');
  } else {
    console.log(`Found ${lowConfidenceReviewList.length} items flagged for user review:`);
    for (const item of lowConfidenceReviewList) {
      console.log(` - [${item.slug}] ${item.name} (Status: ${item.confidence}, Source: ${item.source})`);
    }
  }
}

seedCropHealth()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
