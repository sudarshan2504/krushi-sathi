export interface CropData {
  id: string;
  name: string;
  scientificName: string;
  nameKannada: string;
  nameTamil: string;
  nameTelugu: string;
  category: string;
  idealSoilTypes: string[];
  minPh: number;
  maxPh: number;
  waterRequirement: 'Low' | 'Moderate' | 'High';
  waterMm: string;
  durationDays: string;
  durationMin: number;
  durationMax: number;
  seasons: string[];
  minTemp: number;
  maxTemp: number;
  rainfallMm: string;
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
  stages: {
    stage: string;
    stageOrder: number;
    dayRange: string;
    dayOffset: number;
    title: string;
    titleKn: string;
    titleTa: string;
    titleTe: string;
    description: string;
    descriptionKn: string;
    descriptionTa: string;
    descriptionTe: string;
    category: string;
    materialsNeeded: string[];
    importantTip: string;
    importantTipKn: string;
    importantTipTa: string;
    importantTipTe: string;
    tasks: {
      title: string;
      titleKn: string;
      titleTa: string;
      titleTe: string;
      description: string;
    }[];
  }[];
}

export const CROPS_DATA: CropData[] = [
  {
    id: 'crop-paddy-rice',
    name: 'Paddy (Rice)',
    scientificName: 'Oryza sativa',
    nameKannada: 'ಅಕ್ಕಿ / ಭತ್ತ (Paddy)',
    nameTamil: 'நெல் (Paddy)',
    nameTelugu: 'వరి (Paddy)',
    category: 'cereal',
    idealSoilTypes: ['clay', 'loamy', 'black'],
    minPh: 5.5,
    maxPh: 7.2,
    waterRequirement: 'High',
    waterMm: '900-1200 mm',
    durationDays: '100-120 days',
    durationMin: 100,
    durationMax: 120,
    seasons: ['Kharif', 'Rabi'],
    minTemp: 20,
    maxTemp: 36,
    rainfallMm: '1000-1500 mm or canal/borewell irrigation',
    estimatedCostPerAcre: '₹18,000 - ₹24,000',
    potentialYieldPerAcre: '22 - 28 Quintals',
    marketDemand: 'Very High',
    description: 'Paddy is India\'s staple cereal, well-suited for clayey and loamy soils with assured water supply or heavy monsoon rains.',
    descriptionKn: 'ಭತ್ತವು ಪ್ರಮುಖ ಧಾನ್ಯ ಬೆಳೆಯಾಗಿದ್ದು, ಜೇಡಿಮಣ್ಣು ಮತ್ತು ಫಲವತ್ತಾದ ಗೋಡು ಮಣ್ಣಿನಲ್ಲಿ ನೀರಿನ ಸೌಲಭ್ಯವಿದ್ದಾಗ ಸಮೃದ್ಧವಾಗಿ ಬೆಳೆಯುತ್ತದೆ.',
    descriptionTa: 'நெல் முதன்மை உணவுப் பயிராகும். களிமண் மற்றும் வண்டல் மண்ணில் நீர் வசதியுடன் நன்கு வளரும்.',
    descriptionTe: 'వరి ప్రధాన ఆహార పంట. బంకమట్టి మరియు ఒండ్రు నేలల్లో నీటి వసతితో అధిక దిగుబడినిస్తుంది.',
    imageUrl: 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?w=800&auto=format&fit=crop&q=80',
    risks: ['Stem borer and blast disease risk under humid weather', 'Waterlogging without drainage during heavy downpours', 'Market price fluctuations during peak harvest season'],
    benefits: ['Government MSP procurement support', 'Staple grain with continuous year-round market demand', 'Straw serves as valuable livestock fodder'],
    stages: [
      {
        stage: 'Land Preparation',
        stageOrder: 1,
        dayRange: 'Day 1 - 7',
        dayOffset: 1,
        title: 'Land Preparation & Puddling',
        titleKn: 'ಭೂಮಿ ಸಿದ್ಧತೆ ಮತ್ತು ಕೆಸರು ಗದ್ದೆ ನಿರ್ಮಾಣ',
        titleTa: 'நிலம் தயாரித்தல் மற்றும் சேறு பூசுதல்',
        titleTe: 'భూమి తయారీ మరియు దమ్ము చేయడం',
        description: 'Plough the field 2-3 times to make the soil fine, remove weeds and build firm bunds.',
        descriptionKn: 'ಮಣ್ಣನ್ನು ಮೃದುವಾಗಿಸಲು ಗದ್ದೆಯನ್ನು 2-3 ಬಾರಿ ಉಳುಮೆ ಮಾಡಿ ಮತ್ತು ಗಟ್ಟಿ ಬದುಗಳನ್ನು ನಿರ್ಮಿಸಿ.',
        descriptionTa: 'மண்ணை மென்மையாக்க 2-3 முறை உழவு செய்து உறுதியான வரப்புகளை அமைக்கவும்.',
        descriptionTe: 'నేలను మెత్తగా చేయడానికి 2-3 సార్లు దున్నండి మరియు గట్లను పటిష్టంగా చేయండి.',
        category: 'preparation',
        materialsNeeded: ['Tractor / Plough', 'Farm Labour', 'Water for leveling & puddling'],
        importantTip: 'Ensure proper drainage channels alongside bunds to prevent water stagnation in nursery.',
        importantTipKn: 'ನೀರು ನಿಲ್ಲದಂತೆ ತಡೆಯಲು ಬದುಗಳ ಪಕ್ಕದಲ್ಲಿ ಸರಿಯಾದ ಒಳಚರಂಡಿ ಕಾಲುವೆಗಳನ್ನು ನಿರ್ಮಿಸಿ.',
        importantTipTa: 'தேவையற்ற நீர் தேங்குவதைத் தடுக்க வரப்பு ஓரங்களில் வடிகால் வாய்க்கால்களை அமைக்கவும்.',
        importantTipTe: 'నీరు నిల్వ ఉండకుండా ఉండేందుకు గట్ల వెంబడి సరైన మురుగు కాలువలను ఏర్పాటు చేయండి.',
        tasks: [
          { title: 'Plough the field 2-3 times', titleKn: 'ಗದ್ದೆಯನ್ನು 2-3 ಬಾರಿ ಉಳುಮೆ ಮಾಡಿ', titleTa: 'வயலை 2-3 முறை உழவும்', titleTe: 'పొలాన్ని 2-3 సార్లు దున్నండి', description: 'Deep ploughing breaks soil clods and exposes pest pupae to sunlight.' },
          { title: 'Remove weeds and previous crop residues', titleKn: 'ಕಳೆಗಳು ಮತ್ತು ಕಸವನ್ನು ತೆಗೆದುಹಾಕಿ', titleTa: 'களைகள் மற்றும் பயிர் எச்சங்களை அகற்றவும்', titleTe: 'కలుపు మొక్కలు మరియు పంట వ్యర్థాలను తొలగించండి', description: 'Clean field borders to avoid rodent and insect infestation.' },
          { title: 'Level the field with wooden plank or laser leveler', titleKn: 'ಹಲಗೆಯಿಂದ ಮಣ್ಣನ್ನು ಸಮತಟ್ಟು ಮಾಡಿ', titleTa: 'மரப்பலகையால் நிலத்தை சமன் செய்யவும்', titleTe: 'చెక్క బద్దతో నేలను చదును చేయండి', description: 'Uniform leveling ensures even water distribution across the plot.' },
          { title: 'Prepare firm bunds to retain water', titleKn: 'ನೀರನ್ನು ಹಿಡಿದಿಡಲು ಗಟ್ಟಿ ಬದುಗಳನ್ನು ಕಟ್ಟಿ', titleTa: 'நீரைத் தேக்க வரப்புகளை பலப்படுத்தவும்', titleTe: 'నీరు నిలవడానికి గట్లను గట్టిగా నిర్మించండి', description: 'Strengthen bunds and seal crab holes.' }
        ]
      },
      {
        stage: 'Seed Selection & Sowing',
        stageOrder: 2,
        dayRange: 'Day 8 - 10',
        dayOffset: 8,
        title: 'Seed Treatment & Nursery Sowing',
        titleKn: 'ಬೀಜೋಪಚಾರ ಮತ್ತು ಸಸಿ ಮಡಿ ಬಿತ್ತನೆ',
        titleTa: 'விதை நேர்த்தி மற்றும் நாற்றங்கால் நடுதல்',
        titleTe: 'విత్తన శుద్ధి మరియు నారుమడి విత్తడం',
        description: 'Treat certified high-yielding seeds with bio-fungicide and broadcast in raised nursery bed.',
        descriptionKn: 'ಉತ್ತಮ ಗುಣಮಟ್ಟದ ಬೀಜಗಳನ್ನು ಜೈವಿಕ ಶಿಲೀಂಧ್ರನಾಶಕದಿಂದ ಉಪಚರಿಸಿ ನರ್ಸರಿಯಲ್ಲಿ ಬಿತ್ತನೆ ಮಾಡಿ.',
        descriptionTa: 'தரமான விதைகளை பூஞ்சாணக்கொல்லி கொண்டு விதை நேர்த்தி செய்து நாற்றங்காலில் தெளிக்கவும்.',
        descriptionTe: 'ధృవీకరించబడిన విత్తనాలను శిలీంద్ర సంహారిణితో శుద్ధి చేసి నారుమడిలో విత్తండి.',
        category: 'sowing',
        materialsNeeded: ['Certified Paddy Seeds (20-25 kg/acre)', 'Carbendazim or Trichoderma viride', 'Nursery fertilizer'],
        importantTip: 'Soak seeds in 10% brine water first; discard floating light seeds to ensure 95%+ germination.',
        importantTipKn: 'ಬೀಜಗಳನ್ನು 10% ಉಪ್ಪುನೀರಿನಲ್ಲಿ ನೆನೆಸಿ, ತೇಲುವ ಜೊಳ್ಳು ಬೀಜಗಳನ್ನು ಬೇರ್ಪಡಿಸಿ.',
        importantTipTa: 'விதைகளை 10% உப்பு நீரில் ஊறவைத்து, மிதக்கும் மலட்டு விதைகளை நீக்கவும்.',
        importantTipTe: 'విత్తనాలను 10% ఉప్పు నీటిలో నానబెట్టి, తేలే తాలు విత్తనాలను తొలగించండి.',
        tasks: [
          { title: 'Select certified seeds suited for season (e.g. BPT 5204, Jaya, MTU 1010)', titleKn: 'ಋತುವಿಗೆ ತಕ್ಕಂತೆ ಪ್ರಮಾಣೀಕೃತ ಬೀಜಗಳನ್ನು ಆಯ್ಕೆ ಮಾಡಿ', titleTa: 'பருவத்திற்கேற்ற தரமான விதைகளை தேர்ந்தெடுக்கவும்', titleTe: 'సీజన్‌కు అనువైన విత్తనాలను ఎంచుకోండి', description: 'Use tested disease-resistant seed lots.' },
          { title: 'Treat seeds with Trichoderma (5g/kg seed)', titleKn: 'ಟ್ರೈಕೋಡರ್ಮಾ ಜೈವಿಕ ಗೊಬ್ಬರದಿಂದ ಬೀಜೋಪಚಾರ ಮಾಡಿ', titleTa: 'ட்ரைக்கோடெர்மா கொண்டு விதை நேர்த்தி செய்யவும்', titleTe: 'ట్రైకోడెర్మతో విత్తన శుద్ధి చేయండి', description: 'Protects seedlings from soil-borne damping off and root rot.' },
          { title: 'Sow evenly in nursery bed and irrigate gently', titleKn: 'ಸಸಿ ಮಡಿಯಲ್ಲಿ ಸಮವಾಗಿ ಬೀಜ ಬಿತ್ತಿ ನೀರು ಹಾಯಿಸಿ', titleTa: 'நாற்றங்காலில் சீராக விதைத்து மிதமாக நீர் பாய்ச்சவும்', titleTe: 'నారుమడిలో సమానంగా విత్తి తేలికగా నీరు పెట్టండి', description: 'Maintain shallow moisture until germination begins.' }
        ]
      },
      {
        stage: 'Germination & Nursery Care',
        stageOrder: 3,
        dayRange: 'Day 11 - 20',
        dayOffset: 11,
        title: 'Nursery Management & Transplanting Prep',
        titleKn: 'ಸಸಿ ಮಡಿ ಪಾಲನೆ ಮತ್ತು ನಾಟಿ ಸಿದ್ಧತೆ',
        titleTa: 'நாற்றங்கால் பராமரிப்பு மற்றும் நடவு தயார்',
        titleTe: 'నారుమడి యాజమాన్యం మరియు నాట్లు వేయడానికి సిద్ధం',
        description: 'Maintain thin layer of water in nursery bed. Prepare main field for transplanting 20-25 day old seedlings.',
        descriptionKn: 'ಸಸಿಮಡಿಯಲ್ಲಿ ತೆಳುವಾದ ನೀರಿನ ಪದರವನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳಿ. 20-25 ದಿನದ ಸಸಿಗಳನ್ನು ನಾಟಿ ಮಾಡಲು ಮುಖ್ಯ ಗದ್ದೆ ಸಿದ್ಧಗೊಳಿಸಿ.',
        descriptionTa: 'நாற்றங்காலில் மெல்லிய நீர் மட்டத்தை பராமரிக்கவும். 20-25 நாள் நாற்றுகளை நடவு செய்ய வயலை தயார் செய்யவும்.',
        descriptionTe: 'నారుమడిలో పల్చటి నీటి పొరను నిర్వహించండి. 20-25 రోజుల నారును నాటడానికి ప్రధాన పొలాన్ని సిద్ధం చేయండి.',
        category: 'irrigation',
        materialsNeeded: ['Basal Fertilizer (DAP + Potash)', 'Well-decomposed FYM (5 tonnes/acre)'],
        importantTip: 'Do not let nursery soil crack; spray protective neem oil if thrips appear.',
        importantTipKn: 'ಸಸಿ ಮಡಿಯ ಮಣ್ಣು ಬಿರುಕು ಬಿಡದಂತೆ ಎಚ್ಚರವಹಿಸಿ; ಹೇನುಗಳಿದ್ದರೆ ಬೇವಿನ ಎಣ್ಣೆ ಸಿಂಪಡಿಸಿ.',
        importantTipTa: 'நாற்றங்கால் வெடிக்காமல் பார்த்துக் கொள்ளுங்கள்; அசுவினிக்கு வேப்பெண்ணெய் தெளிக்கவும்.',
        importantTipTe: 'నారుమడి నేల నెర్రెలు బారకుండా చూసుకోండి; పేనుబంక ఉంటే వేప నూనె పిచికారీ చేయండి.',
        tasks: [
          { title: 'Monitor germination and spray light irrigation daily', titleKn: 'ಮೊಳಕೆಯೊಡೆಯುವುದನ್ನು ಗಮನಿಸಿ ಪ್ರತಿದಿನ ಹಗುರ ನೀರುಣಿಸಿ', titleTa: 'முளைப்புத்திறனை கண்காணித்து தினமும் மித நீர் பாய்ச்சவும்', titleTe: 'మొలకలను పరిశీలించి ప్రతిరోజూ తేలికపాటి నీరు ఇవ్వండి', description: 'Healthy green seedlings should emerge uniformly within 4-6 days.' },
          { title: 'Apply FYM and basal DAP + MOP in main field', titleKn: 'ಮುಖ್ಯ ಗದ್ದೆಗೆ ಕಾಂಪೋಸ್ಟ್ ಗೊಬ್ಬರ ಮತ್ತು ಡಿಎಪಿ ಹಾಕಿ', titleTa: 'முதன்மை வயலில் மக்கிய தொழுவுரம் மற்றும் டி.ஏ.பி இடவும்', titleTe: 'ప్రధాన పొలంలో పశువుల ఎరువు మరియు డిఎపి వేయండి', description: 'Incorporate 5 tonnes of organic manure during final puddling.' }
        ]
      },
      {
        stage: 'Vegetative Growth & Weeding',
        stageOrder: 4,
        dayRange: 'Day 21 - 40',
        dayOffset: 21,
        title: 'Transplanting & Active Tillering',
        titleKn: 'ಸಸಿ ನಾಟಿ ಮತ್ತು ಚಿಗುರೊಡೆಯುವ ಹಂತ',
        titleTa: 'நாற்று நடுதல் மற்றும் தூர்கட்டும் பருவம்',
        titleTe: 'నాట్లు వేయడం మరియు పిలకలు తొడిగే దశ',
        description: 'Transplant 2-3 seedlings per hill at 20x15 cm spacing. Perform first mechanical weeding (cono-weeder) at 15-20 days after transplanting.',
        descriptionKn: '20x15 ಸೆಂ.ಮೀ ಅಂತರದಲ್ಲಿ ಪ್ರತಿ ಗುಂಡಿಗೆ 2-3 ಸಸಿಗಳನ್ನು ನಾಟಿ ಮಾಡಿ. 20 ದಿನಗಳಲ್ಲಿ ಮೊದಲ ಕಳೆ ಕೀಳುವ ಕೆಲಸ ಮಾಡಿ.',
        descriptionTa: '20x15 செ.மீ இடைவெளியில் குத்துக்கு 2-3 நாற்றுகள் நடவும். 20 நாளில் முதல் களை எடுக்கவும்.',
        descriptionTe: '20x15 సెం.మీ దూరంలో కుదురుకు 2-3 మొక్కలను నాటండి. 20 రోజులకు మొదటి కలుపు తీయండి.',
        category: 'nutrient',
        materialsNeeded: ['Urea (First top dressing)', 'Cono-weeder or Hand weeder', 'Zinc Sulphate (10 kg/acre)'],
        importantTip: 'Maintain 2-3 cm standing water during tillering; drain water for 24 hours prior to fertilizer application.',
        importantTipKn: 'ಗೊಬ್ಬರ ಹಾಕುವ ಮುನ್ನ ಒಂದು ದಿನ ನೀರನ್ನು ಬಸಿದು, ನಂತರ 2-3 ಸೆಂ.ಮೀ ನೀರನ್ನು ನಿಲ್ಲಿಸಿ.',
        importantTipTa: 'உரம் இடுவதற்கு முன் நீரை வடித்து, பின் 2-3 செ.மீ நீர் தேக்கவும்.',
        importantTipTe: 'ఎరువు వేయడానికి ముందు నీటిని తీసివేసి, తరువాత 2-3 సెం.మీ నీటిని నిలకడగా ఉంచండి.',
        tasks: [
          { title: 'Transplant 2-3 seedlings per hill at recommended spacing', titleKn: 'ಶಿಫಾರಸು ಮಾಡಿದ ಅಂತರದಲ್ಲಿ ಸಸಿಗಳನ್ನು ನಾಟಿ ಮಾಡಿ', titleTa: 'பரிந்துரைக்கப்பட்ட இடைவெளியில் நாற்று நடவும்', titleTe: 'సిఫార్సు చేసిన దూరంలో నారు నాటండి', description: 'Transplant upright at shallow depth (2-3 cm) for fast rooting.' },
          { title: 'First top dressing of Urea (30 kg/acre)', titleKn: 'ಮೊದಲ ಕಂತಿನ ಯೂರಿಯಾ ಗೊಬ್ಬರ ಹಾಕಿ (30 ಕೆಜಿ/ಎಕರೆ)', titleTa: 'முதல் முறை யூரியா இடவும் (30 கிலோ/ஏக்கர்)', titleTe: 'మొదటి విడత యూరియా వేయండి (30 కిలోలు/ఎకరం)', description: 'Boosts tiller production and vigorous root system.' },
          { title: 'Run cono-weeder between rows to aerate soil and bury weeds', titleKn: 'ಕೋನೋ ವೀಡರ್ ಬಳಸಿ ಕಳೆಯನ್ನು ಮಣ್ಣಲ್ಲಿ ಹೂತುಹಾಕಿ', titleTa: 'கோனோ வீடர் கொண்டு களைகளை அமுக்கி மண்ணை கிளறவும்', titleTe: 'కోనో వీడర్‌తో కలుపును మట్టిలో కలపండి', description: 'Weeding by cono-weeder aerates root zone and doubles tiller vigor.' }
        ]
      },
      {
        stage: 'Flowering & Panicle Initiation',
        stageOrder: 5,
        dayRange: 'Day 41 - 70',
        dayOffset: 41,
        title: 'Panicle Emergence & Nutrient Boost',
        titleKn: 'ತೆನೆ ಮೂಡುವಿಕೆ ಮತ್ತು ಹೂಬಿಡುವ ಹಂತ',
        titleTa: 'கதிர் உருவாகுதல் மற்றும் பூக்கும் பருவம்',
        titleTe: 'చిరుపొట్ట మరియు వెన్ను వేసే దశ',
        description: 'Critical moisture period. Apply second top dressing of Nitrogen and Potash to support healthy panicles.',
        descriptionKn: 'ಇದು ಅತಿ ಮುಖ್ಯ ಹಂತವಾಗಿದ್ದು ಗದ್ದೆಯಲ್ಲಿ ತೇವಾಂಶ ಕಾಪಾಡಿ. ಯೂರಿಯಾ ಮತ್ತು ಪೊಟ್ಯಾಷ್ ಗೊಬ್ಬರ ನೀಡಿ.',
        descriptionTa: 'முக்கிய நீர் தேவைப்படும் பருவம். கதிர் திரட்சியாக யூரியா மற்றும் பொட்டாஷ் இடவும்.',
        descriptionTe: 'చాలా కీలకమైన తేమ దశ. నాణ్యమైన వెన్నుల కోసం యూరియా మరియు పొటాష్ ఎరువులు అందించండి.',
        category: 'irrigation',
        materialsNeeded: ['Urea (20 kg) + MOP Potash (15 kg)', 'Neem formulation for pest check'],
        importantTip: 'Never allow soil to dry out between panicle emergence and flowering stage.',
        importantTipKn: 'ತೆನೆ ಬರುವ ಸಮಯದಲ್ಲಿ ಗದ್ದೆಯಲ್ಲಿ ನೀರು ಬತ್ತಿಹೋಗದಂತೆ ಸದಾ ಎಚ್ಚರಿಕೆ ವಹಿಸಿ.',
        importantTipTa: 'கதிர் வரும் சமயத்தில் நிலம் வறண்டு போகாமல் பார்த்துக் கொள்ளவும்.',
        importantTipTe: 'వెన్ను వచ్చే సమయంలో పొలంలో తేమ తగ్గకుండా ఎల్లప్పుడూ జాగ్రత్త పడండి.',
        tasks: [
          { title: 'Maintain continuous 4-5 cm water layer', titleKn: 'ಗದ್ದೆಯಲ್ಲಿ ನಿರಂತರ 4-5 ಸೆಂ.ಮೀ ನೀರು ನಿಲ್ಲಿಸಿ', titleTa: 'வயலில் தொடர்ந்து 4-5 செ.மீ நீர் தேக்கவும்', titleTe: 'పొలంలో నిరంతరం 4-5 సెం.మీ నీటిని నిలపండి', description: 'Water stress at this stage leads to chaffy empty grains.' },
          { title: 'Apply second dose of Nitrogen and Potash', titleKn: 'ಎರಡನೇ ಕಂತಿನ ಸಾರಜನಕ ಮತ್ತು ಪೊಟ್ಯಾಷ್ ಗೊಬ್ಬರ ನೀಡಿ', titleTa: 'இரண்டாம் முறை தழை மற்றும் சாம்பல் சத்து உரம் இடவும்', titleTe: 'రెండవ విడత నత్రజని మరియు పొటాష్ ఎరువులు వేయండి', description: 'Potash strengthens stems and prevents crop lodging during winds.' },
          { title: 'Scout for stem borer "dead hearts" or white ears', titleKn: 'ಕಾಂಡ ಕೊರೆಯುವ ಹುಳುವಿನ ಲಕ್ಷಣಗಳನ್ನು ಪರಿಶೀಲಿಸಿ', titleTa: 'தண்டு துளைப்பான் வெள்ளைக்கதிர் அறிகுறிகளை கவனிக்கவும்', titleTe: 'కాండం తొలుచు పురుగు తెల్ల కంకుల లక్షణాలను గమనించండి', description: 'Install pheromone traps (5 traps/acre) to monitor adult moths.' }
        ]
      },
      {
        stage: 'Grain Development & Ripening',
        stageOrder: 6,
        dayRange: 'Day 71 - 100',
        dayOffset: 71,
        title: 'Milking & Dough Stage',
        titleKn: 'ಕಾಳು ತುಂಬುವ ಮತ್ತು ಹಾಲು ಹಂತ',
        titleTa: 'பால் பிடிக்கும் மற்றும் முதிர்ச்சி பருவம்',
        titleTe: 'పాలు పోసుకునే మరియు గింజ ముదిరే దశ',
        description: 'Grains transition from liquid milky state to firm dough. Drain field water 10-14 days before harvest.',
        descriptionKn: 'ಕಾಳುಗಳು ಗಟ್ಟಿಯಾಗುತ್ತವೆ. ಕೊಯ್ಲಿಗೆ 10-14 ದಿನಗಳ ಮೊದಲು ಗದ್ದೆಯ ನೀರನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ಹೊರಹಾಕಿ.',
        descriptionTa: 'மணிகள் முற்றி பொன்னிறமாகும். அறுவடைக்கு 10-14 நாட்களுக்கு முன் நீரை முழுமையாக வடிக்கவும்.',
        descriptionTe: 'గింజలు గట్టిపడతాయి. కోతకు 10-14 రోజుల ముందు పొలం నుండి నీటిని పూర్తిగా తీసివేయండి.',
        category: 'irrigation',
        materialsNeeded: ['Bird scaring devices', 'Field drainage tools'],
        importantTip: 'Withdrawing water 10 days before harvest hardens the field for easy harvesting and uniform grain ripening.',
        importantTipKn: 'ಕೊಯ್ಲಿನ 10 ದಿನ ಮುನ್ನ ನೀರು ಬಸಿದರೆ ಕಾಳುಗಳು ಏಕರೂಪವಾಗಿ ಮಾಗುತ್ತವೆ ಮತ್ತು ಯಂತ್ರ ಸಾಗಾಟ ಸುಲಭವಾಗುತ್ತದೆ.',
        importantTipTa: 'அறுவடைக்கு 10 நாள் முன் நீர் வடித்தால் மணிகள் சீராக முற்றி இயந்திர அறுவடை சுலபமாகும்.',
        importantTipTe: 'కోతకు 10 రోజుల ముందు నీరు తీస్తే గింజలు ఒకేలా ముదురుతాయి మరియు కోత యంత్రం తిరగడం సులభం అవుతుంది.',
        tasks: [
          { title: 'Inspect grain filling and check moisture level', titleKn: 'ಕಾಳು ತುಂಬುವುದನ್ನು ಮತ್ತು ತೇವಾಂಶವನ್ನು ಪರೀಕ್ಷಿಸಿ', titleTa: 'தானிய திரட்சியை பரிசோதிக்கவும்', titleTe: 'గింజ నిండుదనాన్ని మరియు తేమను పరిశీలించండి', description: 'Ensure no brown planthopper clusters appear near the base of the stems.' },
          { title: 'Drain all standing water 10-12 days before anticipated harvest', titleKn: 'ಕೊಯ್ಲಿನ 10 ದಿನ ಮುಂಚೆ ಗದ್ದೆಯ ನೀರನ್ನು ಹೊರಹಾಕಿ', titleTa: 'அறுவடைக்கு 10 நாட்களுக்கு முன் நீரை வடிக்கவும்', titleTe: 'కోతకు 10 రోజుల ముందు నిల్వ నీటిని తీసివేయండి', description: 'Prevents sprouted grain and makes mechanical combined harvesters easily passable.' }
        ]
      },
      {
        stage: 'Harvesting & Storage',
        stageOrder: 7,
        dayRange: 'Day 101 - 120',
        dayOffset: 101,
        title: 'Harvesting, Threshing & Safe Storage',
        titleKn: 'ಕೊಯ್ಲು, ಒಕ್ಕಣೆ ಮತ್ತು ಧಾನ್ಯ ಸಂಗ್ರಹಣೆ',
        titleTa: 'அறுவடை, கதிரடித்தல் மற்றும் சேமிப்பு',
        titleTe: 'కోత, నూర్పిడి మరియు భద్రపరచడం',
        description: 'Harvest when 85% of panicles turn golden yellow. Sun-dry grains to 12-14% moisture before storage.',
        descriptionKn: '85% ತೆನೆಗಳು ಚಿನ್ನದ ಬಣ್ಣಕ್ಕೆ ತಿರುಗಿದಾಗ ಕೊಯ್ಲು ಮಾಡಿ. ಸಂಗ್ರಹಿಸುವ ಮುನ್ನ 12-14% ತೇವಾಂಶ ಬರುವವರೆಗೆ ಬಿಸಿಲಿನಲ್ಲಿ ಒಣಗಿಸಿ.',
        descriptionTa: '85% கதிர்கள் பொன்னிறமாகும் போது அறுவடை செய்யவும். 12-14% ஈரப்பதத்திற்கு காயவைத்து சேமிக்கவும்.',
        descriptionTe: '85% వెన్నులు బంగారు రంగులోకి మారినప్పుడు కోయండి. నిల్వ చేయడానికి ముందు 12-14% తేమ వచ్చేలా ఎండబెట్టండి.',
        category: 'harvest',
        materialsNeeded: ['Combine Harvester / Sickles', 'Tarpaulin sheets', 'Clean moisture-proof gunny bags'],
        importantTip: 'Store in airtight containers with dried neem leaves to naturally repel weevils and pests for over 12 months.',
        importantTipKn: 'ನುಸಿ ಹುಳು ಬರದಂತೆ ಒಣಗಿದ ಬೇವಿನ ಎಲೆಗಳೊಂದಿಗೆ ಗಾಳಿಯಾಡದ ಚೀಲದಲ್ಲಿ ಸಂಗ್ರಹಿಸಿ.',
        importantTipTa: 'வண்டுகள் தாக்காமல் இருக்க காய்ந்த வேப்பிலைகளை கலந்து காற்றுப்புகாத சாக்குகளில் சேமிக்கவும்.',
        importantTipTe: 'పురుగు పట్టకుండా ఉండేందుకు ఎండిన వేప ఆకులతో కలిపి గాలి చొరబడని సంచులలో నిల్వ చేయండి.',
        tasks: [
          { title: 'Harvest on a clear sunny morning', titleKn: 'ಬಿಸಿಲು ಇರುವ ದಿನದಂದು ಕೊಯ್ಲು ಮಾಡಿ', titleTa: 'நல்ல வெயில் உள்ள நாளில் அறுவடை செய்யவும்', titleTe: 'ఎండగా ఉన్న రోజున కోత కోయండి', description: 'Avoid harvesting in dewy mornings or cloudy wet days.' },
          { title: 'Thresh and winnow clean grain', titleKn: 'ಒಕ್ಕಣೆ ಮಾಡಿ ಸ್ವಚ್ಛ ಕಾಳುಗಳನ್ನು ಬೇರ್ಪಡಿಸಿ', titleTa: 'கதிரடித்து பதர் நீக்கி தூய்மைப்படுத்தவும்', titleTe: 'నూర్పిడి చేసి తాలు లేకుండా గింజలను శుభ్రం చేయండి', description: 'Separate chaff, immature grains and foreign dirt.' },
          { title: 'Dry grains on tarpaulin until moisture is under 14%', titleKn: 'ಧಾನ್ಯದ ತೇವಾಂಶ 14% ಕ್ಕಿಂತ ಕಡಿಮೆಯಾಗುವವರೆಗೆ ಒಣಗಿಸಿ', titleTa: 'ஈரப்பதம் 14% கீழ் குறையும் வரை தார்பாயில் காயவைக்கவும்', titleTe: 'తేమ శాతం 14% కంటే తగ్గే వరకు టార్పాలిన్ పై ఎండబెట్టండి', description: 'High moisture grain rots and attracts fungal mold during storage.' }
        ]
      }
    ]
  },
  {
    id: 'crop-ragi-finger-millet',
    name: 'Ragi (Finger Millet)',
    scientificName: 'Eleusine coracana',
    nameKannada: 'ರಾಗಿ (Ragi)',
    nameTamil: 'கேழ்வரகு (Ragi)',
    nameTelugu: 'రాగులు (Ragi)',
    category: 'millet',
    idealSoilTypes: ['red', 'loamy', 'sandy', 'clay'],
    minPh: 5.0,
    maxPh: 8.0,
    waterRequirement: 'Low',
    waterMm: '350-500 mm',
    durationDays: '105-125 days',
    durationMin: 105,
    durationMax: 125,
    seasons: ['Kharif', 'Rabi'],
    minTemp: 18,
    maxTemp: 35,
    rainfallMm: '500-800 mm, highly drought resilient',
    estimatedCostPerAcre: '₹9,000 - ₹14,000',
    potentialYieldPerAcre: '14 - 20 Quintals',
    marketDemand: 'High',
    description: 'Ragi is a super-hardy, nutrient-rich climate-resilient millet ideal for red soils, rainfed areas and low-budget farmers.',
    descriptionKn: 'ರಾಗಿಯು ಅತ್ಯಂತ ಪೌಷ್ಟಿಕ, ಬರ ನಿರೋಧಕ ಕಿರುಧಾನ್ಯವಾಗಿದ್ದು, ಕೆಂಪು ಮಣ್ಣು ಮತ್ತು ಮಳೆಯಾಶ್ರಿತ ಪ್ರದೇಶಗಳಿಗೆ ಅತ್ಯಂತ ಸೂಕ್ತವಾಗಿದೆ.',
    descriptionTa: 'கேழ்வரகு சத்துக்கள் நிறைந்த, வறட்சியைத் தாங்கும் சிறுதானிய பயிராகும். செம்மண் மற்றும் மானாவாரிக்கு மிக ஏற்றது.',
    descriptionTe: 'రాగులు పోషకాలు మెండుగా ఉండే చిరుధాన్య పంట. ఎర్ర నేలలు మరియు వర్షాధార ప్రాంతాలకు అనుకూలమైనది.',
    imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&auto=format&fit=crop&q=80',
    risks: ['Heavy unseasonal rains at maturity can cause grain lodging', 'Blast disease in dense shade or high humidity'],
    benefits: ['Extremely low water requirement', 'Superfood status with consistently rising market price', 'Long shelf life (seeds can be stored for 5+ years safely)'],
    stages: [
      {
        stage: 'Land Preparation',
        stageOrder: 1,
        dayRange: 'Day 1 - 7',
        dayOffset: 1,
        title: 'Land Preparation & Manuring',
        titleKn: 'ಭೂಮಿ ಸಿದ್ಧತೆ ಮತ್ತು ಗೊಬ್ಬರ ಸೇರ್ಪಡೆ',
        titleTa: 'நிலம் தயாரிப்பு மற்றும் உரம் இடுதல்',
        titleTe: 'భూమి తయారీ మరియు ఎరువుల సమకూర్పు',
        description: 'Plough field 2 times with cultivator to create fine tilth. Incorporate 4-5 tonnes of compost.',
        descriptionKn: 'ಉಳುಮೆ ಮಾಡಿ 4-5 ಟನ್ ಕಾಂಪೋಸ್ಟ್ ಗೊಬ್ಬರ ಹಾಕಿ ಮಣ್ಣು ಹದಗೊಳಿಸಿ.',
        descriptionTa: 'நிலத்தை உழுது 4-5 டன் தொழுவுரம் கலந்து பக்குவப்படுத்தவும்.',
        descriptionTe: 'పొలాన్ని దున్ని 4-5 టన్నుల పశువుల ఎరువు వేసి నేలను సిద్ధం చేయండి.',
        category: 'preparation',
        materialsNeeded: ['Cultivator / Pair of bullocks', 'Compost / FYM (4 tonnes/acre)'],
        importantTip: 'Fine crumbly tilth is critical because finger millet seeds are very small.',
        importantTipKn: 'ರಾಗಿ ಬೀಜಗಳು ಚಿಕ್ಕದಾಗಿರುವುದರಿಂದ ಮಣ್ಣು ನುಣ್ಣಗೆ ಪುಡಿಯಾಗಿರಬೇಕು.',
        importantTipTa: 'விதைகள் மிகச் சிறியதாக இருப்பதால் மண் நன்கு மென்மையாக இருப்பது அவசியம்.',
        importantTipTe: 'రాగి విత్తనాలు చాలా చిన్నవిగా ఉంటాయి కాబట్టి నేల మెత్తగా ఉండాలి.',
        tasks: [
          { title: 'Plough the soil twice and level thoroughly', titleKn: 'ಎರಡು ಬಾರಿ ಉಳುಮೆ ಮಾಡಿ ಸಮತಟ್ಟು ಮಾಡಿ', titleTa: 'இரண்டு முறை உழுது நன்கு சமன் செய்யவும்', titleTe: 'రెండు సార్లు దున్ని చదును చేయండి', description: 'Remove dry stubble and stones.' },
          { title: 'Apply well-rotted farmyard manure', titleKn: 'ಕೊಳೆತ ತಿಪ್ಪೆ ಗೊಬ್ಬರವನ್ನು ಸಮವಾಗಿ ಹರಡಿ', titleTa: 'நன்கு மக்கிய தொழுவுரத்தை பரப்பவும்', titleTe: 'బాగా చివికిన పశువుల ఎరువు వేయండి', description: 'Improves water retention in red and sandy soils.' }
        ]
      },
      {
        stage: 'Sowing & Germination',
        stageOrder: 2,
        dayRange: 'Day 8 - 20',
        dayOffset: 8,
        title: 'Sowing / Transplanting & Early Emergence',
        titleKn: 'ಬಿತ್ತನೆ ಅಥವಾ ಸಸಿ ನಾಟಿ ಮತ್ತು ಮೊಳಕೆ',
        titleTa: 'விதைப்பு / நடவு மற்றும் முளைப்பு',
        titleTe: 'విత్తడం లేదా నాట్లు మరియు మొలకలు',
        description: 'Sow at 25x10 cm spacing or transplant 20-day seedlings. Seed rate: 3 kg/acre for transplanting, 5 kg for direct drilling.',
        descriptionKn: '25x10 ಸೆಂ.ಮೀ ಅಂತರದಲ್ಲಿ ಬಿತ್ತನೆ ಮಾಡಿ ಅಥವಾ 20 ದಿನದ ಸಸಿಗಳನ್ನು ನಾಟಿ ಮಾಡಿ.',
        descriptionTa: '25x10 செ.மீ இடைவெளியில் விதைக்கவும் அல்லது 20 நாள் நாற்றுகளை நடவும்.',
        descriptionTe: '25x10 సెం.మీ దూరంలో విత్తండి లేదా 20 రోజుల నారును నాటండి.',
        category: 'sowing',
        materialsNeeded: ['Improved Seeds (GPU 28, ML 365, MR 1)', 'Biofertilizer Azospirillum'],
        importantTip: 'Do not sow deeper than 1-2 cm. Deep sowing drastically reduces seedling emergence.',
        importantTipKn: 'ಬೀಜಗಳನ್ನು 1-2 ಸೆಂ.ಮೀ ಗಿಂತ ಆಳಕ್ಕೆ ಬಿತ್ತಬೇಡಿ.',
        importantTipTa: 'விதைகளை 1-2 செ.மீ-க்கு மேல் ஆழமாக விதைக்கக் கூடாது.',
        importantTipTe: 'విత్తనాలను 1-2 సెం.మీ కంటే లోతుగా విత్తవద్దు.',
        tasks: [
          { title: 'Treat seed with Azospirillum biofertilizer', titleKn: 'ಅಜೋಸ್ಪೈರಿಲಂ ಜೈವಿಕ ಗೊಬ್ಬರದಿಂದ ಉಪಚರಿಸಿ', titleTa: 'அசோஸ்பைரில்லம் கொண்டு விதை நேர்த்தி செய்யவும்', titleTe: 'అజోస్పైరిల్లంతో విత్తన శుద్ధి చేయండి', description: 'Enhances nitrogen fixing and early root vigor.' },
          { title: 'Sow along lines using seed drill or country plough', titleKn: 'ಸಾಲಿನಲ್ಲಿ ಬಿತ್ತನೆ ಮಾಡಿ', titleTa: 'வரிசையில் சீராக விதைக்கவும்', titleTe: 'సాలు పద్ధతిలో విత్తండి', description: 'Maintains ideal plant population of ~1.2 lakh plants per acre.' }
        ]
      },
      {
        stage: 'Vegetative Growth & Thinning',
        stageOrder: 3,
        dayRange: 'Day 21 - 45',
        dayOffset: 21,
        title: 'Intercultivation & First Top Dressing',
        titleKn: 'ಎಡೆಕುಂಟೆ ಹೊಡೆಯುವುದು ಮತ್ತು ಮೊದಲ ಗೊಬ್ಬರ',
        titleTa: 'இடை உழவு மற்றும் முதல் உரமிடுதல்',
        titleTe: 'అంతర కృషి మరియు మొదటి ఎరువులు',
        description: 'Thin out excess seedlings at day 20-25. Carry out intercultivation twice to suppress weeds and create soil mulch.',
        descriptionKn: 'ಹೆಚ್ಚುವರಿ ಸಸಿಗಳನ್ನು ಕೀಳುವ ಮೂಲಕ ಅಂತರ ಕಾಪಾಡಿ. ಎಡೆಕುಂಟೆ ಹೊಡೆಯಿರಿ.',
        descriptionTa: 'அதிகப்படியான செடிகளை கலைத்து இடைவெளி விடவும். இடை உழவு செய்யவும்.',
        descriptionTe: 'అదనపు మొక్కలను పీకి వేయండి. కలుపు కోసం అంతర కృషి చేయండి.',
        category: 'nutrient',
        materialsNeeded: ['Urea (20 kg/acre)', 'Country blade harrow / hand hoe'],
        importantTip: 'Thinning to single seedling per hill increases finger length and total grain yield by 25%.',
        importantTipKn: 'ಗುಂಡಿಗೆ ಒಂದೇ ಸಸಿ ಉಳಿಸಿದರೆ ರಾಗಿ ತೆನೆ ಉದ್ದವಾಗಿ ಬೆಳೆದು ಇಳುವರಿ ಹೆಚ್ಚುತ್ತದೆ.',
        importantTipTa: 'குத்துக்கு ஒரு செடியாக கலைத்தால் கதிர் நீண்டு விளைச்சல் 25% கூடும்.',
        importantTipTe: 'కుదురుకు ఒకే మొక్క ఉంచితే కంకి పొడవుగా పెరిగి దిగుబడి 25% పెరుగుతుంది.',
        tasks: [
          { title: 'Thin crowded seedlings to 10 cm apart', titleKn: '10 ಸೆಂ.ಮೀ ಅಂತರದಲ್ಲಿ ಹೆಚ್ಚುವರಿ ಸಸಿಗಳನ್ನು ಕಿತ್ತುಹಾಕಿ', titleTa: '10 செ.மீ இடைவெளியில் செடிகளை கலைக்கவும்', titleTe: '10 సెం.మీ దూరంలో ఒత్తు మొక్కలను తొలగించండి', description: 'Prevents resource competition.' },
          { title: 'Apply Urea top dressing after rain or irrigation', titleKn: 'ಮಳೆ ಬಂದ ನಂತರ ಯೂರಿಯಾ ಗೊಬ್ಬರ ಹಾಕಿ', titleTa: 'மழை அல்லது நீர்ப்பாசனத்திற்கு பின் யூரியா இடவும்', titleTe: 'వర్షం లేదా తడి తర్వాత యూరియా వేయండి', description: 'Apply when soil is moist, never on parched soil.' }
        ]
      },
      {
        stage: 'Flowering & Grain Filling',
        stageOrder: 4,
        dayRange: 'Day 46 - 85',
        dayOffset: 46,
        title: 'Earhead Emergence & Grain Filling',
        titleKn: 'ರಾಗಿ ತೆನೆ ಮೂಡುವಿಕೆ ಮತ್ತು ಕಾಳು ತುಂಬುವಿಕೆ',
        titleTa: 'கதிர் வெளிவருதல் மற்றும் மணி பிடித்தல்',
        titleTe: 'కంకి రావడం మరియు గింజ పాలు పోసుకోవడం',
        description: 'Earheads emerge and flower. Protect against blast disease and provide 1 protective irrigation if rainfall ceases.',
        descriptionKn: 'ತೆನೆಗಳು ಹೊರಬರುತ್ತವೆ. ರಾಗಿ ಬೆಂಕಿ ರೋಗದಿಂದ ರಕ್ಷಿಸಿ ಮತ್ತು ಮಳೆ ಇಲ್ಲದಿದ್ದರೆ ನೀರು ಹಾಯಿಸಿ.',
        descriptionTa: 'கதிர்கள் தோன்றும். குலை நோய் தாக்காமல் பாதுகாக்கவும், வறண்டால் நீர் பாய்ச்சவும்.',
        descriptionTe: 'కంకులు వస్తాయి. అగ్గి తెగులు నుండి రక్షించండి మరియు వర్షం లేకపోతే తడి ఇవ్వండి.',
        category: 'pest',
        materialsNeeded: ['Trichoderma or Mancozeb spray if blast appears', 'Light protective irrigation'],
        importantTip: 'One protective irrigation at grain filling stage doubles grain weight in rainfed belts.',
        importantTipKn: 'ಕಾಳು ತುಂಬುವ ಸಮಯದಲ್ಲಿ ಒಂದು ಬಾರಿ ನೀರು ಕೊಟ್ಟರೆ ಕಾಳು ದಪ್ಪವಾಗಿ ತೂಕ ಬರುತ್ತದೆ.',
        importantTipTa: 'மணி பிடிக்கும் சமயம் ஒரு முறை தண்ணீர் விட்டால் தானியம் நல்ல எடையுடன் இருக்கும்.',
        importantTipTe: 'గింజ పోసుకునే సమయంలో ఒక తడి ఇస్తే గింజ నాణ్యంగా మరియు బరువుగా ఉంటుంది.',
        tasks: [
          { title: 'Check lower leaves and neck of earhead for brown lesions (Blast)', titleKn: 'ತೆನೆ ಮತ್ತು ಎಲೆಗಳಲ್ಲಿ ಕಂದು ಚುಕ್ಕೆಗಳಿವೆಯೇ ಪರೀಕ್ಷಿಸಿ', titleTa: 'இலை மற்றும் கதிரில் பழுப்பு புள்ளிகள் உள்ளதா என கண்காணிக்கவும்', titleTe: 'ఆకులు మరియు కంకిపై గోధుమ రంగు మచ్చలను పరిశీలించండి', description: 'If blast lesions appear, spray Saaf (Carbendazim+Mancozeb 2g/L).' },
          { title: 'Ensure soil retains adequate moisture during grain filling', titleKn: 'ಕಾಳು ತುಂಬುವಾಗ ಮಣ್ಣಿನಲ್ಲಿ ತೇವಾಂಶವಿರಲಿ', titleTa: 'மணி பிடிக்கும் போது மண்ணில் ஈரப்பதம் இருக்க வேண்டும்', titleTe: 'గింజ పాలు పోసుకునేటప్పుడు నేలలో తేమ ఉండేలా చూడండి', description: 'Critical for plump grain development.' }
        ]
      },
      {
        stage: 'Harvesting & Threshing',
        stageOrder: 5,
        dayRange: 'Day 86 - 115',
        dayOffset: 86,
        title: 'Harvesting Earheads & Sun Drying',
        titleKn: 'ತೆನೆ ಕೊಯ್ಲು ಮತ್ತು ಒಕ್ಕಣೆ',
        titleTa: 'கதிர் அறுவடை மற்றும் உலர்த்துதல்',
        titleTe: 'కంకుల కోత మరియు ఎండబెట్టడం',
        description: 'Cut mature brown earheads when grain is hard. Sun dry for 3-4 days on threshing yard and thresh with stone roller or tractor.',
        descriptionKn: 'ತೆನೆಗಳು ಕಂದು ಬಣ್ಣಕ್ಕೆ ಬಂದಾಗ ಕುಯ್ಯಿರಿ. ಬಿಸಿಲಿನಲ್ಲಿ ಒಣಗಿಸಿ ಒಕ್ಕಣೆ ಮಾಡಿ.',
        descriptionTa: 'கதிர்கள் பழுப்பு நிறமானதும் அறுக்கவும். 3-4 நாள் வெயிலில் காயவைத்து கதிரடிக்கவும்.',
        descriptionTe: 'కంకులు గోధుమ రంగులోకి మారినప్పుడు కోయండి. 3-4 రోజులు ఎండబెట్టి నూర్పిడి చేయండి.',
        category: 'harvest',
        materialsNeeded: ['Sickles', 'Threshing yard / Tarpaulin', 'Moisture-proof bags'],
        importantTip: 'Ragi straw is premier cattle feed; harvest straw immediately after earheads and stack dry.',
        importantTipKn: 'ರಾಗಿ ಹುಲ್ಲು ಹಸುಗಳಿಗೆ ಶ್ರೇಷ್ಠ ಆಹಾರ. ತೆನೆ ಕುಯ್ದ ತಕ್ಷಣ ಹುಲ್ಲನ್ನು ಕೊಯ್ದು ಒಣಗಿಸಿ.',
        importantTipTa: 'கேழ்வரகு வைக்கோல் மாடுகளுக்கு சிறந்த தீவனம். அறுவடைக்கு பின் உடனே உலர்த்தி பாதுகாக்கவும்.',
        importantTipTe: 'రాగి గడ్డి పశువులకు శ్రేష్టమైన మేత. కంకులు కోసిన వెంటనే గడ్డిని కోసి భద్రపరచండి.',
        tasks: [
          { title: 'Harvest earheads when 90% turn earthy brown', titleKn: '90% ತೆನೆಗಳು ಕಂದು ಬಣ್ಣಕ್ಕೆ ತಿರುಗಿದಾಗ ಕೊಯ್ಲು ಮಾಡಿ', titleTa: '90% கதிர்கள் பழுப்பு நிறமானதும் அறுவடை செய்யவும்', titleTe: '90% కంకులు గోధుమ రంగులోకి మారినప్పుడు కోయండి', description: 'Leave stalks in field or cut for fodder.' },
          { title: 'Thresh, clean and dry grain to 10% moisture', titleKn: 'ಒಕ್ಕಣೆ ಮಾಡಿ ಕಾಳುಗಳನ್ನು 10% ತೇವಾಂಶಕ್ಕೆ ಒಣಗಿಸಿ', titleTa: 'கதிரடித்து தூய்மை செய்து 10% ஈரப்பதத்திற்கு காயவைக்கவும்', titleTe: 'నూర్పిడి చేసి శుభ్రం చేసి 10% తేమ వచ్చేలా ఎండబెట్టండి', description: 'Dry grains resist insect attack for several years.' }
        ]
      }
    ]
  },
  {
    id: 'crop-maize-corn',
    name: 'Maize (Corn)',
    scientificName: 'Zea mays',
    nameKannada: 'ಮೆಕ್ಕೆಜೋಳ (Maize)',
    nameTamil: 'மக்காச்சோளம் (Maize)',
    nameTelugu: 'మొక్కజొన్న (Maize)',
    category: 'cereal',
    idealSoilTypes: ['loamy', 'black', 'red'],
    minPh: 5.8,
    maxPh: 7.8,
    waterRequirement: 'Moderate',
    waterMm: '500-700 mm',
    durationDays: '95-115 days',
    durationMin: 95,
    durationMax: 115,
    seasons: ['Kharif', 'Rabi'],
    minTemp: 18,
    maxTemp: 35,
    rainfallMm: '600-900 mm or 5-6 irrigations',
    estimatedCostPerAcre: '₹14,000 - ₹20,000',
    potentialYieldPerAcre: '25 - 32 Quintals',
    marketDemand: 'Very High',
    description: 'High-yielding industrial and feed grain with strong demand from poultry, starch factories and silage.',
    descriptionKn: 'ಮೆಕ್ಕೆಜೋಳವು ಕೋಳಿ ಆಹಾರ ಮತ್ತು ಕೈಗಾರಿಕೆಗೆ ಭಾರಿ ಬೇಡಿಕೆಯಿರುವ ಬೆಳೆಯಾಗಿದ್ದು, ಗೋಡು ಮತ್ತು ಕಪ್ಪು ಮಣ್ಣಿನಲ್ಲಿ ಹೆಚ್ಚು ಇಳುವರಿ ನೀಡುತ್ತದೆ.',
    descriptionTa: 'மக்காச்சோளம் கோழித்தீவனம் மற்றும் தொழிற்சாலைகளுக்கு அதிக தேவை கொண்ட பணப்பயிராகும்.',
    descriptionTe: 'మొక్కజొన్న పౌల్ట్రీ పరిశ్రమకు మరియు స్టార్చ్ తయారీకి అధిక డిమాండ్ ఉన్న వాణిజ్య పంట.',
    imageUrl: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=800&auto=format&fit=crop&q=80',
    risks: ['Fall Armyworm (Spodoptera frugiperda) infestation in young whorls', 'Waterlogging causes rapid root rot within 48 hours'],
    benefits: ['Quick duration (under 110 days)', 'Guaranteed corporate & poultry feed buyer demand', 'Mechanized planting and harvesting available in most taluks'],
    stages: [
      {
        stage: 'Land Preparation & Sowing',
        stageOrder: 1,
        dayRange: 'Day 1 - 10',
        dayOffset: 1,
        title: 'Furrow Preparation & Sowing',
        titleKn: 'ಸಾಲು ನಿರ್ಮಾಣ ಮತ್ತು ಬಿತ್ತನೆ',
        titleTa: 'பார் அமைத்தல் மற்றும் விதைப்பு',
        titleTe: 'బోదెల తయారీ మరియు విత్తడం',
        description: 'Make ridges and furrows at 60 cm spacing. Sow seeds 4 cm deep with 20 cm plant-to-plant distance.',
        descriptionKn: '60 ಸೆಂ.ಮೀ ಅಂತರದಲ್ಲಿ ಸಾಲುಗಳನ್ನು ಮಾಡಿ, 20 ಸೆಂ.ಮೀ ಅಂತರದಲ್ಲಿ 4 ಸೆಂ.ಮೀ ಆಳಕ್ಕೆ ಬೀಜ ಬಿತ್ತಿ.',
        descriptionTa: '60 செ.மீ இடைவெளியில் பார் அமைத்து, 20 செ.மீ செடி இடைவெளியில் 4 செ.மீ ஆழத்தில் விதைக்கவும்.',
        descriptionTe: '60 సెం.మీ దూరంలో బోదెలు చేసి, 20 సెం.మీ దూరంలో 4 సెం.మీ లోతులో విత్తండి.',
        category: 'sowing',
        materialsNeeded: ['Hybrid Seeds (NK 6240, DKC 9108, CP 818) - 7-8 kg/acre', 'Furrow Ridger'],
        importantTip: 'Never sow maize in flat waterlogged ground; ridges prevent root rotting during cloudbursts.',
        importantTipKn: 'ನೀರು ನಿಲ್ಲುವ ಸಮತಟ್ಟಾದ ಜಾಗದಲ್ಲಿ ಬಿತ್ತಬೇಡಿ; ಸಾಲು-ಬದುಗಳಲ್ಲಿ ಬಿತ್ತಿದರೆ ಬೇರು ಕೊಳೆಯುವುದಿಲ್ಲ.',
        importantTipTa: 'தண்ணீர் தேங்கும் தரைமட்டத்தில் விதைக்காதீர்கள்; பார் அமைத்து விதைத்தால் வேரழுகல் வராது.',
        importantTipTe: 'నీరు నిలిచే చదునైన నేలలో విత్తవద్దు; బోదెలపై విత్తితే వేరు కుళ్లు తెగులు రాదు.',
        tasks: [
          { title: 'Form ridges and furrows at 60 cm distance', titleKn: '60 ಸೆಂ.ಮೀ ಅಂತರದಲ್ಲಿ ಸಾಲು-ಬದುಗಳನ್ನು ಮಾಡಿ', titleTa: '60 செ.மீ இடைவெளியில் பார் மற்றும் வாய்க்கால் அமைக்கவும்', titleTe: '60 సెం.మీ దూరంలో బోదెలు మరియు కాలువలు చేయండి', description: 'Ridge planting facilitates easy irrigation and saves water.' },
          { title: 'Dibble 1 seed per hole at 20 cm spacing', titleKn: '20 ಸೆಂ.ಮೀ ಅಂತರದಲ್ಲಿ ಪ್ರತಿ ಗುಂಡಿಗೆ 1 ಬೀಜ ಊರಿ', titleTa: '20 செ.மீ இடைவெளியில் ஒரு குழிக்கு ஒரு விதை நடவும்', titleTe: '20 సెం.మీ దూరంలో గుంతకు ఒక విత్తనం నాటండి', description: 'Ensures optimal 33,000 plants per acre.' }
        ]
      },
      {
        stage: 'Vegetative & Pest Vigilance',
        stageOrder: 2,
        dayRange: 'Day 11 - 35',
        dayOffset: 11,
        title: 'Fall Armyworm Defense & First Fertilizer',
        titleKn: 'ಲದ್ದಿ ಹುಳು (Fall Armyworm) ನಿಯಂತ್ರಣ ಮತ್ತು ಗೊಬ್ಬರ',
        titleTa: 'படைப்புழு கட்டுப்பாடு மற்றும் முதல் உரம்',
        titleTe: 'కత్తెర పురుగు నివారణ మరియు మొదటి ఎరువులు',
        description: 'Crucial stage for Fall Armyworm defense. Inspect plant whorls for pin-hole leaf damage and apply top dressing.',
        descriptionKn: 'ಸುಳಿಗಳಲ್ಲಿ ರಂಧ್ರಗಳಿವೆಯೇ ಗಮನಿಸಿ. ಲದ್ದಿ ಹುಳು ನಿಯಂತ್ರಣಕ್ಕೆ ಮುನ್ನೆಚ್ಚರಿಕೆ ವಹಿಸಿ ಮತ್ತು ಯೂರಿಯಾ ಹಾಕಿ.',
        descriptionTa: 'சுருள் இலைகளில் துளைகள் உள்ளதா என பார்க்கவும். படைப்புழுவை கட்டுப்படுத்தி யூரியா இடவும்.',
        descriptionTe: 'సుడిలో రంధ్రాలు ఉన్నాయేమో చూడండి. కత్తెర పురుగును అరికట్టి యూరియా వేయండి.',
        category: 'pest',
        materialsNeeded: ['Emamectin Benzoate (0.4g/L) or Sand+Lime mixture in whorl', 'Urea (35 kg/acre)'],
        importantTip: 'Drop small pinch of dry sand mixed with neem cake into whorls to physically deter armyworm larvae naturally.',
        importantTipKn: 'ಸುಳಿಯೊಳಗೆ ಬೇವಿನ ಹಿಂಡಿ ಬೆರೆಸಿದ ಮರಳನ್ನು ಚಿಟಿಕೆ ಹಾಕಿದರೆ ಲದ್ದಿ ಹುಳು ನೈಸರ್ಗಿಕವಾಗಿ ದೂರವಾಗುತ್ತದೆ.',
        importantTipTa: 'வேப்பம்பிண்ணாக்கு கலந்த மணலை சுருள் இலையில் போட்டால் படைப்புழு இயல்பாக அழியும்.',
        importantTipTe: 'వేప పిండి కలిపిన ఇసుకను సుడిలో వేస్తే కత్తెర పురుగు సహజంగా నివారించబడుతుంది.',
        tasks: [
          { title: 'Inspect young whorls every 3 days for sawdust-like frass', titleKn: 'ಸುಳಿಯೊಳಗೆ ಮರದ ಪುಡಿಯಂತಹ ಮಲವಿದೆಯೇ ಪರೀಕ್ಷಿಸಿ', titleTa: 'சுருள் இலையில் மரத்தூள் போன்ற புழு எச்சம் உள்ளதா என கண்காணிக்கவும்', titleTe: 'సుడిలో రంపపు పొట్టు లాంటి పురుగు విసర్జనను గమనించండి', description: 'Early detection allows safe non-chemical spot intervention.' },
          { title: 'Apply Urea (35 kg) and earthing up along rows', titleKn: 'ಯೂರಿಯಾ ಹಾಕಿ ಸಸಿಗಳ ಬುಡಕ್ಕೆ ಮಣ್ಣು ಏರಿಸಿ', titleTa: 'யூரியா இட்டு செடியின் அடிப்பகுதியில் மண் அணைக்கவும்', titleTe: 'యూరియా వేసి మొక్కల మొదళ్లకు మట్టిని ఎగదోయండి', description: 'Earthing up prevents wind lodging and covers roots.' }
        ]
      },
      {
        stage: 'Tasseling, Silking & Cob Filling',
        stageOrder: 3,
        dayRange: 'Day 36 - 75',
        dayOffset: 36,
        title: 'Tasseling & Cob Formation',
        titleKn: 'ತೆನೆ ಹೂವು ಮತ್ತು ಕಾಳು ಕಟ್ಟುವುದು',
        titleTa: 'ஆண் பூ (மஞ்சரி) மற்றும் கதிர் உருவாக்கம்',
        titleTe: 'పూత మరియు కండె పాలు పోసుకునే దశ',
        description: 'Tassels emerge at top and silks emerge on cobs. Any drought at this stage leads to poor grain setting.',
        descriptionKn: 'ತೆನೆ ಹೂವುಗಳು ಬರುತ್ತವೆ. ಈ ಹಂತದಲ್ಲಿ ನೀರಿನ ಕೊರತೆಯಾಗದಂತೆ ನಿಗಾ ವಹಿಸಿ.',
        descriptionTa: 'பூ பூக்கும் மற்றும் கதிரில் பால் பிடிக்கும் பருவம். நீர் பற்றாக்குறை இருக்கக் கூடாது.',
        descriptionTe: 'పూత మరియు కండెలు ఏర్పడతాయి. ఈ సమయంలో నీటి ఎద్దడి లేకుండా చూడండి.',
        category: 'irrigation',
        materialsNeeded: ['Potash (MOP 20 kg/acre)', 'Irrigation water'],
        importantTip: 'Moisture stress during 10 days of silking reduces cob grain fill by up to 40%.',
        importantTipKn: 'ಹೂಬಿಡುವ 10 ದಿನಗಳಲ್ಲಿ ನೀರಿಲ್ಲದಿದ್ದರೆ ಕಾಳು ಕಟ್ಟುವುದಿಲ್ಲ.',
        importantTipTa: 'பூக்கும் 10 நாட்களில் வறட்சி ஏற்பட்டால் கதிரில் மணி பிடிக்காமல் போகும்.',
        importantTipTe: 'పూత సమయంలో 10 రోజులు నీరు లేకపోతే కండెల్లో గింజ సరిగ్గా నిండదు.',
        tasks: [
          { title: 'Irrigate thoroughly when silk emerges', titleKn: 'ತೆನೆ ರೇಷ್ಮೆ ದಾರ ಹೊರಬಂದಾಗ ಸಮೃದ್ಧವಾಗಿ ನೀರುಣಿಸಿ', titleTa: 'கதிரில் நார் போன்ற பூ வரும் போது நன்கு நீர் பாய்ச்சவும்', titleTe: 'కండెకు పీచు వచ్చే సమయంలో సమృద్ధిగా నీరు పెట్టండి', description: 'Supports pollen germination on silks.' },
          { title: 'Apply final top dressing of Potash', titleKn: 'ಕೊನೆಯ ಕಂತಿನ ಪೊಟ್ಯಾಷ್ ಗೊಬ್ಬರ ನೀಡಿ', titleTa: 'கடைசி முறை பொட்டாஷ் உரமிடவும்', titleTe: 'చివరి విడత పొటాష్ ఎరువు వేయండి', description: 'Improves grain weight and test weight.' }
        ]
      },
      {
        stage: 'Harvesting & Shelling',
        stageOrder: 4,
        dayRange: 'Day 76 - 105',
        dayOffset: 76,
        title: 'Cob Harvesting & Threshing',
        titleKn: 'ತೆನೆ ಕೊಯ್ಲು ಮತ್ತು ಬಿಡಿಸುವಿಕೆ',
        titleTa: 'கதிர் அறுவடை மற்றும் மணிகளை பிரித்தல்',
        titleTe: 'కంకి కోత మరియు గింజలు వేరు చేయడం',
        description: 'Harvest cobs when outer sheath turns papery white and black layer appears at base of kernel.',
        descriptionKn: 'ತೆನೆಯ ಸಿಪ್ಪೆ ಬಿಳಿಯಾಗಿ ಒಣಗಿದಾಗ ಕೊಯ್ಲು ಮಾಡಿ. ಕಾಳಿನ ಬುಡದಲ್ಲಿ ಕಪ್ಪು ಗೆರೆ ಬರುತ್ತದೆ.',
        descriptionTa: 'கதிர் உறை உலர்ந்து வெளுத்ததும், தானிய அடிப்பகுதியில் கருப்பு வளையம் வந்ததும் அறுக்கவும்.',
        descriptionTe: 'కండె పొట్టు ఎండి తెల్లగా మారినప్పుడు, గింజ మొదట్లో నల్లని చుక్క వచ్చినప్పుడు కోయండి.',
        category: 'harvest',
        materialsNeeded: ['Cob plucker / Harvester', 'Maize Sheller machine', 'Moisture meter'],
        importantTip: 'Dry shelled corn to 12% moisture before bagging; wet corn develops toxic aflatoxin mold.',
        importantTipKn: 'ಕಾಳುಗಳನ್ನು ಚೀಲಕ್ಕೆ ತುಂಬುವ ಮುನ್ನ 12% ತೇವಾಂಶಕ್ಕೆ ಒಣಗಿಸಿ.',
        importantTipTa: 'தானியங்களை 12% ஈரப்பதத்திற்கு நன்கு காயவைத்து பின் சேமிக்கவும்.',
        importantTipTe: 'గింజలను సంచుల్లో నింపే ముందు 12% తేమ వచ్చే వరకు బాగా ఎండబెట్టండి.',
        tasks: [
          { title: 'De-husk and harvest cobs in dry weather', titleKn: 'ಒಣ ಹವೆಯಲ್ಲಿ ತೆನೆಗಳನ್ನು ಬಿಡಿಸಿ ಕೊಯ್ಲು ಮಾಡಿ', titleTa: 'நல்ல வெயில் நாளில் கதிர்களை பறித்து உரிக்கவும்', titleTe: 'పొడి వాతావరణంలో కండెలను కోసి తొక్క తీయండి', description: 'Discard diseased or moldy cobs.' },
          { title: 'Run cobs through mechanical sheller and dry', titleKn: 'ಯಂತ್ರದ ಮೂಲಕ ಕಾಳು ಬಿಡಿಸಿ ಬಿಸಿಲಲ್ಲಿ ಒಣಗಿಸಿ', titleTa: 'இயந்திரம் மூலம் மணிகளை பிரித்து வெயிலில் உலர்த்தவும்', titleTe: 'షెల్లర్ మెషీన్ ద్వారా గింజలను వేరు చేసి ఎండబెట్టండి', description: 'Prevents insect pest reproduction in warehouse.' }
        ]
      }
    ]
  },
  {
    id: 'crop-groundnut-peanut',
    name: 'Groundnut (Peanut)',
    scientificName: 'Arachis hypogaea',
    nameKannada: 'ಕಡಲೆಕಾಯಿ (Groundnut)',
    nameTamil: 'நிலக்கடலை (Groundnut)',
    nameTelugu: 'వేరుశనగ (Groundnut)',
    category: 'oilseed',
    idealSoilTypes: ['sandy', 'red', 'loamy'],
    minPh: 5.5,
    maxPh: 7.5,
    waterRequirement: 'Moderate',
    waterMm: '400-550 mm',
    durationDays: '100-115 days',
    durationMin: 100,
    durationMax: 115,
    seasons: ['Kharif', 'Rabi'],
    minTemp: 20,
    maxTemp: 34,
    rainfallMm: '500-700 mm, drought-hardy legume',
    estimatedCostPerAcre: '₹15,000 - ₹21,000',
    potentialYieldPerAcre: '12 - 16 Quintals pods',
    marketDemand: 'High',
    description: 'Premier oilseed and cash crop that enriches soil through atmospheric nitrogen fixation; thrives in loose sandy and red soils.',
    descriptionKn: 'ಕಡಲೆಕಾಯಿಯು ಮಣ್ಣಿನ ಫಲವತ್ತತೆ ಹೆಚ್ಚಿಸುವ ಎಣ್ಣೆಕಾಳು ಬೆಳೆಯಾಗಿದ್ದು, ಕೆಂಪು ಮತ್ತು ಮರಳು ಮಿಶ್ರಿತ ಗೋಡು ಮಣ್ಣಿಗೆ ಹೇಳಿಮಾಡಿಸಿದ ಬೆಳೆ.',
    descriptionTa: 'நிலக்கடலை மண்ணை வளப்படுத்தும் முக்கிய எண்ணெய் வித்து பயிராகும். செம்மண் மற்றும் மணற்பாங்கான நிலத்தில் அமோக விளைச்சல் தரும்.',
    descriptionTe: 'వేరుశనగ నేల సారాన్ని పెంచే ప్రధాన నూనెగింజల పంట. ఎర్ర మరియు ఇసుక నేలల్లో అత్యధిక దిగుబడినిస్తుంది.',
    imageUrl: 'https://images.unsplash.com/photo-1567894340315-735d7c361db0?w=800&auto=format&fit=crop&q=80',
    risks: ['Tikka leaf spot disease during late vegetative stage', 'Hard soil compaction stops underground peg penetration', 'Pod borer insects in moist soils'],
    benefits: ['Fixes 40-50 kg atmospheric Nitrogen/acre naturally', 'Ready local market for oil mills and roasted snacks', 'Foliage makes nutritious protein-rich cattle fodder'],
    stages: [
      {
        stage: 'Soil Preparation & Sowing',
        stageOrder: 1,
        dayRange: 'Day 1 - 10',
        dayOffset: 1,
        title: 'Deep Tilth & Pod Sowing',
        titleKn: 'ಮಣ್ಣು ಸಡಿಲಗೊಳಿಸುವಿಕೆ ಮತ್ತು ಬೀಜ ಬಿತ್ತನೆ',
        titleTa: 'ஆழ உழவு மற்றும் விதைப்பு',
        titleTe: 'నేల గుల్ల చేయడం మరియు విత్తడం',
        description: 'Plough field to loose crumbly tilth so pods can easily penetrate. Treat bold seeds with Rhizobium culture.',
        descriptionKn: 'ಕಾಯಿಗಳು ಸುಲಭವಾಗಿ ಮಣ್ಣಿನಲ್ಲಿ ಇಳಿಯಲು ಮಣ್ಣನ್ನು ಮೃದುವಾಗಿಸಿ. ರೈಜೋಬಿಯಂನಿಂದ ಬೀಜೋಪಚಾರ ಮಾಡಿ.',
        descriptionTa: 'விழுதுகள் எளிதாக மண்ணில் இறங்க நிலத்தை மிருதுவாக உழவும். ரைசோபியம் கொண்டு விதை நேர்த்தி செய்யவும்.',
        descriptionTe: 'ఊడలు సులభంగా నేలలోకి దిగేలా మట్టిని మెత్తగా చేయండి. రైజోబియంతో విత్తన శుద్ధి చేయండి.',
        category: 'sowing',
        materialsNeeded: ['Quality Kernel Seed (40-45 kg/acre) - TMV 2, K6, JL 24', 'Rhizobium + Trichoderma culture', 'Gypsum (200 kg/acre)'],
        importantTip: 'Loose soil is essential: if the soil is hard or rocky, pegs cannot enter and no pods will form.',
        importantTipKn: 'ಮಣ್ಣು ಸಡಿಲವಾಗಿರದಿದ್ದರೆ ಕಡಲೆಕಾಯಿ ಸೂಜಿಗಳು ಮಣ್ಣಿನಲ್ಲಿ ಇಳಿಯದೆ ಕಾಯಿ ಕಟ್ಟುವುದಿಲ್ಲ.',
        importantTipTa: 'மண் தளர்வாக இல்லாவிட்டால் விழுதுகள் உள்ளே இறங்காமல் காய் பிடிக்காது.',
        importantTipTe: 'నేల గుల్లగా లేకపోతే ఊడలు లోపలికి దిగక కాయలు కట్టవు.',
        tasks: [
          { title: 'Plough 2-3 times to create friable, loose topsoil', titleKn: 'ಮಣ್ಣನ್ನು ಮೃದುವಾಗಿ ಮಾಡಲು 2-3 ಬಾರಿ ಉಳುಮೆ ಮಾಡಿ', titleTa: 'மண் பொலபொலப்பாக 2-3 முறை உழவும்', titleTe: 'నేల మెత్తగా అయ్యేలా 2-3 సార్లు దున్నండి', description: 'Breaks hard surface crusts.' },
          { title: 'Sow at 30x10 cm spacing at 4-5 cm depth', titleKn: '30x10 ಸೆಂ.ಮೀ ಅಂತರದಲ್ಲಿ ಬಿತ್ತನೆ ಮಾಡಿ', titleTa: '30x10 செ.மீ இடைவெளியில் விதைக்கவும்', titleTe: '30x10 సెం.మీ దూరంలో విత్తండి', description: 'Cover lightly with loose soil.' }
        ]
      },
      {
        stage: 'Pegging & Gypsum Application',
        stageOrder: 2,
        dayRange: 'Day 35 - 50',
        dayOffset: 35,
        title: 'Flowering, Pegging & Gypsum Booster',
        titleKn: 'ಹೂಬಿಡುವಿಕೆ, ಸೂಜಿ ಇಳಿಯುವಿಕೆ ಮತ್ತು ಜಿಪ್ಸಮ್ ಹಾಕುವುದು',
        titleTa: 'பூ பூத்தல், விழுது இறங்குதல் மற்றும் ஜிப்சம் இடுதல்',
        titleTe: 'పూత, ఊడలు దిగడం మరియు జిప్సం వేయడం',
        description: 'Yellow flowers emerge and produce sharp downward pegs into soil. Apply Gypsum at 40-45 days.',
        descriptionKn: 'ಹಳದಿ ಹೂಗಳು ಬಂದು ಸೂಜಿಗಳು ಮಣ್ಣಿಗೆ ಇಳಿಯುತ್ತವೆ. 40-45 ದಿನಗಳಲ್ಲಿ ಜಿಪ್ಸಮ್ ಗೊಬ್ಬರ ಹಾಕಿ.',
        descriptionTa: 'மஞ்சள் பூக்கள் பூத்து விழுதுகள் மண்ணில் இறங்கும். 40-45 ஆம் நாளில் ஜிப்சம் இடவும்.',
        descriptionTe: 'పసుపు పూలు పూసి ఊడలు నేలలోకి దిగుతాయి. 40-45 రోజులలో జిప్సం వేయండి.',
        category: 'nutrient',
        materialsNeeded: ['Gypsum (200 kg/acre)', 'Hand weeder (before pegging only)'],
        importantTip: 'Never disturb soil with hoes or weeders once pegging starts, as it severs young developing underground pods.',
        importantTipKn: 'ಸೂಜಿ ಇಳಿಯಲು ಶುರುವಾದ ನಂತರ ಯಾವುದೇ ಕಾರಣಕ್ಕೂ ಎಡೆಕುಂಟೆ ಹೊಡೆಯಬೇಡಿ.',
        importantTipTa: 'விழுது இறங்கத் தொடங்கிய பின் எக்காரணம் கொண்டும் களையெடுக்கக் கூடாது.',
        importantTipTe: 'ఊడలు దిగే సమయంలో ఎట్టి పరిస్థితుల్లోనూ కలుపు తీయడం లేదా దున్నడం చేయవద్దు.',
        tasks: [
          { title: 'Broadcast Gypsum (200 kg/acre) close to plant root zone', titleKn: 'ಗಿಡದ ಬುಡಕ್ಕೆ 200 ಕೆಜಿ ಜಿಪ್ಸಮ್ ಹಾಕಿ ಮಣ್ಣು ಮುಚ್ಚಿ', titleTa: 'செடியின் வேர்ப்பகுதியில் 200 கிலோ ஜிப்சம் இடவும்', titleTe: 'మొక్కల మొదళ్ల వద్ద 200 కిలోల జిప్సం వేయండి', description: 'Calcium in Gypsum prevents hollow "pops" empty pods.' },
          { title: 'Light irrigation to dissolve Gypsum into root zone', titleKn: 'ಜಿಪ್ಸಮ್ ಕರಗಲು ಹಗುರ ನೀರು ಹಾಯಿಸಿ', titleTa: 'ஜிப்சம் கரைய மிதமாக நீர் பாய்ச்சவும்', titleTe: 'జిప్సం కరగడానికి తేలికపాటి తడి ఇవ్వండి', description: 'Ensures plump, heavy, oil-dense kernels.' }
        ]
      },
      {
        stage: 'Pod Maturation & Harvest',
        stageOrder: 3,
        dayRange: 'Day 80 - 110',
        dayOffset: 80,
        title: 'Pod Maturity Testing & Pulling',
        titleKn: 'ಕಾಯಿ ಮಾಗುವಿಕೆ ಪರೀಕ್ಷೆ ಮತ್ತು ಕೀಳುವಿಕೆ',
        titleTa: 'காய் முதிர்ச்சி சோதனை மற்றும் அறுவடை',
        titleTe: 'కాయ ముదురుట పరీక్ష మరియు పీకడం',
        description: 'Check maturity by opening pods: inner shell turns dark brownish black. Irrigate lightly 2 days before pulling.',
        descriptionKn: 'ಸಿಪ್ಪೆಯ ಒಳಗಿನ ಪದರ ಕಪ್ಪಾದಾಗ ಕಾಯಿ ಪಕ್ವವಾಗಿದೆ ಎಂದರ್ಥ. ಕೀಳುವ 2 ದಿನ ಮುನ್ನ ಹಗುರ ನೀರು ಹಾಯಿಸಿ.',
        descriptionTa: 'தோலின் உட்பகுதி கருமையானால் காய் முற்றிவிட்டது. செடியை பிடுங்குவதற்கு 2 நாள் முன் லேசாக நீர் பாய்ச்சவும்.',
        descriptionTe: 'కాయ లోపలి పొర నల్లగా మారితే కాయ ముదిరినట్లు. పీకే 2 రోజుల ముందు తేలికగా తడి ఇవ్వండి.',
        category: 'harvest',
        materialsNeeded: ['Groundnut pod stripper', 'Drying yard / Canvas'],
        importantTip: 'Give a light irrigation 2 days prior to harvest; pulling plants from dry hard soil breaks 30% of pods underground.',
        importantTipKn: 'ಕೀಳುವ 2 ದಿನ ಮುಂಚೆ ಲಘು ನೀರು ಕೊಟ್ಟರೆ ಕಾಯಿಗಳು ಮಣ್ಣಿನಲ್ಲಿ ಕಳಚಿಕೊಳ್ಳದೆ ಗಿಡದೊಂದಿಗೆ ಬರುತ್ತವೆ.',
        importantTipTa: 'அறுவடைக்கு 2 நாள் முன் தண்ணீர் விட்டால் காய்கள் மண்ணில் அறுந்து போகாமல் செடியோடு வரும்.',
        importantTipTe: 'పీకడానికి 2 రోజుల ముందు తేలికపాటి తడి ఇస్తే కాయలు తెగిపోకుండా మొక్కతో పాటు వస్తాయి.',
        tasks: [
          { title: 'Pull sample plants and inspect inner shell color', titleKn: 'ಮಾದರಿ ಗಿಡಗಳನ್ನು ಕಿತ್ತು ಒಳಗಿನ ಕಪ್ಪು ಬಣ್ಣವನ್ನು ಪರೀಕ್ಷಿಸಿ', titleTa: 'மாதிரி செடியை பிடுங்கி உள் தோலின் நிறத்தை பார்க்கவும்', titleTe: 'కొన్ని మొక్కలను పీకి లోపలి భాగాన్ని పరిశీలించండి', description: 'Harvest when 75-80% pods show dark veins.' },
          { title: 'Uproot plants and strip pods using stripper frame', titleKn: 'ಗಿಡಗಳನ್ನು ಕಿತ್ತು ಕಾಯಿಗಳನ್ನು ಬೇರ್ಪಡಿಸಿ', titleTa: 'செடிகளை பிடுங்கி காய்களை பிரிக்கவும்', titleTe: 'మొక్కలను పీకి కాయలను వేరు చేయండి', description: 'Sun-dry pods for 5-7 days until pods rattle when shaken.' }
        ]
      }
    ]
  },
  {
    id: 'crop-tomato-vegetable',
    name: 'Tomato',
    scientificName: 'Solanum lycopersicum',
    nameKannada: 'ಟೊಮೆಟೊ (Tomato)',
    nameTamil: 'தக்காளி (Tomato)',
    nameTelugu: 'టమోటా (Tomato)',
    category: 'vegetable',
    idealSoilTypes: ['red', 'loamy', 'black'],
    minPh: 6.0,
    maxPh: 7.0,
    waterRequirement: 'Moderate',
    waterMm: '400-600 mm (Drip ideal)',
    durationDays: '110-135 days',
    durationMin: 110,
    durationMax: 135,
    seasons: ['Kharif', 'Rabi', 'Zaid'],
    minTemp: 16,
    maxTemp: 32,
    rainfallMm: '500-800 mm with drip irrigation',
    estimatedCostPerAcre: '₹28,000 - ₹40,000',
    potentialYieldPerAcre: '180 - 250 Quintals',
    marketDemand: 'Very High',
    description: 'High-value commercial vegetable crop with continuous weekly harvesting; performs best with drip irrigation and staking support.',
    descriptionKn: 'ವಾರಕ್ಕೊಮ್ಮೆ ನಿರಂತರ ಆದಾಯ ನೀಡುವ ಜನಪ್ರಿಯ ತರಕಾರಿ ಬೆಳೆಯಾಗಿದ್ದು, ಹನಿ ನೀರಾವರಿ ಮತ್ತು ಕಡ್ಡಿ ಕಟ್ಟುವ ಪದ್ಧತಿಯಲ್ಲಿ ಭರ್ಜರಿ ಇಳುವರಿ ಸಿಗುತ್ತದೆ.',
    descriptionTa: 'தொடர் வருமானம் தரும் முக்கிய காய்கறிப் பயிராகும். சொட்டு நீர் பாசனம் மற்றும் கம்பு ஊன்றி கட்டுதல் மூலம் அதிக லாபம் பெறலாம்.',
    descriptionTe: 'వారానికోసారి నిరంతర ఆదాయాన్నిచ్చే వాణిజ్య కూరగాయ పంట. డ్రిప్ మరియు కర్రలు కట్టే పద్ధతిలో అత్యధిక దిగుబడి లభిస్తుంది.',
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80',
    risks: ['Early blight & Late blight during rainy spells', 'Price volatility in APMC wholesale mandis', 'Whitefly transmitting Leaf Curl Virus'],
    benefits: ['Harvest every 3-4 days for 6-8 continuous weeks', 'High net returns when market prices peak', 'Ideal for micro-irrigation and fertigation'],
    stages: [
      {
        stage: 'Transplanting & Staking',
        stageOrder: 1,
        dayRange: 'Day 1 - 25',
        dayOffset: 1,
        title: 'Raised Bed Transplanting & Bamboo Staking',
        titleKn: 'ಏರು ಮಡಿ ನಾಟಿ ಮತ್ತು ಬಿದಿರು ಕಡ್ಡಿ ಆಧಾರ',
        titleTa: 'மேட்டுப்பாத்தி நடவு மற்றும் குச்சி கட்டுதல்',
        titleTe: 'ఎత్తైన మడుల్లో నాట్లు మరియు కర్రల ఆసరా',
        description: 'Plant 25-day seedlings on raised beds covered with silver-black mulch. Install drip lines and bamboo support.',
        descriptionKn: 'ಏರು ಮಡಿಗಳಲ್ಲಿ 25 ದಿನದ ಸಸಿಗಳನ್ನು ನಾಟಿ ಮಾಡಿ. ಬಿದಿರಿನ ಕಡ್ಡಿಗಳಿಂದ ಗಿಡಗಳಿಗೆ ಆಧಾರ ಕೊಡಿ.',
        descriptionTa: 'மேட்டுப்பாத்தியில் 25 நாள் நாற்றுகளை நடவும். மூங்கில் குச்சிகள் நட்டு செடிகளை கட்டவும்.',
        descriptionTe: 'ఎత్తైన మడులపై 25 రోజుల నారును నాటండి. వెదురు కర్రలతో మొక్కలకు ఆసరా కల్పించండి.',
        category: 'sowing',
        materialsNeeded: ['Hybrid Seedlings (Shivam, Abhinav, Saaho)', 'Bamboo poles & jute twine', 'Mulching sheet & drip lateral'],
        importantTip: 'Staking keeps fruits elevated off moist soil, preventing 80% of fruit borer and fungal fruit rot losses.',
        importantTipKn: 'ಕಡ್ಡಿ ಕಟ್ಟಿ ಗಿಡಗಳನ್ನು ಮೇಲಕ್ಕೆ ನಿಲ್ಲಿಸಿದರೆ ಹಣ್ಣುಗಳು ಕೊಳೆಯುವುದಿಲ್ಲ.',
        importantTipTa: 'குச்சி நட்டு செடிகளை கட்டி மேலே ஏற்றினால் பழங்கள் அழுகாமல் இருக்கும்.',
        importantTipTe: 'కర్రలు కట్టి మొక్కలను పైకి లేపితే కాయలు మట్టికి తగలకుండా కుళ్ళిపోవు.',
        tasks: [
          { title: 'Form raised beds (90 cm width, 30 cm height)', titleKn: '90 ಸೆಂ.ಮೀ ಅಗಲದ ಏರುಮಡಿ ನಿರ್ಮಿಸಿ', titleTa: '90 செ.மீ அகலத்தில் மேட்டுப்பாத்தி அமைக்கவும்', titleTe: '90 సెం.మీ వెడల్పుతో ఎత్తైన మడులను చేయండి', description: 'Prevents water stagnating near stem collars.' },
          { title: 'Erect bamboo stakes and tie primary vines', titleKn: 'ಬಿದಿರು ಕಡ್ಡಿಗಳನ್ನು ನೆಟ್ಟು ಗಿಡವನ್ನು ಕಟ್ಟಿ', titleTa: 'மூங்கில் குச்சிகளை நட்டு கயிறால் கட்டவும்', titleTe: 'వెదురు కర్రలు పాతి తాడుతో మొక్కను కట్టండి', description: 'Ensures maximum sunlight exposure and easy pesticide spraying.' }
        ]
      },
      {
        stage: 'Flowering & Fruit Setting',
        stageOrder: 2,
        dayRange: 'Day 26 - 60',
        dayOffset: 26,
        title: 'Fertigation & Fruit Borer Management',
        titleKn: 'ಹನಿ ನೀರಾವರಿ ಗೊಬ್ಬರ ಮತ್ತು ಕಾಯಿ ಕೊರೆಯುವ ಹುಳು ನಿರ್ವಹಣೆ',
        titleTa: 'சொட்டுநீர் உரமிடுதல் மற்றும் காய்ப்புழு கட்டுப்பாடு',
        titleTe: 'డ్రిప్ ద్వారా ఎరువులు మరియు కాయ తొలుచు పురుగు నివారణ',
        description: 'Apply water-soluble 19:19:19 and 13:0:45 fertilizers via drip. Install yellow sticky traps for whiteflies.',
        descriptionKn: 'ಹನಿ ನೀರಾವರಿ ಮೂಲಕ ಕರಗುವ ಗೊಬ್ಬರಗಳನ್ನು ನೀಡಿ. ಬಿಳಿ ನೊಣ ನಿಯಂತ್ರಣಕ್ಕೆ ಹಳದಿ ಜಿಗುಟು ಬಲೆಗಳನ್ನು ಹಾಕಿ.',
        descriptionTa: 'சொட்டுநீர் வழியே நீரில் கரையும் உரங்களை இடவும். வெள்ளை ஈக்களை பிடிக்க மஞ்சள் ஒட்டும் பொறி வைக்கவும்.',
        descriptionTe: 'డ్రిప్ ద్వారా నీటిలో కరిగే ఎరువులను అందించండి. తెల్లదోమ నివారణకు పసుపు రంగు జిగురు అట్టలను అమర్చండి.',
        category: 'nutrient',
        materialsNeeded: ['19:19:19 Water Soluble Fertilizer', 'Yellow Sticky Traps (10/acre)', 'Calcium Nitrate + Boron foliar spray'],
        importantTip: 'Spray Boron (1g/L) during flowering to eliminate flower drop and prevent fruit cracking.',
        importantTipKn: 'ಹೂವು ಉದುರುವುದನ್ನು ತಡೆಯಲು ಬೋರಾನ್ ಸಿಂಪಡಿಸಿ.',
        importantTipTa: 'பூ உதிர்வதை தடுக்க போரான் தெளிக்கவும்.',
        importantTipTe: 'పూత రాలకుండా ఉండేందుకు బోరాన్ పిచికారీ చేయండి.',
        tasks: [
          { title: 'Apply fertigation schedule 2 times per week', titleKn: 'ವಾರಕ್ಕೆ ಎರಡು ಬಾರಿ ಕರಗುವ ಗೊಬ್ಬರ ನೀಡಿ', titleTa: 'வாரத்திற்கு இருமுறை சொட்டுநீர் உரம் இடவும்', titleTe: 'వారానికి రెండు సార్లు డ్రిప్ ద్వారా ఎరువులు ఇవ్వండి', description: 'Consistent nutrients produce firm fleshy fruits.' },
          { title: 'Install pheromone traps for Helicoverpa fruit borer', titleKn: 'ಕಾಯಿ ಕೊರೆಯುವ ಹುಳುವಿಗೆ ಮೋಹಕ ಬಲೆ ಹಾಕಿ', titleTa: 'காய்ப்புழுவுக்கு இனக்கவர்ச்சி பொறி வைக்கவும்', titleTe: 'కాయ తొలుచు పురుగు కోసం లింగాకర్షక బుట్టలు పెట్టండి', description: '5 traps per acre give warning before caterpillar entry.' }
        ]
      },
      {
        stage: 'Harvesting & Grading',
        stageOrder: 3,
        dayRange: 'Day 61 - 120',
        dayOffset: 61,
        title: 'Multiple Pickings & Market Grading',
        titleKn: 'ಹಣ್ಣು ಕೊಯ್ಲು ಮತ್ತು ವರ್ಗೀಕರಣ',
        titleTa: 'பழம் பறித்தல் மற்றும் தரம் பிரித்தல்',
        titleTe: 'కాయల కోత మరియు గ్రేడింగ్',
        description: 'Pick fruits at "breaker stage" (pink tinge on bottom) for distant transport, or ripe red for local markets.',
        descriptionKn: 'ದೂರದ ಮಾರುಕಟ್ಟೆಗೆ ಗುಲಾಬಿ ಬಣ್ಣವಿರುವಾಗ, ಸ್ಥಳೀಯ ಮಾರುಕಟ್ಟೆಗೆ ಕೆಂಪಾದಾಗ ಕೊಯ್ಲು ಮಾಡಿ.',
        descriptionTa: 'தொலைதூர சந்தைக்கு வெளிர் சிவப்பு நிறத்திலும், உள்ளூர் சந்தைக்கு நன்கு பழுத்ததும் பறிக்கவும்.',
        descriptionTe: 'దూర ప్రాంత మార్కెట్ కోసం దోర రంగులో, స్థానిక మార్కెట్ కోసం ఎర్రగా పండినప్పుడు కోయండి.',
        category: 'harvest',
        materialsNeeded: ['Plastic crates', 'Pruning shears', 'Grading table'],
        importantTip: 'Always harvest early morning or evening; packing sun-heated tomatoes causes rapid transit decay.',
        importantTipKn: 'ಬೆಳಗಿನ ಜಾವ ಅಥವಾ ಸಂಜೆ ವೇಳೆ ಕೊಯ್ಲು ಮಾಡಿ; ಬಿಸಿಲಿನಲ್ಲಿ ಕೊಯ್ದರೆ ಬೇಗ ಕೊಳೆಯುತ್ತವೆ.',
        importantTipTa: 'அதிகாலை அல்லது மாலையில் பழங்களை பறிக்கவும்; வெயில் நேரத்தில் பறித்தால் சீக்கிரம் அழுகிவிடும்.',
        importantTipTe: 'ఉదయాన్నే లేదా సాయంత్రం వేళల్లో కోయండి; ఎండలో కోస్తే త్వరగా పాడవుతాయి.',
        tasks: [
          { title: 'Harvest every 3-4 days using plastic crates', titleKn: 'ಪ್ಲಾಸ್ಟಿಕ್ ಕ್ರೇಟ್ ಬಳಸಿ 3-4 ದಿನಕ್ಕೊಮ್ಮೆ ಕೊಯ್ಲು ಮಾಡಿ', titleTa: 'பிளாஸ்டிக் கூடை கொண்டு 3-4 நாட்களுக்கு ஒருமுறை பறிக்கவும்', titleTe: 'ప్లాస్టిక్ క్రేట్లతో 3-4 రోజులకు ఒకసారి కోయండి', description: 'Never dump tomatoes in rough gunny sacks.' },
          { title: 'Grade by size and color (A-grade firm, B-grade medium)', titleKn: 'ಗಾತ್ರ ಮತ್ತು ಬಣ್ಣದ ಆಧಾರದಲ್ಲಿ ವರ್ಗೀಕರಿಸಿ', titleTa: 'அளவு மற்றும் நிறத்திற்கேற்ப தரம் பிரிக்கவும்', titleTe: 'పరిమాణం మరియు రంగు ఆధారంగా గ్రేడింగ్ చేయండి', description: 'Graded tomatoes command ₹4-6 higher price per kg in APMC.' }
        ]
      }
    ]
  },
  {
    id: 'crop-cotton-cash',
    name: 'Cotton',
    scientificName: 'Gossypium hirsutum',
    nameKannada: 'ಹತ್ತಿ (Cotton)',
    nameTamil: 'பருத்தி (Cotton)',
    nameTelugu: 'పత్తి (Cotton)',
    category: 'commercial',
    idealSoilTypes: ['black', 'clay', 'loamy'],
    minPh: 6.0,
    maxPh: 8.5,
    waterRequirement: 'Moderate',
    waterMm: '600-800 mm',
    durationDays: '150-175 days',
    durationMin: 150,
    durationMax: 175,
    seasons: ['Kharif'],
    minTemp: 21,
    maxTemp: 38,
    rainfallMm: '600-1000 mm, deep black soil moisture retention',
    estimatedCostPerAcre: '₹22,000 - ₹30,000',
    potentialYieldPerAcre: '10 - 15 Quintals kapas',
    marketDemand: 'Very High',
    description: 'Premier fiber crop ("White Gold") of India; thrives in deep black cotton soils with good moisture retention capacity.',
    descriptionKn: 'ಭಾರತದ ಪ್ರಮುಖ ವಾಣಿಜ್ಯ ಬೆಳೆಯಾಗಿದ್ದು, ಆಳವಾದ ಕಪ್ಪು ಮಣ್ಣಿನಲ್ಲಿ ತೇವಾಂಶ ಹಿಡಿದಿಟ್ಟುಕೊಂಡು ಉತ್ತಮ ಇಳುವರಿ ಕೊಡುತ್ತದೆ.',
    descriptionTa: 'வெள்ளை தங்கம் எனப்படும் முக்கிய பணப்பயிராகும். கரிசல் மண்ணில் மிகச் சிறப்பாக வளரும்.',
    descriptionTe: 'తెల్ల బంగారం అని పిలువబడే ప్రధాన వాణిజ్య పంట. నల్లరేగడి నేలల్లో అద్భుతమైన దిಗುబడినిస్తుంది.',
    imageUrl: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?w=800&auto=format&fit=crop&q=80',
    risks: ['Pink Bollworm (Pectinophora gossypiella) damaging developing bolls', 'Sucking pests (jassids, thrips, aphids) in first 60 days', 'Late season unseasonal rains ruining open lint'],
    benefits: ['CCI (Cotton Corporation of India) government MSP guarantee', 'High monetary return per acre', 'Stalks useful as bio-fuel and paper pulp'],
    stages: [
      {
        stage: 'Sowing & Early Growth',
        stageOrder: 1,
        dayRange: 'Day 1 - 30',
        dayOffset: 1,
        title: 'Deep Ploughing & Wide Spacing Sowing',
        titleKn: 'ಆಳ ಉಳುಮೆ ಮತ್ತು ಅಂತರ ಬಿತ್ತನೆ',
        titleTa: 'ஆழ உழவு மற்றும் பரந்த இடைவெளி விதைப்பு',
        titleTe: 'లోతు దుక్కి మరియు ఎక్కువ దూరంలో విత్తడం',
        description: 'Deep summer ploughing in black soil. Dibble hybrid seeds at 90x60 cm or 120x45 cm spacing on ridges.',
        descriptionKn: 'ಕಪ್ಪು ಮಣ್ಣಿನಲ್ಲಿ ಆಳವಾಗಿ ಉಳುಮೆ ಮಾಡಿ. 90x60 ಸೆಂ.ಮೀ ಅಂತರದಲ್ಲಿ ಬೀಜ ಊರಿ.',
        descriptionTa: 'கரிசல் நிலத்தில் ஆழமாக உழுது, 90x60 செ.மீ இடைவெளியில் விதை ஊன்றவும்.',
        descriptionTe: 'నల్లరేగడి నేలలో లోతుగా దున్ని, 90x60 సెం.మీ దూరంలో విత్తనాలు నాటండి.',
        category: 'sowing',
        materialsNeeded: ['Bt Cotton Hybrids', 'Neem Seed Kernel Extract (NSKE 5%)', 'Basal Fertilizer (NPK 20:20:0:13)'],
        importantTip: 'Plant 2 rows of Pigeonpea (Arhar) or Maize as border refuge crop to naturally trap bollworm moths.',
        importantTipKn: 'ಬದಿಯಲ್ಲಿ ತೊಗರಿ ಅಥವಾ ಮೆಕ್ಕೆಜೋಳವನ್ನು ಗಡಿ ಬೆಳೆಯಾಗಿ ಬೆಳೆದರೆ ಹುಳುಗಳ ಕಾಟ ಕಡಿಮೆಯಾಗುತ್ತದೆ.',
        importantTipTa: 'வரப்பில் துவரை அல்லது மக்காச்சோளம் பயிரிட்டால் புழுக்கள் கட்டுப்படும்.',
        importantTipTe: 'పొలం చుట్టూ కంది లేదా మొక్కజొన్నను సరిహద్దు పంటగా వేస్తే పురుగులు అదుపులో ఉంటాయి.',
        tasks: [
          { title: 'Dibble 1 seed per hill at 3 cm depth', titleKn: 'ಗುಂಡಿಗೆ 1 ಬೀಜವನ್ನು 3 ಸೆಂ.ಮೀ ಆಳಕ್ಕೆ ಊರಿ', titleTa: 'ஒரு குழிக்கு 1 விதை வீதம் 3 செ.மீ ஆழத்தில் நடவும்', titleTe: 'గుంతకు ఒక విత్తనాన్ని 3 సెం.మీ లోతులో నాటండి', description: 'Prevents overcrowded weak stems.' },
          { title: 'Spray 5% NSKE at 20 days against sucking pests', titleKn: 'ಹೇನುಗಳ ನಿಯಂತ್ರಣಕ್ಕೆ 5% ಬೇವಿನ ಕಷಾಯ ಸಿಂಪಡಿಸಿ', titleTa: 'சாறு உறிஞ்சும் பூச்சிகளுக்கு 5% வேப்பங்கொட்டை கரைசல் தெளிக்கவும்', titleTe: 'రసం పీల్చే పురుగుల నివారణకు 5% వేప గింజల కషాయం పిచಿಕారీ చేయండి', description: 'Protects natural predator ladybird beetles.' }
        ]
      },
      {
        stage: 'Squaring & Pink Bollworm Defense',
        stageOrder: 2,
        dayRange: 'Day 45 - 90',
        dayOffset: 45,
        title: 'Square Formation & Bollworm Trapping',
        titleKn: 'ಮೊಗ್ಗು ಮೂಡುವಿಕೆ ಮತ್ತು ಕಾಯಿಕೊರೆಯುವ ಹುಳು ನಿಯಂತ್ರಣ',
        titleTa: 'அரும்பு உருவாக்கம் மற்றும் இளஞ்சிவப்பு காய்ப்புழு கட்டுப்பாடு',
        titleTe: 'మొగ్గ తొడగడం మరియు గులాబీ రంగు పురుగు నివారణ',
        description: 'Floral buds (squares) form. Install pheromone traps for Pink Bollworm (PBW) monitoring.',
        descriptionKn: 'ಮೊಗ್ಗುಗಳು ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತವೆ. ಗುಲಾಬಿ ಕಾಯಿಕೊರೆಯುವ ಹುಳುವಿಗೆ ಮೋಹಕ ಬಲೆ ಹಾಕಿ.',
        descriptionTa: 'அரும்புகள் தோன்றும். இளஞ்சிவப்பு புழுவை கண்காணிக்க இனக்கவர்ச்சி பொறி வைக்கவும்.',
        descriptionTe: 'పూ మొగ్గలు వస్తాయి. గులాబీ రంగు కాయ తొలుచు పురుగు కోసం లింగాకర్షక బుట్టలు పెట్టండి.',
        category: 'pest',
        materialsNeeded: ['PBW Pheromone Traps (Pectino-lure) - 5/acre', 'Potassium Nitrate (13:0:45) foliar spray'],
        importantTip: 'Destruct rosette flowers immediately; rosette flowers contain juvenile Pink Bollworm caterpillars.',
        importantTipKn: 'ಮುದುಡಿದ ಹೂವುಗಳನ್ನು ಕಿತ್ತು ನಾಶಪಡಿಸಿ, ಅವುಗಳಲ್ಲಿ ಹುಳುಗಳಿರುತ್ತವೆ.',
        importantTipTa: 'ஒன்றாக ஒட்டியுள்ள ரோஜா பூ போன்ற அரும்புகளை பறித்து அழிக்கவும்.',
        importantTipTe: 'ముడుచుకుపోయిన గులాబీ ఆకారపు పూలను తెంపి నాశనం చేయండి, అందులో పురుగులు ఉంటాయి.',
        tasks: [
          { title: 'Install PBW pheromone traps at plant canopy height', titleKn: 'ಗಿಡದ ಎತ್ತರಕ್ಕೆ ತಕ್ಕಂತೆ ಮೋಹಕ ಬಲೆಗಳನ್ನು ಅಳವಡಿಸಿ', titleTa: 'செடியின் உயரத்திற்கு ஏற்ப இனக்கவர்ச்சி பொறி அமைக்கவும்', titleTe: 'మొక్కల ఎత్తుకు సమానంగా లింగాకర్షక బుట్టలను అమర్చండి', description: 'Alert threshold: 8 moths/trap/day for 3 consecutive days.' },
          { title: 'Spray 1% 13:0:45 at flowering to prevent boll drop', titleKn: 'ಹೂವು ಉದುರುವುದನ್ನು ತಡೆಯಲು 13:0:45 ಸಿಂಪಡಿಸಿ', titleTa: 'காய் உதிர்வதை தடுக்க 13:0:45 உரம் தெளிக்கவும்', titleTe: 'మొగ్గ రాలకుండా 13:0:45 పిచికారీ చేయండి', description: 'Increases boll size and fiber strength.' }
        ]
      },
      {
        stage: 'Boll Bursting & Picking',
        stageOrder: 3,
        dayRange: 'Day 120 - 170',
        dayOffset: 120,
        title: 'Clean Cotton Picking in Batches',
        titleKn: 'ಹತ್ತಿ ಬಿಡಿಸುವಿಕೆ ಮತ್ತು ಸಂಗ್ರಹ',
        titleTa: 'பருத்தி அறுவடை மற்றும் சேகரிப்பு',
        titleTe: 'పత్తి తీయడం మరియు నిల్వ',
        description: 'Harvest fully opened dry bolls during bright sunshine. Carry out 3-4 pickings at 15-day intervals.',
        descriptionKn: 'ಚೆನ್ನಾಗಿ ಅರಳಿದ ಹತ್ತಿಯನ್ನು ಬಿಸಿಲಿನಲ್ಲಿ ಬಿಡಿಸಿ. 15 ದಿನಗಳ ಅಂತರದಲ್ಲಿ 3-4 ಬಾರಿ ಹತ್ತಿ ಬಿಡಿಸಿ.',
        descriptionTa: 'நன்கு வெடித்த பருத்தியை வெயில் நேரத்தில் பறிக்கவும். 15 நாள் இடைவெளியில் 3-4 முறை எடுக்கவும்.',
        descriptionTe: 'బాగా విచ్చుకున్న పత్తిని ఎండలో తీయండి. 15 రోజుల వ్యవధిలో 3-4 సార్లు పత్తి ఏరండి.',
        category: 'harvest',
        materialsNeeded: ['Clean cotton bags (no polythene/plastic bags)', 'Dry storage room'],
        importantTip: 'Never pick dewy, wet or stained cotton; never store in nylon fertilizer bags as plastic threads degrade lint quality.',
        importantTipKn: 'ಹತ್ತಿಯನ್ನು ಪ್ಲಾಸ್ಟಿಕ್ ಚೀಲದಲ್ಲಿ ತುಂಬಬೇಡಿ; ಹತ್ತಿಯ ಬಟ್ಟೆ ಚೀಲ ಬಳಸಿ.',
        importantTipTa: 'பிளாஸ்டிக் சாக்குகளை பயன்படுத்தாதீர்கள்; பருத்தி துணிப்பைகளை பயன்படுத்தவும்.',
        importantTipTe: 'ప్లాస్టిక్ సంచులను వాడవద్దు; పత్తి గుడ్డ సంచులను మాత్రమే వాడండి.',
        tasks: [
          { title: 'Pick clean white cotton without dried bracts and leaves', titleKn: 'ಕಸ ಕಡ್ಡಿ ಇಲ್ಲದಂತೆ ಶುದ್ಧ ಹತ್ತಿಯನ್ನು ಬಿಡಿಸಿ', titleTa: 'சருகு மற்றும் இலைகள் இல்லாமல் தூய பருத்தியை பறிக்கவும்', titleTe: 'చెత్తా చెదారం లేకుండా స్వచ్ఛమైన పత్తిని ఏరండి', description: 'Contaminant-free cotton gets highest spinning mill rate.' },
          { title: 'Sun dry picked cotton on clean canvas for 2 days', titleKn: 'ಸ್ವಚ್ಛವಾದ ಟಾರ್ಪಲಿನ್ ಮೇಲೆ 2 ದಿನ ಬಿಸಿಲಲ್ಲಿ ಒಣಗಿಸಿ', titleTa: 'தூய தார்பாயில் 2 நாட்கள் வெயிலில் உலர்த்தவும்', titleTe: 'శుభ్రమైన టార్పాలిన్ పై 2 రోజులు ఎండబెట్టండి', description: 'Reduces moisture to under 8% for ginning.' }
        ]
      }
    ]
  },
  {
    id: 'crop-chickpea-gram',
    name: 'Chickpea (Bengal Gram)',
    scientificName: 'Cicer arietinum',
    nameKannada: 'ಕಡಲೆ (Bengal Gram)',
    nameTamil: 'கொண்டைக்கடலை (Bengal Gram)',
    nameTelugu: 'శనగలు (Bengal Gram)',
    category: 'pulse',
    idealSoilTypes: ['black', 'clay', 'loamy'],
    minPh: 6.0,
    maxPh: 8.2,
    waterRequirement: 'Low',
    waterMm: '250-400 mm',
    durationDays: '90-110 days',
    durationMin: 90,
    durationMax: 110,
    seasons: ['Rabi'],
    minTemp: 12,
    maxTemp: 28,
    rainfallMm: 'Residual soil moisture crop, winter season',
    estimatedCostPerAcre: '₹8,000 - ₹12,000',
    potentialYieldPerAcre: '7 - 10 Quintals',
    marketDemand: 'High',
    description: 'Premier winter legume crop grown on residual moisture after Kharif paddy or maize; excellent for soil fertility restoration.',
    descriptionKn: 'ಹಿಂಗಾರು ಹಂಗಾಮಿನ ಪ್ರಮುಖ ದ್ವಿದಳ ಧಾನ್ಯ ಬೆಳೆಯಾಗಿದ್ದು, ಭತ್ತದ ನಂತರದ ತೇವಾಂಶದಲ್ಲಿ ಅಲ್ಪ ಖರ್ಚಿನಲ್ಲಿ ಉತ್ತಮ ಆದಾಯ ನೀಡುತ್ತದೆ.',
    descriptionTa: 'குளிர்கால முக்கிய பயறு வகை பயிராகும். நெல் அல்லது மக்காச்சோளத்திற்கு பின் எஞ்சிய ஈரப்பதத்தில் குறைவான செலவில் சாகுபடி செய்யலாம்.',
    descriptionTe: 'రబీ కాలపు ప్రధాన పప్పుధాన్య పంట. ఖరీఫ్ పంట తర్వాత మిగిలిన తేమతో తక్కువ ఖర్చుతో అధిక లాభాన్నిస్తుంది.',
    imageUrl: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=800&auto=format&fit=crop&q=80',
    risks: ['Fusarium wilt in hot soils', 'Pod borer (Helicoverpa armigera) at flowering/pod stage'],
    benefits: ['Extremely low cost of cultivation', 'Enriches soil with organic nitrogen for upcoming summer/monsoon crop', 'High local market price with government MSP'],
    stages: [
      {
        stage: 'Sowing & Nipping',
        stageOrder: 1,
        dayRange: 'Day 1 - 35',
        dayOffset: 1,
        title: 'Residual Sowing & Shoot Nipping',
        titleKn: 'ತೇವಾಂಶದಲ್ಲಿ ಬಿತ್ತನೆ ಮತ್ತು ಕುಡಿ ಚಿವುಟುವುದು',
        titleTa: 'ஈரப்பதத்தில் விதைப்பு மற்றும் நுனி கிள்ளுதல்',
        titleTe: 'తేమలో విత్తడం మరియు కొమ్మల చివర్లు తుంచడం',
        description: 'Sow in October-November in residual black soil moisture. Nip apical buds at 30-35 days to induce bushy side branches.',
        descriptionKn: 'ಅಕ್ಟೋಬರ್-ನವೆಂಬರ್‌ನಲ್ಲಿ ಬಿತ್ತನೆ ಮಾಡಿ. 30-35 ದಿನಕ್ಕೆ ಕುಡಿ ಚಿವುಟಿದರೆ ಕವಲುಗಳು ಹೆಚ್ಚಾಗಿ ಕಾಯಿ ಜಾಸ್ತಿ ಕಟ್ಟುತ್ತದೆ.',
        descriptionTa: 'அக்டோபர்-நவம்பரில் விதைக்கவும். 30-35 நாளில் நுனியை கிள்ளினால் கிளைகள் அதிகம் பிடித்து காய்கள் கூடும்.',
        descriptionTe: 'అక్టోబర్-నవంబర్ లో విత్తండి. 30-35 రోజులకు కొమ్మల చివర్లు తుంచితే పక్క కొమ్మలు ఎక్కువగా వచ్చి దిగుబడి పెరుగుతుంది.',
        category: 'sowing',
        materialsNeeded: ['Wilt resistant seed (JG 11, JAKI 9218)', 'Trichoderma viride seed treatment'],
        importantTip: 'Nipping the terminal shoots at 35 days stimulates 4-6 extra fruitful side branches.',
        importantTipKn: '35 ದಿನಗಳಲ್ಲಿ ತುದಿಯನ್ನು ಚಿವುಟಿದರೆ ಗಿಡ ಪೊದೆಯಾಗಿ ಬೆಳೆದು ಕಾಯಿ ಇಳುವರಿ ದುಪ್ಪಟ್ಟಾಗುತ್ತದೆ.',
        importantTipTa: '35 நாளில் நுனி கிள்ளினால் செடி புதராக படர்ந்து இரட்டிப்பு விளைச்சல் தரும்.',
        importantTipTe: '35 రోజులకు చివర్లు తుంచితే మొక్క గుబురుగా పెరిగి దిగుబడి రెట్టింపు అవుతుంది.',
        tasks: [
          { title: 'Sow at 30x10 cm depth 6-8 cm to reach moist zone', titleKn: 'ತೇವಾಂಶವಿರುವ 6-8 ಸೆಂ.ಮೀ ಆಳಕ್ಕೆ ಬಿತ್ತನೆ ಮಾಡಿ', titleTa: 'ஈரப்பதம் உள்ள 6-8 செ.மீ ஆழத்தில் விதைக்கவும்', titleTe: 'తేమ ఉన్న 6-8 సెం.మీ లోతులో విత్తండి', description: 'Deep sowing taps residual soil water.' },
          { title: 'Nip top 2 cm shoots when plants reach 15-20 cm height', titleKn: 'ಗಿಡದ ಮೇಲಿನ 2 ಸೆಂ.ಮೀ ಕುಡಿಯನ್ನು ಚಿವುಟಿ', titleTa: 'செடியின் மேல் 2 செ.மீ நுனியை கிள்ளிவிடவும்', titleTe: 'మొక్క పైభాగంలోని 2 సెం.మీ కొమ్మను తుంచండి', description: 'Prevents tall lanky non-branching growth.' }
        ]
      },
      {
        stage: 'Podding & Harvest',
        stageOrder: 2,
        dayRange: 'Day 36 - 105',
        dayOffset: 36,
        title: 'Pod Filling & Threshing',
        titleKn: 'ಕಾಯಿ ಕಟ್ಟುವುದು ಮತ್ತು ಕೊಯ್ಲು',
        titleTa: 'காய் பிடிக்கும் பருவம் மற்றும் அறுவடை',
        titleTe: 'కాయలు కట్టడం మరియు కోత',
        description: 'Provide 1 life-saving irrigation at pod filling if soil cracks. Harvest when plants turn dry and leaves drop.',
        descriptionKn: 'ಕಾಯಿ ಕಟ್ಟುವಾಗ ಅಗತ್ಯವಿದ್ದರೆ ಒಮ್ಮೆ ನೀರು ಹಾಯಿಸಿ. ಗಿಡಗಳು ಒಣಗಿ ಎಲೆಗಳು ಉದುರಿದಾಗ ಕೊಯ್ಲು ಮಾಡಿ.',
        descriptionTa: 'காய் பிடிக்கும் சமயம் தேவைப்பட்டால் ஒரு முறை நீர் பாய்ச்சவும். இலைகள் உதிர்ந்து செடி காய்ந்ததும் அறுக்கவும்.',
        descriptionTe: 'కాయలు కట్టే సమయంలో అవసరమైతే ఒక తడి ఇవ్వండి. ఆకులు రాలి మొక్క ఎండినప్పుడు కోయండి.',
        category: 'harvest',
        materialsNeeded: ['Thresher / Bullocks', 'Gunny bags'],
        importantTip: 'Do not irrigate during active flowering as it causes flower drop and vegetative overgrowth.',
        importantTipKn: 'ಹೂಬಿಡುವ ಸಮಯದಲ್ಲಿ ನೀರು ಹಾಯಿಸಬೇಡಿ; ಹೂವು ಉದುರುತ್ತದೆ.',
        importantTipTa: 'பூக்கும் சமயத்தில் தண்ணீர் பாய்ச்சக் கூடாது; பூக்கள் உதிர்ந்து விடும்.',
        importantTipTe: 'పూత దశలో నీరు పెట్టవద్దు; పూత రాలిపోతుంది.',
        tasks: [
          { title: 'Monitor for pod borer caterpillars on pods', titleKn: 'ಕಾಯಿ ಕೊರೆಯುವ ಹುಳುವನ್ನು ಪರಿಶೀಲಿಸಿ', titleTa: 'காய்ப்புழு தாக்குதலை கண்காணிக்கவும்', titleTe: 'కాయ తొలుచు పురుగును గమనించండి', description: 'Spray HaNPV virus or Chlorantraniliprole if larvae exceed 2/plant.' },
          { title: 'Cut plants with sickles and dry on threshing floor for 3 days', titleKn: 'ಕುಡುಗೋಲಿನಿಂದ ಕೊಯ್ದು 3 ದಿನ ಬಿಸಿಲಿನಲ್ಲಿ ಒಣಗಿಸಿ', titleTa: 'அறுவடை செய்து 3 நாட்கள் வெயிலில் உலர்த்தவும்', titleTe: 'కొడవలితో కోసి 3 రోజులు ఎండబెట్టండి', description: 'Thresh cleanly when pods crush easily between fingers.' }
        ]
      }
    ]
  }
];
