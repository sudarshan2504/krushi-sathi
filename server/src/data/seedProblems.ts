// ============================================================================
// Krushi Sathi — Crop Health Master Dataset (Single Source of Truth)
// Grounded in ICAR, UAS Bangalore, and TNAU agronomic guides.
// Generic active ingredients ONLY — no invented chemical dosages.
// ============================================================================

export interface SeedSymptomTag {
  slug: string;
  plantPart: string; // leaf, stem, root, fruit_grain, flower, whole_plant
  pattern: string;   // spots, streaks, yellowing, browning, wilting, holes, rolling_curling, powdery_mould, rot, galls, dead_heart, stunting, insects_visible
  colour?: string;   // yellow, brown, black, white, grey, red_purple, light_green
  spread?: string;   // few_plants, patches, whole_field
  stage?: string;    // seedling, vegetative, flowering, maturity
  labelEn: string;
  labelKn: string;
  labelTa: string;
  labelTe: string;
  icon?: string;
}

export interface SeedProblem {
  slug: string;
  name: string;
  nameKn: string;
  nameTa: string;
  nameTe: string;
  scientificName?: string;
  type: 'insect_pest' | 'fungal' | 'bacterial' | 'viral' | 'nematode' | 'mite' | 'weed' | 'nutrient_deficiency' | 'abiotic_stress';
  severity: 'low' | 'medium' | 'high' | 'critical';
  symptoms: string;
  symptomsKn: string;
  symptomsTa: string;
  symptomsTe: string;
  cause: string;
  favourableConditions: string;
  favourableHumidity?: string;
  favourableTemp?: string;
  favourableSeasons: string[];
  affectedStages: string[];
  spreadPattern: string;
  culturalControl: string;
  culturalControlKn: string;
  culturalControlTa: string;
  culturalControlTe: string;
  biologicalControl: string;
  biologicalControlKn: string;
  biologicalControlTa: string;
  biologicalControlTe: string;
  organicControl: string;
  organicControlKn: string;
  organicControlTa: string;
  organicControlTe: string;
  chemicalControl: string;
  chemicalControlKn: string;
  chemicalControlTa: string;
  chemicalControlTe: string;
  preventionSteps: string[];
  preventionStepsKn: string[];
  preventionStepsTa: string[];
  preventionStepsTe: string[];
  ipmSteps: string[];
  ipmStepsKn: string[];
  ipmStepsTa: string[];
  ipmStepsTe: string[];
  safetyNotes: string;
  lookAlikes: Array<{ name: string; difference: string; lookAlikeSlug?: string }>;
  whenToCallExpert: string;
  whenToCallExpertKn: string;
  whenToCallExpertTa: string;
  whenToCallExpertTe: string;
  confidence: 'verified' | 'review_needed' | 'low';
  sources: string;
  crops: Array<{ cropName: string; cropSlug: string; importance: 'primary' | 'secondary' | 'minor' }>;
  symptomTags: Array<{ tagSlug: string; weight: number; isPrimary: boolean }>;
  images?: Array<{
    path: string;
    caption: string;
    captionKn?: string;
    captionTa?: string;
    captionTe?: string;
    kind: 'symptom_closeup' | 'field_view' | 'pest_or_pathogen' | 'healthy_comparison';
    source: string;
    author: string;
    licence: string;
    attribution: string;
    isPrimary?: boolean;
  }>;
}

export const SYMPTOM_TAGS_DATA: SeedSymptomTag[] = [
  // Plant parts
  { slug: 'part-leaf', plantPart: 'leaf', pattern: 'spots', labelEn: 'Leaf', labelKn: 'ಎಲೆ', labelTa: 'இலை', labelTe: 'ఆకు', icon: 'leaf' },
  { slug: 'part-stem', plantPart: 'stem', pattern: 'holes', labelEn: 'Stem / Shoot', labelKn: 'ಕಾಂಡ / ಚಿಗುರು', labelTa: 'தண்டு / குருத்து', labelTe: 'కాండం / రెమ్మ', icon: 'git-commit' },
  { slug: 'part-root', plantPart: 'root', pattern: 'rot', labelEn: 'Root / Collar', labelKn: 'ಬೇರು / ಬುಡ', labelTa: 'வேர் / அடிப்பகுதி', labelTe: 'వేరు / మొదలు', icon: 'anchor' },
  { slug: 'part-fruit-grain', plantPart: 'fruit_grain', pattern: 'rot', labelEn: 'Fruit / Grain / Pod', labelKn: 'ಕಾಯಿ / ಕಾಳು / ಕಾಯಿಬೆಳೆ', labelTa: 'காய் / தானியம் / நெற்று', labelTe: 'కాయ / గింజ / కాయలు', icon: 'circle-dot' },
  { slug: 'part-flower', plantPart: 'flower', pattern: 'wilting', labelEn: 'Flower / Panicle', labelKn: 'ಹೂವು / ತೆನೆ', labelTa: 'பூ / கதிர்', labelTe: 'పువ్వు / వెన్ను', icon: 'sun' },
  { slug: 'part-whole-plant', plantPart: 'whole_plant', pattern: 'wilting', labelEn: 'Whole Plant', labelKn: 'ಇಡೀ ಗಿಡ', labelTa: 'முழு செடி', labelTe: 'మొత్తం మొక్క', icon: 'tree' },

  // Visual patterns
  { slug: 'pattern-spots', plantPart: 'leaf', pattern: 'spots', labelEn: 'Spots / Lesions', labelKn: 'ಚುಕ್ಕೆಗಳು / ಕಲೆಗಳು', labelTa: 'புள்ளிகள் / திட்டுக்கள்', labelTe: 'మచ్చలు / పుండ్లు', icon: 'disc' },
  { slug: 'pattern-streaks', plantPart: 'leaf', pattern: 'streaks', labelEn: 'Streaks / Stripes', labelKn: 'ಪಟ್ಟೆಗಳು / ಗೆರೆಗಳು', labelTa: 'கோடுகள் / பட்டைகள்', labelTe: 'గీతలు / చారలు', icon: 'align-justify' },
  { slug: 'pattern-yellowing', plantPart: 'leaf', pattern: 'yellowing', labelEn: 'Yellowing / Chlorosis', labelKn: 'ಹಳದಿ ಬಣ್ಣಕ್ಕೆ ತಿರುಗುವುದು', labelTa: 'மஞ்சளாதல்', labelTe: 'పసుపు పచ్చగా మారడం', icon: 'sun' },
  { slug: 'pattern-browning', plantPart: 'leaf', pattern: 'browning', labelEn: 'Browning / Scorching', labelKn: 'ಕಂದು / ಸುಟ್ಟ ಗುರುತು', labelTa: 'பழுப்பு / தீய்ந்து போதல்', labelTe: 'గోధుమ రంగు / మాడటం', icon: 'flame' },
  { slug: 'pattern-wilting', plantPart: 'whole_plant', pattern: 'wilting', labelEn: 'Wilting / Drooping', labelKn: 'ಬಾಡುವುದು / ತೂಗುಬೀಳುವುದು', labelTa: 'வாடுதல் / தொங்குதல்', labelTe: 'వాడిపోవడం / వాలిపోవడం', icon: 'arrow-down' },
  { slug: 'pattern-holes', plantPart: 'leaf', pattern: 'holes', labelEn: 'Holes / Eaten Tissues', labelKn: 'ರಂಧ್ರಗಳು / ಕಡಿದ ಎಲೆಗಳು', labelTa: 'துளைகள் / தின்னப்பட்ட இலைகள்', labelTe: 'రంధ్రాలు / కొరికిన ఆకులు', icon: 'scissors' },
  { slug: 'pattern-rolling-curling', plantPart: 'leaf', pattern: 'rolling_curling', labelEn: 'Curling / Crinkling', labelKn: 'ಎಲೆ ಮುದುರುವುದು', labelTa: 'இலை சுருட்டு / சுருங்குதல்', labelTe: 'ఆకు ముడుచుకుపోవడం', icon: 'rotate-cw' },
  { slug: 'pattern-powdery-mould', plantPart: 'leaf', pattern: 'powdery_mould', labelEn: 'Powdery / Mould Coating', labelKn: 'ಬೂದಿ / ಬೂಸ್ಟು ಪದರ', labelTa: 'சாம்பல் பூசணம்', labelTe: 'బూడిద తెగులు / బూజు', icon: 'cloud' },
  { slug: 'pattern-rot', plantPart: 'stem', pattern: 'rot', labelEn: 'Rot / Soft Decay', labelKn: 'ಕೊಳೆತ / ಮೆದುವಾಗುವುದು', labelTa: 'அழுகல் / மென்மை ஆதல்', labelTe: 'కుళ్లు / మెత్తబడటం', icon: 'droplet' },
  { slug: 'pattern-dead-heart', plantPart: 'stem', pattern: 'dead_heart', labelEn: 'Dead Heart / White Panicle', labelKn: 'ಸುಳಿ ಒಣಗುವಿಕೆ (ಡೆಡ್ ಹಾರ್ಟ್)', labelTa: 'குருத்து காய்தல் (டெட் ஹார்ட்)', labelTe: 'సుడి ఎండటం (డెడ్ హార్ట్)', icon: 'zap-off' },
  { slug: 'pattern-stunting', plantPart: 'whole_plant', pattern: 'stunting', labelEn: 'Stunted Growth', labelKn: 'ಗಿಡ್ಡವಾಗುವುದು / ಬೆಳವಣಿಗೆ ಕುಂಠಿತ', labelTa: 'வளர்ச்சி குன்றுதல்', labelTe: 'ఎదుగుదల లోపించడం / గిడసబారడం', icon: 'minimize-2' },
  { slug: 'pattern-insects-visible', plantPart: 'stem', pattern: 'insects_visible', labelEn: 'Insects / Webbing Visible', labelKn: 'ಕಣ್ಣಿಗೆ ಕಾಣುವ ಹುಳು / ಜೇಡರ ಬಲೆ', labelTa: 'பூச்சிகள் / வலை தெரிதல்', labelTe: 'కంటికి కనిపించే పురుగులు / గూళ్లు', icon: 'bug' },

  // Colours
  { slug: 'colour-yellow', plantPart: 'leaf', pattern: 'yellowing', colour: 'yellow', labelEn: 'Yellow', labelKn: 'ಹಳದಿ', labelTa: 'மஞ்சள்', labelTe: 'పసుపు' },
  { slug: 'colour-brown', plantPart: 'leaf', pattern: 'browning', colour: 'brown', labelEn: 'Brown', labelKn: 'ಕಂದು', labelTa: 'பழுப்பு', labelTe: 'గోధుమ' },
  { slug: 'colour-black', plantPart: 'leaf', pattern: 'spots', colour: 'black', labelEn: 'Black', labelKn: 'ಕಪ್ಪು', labelTa: 'கருப்பு', labelTe: 'నలుపు' },
  { slug: 'colour-white-grey', plantPart: 'leaf', pattern: 'powdery_mould', colour: 'white', labelEn: 'White / Ash-Grey', labelKn: 'ಬಿಳಿ / ಬೂದಿ ಬಣ್ಣ', labelTa: 'வெள்ளை / சாம்பல்', labelTe: 'తెలుపు / బూడిద' },
  { slug: 'colour-red-purple', plantPart: 'leaf', pattern: 'spots', colour: 'red_purple', labelEn: 'Red / Purple / Rust', labelKn: 'ಕೆಂಪು / ನೇರಳೆ / ತುಕ್ಕು', labelTa: 'சிவப்பு / ஊதா / துரு', labelTe: 'ఎరుపు / ఊదా / తుప్పు' },

  // Spread
  { slug: 'spread-few-plants', plantPart: 'whole_plant', pattern: 'wilting', spread: 'few_plants', labelEn: 'Few Scattered Plants', labelKn: 'ಅಲ್ಲಲ್ಲಿ ಕೆಲವು ಗಿಡಗಳು', labelTa: 'ஆங்காங்கே சில செடிகள்', labelTe: 'అక్కడక్కడా కొన్ని మొక్కలు' },
  { slug: 'spread-patches', plantPart: 'whole_plant', pattern: 'wilting', spread: 'patches', labelEn: 'Circular Patches', labelKn: 'ಗುಂಪು ಗುಂಪಾಗಿ (ಪ್ಯಾಚ್)', labelTa: 'வட்ட வடிவில் திட்டுக்கள்', labelTe: 'గుండ్రని మచ్చల సమూహాలు' },
  { slug: 'spread-whole-field', plantPart: 'whole_plant', pattern: 'wilting', spread: 'whole_field', labelEn: 'Whole Field Spread', labelKn: 'ಇಡೀ ಗದ್ದೆ / ಹೊಲ', labelTa: 'வயல் முழுவதும்', labelTe: 'మొత్తం పొలం అంతా' },
];
