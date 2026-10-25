import { SeedProblem } from './seedProblems';

export const PROBLEMS_DATA_PART5: SeedProblem[] = [
  // ==========================================
  // PADDY (ADDITIONAL)
  // ==========================================
  {
    slug: 'sheath-rot-paddy',
    name: 'Sheath Rot of Paddy (Rice)',
    nameKn: 'ಭತ್ತದ ಹಾಳೆ ಕೊಳೆ ರೋಗ (Sheath Rot)',
    nameTa: 'நெல் உறை அழுகல் நோய்',
    nameTe: 'వరి పొట్ట కుళ్ళు తెగులు',
    scientificName: 'Sarocladium oryzae',
    type: 'fungal',
    severity: 'high',
    symptoms: 'Oblong or irregular grey-brown lesions with dark reddish-brown margins develop on the flag leaf sheath enclosing the young panicle; lesions enlarge, coalesce, and rot the entire boot leaf sheath; panicles fail to emerge completely or emerge choked with unfilled, chaffy, discolored dark brown grains with a whitish powdery fungal coating inside the sheath.',
    symptomsKn: 'ತೆನೆ ಆವರಿಸಿರುವ ಬಾವುಟ ಎಲೆಯ ಹಾಳೆಯ ಮೇಲೆ ಕಂದು ಅಂಚಿನ ಬೂದು ಬಣ್ಣದ ಕಲೆಗಳು ಉಂಟಾಗಿ ಕೊಳೆಯುತ್ತವೆ. ತೆನೆ ಪೂರ್ಣವಾಗಿ ಹೊರಬರದೆ ಸಿಲುಕಿಕೊಳ್ಳುತ್ತದೆ. ಕಾಳುಗಳು ಜೊಳ್ಳಾಗಿ ಕಪ್ಪಾಗುತ್ತವೆ ಮತ್ತು ಹಾಳೆಯ ಒಳಗೆ ಬಿಳಿ ಬೂಸ್ಟು ಬೆಳೆಯುತ್ತದೆ.',
    symptomsTa: 'கதிர் வெளிவரும் கொடி இலை உறையில் ஒழுங்கற்ற பழுப்பு நிற புள்ளிகள் தோன்றி அழுகும். கதிர் முழுமையாக வெளிவராமல் உள்ளேயே சுருண்டு பதராகும். உறைக்குள் வெள்ளை பூசணம் படரும்.',
    symptomsTe: 'వెన్నును చుట్టి ఉన్న పొట్ట ఆకు తొడుగుపై గోధుమ రంగు మచ్చలు ఏర్పడి కుళ్ళిపోతుంది. వెన్ను పూర్తిగా బయటకు రాకుండా సగమే వచ్చి గింజలు తాలుగా మారిపోతాయి.',
    cause: 'Fungus Sarocladium oryzae entering through mite injuries or stem borer punctures.',
    favourableConditions: 'High relative humidity (>85%), temperatures 20-28°C during boot leaf stage, dense planting, and high nitrogen application.',
    favourableHumidity: '>85%',
    favourableTemp: '20-28°C',
    favourableSeasons: ['Kharif', 'Rabi'],
    affectedStages: ['Tillering', 'Flowering', 'Fruiting'],
    spreadPattern: 'Airborne conidia and rain splash; often associated with sheath mite (Steneotarsonemus spinki) feeding.',
    culturalControl: 'Apply recommended balanced N:P:K doses; avoid excess nitrogen top-dressing during panicle initiation. Ensure optimum planting density and wide alleyways (skip one row every 2-3 meters) for sunlight and aeration.',
    culturalControlKn: 'ಶಿಫಾರಸು ಮಾಡಿದ ಸಮತೋಲನ ರಸಗೊಬ್ಬರ ಬಳಸಿ. ಹೂವಾಡುವಾಗ ಅತಿಯಾದ ಯೂರಿಯಾ ಹಾಕಬೇಡಿ. ಗಾಳಿ ಬೆಳಕಿಗಾಗಿ ಪ್ರತಿ 2-3 ಮೀಟರ್‌ಗೆ ಗಾಳಿ ಸಾಲು ಬಿಡಿ.',
    culturalControlTa: 'சரியான விகிதத்தில் உரமிடவும். கதிர் பருவத்தில் அதிக தழைச்சத்து இடக்கூடாது. வயலில் இடைவெளி விட்டு காற்று புகுமாறு நடவு செய்யவும்.',
    culturalControlTe: 'సిఫార్సు చేసిన ఎరువులు సమతుల్యంగా వేయండి. చిరుపొట్ట దశలో ఎక్కువ యూరియా వేయవద్దు. గాలి వెలుతురు కోసం దారులు వదలండి.',
    biologicalControl: 'Foliar spray of Pseudomonas fluorescens (5 g/L) at boot leaf emergence and flowering stage.',
    biologicalControlKn: 'ಬಾವುಟ ಎಲೆ ಹಂತದಲ್ಲಿ ಸ್ಯೂಡೋಮೊನಾಸ್ ಜೈವಿಕ ದ್ರಾವಣ ಸಿಂಪಡಿಸಿ.',
    biologicalControlTa: 'சூடோமோனாஸ் கரைசலை பயிரின் மேல் தெளிக்கவும்.',
    biologicalControlTe: 'సూడోమోనాస్ ద్రావణాన్ని పైరుపై పిచಿಕారీ చేయండి.',
    organicControl: 'Foliar spray of 5% Neem Seed Kernel Extract (NSKE) or cow urine-asafoetida decoction at boot leaf emergence.',
    organicControlKn: 'ಹೊಡೆ ಹಂತದಲ್ಲಿ ಬೇವಿನ ಬೀಜದ ಕಷಾಯ (NSKE 5%) ಸಿಂಪಡಿಸಿ.',
    organicControlTa: '5% வேப்பங்கொட்டை கரைசல் தெளிக்கவும்.',
    organicControlTe: '5% వేప గింజల కషాయం పిచಿಕారీ చేయండి.',
    chemicalControl: 'Foliar spray of Hexaconazole or Carbendazim + Mancozeb or Tebuconazole + Trifloxystrobin at boot leaf emergence. Note: Add Dicofol or Spiromesifen if sheath mites are present; follow package label.',
    chemicalControlKn: 'ಹೊಡೆ ಒಡೆಯುವ ಹಂತದಲ್ಲಿ ಹೆಕ್ಸಾಕೊನಾಜೋಲ್ ಅಥವಾ ಟೆಬುಕೊನಾಜೋಲ್ ಸಿಂಪಡಿಸಿ. ನುಸಿ ಕೀಟಗಳಿದ್ದರೆ ಸೂಕ್ತ ಕೀಟನಾಶಕ ಬೆರೆಸಿ. ಲೇಬಲ್ ಸೂಚನೆ ಪಾಲಿಸಿ.',
    chemicalControlTa: 'கதிர் வரும் தருணத்தில் ஹெக்சாகோனசோல் அல்லது டெபுகோனசோல் தெளிக்கவும்.',
    chemicalControlTe: 'పొట్ట దశలో హెక్సాకొనజోల్ లేదా టెబుకొనజోల్ పిచಿಕారీ చేయండి.',
    preventionSteps: ['Provide skip alleys every 2-3 m.', 'Avoid excess nitrogen at booting.', 'Foliar bio-agent spray at boot stage.'],
    preventionStepsKn: ['ಹೊಲದಲ್ಲಿ ಗಾಳಿ ಸಾಲುಗಳನ್ನು ಬಿಡಿ.', 'ಹೊಡೆ ಹಂತದಲ್ಲಿ ಯೂರಿಯಾ ಕಡಿಮೆ ಮಾಡಿ.'],
    preventionStepsTa: ['காற்று இடைவெளி விட்டு நடவும்.', 'தழைச்சத்தை கட்டுப்படுத்தவும்.'],
    preventionStepsTe: ['గాలి దారులు వదలండి.', 'యూరియా తగ్గించండి.'],
    ipmSteps: [
      'Step 1: Balanced fertilization and split potash application.',
      'Step 2: Wide alley formation for field ventilation.',
      'Step 3: Prophylactic Pseudomonas fluorescens spray at boot stage.',
      'Step 4: Targeted systemic fungicide spray if flag sheath lesions exceed 5%.'
    ],
    ipmStepsKn: ['ಹಂತ 1: ಸಮತೋಲನ ಗೊಬ್ಬರ', 'ಹಂತ 2: ಗಾಳಿ ಸಾಲು ಬಿಡುವುದು', 'ಹಂತ 3: ಸ್ಯೂಡೋಮೊನಾಸ್ ಸಿಂಪರಣೆ', 'ಹಂತ 4: ಸಕಾಲಿಕ ಶಿಲೀಂಧ್ರನಾಶಕ'],
    ipmStepsTa: ['படி 1: சீரான உரம்', 'படி 2: இடைவெளி பாத்தி', 'படி 3: உயிரியல் தெளிப்பு', 'படி 4: பூஞ்சாணக்கொல்லி'],
    ipmStepsTe: ['దశ 1: సమతుల్య ఎరువులు', 'దశ 2: గాలి సాళ్లు', 'దశ 3: జీవ నియంత్రణ', 'దశ 4: అవసరమైతే పిచికారీ'],
    safetyNotes: 'Ensure spray nozzle reaches down to boot sheaths, not just upper leaf tips.',
    lookAlikes: [
      { name: 'Sheath Blight of Paddy (Rhizoctonia solani)', difference: 'Sheath blight forms snake-skin / greenish-grey banded lesions near water line, while sheath rot attacks upper boot leaf sheath enclosing the emerging panicle.' },
      { name: 'Stem Borer White Earhead', difference: 'Stem borer causes clean white earheads pulled out easily from stem base; sheath rot causes choked, partly emerged discolored chaffy panicles.' }
    ],
    whenToCallExpert: 'Call KVK/RSK if panicles emerge choked or fail to emerge from flag leaf sheaths on more than 10% tillers.',
    whenToCallExpertKn: '10% ಕ್ಕಿಂತ ಹೆಚ್ಚು ತೆನೆಗಳು ಹೊರಬಾರದೆ ಬಾವುಟ ಎಲೆಯೊಳಗೆ ಸಿಲುಕಿ ಕೊಳೆಯುತ್ತಿದ್ದರೆ ತಕ್ಷಣ ಕೃಷಿ ಅಧಿಕಾರಿಯನ್ನು ಸಂಪರ್ಕಿಸಿ.',
    whenToCallExpertTa: '10% மேற்பட்ட கதிர்கள் வெளிவராமல் உறைக்குள் அழுகினால் வேளாண் அலுவலரை அணுகவும்.',
    whenToCallExpertTe: '10% కంటే ఎక్కువ వెన్నులు బయటకు రాకుండా తొడుగులోనే కుళ్ళిపోతే వెంటనే వ్యవసాయాధికారిని సంప్రదించండి.',
    confidence: 'verified',
    sources: 'ICAR-NRRI Cuttack, TNAU Rice Doctor.',
    crops: [
      { cropName: 'Paddy (Rice)', cropSlug: 'paddy', importance: 'primary' }
    ],
    symptomTags: [
      { tagSlug: 'part-stem', weight: 3.0, isPrimary: true },
      { tagSlug: 'pattern-rot', weight: 3.0, isPrimary: true },
      { tagSlug: 'colour-brown', weight: 2.5, isPrimary: true },
      { tagSlug: 'part-fruit-grain', weight: 2.0, isPrimary: false },
      { tagSlug: 'pattern-powdery-mould', weight: 1.5, isPrimary: false }
    ],
    images: [
      {
        path: '/problems/sheath-rot-paddy/choked-panicle-brown-boot-sheath.webp',
        caption: 'Choked panicle failing to emerge from rotting reddish-brown boot leaf sheath caused by Sarocladium oryzae.',
        captionKn: 'ಭತ್ತದ ಬಾವುಟ ಎಲೆಯ ಕೊಳೆತದಿಂದ ತೆನೆ ಹೊರಬಾರದೆ ಸಿಲುಕಿಕೊಂಡಿರುವ ಲಕ್ಷಣ.',
        kind: 'symptom_closeup',
        source: 'Wikimedia Commons',
        author: 'IRRI Rice Knowledge Bank',
        licence: 'CC BY-SA 3.0',
        attribution: 'IRRI / Wikimedia Commons',
        isPrimary: true
      }
    ]
  },

  // ==========================================
  // GROUNDNUT (ADDITIONAL)
  // ==========================================
  {
    slug: 'stem-rot-groundnut',
    name: 'Stem Rot / Southern Blight of Groundnut',
    nameKn: 'ಕಡಲೆಕಾಯಿ ಕಾಂಡ ಕೊಳೆ ರೋಗ (Stem Rot / Sclerotium Blight)',
    nameTa: 'வேர்க்கடலை தண்டு மற்றும் வேர் அழுகல் நோய்',
    nameTe: 'వేరుశనగ కాండం కుళ్ళు తెగులు',
    scientificName: 'Sclerotium rolfsii (Athelia rolfsii)',
    type: 'fungal',
    severity: 'critical',
    symptoms: 'Yellowing and wilting of one or more branches near the soil surface; base of the stem develops a brown water-soaked lesion covered with conspicuous fan-shaped radiating white mycelial threads spreading over stems, pegs, and pods; mustard-seed like round white-to-brown sclerotia form abundantly; pods detach and rot in soil.',
    symptomsKn: 'ಮಣ್ಣಿನ ಬಳಿ ಇರುವ ಕಾಂಡದ ಕೊಂಬೆಗಳು ಹಳದಿಯಾಗಿ ಬಾಡುತ್ತವೆ. ಕಾಂಡದ ಬುಡದಲ್ಲಿ ಬಿಳಿ ನೂಲಿನಂತಹ ಬೂಸ್ಟು ಬಲೆ ಹರಡಿರುತ್ತದೆ. ನಂತರ ಸಾಸಿವೆ ಕಾಳಿನಂತಹ ಕಂದು ಗುಳಿಗೆಗಳು (ಸ್ಕ್ಲೀರೋಶಿಯಾ) ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತವೆ. ನೆಲದಲ್ಲಿ ಕಾಯಿಗಳು ಕೊಳೆತು ಕಳಚಿ ಬೀಳುತ್ತವೆ.',
    symptomsTa: 'மண் மட்டத்தில் தண்டுப் பகுதியில் வெள்ளை பூசண இழைகள் படரும். கடுகு போன்ற உருண்டையான பழுப்பு மணிகள் தோன்றும். காய்கள் அழுகி மண்ணிலேயே உதிர்ந்து விடும்.',
    symptomsTe: 'నేల మట్టం వద్ద కొమ్మలు పసుపుగా మారి వాడిపోతాయి. మొదళ్లపై తెల్లటి బూజు దారాలు అల్లుకుంటాయి. ఆవాల వంటి గోధుమ రంగు గుళికలు కనిపిస్తాయి. కాయలు కుళ్ళి నేలలోనే రాలిపోతాయి.',
    cause: 'Soil-borne fungus Sclerotium rolfsii surviving as resistant sclerotial resting bodies.',
    favourableConditions: 'Warm humid soil (28-35°C), high organic matter on soil surface, alternating wet and dry soil conditions, and dense canopy.',
    favourableHumidity: '>80%',
    favourableTemp: '28-35°C',
    favourableSeasons: ['Kharif', 'Rabi'],
    affectedStages: ['Vegetative Growth', 'Flowering', 'Fruiting'],
    spreadPattern: 'Spreads rapidly in circular patches via mycelial bridges between touching dense foliage.',
    culturalControl: 'Deep summer ploughing to bury sclerotia below 15 cm. Avoid piling soil against plant crowns during intercultural weeding. Maintain crop rotation with non-hosts like maize or sorghum.',
    culturalControlKn: 'ಬೇಸಿಗೆಯಲ್ಲಿ ಆಳ ಉಳುಮೆ ಮಾಡಿ. ಎಡೆಕುಂಟೆ ಹೊಡೆಯುವಾಗ ಗಿಡಗಳ ಬುಡಕ್ಕೆ ಮಣ್ಣು ಹತ್ತದಂತೆ ಎಚ್ಚರ ವಹಿಸಿ. ಜೋಳದೊಂದಿಗೆ ಬೆಳೆ ಪರಿವರ್ತನೆ ಮಾಡಿ.',
    culturalControlTa: 'ஆழ உழவு செய்யவும். களை எடுக்கும் போது செடியின் மேல் மண் மூடாமல் பார்த்துக் கொள்ளவும். சோளத்துடன் பயிர் சுழற்சி செய்யவும்.',
    culturalControlTe: 'వేసవిలో లోతు దుక్కులు దున్నండి. కలుపు తీసేటప్పుడు మొదళ్లపై మట్టి పడకుండా చూసుకోండి. జొన్నతో పంట మార్పిడి చేయండి.',
    biologicalControl: 'Soil application of Trichoderma harzianum or Trichoderma viride enriched in farmyard manure (2 kg in 100 kg FYM/acre) applied along rows at 30-40 DAS.',
    biologicalControlKn: 'ಕೊಟ್ಟಿಗೆ ಗೊಬ್ಬರದಲ್ಲಿ ಬೆರೆಸಿದ ಟ್ರೈಕೋಡರ್ಮಾವನ್ನು 30-40 ದಿನಗಳಲ್ಲಿ ಸಾಲುಗಳ ಬದಿಯಲ್ಲಿ ಹಾಕಿ.',
    biologicalControlTa: 'டிரைக்கோடெர்மா கலந்த தொழுவுரத்தை 30-40 நாளில் செடிகளின் வேர் பகுதியில் இடவும்.',
    biologicalControlTe: 'ట్రైకోడెర్మా కలిపిన ఎరువును 30-40 రోజుల్లో సాళ్ల వెంట వేయండి.',
    organicControl: 'Apply neem cake (150 kg/acre) in furrows at sowing. Drench crown zones with cow dung slurry supernatant.',
    organicControlKn: 'ಬಿತ್ತನೆ ಸಾಲುಗಳಲ್ಲಿ ಎಕರೆಗೆ 150 ಕೆಜಿ ಬೇವಿನ ಹಿಂಡಿ ಹಾಕಿ.',
    organicControlTa: 'வேப்பம்பிண்ணாக்கு இடவும்.',
    organicControlTe: 'ఎకరానికి 150 కిలోల వేప పిండి వేయండి.',
    chemicalControl: 'Seed treatment with Tebuconazole or Carboxin + Thiram. Spot drenching of infected branch bases with Tebuconazole or Hexaconazole or Carbendazim. Note: Spray nozzle must be directed onto crown bases and pegs; follow package label.',
    chemicalControlKn: 'ಟೆಬುಕೊನಾಜೋಲ್ ನಿಂದ ಬೀಜೋಪಚಾರ ಮಾಡಿ. ರೋಗ ಕಂಡಾಗ ಬುಡಕ್ಕೆ ಹೆಕ್ಸಾಕೊನಾಜೋಲ್ ಅಥವಾ ಟೆಬುಕೊನಾಜೋಲ್ ದ್ರಾವಣ ಸುರಿಯಿರಿ. ಲೇಬಲ್ ಸೂಚನೆ ಪಾಲಿಸಿ.',
    chemicalControlTa: 'டெபுகோனசோல் கொண்டு விதை நேர்த்தி செய்யவும். வேர் பகுதியில் ஹெக்சாகோனசோல் கரைசல் ஊற்றவும்.',
    chemicalControlTe: 'టెబుకొనజోల్ తో విత్తన శుద్ధి చేయండి. మొదళ్ల వద్ద హెక్సాకొనజోల్ ద్రావణం పోయండి.',
    preventionSteps: ['Mandatory seed treatment.', 'Avoid injury to collar during weeding.', 'Row application of Trichoderma compost.'],
    preventionStepsKn: ['ಕಡ್ಡಾಯವಾಗಿ ಬೀಜೋಪಚಾರ ಮಾಡಿ.', 'ಕಳೆ ತೆಗೆಯುವಾಗ ಬುಡಕ್ಕೆ ಗಾಯವಾಗದಂತೆ ನೋಡಿಕೊಳ್ಳಿ.'],
    preventionStepsTa: ['கட்டாய விதை நேர்த்தி செய்யவும்.', 'களை எடுக்கும் போது காயம் படாமல் பார்த்துக் கொள்ளவும்.'],
    preventionStepsTe: ['విత్తన శుద్ధి తప్పనిసరిగా చేయండి.', 'కలుపు తీసేటప్పుడు గాయాలు కాకుండా చూసుకోండి.'],
    ipmSteps: [
      'Step 1: Deep moldboard summer ploughing.',
      'Step 2: Seed treatment with Tebuconazole.',
      'Step 3: Band application of Trichoderma enriched FYM at pegging (35-45 DAS).',
      'Step 4: Collar drenching of infected spots to prevent patch expansion.'
    ],
    ipmStepsKn: ['ಹಂತ 1: ಆಳ ಉಳುಮೆ', 'ಹಂತ 2: ಟೆಬುಕೊನಾಜೋಲ್ ಬೀಜೋಪಚಾರ', 'ಹಂತ 3: ಕಾಯಿ ಕಟ್ಟುವಾಗ ಟ್ರೈಕೋಡರ್ಮಾ ಕಾಂಪೋಸ್ಟ್', 'ಹಂತ 4: ಬುಡಕ್ಕೆ ಶಿಲೀಂಧ್ರನಾಶಕ'],
    ipmStepsTa: ['படி 1: ஆழ உழவு', 'படி 2: விதை நேர்த்தி', 'படி 3: டிரைக்கோடெர்மா உரம்', 'படி 4: வேர் நனைத்தல்'],
    ipmStepsTe: ['దశ 1: లోతు దుక్కి', 'దశ 2: విత్తన శుద్ధి', 'దశ 3: ట్రైకోడెర్మా ఎరువు', 'దశ 4: మొదళ్ల తడపడం'],
    safetyNotes: 'Ensure soil is moist before applying chemical drenching around plant crowns.',
    lookAlikes: [
      { name: 'Collar Rot of Groundnut (Aspergillus niger)', difference: 'Collar rot causes black sooty spore powder at seedling stage; stem rot causes white mycelial fans with brown mustard-like sclerotia on mature plants.' },
      { name: 'Groundnut Root Rot (Macrophomina)', difference: 'Macrophomina root rot causes dry splintered black taproots without white radiating surface mycelium.' }
    ],
    whenToCallExpert: 'Call Raitha Samparka Kendra or KVK if white fungal mycelium and sclerotia appear on groundnut branch bases during pod formation.',
    whenToCallExpertKn: 'ಕಾಯಿ ಕಟ್ಟುವಾಗ ಕಡಲೆಕಾಯಿ ಬುಡದಲ್ಲಿ ಬಿಳಿ ಬೂಸ್ಟು ಬಲೆ ಮತ್ತು ಸಾಸಿವೆಯಂತಹ ಕಾಳುಗಳು ಕಂಡರೆ ತಕ್ಷಣ ಕೃಷಿ ಅಧಿಕಾರಿಯನ್ನು ಸಂಪರ್ಕಿಸಿ.',
    whenToCallExpertTa: 'காய் பிடிக்கும் பருவத்தில் வெள்ளை பூசணமும் கடுகு போன்ற மணிகளும் தோன்றினால் வேளாண் அலுவலரை அணுகவும்.',
    whenToCallExpertTe: 'కాయ దశలో మొక్కల మొదళ్ల వద్ద తెల్లటి బూజు మరియు ఆవాల వంటి గింజలు కనిపిస్తే వెంటనే వ్యవసాయాధికారిని సంప్రదించండి.',
    confidence: 'verified',
    sources: 'ICAR-DGR Junagadh (Directorate of Groundnut Research), UAS Dharwad.',
    crops: [
      { cropName: 'Groundnut (Peanut)', cropSlug: 'groundnut', importance: 'primary' }
    ],
    symptomTags: [
      { tagSlug: 'part-stem', weight: 3.0, isPrimary: true },
      { tagSlug: 'part-root', weight: 2.5, isPrimary: true },
      { tagSlug: 'pattern-rot', weight: 3.0, isPrimary: true },
      { tagSlug: 'pattern-powdery-mould', weight: 2.5, isPrimary: true },
      { tagSlug: 'spread-patches', weight: 2.5, isPrimary: true }
    ],
    images: [
      {
        path: '/problems/stem-rot-groundnut/white-mycelium-mustard-sclerotia.webp',
        caption: 'White fan-shaped fungal mycelium and mustard-seed sclerotial bodies rotting stem crown and pegs of groundnut.',
        captionKn: 'ಕಡಲೆಕಾಯಿ ಕಾಂಡದ ಮೇಲೆ ಹರಡಿರುವ ಬಿಳಿ ಬೂಸ್ಟು ಮತ್ತು ಸಾಸಿವೆ ಕಾಳಿನಂತಹ ಕಂದು ಸ್ಕ್ಲೀರೋಶಿಯಾ.',
        kind: 'symptom_closeup',
        source: 'Wikimedia Commons',
        author: 'Clemson University - USDA Extension',
        licence: 'CC BY 3.0',
        attribution: 'Clemson University / Wikimedia Commons',
        isPrimary: true
      }
    ]
  },

  // ==========================================
  // TOMATO / NURSERY (ADDITIONAL)
  // ==========================================
  {
    slug: 'damping-off-tomato',
    name: 'Damping Off of Vegetable Seedlings (Tomato, Chilli, Brinjal)',
    nameKn: 'ತರಕಾರಿ ಸಸಿಗಳ ಬುಡ ಕೊಳೆ ರೋಗ / ಮೊಳಕೆ ಕೊಳೆ ರೋಗ (Damping Off)',
    nameTa: 'காய்கறி நாற்று அழுகல் நோய்',
    nameTe: 'కూరగాయ నారు కుళ్ళు తెగులు',
    scientificName: 'Pythium aphanidermatum & Rhizoctonia solani',
    type: 'fungal',
    severity: 'critical',
    symptoms: 'Pre-emergence: Seeds rot and decompose before sprouting; Post-emergence: Water-soaked soft brown lesion girdles the tender seedling stem at soil level (collar line); the stem constricts, softens, collapses and falls flat on the nursery bed while leaves are still green; seedlings die in rapidly expanding circular sunken patches.',
    symptomsKn: 'ಮೊಳಕೆ ಒಡೆಯುವ ಮುನ್ನ ಬೀಜ ಕೊಳೆಯುತ್ತದೆ. ಮೊಳಕೆ ಬಂದ ನಂತರ ಮಣ್ಣಿನ ಮಟ್ಟದ ಬಳಿ ಸಸಿಗಳ ಬುಡ ಮೆದುವಾಗಿ ಕೊಳೆತು ಸಣ್ಣದಾಗುತ್ತದೆ. ಸಸಿಗಳು ಹಸಿರಾಗಿದ್ದರೂ ಮಣ್ಣಿನ ಮೇಲೆ ಉರುಳಿ ಬೀಳುತ್ತವೆ. ನರ್ಸರಿ ಮಡಿಯಲ್ಲಿ ವೃತ್ತಾಕಾರದಲ್ಲಿ ಎಲ್ಲಾ ಸಸಿಗಳು ಕೊಳೆತು ಸಾಯುತ್ತವೆ.',
    symptomsTa: 'முளைப்பதற்கு முன் விதை அழுகும். முளைத்த பின் மண் மட்டத்தில் தண்டு மென்மையாகி அழுகும். இலைகள் பச்சையாக இருக்கும் போதே நாற்றுகள் முறிந்து படுக்கையாக விழும். நாற்றங்காலில் வட்டமாக நாற்றுகள் அழியும்.',
    symptomsTe: 'మొలకెత్తక ముందే విత్తనాలు కుళ్ళిపోతాయి. మొలకెత్తిన తర్వాత నేల మట్టం వద్ద లేత కాండం మెత్తబడి కుళ్ళిపోతుంది. ఆకులు పచ్చగా ఉన్నప్పుడే నారు నేలరాలి పడిపోతుంది. నారుమడిలో గుండ్రని మచ్చలుగా నారు చనిపోతుంది.',
    cause: 'Soil-inhabiting water moulds Pythium aphanidermatum and Rhizoctonia solani.',
    favourableConditions: 'Excessive watering, poorly drained dense nursery beds, overcast rainy weather, high soil moisture, and shade.',
    favourableHumidity: '>90%',
    favourableTemp: '25-30°C',
    favourableSeasons: ['Kharif', 'Rabi', 'Zaid'],
    affectedStages: ['Seedling'],
    spreadPattern: 'Swimming zoospores move rapidly through free surface water films in waterlogged seedbeds.',
    culturalControl: 'Prepare raised nursery beds (15 cm high) with gentle slope for water runoff. Avoid overcrowded dense sowing; thin seedlings to allow air circulation. Avoid excessive or afternoon watering. Solarize nursery soil with transparent polythene in summer.',
    culturalControlKn: '15 ಸೆಂ.ಮೀ ಎತ್ತರದ ಮಡಿಗಳನ್ನು ಮಾಡಿ. ಬೀಜಗಳನ್ನು ತುಂಬಾ ಒತ್ತೊತ್ತಾಗಿ ಬಿತ್ತಬೇಡಿ. ಮಡಿಯಲ್ಲಿ ನೀರು ನಿಲ್ಲದಂತೆ ನೋಡಿಕೊಳ್ಳಿ. ಬೇಸಿಗೆಯಲ್ಲಿ ಪಾಲಿಥೀನ್ ಹೊದಿಸಿ ಮಣ್ಣಿನ ಸೌರೀಕರಣ ಮಾಡಿ.',
    culturalControlTa: '15 செ.மீ உயரமான மேட்டுப்பாத்தி அமைக்கவும். அடர்த்தியாக விதைக்க வேண்டாம். நீர் தேங்காமல் பார்த்துக் கொள்ளவும். கோடையில் பாலித்தீன் விரித்து சூரிய ஒளியேற்றவும்.',
    culturalControlTe: '15 సెం.మీ ఎత్తైన నారుమడులు చేయండి. విత్తనాలు మరీ దగ్గరగా వేయవద్దు. నీరు నిలవకుండా చూసుకోండి. వేసవిలో ప్లాస్టిక్ కప్పి సౌరీకరణ చేయండి.',
    biologicalControl: 'Seed treatment with Trichoderma viride or Pseudomonas fluorescens (10 g/kg seed). Mix Trichoderma in vermicompost and apply to nursery bed.',
    biologicalControlKn: 'ಟ್ರೈಕೋಡರ್ಮಾ ಅಥವಾ ಸ್ಯೂಡೋಮೊನಾಸ್‌ನಿಂದ ಬೀಜೋಪಚಾರ ಮಾಡಿ. ಎರೆಹುಳು ಗೊಬ್ಬರದೊಂದಿಗೆ ಟ್ರೈಕೋಡರ್ಮಾ ಬೆರೆಸಿ ಮಡಿಗೆ ಹಾಕಿ.',
    biologicalControlTa: 'டிரைக்கோடெர்மா கொண்டு விதை நேர்த்தி செய்து மண்புழு உரத்துடன் பாத்தியில் இடவும்.',
    biologicalControlTe: 'ట్రైకోడెర్మతో విత్తన శుద్ధి చేసి వర్మీకంపోస్ట్‌తో కలిపి నారుమడిలో వేయండి.',
    organicControl: 'Drench nursery beds with 1% Bordeaux mixture or 5% cow urine-asafoetida decoction at first symptom.',
    organicControlKn: 'ರೋಗ ಕಂಡ ತಕ್ಷಣ ನರ್ಸರಿ ಮಡಿಗೆ 1% ಬೋರ್ಡೋ ದ್ರಾವಣ ಸುರಿಯಿರಿ.',
    organicControlTa: 'பாத்தியில் 1% போர்டோ கலவை ஊற்றவும்.',
    organicControlTe: 'నారుమడిలో 1% బోర్డో మిశ్రమం పోయండి.',
    chemicalControl: 'Seed treatment with Thiram or Captan or Metalaxyl. Drench nursery beds with Copper Oxychloride or Metalaxyl + Mancozeb as soon as first seedling topples. Note: Spray or drench gently so soil is not displaced; follow label directions.',
    chemicalControlKn: 'ಕ್ಯಾಪ್ಟಾನ್‌ನಿಂದ ಬೀಜೋಪಚಾರ ಮಾಡಿ. ಸಸಿ ಬಿದ್ದ ತಕ್ಷಣ ಮಡಿಗೆ ಕಾಪರ್ ಆಕ್ಸಿಕ್ಲೋರೈಡ್ ಅಥವಾ ಮೆಟಲಾಕ್ಸಿಲ್ ದ್ರಾವಣ ಸುರಿಯಿರಿ. ಲೇಬಲ್ ಸೂಚನೆ ಪಾಲಿಸಿ.',
    chemicalControlTa: 'விதை நேர்த்தி செய்யவும். காப்பர் ஆக்ஸிகுளோரைடு கரைசல் கொண்டு பாத்தியை நனைக்கவும்.',
    chemicalControlTe: 'విత్తన శుద్ధి చేయండి. కాపర్ ఆక్సిక్లోరైడ్ ద్రావణంతో నారుమడిని తడపండి.',
    preventionSteps: ['Always raise seedlings on elevated beds.', 'Mandatory seed treatment.', 'Avoid over-watering in cloudy weather.'],
    preventionStepsKn: ['ಯಾವಾಗಲೂ ಎತ್ತರಿಸಿದ ಮಡಿಗಳಲ್ಲಿ ಸಸಿ ಬೆಳೆಯಿರಿ.', 'ಕಡ್ಡಾಯವಾಗಿ ಬೀಜೋಪಚಾರ ಮಾಡಿ.', 'ಮಳೆಗಾಲದಲ್ಲಿ ಅತಿಯಾಗಿ ನೀರು ಹಾಕಬೇಡಿ.'],
    preventionStepsTa: ['எப்போதும் மேட்டுப்பாத்தி அமைக்கவும்.', 'விதை நேர்த்தி செய்யவும்.', 'அதிக நீர் பாய்ச்ச வேண்டாம்.'],
    preventionStepsTe: ['ఎల్లప్పుడూ ఎత్తైన మడులను తయారు చేయండి.', 'విత్తన శుద్ధి చేయండి.', 'ఎక్కువ నీరు పెట్టవద్దు.'],
    ipmSteps: [
      'Step 1: Raised nursery beds (15 cm height).',
      'Step 2: Summer soil solarization with 25-micron polythene sheet for 4 weeks.',
      'Step 3: Bio-fungicide Trichoderma seed treatment and bed enrichment.',
      'Step 4: Prophylactic Copper Oxychloride drenching if wet overcast weather persists.'
    ],
    ipmStepsKn: ['ಹಂತ 1: ಎತ್ತರಿಸಿದ ಮಡಿ', 'ಹಂತ 2: ಮಣ್ಣಿನ ಸೌರೀಕರಣ', 'ಹಂತ 3: ಟ್ರೈಕೋಡರ್ಮಾ ಬೀಜೋಪಚಾರ', 'ಹಂತ 4: ಮುಂಜಾಗ್ರತಾ ಬೋರ್ಡೋ ಅಥವಾ ಕಾಪರ್ ದ್ರಾವಣ'],
    ipmStepsTa: ['படி 1: மேட்டுப்பாத்தி', 'படி 2: சூரிய ஒளியேற்றம்', 'படி 3: விதை நேர்த்தி', 'படி 4: காப்பர் நனைத்தல்'],
    ipmStepsTe: ['దశ 1: ఎత్తైన మడులు', 'దశ 2: మట్టి సౌరీకరణ', 'దశ 3: విత్తన శుద్ధి', 'దశ 4: కాపర్ మందు తడపడం'],
    safetyNotes: 'Wear waterproof gloves when applying fungicide drench to nursery soil beds.',
    lookAlikes: [
      { name: 'Cutworm Injury', difference: 'Cutworms physically snip off seedling stems at ground level with missing plant bits, without soft water-soaked rotting lesions.' },
      { name: 'Bacterial Wilt', difference: 'Bacterial wilt causes rapid wilting in grown transplanted bushes in the main field, not nursery seedling toppling.' }
    ],
    whenToCallExpert: 'Call local KVK or horticulture officer if seedlings collapse in expanding circular patches in vegetable nurseries.',
    whenToCallExpertKn: 'ನರ್ಸರಿ ಮಡಿಯಲ್ಲಿ ಸಸಿಗಳು ಗುಂಪು ಗುಂಪಾಗಿ ಕೊಳೆತು ಬೀಳುತ್ತಿದ್ದರೆ ತಕ್ಷಣ ತೋಟಗಾರಿಕಾ ತಜ್ಞರನ್ನು ಸಂಪರ್ಕಿಸಿ.',
    whenToCallExpertTa: 'நாற்றங்காலில் நாற்றுகள் வட்ட வடிவில் சாய்ந்து மடிந்தால் தோட்டக்கலை அலுவலரை அணுகவும்.',
    whenToCallExpertTe: 'నారుమడిలో నారు గుండ్రని మచ్చలుగా కుళ్ళి పడిపోతుంటే వెంటనే ఉద్యాన అధికారిని సంప్రదించండి.',
    confidence: 'verified',
    sources: 'ICAR-IIHR Bengaluru, UAS Bangalore Horticulture Division.',
    crops: [
      { cropName: 'Tomato', cropSlug: 'tomato', importance: 'primary' },
      { cropName: 'Chilli (Green / Dry)', cropSlug: 'chilli', importance: 'primary' }
    ],
    symptomTags: [
      { tagSlug: 'part-root', weight: 3.0, isPrimary: true },
      { tagSlug: 'part-stem', weight: 2.5, isPrimary: true },
      { tagSlug: 'pattern-rot', weight: 3.0, isPrimary: true },
      { tagSlug: 'pattern-wilting', weight: 2.5, isPrimary: true },
      { tagSlug: 'spread-patches', weight: 2.5, isPrimary: true }
    ],
    images: [
      {
        path: '/problems/damping-off-tomato/collapsed-seedling-water-soaked-collar.webp',
        caption: 'Toppled vegetable seedling with water-soaked constricted brown collar rot caused by Pythium damping-off.',
        captionKn: 'ಮಣ್ಣಿನ ಮಟ್ಟದಲ್ಲಿ ಕೊಳೆತು ಉರುಳಿ ಬಿದ್ದಿರುವ ತರಕಾರಿ ಸಸಿ.',
        kind: 'symptom_closeup',
        source: 'Wikimedia Commons',
        author: 'Howard F. Schwartz, Colorado State University',
        licence: 'CC BY 3.0',
        attribution: 'Howard F. Schwartz / Wikimedia Commons',
        isPrimary: true
      }
    ]
  },

  // ==========================================
  // MAIZE (ABIOTIC NUTRIENT DEFICIENCY)
  // ==========================================
  {
    slug: 'zinc-deficiency-maize',
    name: 'Zinc Deficiency in Maize (White Bud Disease)',
    nameKn: 'ಮುಸುಕಿನ ಜೋಳದ ಸತು (ಜಿಂಕ್) ಕೊರತೆ / ಬಿಳಿ ಮೊಗ್ಗು ರೋಗ (White Bud)',
    nameTa: 'மக்காச்சோளம் துத்தநாகக் குறைபாடு',
    nameTe: 'మొక్కజొన్న జింక్ లోపం (వైట్ బడ్)',
    scientificName: 'Nutritional Disorder (Zinc Deficiency)',
    type: 'nutrient_deficiency',
    severity: 'medium',
    symptoms: 'Broad creamy-white to pale yellow bleached bands appear on both sides of the midrib on young expanding leaves, starting from the leaf base; midrib and leaf margins remain green; newly emerging central whorl leaves are completely bleached white ("White Bud"); plants are severely stunted with shortened internodes giving a bushy appearance.',
    symptomsKn: 'ಎಳೆ ಎಲೆಗಳ ಮುಖ್ಯ ನರದ ಎರಡೂ ಬದಿಗಳಲ್ಲಿ ಬುಡದಿಂದ ಬಿಳಿ-ತಿಳಿ ಹಳದಿ ಬಣ್ಣದ ಅಗಲವಾದ ಪಟ್ಟೆಗಳು ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತವೆ. ಮುಖ್ಯ ನರ ಮತ್ತು ಎಲೆಯ ಅಂಚುಗಳು ಹಸಿರಾಗಿಯೇ ಇರುತ್ತವೆ. ಸುಳಿಯಿಂದ ಹೊರಬರುವ ಹೊಸ ಮೊಗ್ಗು ಬಿಳಿಯಾಗಿರುತ್ತದೆ (ವೈಟ್ ಬಡ್). ಗಿಡ ಗಿಡ್ಡವಾಗಿ ಬೆಳವಣಿಗೆ ಕುಂಠಿತವಾಗುತ್ತದೆ.',
    symptomsTa: 'இளம் இலைகளில் நடு நரம்பின் இருபுறமும் அடிப்பகுதியிலிருந்து அகன்ற வெள்ளை-மஞ்சள் பட்டைகள் தோன்றும். நரம்பும் விளிம்பும் பச்சையாக இருக்கும். நடுக்குருத்து முழுவதும் வெண்மையாக மாறும் (White bud). செடி குட்டையாகும்.',
    symptomsTe: 'లేత ఆకులపై ఈనెకు ఇరువైపులా మొదలు నుండి వెడల్పాటి తెల్లటి-లేత పసుపు చారలు ఏర్పడతాయి. ఈనె మరియు ఆకు అంచులు పచ్చగానే ఉంటాయి. కొత్తగా వచ్చే నడిమొవ్వు పూర్తిగా తెల్లగా మారుతుంది ("వైట్ బడ్"). మొక్కలు గిడసబారిపోతాయి.',
    cause: 'Inadequate available zinc in alkaline, calcareous, or heavily phosphated soils.',
    favourableConditions: 'High soil pH (>7.5), calcareous soils, cold wet spring soils restricting root uptake, and excessive phosphorus application.',
    favourableHumidity: 'Any',
    favourableTemp: 'Any',
    favourableSeasons: ['Kharif', 'Rabi'],
    affectedStages: ['Seedling', 'Vegetative Growth'],
    spreadPattern: 'Non-parasitic; uniformly widespread across alkaline patches or field sections with topsoil removal.',
    culturalControl: 'Apply zinc sulfate (ZnSO4 21% @ 10-15 kg/acre) as basal soil application during final land preparation once every 2-3 years. Avoid mixing zinc sulfate directly with phosphatic fertilizers (DAP/SSP) in the same furrow to prevent insoluble zinc phosphate precipitation.',
    culturalControlKn: 'ಬಿತ್ತನೆ ಮುನ್ನ ಎಕರೆಗೆ 10-15 ಕೆಜಿ ಜಿಂಕ್ ಸಲ್ಫೇಟ್ ಅನ್ನು ಮಣ್ಣಿಗೆ ಹಾಕಿ (2-3 ವರ್ಷಕ್ಕೊಮ್ಮೆ). ಜಿಂಕ್ ಸಲ್ಫೇಟ್ ಅನ್ನು ಡಿಎಪಿ ಅಥವಾ ರಂಜಕದ ಗೊಬ್ಬರದೊಂದಿಗೆ ಬೆರೆಸಿ ಹಾಕಬೇಡಿ.',
    culturalControlTa: 'விதைப்புக்கு முன் ஏக்கருக்கு 10-15 கிலோ துத்தநாக சல்பேட்டை அடியுரமாக இடவும். இதை டிஏபி உரத்துடன் கலந்து இடக்கூடாது.',
    culturalControlTe: 'నాటడానికి ముందు ఎకరానికి 10-15 కిలోల జింక్ సల్ఫేట్ ను ఆఖరి దుక్కిలో వేయండి. డిఎపితో కలిపి వేయవద్దు.',
    biologicalControl: 'Inoculate with Zinc Solubilizing Bacteria (ZSB - Bacillus megaterium or Pseudomonas) at 2 kg/acre mixed in FYM.',
    biologicalControlKn: 'ಜಿಂಕ್ ಕರಗಿಸುವ ಜೈವಿಕ ಬ್ಯಾಕ್ಟೀರಿಯಾವನ್ನು ಕೊಟ್ಟಿಗೆ ಗೊಬ್ಬರದೊಂದಿಗೆ ಬೆರೆಸಿ ಭೂಮಿಗೆ ಹಾಕಿ.',
    biologicalControlTa: 'துத்தநாகத்தை கரைக்கும் பாக்டீரியாவை தொழுவுரத்துடன் கலந்து இடவும்.',
    biologicalControlTe: 'జింక్ కరిగించే బ్యాక్టీరియాను సేంద్రియ ఎరువుతో కలిపి నేలలో వేయండి.',
    organicControl: 'Apply enriched FYM / compost with cow dung and zinc solubilizers.',
    organicControlKn: 'ಕೊಟ್ಟಿಗೆ ಗೊಬ್ಬರ ಮತ್ತು ಕಾಂಪೋಸ್ಟ್ ಬಳಕೆಯನ್ನು ಹೆಚ್ಚಿಸಿ.',
    organicControlTa: 'மக்கிய தொழுவுரம் அதிகமாக இடவும்.',
    organicControlTe: 'బాగా చివికిన పశువుల ఎరువును వాడండి.',
    chemicalControl: 'Foliar corrective spray: Spray Zinc Sulfate (0.5% i.e. 5 g/L) + Lime (0.25% i.e. 2.5 g/L) or Chelated Zinc (Zn-EDTA 12% @ 1 g/L) at 30 and 45 days after sowing. Note: Neutralize zinc sulfate with slaked lime to prevent leaf scorching; consult local KVK.',
    chemicalControlKn: 'ಪರಿಹಾರಕ್ಕಾಗಿ ಎಲೆಗಳ ಮೇಲೆ 0.5% ಜಿಂಕ್ ಸಲ್ಫೇಟ್ (ಲೀಟರ್ ನೀರಿಗೆ 5 ಗ್ರಾಂ) + 0.25% ಸುಣ್ಣದ ತಿಳಿನೀರು ಅಥವಾ ಜಿಂಕ್-ಇಡಿಟಿಎ (1 ಗ್ರಾಂ/ಲೀ) ಸಿಂಪಡಿಸಿ. ಲೇಬಲ್ ಸೂಚನೆ ಪಾಲಿಸಿ.',
    chemicalControlTa: '0.5% துத்தநாக சல்பேட் உடன் 0.25% சுண்ணாம்பு கலந்து இலைகளில் தெளிக்கவும்.',
    chemicalControlTe: '0.5% జింక్ సల్ఫేట్ + 0.25% సున్నం కలిపి లేదా చిలేటెడ్ జింక్ (1 గ్రా/లీ) ఆకులపై పిచికారీ చేయండి.',
    preventionSteps: ['Basal zinc sulfate soil application.', 'Never mix zinc with phosphate fertilizers.', 'Foliar spray at 30 days if bleached stripes appear.'],
    preventionStepsKn: ['ಆರಂಭದಲ್ಲೇ ಜಿಂಕ್ ಸಲ್ಫೇಟ್ ಮಣ್ಣಿಗೆ ಹಾಕಿ.', 'ಡಿಎಪಿ ಜೊತೆ ಜಿಂಕ್ ಬೆರೆಸಬೇಡಿ.'],
    preventionStepsTa: ['அடியுரமாக துத்தநாக சல்பேட் இடவும்.', 'டிஏபி உடன் கலக்கக்கூடாது.'],
    preventionStepsTe: ['జింక్ సల్ఫేట్ ముందే వేయండి.', 'డిఎపితో కలపవద్దు.'],
    ipmSteps: [
      'Step 1: Soil testing to determine available zinc levels.',
      'Step 2: Basal application of ZnSO4 (10 kg/acre).',
      'Step 3: Inoculation with Zinc Solubilizing Biofertilizers (ZSB).',
      'Step 4: Two foliar corrective sprays of neutralized ZnSO4 at 30 and 45 DAS.'
    ],
    ipmStepsKn: ['ಹಂತ 1: ಮಣ್ಣು ಪರೀಕ್ಷೆ', 'ಹಂತ 2: ಜಿಂಕ್ ಸಲ್ಫೇಟ್ ಬುಡಕ್ಕೆ ಹಾಕುವುದು', 'ಹಂತ 3: ಜಿಂಕ್ ಕರಗಿಸುವ ಜೀವಾಣು', 'ಹಂತ 4: ಸುಣ್ಣ ಬೆರೆಸಿದ ಜಿಂಕ್ ದ್ರಾವಣ ಸಿಂಪರಣೆ'],
    ipmStepsTa: ['படி 1: மண் பரிசோதனை', 'படி 2: அடியுரம்', 'படி 3: உயிர் உரம்', 'படி 4: துத்தநாக கரைசல் தெளிப்பு'],
    ipmStepsTe: ['దశ 1: నేల పరీక్ష', 'దశ 2: అడుగు మందుగా జింక్', 'దశ 3: జీవన ఎరువులు', 'దశ 4: పైరుపై జింక్ పిచికారీ'],
    safetyNotes: 'Always neutralize commercial zinc sulfate with slaked lime or use chelated Zn-EDTA to avoid leaf scorching.',
    lookAlikes: [
      { name: 'Downy Mildew (Peronosclerospora sorghi)', difference: 'Downy mildew causes narrow chlorotic stripes with downy white fungal spores on the underside in early mornings; zinc deficiency causes broad white bands along midrib without any fungal spores.' },
      { name: 'Iron Deficiency', difference: 'Iron deficiency shows uniform interveinal chlorosis (yellowing between veins) over the entire young leaf, not broad bleached white bands.' }
    ],
    whenToCallExpert: 'Call local KVK soil scientist if central whorl shoots turn white and seedlings remain stunted despite adequate NPK application.',
    whenToCallExpertKn: 'ರಸಗೊಬ್ಬರ ಹಾಕಿದರೂ ಸುಳಿಯ ಮೊಗ್ಗು ಬಿಳಿಯಾಗಿ ಸಸಿಗಳು ಗಿಡ್ಡವಾಗಿದ್ದರೆ ತಕ್ಷಣ ಮಣ್ಣು ವಿಜ್ಞಾನಿ ಅಥವಾ ಕೃಷಿ ಅಧಿಕಾರಿಯನ್ನು ಸಂಪರ್ಕಿಸಿ.',
    whenToCallExpertTa: 'உரமிட்டும் குருத்து வெண்மையாகி செடிகள் குட்டையானால் வேளாண் அலுவலரை அணுகவும்.',
    whenToCallExpertTe: 'ఎరువులు వేసినా సుడి తెల్లబడి మొక్కలు గిడసబారితే వెంటనే వ్యవసాయాధికారిని సంప్రదించండి.',
    confidence: 'verified',
    sources: 'ICAR-IIMR Ludhiana / Hyderabad, UAS Bangalore Department of Soil Science.',
    crops: [
      { cropName: 'Maize (Corn)', cropSlug: 'maize', importance: 'primary' },
      { cropName: 'Paddy (Rice)', cropSlug: 'paddy', importance: 'secondary' }
    ],
    symptomTags: [
      { tagSlug: 'part-leaf', weight: 3.0, isPrimary: true },
      { tagSlug: 'pattern-streaks', weight: 3.0, isPrimary: true },
      { tagSlug: 'colour-white-grey', weight: 3.0, isPrimary: true },
      { tagSlug: 'pattern-stunting', weight: 2.5, isPrimary: true },
      { tagSlug: 'colour-yellow', weight: 2.0, isPrimary: false }
    ],
    images: [
      {
        path: '/problems/zinc-deficiency-maize/white-bud-bleached-leaf-bands.webp',
        caption: 'Broad bleached white bands along leaf midrib and white emerging whorl ("White Bud") caused by zinc deficiency in maize.',
        captionKn: 'ಮುಸುಕಿನ ಜೋಳದಲ್ಲಿ ಜಿಂಕ್ ಕೊರತೆಯಿಂದ ಎಲೆಯ ನರದ ಬದಿಯಲ್ಲಿ ಉಂಟಾದ ಬಿಳಿ ಪಟ್ಟೆಗಳು.',
        kind: 'symptom_closeup',
        source: 'Wikimedia Commons',
        author: 'R.L. Croissant, Colorado State University',
        licence: 'CC BY 3.0',
        attribution: 'R.L. Croissant / Wikimedia Commons',
        isPrimary: true
      }
    ]
  }
];
