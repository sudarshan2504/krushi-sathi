import { SeedProblem } from './seedProblems';

export const PROBLEMS_DATA_PART4: SeedProblem[] = [
  // ==========================================
  // MAIZE PROBLEMS
  // ==========================================
  {
    slug: 'downy-mildew-maize',
    name: 'Sorghum / Maize Downy Mildew (Crazy Top)',
    nameKn: 'ಮುಸುಕಿನ ಜೋಳದ ಬೆಂಕಿ ರೋಗ / ಕ್ರೇಜಿ ಟಾಪ್ (Downy Mildew)',
    nameTa: 'மக்காச்சோளம் அடிச்சாம்பல் நோய்',
    nameTe: 'మొక్కజొన్న బూజు తెగులు',
    scientificName: 'Peronosclerospora sorghi',
    type: 'fungal',
    severity: 'critical',
    symptoms: 'Vivid chlorotic yellow-white stripes on leaves running from base to tip; downy white fungal growth visible on leaf undersides in early morning dampness; severe stunting and proliferation of tassel into leafy structures ("crazy top"), with complete sterility or no cob formation.',
    symptomsKn: 'ಎಲೆಗಳ ಬುಡದಿಂದ ತುದಿಯವರೆಗೆ ಹಳದಿ-ಬಿಳಿ ಉದ್ದನೆಯ ಪಟ್ಟೆಗಳು ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತವೆ. ಮುಂಜಾನೆ ತಂಪಿನಲ್ಲಿ ಎಲೆಯ ಕೆಳಭಾಗದಲ್ಲಿ ಬಿಳಿ ಬೂಸ್ಟು ಪುಡಿ ಇರುತ್ತದೆ. ಸಸಿ ಕುಂಠಿತವಾಗಿ ತೆನೆಯು ಎಲೆಗಳಂತೆ ವಿರೂಪಗೊಳ್ಳುತ್ತದೆ (ಕ್ರೇಜಿ ಟಾಪ್).',
    symptomsTa: 'இலைகளில் அடிப்பகுதியில் இருந்து நுனி வரை மஞ்சள்-வெள்ளை கோடுகள் தோன்றும். அதிகாலை வேளையில் இலைகளின் அடியில் வெள்ளை பூசண வளர்ச்சி தெரியும். குருத்து இலைகள் போல் உருமாறும்.',
    symptomsTe: 'ఆకులపై మొదలు నుండి చివర వరకు పసుపు-తెలుపు చారలు ఏర్పడతాయి. ఉదయాన్నే ఆకుల కింద తెల్లటి బూజు కనిపిస్తుంది. వెన్ను వికృతంగా మారి గింజలు పట్టవు.',
    cause: 'Oomycete fungus Peronosclerospora sorghi surviving in soil oospores and internally seed-borne.',
    favourableConditions: 'Drizzling rain, cool nights (20-24°C), high morning humidity (>90%), and early sowing in infected fields.',
    favourableHumidity: '>90%',
    favourableTemp: '20-25°C',
    favourableSeasons: ['Kharif'],
    affectedStages: ['Seedling', 'Vegetative Growth'],
    spreadPattern: 'Soil-borne oospores infect germinating seedlings systemically; airborne conidia spread secondary infection.',
    culturalControl: 'Uproot and burn infected "crazy top" plants early before spore dispersal. Crop rotation with non-host pulses. Plant resistant hybrids like COH(M) 5 or local recommended UAS/TNAU hybrids.',
    culturalControlKn: 'ರೋಗ ಕಂಡ ಸಸಿಗಳನ್ನು ತಕ್ಷಣ ಕಿತ್ತು ಸುಟ್ಟುಹಾಕಿ. ದ್ವಿದಳ ಧಾನ್ಯಗಳೊಂದಿಗೆ ಬೆಳೆ ಪರಿವರ್ತನೆ ಮಾಡಿ. ಶಿಫಾರಸು ಮಾಡಿದ ಪ್ರತಿರೋಧಕ ತಳಿಗಳನ್ನು ಬಿತ್ತಿ.',
    culturalControlTa: 'பாதிக்கப்பட்ட செடிகளை உடனே பிடுங்கி எரிக்கவும். பயிர் சுழற்சி செய்யவும். எதிர்ப்பு ரகங்களை பயிரிடவும்.',
    culturalControlTe: 'తెగులు సోకిన మొక్కలను పీకి కాల్చేయండి. పంట మార్పిడి చేయండి. నిరోధక రకాలను ఎంచుకోండి.',
    biologicalControl: 'Seed treatment with Pseudomonas fluorescens or Trichoderma viride.',
    biologicalControlKn: 'ಸ್ಯೂಡೋಮೊನಾಸ್ ಅಥವಾ ಟ್ರೈಕೋಡರ್ಮಾದಿಂದ ಕಡ್ಡಾಯ ಬೀಜೋಪಚಾರ ಮಾಡಿ.',
    biologicalControlTa: 'சூடோமோனாஸ் கொண்டு விதை நேர்த்தி செய்யவும்.',
    biologicalControlTe: 'సూడోమోనాస్‌తో విత్తన శుద్ధి చేయండి.',
    organicControl: 'Foliar spray of 1% Bordeaux mixture or 5% butter-milk fermented solution on early vegetative seedlings.',
    organicControlKn: 'ಸಸಿ ಹಂತದಲ್ಲಿ 1% ಬೋರ್ಡೋ ದ್ರಾವಣ ಸಿಂಪಡಿಸಿ.',
    organicControlTa: '1% போர்டோ கலவை தெளிக்கவும்.',
    organicControlTe: '1% బోర్డో మిశ్రమం పిచికారీ చేయండి.',
    chemicalControl: 'Seed treatment with Metalaxyl-M or Metalaxyl + Mancozeb. Foliar spray of Metalaxyl + Mancozeb at 20 days after sowing if early stripes appear. Note: Read label directions; consult local KVK.',
    chemicalControlKn: 'ಮೆಟಲಾಕ್ಸಿಲ್ ಅಥವಾ ಮೆಟಲಾಕ್ಸಿಲ್ + ಮ್ಯಾಂಕೋಜೆಬ್‌ನಿಂದ ಬೀಜೋಪಚಾರ ಮಾಡಿ. ರೋಗ ಕಂಡಾಗ ಸಿಂಪಡಿಸಿ. ಲೇಬಲ್ ಸೂಚನೆ ಪಾಲಿಸಿ.',
    chemicalControlTa: 'மெட்டலாக்சில் கொண்டு விதை நேர்த்தி செய்யவும். தேவைப்பட்டால் பயிரில் தெளிக்கவும்.',
    chemicalControlTe: 'మెటలాక్సిల్ తో విత్తన శుద్ధి చేయండి. అవసరమైతే పైరుపై పిచికారీ చేయండి.',
    preventionSteps: ['Mandatory systemic fungicidal seed treatment.', 'Avoid fields with downy mildew history without rotation.'],
    preventionStepsKn: ['ಕಡ್ಡಾಯವಾಗಿ ಶಿಲೀಂಧ್ರನಾಶಕ ಬೀಜೋಪಚಾರ ಮಾಡಿ.', 'ಹಿಂದೆ ರೋಗ ಬಂದ ಜಮೀನಿನಲ್ಲಿ ಬೆಳೆ ಪರಿವರ್ತನೆ ಮಾಡಿ.'],
    preventionStepsTa: ['கட்டாய விதை நேர்த்தி செய்யவும்.', 'பயிர் சுழற்சி மேற்கொள்ளவும்.'],
    preventionStepsTe: ['తప్పనిసరిగా విత్తన శుద్ధి చేయండి.', 'పంట మార్పిడి పాటించండి.'],
    ipmSteps: [
      'Step 1: Certified resistant hybrid seed.',
      'Step 2: Seed treatment with Metalaxyl.',
      'Step 3: Systematic rogueing and burial of systemic chlorotic seedlings at 15-20 DAS.',
      'Step 4: Protective foliar systemic fungicide if heavy rains occur in early crop.'
    ],
    ipmStepsKn: ['ಹಂತ 1: ಉತ್ತಮ ತಳಿ ಆಯ್ಕೆ', 'ಹಂತ 2: ಮೆಟಲಾಕ್ಸಿಲ್ ಬೀಜೋಪಚಾರ', 'ಹಂತ 3: ರೋಗಪೀಡಿತ ಸಸಿಗಳ ನಾಶ', 'ಹಂತ 4: ಸಕಾಲದಲ್ಲಿ ಸಿಂಪರಣೆ'],
    ipmStepsTa: ['படி 1: நல்ல ரகம் தேர்வு', 'படி 2: விதை நேர்த்தி', 'படி 3: பாதிக்கப்பட்ட செடிகளை நீக்குதல்', 'படி 4: பூஞ்சாணக்கொல்லி தெளிப்பு'],
    ipmStepsTe: ['దశ 1: మంచి రకం', 'దశ 2: విత్తన శుద్ధి', 'దశ 3: తెగులు మొక్కల ఏరివేత', 'దశ 4: అవసరమైతే పిచికారీ'],
    safetyNotes: 'Wear gloves during seed treatment. Do not use treated grain for animal feed or human consumption.',
    lookAlikes: [
      { name: 'Zinc Deficiency in Maize (White Bud)', difference: 'Zinc deficiency causes broad white bleaching on both sides of midrib without downy white fungal growth underneath or crazy-top tassel distortion.' },
      { name: 'Maize Stripe Virus', difference: 'Stripe virus shows continuous narrow yellow chlorotic stripes without downy spores on undersides.' }
    ],
    whenToCallExpert: 'Call local KVK or Raitha Samparka Kendra if downy white growth appears on leaf undersides before 30 days after sowing.',
    whenToCallExpertKn: 'ಬಿತ್ತಿದ 30 ದಿನಗಳ ಒಳಗೆ ಎಲೆಗಳ ಕೆಳಗೆ ಬಿಳಿ ಬೂಸ್ಟು ಕಂಡರೆ ತಕ್ಷಣ ಕೃಷಿ ಅಧಿಕಾರಿಯನ್ನು ಸಂಪರ್ಕಿಸಿ.',
    whenToCallExpertTa: '30 நாட்களுக்குள் இலைகளின் அடியில் வெள்ளை பூசணம் தெரிந்தால் வேளாண் அலுவலரை அழைக்கவும்.',
    whenToCallExpertTe: '30 రోజుల్లోపు ఆకుల కింద తెల్లటి బూజు కనిపిస్తే వెంటనే వ్యవసాయాధికారిని సంప్రదించండి.',
    confidence: 'verified',
    sources: 'ICAR-IIMR Ludhiana/Hyderabad, UAS Bangalore Package of Practices.',
    crops: [
      { cropName: 'Maize (Corn)', cropSlug: 'maize', importance: 'primary' },
      { cropName: 'Sorghum (Jowar)', cropSlug: 'sorghum', importance: 'secondary' }
    ],
    symptomTags: [
      { tagSlug: 'part-leaf', weight: 3.0, isPrimary: true },
      { tagSlug: 'pattern-streaks', weight: 3.0, isPrimary: true },
      { tagSlug: 'pattern-powdery-mould', weight: 2.5, isPrimary: true },
      { tagSlug: 'colour-white-grey', weight: 2.0, isPrimary: false },
      { tagSlug: 'pattern-stunting', weight: 2.0, isPrimary: false }
    ],
    images: [
      {
        path: '/problems/downy-mildew-maize/downy-mildew-chlorotic-stripes.webp',
        caption: 'Chlorotic systemic yellow-white striping on young maize leaves with downy fungal growth on underside.',
        captionKn: 'ಮುಸುಕಿನ ಜೋಳದ ಎಲೆಯ ಮೇಲೆ ಹಳದಿ-ಬಿಳಿ ಉದ್ದನೆಯ ಪಟ್ಟೆಗಳು ಮತ್ತು ಕೆಳಗೆ ಬಿಳಿ ಬೂಸ್ಟು.',
        kind: 'symptom_closeup',
        source: 'Wikimedia Commons',
        author: 'Howard F. Schwartz, Colorado State University',
        licence: 'CC BY 3.0',
        attribution: 'Howard F. Schwartz / Wikimedia Commons',
        isPrimary: true
      }
    ]
  },
  {
    slug: 'stem-borer-maize',
    name: 'Spotted Stem Borer of Maize and Sorghum',
    nameKn: 'ಮುಸುಕಿನ ಜೋಳದ ಕಾಂಡ ಕೊರೆಯುವ ಹುಳು (Spotted Stem Borer)',
    nameTa: 'மக்காச்சோளம் தண்டு துளைப்பான்',
    nameTe: 'మొక్కజొన్న కాండం తొలుచు పురుగు',
    scientificName: 'Chilo partellus',
    type: 'insect_pest',
    severity: 'high',
    symptoms: 'Young larvae feed inside the leaf whorl making pinholes and parallel rows of oblong holes across expanding leaves ("shot holes"); caterpillar bores down the central stem causing drying of central shoot ("Dead Heart"); boreholes with wet reddish-brown frass on stems.',
    symptomsKn: 'ಸುಳಿಯ ಎಲೆಗಳನ್ನು ಹುಳು ತಿಂದು ಎಲೆ ಬಿಚ್ಚಿದಾಗ ಸಮಾನಾಂತರ ರಂಧ್ರಗಳು ಕಾಣಿಸುತ್ತವೆ (ಶಾಟ್ ಹೋಲ್ಸ್). ಕಾಂಡವನ್ನು ಕೊರೆದು ಸುಳಿ ಒಣಗಿಸುತ್ತದೆ (ಡೆಡ್ ಹಾರ್ಟ್). ಕಾಂಡದ ಮೇಲೆ ರಂಧ್ರ ಮತ್ತು ಕಂದು ಹಿಕ್ಕೆಗಳು ಕಾಣಿಸುತ್ತವೆ.',
    symptomsTa: 'சுருள் இலைகளில் ஒரே நேர்கோட்டில் வரிசையாக துளைகள் தோன்றும் (Shot holes). தண்டுக்குள் துளைத்து நடுக்குருத்தை காய வைக்கும் (Dead heart).',
    symptomsTe: 'సుడిలోని ఆకులను తినడం వల్ల ఆకులు విచ్చుకున్నప్పుడు వరుసగా గుళిక రంధ్రాలు కనిపిస్తాయి. కాండంలోకి తొలిచి సుడి ఎండిపోయేలా చేస్తుంది.',
    cause: 'Larvae of the moth Chilo partellus boring into whorls and stems.',
    favourableConditions: 'Moderate temperatures (25-30°C), warm humid weather, and continuous overlapping cereal cultivation.',
    favourableHumidity: '65-80%',
    favourableTemp: '25-32°C',
    favourableSeasons: ['Kharif', 'Rabi'],
    affectedStages: ['Vegetative Growth', 'Tillering'],
    spreadPattern: 'Moths lay scale-like eggs on leaf undersides; young larvae crawl to whorls and later bore into stems.',
    culturalControl: 'Intercrop maize with cowpea or lablab. Pull out and destroy dead heart plants with larvae inside. Chop and burn or compost dry maize stalks after harvest to destroy diapausing larvae.',
    culturalControlKn: 'ಅಲಸಂದಿ ಅಥವಾ ಅವರೆಯೊಂದಿಗೆ ಮಿಶ್ರಬೆಳೆ ಬೆಳೆಯಿರಿ. ಡೆಡ್ ಹಾರ್ಟ್ ಆದ ಸಸಿಗಳನ್ನು ಕೀಟ ಸಮೇತ ನಾಶಪಡಿಸಿ. ಕಟಾವಿನ ನಂತರ ಕಡ್ಡಿಗಳನ್ನು ಸುಟ್ಟುಹಾಕಿ.',
    culturalControlTa: 'தட்டப்பயறு ஊடுபயிரிடவும். காய்ந்த குருத்து செடிகளை அழிக்கவும். அறுவடைக்கு பின் தட்டைகளை அழிக்கவும்.',
    culturalControlTe: 'అలసందలు అంతరపంటగా వేయండి. ఎండిన సుడులు ఉన్న మొక్కలను పీకి నాశనం చేయండి.',
    biologicalControl: 'Release Trichogramma chilonis at 20,000 parasitoids/acre at 15 and 25 days after sowing. Conserve predatory spiders and carabid beetles.',
    biologicalControlKn: 'ಬಿತ್ತಿದ 15 ಮತ್ತು 25 ದಿನಗಳಲ್ಲಿ ಟ್ರೈಕೋಗ್ರಾಮಾ ಪರಾವಲಂಬಿ ಕೀಟಗಳನ್ನು ಬಿಡಿ.',
    biologicalControlTa: 'டிரைக்கோகிரம்மா சிலோனிஸ் ஒட்டுண்ணிகளை வயலில் விடவும்.',
    biologicalControlTe: 'ట్రైకోగ్రామా కార్డులను పొలంలో అమర్చండి.',
    organicControl: 'Apply fine sand mixed with neem seed kernel powder (NSKP) or wood ash (3:1 ratio) directly into the leaf whorls at 25-30 DAS.',
    organicControlKn: 'ಮರಳು ಮತ್ತು ಬೇವಿನ ಪುಡಿ ಅಥವಾ ಬೂದಿಯನ್ನು ಸುಳಿಯೊಳಗೆ ಹಾಕಿ.',
    organicControlTa: 'மணல் மற்றும் வேப்பம்பொடி கலவையை குருத்தில் இடவும்.',
    organicControlTe: 'ఇసుక మరియు వేప పొడి మిశ్రమాన్ని సుడిలో వేయండి.',
    chemicalControl: 'Foliar spray of Chlorantraniliprole or Emamectin Benzoate targeted directly into the whorls if dead hearts exceed 10%. Note: Apply into leaf whorls; follow label instructions.',
    chemicalControlKn: 'ಹಾನಿ ಹೆಚ್ಚಿದ್ದರೆ ಸುಳಿಯೊಳಗೆ ನೇರವಾಗಿ ಕ್ಲೋರಾಂಟ್ರಾನಿಲಿಪ್ರೋಲ್ ಅಥವಾ ಎಮಾಮೆಕ್ಟಿನ್ ಬೆಂಜೊಯೇಟ್ ಸಿಂಪಡಿಸಿ. ಲೇಬಲ್ ಸೂಚನೆ ಪಾಲಿಸಿ.',
    chemicalControlTa: 'சேதம் அதிகமானால் குளோரான்ட்ரனிலிப்ரோல் மருந்தை குருத்தில் தெளிக்கவும்.',
    chemicalControlTe: 'ఉధృతి ఎక్కువగా ఉంటే క్లోరాంట్రానిలిప్రోల్ సుడిలో పడేలా పిచికారీ చేయండి.',
    preventionSteps: ['Destroy stubbles of previous crop.', 'Intercrop with pulses.', 'Scout for pinhole leaf damage early.'],
    preventionStepsKn: ['ಹಿಂದಿನ ಬೆಳೆಯ ಉಳಿಕೆಗಳನ್ನು ನಾಶಪಡಿಸಿ.', 'ದ್ವಿದಳ ಧಾನ್ಯಗಳನ್ನು ಮಿಶ್ರಬೆಳೆಯಾಗಿ ಬೆಳೆಯಿರಿ.'],
    preventionStepsTa: ['பயிர் கழிவுகளை அழிக்கவும்.', 'பயறு வகை பயிர்களை ஊடுபயிரிடவும்.'],
    preventionStepsTe: ['పంట వ్యర్థాలను నాశనం చేయండి.', 'అంతరపంటలు వేయండి.'],
    ipmSteps: [
      'Step 1: Stubble management after harvest.',
      'Step 2: Intercropping with cowpea (2:1 or 4:1).',
      'Step 3: Pheromone traps for moth monitoring.',
      'Step 4: Whorl application of sand/neem or microbial Bacillus thuringiensis.',
      'Step 5: Selective insecticide whorl spray only if ETL crossed.'
    ],
    ipmStepsKn: ['ಹಂತ 1: ಕಡ್ಡಿ ಕಸ ನಾಶ', 'ಹಂತ 2: ಅಲಸಂದಿ ಮಿಶ್ರಬೆಳೆ', 'ಹಂತ 3: ಮೋಹಕ ಬಲೆ', 'ಹಂತ 4: ಸುಳಿಗೆ ಮರಳು-ಬೇವಿನ ಪುಡಿ', 'ಹಂತ 5: ಅಗತ್ಯವಿದ್ದಾಗ ಕೀಟನಾಶಕ'],
    ipmStepsTa: ['படி 1: தட்டை மேலாண்மை', 'படி 2: தட்டப்பயறு ஊடுபயிர்', 'படி 3: இனக்கவர்ச்சி பொறி', 'படி 4: குருத்தில் வேப்பம்பொடி', 'படி 5: குருத்து தெளிப்பு'],
    ipmStepsTe: ['దశ 1: వ్యర్థాల నాశనం', 'దశ 2: అంతరపంట', 'దశ 3: లింగాకర్షక బుట్టలు', 'దశ 4: సుడిలో వేప పొడి', 'దశ 5: పురుగుమందు'],
    safetyNotes: 'Wear eye protection when placing granules or directed spray into deep leaf whorls.',
    lookAlikes: [
      { name: 'Fall Armyworm (Spodoptera frugiperda)', difference: 'Fall Armyworm caterpillars have an inverted Y mark on head and 4 square spots on 8th abdominal segment, producing heavy ragged defoliation and dense wet frass clumps in whorl.' },
      { name: 'Pink Stem Borer (Sesamia inferens)', difference: 'Sesamia larva is pinkish without distinct dark spots on the body.' }
    ],
    whenToCallExpert: 'Call local KVK or RSK if more than 10% seedlings show dead hearts within 30-45 days of germination.',
    whenToCallExpertKn: '30-45 ದಿನಗಳಲ್ಲಿ 10% ಕ್ಕಿಂತ ಹೆಚ್ಚು ಗಿಡಗಳಲ್ಲಿ ಸುಳಿ ಒಣಗಿದರೆ ತಕ್ಷಣ ಕೃಷಿ ಅಧಿಕಾರಿಗಳನ್ನು ಸಂಪರ್ಕಿಸಿ.',
    whenToCallExpertTa: '10% மேற்பட்ட குருத்துக்கள் காய்ந்தால் உடனடியாக வேளாண் அலுவலரை அணுகவும்.',
    whenToCallExpertTe: '10% కంటే ఎక్కువ సుడులు ఎండిపోతే వెంటనే వ్యవసాయాధికారిని సంప్రదించండి.',
    confidence: 'verified',
    sources: 'ICAR-IIMR Hyderabad / UAS Dharwad.',
    crops: [
      { cropName: 'Maize (Corn)', cropSlug: 'maize', importance: 'primary' },
      { cropName: 'Sorghum (Jowar)', cropSlug: 'sorghum', importance: 'primary' }
    ],
    symptomTags: [
      { tagSlug: 'part-stem', weight: 3.0, isPrimary: true },
      { tagSlug: 'pattern-dead-heart', weight: 3.0, isPrimary: true },
      { tagSlug: 'pattern-holes', weight: 2.5, isPrimary: true },
      { tagSlug: 'part-leaf', weight: 2.0, isPrimary: false },
      { tagSlug: 'pattern-insects-visible', weight: 1.5, isPrimary: false }
    ],
    images: [
      {
        path: '/problems/stem-borer-maize/pinholes-shot-holes-maize-leaf.webp',
        caption: 'Characteristic horizontal parallel pinholes and shot-holes on expanding maize leaf whorl caused by Chilo partellus.',
        captionKn: 'ಮುಸುಕಿನ ಜೋಳದ ಸುಳಿಯ ಎಲೆಗಳ ಮೇಲೆ ಸಮಾನಾಂತರ ರಂಧ್ರಗಳು.',
        kind: 'symptom_closeup',
        source: 'Wikimedia Commons',
        author: 'Georg Goergen / IITA',
        licence: 'CC BY-SA 4.0',
        attribution: 'Georg Goergen / IITA / Wikimedia Commons',
        isPrimary: true
      }
    ]
  },

  // ==========================================
  // RAGI (FINGER MILLET) PROBLEMS
  // ==========================================
  {
    slug: 'foot-rot-ragi',
    name: 'Foot Rot / Collar Rot of Finger Millet (Ragi)',
    nameKn: 'ರಾಗಿಯ ಬುಡ ಕೊಳೆ ರೋಗ / ಕಾಲು ಕೊಳೆ ರೋಗ (Foot Rot)',
    nameTa: 'கேழ்வரகு அடி அழுகல் நோய்',
    nameTe: 'రాగి మొదలు కుళ్ళు తెగులు',
    scientificName: 'Sclerotium rolfsii',
    type: 'fungal',
    severity: 'high',
    symptoms: 'Brown water-soaked lesion appears at the collar region near soil line; fan-shaped radiating white silky mycelial threads spread over stem base and surrounding soil; small mustard seed-like round brown sclerotial bodies form on mycelium; infected tillers turn yellow, wilt and lodge.',
    symptomsKn: 'ಮಣ್ಣಿನ ಮಟ್ಟದ ಬಳಿ ರಾಗಿ ಸಸಿಗಳ ಬುಡ ಕೊಳೆಯುತ್ತದೆ. ಬಿಳಿ ಬಣ್ಣದ ನೂಲಿನಂತಹ ಬೂಸ್ಟು ಬಲೆ ಹರಡುತ್ತದೆ. ನಂತರ ಸಾಸಿವೆ ಕಾಳಿನಂತಹ ಕಂದು ಗುಳಿಗೆಗಳು (ಸ್ಕ್ಲೀರೋಶಿಯಾ) ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತವೆ. ಸಸಿಗಳು ಹಳದಿಯಾಗಿ ಬಾಡಿ ಬೀಳುತ್ತವೆ.',
    symptomsTa: 'மண் மட்டத்தில் பயிரின் அடிப்பகுதி அழுகும். வெண்மையான பூசண இழைகள் படரும். கடுகு போன்ற பழுப்பு நிற மணிகள் தோன்றும். செடிகள் மஞ்சளாகி வாடி விழும்.',
    symptomsTe: 'నేల మట్టం వద్ద రాగి మొక్కల మొదలు కుళ్ళిపోతుంది. తెల్లటి దారాల వంటి బూజు ఏర్పడుతుంది. ఆవాల వంటి గోధుమ రంగు గింజలు కనిపిస్తాయి. మొక్కలు పసుపుగా మారి ఎండిపోతాయి.',
    cause: 'Soil-borne fungus Sclerotium rolfsii surviving as resistant sclerotia in soil.',
    favourableConditions: 'High soil moisture combined with warm temperatures (28-35°C), poorly drained soils, and high organic residue on surface.',
    favourableHumidity: '>80%',
    favourableTemp: '28-35°C',
    favourableSeasons: ['Kharif'],
    affectedStages: ['Seedling', 'Tillering'],
    spreadPattern: 'Spreads in circular patches in low-lying damp areas of the field.',
    culturalControl: 'Deep summer ploughing to bury sclerotia. Avoid waterlogging; provide good drainage. Apply well-rotted FYM. Rotate with non-susceptible crops like maize.',
    culturalControlKn: 'ಬೇಸಿಗೆಯಲ್ಲಿ ಆಳವಾಗಿ ಉಳುಮೆ ಮಾಡಿ. ನೀರು ನಿಲ್ಲದಂತೆ ಬಸಿಗಾಲುವೆ ಮಾಡಿ. ಚೆನ್ನಾಗಿ ಕೊಳೆತ ಕೊಟ್ಟಿಗೆ ಗೊಬ್ಬರ ಬಳಸಿ.',
    culturalControlTa: 'ஆழ உழவு செய்யவும். பாத்தி அமைத்து வடிகால் வசதி செய்யவும். மக்கிய எரு இடவும்.',
    culturalControlTe: 'వేసవిలో లోతు దుక్కులు దున్నండి. మురుగు నీరు పోయేలా కాలువలు తీయండి. బాగా చివికిన ఎరువు వాడండి.',
    biologicalControl: 'Soil application of Trichoderma viride or Trichoderma harzianum enriched in FYM (2 kg in 100 kg FYM/acre) during land preparation.',
    biologicalControlKn: 'ಕೊಟ್ಟಿಗೆ ಗೊಬ್ಬರದೊಂದಿಗೆ ಟ್ರೈಕೋಡರ್ಮಾ ಬೆರೆಸಿ ಭೂಮಿಗೆ ಹಾಕಿ.',
    biologicalControlTa: 'டிரைக்கோடெர்மா கலந்த தொழுவுரத்தை நிலத்தில் இடவும்.',
    biologicalControlTe: 'ట్రైకోడెర్మా కలిపిన పశువుల ఎరువును భూమిలో వేయండి.',
    organicControl: 'Apply neem cake (100 kg/acre) in planting furrows. Drench infected patch root zones with 10% cow dung slurry.',
    organicControlKn: 'ಎಕರೆಗೆ 100 ಕೆಜಿ ಬೇವಿನ ಹಿಂಡಿ ಹಾಕಿ.',
    organicControlTa: 'வேப்பம்பிண்ணாக்கு இடவும்.',
    organicControlTe: 'ఎకరానికి 100 కిలోల వేప పిండి వేయండి.',
    chemicalControl: 'Seed treatment with Thiram or Captan. Spot drenching of infected patches with Carbendazim or Hexaconazole. Note: Follow container label; consult UAS Bangalore / KVK experts.',
    chemicalControlKn: 'ಕ್ಯಾಪ್ಟಾನ್‌ನಿಂದ ಬೀಜೋಪಚಾರ ಮಾಡಿ. ರೋಗ ಕಂಡ ಜಾಗಕ್ಕೆ ಬುಡಕ್ಕೆ ಕಾರ್ಬೆಂಡಾಜಿಮ್ ಅಥವಾ ಹೆಕ್ಸಾಕೊನಾಜೋಲ್ ದ್ರಾವಣ ಸುರಿಯಿರಿ. ಲೇಬಲ್ ಸೂಚನೆ ಪಾಲಿಸಿ.',
    chemicalControlTa: 'விதை நேர்த்தி செய்யவும். பாதித்த இடத்தில் கார்பென்டாசிம் கரைசல் ஊற்றவும்.',
    chemicalControlTe: 'విత్తన శుద్ధి చేయండి. తెగులు సోకిన మొదళ్ల వద్ద కార్బెంజెడిమ్ ద్రావణం పోయండి.',
    preventionSteps: ['Ensure surface drainage.', 'Enrich field with Trichoderma.', 'Seed treatment is essential.'],
    preventionStepsKn: ['ಹೊಲದಲ್ಲಿ ನೀರು ನಿಲ್ಲದಂತೆ ನೋಡಿಕೊಳ್ಳಿ.', 'ಟ್ರೈಕೋಡರ್ಮಾ ಬಳಸಿ.', 'ಕಡ್ಡಾಯವಾಗಿ ಬೀಜೋಪಚಾರ ಮಾಡಿ.'],
    preventionStepsTa: ['வடிகால் வசதி அமைக்கவும்.', 'டிரைக்கோடெர்மா பயன்படுத்தவும்.'],
    preventionStepsTe: ['మురుగు నీటి పారుదల కల్పించండి.', 'ట్రైకోడెర్మా వాడండి.'],
    ipmSteps: [
      'Step 1: Deep summer ploughing.',
      'Step 2: Seed treatment with Trichoderma.',
      'Step 3: Soil enrichment with Trichoderma-neem compost.',
      'Step 4: Spot drenching of early patches.'
    ],
    ipmStepsKn: ['ಹಂತ 1: ಆಳ ಉಳುಮೆ', 'ಹಂತ 2: ಬೀಜೋಪಚಾರ', 'ಹಂತ 3: ಟ್ರೈಕೋಡರ್ಮಾ ಕಾಂಪೋಸ್ಟ್', 'ಹಂತ 4: ಬುಡಕ್ಕೆ ದ್ರಾವಣ ಸುರಿಯುವುದು'],
    ipmStepsTa: ['படி 1: ஆழ உழவு', 'படி 2: விதை நேர்த்தி', 'படி 3: இயற்கை உரம்', 'படி 4: வேர் நனைத்தல்'],
    ipmStepsTe: ['దశ 1: లోతు దుక్కి', 'దశ 2: విత్తన శుద్ధి', 'దశ 3: సేంద్రియ ఎరువు', 'దశ 4: మొదళ్ల తడపడం'],
    safetyNotes: 'Wear waterproof footwear and rubber gloves when drenching chemicals near soil root zones.',
    lookAlikes: [
      { name: 'Ragi Blast (Neck / Finger Blast)', difference: 'Blast affects leaves, neck and fingers with spindle lesions and blackened panicles; foot rot is strictly confined to collar base with white mycelial fans and brown mustard-like sclerotia.' },
      { name: 'Termite Damage', difference: 'Termites physically hollow out the stem and roots with earth tubes without white mycelium or sclerotia.' }
    ],
    whenToCallExpert: 'Call Raitha Samparka Kendra if ragi seedlings die in expanding circular patches during damp warm spells.',
    whenToCallExpertKn: 'ರಾಗಿ ಸಸಿಗಳು ಗುಂಪು ಗುಂಪಾಗಿ ಒಣಗಿ ಸಾಯುತ್ತಿದ್ದರೆ ತಕ್ಷಣ ರೈತ ಸಂಪರ್ಕ ಕೇಂದ್ರವನ್ನು ಸಂಪರ್ಕಿಸಿ.',
    whenToCallExpertTa: 'நாற்றுகள் வட்ட வடிவில் காய்ந்து மடிந்தால் உடனே வேளாண் அலுவலரை அணுகவும்.',
    whenToCallExpertTe: 'మొక్కలు గుండ్రని మచ్చలుగా చనిపోతుంటే వెంటనే రైతు భరోసా కేంద్రాన్ని సంప్రదించండి.',
    confidence: 'verified',
    sources: 'UAS Bangalore All India Coordinated Research Project on Small Millets (AICRP).',
    crops: [
      { cropName: 'Finger Millet (Ragi)', cropSlug: 'finger-millet', importance: 'primary' }
    ],
    symptomTags: [
      { tagSlug: 'part-root', weight: 3.0, isPrimary: true },
      { tagSlug: 'part-stem', weight: 2.5, isPrimary: true },
      { tagSlug: 'pattern-rot', weight: 3.0, isPrimary: true },
      { tagSlug: 'pattern-powdery-mould', weight: 2.0, isPrimary: false },
      { tagSlug: 'spread-patches', weight: 2.5, isPrimary: true }
    ],
    images: [
      {
        path: '/problems/foot-rot-ragi/sclerotium-white-mycelium-collar.webp',
        caption: 'White fan-shaped fungal mycelium and brown mustard-seed sclerotia at collar base of wilting finger millet tiller.',
        captionKn: 'ರಾಗಿ ಬುಡದಲ್ಲಿ ಹರಡಿರುವ ಬಿಳಿ ಬೂಸ್ಟು ಮತ್ತು ಸಾಸಿವೆ ಕಾಳಿನಂತಹ ಕಂದು ಸ್ಕ್ಲೀರೋಶಿಯಾ.',
        kind: 'symptom_closeup',
        source: 'Wikimedia Commons',
        author: 'UAS Bangalore AICRP Millets',
        licence: 'CC BY-SA 4.0',
        attribution: 'UAS Bangalore / Wikimedia Commons',
        isPrimary: true
      }
    ]
  },

  // ==========================================
  // COTTON PROBLEMS
  // ==========================================
  {
    slug: 'whitefly-cotton',
    name: 'Cotton Whitefly and Sooty Mould',
    nameKn: 'ಹತ್ತಿಯ ಬಿಳಿ ನೊಣ ಮತ್ತು ಕಪ್ಪು ಕಾಡಿಗೆ ರೋಗ (Cotton Whitefly)',
    nameTa: 'பருத்தி வெள்ளை ஈ தாக்குதல்',
    nameTe: 'పత్తి తెల్లదోమ మరియు మసి తెగులు',
    scientificName: 'Bemisia tabaci',
    type: 'insect_pest',
    severity: 'critical',
    symptoms: 'Clouds of tiny powdery white flies flutter when crop canopy is shaken; leaves become chlorotic, curl downwards, and dry prematurely; profuse sticky honeydew excretions cover upper leaf surfaces, developing dense black sooty mould (Capnodium sp.) that blocks photosynthesis; vector of Cotton Leaf Curl Virus.',
    symptomsKn: 'ಗಿಡ ಅಲ್ಲಾಡಿಸಿದಾಗ ಸಣ್ಣ ಬಿಳಿ ನೊಣಗಳು ಹಾರಾಡುತ್ತವೆ. ಎಲೆಗಳು ಹಳದಿಯಾಗಿ ಕೆಳಮುಖವಾಗಿ ಮುದುರುತ್ತವೆ. ಎಲೆಗಳ ಮೇಲೆ ಜಿಗುಟಾದ ದ್ರವ ಶೇಖರಣೆಯಾಗಿ ಕಪ್ಪು ಬೂಸ್ಟು (ಕಾಡಿಗೆ ರೋಗ) ಬೆಳೆಯುತ್ತದೆ. ಇದು ಎಲೆ ಮುದುರು ವೈರಸ್ ರೋಗವನ್ನು ಹರಡುತ್ತದೆ.',
    symptomsTa: 'செடிகளை அசைத்தால் சிறிய வெள்ளை ஈக்கள் பறக்கும். இலைகள் மஞ்சளாகி கருகும். இலைகளின் மேல் பிசுபிசுப்பான தேன் போன்ற திரவம் சுரந்து கரும்பூசணம் படரும்.',
    symptomsTe: 'మొక్కలను కదిలిస్తే చిన్న తెల్లటి దోమలు ఎగురుతాయి. ఆకులపై జిగురు పదార్థం ఏర్పడి నల్లటి మసి బూజు పడుతుంది. ఆకు ముడుత వైరస్‌ను వ్యాపింపజేస్తుంది.',
    cause: 'Sap-sucking insect Bemisia tabaci transmitting geminiviruses and excreting honeydew.',
    favourableConditions: 'Hot dry weather (30-38°C), prolonged rain-free spells, excessive nitrogen fertilizer application, and close planting.',
    favourableHumidity: '40-60%',
    favourableTemp: '30-38°C',
    favourableSeasons: ['Kharif'],
    affectedStages: ['Vegetative Growth', 'Flowering', 'Fruiting'],
    spreadPattern: 'Fast reproduction during dry sunny weather; adults fly actively on gentle breezes across fields.',
    culturalControl: 'Install yellow sticky traps at 20-25 traps/acre just above crop canopy. Avoid excessive nitrogenous fertilizers. Maintain wider row spacing. Grow border crops like maize or pearl millet as barrier rows.',
    culturalControlKn: 'ಎಕರೆಗೆ 20-25 ಹಳದಿ ಜಿಗುಟು ಬಲೆಗಳನ್ನು ಬೆಳೆಯ ಮೇಲ್ಭಾಗದಲ್ಲಿ ಅಳವಡಿಸಿ. ಅತಿಯಾದ ಯೂರಿಯಾ ಬಳಸಬೇಡಿ. ಜೋಳವನ್ನು ಸುತ್ತಲೂ ತಡೆ ಬೆಳೆಯಾಗಿ ಬೆಳೆಯಿರಿ.',
    culturalControlTa: 'ஏக்கருக்கு 20-25 மஞ்சள் ஒட்டும் பொறிகளை பயிருக்கு மேலே வைக்கவும். தழைச்சத்தை குறைக்கவும். மக்காச்சோளத்தை வரப்பு பயிராக நடவும்.',
    culturalControlTe: 'ఎకరానికి 20-25 పసుపు జిగురు బుట్టలను పైరు పైన అమర్చండి. యూరియా ఎక్కువగా వాడకండి. జొన్న లేదా మొక్కజొన్నను సరిహద్దు పంటగా వేయండి.',
    biologicalControl: 'Spray bio-agent Lecanicillium lecanii or Beauveria bassiana targeted at lower leaf surfaces. Conserve natural predators like Chrysoperla zastrowi (green lacewing) and ladybird beetles.',
    biologicalControlKn: 'ಎಲೆಗಳ ತಳಭಾಗಕ್ಕೆ ಲೆಕಾನಿಸಿಲಿಯಮ್ ಅಥವಾ ಬ್ಯೂವೇರಿಯಾ ಜೈವಿಕ ಕೀಟನಾಶಕ ಸಿಂಪಡಿಸಿ. ಕ್ರೈಸೋಪರ್ಲಾ ಪರಭಕ್ಷಕ ಕೀಟಗಳನ್ನು ರಕ್ಷಿಸಿ.',
    biologicalControlTa: 'வெர்ட்டிசீலியம் அல்லது பவேரியா பூஞ்சாணத்தை இலைகளின் அடியில் தெளிக்கவும்.',
    biologicalControlTe: 'వర్టిసిలియం లేదా బవేరియా ద్రావణాన్ని ఆకుల కింద పిచికారీ చేయండి.',
    organicControl: 'Foliar spray of 5% Neem Seed Kernel Extract (NSKE) or Neem oil (1500 ppm) with soap solution.',
    organicControlKn: 'ಬೇವಿನ ಬೀಜದ ಕಷಾಯ (NSKE 5%) ಅಥವಾ ಬೇವಿನ ಎಣ್ಣೆ ಸಿಂಪಡಿಸಿ.',
    organicControlTa: '5% வேப்பங்கொட்டை கரைசல் அல்லது வேப்ப எண்ணெய் தெளிக்கவும்.',
    organicControlTe: '5% వేప గింజల కషాయం లేదా వేప నూనె పిచికారీ చేయండి.',
    chemicalControl: 'Foliar spray of Diafenthiuron or Pyriproxyfen or Spiromesifen or Dinotefuran or Flonicamid when ETL (6-8 whiteflies/leaf) is reached. Note: Rotate chemical classes to prevent resistance; follow label directions.',
    chemicalControlKn: 'ಬಿಳಿ ನೊಣಗಳು ಹೆಚ್ಚಾದಾಗ ಡಯಾಫೆಂಥಿಯುರಾನ್ ಅಥವಾ ಪೈರಿಪ್ರಾಕ್ಸಿಫೆನ್ ಅಥವಾ ಫ್ಲೋನಿಕಾಮಿಡ್ ಸಿಂಪಡಿಸಿ. ಲೇಬಲ್ ಸೂಚನೆ ಪಾಲಿಸಿ.',
    chemicalControlTa: 'தாக்குதல் தீவிரமடைந்தால் டயாபெந்தியூரான் அல்லது பைரிபிராக்சிபேன் தெளிக்கவும்.',
    chemicalControlTe: 'దోమ ఉధృతి పెరిగినప్పుడు డయాఫెంథియురాన్ లేదా పైరిప్రాక్సిఫెన్ పిచికారీ చేయండి.',
    preventionSteps: ['Always erect yellow sticky traps early.', 'Avoid synthetic pyrethroid sprays early as they cause whitefly resurgence.', 'Sow border barrier rows.'],
    preventionStepsKn: ['ಹಳದಿ ಜಿಗುಟು ಬಲೆಗಳನ್ನು ಮುಂಚಿತವಾಗಿ ಅಳವಡಿಸಿ.', 'ಆರಂಭದಲ್ಲಿ ಸಿಂಥೆಟಿಕ್ ಪೈರೆಥ್ರಾಯ್ಡ್ ಸಿಂಪಡಿಸಬೇಡಿ.'],
    preventionStepsTa: ['மஞ்சள் ஒட்டும் பொறிகளை முன்கூட்டியே வைக்கவும்.', 'வரப்பு பயிர்களை நடவும்.'],
    preventionStepsTe: ['పసుపు జిగురు బుట్టలను ముందుగానే పెట్టండి.', 'సరిహద్దు పంటలు వేయండి.'],
    ipmSteps: [
      'Step 1: Border barrier rows of sorghum or maize.',
      'Step 2: Yellow sticky traps (20-25/acre) for continuous mass trapping.',
      'Step 3: Release of Chrysoperla predators.',
      'Step 4: Neem oil 5 ml/L spray to inhibit egg hatching.',
      'Step 5: Insect growth regulator (Pyriproxyfen) or selective insecticide if adult population exceeds ETL.'
    ],
    ipmStepsKn: ['ಹಂತ 1: ಜೋಳದ ತಡೆ ಬೆಳೆ', 'ಹಂತ 2: ಹಳದಿ ಜಿಗುಟು ಬಲೆ', 'ಹಂತ 3: ಕ್ರೈಸೋಪರ್ಲಾ ಕೀಟ', 'ಹಂತ 4: ಬೇವಿನ ಎಣ್ಣೆ ಸಿಂಪರಣೆ', 'ಹಂತ 5: ಸೂಕ್ತ ಕೀಟನಾಶಕ'],
    ipmStepsTa: ['படி 1: வரப்பு பயிர்', 'படி 2: மஞ்சள் ஒட்டும் பொறி', 'படி 3: நன்மை செய்யும் பூச்சி', 'படி 4: வேப்ப எண்ணெய்', 'படி 5: பூச்சிக்கொல்லி'],
    ipmStepsTe: ['దశ 1: సరిహద్దు పంట', 'దశ 2: పసుపు జిగురు బుట్టలు', 'దశ 3: మిత్రపురుగులు', 'దశ 4: వేప నూనె', 'దశ 5: పురుగుమందు'],
    safetyNotes: 'Avoid spraying insecticides in the heat of midday. Spray underneath leaves where nymphs reside.',
    lookAlikes: [
      { name: 'Cotton Jassid / Leafhopper (Amrasca biguttula)', difference: 'Jassids cause triangular yellowing of leaf margins turning into brick red "hopper burn" with characteristic sideways walking, without sticky black sooty mould.' },
      { name: 'Cotton Aphid', difference: 'Aphids are green-black pear-shaped wingless clusters at shoot tips causing upward cupping.' }
    ],
    whenToCallExpert: 'Call KVK/RSK if whitefly populations exceed 8 flies per leaf or black sooty mould coats upper leaves during peak boll formation.',
    whenToCallExpertKn: 'ಎಲೆಗೆ 8 ಕ್ಕಿಂತ ಹೆಚ್ಚು ಬಿಳಿ ನೊಣಗಳಿದ್ದರೆ ಅಥವಾ ಕಪ್ಪು ಕಾಡಿಗೆ ರೋಗ ಹರಡಿದರೆ ತಕ್ಷಣ ಕೃಷಿ ಅಧಿಕಾರಿಯನ್ನು ಸಂಪರ್ಕಿಸಿ.',
    whenToCallExpertTa: 'ஒரு இலைக்கு 8 ஈக்களுக்கு மேல் இருந்தால் உடனே வேளாண் அலுவலரை அணுகவும்.',
    whenToCallExpertTe: 'ఒక ఆకుపై 8 కంటే ఎక్కువ తెల్లదోమలు ఉంటే వెంటనే వ్యవసాయాధికారిని సంప్రదించండి.',
    confidence: 'verified',
    sources: 'ICAR-CICR Nagpur, UAS Raichur Cotton Research Station.',
    crops: [
      { cropName: 'Cotton', cropSlug: 'cotton', importance: 'primary' },
      { cropName: 'Tomato', cropSlug: 'tomato', importance: 'secondary' },
      { cropName: 'Chilli (Green / Dry)', cropSlug: 'chilli', importance: 'secondary' }
    ],
    symptomTags: [
      { tagSlug: 'part-leaf', weight: 3.0, isPrimary: true },
      { tagSlug: 'pattern-insects-visible', weight: 3.0, isPrimary: true },
      { tagSlug: 'colour-white-grey', weight: 2.5, isPrimary: true },
      { tagSlug: 'colour-black', weight: 2.0, isPrimary: false },
      { tagSlug: 'pattern-rolling-curling', weight: 1.5, isPrimary: false }
    ],
    images: [
      {
        path: '/problems/whitefly-cotton/whitefly-adults-underside-leaf.webp',
        caption: 'Adult Bemisia tabaci whiteflies and pale puparia clustered on the underside of a cotton leaf.',
        captionKn: 'ಹತ್ತಿ ಎಲೆಯ ಕೆಳಭಾಗದಲ್ಲಿರುವ ಬಿಳಿ ನೊಣಗಳು ಮತ್ತು ಅವುಗಳ ಮರಿಗಳು.',
        kind: 'symptom_closeup',
        source: 'Wikimedia Commons',
        author: 'USDA ARS / Scott Bauer',
        licence: 'Public Domain',
        attribution: 'Scott Bauer, USDA ARS / Wikimedia Commons',
        isPrimary: true
      }
    ]
  },
  {
    slug: 'parawilt-cotton',
    name: 'Parawilt / Sudden Physiological Wilt of Cotton',
    nameKn: 'ಹತ್ತಿಯ ಹಠಾತ್ ಬಾಡುವ ರೋಗ (Parawilt)',
    nameTa: 'பருத்தி திடீர் வாடல் நோய்',
    nameTe: 'పత్తి ఆకస్మిక వాడిపోవు తెగులు (పారావిల్ట్)',
    scientificName: 'Physiological Stress (Anoxia)',
    type: 'abiotic_stress',
    severity: 'high',
    symptoms: 'Sudden drooping and complete wilting of green leaves on fully grown cotton bushes within 24-48 hours after heavy rainfall or excessive irrigation; leaves turn flaccid while remaining green or slightly yellowish; no vascular browning inside split taproot (unlike Fusarium or Verticillium wilt).',
    symptomsKn: 'ಭಾರೀ ಮಳೆ ಅಥವಾ ಅತಿಯಾದ ನೀರು ನಿಂತ 24-48 ಗಂಟೆಗಳಲ್ಲಿ ಇಡೀ ಗಿಡ ಹಠಾತ್ತನೆ ಬಾಡಿ ತೂಗಾಡುತ್ತದೆ. ಎಲೆಗಳು ಹಸಿರಾಗಿದ್ದರೂ ಒಣಗಿದಂತೆ ಜೋತುಬೀಳುತ್ತವೆ. ಆದರೆ ಕಾಂಡ ಅಥವಾ ಬೇರನ್ನು ಸೀಳಿದರೆ ಒಳಗಡೆ ಕಂದು ಕಲೆ ಇರುವುದಿಲ್ಲ (ಶಿಲೀಂಧ್ರ ರೋಗವಲ್ಲ).',
    symptomsTa: 'கனமழை அல்லது அதிக பாசனத்திற்கு பின் 24-48 மணி நேரத்தில் செடிகள் திடீரென வாடி தொங்கும். இலைகள் பச்சையாகவே வாடும். தண்டின் உள்பகுதியில் பழுப்பு நிறம் இருக்காது.',
    symptomsTe: 'భారీ వర్షం లేదా ఎక్కువ నీరు నిలిచిన 24-48 గంటల్లో మొక్కలు ఆకస్మికంగా వాడిపోతాయి. ఆకులు పచ్చగానే ఉన్నా వాలిపోతాయి. కాండం లోపల గోధుమ రంగు మచ్చలు ఉండవు.',
    cause: 'Temporary root asphyxiation / oxygen starvation (anoxia) caused by waterlogging in heavy black cotton soils followed by sudden bright sunshine.',
    favourableConditions: 'Heavy downpours leaving standing water in black soil (vertisols) followed by sudden high temperature and intense sunlight.',
    favourableHumidity: '>80%',
    favourableTemp: '32-38°C',
    favourableSeasons: ['Kharif'],
    affectedStages: ['Flowering', 'Fruiting'],
    spreadPattern: 'Occurs simultaneously across waterlogged depressions in heavy clay fields; non-infectious.',
    culturalControl: 'Provide surface drainage trenches immediately after heavy downpour to evacuate standing water within 12 hours. Inter-cultivation to break soil crust and aerate root zone once surface dries.',
    culturalControlKn: 'ಮಳೆ ಬಂದ ತಕ್ಷಣ ಹೊಲದಲ್ಲಿ ನಿಂತ ನೀರನ್ನು ಬಸಿದು ಹೋಗುವಂತೆ ಚರಂಡಿ ಮಾಡಿ. ಮೇಲ್ಮೈ ಒಣಗಿದ ನಂತರ ಎಡೆಕುಂಟೆ ಹೊಡೆದು ಬೇರಿಗೆ ಗಾಳಿ ಆಡುವಂತೆ ಮಾಡಿ.',
    culturalControlTa: 'வயலில் தேங்கிய தண்ணீரை உடனடியாக வடிய வைக்கவும். நிலம் உலர்ந்ததும் உழவு செய்து வேருக்கு காற்று கிடைக்கச் செய்யவும்.',
    culturalControlTe: 'పొలంలో నిలిచిన నీటిని వెంటనే బయటకు పంపండి. నేల ఆరిన తర్వాత గుంటక తోలి వేర్లకు గాలి ఆడేలా చేయండి.',
    biologicalControl: 'Not an infectious pathogen; bio-agents have no direct action.',
    biologicalControlKn: 'ಇದು ರೋಗಾಣುವಲ್ಲ, ನೀರು ನಿಲ್ಲುವುದರಿಂದ ಉಂಟಾಗುವ ಉಸಿರುಗಟ್ಟುವಿಕೆ.',
    biologicalControlTa: 'இது ஒரு நோய் அல்ல; உடலியல் குறைபாடு.',
    biologicalControlTe: 'ఇది తెగులు కాదు; నీరు నిలవడం వల్ల వచ్చే సమస్య.',
    organicControl: 'Soil drenching around affected plants with 1% cow dung slurry supernatant + 1% humic acid to stimulate lateral root regeneration.',
    organicControlKn: 'ಹ್ಯೂಮಿಕ್ ಆಮ್ಲ ಅಥವಾ ಸಗಣಿ ತಿಳಿನೀರನ್ನು ಗಿಡದ ಬುಡಕ್ಕೆ ಸುರಿಯಿರಿ.',
    organicControlTa: 'ஹியூமிக் அமிலம் அல்லது சாணக்கரைசல் வேரில் ஊற்றவும்.',
    organicControlTe: 'హ్యూమిక్ యాసిడ్ లేదా పేడ నీరు మొదళ్ల వద్ద పోయండి.',
    chemicalControl: 'Foliar spray of Cobalt Chloride (10 ppm) or 1% Urea + 1% Potassium Nitrate (13:0:45) directly on foliage as soon as drooping is noticed. Drench root zones with Copper Oxychloride (to prevent secondary fungal root rot). Note: Consult KVK agronomist.',
    chemicalControlKn: 'ಗಿಡ ಬಾಡಿದ ತಕ್ಷಣ 1% ಯೂರಿಯಾ + 1% ಪೊಟ್ಯಾಸಿಯಮ್ ನೈಟ್ರೇಟ್ ದ್ರಾವಣವನ್ನು ಎಲೆಗಳ ಮೇಲೆ ಸಿಂಪಡಿಸಿ. ಬುಡಕ್ಕೆ ಕಾಪರ್ ಆಕ್ಸಿಕ್ಲೋರೈಡ್ ಸುರಿಯಿರಿ.',
    chemicalControlTa: 'செடி வாடியவுடன் 1% யூரியா மற்றும் பொட்டாசியம் நைட்ரேட் தெளிக்கவும்.',
    chemicalControlTe: 'మొక్కలు వాలిన వెంటనే 1% యూరియా మరియు పొటాషియం నైట్రేట్ పిచికారీ చేయండి.',
    preventionSteps: ['Ensure broad-bed furrow (BBF) system in black cotton soils.', 'Never allow water to stand in fields for more than 12 hours.'],
    preventionStepsKn: ['ಕಪ್ಪು ಮಣ್ಣಿನಲ್ಲಿ ಬೋದು ಸಾಲು ಪದ್ಧತಿಯಲ್ಲಿ ಬೆಳೆಯಿರಿ.', 'ಹೊಲದಲ್ಲಿ 12 ಗಂಟೆಗಿಂತ ಹೆಚ್ಚು ನೀರು ನಿಲ್ಲಲು ಬಿಡಬೇಡಿ.'],
    preventionStepsTa: ['மேட்டுப்பாத்தி அமைத்து பயிரிடவும்.', 'தண்ணீர் தேங்காமல் பார்த்துக் கொள்ளவும்.'],
    preventionStepsTe: ['బోదె సాళ్ల పద్ధతిని పాటించండి.', 'పొలంలో నీరు నిలవకుండా చూసుకోండి.'],
    ipmSteps: [
      'Step 1: Land levelling and adequate drainage slope.',
      'Step 2: Immediate dewatering within 12 hours of deluge.',
      'Step 3: Shallow interculture for root aeration.',
      'Step 4: Foliar nutrient spray (Urea + KNO3) within 24-48 hours of wilting onset.'
    ],
    ipmStepsKn: ['ಹಂತ 1: ಸಮರ್ಪಕ ಬಸಿಗಾಲುವೆ', 'ಹಂತ 2: ನೀರು ಹೊರಹಾಕುವುದು', 'ಹಂತ 3: ಎಡೆಕುಂಟೆ ಹೊಡೆಯುವುದು', 'ಹಂತ 4: ಪೋಷಕಾಂಶಗಳ ಸಿಂಪರಣೆ'],
    ipmStepsTa: ['படி 1: வடிகால் வசதி', 'படி 2: தேங்கிய நீரை அகற்றுதல்', 'படி 3: காற்று புக உழவு', 'படி 4: ஊட்டச்சத்து தெளிப்பு'],
    ipmStepsTe: ['దశ 1: మురుగు నీటి కాలువలు', 'దశ 2: నీటిని తొలగించడం', 'దశ 3: అంతరకృషి', 'దశ 4: పోషకాల పిచికారీ'],
    safetyNotes: 'Act within 24 hours of first wilting signs; delayed action beyond 48 hours results in permanent root death and plant mortality.',
    lookAlikes: [
      { name: 'Fusarium Wilt of Cotton', difference: 'Fusarium wilt causes gradual yellowing from lower leaves upward with distinct dark brown or black vascular ring discoloration in the xylem.' },
      { name: 'Root Rot (Rhizoctonia)', difference: 'Root rot rots the root bark which sloughs off easily with foul smell; parawilt roots remain intact initially.' }
    ],
    whenToCallExpert: 'Call local agricultural officer or KVK agronomist immediately if wide patches wilt simultaneously following heavy rains in black soil.',
    whenToCallExpertKn: 'ಭಾರೀ ಮಳೆಯ ನಂತರ ಕಪ್ಪು ಮಣ್ಣಿನಲ್ಲಿ ಹತ್ತಿ ಗಿಡಗಳು ಒಮ್ಮೆಲೇ ಬಾಡಿದರೆ ತಕ್ಷಣ ಕೃಷಿ ಅಧಿಕಾರಿಗಳನ್ನು ಸಂಪರ್ಕಿಸಿ.',
    whenToCallExpertTa: 'மழைக்கு பின் ஒரே நேரத்தில் பருத்தி செடிகள் வாடினால் உடனடியாக வேளாண் அலுவலரை அழைக்கவும்.',
    whenToCallExpertTe: 'వర్షాల తర్వాత పత్తి మొక్కలు ఒకేసారి వాలిపోతే వెంటనే వ్యవసాయాధికారిని సంప్రదించండి.',
    confidence: 'verified',
    sources: 'ICAR-CICR Nagpur, UAS Dharwad Cotton Agronomy Division.',
    crops: [
      { cropName: 'Cotton', cropSlug: 'cotton', importance: 'primary' }
    ],
    symptomTags: [
      { tagSlug: 'part-whole-plant', weight: 3.0, isPrimary: true },
      { tagSlug: 'pattern-wilting', weight: 3.0, isPrimary: true },
      { tagSlug: 'spread-patches', weight: 2.5, isPrimary: true },
      { tagSlug: 'part-leaf', weight: 2.0, isPrimary: false },
      { tagSlug: 'colour-yellow', weight: 1.0, isPrimary: false }
    ],
    images: [
      {
        path: '/problems/parawilt-cotton/sudden-green-wilting-cotton.webp',
        caption: 'Sudden physiological drooping of green cotton canopy due to root anoxia in waterlogged heavy clay field.',
        captionKn: 'ಭಾರೀ ಮಳೆಯ ನಂತರ ನೀರು ನಿಂತು ಹಠಾತ್ತನೆ ಬಾಡಿರುವ ಹತ್ತಿ ಗಿಡಗಳು.',
        kind: 'field_view',
        source: 'Wikimedia Commons',
        author: 'ICAR-CICR Nagpur',
        licence: 'CC BY-SA 4.0',
        attribution: 'ICAR-CICR Nagpur / Wikimedia Commons',
        isPrimary: true
      }
    ]
  },

  // ==========================================
  // CHICKPEA (ADDITIONAL)
  // ==========================================
  {
    slug: 'dry-root-rot-chickpea',
    name: 'Dry Root Rot of Chickpea',
    nameKn: 'ಕಡಲೆ ಒಣ ಬೇರು ಕೊಳೆ ರೋಗ (Dry Root Rot)',
    nameTa: 'கொண்டைக்கடலை உலர் வேர் அழுகல் நோய்',
    nameTe: 'శనగ ఎండు వేరు కుళ్ళు తెగులు',
    scientificName: 'Rhizoctonia bataticola (Macrophomina phaseolina)',
    type: 'fungal',
    severity: 'critical',
    symptoms: 'Sudden drooping of petioles and leaflets during warm podding stage; leaves turn dull yellowish-green without drooping completely; taproot becomes dark, dry, brittle and devoid of lateral secondary roots; wood splinters easily like dry firewood with minute dark pinhead sclerotia visible beneath bark.',
    symptomsKn: 'ಬಿಸಿಲು ಹೆಚ್ಚಾದಾಗ ಕಾಯಿ ಕಟ್ಟುವ ಹಂತದಲ್ಲಿ ಗಿಡ ಒಣಗುತ್ತದೆ. ಎಲೆಗಳು ಬೂದು-ಹಳದಿ ಬಣ್ಣಕ್ಕೆ ತಿರುಗುತ್ತವೆ. ಬೇರನ್ನು ಕಿತ್ತರೆ ಸಂಪೂರ್ಣ ಒಣಗಿರುತ್ತದೆ, ಸಣ್ಣ ಬೇರುಗಳಿರುವುದಿಲ್ಲ. ತೊಗಟೆಯನ್ನು ಸುಲಿದರೆ ಕಪ್ಪು ಗುಂಡುಸೂಜಿಯ ಮೊನೆಯಂತಹ ಚುಕ್ಕೆಗಳು ಕಾಣಿಸುತ್ತವೆ.',
    symptomsTa: 'காய் பிடிக்கும் தருணத்தில் வெயில் அதிகமானால் செடிகள் காய்ந்து விடும். ஆணிவேர் உலர்ந்து பக்கவேர்கள் இல்லாமல் எளிதில் உடையும். பட்டையின் கீழ் நுண்ணிய கருப்பு வித்துக்கள் காணப்படும்.',
    symptomsTe: 'ఎండలు ముదిరే సమయంలో కాయ దశలో మొక్కలు ఎండిపోతాయి. వేర్లు పూర్తిగా ఎండిపోయి పక్క వేర్లు లేకుండా కట్టెలా విరిగిపోతాయి. బెరడు కింద నల్లటి ఆవాల వంటి చుక్కలు కనిపిస్తాయి.',
    cause: 'Fungus Rhizoctonia bataticola attacking moisture-stressed roots in high soil heat.',
    favourableConditions: 'High soil temperature (>30°C) combined with soil moisture stress / drought during flowering and pod development.',
    favourableHumidity: '<60%',
    favourableTemp: '30-35°C',
    favourableSeasons: ['Rabi'],
    affectedStages: ['Flowering', 'Fruiting', 'Maturity'],
    spreadPattern: 'Spreads in dry patches during receding soil moisture spells.',
    culturalControl: 'Provide light irrigation at flowering and pod filling to avoid terminal drought stress. Deep summer ploughing. Rotate with non-host cereals like sorghum or wheat.',
    culturalControlKn: 'ಹೂ ಮತ್ತು ಕಾಯಿ ಕಟ್ಟುವ ಹಂತದಲ್ಲಿ ಲಘು ನೀರಾವರಿ ನೀಡಿ, ಗಿಡಗಳಿಗೆ ನೀರಿನ ಕೊರತೆಯಾಗದಂತೆ ನೋಡಿಕೊಳ್ಳಿ. ಜೋಳ ಅಥವಾ ಗೋಧಿಯೊಂದಿಗೆ ಬೆಳೆ ಪರಿವರ್ತನೆ ಮಾಡಿ.',
    culturalControlTa: 'பூக்கும் மற்றும் காய் பிடிக்கும் பருவத்தில் லேசான பாசனம் செய்யவும். பயிர் சுழற்சி மேற்கொள்ளவும்.',
    culturalControlTe: 'పూత మరియు కాయ దశలో తేలికపాటి తడి ఇవ్వండి. పంట మార్పిడి పాటించండి.',
    biologicalControl: 'Seed treatment with Trichoderma viride or Pseudomonas fluorescens at 10 g/kg seed. Enrich soil with Trichoderma.',
    biologicalControlKn: 'ಟ್ರೈಕೋಡರ್ಮಾ ಜೈವಿಕ ಶಿಲೀಂಧ್ರದಿಂದ ಕಡ್ಡಾಯವಾಗಿ ಬೀಜೋಪಚಾರ ಮಾಡಿ.',
    biologicalControlTa: 'டிரைக்கோடெர்மா கொண்டு விதை நேர்த்தி செய்யவும்.',
    biologicalControlTe: 'ట్రైకోడెర్మతో విత్తన శుద్ధి చేయండి.',
    organicControl: 'Apply neem cake (100 kg/acre) during sowing. Soil application of farmyard manure enriched with biocontrol agents.',
    organicControlKn: 'ಬಿತ್ತನೆ ಸಮಯದಲ್ಲಿ ಎಕರೆಗೆ 100 ಕೆಜಿ ಬೇವಿನ ಹಿಂಡಿ ಹಾಕಿ.',
    organicControlTa: 'வேப்பம்பிண்ணாக்கு இடவும்.',
    organicControlTe: 'ఎకరానికి 100 కిలోల వేప పిండి వేయండి.',
    chemicalControl: 'Seed treatment with Carbendazim + Mancozeb or Carboxin + Thiram before sowing. Note: Post-emergence chemical sprays cannot revive dry taproots; follow label directions.',
    chemicalControlKn: 'ಬಿತ್ತನೆ ಮುನ್ನ ಕಾರ್ಬೆಂಡಾಜಿಮ್ + ಮ್ಯಾಂಕೋಜೆಬ್‌ನಿಂದ ಬೀಜೋಪಚಾರ ಮಾಡಿ. ರೋಗ ಬಂದ ಮೇಲೆ ಸಿಂಪರಣೆ ಕೆಲಸ ಮಾಡುವುದಿಲ್ಲ. ಲೇಬಲ್ ಸೂಚನೆ ಪಾಲಿಸಿ.',
    chemicalControlTa: 'கட்டாய விதை நேர்த்தி செய்யவும்.',
    chemicalControlTe: 'విత్తన శుద్ధి తప్పనిసరిగా చేయండి.',
    preventionSteps: ['Prevent severe soil moisture stress at podding.', 'Mandatory fungicidal seed treatment.'],
    preventionStepsKn: ['ಕಾಯಿ ಕಟ್ಟುವಾಗ ನೀರಿನ ಕೊರತೆಯಾಗದಂತೆ ಎಚ್ಚರ ವಹಿಸಿ.', 'ಕಡ್ಡಾಯ ಬೀಜೋಪಚಾರ ಮಾಡಿ.'],
    preventionStepsTa: ['வறட்சி ஏற்படாமல் பாசனம் செய்யவும்.', 'விதை நேர்த்தி செய்யவும்.'],
    preventionStepsTe: ['కాయ దశలో నీటి ఎద్దడి లేకుండా చూసుకోండి.', 'విత్తన శుద్ధి చేయండి.'],
    ipmSteps: [
      'Step 1: Certified seed treated with bio-fungicide Trichoderma.',
      'Step 2: Deep summer ploughing to bury sclerotia.',
      'Step 3: Optimum sowing date to avoid extreme heat during podding.',
      'Step 4: Protective one-or-two light irrigations during reproductive phase.'
    ],
    ipmStepsKn: ['ಹಂತ 1: ಟ್ರೈಕೋಡರ್ಮಾ ಬೀಜೋಪಚಾರ', 'ಹಂತ 2: ಆಳ ಉಳುಮೆ', 'ಹಂತ 3: ಸಕಾಲಿಕ ಬಿತ್ತನೆ', 'ಹಂತ 4: ಹೂವಾಡುವಾಗ ಲಘು ನೀರಾವರಿ'],
    ipmStepsTa: ['படி 1: விதை நேர்த்தி', 'படி 2: ஆழ உழவு', 'படி 3: சரியான விதைப்பு காலம்', 'படி 4: பூக்கும் பருவ பாசனம்'],
    ipmStepsTe: ['దశ 1: విత్తన శుద్ధి', 'దశ 2: లోతు దుక్కి', 'దశ 3: సమయానికి విత్తడం', 'దశ 4: అవసరమైన తడులు'],
    safetyNotes: 'Wear gloves during chemical seed dressing. Avoid drought stress during terminal growth.',
    lookAlikes: [
      { name: 'Fusarium Wilt of Chickpea', difference: 'Fusarium wilt attacks during seedling and early vegetative stage with dark vascular xylem ring discoloration inside split taproot; dry root rot attacks during hot podding with dry splintered wood and black sclerotia under bark.' },
      { name: 'Collar Rot', difference: 'Collar rot causes wet rot at soil level in young seedlings with black spore powder.' }
    ],
    whenToCallExpert: 'Call KVK/RSK if chickpea plants dry up rapidly in hot dry sunny conditions during pod fill.',
    whenToCallExpertKn: 'ಕಾಯಿ ಕಟ್ಟುವ ಹಂತದಲ್ಲಿ ಗಿಡಗಳು ಒಣಗಿ ನಿಂತರೆ ತಕ್ಷಣ ಕೃಷಿ ಅಧಿಕಾರಿಗಳನ್ನು ಸಂಪರ್ಕಿಸಿ.',
    whenToCallExpertTa: 'காய் பிடிக்கும் பருவத்தில் செடிகள் காய்ந்தால் உடனடியாக வேளாண் அலுவலரை அணுகவும்.',
    whenToCallExpertTe: 'కాయ దశలో మొక్కలు ఎండిపోతుంటే వెంటనే వ్యవసాయాధికారిని సంಪ್ರదించండి.',
    confidence: 'verified',
    sources: 'ICAR-IIPR Kanpur, UAS Raichur Pulses Division.',
    crops: [
      { cropName: 'Chickpea (Bengal Gram)', cropSlug: 'chickpea', importance: 'primary' }
    ],
    symptomTags: [
      { tagSlug: 'part-root', weight: 3.0, isPrimary: true },
      { tagSlug: 'pattern-rot', weight: 3.0, isPrimary: true },
      { tagSlug: 'pattern-wilting', weight: 2.5, isPrimary: true },
      { tagSlug: 'colour-brown', weight: 2.0, isPrimary: false },
      { tagSlug: 'spread-patches', weight: 2.0, isPrimary: false }
    ],
    images: [
      {
        path: '/problems/dry-root-rot-chickpea/dry-brittle-taproot-chickpea.webp',
        caption: 'Dry, brittle, blackened taproot devoid of fine feeder rootlets caused by Rhizoctonia bataticola.',
        captionKn: 'ಕಡಲೆ ಗಿಡದ ಒಣಗಿದ ಸುಲಭವಾಗಿ ತುಂಡಾಗುವ ಬೇರು.',
        kind: 'symptom_closeup',
        source: 'Wikimedia Commons',
        author: 'ICAR-IIPR Kanpur',
        licence: 'CC BY-SA 4.0',
        attribution: 'ICAR-IIPR Kanpur / Wikimedia Commons',
        isPrimary: true
      }
    ]
  },

  // ==========================================
  // SUGARCANE (ADDITIONAL)
  // ==========================================
  {
    slug: 'woolly-aphid-sugarcane',
    name: 'Sugarcane Woolly Aphid',
    nameKn: 'ಕಬ್ಬಿನ ಬಿಳಿ ಜಿಗಿ ಹುಳು / ಉಣ್ಣೆ ಹೇನು (Woolly Aphid)',
    nameTa: 'கரும்பு வெள்ளை மாவுப்பூச்சி',
    nameTe: 'చెరకు తెల్ల పిండి పురుగు (ఊలు పేను)',
    scientificName: 'Ceratovacuna lanigera',
    type: 'insect_pest',
    severity: 'high',
    symptoms: 'Nymphs and wingless adults cluster densely along midribs on leaf undersides covered by thick white waxy woolly secretions; severe desapping turns leaves brittle, dry, and straw-colored; copious honey-dew secretions develop heavy black sooty mould over lower leaf canopies.',
    symptomsKn: 'ಎಲೆಗಳ ಕೆಳಭಾಗದಲ್ಲಿ ಬಿಳಿ ಹತ್ತಿಯಂತಹ ಮೇಣದ ಪದರದಲ್ಲಿ ಬಿಳಿ ಹೇನುಗಳು ದಟ್ಟವಾಗಿ ಕೂರುತ್ತವೆ. ರಸ ಹೀರುವುದರಿಂದ ಎಲೆಗಳು ಒಣಗಿ ಸುಟ್ಟಂತಾಗುತ್ತವೆ. ಸಕ್ಕರೆ ದ್ರವದಿಂದಾಗಿ ಎಲೆಗಳ ಮೇಲೆ ಕಪ್ಪು ಬೂಸ್ಟು ಬೆಳೆಯುತ್ತದೆ.',
    symptomsTa: 'இலைகளின் அடியில் நரம்புகளின் இருபுறமும் வெள்ளை பஞ்சு போன்ற மெழுகுப் படலத்துடன் பூச்சிகள் கூட்டமாக இருக்கும். சாற்றை உறிஞ்சுவதால் இலைகள் காய்ந்து கரும்பூசணம் படரும்.',
    symptomsTe: 'ఆకుల కింద ఈనెలకు ఇరువైపులా తెల్లటి దూది వంటి పొర కింద పురుగులు గుంపులుగా ఉంటాయి. రసం పీల్చడం వల్ల ఆకులు ఎండిపోయి నల్లటి మసి బూజు పడుతుంది.',
    cause: 'Sap-sucking aphid Ceratovacuna lanigera with white waxy filaments.',
    favourableConditions: 'Moderate temperatures (20-28°C), high relative humidity (80-95%), shady microclimate, and excessive nitrogen application.',
    favourableHumidity: '>80%',
    favourableTemp: '20-28°C',
    favourableSeasons: ['Kharif', 'Rabi'],
    affectedStages: ['Tillering', 'Vegetative Growth', 'Maturity'],
    spreadPattern: 'Carried downwind as winged forms; spreads from lower leaves towards the top canopy.',
    culturalControl: 'Detrash lower senescent leaves (at 5th and 7th month) carrying initial colonies and bury them. Avoid excessive nitrogen. Avoid movement of infested setts or cane tops between fields.',
    culturalControlKn: '5 ಮತ್ತು 7 ನೇ ತಿಂಗಳಲ್ಲಿ ಕೆಳಗಿನ ಒಣ ರವದಿಯನ್ನು ಸುಲಿದು ನಾಶಪಡಿಸಿ. ಅತಿಯಾದ ಯೂರಿಯಾ ಬಳಸಬೇಡಿ.',
    culturalControlTa: '5 மற்றும் 7 ஆம் மாதத்தில் அடி சோகைகளை உரித்து அழிக்கவும். தழைச்சத்தை குறைக்கவும்.',
    culturalControlTe: '5 మరియు 7 వ నెలల్లో కింది ఎండు చెత్తను తీసి నాశనం చేయండి. యూరియా తగ్గించండి.',
    biologicalControl: 'Promote or release specialist biocontrol predators: Dipha aphidivora (pyralid moth larva), Micromus igorotus (brown lacewing), and Encarsia flavoscutellum parasitoid.',
    biologicalControlKn: 'ಡೈಫಾ ಅಫಿಡಿವೋರಾ ಮತ್ತು ಮೈಕ್ರೋಮಸ್ ನೈಸರ್ಗಿಕ ಪರಭಕ್ಷಕ ಕೀಟಗಳನ್ನು ಹೊಲದಲ್ಲಿ ಬಿಡಿ.',
    biologicalControlTa: 'டைபா அஃபிடிவோரா மற்றும் மைக்ரோமஸ் ஒட்டுண்ணி பூச்சிகளை வயலில் விடவும்.',
    biologicalControlTe: 'డైఫా మరియు మైక్రోమస్ మిత్రపురుగులను పొలంలో వదలండి.',
    organicControl: 'Foliar spray of 5% Neem Seed Kernel Extract (NSKE) or Neem oil (1500 ppm) with liquid soap.',
    organicControlKn: 'ಬೇವಿನ ಕಷಾಯ (NSKE 5%) ಅಥವಾ ಬೇವಿನ ಎಣ್ಣೆ ಸಿಂಪಡಿಸಿ.',
    organicControlTa: '5% வேப்பங்கொட்டை கரைசல் தெளிக்கவும்.',
    organicControlTe: '5% వేప గింజల కషಾಯం పిచికారీ చేయండి.',
    chemicalControl: 'Foliar spray of Thiamethoxam or Acetamiprid or Chlorpyrifos directed strictly under leaves if predator populations are absent. Note: Do not spray chemical insecticides if predators like Micromus or Dipha are abundant; follow label directions.',
    chemicalControlKn: 'ನೈಸರ್ಗಿಕ ಪರಭಕ್ಷಕ ಕೀಟಗಳಿಲ್ಲದಿದ್ದರೆ ಮಾತ್ರ ಥಯಾಮೆಥಾಕ್ಸಮ್ ಅಥವಾ ಅಸಿಟಾಮಿಪ್ರಿಡ್ ಸಿಂಪಡಿಸಿ. ಲೇಬಲ್ ಸೂಚನೆ ಪಾಲಿಸಿ.',
    chemicalControlTa: 'மిత్ర பூச்சிகள் இல்லாவிட்டால் மட்டும் தையமீத்தாக்சம் தெளிக்கவும்.',
    chemicalControlTe: 'మిత్రపురుగులు లేనప్పుడు మాత్రమే థయామిథాక్సామ్ పిచికారీ చేయండి.',
    preventionSteps: ['Regular lower detrashing.', 'Scout leaf undersides in wet humid weather.', 'Conserve predatory brown lacewings.'],
    preventionStepsKn: ['ನಿಯಮಿತವಾಗಿ ಒಣ ರವದಿ ಸುಲಿಯಿರಿ.', 'ಎಲೆಗಳ ತಳಭಾಗವನ್ನು ಪರಿಶೀಲಿಸಿ.'],
    preventionStepsTa: ['சோகைகளை தவறாமல் உரிக்கவும்.', 'இலைகளின் அடியை கண்காணிக்கவும்.'],
    preventionStepsTe: ['సక్రమంగా చెత్తను తీయండి.', 'ఆకుల కింద భాగాన్ని గమనించండి.'],
    ipmSteps: [
      'Step 1: Lower leaf detrashing at 150 and 210 DAP.',
      'Step 2: Conservation and redistribution of Dipha and Micromus predators.',
      'Step 3: Botanical neem oil spray to initial colonies.',
      'Step 4: Selective chemical spray only as last resort in absence of bio-agents.'
    ],
    ipmStepsKn: ['ಹಂತ 1: 150 ಮತ್ತು 210 ದಿನಗಳಲ್ಲಿ ರವದಿ ಸುಲಿಯುವುದು', 'ಹಂತ 2: ಪರಭಕ್ಷಕ ಕೀಟಗಳ ರಕ್ಷಣೆ', 'ಹಂತ 3: ಬೇವಿನ ಎಣ್ಣೆ', 'ಹಂತ 4: ಕೀಟನಾಶಕ ಕೊನೆಯ ಉಪಾಯ'],
    ipmStepsTa: ['படி 1: சோகை உரித்தல்', 'படி 2: நன்மை செய்யும் பூச்சி பாதுகாப்பு', 'படி 3: வேப்ப எண்ணெய்', 'படி 4: அவசர பூச்சிக்கொல்லி'],
    ipmStepsTe: ['దశ 1: చెత్త తీసివేత', 'దశ 2: మిత్రపురుగుల సంరక్షణ', 'దశ 3: వేప నూనె', 'దశ 4: అవసరమైతే పురుగుమందు'],
    safetyNotes: 'Wear long-sleeve clothing and face protection when spraying dense full-grown cane canopies.',
    lookAlikes: [
      { name: 'Sugarcane Mealybug (Saccharicoccus sacchari)', difference: 'Mealybugs are pinkish oval bugs found under node leaf sheaths, not spreading white woolly colonies on open leaf blades.' },
      { name: 'Sugarcane Scale Insect', difference: 'Scale insects encrust the cane internodes with hard grey-brown scales, not white woolly leaves.' }
    ],
    whenToCallExpert: 'Call sugar factory field officer or KVK if white woolly aphid colonies cover more than 30% of leaf area in 6-8 month old cane.',
    whenToCallExpertKn: 'ಕಬ್ಬಿನ ಎಲೆಗಳ ಮೇಲೆ 30% ಕ್ಕಿಂತ ಹೆಚ್ಚು ಬಿಳಿ ಜಿಗಿ ಹುಳುಗಳು ಹರಡಿದರೆ ತಕ್ಷಣ ಸಕ್ಕರೆ ಕಾರ್ಖಾನೆ ಅಧಿಕಾರಿಯನ್ನು ಸಂಪರ್ಕಿಸಿ.',
    whenToCallExpertTa: '30% மேற்பட்ட இலைகளில் மாவுப்பூச்சி பரவினால் சர்க்கரை ஆலை அலுவலரை அணுகவும்.',
    whenToCallExpertTe: '30% కంటే ఎక్కువ ఆకులపై తెల్ల పిండి పురుగు వ్యాపిస్తే వెంటనే చక్కెర ఫ్యాక్టరీ అధికారిని సంప్రదించండి.',
    confidence: 'verified',
    sources: 'ICAR-Sugarcane Breeding Institute (SBI) Coimbatore, UAS Dharwad.',
    crops: [
      { cropName: 'Sugarcane', cropSlug: 'sugarcane', importance: 'primary' }
    ],
    symptomTags: [
      { tagSlug: 'part-leaf', weight: 3.0, isPrimary: true },
      { tagSlug: 'colour-white-grey', weight: 3.0, isPrimary: true },
      { tagSlug: 'pattern-insects-visible', weight: 3.0, isPrimary: true },
      { tagSlug: 'colour-black', weight: 2.0, isPrimary: false },
      { tagSlug: 'pattern-powdery-mould', weight: 1.5, isPrimary: false }
    ],
    images: [
      {
        path: '/problems/woolly-aphid-sugarcane/white-woolly-wax-sugarcane-leaf.webp',
        caption: 'Dense colonies of sugarcane woolly aphids with white waxy secretions along leaf midrib.',
        captionKn: 'ಕಬ್ಬಿನ ಎಲೆಯ ಕೆಳಭಾಗದಲ್ಲಿ ಹರಡಿರುವ ಬಿಳಿ ಉಣ್ಣೆ ಹೇನಿನ ಹಿಂಡು.',
        kind: 'symptom_closeup',
        source: 'Wikimedia Commons',
        author: 'UAS Dharwad Sugarcane Division',
        licence: 'CC BY-SA 4.0',
        attribution: 'UAS Dharwad / Wikimedia Commons',
        isPrimary: true
      }
    ]
  },

  // ==========================================
  // CHILLI (ADDITIONAL)
  // ==========================================
  {
    slug: 'chilli-leaf-curl-virus',
    name: 'Chilli Leaf Curl Virus (Gemini Virus)',
    nameKn: 'ಮೆಣಸಿನಕಾಯಿ ಎಲೆ ಮುದುರು ನಂಜು ರೋಗ (Leaf Curl Virus)',
    nameTa: 'மிளகாய் இலை சுருட்டு வைரஸ் நோய்',
    nameTe: 'మిరప ఆకు ముడుత వైరస్ తెగులు',
    scientificName: 'Chilli Leaf Curl Virus (ChiLCV)',
    type: 'viral',
    severity: 'critical',
    symptoms: 'Upward curling, puckering and severe crinkling of leaves; thickening of veins and shortening of petioles and internodes; plants show bushy, bunched, stunted dwarf growth with pale green or yellow-green mottling; drastic reduction in flowers and small deformed, wrinkled fruits.',
    symptomsKn: 'ಎಲೆಗಳು ಮೇಲ್ಮುಖವಾಗಿ ಮುದುರಿಕೊಂಡು ದಪ್ಪವಾಗಿ ಗಂಟಿಕ್ಕುತ್ತವೆ. ನರಗಳು ದಪ್ಪವಾಗುತ್ತವೆ. ಗಿಡ ಗಿಡ್ಡವಾಗಿ ಪೊದೆಯಂತಾಗುತ್ತದೆ. ಹೂವು ಮತ್ತು ಕಾಯಿ ಕಟ್ಟುವುದಿಲ್ಲ; ಕಾಯಿ ಕಟ್ಟಿದರೂ ವಿರೂಪವಾಗಿ ಚಿಕ್ಕದಾಗಿರುತ್ತವೆ.',
    symptomsTa: 'இலைகள் மேல்நோக்கி சுருண்டு, தடித்து, சுருக்கங்கள் காணப்படும். நரம்புகள் தடிக்கும். செடி குட்டையாகி புதர் போல் தோற்றமளிக்கும். பூக்கள் உதிரும், காய்கள் கோணலாக மாறும்.',
    symptomsTe: 'ఆకులు పైకి ముడుచుకుని, దళసరిగా మారి నరాలు లావుగా అవుతాయి. మొక్కలు గిడసబారి గుబురుగా తయారవుతాయి. పూత రాలిపోయి కాయలు వంకర్లు తిరిగి చిన్నవిగా ఉంటాయి.',
    cause: 'Chilli leaf curl begomovirus transmitted exclusively by the whitefly Bemisia tabaci.',
    favourableConditions: 'Hot dry weather, high whitefly populations, and nearby infected solanaceous weed hosts (Datura, Solanum nigrum).',
    favourableHumidity: '45-65%',
    favourableTemp: '28-36°C',
    favourableSeasons: ['Kharif', 'Rabi', 'Zaid'],
    affectedStages: ['Seedling', 'Vegetative Growth', 'Flowering'],
    spreadPattern: 'Transmitted systemically within plant; spreads rapidly from plant to plant via viruliferous whiteflies.',
    culturalControl: 'Uproot and burn infected plants as soon as early curling is noticed. Grow 2-3 barrier rows of maize or sorghum around chilli plots. Eradicate wild weeds around boundaries. Install yellow sticky traps.',
    culturalControlKn: 'ರೋಗ ಕಂಡ ಗಿಡಗಳನ್ನು ತಕ್ಷಣ ಕಿತ್ತು ಸುಟ್ಟುಹಾಕಿ. ಹೊಲದ ಸುತ್ತಲೂ ಜೋಳ ಅಥವಾ ಮೆಕ್ಕೆಜೋಳದ 2-3 ಸಾಲುಗಳನ್ನು ತಡೆ ಬೆಳೆಯಾಗಿ ಬೆಳೆಯಿರಿ. ಹಳದಿ ಜಿಗುಟು ಬಲೆ ಹಾಕಿ.',
    culturalControlTa: 'பாதிக்கப்பட்ட செடிகளை உடனே பிடுங்கி அழிக்கவும். மக்காச்சோளத்தை வரப்பு பயிராக நடவும். மஞ்சள் ஒட்டும் பொறி வைக்கவும்.',
    culturalControlTe: 'రోగం సోకిన మొక్కలను పీకి కాల్చేయండి. జొన్న లేదా మొక్కజొన్నను సరిహద్దు పంటగా వేయండి. పసుపు జిగురు బుట్టలు పెట్టండి.',
    biologicalControl: 'Spray bio-pesticide Lecanicillium lecanii to suppress vector whiteflies. Conserve predatory ladybird beetles.',
    biologicalControlKn: 'ಬಿಳಿ ನೊಣ ನಿಯಂತ್ರಣಕ್ಕೆ ಲೆಕಾನಿಸಿಲಿಯಮ್ ಜೈವಿಕ ಕೀಟನಾಶಕ ಸಿಂಪಡಿಸಿ.',
    biologicalControlTa: 'வெள்ளை ஈக்களை கட்டுப்படுத்த உயிரியல் பூஞ்சாணம் தெளிக்கவும்.',
    biologicalControlTe: 'తెల్లదోమ నివారణకు వర్టిసిలియం పిచికారీ చేయండి.',
    organicControl: 'Foliar spray of 5% Neem Seed Kernel Extract (NSKE) or Sour Buttermilk + Asafoetida solution.',
    organicControlKn: 'ಬೇವಿನ ಕಷಾಯ (NSKE 5%) ಅಥವಾ ಹುಳಿ ಮಜ್ಜಿಗೆ ಸಿಂಪಡಿಸಿ.',
    organicControlTa: '5% வேப்பங்கொட்டை கரைசல் அல்லது புளித்த மோர் தெளிக்கவும்.',
    organicControlTe: '5% వేప గింజల కషాయం లేదా పులిసిన మజ్జిగ పిచికారీ చేయండి.',
    chemicalControl: 'Foliar spray of systemic insecticides for whitefly vector control: Diafenthiuron or Flonicamid or Acetamiprid or Dinotefuran. Note: Chemical sprays do NOT cure the viral infection once inside the plant; they only control the vector whitefly. Follow label directions.',
    chemicalControlKn: 'ಬಿಳಿ ನೊಣ ನಿಯಂತ್ರಣಕ್ಕೆ ಡಯಾಫೆಂಥಿಯುರಾನ್ ಅಥವಾ ಫ್ಲೋನಿಕಾಮಿಡ್ ಸಿಂಪಡಿಸಿ. ವೈರಸ್ ಬಂದ ಗಿಡ ಸರಿಹೋಗುವುದಿಲ್ಲ, ಕೇವಲ ಹರಡುವ ನೊಣಗಳನ್ನು ತಡೆಯಬಹುದು. ಲೇಬಲ್ ಸೂಚನೆ ಪಾಲಿಸಿ.',
    chemicalControlTa: 'வெள்ளை ஈக்களை கட்டுப்படுத்த டயாபெந்தியூரான் அல்லது அசிட்டமிப்ரிட் தெளிக்கவும். மருந்து வைரஸை அழிக்காது.',
    chemicalControlTe: 'తెల్లదోమ అదుపునకు డయాఫెంథియురాన్ లేదా ఫ్లోనికామిడ్ వాడండి. పురుగుమందులు వైరస్‌ను నయం చేయలేవు.',
    preventionSteps: ['Nursery seedling net protection (40 mesh).', 'Erect yellow sticky traps right from transplanting.', 'Grow border crops.'],
    preventionStepsKn: ['ಮಡಿ ಹಂತದಲ್ಲಿ ನೈಲಾನ್ ನೆಟ್ ಹೊದಿಸಿ.', 'ನಾಟಿ ಮಾಡಿದ ತಕ್ಷಣ ಹಳದಿ ಬಲೆ ಹಾಕಿ.', 'ಸುತ್ತಲೂ ತಡೆ ಬೆಳೆ ಬೆಳೆಯಿರಿ.'],
    preventionStepsTa: ['நாற்றங்காலில் வலை அமைத்துப் பாதுகாக்கவும்.', 'மஞ்சள் ஒட்டும் பொறிகளை முன்கூட்டியே வைக்கவும்.'],
    preventionStepsTe: ['నారుమడికి నెట్ కప్పండి.', 'నాటిన వెంటనే పసుపు జిగురు బుట్టలు పెట్టండి.'],
    ipmSteps: [
      'Step 1: 40-mesh insect-proof nylon net covering on nursery beds.',
      'Step 2: Border barrier of 3 rows of maize/sorghum.',
      'Step 3: Yellow sticky traps (15-20/acre) in main field.',
      'Step 4: Rogueing of early stunted bushes.',
      'Step 5: Selective systemic insecticide to suppress whitefly build-up.'
    ],
    ipmStepsKn: ['ಹಂತ 1: ನರ್ಸರಿ ನೆಟ್ ರಕ್ಷಣೆ', 'ಹಂತ 2: ಜೋಳದ ತಡೆ ಬೆಳೆ', 'ಹಂತ 3: ಹಳದಿ ಜಿಗುಟು ಬಲೆ', 'ಹಂತ 4: ರೋಗಪೀಡಿತ ಗಿಡ ನಾಶ', 'ಹಂತ 5: ಬಿಳಿ ನೊಣ ನಿಯಂತ್ರಣ'],
    ipmStepsTa: ['படி 1: நாற்றங்கால் வலை', 'படி 2: வரப்பு பயிர்', 'படி 3: மஞ்சள் ஒட்டும் பொறி', 'படி 4: செடி நீக்குதல்', 'படி 5: வெள்ளை ஈ கட்டுப்பாடு'],
    ipmStepsTe: ['దశ 1: నారుమడి నెట్', 'దశ 2: సరిహద్దు పంట', 'దశ 3: పసుపు జిగురు బుట్టలు', 'దశ 4: తెగులు మొక్కల ఏరివేత', 'దశ 5: తెల్లదోమ నివారణ'],
    safetyNotes: 'Viruliferous whiteflies transmit virus within 30 minutes of feeding; preventive barrier management is far more effective than curative sprays.',
    lookAlikes: [
      { name: 'Chilli Mite Damage', difference: 'Mites cause downward curling ("inverted boat shape") with shiny dark green brittle leaves, without thick yellow-green vein mottling or stunting bushiness.' },
      { name: 'Chilli Thrips Damage', difference: 'Thrips cause upward curling with rough scabby brown scratches on lower surface, without systemic mosaic vein thickening.' }
    ],
    whenToCallExpert: 'Call local KVK or RSK if stunting and leaf curl appear before flowering, as early infection causes complete yield loss.',
    whenToCallExpertKn: 'ಹೂ ಬಿಡುವ ಮುನ್ನವೇ ಎಲೆ ಮುದುರು ರೋಗ ಕಂಡರೆ ತಕ್ಷಣ ಕೃಷಿ ಅಧಿಕಾರಿಗಳನ್ನು ಸಂಪರ್ಕಿಸಿ.',
    whenToCallExpertTa: 'பூக்கும் முன்பே இலைச்சுருட்டு நோய் தாக்கினால் உடனடியாக வேளாண் அலுவலரை அணுகவும்.',
    whenToCallExpertTe: 'పూతకు ముందే ఆకు ముడుత కనిపిస్తే వెంటనే వ్యవసాయాಧಿಕారిని సంప్రదించండి.',
    confidence: 'verified',
    sources: 'ICAR-IIHR Bengaluru, TNAU Agritech Portal.',
    crops: [
      { cropName: 'Chilli (Green / Dry)', cropSlug: 'chilli', importance: 'primary' }
    ],
    symptomTags: [
      { tagSlug: 'part-leaf', weight: 3.0, isPrimary: true },
      { tagSlug: 'pattern-rolling-curling', weight: 3.0, isPrimary: true },
      { tagSlug: 'pattern-stunting', weight: 2.5, isPrimary: true },
      { tagSlug: 'colour-yellow', weight: 2.0, isPrimary: false },
      { tagSlug: 'pattern-insects-visible', weight: 1.5, isPrimary: false }
    ],
    images: [
      {
        path: '/problems/chilli-leaf-curl-virus/crinkled-stunted-chilli-bush.webp',
        caption: 'Severe upward curling, vein swelling, and stunted bunched growth of chilli bush caused by Chilli Leaf Curl Virus.',
        captionKn: 'ಮೆಣಸಿನಕಾಯಿ ಗಿಡದ ಎಲೆ ಮುದುರಿ ಗಿಡ್ಡವಾಗಿ ಪೊದೆಯಂತಾಗಿರುವ ಎಲೆ ಮುದುರು ರೋಗ.',
        kind: 'symptom_closeup',
        source: 'Wikimedia Commons',
        author: 'ICAR-IIHR Bengaluru',
        licence: 'CC BY-SA 4.0',
        attribution: 'ICAR-IIHR Bengaluru / Wikimedia Commons',
        isPrimary: true
      }
    ]
  },

  // ==========================================
  // ONION (ADDITIONAL)
  // ==========================================
  {
    slug: 'onion-thrips',
    name: 'Onion Thrips',
    nameKn: 'ಈರುಳ್ಳಿ ಹೇನು ಕೀಟ ಬಾಧೆ (Onion Thrips)',
    nameTa: 'வெங்காய இலைப்பேன் தாக்குதல்',
    nameTe: 'ఉల్లి తామర పురుగులు',
    scientificName: 'Thrips tabaci',
    type: 'insect_pest',
    severity: 'high',
    symptoms: 'Minute yellowish to dark brown slender insects hiding in the narrow crevices between central leaf sheaths; rasping and sap sucking produces whitish or silvery blotches, patches and streaks along leaf blades; leaves become crinkled, curled, and wither from tip downwards, giving the field a scorched silvery appearance.',
    symptomsKn: 'ಎಲೆಗಳ ಬುಡದ ಸಂದುಗಳಲ್ಲಿ ಸೂಕ್ಷ್ಮ ಹಳದಿ-ಕಂದು ಹೇನುಗಳು ಅಡಗಿರುತ್ತವೆ. ರಸ ಹೀರುವುದರಿಂದ ಎಲೆಗಳ ಮೇಲೆ ಬಿಳಿ ಅಥವಾ ಬೆಳ್ಳಿಯಂತಹ ಚುಕ್ಕೆಗಳು ಮತ್ತು ಗೆರೆಗಳು ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತವೆ. ಎಲೆಗಳು ತುದಿಯಿಂದ ಒಣಗುತ್ತಾ ಬಂದು ಇಡೀ ಹೊಲ ಬೆಳ್ಳಿಯಂತೆ ಹೊಳೆಯುತ್ತದೆ.',
    symptomsTa: 'இலைகளின் அடியில் சிறிய மஞ்சள்-பழுப்பு பேன்கள் இருக்கும். சாற்றை உறிஞ்சுவதால் இலைகளில் வெள்ளி போன்ற வெண் புள்ளிகளும் கோடுகளும் தோன்றும். இலைகள் நுனியிலிருந்து காயும்.',
    symptomsTe: 'ఆకుల మొదళ్ల సందుల్లో చిన్న పసుపు-గోధుమ రంగు పురుగులు ఉంటాయి. రసం పీల్చడం వల్ల ఆకులపై వెండి రంగు మచ్చలు, చారలు ఏర్పడతాయి. ఆకులు పైనుండి ఎండిపోతాయి.',
    cause: 'Sap-sucking tiny insect Thrips tabaci.',
    favourableConditions: 'Hot dry weather (30-35°C), low rainfall spells, and low relative humidity (<60%).',
    favourableHumidity: '<60%',
    favourableTemp: '28-35°C',
    favourableSeasons: ['Rabi', 'Zaid', 'Kharif'],
    affectedStages: ['Vegetative Growth', 'Bulb Formation'],
    spreadPattern: 'Rapid multiplication in warm dry weather; insects shelter deep inside inner leaf sheaths.',
    culturalControl: 'Install blue or yellow sticky traps at 20-25 traps/acre. Sprinkler irrigation suppresses thrips populations physically. Avoid water stress.',
    culturalControlKn: 'ಎಕರೆಗೆ 20-25 ನೀಲಿ ಅಥವಾ ಹಳದಿ ಜಿಗುಟು ಬಲೆಗಳನ್ನು ಅಳವಡಿಸಿ. ತುಂತುರು ನೀರಾವರಿ ಬಳಸಿದರೆ ಹೇನುಗಳ ಸಂಖ್ಯೆ ಕಡಿಮೆಯಾಗುತ್ತದೆ.',
    culturalControlTa: 'ஏக்கருக்கு 20-25 நீல அல்லது மஞ்சள் ஒட்டும் பொறி வைக்கவும். தெளிப்பு பாசனம் செய்யவும்.',
    culturalControlTe: 'ఎకరానికి 20-25 నీలి లేదా పసుపు జిగురు బుట్టలు పెట్టండి. స్ప్రింక్లర్ల ద్వారా నీరు ఇవ్వండి.',
    biologicalControl: 'Spray entomopathogenic fungus Beauveria bassiana or Lecanicillium lecanii.',
    biologicalControlKn: 'ಬ್ಯೂವೇರಿಯಾ ಅಥವಾ ಲೆಕಾನಿಸಿಲಿಯಮ್ ಜೈವಿಕ ಕೀಟನಾಶಕ ಸಿಂಪಡಿಸಿ.',
    biologicalControlTa: 'பவேரியா பூஞ்சாணத்தை தெளிக்கவும்.',
    biologicalControlTe: 'బవేరియా ద్రావణాన్ని పిచಿಕారీ చేయండి.',
    organicControl: 'Foliar spray of 5% Neem Seed Kernel Extract (NSKE) or garlic-chilli extract with sticking agent.',
    organicControlKn: 'ಬೇವಿನ ಬೀಜದ ಕಷಾಯ (NSKE 5%) ಸಿಂಪಡಿಸಿ.',
    organicControlTa: '5% வேப்பங்கொட்டை கரைசல் தெளிக்கவும்.',
    organicControlTe: '5% వేప గింజల కషాయం పిచికారీ చేయండి.',
    chemicalControl: 'Foliar spray of Fipronil or Spinosad or Profenofos or Acetamiprid with a wetting agent (sticker) directed into the central leaf sheath whorl when ETL (30 thrips/plant) is crossed. Note: Read container label for dilution and pre-harvest interval; consult local KVK.',
    chemicalControlKn: 'ಹೇನುಗಳ ಹಾವಳಿ ಮೀರಿದಾಗ ಫಿಪ್ರೋನಿಲ್ ಅಥವಾ ಸ್ಪಿನೋಸ್ಯಾಡ್ ಜೊತೆಗೆ ಅಂಟು ದ್ರಾವಣ ಬೆರೆಸಿ ಎಲೆಯ ಸುಳಿಗೆ ಸಿಂಪಡಿಸಿ. ಲೇಬಲ್ ಸೂಚನೆ ಪಾಲಿಸಿ.',
    chemicalControlTa: 'தாக்குதல் தீவிரமடைந்தால் பிப்ரோனில் அல்லது ஸ்பினோசாட் மருந்தை ஒட்டும் திரவத்துடன் சேர்த்து தெளிக்கவும்.',
    chemicalControlTe: 'పురుగు ఉధృతి పెరిగినప్పుడు ఫిప్రోనిల్ లేదా స్పినోసాడ్ తో పాటు జిగురు కలిపి పిచಿಕారీ చేయండి.',
    preventionSteps: ['Install blue sticky traps early.', 'Use sprinkler irrigation in dry periods.', 'Regular monitoring of inner leaf sheaths.'],
    preventionStepsKn: ['ನೀಲಿ ಬಲೆಗಳನ್ನು ಮುಂಚಿತವಾಗಿ ಹಾಕಿ.', 'ಒಣ ಹವೆಯಲ್ಲಿ ತುಂತುರು ನೀರಾವರಿ ನೀಡಿ.'],
    preventionStepsTa: ['நீல ஒட்டும் பொறிகளை முன்கூட்டியே வைக்கவும்.', 'தெளிப்பு பாசனம் பயன்படுத்தவும்.'],
    preventionStepsTe: ['నీలి జిగురు బుట్టలను ముందుగానే పెట్టండి.', 'స్ప్రింక్లర్లతో నీటి తడులు ఇవ్వండి.'],
    ipmSteps: [
      'Step 1: Blue sticky traps for adult thrips monitoring and mass trapping.',
      'Step 2: Sprinkler washings during dry spells.',
      'Step 3: Botanical neem oil / NSKE spray into sheath axils.',
      'Step 4: Targeted selective insecticide with surfactant if ETL exceeded.'
    ],
    ipmStepsKn: ['ಹಂತ 1: ನೀಲಿ ಜಿಗುಟು ಬಲೆ', 'ಹಂತ 2: ತುಂತುರು ನೀರಾವರಿ ತಂಪಾಗಿಸುವಿಕೆ', 'ಹಂತ 3: ಬೇವಿನ ಕಷಾಯ', 'ಹಂತ 4: ಅಂಟು ದ್ರಾವಣದೊಂದಿಗೆ ಕೀಟನಾಶಕ'],
    ipmStepsTa: ['படி 1: நீல ஒட்டும் பொறி', 'படி 2: தெளிப்பு பாசனம்', 'படி 3: வேப்பங்கொட்டை கரைசல்', 'படி 4: பூச்சிக்கொல்லி'],
    ipmStepsTe: ['దశ 1: నీలి జిగురు బుట్టలు', 'దశ 2: స్ప్రింక్లర్లు', 'దశ 3: వేప కషాయం', 'దశ 4: జిగురుతో పురుగుమందు'],
    safetyNotes: 'Always add a non-ionic wetting agent (surfactant/sticker) because onion leaves are waxy and smooth.',
    lookAlikes: [
      { name: 'Purple Blotch of Onion (Alternaria porri)', difference: 'Purple blotch produces sunken purple-brown oval lesions with yellow halos; thrips produce fine silvery scratches and white streaks.' },
      { name: 'Downy Mildew of Onion', difference: 'Downy mildew causes purplish-grey downy mould on leaves during cold misty mornings.' }
    ],
    whenToCallExpert: 'Call KVK/RSK if leaves turn silvery-white and wither rapidly during bulb development.',
    whenToCallExpertKn: 'ಗೆಡ್ಡೆ ಕಟ್ಟುವ ಹಂತದಲ್ಲಿ ಎಲೆಗಳು ಬೆಳ್ಳಗಾಗಿ ಒಣಗಲು ಪ್ರಾರಂಭಿಸಿದರೆ ತಕ್ಷಣ ಕೃಷಿ ಅಧಿಕಾರಿಯನ್ನು ಸಂಪರ್ಕಿಸಿ.',
    whenToCallExpertTa: 'வெங்காயம் ஊறும் போது இலைகள் வெள்ளையாகி காய்ந்தால் வேளாண் அலுவலரை அணுகவும்.',
    whenToCallExpertTe: 'ఉల్లిపాయ ఊరే దశలో ఆకులు తెల్లగా మారి ఎండిపోతే వెంటనే వ్యవసాయాధికారిని సంప్రదించండి.',
    confidence: 'verified',
    sources: 'ICAR-DOGR Rajgurunagar (Directorate of Onion and Garlic Research), UAS Dharwad.',
    crops: [
      { cropName: 'Onion', cropSlug: 'onion', importance: 'primary' },
      { cropName: 'Garlic', cropSlug: 'garlic', importance: 'primary' }
    ],
    symptomTags: [
      { tagSlug: 'part-leaf', weight: 3.0, isPrimary: true },
      { tagSlug: 'pattern-streaks', weight: 3.0, isPrimary: true },
      { tagSlug: 'colour-white-grey', weight: 2.5, isPrimary: true },
      { tagSlug: 'pattern-insects-visible', weight: 2.0, isPrimary: false },
      { tagSlug: 'pattern-browning', weight: 1.5, isPrimary: false }
    ],
    images: [
      {
        path: '/problems/onion-thrips/silvery-patches-streaks-onion-leaf.webp',
        caption: 'Silvery white feeding patches and dried tips on onion foliage caused by onion thrips rasping.',
        captionKn: 'ಈರುಳ್ಳಿ ಎಲೆಯ ಮೇಲೆ ಹೇನುಗಳಿಂದ ಉಂಟಾದ ಬೆಳ್ಳಿಯಂತಹ ಚುಕ್ಕೆಗಳು ಮತ್ತು ಒಣಗಿದ ತುದಿಗಳು.',
        kind: 'symptom_closeup',
        source: 'Wikimedia Commons',
        author: 'Whitney Cranshaw, Colorado State University',
        licence: 'CC BY 3.0',
        attribution: 'Whitney Cranshaw / Wikimedia Commons',
        isPrimary: true
      }
    ]
  },

  // ==========================================
  // OKRA (BHENDI) (ADDITIONAL)
  // ==========================================
  {
    slug: 'shoot-fruit-borer-okra',
    name: 'Shoot and Fruit Borer of Okra (Bhendi)',
    nameKn: 'ಬೆಂಡೆಕಾಯಿಯ ಚಿಗುರು ಮತ್ತು ಕಾಯಿ ಕೊರೆಯುವ ಹುಳು (Shoot & Fruit Borer)',
    nameTa: 'வெண்டை தண்டு மற்றும் காய் துளைப்பான்',
    nameTe: 'బెండ కాండం మరియు కాయ తొలుచు పురుగు',
    scientificName: 'Earias vittella & Earias insulana',
    type: 'insect_pest',
    severity: 'critical',
    symptoms: 'Larvae bore into terminal tender shoots in early stage causing wilting and drooping ("withered shoot tips"); later, caterpillars bore into flower buds and fruits, plugging entry holes with excreta (frass); damaged fruits become deformed, crooked, and unmarketable with internal feeding cavities.',
    symptomsKn: 'ಆರಂಭದಲ್ಲಿ ಹುಳು ಎಳೆ ಚಿಗುರನ್ನು ಕೊರೆದು ತುದಿಯು ಬಾಡಿ ಒಣಗುತ್ತದೆ. ನಂತರ ಹೂವಿನ ಮೊಗ್ಗು ಮತ್ತು ಕಾಯಿಗಳನ್ನು ಕೊರೆದು ಒಳಗೆ ಸೇರಿ ಹಿಕ್ಕೆಗಳಿಂದ ರಂಧ್ರ ಮುಚ್ಚುತ್ತದೆ. ಕಾಯಿಗಳು ವಕ್ರವಾಗಿ ವಿರೂಪಗೊಂಡು ಕೊಳೆಯುತ್ತವೆ.',
    symptomsTa: 'ஆரம்பத்தில் இளம் குருத்தை துளைப்பதால் குருத்து வாடி தொங்கும். பின் காய்களை துளைத்து உள்ளே சென்று எச்சத்தால் துளையை அடைக்கும். காய்கள் வளைந்து சந்தைப்படுத்த முடியாமல் போகும்.',
    symptomsTe: 'మొదట లేత రెమ్మలను తొలిచి మొగ్గలు వాలిపోయేలా చేస్తుంది. తర్వాత కాయల్లోకి తొలిచి లోపల గుజ్జు తింటూ రంధ్రం వద్ద మలాన్ని నింపుతుంది. కాయలు వంకర్లు తిరిగి పనికిరాకుండా పోతాయి.',
    cause: 'Spotted bollworm caterpillars (Earias vittella/insulana) with spindle-shaped body and orange-brown markings.',
    favourableConditions: 'Warm humid weather (25-32°C), high relative humidity (70-85%), and continuous cultivation of malvaceous crops (cotton, bhendi).',
    favourableHumidity: '70-85%',
    favourableTemp: '25-32°C',
    favourableSeasons: ['Kharif', 'Rabi', 'Zaid'],
    affectedStages: ['Vegetative Growth', 'Flowering', 'Fruiting'],
    spreadPattern: 'Moths lay bluish-green sculptured eggs singly on buds and tender leaves; caterpillars bore in quickly.',
    culturalControl: 'Collect and destroy clipped withered shoot tips along with larvae inside. Regularly pick and destroy bored fruits at each harvest. Install pheromone traps at 5 traps/acre.',
    culturalControlKn: 'ಬಾಡಿದ ಚಿಗುರುಗಳನ್ನು ಕತ್ತರಿಸಿ ಹುಳು ಸಹಿತ ನಾಶಪಡಿಸಿ. ಕೊರೆದ ಕಾಯಿಗಳನ್ನು ಕೊಯ್ಲು ಮಾಡುವಾಗ ಪ್ರತ್ಯೇಕವಾಗಿ ಆಯ್ದು ಹೂತುಹಾಕಿ. ಮೋಹಕ ಬಲೆ ಹಾಕಿ.',
    culturalControlTa: 'வாடிய குருத்துகளை வெட்டி அழிக்கவும். புழு தாக்கிய காய்களை சேகரித்து அழிக்கவும். இனக்கவர்ச்சி பொறி வைக்கவும்.',
    culturalControlTe: 'వాడిపోయిన కొమ్మల చివర్లను తుంచి నాశనం చేయండి. పురుగు పట్టిన కాయలను ఏరి కాల్చండి. లింగాకర్షక బుట్టలు పెట్టండి.',
    biologicalControl: 'Release egg parasitoid Trichogramma chilonis at 20,000/acre at weekly intervals during flowering. Spray Bacillus thuringiensis (Bt) formulation.',
    biologicalControlKn: 'ಹೂ ಬಿಡುವಾಗ ವಾರಕ್ಕೊಮ್ಮೆ ಟ್ರೈಕೋಗ್ರಾಮಾ ಪರಾವಲಂಬಿಗಳನ್ನು ಬಿಡಿ. ಬಿಟಿ (Bacillus thuringiensis) ಸಿಂಪಡಿಸಿ.',
    biologicalControlTa: 'டிரைக்கோகிரம்மா ஒட்டுண்ணிகளை வயலில் விடவும். பி.டி (Bt) தெளிக்கவும்.',
    biologicalControlTe: 'ట్రైకోగ్రామా కార్డులను పొలంలో అమర్చండి. బి.టి ద్రావణాన్ని పిచಿಕారీ చేయండి.',
    organicControl: 'Foliar spray of 5% Neem Seed Kernel Extract (NSKE) or Neem oil (1500 ppm) at 10-day intervals.',
    organicControlKn: 'ಬೇವಿನ ಕಷಾಯ (NSKE 5%) ಅಥವಾ ಬೇವಿನ ಎಣ್ಣೆ ಸಿಂಪಡಿಸಿ.',
    organicControlTa: '5% வேப்பங்கொட்டை கரைசல் தெளிக்கவும்.',
    organicControlTe: '5% వేప గింజల కషాయం పిచికారీ చేయండి.',
    chemicalControl: 'Foliar spray of Chlorantraniliprole or Emamectin Benzoate or Spinosad or Indoxacarb when ETL (5% fruit damage) is reached. Note: Observe strict pre-harvest intervals (PHI) before picking edible bhendi; follow label instructions.',
    chemicalControlKn: 'ಕಾಯಿ ಹಾನಿ ಹೆಚ್ಚಿದ್ದಾಗ ಕ್ಲೋರಾಂಟ್ರಾನಿಲಿಪ್ರೋಲ್ ಅಥವಾ ಎಮಾಮೆಕ್ಟಿನ್ ಬೆಂಜೊಯೇಟ್ ಅಥವಾ ಸ್ಪಿನೋಸ್ಯಾಡ್ ಸಿಂಪಡಿಸಿ. ಕೊಯ್ಲಿನ ಮುನ್ನ ಕಾಯುವ ಸಮಯ (PHI) ಕಡ್ಡಾಯವಾಗಿ ಪಾಲಿಸಿ.',
    chemicalControlTa: 'சேதம் அதிகமானால் குளோரான்ட்ரனிலிப்ரோல் அல்லது ஸ்பினோசாட் தெளிக்கவும். அறுவடை இடைவெளியை கட்டாயம் பின்பற்றவும்.',
    chemicalControlTe: 'కాయలపై ఉధృతి ఉంటే క్లోరాంట్రానిలిప్రోల్ లేదా స్పినోసాడ్ పిచికారీ చేయండి. కాయలు కోసే ముందు నిరీక్షణ సమయం పాటించండి.',
    preventionSteps: ['Clip withered shoots promptly.', 'Regular harvest of all marketable fruits.', 'Erect pheromone traps early.'],
    preventionStepsKn: ['ಬಾಡಿದ ಕುಡಿಗಳನ್ನು ನಿಯಮಿತವಾಗಿ ಕತ್ತರಿಸಿ.', 'ಸಕಾಲದಲ್ಲಿ ಕಾಯಿ ಕೊಯ್ಲು ಮಾಡಿ.'],
    preventionStepsTa: ['வாடிய குருத்துகளை உடனே வெட்டி அகற்றவும்.', 'இனக்கவர்ச்சி பொறி வைக்கவும்.'],
    preventionStepsTe: ['వాడిన రెమ్మలను ఎప్పటికప్పుడు తుంచండి.', 'లింగాకర్షక బుట్టలు ముందుగానే పెట్టండి.'],
    ipmSteps: [
      'Step 1: Pheromone traps (5/acre) for moth monitoring.',
      'Step 2: Clipping and destruction of bored vegetative shoots.',
      'Step 3: Release of Trichogramma egg parasitoids.',
      'Step 4: Neem oil / Bt spray on flower flushes.',
      'Step 5: Safe selective insecticide with short PHI if fruit damage crosses 5%.'
    ],
    ipmStepsKn: ['ಹಂತ 1: ಮೋಹಕ ಬಲೆ', 'ಹಂತ 2: ಬಾಡಿದ ಕುಡಿ ಕತ್ತರಿಸುವುದು', 'ಹಂತ 3: ಟ್ರೈಕೋಗ್ರಾಮಾ ಪರಾವಲಂಬಿ', 'ಹಂತ 4: ಬೇವಿನ ಎಣ್ಣೆ / ಬಿಟಿ ಸಿಂಪರಣೆ', 'ಹಂತ 5: ಕಡಿಮೆ ವಿಷತ್ವದ ಕೀಟನಾಶಕ'],
    ipmStepsTa: ['படி 1: இனக்கவர்ச்சி பொறி', 'படி 2: வாடிய குருத்து வெட்டுதல்', 'படி 3: ஒட்டுண்ணி வெளியீடு', 'படி 4: வேப்ப எண்ணெய்', 'படி 5: குறைந்த நச்சு பூச்சிக்கொல்லி'],
    ipmStepsTe: ['దశ 1: లింగాకర్షక బుట్టలు', 'దశ 2: కొమ్మల కత్తిరింపు', 'దశ 3: మిత్రపురుగులు', 'దశ 4: వేప నూనె', 'దశ 5: సురక్షిత పురుగుమందు'],
    safetyNotes: 'Bhendi is harvested every 2-3 days; NEVER use organophosphates or synthetic pyrethroids with long persistent residues on fruiting okra.',
    lookAlikes: [
      { name: 'Helicoverpa armigera in Okra', difference: 'Helicoverpa caterpillar remains half outside the pod while feeding on seeds, whereas Earias enters completely and plugs entrance with wet excreta.' },
      { name: 'Damping Off', difference: 'Damping off collapses seedling collar at ground level, not shoot tip wilting in grown bushes.' }
    ],
    whenToCallExpert: 'Call KVK/RSK if fruit boring exceeds 5% during peak picking season.',
    whenToCallExpertKn: 'ಕೊಯ್ಲಿನ ಸಮಯದಲ್ಲಿ 5% ಕ್ಕಿಂತ ಹೆಚ್ಚು ಕಾಯಿಗಳಿಗೆ ಹುಳು ಬಿದ್ದರೆ ತಕ್ಷಣ ಕೃಷಿ ಅಧಿಕಾರಿಗಳನ್ನು ಸಂಪರ್ಕಿಸಿ.',
    whenToCallExpertTa: '5% மேற்பட்ட காய்கள் பாதிக்கப்பட்டால் வேளாண் அலுவலரை அணுகவும்.',
    whenToCallExpertTe: '5% కంటే ఎక్కువ కాయలు దెబ్బతింటే వెంటనే వ్యవసాయాಧಿಕారిని సంప్రదించండి.',
    confidence: 'verified',
    sources: 'ICAR-IIHR Bengaluru, UAS Dharwad Vegetable Division.',
    crops: [
      { cropName: 'Okra (Bhendi)', cropSlug: 'okra', importance: 'primary' },
      { cropName: 'Cotton', cropSlug: 'cotton', importance: 'secondary' }
    ],
    symptomTags: [
      { tagSlug: 'part-fruit-grain', weight: 3.0, isPrimary: true },
      { tagSlug: 'part-stem', weight: 2.5, isPrimary: true },
      { tagSlug: 'pattern-holes', weight: 3.0, isPrimary: true },
      { tagSlug: 'pattern-wilting', weight: 2.0, isPrimary: false },
      { tagSlug: 'pattern-insects-visible', weight: 2.0, isPrimary: false }
    ],
    images: [
      {
        path: '/problems/shoot-fruit-borer-okra/bored-bhendi-fruit-crooked.webp',
        caption: 'Bored entry hole plugged with excreta and distorted crooked fruit growth caused by Earias vittella.',
        captionKn: 'ಬೆಂಡೆಕಾಯಿಗೆ ರಂಧ್ರ ಕೊರೆದು ವಿರೂಪಗೊಂಡಿರುವ ಕಾಯಿ ಕೊರೆಯುವ ಹುಳು.',
        kind: 'symptom_closeup',
        source: 'Wikimedia Commons',
        author: 'ICAR-IIHR Bengaluru',
        licence: 'CC BY-SA 4.0',
        attribution: 'ICAR-IIHR Bengaluru / Wikimedia Commons',
        isPrimary: true
      }
    ]
  },

  // ==========================================
  // BANANA (ADDITIONAL)
  // ==========================================
  {
    slug: 'sigatoka-leaf-spot-banana',
    name: 'Sigatoka Leaf Spot of Banana (Yellow & Black Sigatoka)',
    nameKn: 'ಬಾಳೆಯ ಸಿಗಾಟೋಕ ಎಲೆ ಚುಕ್ಕೆ ರೋಗ (Sigatoka Leaf Spot)',
    nameTa: 'வாழை சிகடோகா இலைப்புள்ளி நோய்',
    nameTe: 'అరటి సిగటోకా ఆకుమచ్చ తెగులు',
    scientificName: 'Pseudocercospora musae (Mycosphaerella musicola)',
    type: 'fungal',
    severity: 'high',
    symptoms: 'Small yellowish-green specks appear parallel to leaf veins on 3rd or 4th leaf; specks enlarge into linear spindle-shaped reddish-brown streaks with grey ash centers and a bright yellow chlorotic halo; spots coalesce causing extensive leaf drying, premature scorching of foliage, and early uneven ripening of banana bunches.',
    symptomsKn: 'ಎಲೆಗಳ ಮೇಲೆ ನರಗಳಿಗೆ ಸಮಾನಾಂತರವಾಗಿ ಸಣ್ಣ ಹಳದಿ ಕಲೆಗಳು ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತವೆ. ನಂತರ ಇವು ಕಂದು ಬಣ್ಣದ ಅಂಡಾಕಾರದ ಕಲೆಗಳಾಗಿ ಮಾರ್ಪಟ್ಟು ಕೇಂದ್ರಭಾಗ ಬೂದಿ ಬಣ್ಣದ್ದಾಗಿ ಸುತ್ತಲೂ ಹಳದಿ ಬಣ್ಣವಿರುತ್ತದೆ. ಕಲೆಗಳು ಒಂದಾಗಿ ಎಲೆ ಪೂರ್ತಿ ಒಣಗುತ್ತದೆ, ಗೊನೆಗಳು ಸರಿಯಾಗಿ ಮಾಗುವುದಿಲ್ಲ.',
    symptomsTa: 'இலைகளில் நரம்புகளுக்கு இணையாக சிறிய மஞ்சள் புள்ளிகள் தோன்றும். பின் அவை பழுப்பு நிறமாக மாறி நடுவில் சாம்பல் நிறமும் சுற்றிலும் மஞ்சள் வளையமும் காணப்படும். இலைகள் தீய்ந்து போகும்.',
    symptomsTe: 'ఆకులపై ఈనెల వెంట చిన్న పసుపు-ఆకుపచ్చ చుక్కలు ఏర్పడతాయి. తర్వాత అవి గోధుమ రంగు మచ్చలుగా మారి మధ్యలో బూడిద రంగు, చుట్టూ పసుపు వలయం ఏర్పడతాయి. ఆకులు పూర్తిగా ఎండిపోతాయి.',
    cause: 'Fungus Pseudocercospora musae spreading by ascospores and conidia in moist weather.',
    favourableConditions: 'High humidity (>85%), frequent showers, overcast weather, temperatures 23-28°C, and poor drainage.',
    favourableHumidity: '>85%',
    favourableTemp: '23-28°C',
    favourableSeasons: ['Kharif', 'Rabi'],
    affectedStages: ['Vegetative Growth', 'Flowering', 'Fruiting'],
    spreadPattern: 'Wind and rain splash disperse conidia; spreads rapidly from lower older leaves to upper canopy.',
    culturalControl: 'Cut and burn severely spotted and dried lower leaves (de-leafing) to reduce spore load. Maintain proper spacing and drainage. Keep plantation weed-free.',
    culturalControlKn: 'ರೋಗಪೀಡಿತ ಒಣಗಿದ ಎಲೆಗಳನ್ನು ಕತ್ತರಿಸಿ ತೋಟದಿಂದ ಹೊರಗೆ ಹಾಕಿ ಸುಟ್ಟುಹಾಕಿ. ಸಮರ್ಪಕ ಬಸಿಗಾಲುವೆ ನಿರ್ವಹಿಸಿ.',
    culturalControlTa: 'பாதிக்கப்பட்ட அடி இலைகளை வெட்டி அப்புறப்படுத்தி எரிக்கவும். வடிகால் வசதி செய்யவும்.',
    culturalControlTe: 'బాగా తెగులు సోకిన కింది ఆకులను కత్తిరించి కాల్చేయండి. మురుగు నీటి కాలువలు తీయండి.',
    biologicalControl: 'Foliar spray of Pseudomonas fluorescens or Bacillus subtilis at monthly intervals.',
    biologicalControlKn: 'ತಿಂಗಳಿಗೊಮ್ಮೆ ಸ್ಯೂಡೋಮೊನಾಸ್ ಅಥವಾ ಬ್ಯಾಸಿಲಸ್ ಜೈವಿಕ ದ್ರಾವಣ ಸಿಂಪಡಿಸಿ.',
    biologicalControlTa: 'மாதமொருமுறை சூடோமோனாஸ் அல்லது பேசிலஸ் தெளிக்கவும்.',
    biologicalControlTe: 'నెలకు ఒకసారి సూడోమోనాస్ పైరుపై పిచికారీ చేయండి.',
    organicControl: 'Foliar spray of 1% Bordeaux mixture or 5% mineral oil / petroleum oil spray emulsion.',
    organicControlKn: '1% ಬೋರ್ಡೋ ದ್ರಾವಣ ಅಥವಾ ಮಿನರಲ್ ಆಯಿಲ್ ಸಿಂಪಡಿಸಿ.',
    organicControlTa: '1% போர்டோ கலவை அல்லது தாது எண்ணெய் தெளிக்கவும்.',
    organicControlTe: '1% బోర్డో మిశ్రమం లేదా మినరల్ ఆయిల్ పిచికారీ చేయండి.',
    chemicalControl: 'Foliar spray of Propiconazole or Azoxystrobin or Mancozeb or Carbendazim mixed with mineral oil / sticker directed to upper and lower leaf surfaces. Note: Rotate systemic fungicides with contact protectants to avoid fungal resistance; follow label directions.',
    chemicalControlKn: 'ಪ್ರೋಪಿಕೊನಾಜೋಲ್ ಅಥವಾ ಅಜಾಕ್ಸಿಸ್ಟ್ರೋಬಿನ್ ಅಥವಾ ಮ್ಯಾಂಕೋಜೆಬ್ ಅನ್ನು ಮಿನರಲ್ ಆಯಿಲ್ ಜೊತೆ ಬೆರೆಸಿ ಎಲೆಗಳ ಮೇಲೆ ಸಿಂಪಡಿಸಿ. ಲೇಬಲ್ ಸೂಚನೆ ಪಾಲಿಸಿ.',
    chemicalControlTa: 'புரோபிகோனசோல் அல்லது மாங்கோசெப் மருந்தை மினரல் எண்ணெயுடன் சேர்த்து தெளிக்கவும்.',
    chemicalControlTe: 'ప్రొపికొనజోల్ లేదా మ్యాంకోజెబ్ ను మినరల్ ఆయిల్ తో కలిపి ఆకులపై పిచికారీ చేయండి.',
    preventionSteps: ['Regular de-leafing of diseased leaves.', 'Avoid overhead sprinkler irrigation.', 'Ensure garden drainage ditches are clear.'],
    preventionStepsKn: ['ನಿಯಮಿತವಾಗಿ ರೋಗಗ್ರಸ್ತ ಎಲೆಗಳನ್ನು ಕತ್ತರಿಸಿ ತೆಗೆಯಿರಿ.', 'ತೋಟದಲ್ಲಿ ನೀರು ನಿಲ್ಲದಂತೆ ನೋಡಿಕೊಳ್ಳಿ.'],
    preventionStepsTa: ['பாதிக்கப்பட்ட இலைகளை உடனுக்குடன் அகற்றவும்.', 'நீர் தேங்காமல் பார்த்துக் கொள்ளவும்.'],
    preventionStepsTe: ['తెగులు ఆకులను ఎప్పటికప్పుడు తీసేయండి.', 'నీరు నిలవకుండా చూసుకోండి.'],
    ipmSteps: [
      'Step 1: Systematic de-leafing and field sanitation.',
      'Step 2: Drainage improvement to lower relative humidity.',
      'Step 3: Prophylactic copper or bio-agent spray before monsoon onset.',
      'Step 4: Alternating systemic fungicides (triazoles/strobilurins) during peak monsoon spells.'
    ],
    ipmStepsKn: ['ಹಂತ 1: ಹಳೆಯ ಎಲೆ ಕತ್ತರಿಸುವುದು', 'ಹಂತ 2: ಬಸಿಗಾಲುವೆ ನಿರ್ವಹಣೆ', 'ಹಂತ 3: ಮಳೆಗಾಲಕ್ಕೂ ಮುನ್ನ ಮುಂಜಾಗ್ರತಾ ಸಿಂಪರಣೆ', 'ಹಂತ 4: ಶಿಲೀಂಧ್ರನಾಶಕಗಳ ಬದಲಾವಣೆ'],
    ipmStepsTa: ['படி 1: இலை கவாத்து', 'படி 2: வடிகால் வசதி', 'படி 3: பருவமழைக்கு முன் தெளிப்பு', 'படி 4: பூஞ்சாணக்கொல்லி மேலாண்மை'],
    ipmStepsTe: ['దశ 1: ఎండిన ఆకుల తొలగింపు', 'దశ 2: మురుగు కాలువలు', 'దశ 3: తొలకరి పిచికారీ', 'దశ 4: శిలీంధ్రనాశినుల మార్పిడి'],
    safetyNotes: 'Wear rain gear and goggles when spraying tall banana canopy. Never dump pruned diseased leaves into irrigation ditches.',
    lookAlikes: [
      { name: 'Potassium Deficiency in Banana', difference: 'Potassium deficiency causes yellowing and marginal scorching of older leaves from tip inward, without spindle-shaped grey-centered necrotic lesions.' },
      { name: 'Cordana Leaf Spot', difference: 'Cordana spots are large oval brown patches with zigzag yellow borders, usually beginning at leaf margin.' }
    ],
    whenToCallExpert: 'Call KVK or horticultural officer if fewer than 5 functional green leaves remain on banana plants at shooting/bunch emergence.',
    whenToCallExpertKn: 'ಗೊನೆ ಬಿಡುವ ಸಮಯದಲ್ಲಿ ಬಾಳೆ ಗಿಡದಲ್ಲಿ 5 ಕ್ಕಿಂತ ಕಡಿಮೆ ಹಸಿರೆಲೆಗಳಿದ್ದರೆ ತಕ್ಷಣ ತೋಟಗಾರಿಕಾ ತಜ್ಞರನ್ನು ಸಂಪರ್ಕಿಸಿ.',
    whenToCallExpertTa: 'பழத்தார் வெளிவரும் போது 5 க்கும் குறைவான இலைகளே இருந்தால் தோட்டக்கலை அலுவலரை அணுகவும்.',
    whenToCallExpertTe: 'గెల వేసే సమయంలో 5 కంటే తక్కువ పచ్చని ఆకులుంటే వెంటనే ఉద్యానవన అధికారిని సంప్రదించండి.',
    confidence: 'verified',
    sources: 'ICAR-NRC for Banana (NRCB) Tiruchirappalli, UAS Bangalore.',
    crops: [
      { cropName: 'Banana', cropSlug: 'banana', importance: 'primary' }
    ],
    symptomTags: [
      { tagSlug: 'part-leaf', weight: 3.0, isPrimary: true },
      { tagSlug: 'pattern-spots', weight: 3.0, isPrimary: true },
      { tagSlug: 'pattern-streaks', weight: 2.5, isPrimary: true },
      { tagSlug: 'colour-brown', weight: 2.0, isPrimary: false },
      { tagSlug: 'colour-yellow', weight: 1.5, isPrimary: false }
    ],
    images: [
      {
        path: '/problems/sigatoka-leaf-spot-banana/spindle-spots-grey-centers-banana.webp',
        caption: 'Linear spindle-shaped brown Sigatoka leaf lesions with distinctive grey ash centers and yellow chlorotic halos.',
        captionKn: 'ಬಾಳೆಯ ಎಲೆಯ ಮೇಲೆ ಬೂದಿ ಕೇಂದ್ರದ ಕಂದು ಬಣ್ಣದ ಸಿಗಾಟೋಕ ಕಲೆಗಳು.',
        kind: 'symptom_closeup',
        source: 'Wikimedia Commons',
        author: 'Scot Nelson',
        licence: 'Public Domain',
        attribution: 'Scot Nelson / Wikimedia Commons',
        isPrimary: true
      }
    ]
  },

  // ==========================================
  // MANGO (ADDITIONAL)
  // ==========================================
  {
    slug: 'mango-powdery-mildew',
    name: 'Mango Powdery Mildew',
    nameKn: 'ಮಾವಿನ ಬೂದಿ ರೋಗ (Powdery Mildew)',
    nameTa: 'மாம்பழ சாம்பல் நோய்',
    nameTe: 'మామిడి బూడిద తెగులు',
    scientificName: 'Oidium mangiferae',
    type: 'fungal',
    severity: 'critical',
    symptoms: 'White powdery superficial fungal patches appear on inflorescence panicles, tender flower stalks, and young leaves; flowers fail to open and drop prematurely; small pea-sized developing fruits become covered with white mould, turn brown, and drop off in large numbers, resulting in catastrophic fruit set failure.',
    symptomsKn: 'ಹೂಗೊಂಚಲು, ಹೂವಿನ ಕಡ್ಡಿಗಳು ಮತ್ತು ಎಳೆ ಚಿಗುರುಗಳ ಮೇಲೆ ಬಿಳಿ ಬೂದಿಯಂತಹ ಬೂಸ್ಟು ಆವರಿಸುತ್ತದೆ. ಹೂವುಗಳು ಅರಳದೆ ಉದುರುತ್ತವೆ. ಕಡಲೆಕಾಳಿನ ಗಾತ್ರದ ಎಳೆ ಮಿಡಿ ಕಾಯಿಗಳು ಕಪ್ಪಾಗಿ ಬಿದ್ದು ಹೋಗುತ್ತವೆ.',
    symptomsTa: 'பூங்கொத்துகள் மற்றும் இளம் இலைகள் மீது வெள்ளை சாம்பல் பூசணம் படரும். பூக்கள் விரியாமல் உதிரும். சிறிய மாம்பிஞ்சுகள் கருகி உதிர்ந்து காய்பிடிப்பு பாதிக்கப்படும்.',
    symptomsTe: 'పూత కొమ్మలు, పువ్వులు మరియు లేత పిందెలపై తెల్లటి బూడిద వంటి బూజు పడుతుంది. పూత విచ్చుకోకుండా రాలిపోతుంది. బఠానీ గింజ పరిమాణంలో ఉన్న పిందెలు నల్లబడి రాలిపోతాయి.',
    cause: 'Obligate biotrophic fungus Oidium mangiferae surviving on old infected leaves and malformed flushes.',
    favourableConditions: 'Cool dry nights (10-15°C) followed by warm sunny days (27-31°C) with morning heavy dews during flowering (December-March).',
    favourableHumidity: '65-80%',
    favourableTemp: '15-28°C',
    favourableSeasons: ['Rabi', 'Zaid'],
    affectedStages: ['Flowering', 'Fruiting'],
    spreadPattern: 'Wind-borne powdery conidia spread rapidly across orchard blocks during bloom periods.',
    culturalControl: 'Prune overcrowded inner branches and water sprouts after harvest to improve sunlight penetration and air circulation. Remove and burn malformed inflorescences.',
    culturalControlKn: 'ಕೊಯ್ಲಿನ ನಂತರ ಮರದ ಒಳಗಿನ ಒಣಗಿದ ರೆಂಬೆಗಳನ್ನು ಕತ್ತರಿಸಿ ಬಿಸಿಲು ಚೆನ್ನಾಗಿ ಬೀಳುವಂತೆ ಮಾಡಿ. ವಿರೂಪಗೊಂಡ ಹೂಗೊಂಚಲುಗಳನ್ನು ಸುಟ್ಟುಹಾಕಿ.',
    culturalControlTa: 'மரத்தின் உள்கிளைகளை கவாத்து செய்து சூரிய ஒளி படுமாறு செய்யவும். நோய் தாக்கிய பூங்கொத்துகளை எரிக்கவும்.',
    culturalControlTe: 'పంట కోత తర్వాత చెట్టు లోపలి ఎండు కొమ్మలను కత్తిరించి ఎండ బాగా తగిలేలా చేయండి. రోగ పూతను కాల్చండి.',
    biologicalControl: 'Spray bio-fungicide Ampelomyces quisqualis or Bacillus subtilis on early flower buds.',
    biologicalControlKn: 'ಹೂ ಬಿಡುವ ಆರಂಭದಲ್ಲಿ ಬ್ಯಾಸಿಲಸ್ ಸಬ್ಟಿಲಿಸ್ ಜೈವಿಕ ದ್ರಾವಣ ಸಿಂಪಡಿಸಿ.',
    biologicalControlTa: 'ஆரம்ப பூ மொட்டு பருவத்தில் பேசிலஸ் தெளிக்கவும்.',
    biologicalControlTe: 'మొగ్గ దశలో బాసిల్లస్ ద్రావణాన్ని పిచికారీ చేయండి.',
    organicControl: 'Foliar spray of Wettable Sulfur or 5% Cow urine-Hing solution or milk-water solution (1:10) on panicles.',
    organicControlKn: 'ಹೂಗೊಂಚಲಿಗೆ ಕರಗುವ ಗಂಧಕ ಅಥವಾ ಹಾಲಿನ ದ್ರಾವಣ ಸಿಂಪಡಿಸಿ.',
    organicControlTa: 'நனையும் கந்தகம் அல்லது பால் கரைசல் தெளிக்கவும்.',
    organicControlTe: 'నனையும் గంధకం లేదా పాల ద్రావణం పిచికారీ చేయండి.',
    chemicalControl: 'Three timely prophylactic sprays: 1st spray with Wettable Sulfur at panicle emergence; 2nd spray with Hexaconazole or Dinocap or Penconazole at full bloom; 3rd spray with Azoxystrobin or Carbendazim at pea-size fruit set. Note: Check label instructions; consult local KVK.',
    chemicalControlKn: 'ಹೂ ಹೊರಬರುವಾಗ ಕರಗುವ ಗಂಧಕ; ಪೂರ್ಣ ಹೂ ಬಿಡುವಾಗ ಹೆಕ್ಸಾಕೊನಾಜೋಲ್; ಮಿಡಿಗಾಯಿ ಕಟ್ಟುವಾಗ ಅಜಾಕ್ಸಿಸ್ಟ್ರೋಬಿನ್ ಸಿಂಪಡಿಸಿ. ಲೇಬಲ್ ಸೂಚನೆ ಪಾಲಿಸಿ.',
    chemicalControlTa: 'பூ வெளிவரும் போது கந்தகம்; முழு பூப்பில் ஹெக்சாகோனசோல்; பிஞ்சு பிடிக்கும் போது அசாசிஸ்ட்ரோபின் தெளிக்கவும்.',
    chemicalControlTe: 'పూత దశలో గంధకం; విచ్చుకున్నప్పుడు హెక్సాకొనజోల్; పిందె దశలో అజాక్సిస్ట్రోబిన్ పిచికారీ చేయండి.',
    preventionSteps: ['Always apply 1st spray before flowers open.', 'Prune tree canopy for sunlight penetration.'],
    preventionStepsKn: ['ಹೂ ಅರಳುವ ಮುನ್ನವೇ ಮೊದಲ ಸಿಂಪರಣೆ ಮುಗಿಸಿ.', 'ಮರಗಳಿಗೆ ಬಿಸಿಲು ಬೀಳುವಂತೆ ಕವಲೊಡೆಯಿರಿ.'],
    preventionStepsTa: ['பூ விரியும் முன் முதல் தெளிப்பை முடிக்கவும்.', 'மரத்தை நன்கு கவாத்து செய்யவும்.'],
    preventionStepsTe: ['పూత విచ్చుకోకముందే మొదటి పిచికారీ చేయండి.', 'చెట్లను బాగా కత్తిరించండి.'],
    ipmSteps: [
      'Step 1: Post-harvest pruning for sunlight aeration.',
      'Step 2: 1st sulfur spray at panicle emergence (before bloom).',
      'Step 3: 2nd systemic triazole spray at full bloom.',
      'Step 4: 3rd strobilurin/sulfur spray at marble/pea stage.'
    ],
    ipmStepsKn: ['ಹಂತ 1: ಕೊಯ್ಲಿನ ನಂತರ ಕೊಂಬೆ ಕತ್ತರಿಸುವುದು', 'ಹಂತ 2: ಹೂ ಬಿಡುವ ಮುನ್ನ ಗಂಧಕ ಸಿಂಪರಣೆ', 'ಹಂತ 3: ಹೂ ಬಿಟ್ಟಾಗ ಹೆಕ್ಸಾಕೊನಾಜೋಲ್', 'ಹಂತ 4: ಮಿಡಿಗಾಯಿ ಹಂತದಲ್ಲಿ ಸಿಂಪರಣೆ'],
    ipmStepsTa: ['படி 1: அறுவடை பின் கவாத்து', 'படி 2: பூ முன் கந்தகம்', 'படி 3: முழு பூப்பில் பூஞ்சாணக்கொல்லி', 'படி 4: பிஞ்சு பருவ தெளிப்பு'],
    ipmStepsTe: ['దశ 1: కొమ్మల కత్తిరింపు', 'దశ 2: పూత ముందు గంధకం', 'దశ 3: విరిసిన పూతపై స్ప్రే', 'దశ 4: పిందె దశలో పిచికారీ'],
    safetyNotes: 'Do not spray wettable sulfur when temperatures exceed 35°C as it can scorch flower panicles.',
    lookAlikes: [
      { name: 'Mango Hopper Damage', difference: 'Hoppers are wedge-shaped sap-sucking bugs producing sticky honeydew and black sooty mould, not white dry powdery fungal coating.' },
      { name: 'Mango Anthracnose', difference: 'Anthracnose causes black tar-like necrotic spots on blossoms and leaves during wet weather, without white powdery mildew.' }
    ],
    whenToCallExpert: 'Call horticulture officer or KVK if white powdery mould appears on newly emerged flower panicles before fruit set.',
    whenToCallExpertKn: 'ಹೂಗೊಂಚಲಿನಲ್ಲಿ ಬಿಳಿ ಬೂದಿ ರೋಗ ಕಂಡರೆ ತಕ್ಷಣ ತೋಟಗಾರಿಕಾ ತಜ್ಞರನ್ನು ಸಂಪರ್ಕಿಸಿ.',
    whenToCallExpertTa: 'பூங்கொத்தில் சாம்பல் நோய் தென்பட்டால் உடனடியாக தோட்டக்கலை அலுவலரை அணுகவும்.',
    whenToCallExpertTe: 'పూతపై బూడిద తెగులు కనిపిస్తే వెంటనే ఉద్యాన అధికారిని సంప్రదించండి.',
    confidence: 'verified',
    sources: 'ICAR-CISH Lucknow, TNAU Horticultural College, UAS Bangalore.',
    crops: [
      { cropName: 'Mango', cropSlug: 'mango', importance: 'primary' }
    ],
    symptomTags: [
      { tagSlug: 'part-flower', weight: 3.0, isPrimary: true },
      { tagSlug: 'pattern-powdery-mould', weight: 3.0, isPrimary: true },
      { tagSlug: 'colour-white-grey', weight: 3.0, isPrimary: true },
      { tagSlug: 'part-fruit-grain', weight: 2.0, isPrimary: false },
      { tagSlug: 'pattern-browning', weight: 1.5, isPrimary: false }
    ],
    images: [
      {
        path: '/problems/mango-powdery-mildew/white-powdery-flower-panicle.webp',
        caption: 'Heavy white powdery fungal growth smothering mango blossom panicle and dropping flower buds.',
        captionKn: 'ಮಾವಿನ ಹೂಗೊಂಚಲಿಗೆ ಆವರಿಸಿರುವ ಬಿಳಿ ಬೂದಿ ರೋಗ.',
        kind: 'symptom_closeup',
        source: 'Wikimedia Commons',
        author: 'Scot Nelson',
        licence: 'Public Domain',
        attribution: 'Scot Nelson / Wikimedia Commons',
        isPrimary: true
      }
    ]
  },

  // ==========================================
  // COCONUT (ADDITIONAL)
  // ==========================================
  {
    slug: 'bud-rot-coconut',
    name: 'Bud Rot of Coconut Palm',
    nameKn: 'ತೆಂಗಿನ ಸುಳಿ ಕೊಳೆ ರೋಗ (Bud Rot)',
    nameTa: 'தென்னை குருத்தழுகல் நோய்',
    nameTe: 'కొబ్బరి మొవ్వు కుళ్ళు తెగులు',
    scientificName: 'Phytophthora palmivora',
    type: 'fungal',
    severity: 'critical',
    symptoms: 'The earliest symptom is discoloration and withering of the central spindle shoot leaf; the spindle turns yellowish-brown, wilts, bends over and rots; foul rotting odor emanates from the crown bud; the central spear leaf can be pulled out easily; surrounding inner fronds gradually wither and drop, leading to death of the palm.',
    symptomsKn: 'ಮುಖ್ಯ ಸುಳಿ ಎಲೆ ಹಳದಿ-ಕಂದು ಬಣ್ಣಕ್ಕೆ ತಿರುಗಿ ಒಣಗುತ್ತದೆ. ನಂತರ ಸುಳಿ ಕೊಳೆತು ಬಾಗಿ ಜೋತುಬೀಳುತ್ತದೆ. ಕೊಳೆತ ದುರ್ವಾಸನೆ ಬರುತ್ತದೆ. ಸುಳಿಯನ್ನು ಎಳೆದರೆ ಕೈಗೆ ಸುಲಭವಾಗಿ ಬರುತ್ತದೆ. ನಂತರ ಒಳಭಾಗದ ಎಲೆಗಳು ಉದುರಿ ತೆಂಗಿನ ಮರ ಸಾಯುತ್ತದೆ.',
    symptomsTa: 'நடுக்குருத்து இலை மஞ்சளாகி வாடும். குருத்து அழுகி நாற்றமடிக்கும். குருத்தை இழுத்தால் துர்நாற்றத்துடன் கழன்று வரும். படிப்படியாக மற்ற இலைகள் உதிர்ந்து மரம் அழியும்.',
    symptomsTe: 'నడిమొవ్వు పసుపు-గోధుమ రంగులోకి మారి ఎండిపోతుంది. మొవ్వు కుళ్ళిపోయి దుర్వాసన వస్తుంది. సుడిని లాగితే సులభంగా చేతికి వచ్చేస్తుంది. క్రమంగా మిగిలిన ఆకులు రాలి చెట్టు చనిపోతుంది.',
    cause: 'Oomycete pathogen Phytophthora palmivora splashed onto crowns during continuous monsoon rain.',
    favourableConditions: 'Continuous torrential monsoon rains, high atmospheric humidity (>90%), cool temperatures (20-25°C), and poorly drained plantations.',
    favourableHumidity: '>90%',
    favourableTemp: '20-25°C',
    favourableSeasons: ['Kharif'],
    affectedStages: ['Vegetative Growth', 'Maturity'],
    spreadPattern: 'Rain splashes and wind carry sporangia onto the crown whorls; insects and bats facilitate secondary transfer.',
    culturalControl: 'In early stages, cut and clean out all rotten spindle tissues with a sharp curved knife down to healthy pinkish-white tissue, and apply protective paste. Cut down and burn crowns of completely dead palms to stop epidemic spread.',
    culturalControlKn: 'ರೋಗದ ಆರಂಭದಲ್ಲಿ ಕೊಳೆತ ಸುಳಿ ಭಾಗವನ್ನು ಚಾಕುವಿನಿಂದ ಸ್ವಚ್ಛಗೊಳಿಸಿ ತುದಿಗೆ ಔಷಧೀಯ ಪೇಸ್ಟ್ ಹಚ್ಚಿ. ಸತ್ತ ಮರಗಳನ್ನು ಬುಡಸಮೇತ ಕಡಿದು ಸುಟ್ಟುಹಾಕಿ.',
    culturalControlTa: 'ஆரம்ப நிலையில் அழுகிய பகுதியை செதுக்கி எடுத்து மருந்து பூசவும். முற்றிலும் இறந்த மரங்களை வெட்டி எரிக்கவும்.',
    culturalControlTe: 'ప్రారంభ దశలో కుళ్ళిన భాగాన్ని శుభ్రంగా కత్తిరించి మందు పూయండి. చనిపోయిన చెట్లను నరికి కాల్చేయండి.',
    biologicalControl: 'Place Trichoderma-enriched coir pith cakes in leaf axils around the crown before monsoon rains.',
    biologicalControlKn: 'ಮಳೆಗಾಲ ಆರಂಭವಾಗುವ ಮುನ್ನ ತೆಂಗಿನ ಸುಳಿಯ ಸಂದುಗಳಲ್ಲಿ ಟ್ರೈಕೋಡರ್ಮಾ ಮಿಶ್ರಿತ ತೆಂಗಿನ ನಾರಿನ ಹುಡಿಯನ್ನು ಇಡಿ.',
    biologicalControlTa: 'மழைக்கு முன் டிரைக்கோடெர்மா பொட்டலங்களை குருத்து இடுக்கில் வைக்கவும்.',
    biologicalControlTe: 'వర్షాకాలానికి ముందు ట్రైకోడెర్మా పొట్లాలు మొవ్వు సందుల్లో పెట్టండి.',
    organicControl: 'Apply 1% Bordeaux paste directly to the scooped healthy bud core, and cap with an earthen tile or poly-sheet against rainwater entry.',
    organicControlKn: 'ಸ್ವಚ್ಛಗೊಳಿಸಿದ ಸುಳಿಗೆ 1% ಬೋರ್ಡೋ ಪೇಸ್ಟ್ ಹಚ್ಚಿ ಮಳೆನೀರು ಬೀಳದಂತೆ ಹೆಂಚು ಮುಚ್ಚಿ.',
    organicControlTa: 'சுத்தம் செய்த குருத்தில் போர்டோ பசையை பூசி ஓடு கொண்டு மூடவும்.',
    organicControlTe: 'శుభ్రం చేసిన మొవ్వుపై బోర్డో పేస్ట్ పూసి వర్షం పడకుండా మూత పెట్టండి.',
    chemicalControl: 'Crown placement of fungicidal sachets (Mancozeb or Metalaxyl + Mancozeb, 5g tied in perforated poly-bag) in leaf axils before monsoon. Crown spraying of Copper Oxychloride or Fosetyl-Al for neighboring healthy palms. Note: Consult local CPCRI / Horticulture officer.',
    chemicalControlKn: 'ಮಳೆಗಾಲಕ್ಕೆ ಮುನ್ನ ಸುಳಿಯ ಸಂದುಗಳಲ್ಲಿ ಮೆಟಲಾಕ್ಸಿಲ್ + ಮ್ಯಾಂಕೋಜೆಬ್ ಪೊಟ್ಟಣ ಇಡಿ ಅಥವಾ ಕಾಪರ್ ಆಕ್ಸಿಕ್ಲೋರೈಡ್ ಸಿಂಪಡಿಸಿ. ಲೇಬಲ್ ಸೂಚನೆ ಪಾಲಿಸಿ.',
    chemicalControlTa: 'மழைக்காலத்திற்கு முன் மெட்டலாக்சில் மாங்கோசெப் பாக்கெட்டுகளை குருத்தில் வைக்கவும்.',
    chemicalControlTe: 'వర్షాకాలం ముందు మెటలాక్సిల్ + మ్యాంకోజెబ్ పొట్లాలు మొవ్వులో పెట్టండి.',
    preventionSteps: ['Pre-monsoon prophylactic crown spray with Bordeaux mixture.', 'Tie perforated fungicide sachets in leaf axils in June.'],
    preventionStepsKn: ['ಮಳೆಗಾಲದ ಮುನ್ನ 1% ಬೋರ್ಡೋ ದ್ರಾವಣ ಸಿಂಪಡಿಸಿ.', 'ಜೂನ್ ತಿಂಗಳಲ್ಲಿ ಸುಳಿಯ ಸಂದುಗಳಲ್ಲಿ ಔಷಧೀಯ ಪೊಟ್ಟಣ ಇಡಿ.'],
    preventionStepsTa: ['பருவமழைக்கு முன் போர்டோ கலவை தெளிக்கவும்.', 'குருத்து பாக்கெட்டுகளை வைக்கவும்.'],
    preventionStepsTe: ['వర్షాకాలం ముందు బోర్డో మిశ్రమం పిచికారీ చేయండి.'],
    ipmSteps: [
      'Step 1: Pre-monsoon prophylactic spray of 1% Bordeaux mixture to all palms.',
      'Step 2: Placing of fungicidal sachets in top leaf axils.',
      'Step 3: Surgical scoop of rotten bud tissue in early infected palms + Bordeaux paste + protective hood.',
      'Step 4: Immediate cutting and burning of dead spindle palms.'
    ],
    ipmStepsKn: ['ಹಂತ 1: ಮುಂಜಾಗ್ರತಾ ಬೋರ್ಡೋ ಸಿಂಪರಣೆ', 'ಹಂತ 2: ಸುಳಿ ಸಂದುಗಳಲ್ಲಿ ಪೊಟ್ಟಣ ಇಡುವುದು', 'ಹಂತ 3: ಕೊಳೆತ ಭಾಗ ಕೆತ್ತಿ ಬೋರ್ಡೋ ಪೇಸ್ಟ್ ಹಚ್ಚುವುದು', 'ಹಂತ 4: ಸತ್ತ ಮರ ಕಡಿದು ಸುಡುವುದು'],
    ipmStepsTa: ['படி 1: போர்டோ கலவை தெளிப்பு', 'படி 2: குருத்து பாக்கெட் வைத்தல்', 'படி 3: குருத்து அறுவை சிகிச்சை', 'படி 4: காய்ந்த மரம் அழிப்பு'],
    ipmStepsTe: ['దశ 1: ముందస్తు బోర్డో స్ప్రే', 'దశ 2: మొవ్వులో పొట్లాలు', 'దశ 3: మొవ్వు శుభ్రం చేసి పేస్ట్ పూయడం', 'దశ 4: ఎండిన చెట్ల నాశనం'],
    safetyNotes: 'Use safety harnesses and tree-climbing machines when ascending tall coconut palms for crown surgery.',
    lookAlikes: [
      { name: 'Rhinoceros Beetle Damage', difference: 'Rhinoceros beetle chews geometric V-shaped cuts across fronds without crown bud rotting or foul smell.' },
      { name: 'Lightning Strike', difference: 'Lightning scorches several palms simultaneously with cracking of trunks and burnt fronds hanging downward.' }
    ],
    whenToCallExpert: 'Call local CPCRI or horticulture extension officer immediately; bud rot is lethal to the palm once the growing tip dies.',
    whenToCallExpertKn: 'ತೆಂಗಿನ ಸುಳಿ ಒಣಗಿ ಕೊಳೆಯಲು ಪ್ರಾರಂಭಿಸಿದ ತಕ್ಷಣ ತೋಟಗಾರಿಕಾ ಅಧಿಕಾರಿಯನ್ನು ಸಂಪರ್ಕಿಸಿ.',
    whenToCallExpertTa: 'குருத்து அழுகல் அறிகுறி தெரிந்தவுடன் தோட்டக்கலை அலுவலரை தொடர்பு கொள்ளவும்.',
    whenToCallExpertTe: 'మొవ్వు కుళ్ళు లక్షణాలు కనిపించిన వెంటనే ఉద్యాన అధికారిని సంప్రదించండి.',
    confidence: 'verified',
    sources: 'ICAR-CPCRI Kasaragod, TNAU Coconut Agritech Portal.',
    crops: [
      { cropName: 'Coconut', cropSlug: 'coconut', importance: 'primary' }
    ],
    symptomTags: [
      { tagSlug: 'part-stem', weight: 3.0, isPrimary: true },
      { tagSlug: 'pattern-rot', weight: 3.0, isPrimary: true },
      { tagSlug: 'pattern-dead-heart', weight: 3.0, isPrimary: true },
      { tagSlug: 'colour-brown', weight: 2.0, isPrimary: false },
      { tagSlug: 'pattern-wilting', weight: 2.0, isPrimary: false }
    ],
    images: [
      {
        path: '/problems/bud-rot-coconut/wilted-rotting-central-spindle-coconut.webp',
        caption: 'Rotten central spear leaf wilting and collapsing out of the crown of a coconut palm caused by Phytophthora palmivora.',
        captionKn: 'ತೆಂಗಿನ ಮರದ ಸುಳಿ ಕೊಳೆತು ಜೋತುಬಿದ್ದಿರುವ ಸುಳಿ ಕೊಳೆ ರೋಗ.',
        kind: 'symptom_closeup',
        source: 'Wikimedia Commons',
        author: 'ICAR-CPCRI Kasaragod',
        licence: 'CC BY-SA 4.0',
        attribution: 'ICAR-CPCRI Kasaragod / Wikimedia Commons',
        isPrimary: true
      }
    ]
  },

  // ==========================================
  // POMEGRANATE (ADDITIONAL)
  // ==========================================
  {
    slug: 'fruit-borer-pomegranate',
    name: 'Pomegranate Fruit Borer (Anar Butterfly)',
    nameKn: 'ದಾಳಿಂಬೆಯ ಕಾಯಿ ಕೊರೆಯುವ ಹುಳು / ಚಿಟ್ಟೆ (Anar Butterfly)',
    nameTa: 'மாதுளை காய் துளைப்பான் / அனார் பட்டாம்பூச்சி',
    nameTe: 'దానిమ్మ కాయ తొలుచు పురుగు (అనార్ బటర్‌ఫ్లై)',
    scientificName: 'Deudorix isocrates (Virachola isocrates)',
    type: 'insect_pest',
    severity: 'critical',
    symptoms: 'Female butterflies lay single shiny white eggs on flowers and tender fruit stalks; caterpillars bore inside developing fruits, feeding on seeds and internal pulp; entry holes are plugged with offensive foul-smelling dark excreta (frass); secondary fungal/bacterial rot sets in, causing fruit rotting and premature fruit dropping.',
    symptomsKn: 'ಚಿಟ್ಟೆಗಳು ಹೂವು ಮತ್ತು ಕಾಯಿಗಳ ಮೇಲೆ ಮೊಟ್ಟೆ ಇಡುತ್ತವೆ. ಹುಳುಗಳು ಕಾಯಿಯೊಳಗೆ ಕೊರೆದು ಬೀಜಗಳನ್ನು ತಿನ್ನುತ್ತವೆ. ಕೊರೆದ ರಂಧ್ರದಿಂದ ಕೊಳೆತ ದುರ್ವಾಸನೆಯ ಕಪ್ಪು ಹಿಕ್ಕೆಗಳು ಹೊರಬರುತ್ತವೆ. ನಂತರ ಕಾಯಿಗಳು ಕೊಳೆತು ಉದುರುತ್ತವೆ.',
    symptomsTa: 'பட்டாம்பூச்சிகள் பூ மற்றும் பிஞ்சுகளில் முட்டையிடும். புழுக்கள் காய்க்குள் துளைத்து விதைகளை தின்னும். துளையிலிருந்து துர்நாற்றத்துடன் எச்சம் வெளியேறும். காய்கள் அழுகி உதிரும்.',
    symptomsTe: 'సీతాకోకచిలుకలు పూత, పిందెలపై గుడ్లు పెడతాయి. లార్వాలు కాయల్లోకి తొలిచి గింజలను తింటాయి. రంధ్రం నుండి కుళ్ళిన వాసనతో నల్లటి విసర్జన బయటకు వస్తుంది. కాయలు కుళ్ళి రాలిపోతాయి.',
    cause: 'Larvae of the lycaenid butterfly Deudorix isocrates boring into pomegranate rinds.',
    favourableConditions: 'Continuous flowering throughout the year (mrig, hastha, ambe bahar), warm humid weather, and unbagged fruits.',
    favourableHumidity: '60-80%',
    favourableTemp: '24-32°C',
    favourableSeasons: ['Kharif', 'Rabi', 'Zaid'],
    affectedStages: ['Flowering', 'Fruiting'],
    spreadPattern: 'Adult butterflies fly actively in the daytime, laying eggs singly on flowers and fruit calyxes.',
    culturalControl: 'Bag developing fruits individually with butter paper bags or poly-nonwoven fabric bags at 30-40 days after fruit set. Remove and destroy all bored, dropped, and rotten fruits. Clip off dry persistent calyx lobes of young fruits.',
    culturalControlKn: 'ಕಾಯಿ ಕಟ್ಟಿದ 30-40 ದಿನಗಳಲ್ಲಿ ಬಟರ್ ಪೇಪರ್ ಅಥವಾ ಕವರ್ ಚೀಲಗಳಿಂದ ಕಾಯಿಗಳಿಗೆ ಹೊದಿಕೆ (ಬ್ಯಾಗಿಂಗ್) ಹಾಕಿ. ಕೊರೆದ ಕಾಯಿಗಳನ್ನು ನಾಶಪಡಿಸಿ.',
    culturalControlTa: 'பிஞ்சு பிடித்த 30-40 நாளில் காகித அல்லது துணி பைகளால் காய்களை மூடவும் (Bagging). பாதிக்கப்பட்ட காய்களை அழிக்கவும்.',
    culturalControlTe: 'పిందె దశలో 30-40 రోజులప్పుడు కాయలకు బటర్ పేపర్ సంచులను తొడగండి (బ్యాగింగ్). రాలిన కాయలను ఏరి నాశనం చేయండి.',
    biologicalControl: 'Release egg parasitoid Trichogramma chilonis at 40,000 parasitoids/acre at weekly intervals during flowering.',
    biologicalControlKn: 'ಹೂ ಬಿಡುವ ಸಮಯದಲ್ಲಿ ಟ್ರೈಕೋಗ್ರಾಮಾ ಪರಾವಲಂಬಿಗಳನ್ನು ಬಿಡಿ.',
    biologicalControlTa: 'டிரைக்கோகிரம்மா சிலோனிஸ் ஒட்டுண்ணிகளை வயலில் விடவும்.',
    biologicalControlTe: 'ట్రైకోగ్రామా కార్డులను పొలంలో అమర్చండి.',
    organicControl: 'Foliar spray of 5% Neem Seed Kernel Extract (NSKE) or Neem oil (1500 ppm) when butterflies are observed fluttering around trees.',
    organicControlKn: 'ಚಿಟ್ಟೆಗಳು ಹಾರಾಡುವಾಗ ಬೇವಿನ ಕಷಾಯ (NSKE 5%) ಸಿಂಪಡಿಸಿ.',
    organicControlTa: '5% வேப்பங்கொட்டை கரைசல் தெளிக்கவும்.',
    organicControlTe: '5% వేప గింజల కషాయం పిచికారీ చేయండి.',
    chemicalControl: 'Foliar spray of Chlorantraniliprole or Spinosad or Emamectin Benzoate targeted at flower buds and marble-sized fruits. Note: Once caterpillar enters inside rind, sprays are ineffective; spray during egg laying / early hatching stage. Follow label instructions.',
    chemicalControlKn: 'ಮೊಟ್ಟೆ ಒಡೆದು ಮರಿ ಹೊರಬರುವ ಹಂತದಲ್ಲಿ ಕ್ಲೋರಾಂಟ್ರಾನಿಲಿಪ್ರೋಲ್ ಅಥವಾ ಸ್ಪಿನೋಸ್ಯಾಡ್ ಸಿಂಪಡಿಸಿ. ಹುಳು ಕಾಯಿಯೊಳಗೆ ಹೋದಮೇಲೆ ಕೀಟನಾಶಕ ಕೆಲಸ ಮಾಡುವುದಿಲ್ಲ. ಲೇಬಲ್ ಸೂಚನೆ ಪಾಲಿಸಿ.',
    chemicalControlTa: 'முட்டையிடும் தருணத்தில் குளோரான்ட்ரனிலிப்ரோல் அல்லது ஸ்பினோசாட் தெளிக்கவும். உள்ளே சென்ற பின் மருந்து வேலை செய்யாது.',
    chemicalControlTe: 'గుడ్లు పొదిగే దశలో క్లోరాంట్రానిలిప్రోల్ లేదా స్పినోసాడ్ పిచికారీ చేయండి. కాయ లోపలికి వెళ్ళాక మందులు పనిచేయవు.',
    preventionSteps: ['Fruit bagging is the most effective and eco-friendly control.', 'Regularly collect and bury bored fruits.'],
    preventionStepsKn: ['ಕಾಯಿಗಳಿಗೆ ಬ್ಯಾಗಿಂಗ್ ಮಾಡುವುದು ಅತ್ಯಂತ ಪರಿಣಾಮಕಾರಿ ವಿಧಾನ.', 'ಕೊರೆದ ಕಾಯಿಗಳನ್ನು ತೋಟದಲ್ಲಿ ಬಿಡದೆ ಹೂತುಹಾಕಿ.'],
    preventionStepsTa: ['காய்களை பைகளால் மூடுவது சிறந்த முறை.', 'பாதிக்கப்பட்ட காய்களை உடனே அழிக்கவும்.'],
    preventionStepsTe: ['కాయలకు సంచులు కట్టడం అత్యుత్తమ పద్ధతి.', 'పురుగు పట్టిన కాయలను భూమిలో పూడ్చండి.'],
    ipmSteps: [
      'Step 1: Fruit bagging at marble size stage.',
      'Step 2: Removal of calyx cup dried flower parts.',
      'Step 3: Egg parasitoid Trichogramma release during flowering flushes.',
      'Step 4: Botanical neem spray at adult butterfly flight peak.',
      'Step 5: Selective insecticide spray at early egg hatch before caterpillar bore-in.'
    ],
    ipmStepsKn: ['ಹಂತ 1: ಮಿಡಿಗಾಯಿ ಹಂತದಲ್ಲಿ ಬ್ಯಾಗಿಂಗ್', 'ಹಂತ 2: ಹೂವಿನ ಒಣಗಿದ ತುದಿ ಕತ್ತರಿಸುವುದು', 'ಹಂತ 3: ಟ್ರೈಕೋಗ್ರಾಮಾ ಪರಾವಲಂಬಿ', 'ಹಂತ 4: ಬೇವಿನ ಸಿಂಪರಣೆ', 'ಹಂತ 5: ಸಕಾಲಿಕ ಕೀಟನಾಶಕ'],
    ipmStepsTa: ['படி 1: காய் மூடுதல் (Bagging)', 'படி 2: பூவிதழ் அகற்றுதல்', 'படி 3: ஒட்டுண்ணி வெளியீடு', 'படி 4: வேப்ப எண்ணெய் தெளிப்பு', 'படி 5: முட்டை பொரிக்கும் போது தெளிப்பு'],
    ipmStepsTe: ['దశ 1: కాయలకు బ్యాగింగ్', 'దశ 2: పూత భాగాల తొలగింపు', 'దశ 3: మిత్రపురుగులు', 'దశ 4: వేప నూనె', 'దశ 5: సకాలంలో పురుగుమందు'],
    safetyNotes: 'Wear mask and protective clothing when spraying dense pomegranate canopies. Strictly follow pre-harvest intervals.',
    lookAlikes: [
      { name: 'Pomegranate Bacterial Blight (Telya)', difference: 'Telya causes triangular dark brown water-soaked spots with oily greasy exudate and split cracks on rinds, without caterpillar entry boreholes or frass plugs.' },
      { name: 'Fruit Cracking / Splitting', difference: 'Fruit splitting is physiological cracking due to irregular irrigation and moisture fluctuation, without internal larval feeding.' }
    ],
    whenToCallExpert: 'Call horticulture extension officer or KVK if butterflies flutter around flowering trees and boreholes appear on young fruits.',
    whenToCallExpertKn: 'ದಾಳಿಂಬೆ ಹೂಬಿಡುವಾಗ ಚಿಟ್ಟೆಗಳು ಹಾರಾಡುತ್ತಿದ್ದರೆ ಮತ್ತು ಕಾಯಿಗಳಿಗೆ ರಂಧ್ರ ಕಂಡರೆ ತಕ್ಷಣ ತೋಟಗಾರಿಕಾ ತಜ್ಞರನ್ನು ಸಂಪರ್ಕಿಸಿ.',
    whenToCallExpertTa: 'மரத்தை சுற்றி பட்டாம்பூச்சிகள் பறந்தால் உடனடியாக தோட்டக்கலை அலுவலரை அணுகவும்.',
    whenToCallExpertTe: 'చెట్ల చుట్టూ సీతాకోకచిలుకలు తిరుగుతూ కాయలపై రంధ్రాలు కనిపిస్తే వెంటనే ఉద్యాన అధికారిని సంప్రదించండి.',
    confidence: 'verified',
    sources: 'ICAR-NRCP Solapur (National Research Centre on Pomegranate), UAS Bagalkot.',
    crops: [
      { cropName: 'Pomegranate', cropSlug: 'pomegranate', importance: 'primary' }
    ],
    symptomTags: [
      { tagSlug: 'part-fruit-grain', weight: 3.0, isPrimary: true },
      { tagSlug: 'pattern-holes', weight: 3.0, isPrimary: true },
      { tagSlug: 'pattern-rot', weight: 2.5, isPrimary: true },
      { tagSlug: 'pattern-insects-visible', weight: 2.0, isPrimary: false },
      { tagSlug: 'colour-black', weight: 1.5, isPrimary: false }
    ],
    images: [
      {
        path: '/problems/fruit-borer-pomegranate/bore-hole-with-frass-pomegranate.webp',
        caption: 'Bore hole plugged with dark offensive excreta and secondary fruit rot on pomegranate caused by Deudorix isocrates.',
        captionKn: 'ದಾಳಿಂಬೆ ಕಾಯಿಗೆ ರಂಧ್ರ ಕೊರೆದು ಕಪ್ಪು ಹಿಕ್ಕೆಗಳಿಂದ ಮುಚ್ಚಿರುವ ಹಾನಿ.',
        kind: 'symptom_closeup',
        source: 'Wikimedia Commons',
        author: 'ICAR-NRCP Solapur',
        licence: 'CC BY-SA 4.0',
        attribution: 'ICAR-NRCP Solapur / Wikimedia Commons',
        isPrimary: true
      }
    ]
  }
];
