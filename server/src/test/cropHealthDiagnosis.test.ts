import { diagnoseCropProblem, SymptomInput } from '../services/diagnosisService';

interface TestCase {
  id: number;
  crop: string;
  cropSlug: string;
  expectedProblemSlug: string;
  expectedProblemName: string;
  language: 'en' | 'kn' | 'ta' | 'te';
  input: SymptomInput;
  scenarioDescription: string;
}

const TEST_SET: TestCase[] = [
  // --- PADDY (RICE) ---
  {
    id: 1,
    crop: 'Paddy',
    cropSlug: 'paddy',
    expectedProblemSlug: 'blast-disease-paddy',
    expectedProblemName: 'Blast Disease of Paddy',
    language: 'en',
    input: {
      cropSlug: 'paddy',
      plantPart: 'leaf',
      pattern: 'spots',
      colour: 'brown',
      spread: 'patches',
      stage: 'vegetative',
      note: 'Spindle-shaped diamond lesions with ash-colored centers and dark brown margins on leaves',
    },
    scenarioDescription: 'Paddy blast classic leaf spindle lesions',
  },
  {
    id: 2,
    crop: 'Paddy',
    cropSlug: 'paddy',
    expectedProblemSlug: 'yellow-stem-borer',
    expectedProblemName: 'Yellow Stem Borer',
    language: 'en',
    input: {
      cropSlug: 'paddy',
      plantPart: 'stem',
      pattern: 'dead_heart',
      spread: 'patches',
      stage: 'vegetative',
      note: 'Central tiller shoots drying up dead heart, borer holes with frass near water line',
    },
    scenarioDescription: 'Yellow stem borer dead heart in tillering stage',
  },
  {
    id: 3,
    crop: 'Paddy',
    cropSlug: 'paddy',
    expectedProblemSlug: 'brown-planthopper',
    expectedProblemName: 'Brown Planthopper (BPH)',
    language: 'kn',
    input: {
      cropSlug: 'paddy',
      plantPart: 'stem',
      pattern: 'insects_visible',
      colour: 'brown',
      spread: 'patches',
      stage: 'fruiting',
      note: 'ಬುಡದಲ್ಲಿ ಕಂದು ಜಿಗಿಹುಳುಗಳು ಹಿಂಡಾಗಿವೆ, ಎಲೆಗಳು ಒಣಗಿ ಹಾಪರ್‌ಬರ್ನ್ ಲಕ್ಷಣ ಕಾಣಿಸುತ್ತಿದೆ (Brown plant hopper hopperburn at stem base)',
    },
    scenarioDescription: 'Paddy BPH hopperburn Kannada note',
  },
  {
    id: 4,
    crop: 'Paddy',
    cropSlug: 'paddy',
    expectedProblemSlug: 'bacterial-leaf-blight-paddy',
    expectedProblemName: 'Bacterial Leaf Blight',
    language: 'ta',
    input: {
      cropSlug: 'paddy',
      plantPart: 'leaf',
      pattern: 'streaks',
      colour: 'yellow',
      spread: 'whole_field',
      stage: 'vegetative',
      note: 'இலை நுனியில் இருந்து மஞ்சள் நிற அலை அலையான கோடுகள் கீழிறங்கி காய்ந்து வெளிறுகிறது (wavy yellow margin from tip)',
    },
    scenarioDescription: 'Bacterial leaf blight Tamil note',
  },
  {
    id: 5,
    crop: 'Paddy',
    cropSlug: 'paddy',
    expectedProblemSlug: 'sheath-blight-paddy',
    expectedProblemName: 'Sheath Blight',
    language: 'te',
    input: {
      cropSlug: 'paddy',
      plantPart: 'stem',
      pattern: 'spots',
      colour: 'grey',
      spread: 'patches',
      stage: 'flowering',
      note: 'నీటి మట్టం దగ్గర ఆకు తొడుగులపై బూడిద రంగు లేదా ఆకుపచ్చని పాము చారల మచ్చలు ఏర్పడ్డాయి (banded sheath lesions)',
    },
    scenarioDescription: 'Sheath blight Telugu note',
  },

  // --- MAIZE (CORN) ---
  {
    id: 6,
    crop: 'Maize',
    cropSlug: 'maize',
    expectedProblemSlug: 'fall-armyworm-maize',
    expectedProblemName: 'Fall Armyworm',
    language: 'en',
    input: {
      cropSlug: 'maize',
      plantPart: 'leaf',
      pattern: 'holes',
      spread: 'whole_field',
      stage: 'vegetative',
      note: 'Severe pinholes in whorl leaves with heavy sawdust-like caterpillar frass inside central funnel',
    },
    scenarioDescription: 'Fall armyworm whorl defoliation and frass',
  },
  {
    id: 7,
    crop: 'Maize',
    cropSlug: 'maize',
    expectedProblemSlug: 'fall-armyworm-maize',
    expectedProblemName: 'Fall Armyworm',
    language: 'kn',
    input: {
      cropSlug: 'maize',
      plantPart: 'leaf',
      pattern: 'holes',
      spread: 'patches',
      stage: 'vegetative',
      note: 'ಸುಳಿಯಲ್ಲಿ ದೊಡ್ಡ ರಂಧ್ರಗಳು ಮತ್ತು ಮರದ ಹುಡಿಯಂತಹ ಹಿಕ್ಕೆಗಳು ತುಂಬಿವೆ, ಕಪ್ಪು ತಲೆಯ ಹುಳು (fall armyworm in whorl)',
    },
    scenarioDescription: 'Maize FAW Kannada note',
  },
  {
    id: 8,
    crop: 'Maize',
    cropSlug: 'maize',
    expectedProblemSlug: 'turcicum-leaf-blight-maize',
    expectedProblemName: 'Turcicum Leaf Blight',
    language: 'en',
    input: {
      cropSlug: 'maize',
      plantPart: 'leaf',
      pattern: 'spots',
      colour: 'grey',
      spread: 'patches',
      stage: 'flowering',
      note: 'Long elliptical cigar-shaped greyish green lesions on lower leaves merging together',
    },
    scenarioDescription: 'Turcicum leaf blight cigar-shaped lesions',
  },

  // --- RAGI (FINGER MILLET) ---
  {
    id: 9,
    crop: 'Ragi',
    cropSlug: 'ragi',
    expectedProblemSlug: 'ragi-blast',
    expectedProblemName: 'Ragi Blast',
    language: 'kn',
    input: {
      cropSlug: 'ragi',
      plantPart: 'flower',
      pattern: 'spots',
      colour: 'black',
      spread: 'whole_field',
      stage: 'flowering',
      note: 'ರಾಗಿ ತೆನೆಯ ಕುತ್ತಿಗೆ ಕಪ್ಪಾಗಿ ಒಣಗಿ ಕಾಳು ಕಟ್ಟದೆ ಜೊಳ್ಳಾಗುತ್ತಿದೆ (Ragi neck and finger blast)',
    },
    scenarioDescription: 'Ragi neck blast Kannada note',
  },
  {
    id: 10,
    crop: 'Ragi',
    cropSlug: 'ragi',
    expectedProblemSlug: 'ragi-blast',
    expectedProblemName: 'Ragi Blast',
    language: 'en',
    input: {
      cropSlug: 'ragi',
      plantPart: 'leaf',
      pattern: 'spots',
      colour: 'brown',
      spread: 'patches',
      stage: 'seedling',
      note: 'Spindle-shaped spots on finger millet nursery seedlings causing seedling blight and withering',
    },
    scenarioDescription: 'Ragi blast seedling stage in English',
  },

  // --- GROUNDNUT ---
  {
    id: 11,
    crop: 'Groundnut',
    cropSlug: 'groundnut',
    expectedProblemSlug: 'tikka-leaf-spot-groundnut',
    expectedProblemName: 'Tikka Leaf Spot',
    language: 'en',
    input: {
      cropSlug: 'groundnut',
      plantPart: 'leaf',
      pattern: 'spots',
      colour: 'brown',
      spread: 'whole_field',
      stage: 'vegetative',
      note: 'Small circular dark brown to black spots surrounded by a bright yellow halo on upper leaf surface',
    },
    scenarioDescription: 'Groundnut tikka circular spot with yellow halo',
  },
  {
    id: 12,
    crop: 'Groundnut',
    cropSlug: 'groundnut',
    expectedProblemSlug: 'tikka-leaf-spot-groundnut',
    expectedProblemName: 'Tikka Leaf Spot',
    language: 'ta',
    input: {
      cropSlug: 'groundnut',
      plantPart: 'leaf',
      pattern: 'spots',
      colour: 'brown',
      spread: 'patches',
      stage: 'flowering',
      note: 'நிலக்கடலை இலையில் வட்ட வடிவ கருப்பு நிற புள்ளிகள் சுற்றி மஞ்சள் வளையம் உள்ளது (Tikka leaf spot)',
    },
    scenarioDescription: 'Groundnut tikka Tamil note',
  },
  {
    id: 13,
    crop: 'Groundnut',
    cropSlug: 'groundnut',
    expectedProblemSlug: 'collar-rot-groundnut',
    expectedProblemName: 'Collar Rot',
    language: 'te',
    input: {
      cropSlug: 'groundnut',
      plantPart: 'root',
      pattern: 'rot',
      colour: 'black',
      spread: 'patches',
      stage: 'seedling',
      note: 'మొలకల కాండం మొదలు నేల మట్టం వద్ద నల్లగా కుళ్ళి మొక్కలు వాడి చనిపోతున్నాయి (Collar rot black fungal collar)',
    },
    scenarioDescription: 'Groundnut collar rot Telugu note',
  },

  // --- TOMATO ---
  {
    id: 14,
    crop: 'Tomato',
    cropSlug: 'tomato',
    expectedProblemSlug: 'early-blight-tomato',
    expectedProblemName: 'Early Blight',
    language: 'en',
    input: {
      cropSlug: 'tomato',
      plantPart: 'leaf',
      pattern: 'spots',
      colour: 'brown',
      spread: 'patches',
      stage: 'vegetative',
      note: 'Concentric rings target board target spot dark brown lesions on older bottom leaves',
    },
    scenarioDescription: 'Tomato early blight concentric rings target board',
  },
  {
    id: 15,
    crop: 'Tomato',
    cropSlug: 'tomato',
    expectedProblemSlug: 'tomato-leaf-curl-virus',
    expectedProblemName: 'Tomato Leaf Curl Virus',
    language: 'kn',
    input: {
      cropSlug: 'tomato',
      plantPart: 'leaf',
      pattern: 'rolling_curling',
      colour: 'yellow',
      spread: 'whole_field',
      stage: 'vegetative',
      note: 'ಟೊಮೆಟೊ ಸಸ್ಯದ ಮೇಲಿನ ಎಲೆಗಳು ಮುದುಡಿ ಸುರುಳಿಯಾಗುತ್ತಿವೆ, ಗಿಡದ ಬೆಳವಣಿಗೆ ಕುಂಠಿತವಾಗಿ ಹಳದಿಯಾಗುತ್ತಿದೆ (Tomato leaf curl virus)',
    },
    scenarioDescription: 'Tomato leaf curl virus Kannada note',
  },
  {
    id: 16,
    crop: 'Tomato',
    cropSlug: 'tomato',
    expectedProblemSlug: 'fruit-borer-tomato',
    expectedProblemName: 'Tomato Fruit Borer',
    language: 'en',
    input: {
      cropSlug: 'tomato',
      plantPart: 'fruit_grain',
      pattern: 'holes',
      spread: 'patches',
      stage: 'fruiting',
      note: 'Circular round clean bored holes on green and ripe tomato fruits with head feeding inside',
    },
    scenarioDescription: 'Tomato fruit borer circular holes',
  },
  {
    id: 17,
    crop: 'Tomato',
    cropSlug: 'tomato',
    expectedProblemSlug: 'bacterial-wilt-tomato',
    expectedProblemName: 'Bacterial Wilt',
    language: 'ta',
    input: {
      cropSlug: 'tomato',
      plantPart: 'whole_plant',
      pattern: 'wilting',
      spread: 'patches',
      stage: 'flowering',
      note: 'பச்சை செடி திடீரென ஒரே நாளில் முழுமையாக வாடி தலைசாய்கிறது, இலைகள் பழுக்காமல் வாடுகிறது (Sudden green wilting bacterial stream)',
    },
    scenarioDescription: 'Tomato bacterial wilt Tamil note',
  },

  // --- COTTON ---
  {
    id: 18,
    crop: 'Cotton',
    cropSlug: 'cotton',
    expectedProblemSlug: 'pink-bollworm-cotton',
    expectedProblemName: 'Pink Bollworm',
    language: 'en',
    input: {
      cropSlug: 'cotton',
      plantPart: 'fruit_grain',
      pattern: 'holes',
      colour: 'brown',
      spread: 'patches',
      stage: 'fruiting',
      note: 'Rosette flowers, premature boll dropping, pink caterpillar boring inside cotton developing seeds',
    },
    scenarioDescription: 'Cotton pink bollworm rosette flowers and seeds',
  },
  {
    id: 19,
    crop: 'Cotton',
    cropSlug: 'cotton',
    expectedProblemSlug: 'pink-bollworm-cotton',
    expectedProblemName: 'Pink Bollworm',
    language: 'te',
    input: {
      cropSlug: 'cotton',
      plantPart: 'fruit_grain',
      pattern: 'holes',
      spread: 'patches',
      stage: 'fruiting',
      note: 'పత్తి కాయల లోపల గులాబీ రంగు పురుగు గింజలను తొలిచేస్తోంది, కాయలు సరిగ్గా విచ్చుకోవడం లేదు (Pink bollworm inside cotton boll)',
    },
    scenarioDescription: 'Cotton pink bollworm Telugu note',
  },
  {
    id: 20,
    crop: 'Cotton',
    cropSlug: 'cotton',
    expectedProblemSlug: 'whitefly-cotton',
    expectedProblemName: 'Cotton Whitefly',
    language: 'kn',
    input: {
      cropSlug: 'cotton',
      plantPart: 'leaf',
      pattern: 'insects_visible',
      colour: 'white',
      spread: 'whole_field',
      stage: 'vegetative',
      note: 'ಎಲೆಯ ಕೆಳಭಾಗದಲ್ಲಿ ಸಣ್ಣ ಬಿಳಿ ನೊಣಗಳು ಹಾರಾಡುತ್ತಿವೆ, ಜೇನಿನಂತಹ ದ್ರವ ಮತ್ತು ಕಪ್ಪು ಬೂದಿ ಮಸಿ ಬೆಳೆದಿದೆ (Whitefly and sooty mould)',
    },
    scenarioDescription: 'Cotton whitefly Kannada note',
  },

  // --- CHICKPEA (BENGAL GRAM) ---
  {
    id: 21,
    crop: 'Chickpea',
    cropSlug: 'chickpea',
    expectedProblemSlug: 'pod-borer-chickpea',
    expectedProblemName: 'Gram Pod Borer',
    language: 'en',
    input: {
      cropSlug: 'chickpea',
      plantPart: 'fruit_grain',
      pattern: 'holes',
      spread: 'patches',
      stage: 'fruiting',
      note: 'Green caterpillars with body half inside round bored holes feeding on internal chickpea seeds',
    },
    scenarioDescription: 'Helicoverpa armigera pod borer in chickpea',
  },
  {
    id: 22,
    crop: 'Chickpea',
    cropSlug: 'chickpea',
    expectedProblemSlug: 'fusarium-wilt-chickpea',
    expectedProblemName: 'Fusarium Wilt',
    language: 'kn',
    input: {
      cropSlug: 'chickpea',
      plantPart: 'whole_plant',
      pattern: 'wilting',
      colour: 'yellow',
      spread: 'patches',
      stage: 'flowering',
      note: 'ಕಡಲೆ ಗಿಡಗಳು ಹಠಾತ್ತನೆ ಬಾಡಿ ಒಣಗುತ್ತಿವೆ, ಬೇರು ಸೀಳಿದರೆ ಒಳಗಿನ ನಾಳಗಳು ಕಂದು ಕಪ್ಪಾಗಿವೆ (Fusarium wilt internal vascular browning)',
    },
    scenarioDescription: 'Chickpea fusarium wilt Kannada note',
  },

  // --- SUGARCANE ---
  {
    id: 23,
    crop: 'Sugarcane',
    cropSlug: 'sugarcane',
    expectedProblemSlug: 'red-rot-sugarcane',
    expectedProblemName: 'Sugarcane Red Rot',
    language: 'en',
    input: {
      cropSlug: 'sugarcane',
      plantPart: 'stem',
      pattern: 'rot',
      colour: 'red_purple',
      spread: 'patches',
      stage: 'vegetative',
      note: 'Third and fourth leaves drying from tip, internal stalk pith shows longitudinal red discoloration with white cross bands and alcoholic smell',
    },
    scenarioDescription: 'Sugarcane red rot internal pith red band',
  },
  {
    id: 24,
    crop: 'Sugarcane',
    cropSlug: 'sugarcane',
    expectedProblemSlug: 'early-shoot-borer-sugarcane',
    expectedProblemName: 'Early Shoot Borer',
    language: 'ta',
    input: {
      cropSlug: 'sugarcane',
      plantPart: 'stem',
      pattern: 'dead_heart',
      spread: 'patches',
      stage: 'seedling',
      note: 'கரும்பு இளம் பயிரில் நடுக்குருத்து காய்ந்து அழுகிய துர்நாற்றத்துடன் எளிதில் கையோடு வருகிறது (Sugarcane dead heart easily pulled out with bad smell)',
    },
    scenarioDescription: 'Sugarcane shoot borer dead heart Tamil note',
  },

  // --- CHILLI ---
  {
    id: 25,
    crop: 'Chilli',
    cropSlug: 'chilli',
    expectedProblemSlug: 'chilli-thrips-murda',
    expectedProblemName: 'Chilli Thrips & Mites',
    language: 'kn',
    input: {
      cropSlug: 'chilli',
      plantPart: 'leaf',
      pattern: 'rolling_curling',
      spread: 'whole_field',
      stage: 'vegetative',
      note: 'ಮೆಣಸಿನಕಾಯಿ ಎಲೆಗಳು ದೋಣಿಯಾಕಾರದಲ್ಲಿ ಮೇಲ್ಮುಖವಾಗಿ ಮುದುಡುತ್ತಿವೆ, ಗಿಡ ಗಿಡ್ಡಾಗುತ್ತಿದೆ (Chilli murda leaf curl upward boat shape)',
    },
    scenarioDescription: 'Chilli thrips murda complex Kannada note',
  },
  {
    id: 26,
    crop: 'Chilli',
    cropSlug: 'chilli',
    expectedProblemSlug: 'chilli-anthracnose-fruit-rot',
    expectedProblemName: 'Anthracnose & Fruit Rot',
    language: 'en',
    input: {
      cropSlug: 'chilli',
      plantPart: 'fruit_grain',
      pattern: 'spots',
      colour: 'black',
      spread: 'patches',
      stage: 'fruiting',
      note: 'Sunken circular dark lesions with concentric rings of black acervuli on ripe red chilli pods causing dieback',
    },
    scenarioDescription: 'Chilli anthracnose fruit rot dieback',
  },

  // --- ONION ---
  {
    id: 27,
    crop: 'Onion',
    cropSlug: 'onion',
    expectedProblemSlug: 'purple-blotch-onion',
    expectedProblemName: 'Purple Blotch',
    language: 'te',
    input: {
      cropSlug: 'onion',
      plantPart: 'leaf',
      pattern: 'spots',
      colour: 'red_purple',
      spread: 'patches',
      stage: 'vegetative',
      note: 'ఉల్లి ఆకులపై లోతైన ఊదా లేదా ముదురు గోధుಮ రంగు మచ్చలు ఏర్పడి ఆకులు విరిగిపోతున్నాయి (Onion purple blotch sunken lesions)',
    },
    scenarioDescription: 'Onion purple blotch Telugu note',
  },

  // --- BANANA ---
  {
    id: 28,
    crop: 'Banana',
    cropSlug: 'banana',
    expectedProblemSlug: 'sigatoka-leaf-spot-banana',
    expectedProblemName: 'Sigatoka Leaf Spot',
    language: 'en',
    input: {
      cropSlug: 'banana',
      plantPart: 'leaf',
      pattern: 'streaks',
      colour: 'brown',
      spread: 'whole_field',
      stage: 'vegetative',
      note: 'Narrow yellowish green streaks on banana leaves expanding into spindle-shaped brown spots with sunken grey center',
    },
    scenarioDescription: 'Banana Sigatoka leaf spot',
  },

  // --- MANGO ---
  {
    id: 29,
    crop: 'Mango',
    cropSlug: 'mango',
    expectedProblemSlug: 'mango-powdery-mildew',
    expectedProblemName: 'Mango Powdery Mildew',
    language: 'en',
    input: {
      cropSlug: 'mango',
      plantPart: 'flower',
      pattern: 'powdery_mould',
      colour: 'white',
      spread: 'whole_field',
      stage: 'flowering',
      note: 'White powdery superficial fungal growth covering mango blossom inflorescence panicles and flower drop',
    },
    scenarioDescription: 'Mango powdery mildew white fungal bloom',
  },

  // --- POMEGRANATE ---
  {
    id: 30,
    crop: 'Pomegranate',
    cropSlug: 'pomegranate',
    expectedProblemSlug: 'bacterial-blight-pomegranate',
    expectedProblemName: 'Bacterial Blight of Pomegranate',
    language: 'kn',
    input: {
      cropSlug: 'pomegranate',
      plantPart: 'fruit_grain',
      pattern: 'spots',
      colour: 'black',
      spread: 'patches',
      stage: 'fruiting',
      note: 'ದಾಳಿಂಬೆ ಹಣ್ಣು ಮತ್ತು ತೊಗಟೆಯ ಮೇಲೆ ಎಣ್ಣೆಯುಕ್ತ ಕಪ್ಪು ಚುಕ್ಕೆಗಳು, ಎಲ್ ಅಥವಾ ವೈ ಆಕಾರದ ಸೀಳುಗಳು (Telya disease oily black spots on pomegranate)',
    },
    scenarioDescription: 'Pomegranate bacterial blight Telya Kannada note',
  },

  // --- COCONUT ---
  {
    id: 31,
    crop: 'Coconut',
    cropSlug: 'coconut',
    expectedProblemSlug: 'bud-rot-coconut',
    expectedProblemName: 'Bud Rot of Coconut Palm',
    language: 'ta',
    input: {
      cropSlug: 'coconut',
      plantPart: 'stem',
      pattern: 'rot',
      colour: 'brown',
      spread: 'few_plants',
      stage: 'vegetative',
      note: 'தென்னை மரத்தின் நடுக்குருத்து அழுகி நாற்றமடித்து எளிதில் கையோடு வருகிறது (Coconut central spindle spear rot)',
    },
    scenarioDescription: 'Coconut palm bud rot Tamil note',
  },

  // --- GENERAL UNCERTAIN TEST CASE (Honest Gate Verification) ---
  {
    id: 32,
    crop: 'Paddy',
    cropSlug: 'paddy',
    expectedProblemSlug: 'UNCERTAIN',
    expectedProblemName: 'Uncertain Gate (<25 score threshold)',
    language: 'en',
    input: {
      cropSlug: 'paddy',
      plantPart: 'flower',
      pattern: 'galls',
      colour: 'red_purple',
      spread: 'few_plants',
      stage: 'harvest',
      note: 'Strange purple lump on flower at harvest time',
    },
    scenarioDescription: 'Contradictory / non-matching symptoms to verify honest uncertain fallback',
  },
];

async function runCropHealthTests() {
  console.log('================================================================');
  console.log('   KRUSHI SATHI CROP HEALTH DIAGNOSIS AUTOMATED TEST SUITE      ');
  console.log(`   Running ${TEST_SET.length} Realistic Cases across en/kn/ta/te `);
  console.log('================================================================\n');

  let passedCases = 0;
  let failedCases = 0;
  const failureReports: string[] = [];

  for (const test of TEST_SET) {
    const startTime = Date.now();
    try {
      const result = await diagnoseCropProblem(test.input);
      const elapsed = Date.now() - startTime;

      if (test.expectedProblemSlug === 'UNCERTAIN') {
        if (result.mode === 'uncertain' || result.confidence === 'low') {
          passedCases++;
          console.log(`✅ [CASE #${test.id}] [${test.language.toUpperCase()}] ${test.scenarioDescription} -> Correctly triggered honest UNCERTAIN gate (${elapsed}ms)`);
        } else {
          failedCases++;
          console.log(`❌ [CASE #${test.id}] Expected uncertain gate, but got candidate: ${result.candidates[0]?.name}`);
          failureReports.push(`Case #${test.id}: Expected uncertain gate but got confident result: ${result.candidates[0]?.name}`);
        }
        continue;
      }

      // Check if expected problem is in top 3
      const top3 = result.candidates || [];
      const rankIndex = top3.findIndex(
        c => c.slug === test.expectedProblemSlug || c.name.toLowerCase().includes(test.expectedProblemName.toLowerCase())
      );

      const isMatch = rankIndex !== -1 && rankIndex < 3;

      if (isMatch) {
        passedCases++;
        const rank = rankIndex + 1;
        const matchedCandidate = top3[rankIndex];
        console.log(`✅ [CASE #${test.id}] [${test.language.toUpperCase()}] ${test.scenarioDescription}`);
        console.log(`   -> Found '${matchedCandidate.name}' at Rank #${rank} (Score: ${matchedCandidate.score}, Conf: ${matchedCandidate.confidence}) [${elapsed}ms]`);
      } else {
        failedCases++;
        console.log(`❌ [CASE #${test.id}] [${test.language.toUpperCase()}] ${test.scenarioDescription}`);
        console.log(`   Expected: '${test.expectedProblemName}' (${test.expectedProblemSlug})`);
        console.log(`   Actual Top 3:`);
        top3.forEach((c, idx) => {
          console.log(`     #${idx + 1}: ${c.name} (Slug: ${c.slug}, Score: ${c.score})`);
        });
        failureReports.push(`Case #${test.id} (${test.crop} - ${test.expectedProblemName}): Not in top 3. Top candidate was '${top3[0]?.name || 'none'}'`);
      }
    } catch (err: any) {
      failedCases++;
      console.error(`💥 [CASE #${test.id}] Exception:`, err.message);
      failureReports.push(`Case #${test.id}: Threw error - ${err.message}`);
    }
  }

  const accuracy = Math.round((passedCases / TEST_SET.length) * 100);
  console.log('\n================================================================');
  console.log(`   TEST EXECUTION COMPLETED:`);
  console.log(`   Total Tests : ${TEST_SET.length}`);
  console.log(`   Passed      : ${passedCases}`);
  console.log(`   Failed      : ${failedCases}`);
  console.log(`   Accuracy    : ${accuracy}%`);
  console.log('================================================================\n');

  if (failureReports.length > 0) {
    console.log('Failed Test Summary:');
    failureReports.forEach(f => console.log(` - ${f}`));
  } else {
    console.log('🎉 ALL 32 TEST SCENARIOS PASSED WITH HIGH ACCURACY IN TOP 3!');
  }

  process.exit(failedCases > 3 ? 1 : 0);
}

runCropHealthTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
