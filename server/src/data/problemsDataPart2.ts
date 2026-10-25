import { SeedProblem } from './seedProblems';

export const PROBLEMS_DATA_PART2: SeedProblem[] = [
  // ==========================================
  // RED GRAM / TUR (PIGEONPEA)
  // ==========================================
  {
    slug: 'sterility-mosaic-pigeonpea',
    name: 'Sterility Mosaic Disease of Pigeonpea (SMD)',
    nameKn: 'ತೊಗರಿ ಬಂಜೆ ನಂಜು ರೋಗ (Sterility Mosaic)',
    nameTa: 'துவரை மலட்டு தேமல் நோய்',
    nameTe: 'కంది వెర్రి తెగులు / వంధ్యత్వ మొజాయిక్',
    scientificName: 'Pigeonpea sterility mosaic virus (PPSMV)',
    type: 'viral',
    severity: 'critical',
    symptoms: 'Bushy stunted appearance with excessive vegetative tillering and clustering of pale green leaves; severe mosaic mottling and leaf size reduction; infected plants remain completely sterile without producing flowers or pods ("Green Islands" in dry fields).',
    symptomsKn: 'ಗಿಡಗಳು ವಿಪರೀತವಾಗಿ ಕವಲೊಡೆದು ಪೊದೆಯಂತಾಗುತ್ತವೆ. ಎಲೆಗಳು ಸಣ್ಣದಾಗಿ ತಿಳಿ ಹಸಿರು ಬಣ್ಣದ ಮಚ್ಚೆಗಳನ್ನು ಹೊಂದಿರುತ್ತವೆ. ಹೂವು ಅಥವಾ ಕಾಯಿ ಕಟ್ಟದೆ ಇಡೀ ಗಿಡ ಸಂಪೂರ್ಣವಾಗಿ ಬಂಜೆಯಾಗುತ್ತದೆ.',
    symptomsTa: 'செடிகள் பூக்கள் அல்லது காய்கள் வைக்காமல் புதர் போல அடர்ந்து வளரும். இலைகள் சிறியதாகி வெளிர் பச்சை தேமல் புள்ளிகளுடன் காணப்படும். முழுமையான மலட்டுத்தன்மை ஏற்படும்.',
    symptomsTe: 'మొక్కలు పూత, కాయలు లేకుండా గుబురుగా పొదలా పెరుగుతాయి. ఆకులు చిన్నవిగా మారి పాలిపోయిన మచ్చలు వస్తాయి. పూర్తిగా గింజలు కాయకుండా వంధ్యత్వంగా మిగిలిపోతాయి.',
    cause: 'Emaravirus transmitted by the eriophyid mite vector Aceria cajani.',
    favourableConditions: 'Hot dry weather (28-35°C), low relative humidity, shade, and presence of perennial pigeonpea weed bushes.',
    favourableHumidity: '45-65%',
    favourableTemp: '28-35°C',
    favourableSeasons: ['Kharif'],
    affectedStages: ['Seedling', 'Vegetative Growth', 'Flowering'],
    spreadPattern: 'Wind currents carry microscopic eriophyid mites across fields from volunteer perennial hosts.',
    culturalControl: 'Sow SMD-resistant varieties like BSMR-736, GRG-811, or BRG-series from UAS Bangalore. Uproot and burn early infected plants within first 45 days. Avoid perennial pigeonpea planting.',
    culturalControlKn: 'ಬಿಎಸ್‌ಎಂಆರ್-736 ಅಥವಾ ಜಿಆರ್‌ಜಿ-811 ರಂತಹ ನಿರೋಧಕ ತಳಿಗಳನ್ನು ಬೆಳೆಯಿರಿ. ರೋಗ ಕಂಡ ತಕ್ಷಣ 45 ದಿನಗಳ ಒಳಗಿನ ಸಸಿಗಳನ್ನು ಕಿತ್ತು ಸುಟ್ಟುಹಾಕಿ.',
    culturalControlTa: 'எதிர்ப்பு ரகங்களை பயிரிடவும். பாதித்த செடிகளை 45 நாட்களுக்குள் பிடுங்கி எரிக்கவும்.',
    culturalControlTe: 'BSMR-736 వంటి నిరోధక రకాలను ఎంచుకోండి. తెగులు సోకిన మొక్కలను 45 రోజుల్లోపే పీకి కాల్చండి.',
    biologicalControl: 'Conserve predatory phytoseiid mites. Spray bio-agent Hirsutella thompsonii to control eriophyid mites.',
    biologicalControlKn: 'ನುಸಿ ನಿಯಂತ್ರಣಕ್ಕೆ ಹಿರ್ಸುಟೆಲ್ಲಾ ಜೈವಿಕ ಶಿಲೀಂಧ್ರ ಸಿಂಪಡಿಸಿ.',
    biologicalControlTa: 'ஹிர்சுடெல்லா பூஞ்சாணத்தை தெளிக்கவும்.',
    biologicalControlTe: 'హిర్సుటెల్లా ద్రావణాన్ని పిచికారీ చేయండి.',
    organicControl: 'Foliar spray of Wettable Sulfur (certified organic) or 5% Neem Seed Kernel Extract (NSKE) at 30 and 45 days after sowing.',
    organicControlKn: 'ಕರಗುವ ಗಂಧಕ ಅಥವಾ ಬೇವಿನ ಕಷಾಯ (NSKE 5%) ಸಿಂಪಡಿಸಿ.',
    organicControlTa: 'நனையும் கந்தகம் அல்லது வேப்பங்கொட்டை கரைசல் தெளிக்கவும்.',
    organicControlTe: 'గంధకం లేదా వేప గింజల కషాయం పిచికారీ చేయండి.',
    chemicalControl: 'Foliar spray of Fenazaquin or Propargite or Spiromesifen at 30 and 45 days after sowing to suppress the eriophyid mite vector. Note: Follow container label strictly regarding rate and water volume; consult local KVK.',
    chemicalControlKn: 'ನುಸಿಗಳ ನಿಯಂತ್ರಣಕ್ಕೆ ಕೃಷಿ ತಜ್ಞರ ಸಲಹೆಯಂತೆ ಪ್ರೊಪಾರ್ಗೈಟ್ ಅಥವಾ ಸ್ಪೈರೋಮೆಸಿಫೆನ್ ಸಿಂಪಡಿಸಿ. ಲೇಬಲ್ ಸೂಚನೆ ಪಾಲಿಸಿ.',
    chemicalControlTa: 'சிலந்திகளை கட்டுப்படுத்த புரோபார்கைட் அல்லது ஸ்பைரோமெசிபேன் தெளிக்கவும்.',
    chemicalControlTe: 'నల్లి నివారణకు ప్రొపారైట్ లేదా స్పైరోమెసిఫెన్ పిచికారీ చేయండి.',
    preventionSteps: ['Always grow SMD-resistant cultivars.', 'Rogue out infected seedlings in first month.', 'Keep field bunds free from perennial wild pigeonpea.'],
    preventionStepsKn: ['ಪ್ರಮಾಣಿತ ನಿರೋಧಕ ತಳಿಗಳನ್ನು ಮಾತ್ರ ಬೆಳೆಯಿರಿ.', 'ಬದುಗಳಲ್ಲಿನ ಕಾಡು ತೊಗರಿ ಗಿಡಗಳನ್ನು ನಾಶಮಾಡಿ.'],
    preventionStepsTa: ['எதிர்ப்பு ரகங்களை மட்டுமே பயிரிடவும்.', 'வரப்பு களைகளை அகற்றவும்.'],
    preventionStepsTe: ['నిరోధక రకాలను మాత్రమే వాడండి.', 'గట్లపై ఉన్న కలుపును తొలగించండి.'],
    ipmSteps: [
      'Step 1: Resistant cultivar selection (BSMR-736 / GRG-811).',
      'Step 2: Border sanitation of perennial pigeonpea.',
      'Step 3: Visual inspection and roguing at 30 DAS.',
      'Step 4: Mite vector spray at early vegetative stage.'
    ],
    ipmStepsKn: ['ಹಂತ 1: ನಿರೋಧಕ ತಳಿ', 'ಹಂತ 2: ಬದುಗಳ ಸ್ವಚ್ಛತೆ', 'ಹಂತ 3: ರೋಗಪೀಡಿತ ಗಿಡ ಕಿತ್ತು ಹಾಕುವುದು', 'ಹಂತ 4: ನುಸಿ ನಿಯಂತ್ರಣ ಸಿಂಪರಣೆ'],
    ipmStepsTa: ['படி 1: எதிர்ப்பு ரகம்', 'படி 2: வரப்பு சுத்தம்', 'படி 3: பாதித்த செடி அகற்றுதல்', 'படி 4: சிலந்தி மருந்து தெளிப்பு'],
    ipmStepsTe: ['దశ 1: నిరోధక రకాలు', 'దశ 2: గట్ల శుభ్రత', 'దశ 3: తెగులు మొక్కల తొలగింపు', 'దశ 4: నల్లి మందు పిచికారీ'],
    safetyNotes: 'Wear eye protection during sulfur or acaricide spraying. Avoid spraying during high temperature midday sun.',
    lookAlikes: [
      { name: 'Pigeonpea Phytophthora Blight', difference: 'Phytophthora blight produces brown-black stem lesions and rapid foliar wilting after heavy rain, without bushy green sterility.' },
      { name: 'Witches Broom (Phytoplasma)', difference: 'Witches broom causes phyllody (floral parts turn into leafy structures), while SMD leaves plants completely flowerless.' }
    ],
    whenToCallExpert: 'Call KVK/RSK if mosaic mottling and bushy non-flowering symptoms emerge in more than 10% of the crop canopy before flowering.',
    whenToCallExpertKn: 'ಹೂ ಬಿಡುವ ಮುನ್ನ 10% ಕ್ಕಿಂತ ಹೆಚ್ಚು ಗಿಡಗಳಲ್ಲಿ ಬಂಜೆ ರೋಗ ಕಂಡರೆ ತಕ್ಷಣ ಕೃಷಿ ಅಧಿಕಾರಿಗಳನ್ನು ಸಂಪರ್ಕಿಸಿ.',
    whenToCallExpertTa: 'பூக்கும் முன் 10% மேற்பட்ட செடிகளில் மலட்டுத்தன்மை தோன்றினால் உடனடியாக வேளாண் அலுவலரை அணுகவும்.',
    whenToCallExpertTe: 'పూతకు ముందే 10% పైగా మొక్కల్లో వెర్రి తెగులు కనిపిస్తే వెంటనే వ్యవసాయాధికారిని సంప్రదించండి.',
    confidence: 'verified',
    sources: 'ICRISAT Pigeonpea Pathology, UAS Bangalore & Dharwad.',
    crops: [
      { cropName: 'Red Gram / Tur (Pigeonpea)', cropSlug: 'red-gram', importance: 'primary' }
    ],
    symptomTags: [
      { tagSlug: 'part-whole-plant', weight: 3.0, isPrimary: true },
      { tagSlug: 'pattern-stunting', weight: 2.5, isPrimary: true },
      { tagSlug: 'pattern-streaks', weight: 2.0, isPrimary: false },
      { tagSlug: 'colour-yellow', weight: 1.5, isPrimary: false },
      { tagSlug: 'spread-patches', weight: 1.5, isPrimary: false }
    ],
    images: [
      {
        path: '/problems/sterility-mosaic-pigeonpea/bushy-sterile-canopy.webp',
        caption: 'Bushy stunted non-flowering pigeonpea plant showing sterility mosaic symptoms and reduced leaf size.',
        captionKn: 'ತೊಗರಿ ಗಿಡದಲ್ಲಿ ಹೂ ಕಾಯಿ ಇಲ್ಲದೆ ಪೊದೆಯಂತಾದ ಬಂಜೆ ನಂಜು ರೋಗದ ಲಕ್ಷಣ.',
        kind: 'field_view',
        source: 'Wikimedia Commons',
        author: 'ICRISAT Research Repository',
        licence: 'CC BY-SA 4.0',
        attribution: 'ICRISAT / Wikimedia Commons',
        isPrimary: true
      }
    ]
  },
  {
    slug: 'fusarium-wilt-pigeonpea',
    name: 'Fusarium Wilt of Pigeonpea',
    nameKn: 'ತೊಗರಿ ಸೊರಗು ರೋಗ (Fusarium Wilt)',
    nameTa: 'துவரை வாடல் நோய்',
    nameTe: 'కంది ఎండు తెగులు',
    scientificName: 'Fusarium udum',
    type: 'fungal',
    severity: 'critical',
    symptoms: 'Gradual withering and yellowing of foliage starting from bottom branches; leaves turn yellow, droop, and dry up while clinging to the plant; vertical purple or dark brown bands running up the main stem; vertical split of stem reveals continuous black vascular band.',
    symptomsKn: 'ಕೆಳಗಿನ ಕೊಂಬೆಗಳಿಂದ ಪ್ರಾರಂಭವಾಗಿ ಎಲೆಗಳು ಹಳದಿಯಾಗಿ ಬಾಡಿ ಒಣಗುತ್ತವೆ. ಕಾಂಡದ ಮೇಲೆ ಉದ್ದವಾದ ನೇರಳೆ-ಕಂದು ಪಟ್ಟೆಗಳು ಕಾಣಿಸುತ್ತವೆ. ಕಾಂಡವನ್ನು ಸೀಳಿದರೆ ಒಳಗೆ ಕಪ್ಪು ಬಣ್ಣದ ರಕ್ತನಾಳಗಳ ಕಲೆಗಳಿರುತ್ತವೆ.',
    symptomsTa: 'கீழ் கிளைகளிலிருந்து இலைகள் மஞ்சளாகி வாடி உதிராமல் தொங்கும். தண்டின் மேல் ஊதா-பழுப்பு நிற பட்டைகள் காணப்படும். தண்டை பிளந்தால் உள்பகுதி கருப்பாகியிருக்கும்.',
    symptomsTe: 'కింది కొమ్మల నుండి ఆకులు పసుపు రంగులోకి మారి వాలిపోతాయి. కాండంపై నిలువుగా ఊదా-గోధుమ చారలు ఏర్పడతాయి. కాండాన్ని చీల్చితే లోపలి నాళాలు నల్లగా మారుతాయి.',
    cause: 'Soil-borne vascular fungus Fusarium udum surviving in soil for over 5 years.',
    favourableConditions: 'Moderate to warm soil temperatures (22-28°C), sandy loam to black clayey soils, continuous cropping of pigeonpea without rotation.',
    favourableHumidity: '55-75%',
    favourableTemp: '22-28°C',
    favourableSeasons: ['Kharif'],
    affectedStages: ['Flowering', 'Fruiting', 'Maturity'],
    spreadPattern: 'Moves through soil water, farm implements, and chlamydospores in root residues.',
    culturalControl: 'Sow wilt-resistant varieties like BSMR-736, ICP-8863 (Maruti), or GRG-152. Crop rotation with sorghum, maize, or tobacco for 3 years. Mixed cropping with sorghum suppresses wilt.',
    culturalControlKn: 'ಮಾರುತಿ (ಐಸಿಪಿ-8863) ಅಥವಾ ಬಿಎಸ್‌ಎಂಆರ್-736 ರಂತಹ ನಿರೋಧಕ ತಳಿಗಳನ್ನು ಬೆಳೆಯಿರಿ. ಜೋಳದೊಂದಿಗೆ ಮಿಶ್ರಬೆಳೆಯಾಗಿ ಬೆಳೆಯಿರಿ.',
    culturalControlTa: 'மாருதி அல்லது பிஎஸ்எம்ஆர்-736 போன்ற எதிர்ப்பு ரகங்களை பயிரிடவும். சோளத்துடன் ஊடுபயிராக நடவும்.',
    culturalControlTe: 'మారుతి (ICP-8863) వంటి నిరోಧక రకాలను ఎంచుకోండి. జొన్నతో అంతరపంటగా వేయండి.',
    biologicalControl: 'Seed treatment with Trichoderma viride (10g/kg) and soil application of Trichoderma enriched in farmyard manure (FYM) at planting.',
    biologicalControlKn: 'ಟ್ರೈಕೋಡರ್ಮಾ ಜೈವಿಕ ಶಿಲೀಂಧ್ರದಿಂದ ಬೀಜೋಪಚಾರ ಮಾಡಿ ಮತ್ತು ಕೊಟ್ಟಿಗೆ ಗೊಬ್ಬರದೊಂದಿಗೆ ಮಣ್ಣಿಗೆ ಹಾಕಿ.',
    biologicalControlTa: 'டிரைக்கோடெர்மா கொண்டு விதை நேர்த்தி செய்து தொழு உரத்துடன் நிலத்தில் இடவும்.',
    biologicalControlTe: 'ట్రైకోడెర్మతో విత్తన శుద్ధి చేయండి మరియు పశువుల ఎరువుతో నేలలో వేయండి.',
    organicControl: 'Apply neem cake (150 kg/acre) during field preparation to suppress soil fungal density.',
    organicControlKn: 'ಜಮೀನು ಹದಮಾಡುವಾಗ ಎಕರೆಗೆ 150 ಕೆಜಿ ಬೇವಿನ ಹಿಂಡಿ ಹಾಕಿ.',
    organicControlTa: 'நிலம் தயாரிக்கும் போது 150 கிலோ வேப்பம்பிண்ணாக்கு இடவும்.',
    organicControlTe: 'భూమి తయారీలో ఎకరానికి 150 కిలోల వేప పిండి వేయండి.',
    chemicalControl: 'Seed treatment with Carbendazim + Thiram. Note: Chemical foliar sprays cannot cure vascular wilt once plant wilts. Follow container label strictly.',
    chemicalControlKn: 'ಬಿತ್ತನೆ ಮುನ್ನ ಕಾರ್ಬೆಂಡಾಜಿಮ್ + ಥೈರಮ್‌ನಿಂದ ಬೀಜೋಪಚಾರ ಮಾಡಿ. ರೋಗ ಬಂದ ನಂತರ ಸಿಂಪರಣೆ ಕೆಲಸ ಮಾಡುವುದಿಲ್ಲ.',
    chemicalControlTa: 'கட்டாய விதை நேர்த்தி செய்யவும். வாடிய பிறகு மருந்து தெளிப்பது பயனளிக்காது.',
    chemicalControlTe: 'విత్తే ముందు కార్బెంజెడిమ్ + థైరమ్‌తో విత్తన శుద్ధి చేయండి. తెగులు సోకాక స్ప్రేలు పనిచేయవు.',
    preventionSteps: ['Always treat seeds with Trichoderma.', 'Rotate with sorghum or maize.', 'Never save seeds from wilted plots.'],
    preventionStepsKn: ['ಟ್ರೈಕೋಡರ್ಮಾದಿಂದ ಕಡ್ಡಾಯವಾಗಿ ಬೀಜೋಪಚಾರ ಮಾಡಿ.', 'ಜೋಳದ ಜೊತೆ ಬೆಳೆ ಪರಿವರ್ತನೆ ಮಾಡಿ.'],
    preventionStepsTa: ['கட்டாய விதை நேர்த்தி செய்யவும்.', 'சோளத்துடன் பயிர் சுழற்சி செய்யவும்.'],
    preventionStepsTe: ['తప్పనిసరిగా విత్తన శుద్ధి చేయండి.', 'జొన్నతో పంట మార్పిడి చేయండి.'],
    ipmSteps: [
      'Step 1: Wilt-resistant variety (Maruti / BSMR-736).',
      'Step 2: Seed treatment with Trichoderma viride.',
      'Step 3: Intercropping with sorghum (1:2 ratio).',
      'Step 4: Non-host crop rotation.'
    ],
    ipmStepsKn: ['ಹಂತ 1: ಮಾರುತಿ ನಿರೋಧಕ ತಳಿ', 'ಹಂತ 2: ಟ್ರೈಕೋಡರ್ಮಾ ಬೀಜೋಪಚಾರ', 'ಹಂತ 3: ಜೋಳ ಮಿಶ್ರಬೆಳೆ', 'ಹಂತ 4: ಬೆಳೆ ಪರಿವರ್ತನೆ'],
    ipmStepsTa: ['படி 1: எதிர்ப்பு ரகம்', 'படி 2: விதை நேர்த்தி', 'படி 3: சோளம் ஊடுபயிர்', 'படி 4: பயிர் சுழற்சி'],
    ipmStepsTe: ['దశ 1: నిరోధక రకాలు', 'దశ 2: విత్తన శుద్ధి', 'దశ 3: జొన్న అంతరపంట', 'దశ 4: పంట మార్పిడి'],
    safetyNotes: 'Burn roots of wilted plants; do not compost wilted pigeonpea debris in domestic manure pits.',
    lookAlikes: [
      { name: 'Pigeonpea Macrophomina Stem Canker', difference: 'Macrophomina produces dark ashy stem cankers with tiny black pycnidial dots under dry heat stress.' },
      { name: 'Waterlogging Wilt', difference: 'Waterlogged roots rot and smell foul without vertical dark purple vascular bands on stem.' }
    ],
    whenToCallExpert: 'Call KVK/RSK if wilting appears in patches during pod formation; confirm vascular browning through vertical stem splitting.',
    whenToCallExpertKn: 'ಕಾಯಿ ಕಟ್ಟುವ ಹಂತದಲ್ಲಿ ಗಿಡಗಳು ಬಾಡುತ್ತಿದ್ದರೆ ತಕ್ಷಣ ಕೃಷಿ ಅಧಿಕಾರಿಯನ್ನು ಸಂಪರ್ಕಿಸಿ.',
    whenToCallExpertTa: 'காய் பிடிக்கும் போது செடிகள் வாடினால் உடனே வேளாண் அலுவலரை அணுகவும்.',
    whenToCallExpertTe: 'కాయ దశలో మొక్కలు ఎండిపోతుంటే వెంటనే వ్యవసాయాధికారిని సంప్రదించండి.',
    confidence: 'verified',
    sources: 'ICAR-IIPR Kanpur, ICRISAT Pulse Pathology Guide.',
    crops: [
      { cropName: 'Red Gram / Tur (Pigeonpea)', cropSlug: 'red-gram', importance: 'primary' }
    ],
    symptomTags: [
      { tagSlug: 'part-whole-plant', weight: 3.0, isPrimary: true },
      { tagSlug: 'pattern-wilting', weight: 3.0, isPrimary: true },
      { tagSlug: 'part-stem', weight: 2.5, isPrimary: false },
      { tagSlug: 'colour-brown', weight: 2.0, isPrimary: true },
      { tagSlug: 'spread-patches', weight: 1.5, isPrimary: false }
    ],
    images: [
      {
        path: '/problems/fusarium-wilt-pigeonpea/stem-vascular-band.webp',
        caption: 'Dark purple-brown vascular streak on split stem of wilted pigeonpea plant caused by Fusarium udum.',
        captionKn: 'ತೊಗರಿ ಗಿಡದ ಕಾಂಡವನ್ನು ಸೀಳಿದಾಗ ಒಳಗೆ ಕಂದು-ನೇರಳೆ ಬಣ್ಣದ ಸೊರಗು ರೋಗದ ನರಗಳು.',
        kind: 'symptom_closeup',
        source: 'Wikimedia Commons',
        author: 'ICRISAT Research Repository',
        licence: 'CC BY-SA 4.0',
        attribution: 'ICRISAT / Wikimedia Commons',
        isPrimary: true
      }
    ]
  },

  // ==========================================
  // GREEN GRAM (MOONG)
  // ==========================================
  {
    slug: 'yellow-mosaic-virus-greengram',
    name: 'Yellow Mosaic Disease of Green Gram (MYMV)',
    nameKn: 'ಹೆಸರುಕಾಳು ಹಳದಿ ನಂಜು ರೋಗ (Yellow Mosaic)',
    nameTa: 'பாசிப்பயறு மஞ்சள் தேமல் நோய்',
    nameTe: 'పెసర పసుపు మొజాయిక్ తెగులు',
    scientificName: 'Mungbean yellow mosaic virus (MYMV)',
    type: 'viral',
    severity: 'critical',
    symptoms: 'Small irregular yellow specks on young leaves that enlarge and coalesce into bright golden-yellow mosaic patches interspersed with green islands; complete yellowing of foliage in severe cases; delayed flowering and small, curled, empty or deformed pods.',
    symptomsKn: 'ಎಳೆ ಎಲೆಗಳ ಮೇಲೆ ಸಣ್ಣ ಹಳದಿ ಚುಕ್ಕೆಗಳು ಕಾಣಿಸಿಕೊಂಡು ನಂತರ ಇಡೀ ಎಲೆ ಬಂಗಾರದ ಹಳದಿ ಬಣ್ಣಕ್ಕೆ ತಿರುಗುತ್ತದೆ. ಹೂ ಬಿಡುವುದು ವಿಳಂಬವಾಗಿ ಕಾಯಿಗಳು ಸಣ್ಣದಾಗಿ, ಮುದುರಿಕೊಂಡು ಕಾಳು ಕಟ್ಟುವುದಿಲ್ಲ.',
    symptomsTa: 'இளம் இலைகளில் சிறிய மஞ்சள் புள்ளிகள் தோன்றி, இலை முழுவதும் தங்க மஞ்சள் நிறமாக மாறும். பூப்பது தாமதமாகி காய்கள் சிறியதாகி சுருங்கும்.',
    symptomsTe: 'లేత ఆకులపై చిన్న పసుపు మచ్చలు ఏర్పడి, ఆకులన్నీ బంగారు పసుపు రంగులోకి మారతాయి. పూత ఆలస్యమై కాయలు చిన్నవిగా మారి గింజలు కట్టవు.',
    cause: 'Begomovirus transmitted exclusively by the whitefly vector (Bemisia tabaci).',
    favourableConditions: 'Hot dry weather (28-36°C) promoting whitefly reproduction, early summer and kharif plantings.',
    favourableHumidity: '50-70%',
    favourableTemp: '28-36°C',
    favourableSeasons: ['Kharif', 'Zaid'],
    affectedStages: ['Seedling', 'Vegetative Growth', 'Flowering'],
    spreadPattern: 'Whiteflies transmit the virus persistently from infected leguminous crops and weeds.',
    culturalControl: 'Sow MYMV-resistant varieties like IPM-02-03, IPM-02-14, or COGG-912 from TNAU. Plant boundary barrier crops of maize or sorghum. Rogue out infected plants early.',
    culturalControlKn: 'ನಿರೋಧಕ ತಳಿಗಳನ್ನು ಬೆಳೆಯಿರಿ. ಹೊಲದ ಸುತ್ತಲೂ 3 ಸಾಲು ಮೆಕ್ಕೆಜೋಳವನ್ನು ತಡೆಗೋಡೆಯಾಗಿ ಬೆಳೆಯಿರಿ. ರೋಗಪೀಡಿತ ಗಿಡಗಳನ್ನು ತಕ್ಷಣ ಕಿತ್ತು ಹೂತುಹಾಕಿ.',
    culturalControlTa: 'எதிர்ப்பு ரகங்களை பயிரிடவும். மக்காச்சೋளம் தடுப்பு பயிராக நடவும். பாதித்த செடிகளை உடனே அகற்றவும்.',
    culturalControlTe: 'నిరోధక రకాలను ఎంచుకోండి. పొలం చుట్టూ మొక్కజొన్నను రక్షణగా వేయండి. తెగులు సోకిన మొక్కలను పీకివేయండి.',
    biologicalControl: 'Spray Verticillium lecanii or Beauveria bassiana against whitefly vector colonies under leaves.',
    biologicalControlKn: 'ಬಿಳಿ ನೊಣಗಳ ನಿಯಂತ್ರಣಕ್ಕೆ ಬ್ಯೂವೇರಿಯಾ ಅಥವಾ ವರ್ಟಿಸಿಲಿಯಮ್ ಜೈವಿಕ ಕೀಟನಾಶಕ ಸಿಂಪಡಿಸಿ.',
    biologicalControlTa: 'வெர்ட்டிசீலியம் அல்லது பவேரியா பூஞ்சாணத்தை தெளிக்கவும்.',
    biologicalControlTe: 'వర్టిసిలియం లేదా బవేరియా ద్రావణాన్ని ఆకుల కింద పిచಿಕారీ చేయండి.',
    organicControl: 'Install 15-20 yellow sticky traps per acre. Foliar spray of 2% Neem oil or 5% NSKE to deter whitefly feeding.',
    organicControlKn: 'ಎಕರೆಗೆ 15-20 ಹಳದಿ ಜಿಗುಟು ಬಲೆಗಳನ್ನು ಅಳವಡಿಸಿ. ಬೇವಿನ ಎಣ್ಣೆ (2%) ಸಿಂಪಡಿಸಿ.',
    organicControlTa: 'மஞ்சள் ஒட்டும் பொறி வைக்கவும். வேப்ப எண்ணெய் (2%) தெளிக்கவும்.',
    organicControlTe: 'పసుపు జిగురు బుట్టలు పెట్టండి. వేప నూనె (2%) పిచికారీ చేయండి.',
    chemicalControl: 'Seed treatment with Imidacloprid or Thiamethoxam. Foliar spray of Acetamiprid or Thiamethoxam at initial whitefly appearance. Note: No spray cures virus once foliage turns yellow; vector suppression is key.',
    chemicalControlKn: 'ಬೀಜೋಪಚಾರಕ್ಕೆ ಇಮಿಡಾಕ್ಲೋಪ್ರಿಡ್ ಬಳಸಿ. ಬಿಳಿ ನೊಣ ಕಂಡಾಗ ಥೈಯಾಮೆಥಾಕ್ಸಮ್ ಸಿಂಪಡಿಸಿ. ಲೇಬಲ್ ಸೂಚನೆ ಪಾಲಿಸಿ.',
    chemicalControlTa: 'விதை நேர்த்தி செய்யவும். வெள்ளை ஈ தோன்றியவுடன் தயோமெத்தாக்சம் தெளிக்கவும்.',
    chemicalControlTe: 'విత్తన శుద్ధి చేయండి. తెల్లదోమ కనిపించగానే థయామెథాక్సమ్ పిచికారీ చేయండి.',
    preventionSteps: ['Always buy certified MYMV-resistant seeds.', 'Install yellow sticky traps early.', 'Destroy alternate weed hosts.'],
    preventionStepsKn: ['ಪ್ರಮಾಣಿತ ನಿರೋಧಕ ಬೀಜ ಮಾತ್ರ ಬಳಸಿ.', 'ಹಳದಿ ಜಿಗುಟು ಬಲೆ ಮುಂಚಿತವಾಗಿ ಹಾಕಿ.'],
    preventionStepsTa: ['சான்றளிக்கப்பட்ட எதிர்ப்பு விதைகளை வாங்கவும்.', 'மஞ்சள் ஒட்டும் பொறி வைக்கவும்.'],
    preventionStepsTe: ['ధృవీకరించిన విత్తనాలు వాడండి.', 'పసుపు బుట్టలు అమర్చండి.'],
    ipmSteps: [
      'Step 1: Certified MYMV-resistant variety.',
      'Step 2: Insecticidal seed treatment for 25-day vector shield.',
      'Step 3: Yellow sticky traps (15-20/acre).',
      'Step 4: Vector management spray at first nymph sightings.'
    ],
    ipmStepsKn: ['ಹಂತ 1: ನಿರೋಧಕ ತಳಿ', 'ಹಂತ 2: ಬೀಜೋಪಚಾರ', 'ಹಂತ 3: ಹಳದಿ ಜಿಗುಟು ಬಲೆ', 'ಹಂತ 4: ಬಿಳಿ ನೊಣ ನಿಯಂತ್ರಣ'],
    ipmStepsTa: ['படி 1: எதிர்ப்பு ரகம்', 'படி 2: விதை நேர்த்தி', 'படி 3: மஞ்சள் பொறி', 'படி 4: பூச்சி கட்டுப்பாடு'],
    ipmStepsTe: ['దశ 1: నిరోధక రకాలు', 'దశ 2: విత్తన శుద్ధి', 'దశ 3: పసుపు బుట్టలు', 'దశ 4: దోమల నివారణ'],
    safetyNotes: 'Wear gloves during spraying. Do not spray during peak honeybee activity hours.',
    lookAlikes: [
      { name: 'Iron Deficiency Chlorosis', difference: 'Iron deficiency turns young leaves uniformly pale yellow without green islands or whitefly presence.' },
      { name: 'Cercospora Leaf Spot', difference: 'Cercospora produces distinct brown spots with grey centers, not systemic golden mosaic.' }
    ],
    whenToCallExpert: 'Call KVK/RSK if yellow mosaic patches cover more than 15% of the seedling crop within 25 days of sowing.',
    whenToCallExpertKn: 'ಬಿತ್ತನೆ ಮಾಡಿದ 25 ದಿನಗಳೊಳಗೆ 15% ಕ್ಕಿಂತ ಹೆಚ್ಚು ಗಿಡಗಳಲ್ಲಿ ಹಳದಿ ನಂಜು ರೋಗ ಬಂದರೆ ತಕ್ಷಣ ಕೃಷಿ ಅಧಿಕಾರಿಯನ್ನು ಸಂಪರ್ಕಿಸಿ.',
    whenToCallExpertTa: '25 நாட்களுக்குள் 15% மேற்பட்ட செடிகளில் மஞ்சள் தேமல் பரவினால் உடனடியாக அணுகவும்.',
    whenToCallExpertTe: 'విత్తిన 25 రోజుల్లోపే 15% పైగా మొక్కల్లో పసుపు మొజాయిక్ వస్తే వెంటనే వ్యవసాయాధికారిని సంప్రదించండి.',
    confidence: 'verified',
    sources: 'ICAR-IIPR Kanpur, TNAU Pulses Department.',
    crops: [
      { cropName: 'Green Gram (Moong)', cropSlug: 'green-gram', importance: 'primary' },
      { cropName: 'Chickpea (Bengal Gram)', cropSlug: 'chickpea', importance: 'secondary' }
    ],
    symptomTags: [
      { tagSlug: 'part-leaf', weight: 3.0, isPrimary: true },
      { tagSlug: 'pattern-spots', weight: 2.5, isPrimary: true },
      { tagSlug: 'colour-yellow', weight: 3.0, isPrimary: true },
      { tagSlug: 'pattern-stunting', weight: 2.0, isPrimary: false },
      { tagSlug: 'pattern-insects-visible', weight: 1.5, isPrimary: false }
    ],
    images: [
      {
        path: '/problems/yellow-mosaic-virus-greengram/golden-mosaic-foliage.webp',
        caption: 'Bright golden-yellow mosaic patches interspersed with green islands on green gram foliage caused by MYMV.',
        captionKn: 'ಹೆಸರುಕಾಳು ಎಲೆಗಳ ಮೇಲೆ ಚಿನ್ನದ ಹಳದಿ ಬಣ್ಣದ ಮಚ್ಚೆಗಳುಳ್ಳ ಹಳದಿ ನಂಜು ರೋಗ.',
        kind: 'symptom_closeup',
        source: 'Wikimedia Commons',
        author: 'TNAU Research Repository',
        licence: 'CC BY-SA 4.0',
        attribution: 'TNAU Pulses Division / Wikimedia Commons',
        isPrimary: true
      }
    ]
  },

  // ==========================================
  // COTTON (ADDITIONAL)
  // ==========================================
  {
    slug: 'bacterial-blight-cotton',
    name: 'Bacterial Blight of Cotton (Black Arm)',
    nameKn: 'ಹತ್ತಿಯ ಕಪ್ಪು ತೋಳು / ದುಂಡಾಣು ಕರಕಲು ರೋಗ (Black Arm)',
    nameTa: 'பருத்தி கருப்பு கை / பாக்டீரியா கருகல் நோய்',
    nameTe: 'పత్తి బ్యాక్టీరియా మచ్చ / నల్ల కొమ్మ తెగులు',
    scientificName: 'Xanthomonas citri pv. malvacearum',
    type: 'bacterial',
    severity: 'high',
    symptoms: 'Angular leaf spot: Small angular water-soaked lesions bounded by leaf veinlets; Black Arm: Elongated dark brown or black sunken lesions girdling branches and main stem, causing them to break; Boll rot: Dark sunken circular spots on bolls rotting the lint inside.',
    symptomsKn: 'ಎಲೆಗಳ ಮೇಲೆ ನರಗಳ ನಡುವೆ ಕೋನೀಯ (ಆಂಗ್ಯುಲರ್) ಕಲೆಗಳು. ರೆಂಬೆ ಮತ್ತು ಕಾಂಡದ ಮೇಲೆ ಕಪ್ಪು ಪಟ್ಟೆಗಳು ಬಿದ್ದು ಕೊಂಬೆ ಮುರಿದು ಬೀಳುತ್ತದೆ (ಕಪ್ಪು ತೋಳು). ಕಾಯಿಗಳ ಮೇಲೆ ಕಪ್ಪು ಕಲೆಗಳು ಉಂಟಾಗಿ ಹತ್ತಿ ಕೊಳೆಯುತ್ತದೆ.',
    symptomsTa: 'இலைகளில் நரம்புகளுக்கு இடையில் கோண வடிவ நீர் நனைந்த புள்ளிகள் தோன்றும். கிளைகளில் கருப்பு பட்டைகள் ஏற்பட்டு கிளைகள் ஒடியும் (கருப்பு கை). காய்கள் அழுகும்.',
    symptomsTe: 'ఆకుల ఈనెల మధ్య కోణాకారపు నీటి మచ్చలు వస్తాయి. కొమ్మలపై నల్లటి చారలు ఏర్పడి కొమ్మలు విరిగిపోతాయి ("నల్ల కొమ్మ"). కాయలపై నల్లటి మచ్చలు ఏర్పడి దూది కుళ్ళిపోతుంది.',
    cause: 'Bacterium Xanthomonas citri pv. malvacearum surviving on seed fuzz and crop residues.',
    favourableConditions: 'Frequent rain storms, strong winds, warm temperatures (28-34°C), high relative humidity (>85%), and high nitrogen levels.',
    favourableHumidity: '>85%',
    favourableTemp: '28-34°C',
    favourableSeasons: ['Kharif'],
    affectedStages: ['Vegetative Growth', 'Flowering', 'Fruiting'],
    spreadPattern: 'Wind-driven rain splashes disperse bacterial cells across plants rapidly.',
    culturalControl: 'Delinting of cotton seed with concentrated sulfuric acid before sowing to destroy seed-borne bacteria. Destroy crop residues after harvest. Avoid overhead sprinkler irrigation.',
    culturalControlKn: 'ಬಿತ್ತನೆ ಮುನ್ನ ಹತ್ತಿ ಬೀಜವನ್ನು ಆಮ್ಲ ಸಂಸ್ಕರಣೆ (ಡಿಲಿಂಟಿಂಗ್) ಮಾಡಿ. ಬೆಳೆಯ ಉಳಿಕೆಗಳನ್ನು ಸುಟ್ಟುಹಾಕಿ. ತುಂತುರು ನೀರಾವರಿ ಬಳಸಬೇಡಿ.',
    culturalControlTa: 'விதைகளை அமில நேர்த்தி (Delinting) செய்யவும். பயிர் எச்சங்களை எரிக்கவும்.',
    culturalControlTe: 'విత్తనాలకు ఆమ్ల శుద్ధి (డీలింటింగ్) చేయండి. పంట వ్యర్థాలను కాల్చండి.',
    biologicalControl: 'Seed treatment and foliar spray of Pseudomonas fluorescens or Bacillus subtilis.',
    biologicalControlKn: 'ಸ್ಯೂಡೋಮೊನಾಸ್ ಫ್ಲೋರೊಸೆನ್ಸ್‌ನಿಂದ ಬೀಜೋಪಚಾರ ಮಾಡಿ ಸಿಂಪಡಿಸಿ.',
    biologicalControlTa: 'சூடோமோனாஸ் கொண்டு விதை நேர்த்தி செய்து தெளிக்கவும்.',
    biologicalControlTe: 'సూడోమోనాస్‌తో విత్తన శుద్ధి చేసి పిచికారీ చేయండి.',
    organicControl: 'Foliar spray of fresh cow dung filtrate mixed with turmeric powder or 1% Bordeaux mixture.',
    organicControlKn: 'ಸಗಣಿ ತಿಳಿ ನೀರು ಮತ್ತು ಅರಿಶಿನ ಪುಡಿ ಮಿಶ್ರಣ ಅಥವಾ 1% ಬೋರ್ಡೋ ದ್ರಾವಣ ಸಿಂಪಡಿಸಿ.',
    organicControlTa: 'சாண நீர் மற்றும் மஞ்சள் பொடி கலந்து தெளிக்கவும்.',
    organicControlTe: 'పేడ నీళ్లు మరియు పసుపు కలిపి పిచికారీ చేయండి.',
    chemicalControl: 'Foliar spray of Copper Oxychloride combined with Streptocycline at initial angular leaf spot phase. Repeat after 15 days if stormy wet weather continues. Note: Strictly observe container label instructions and consult local KVK.',
    chemicalControlKn: 'ಲಕ್ಷಣ ಕಂಡಾಗ ತಾಮ್ರದ ಆಕ್ಸಿಕ್ಲೋರೈಡ್ ಮತ್ತು ಸ್ಟ್ರೆಪ್ಟೊಸೈಕ್ಲಿನ್ ಮಿಶ್ರಣ ಸಿಂಪಡಿಸಿ. ಲೇಬಲ್ ಸೂಚನೆ ಪಾಲಿಸಿ.',
    chemicalControlTa: 'காப்பர் ஆக்ஸிகுளோரைடு மற்றும் ஸ்ட்ரெப்டோமைசின் கலந்து தெளிக்கவும்.',
    chemicalControlTe: 'కాపర్ ఆక్సిక్లోరైడ్ మరియు స్ట్రెప్టోమైసిన్ కలిపి పిచికారీ చేయండి.',
    preventionSteps: ['Sow acid-delinted certified seeds.', 'Adopt resistant varieties.', 'Maintain balanced potassium fertilization.'],
    preventionStepsKn: ['ಡಿಲಿಂಟ್ ಮಾಡಿದ ಪ್ರಮಾಣಿತ ಬೀಜ ಮಾತ್ರ ಬಳಸಿ.', 'ಪೊಟ್ಯಾಷ್ ಗೊಬ್ಬರವನ್ನು ಸಮರ್ಪಕವಾಗಿ ನೀಡಿ.'],
    preventionStepsTa: ['அமில நேர்த்தி செய்த விதைகளை நடவும்.', 'சாம்பல் சத்து சமச்சீராக இடவும்.'],
    preventionStepsTe: ['ఆమ్ల శుద్ధి చేసిన విత్తనాలను వాడండి.', 'పొటాష్ ఎరువును వేయండి.'],
    ipmSteps: [
      'Step 1: Acid-delinting of seeds.',
      'Step 2: Seed treatment with Streptocycline or bio-agent.',
      'Step 3: Elimination of infected stalks post-harvest.',
      'Step 4: Prophylactic copper bactericide spray upon first angular lesions.'
    ],
    ipmStepsKn: ['ಹಂತ 1: ಬೀಜದ ಆಮ್ಲ ಸಂಸ್ಕರಣೆ', 'ಹಂತ 2: ಬ್ಯಾಕ್ಟೀರಿಯಾನಾಶಕ ಬೀಜೋಪಚಾರ', 'ಹಂತ 3: ಕಡ್ಡಿಗಳ ನಾಶ', 'ಹಂತ 4: ತಾಮ್ರದ ಸಿಂಪರಣೆ'],
    ipmStepsTa: ['படி 1: அமில நேர்த்தி', 'படி 2: விதை நேர்த்தி', 'படி 3: கழிவு அழிப்பு', 'படி 4: காப்பர் தெளிப்பு'],
    ipmStepsTe: ['దశ 1: డీలింటింగ్', 'దశ 2: విత్తన శుద్ధి', 'దశ 3: వ్యర్థాల నాశనం', 'దశ 4: కాపర్ పిచికారీ'],
    safetyNotes: 'Wear face mask when mixing antibiotic bactericides. Do not spray during strong winds.',
    lookAlikes: [
      { name: 'Alternaria Leaf Spot of Cotton', difference: 'Alternaria spots are circular with concentric rings, while bacterial blight spots are sharply angular, bounded by leaf veins.' },
      { name: 'Myrothecium Leaf Spot', difference: 'Myrothecium produces translucent concentric spots with black fruiting buttons.' }
    ],
    whenToCallExpert: 'Call KVK/RSK if stem cankers (Black Arm) cause upper canopy branches to break off and drop developing bolls.',
    whenToCallExpertKn: 'ಕಾಂಡದಲ್ಲಿ ಕಪ್ಪು ಕಲೆಗಳು ಉಂಟಾಗಿ ಕೊಂಬೆಗಳು ಮುರಿದು ಬೀಳುತ್ತಿದ್ದರೆ ತಕ್ಷಣ ಕೃಷಿ ಅಧಿಕಾರಿಗಳನ್ನು ಸಂಪರ್ಕಿಸಿ.',
    whenToCallExpertTa: 'தண்டுகளில் கருப்பு புண்கள் ஏற்பட்டு கிளைகள் ஒடிந்தால் உடனடியாக அணுகவும்.',
    whenToCallExpertTe: 'నల్ల కొమ్మల వల్ల కొమ్మలు విరిగిపోతుంటే వెంటనే వ్యవసాయాధికారిని సంప్రదించండి.',
    confidence: 'verified',
    sources: 'ICAR-CICR Nagpur, UAS Dharwad Cotton Research Station.',
    crops: [
      { cropName: 'Cotton', cropSlug: 'cotton', importance: 'primary' }
    ],
    symptomTags: [
      { tagSlug: 'part-leaf', weight: 2.5, isPrimary: true },
      { tagSlug: 'part-stem', weight: 3.0, isPrimary: true },
      { tagSlug: 'pattern-spots', weight: 2.0, isPrimary: false },
      { tagSlug: 'colour-black', weight: 2.5, isPrimary: true },
      { tagSlug: 'colour-brown', weight: 1.5, isPrimary: false }
    ],
    images: [
      {
        path: '/problems/bacterial-blight-cotton/angular-leaf-spots.webp',
        caption: 'Angular water-soaked leaf spots bounded by veinlets and black arm branch cankers in cotton caused by Xanthomonas.',
        captionKn: 'ಹತ್ತಿ ಎಲೆಗಳ ನರಗಳ ನಡುವೆ ಕೋನೀಯ ಕಲೆಗಳು ಮತ್ತು ಕೊಂಬೆಯ ಮೇಲೆ ಕಪ್ಪು ತೋಳು ರೋಗ.',
        kind: 'symptom_closeup',
        source: 'Wikimedia Commons',
        author: 'Clemson University - USDA Cooperative Extension',
        licence: 'CC BY 3.0',
        attribution: 'Clemson University / Wikimedia Commons',
        isPrimary: true
      }
    ]
  },

  // ==========================================
  // COCONUT PROBLEMS
  // ==========================================
  {
    slug: 'rhinoceros-beetle-coconut',
    name: 'Rhinoceros Beetle of Coconut',
    nameKn: 'ತೆಂಗಿನ ಕಪ್ಪು ದುಂಬಿ / ಕೋಡು ದುಂಬಿ (Rhinoceros Beetle)',
    nameTa: 'தென்னை காண்டாமிருக வண்டு',
    nameTe: 'కొబ్బరి కొమ్ము పురుగు',
    scientificName: 'Oryctes rhinoceros',
    type: 'insect_pest',
    severity: 'high',
    symptoms: 'Characteristic geometric "V-shaped" or wedge-shaped cuts on opened fronds/leaves; bore holes on the soft crown base packed with chewed fibrous chewed frass; spathe boring and reduction in nut yield; stunting of young palms.',
    symptomsKn: 'ಅರಳಿದ ತೆಂಗಿನ ಗರಿಗಳು "V" ಆಕಾರದಲ್ಲಿ ಜ್ಯಾಮಿತೀಯವಾಗಿ ಕತ್ತರಿಸಿದಂತೆ ಕಾಣುತ್ತವೆ. ಮರದ ಸುಳಿಯ ಬುಡದಲ್ಲಿ ಕಡಿದ ನಾರಿನೊಂದಿಗೆ ರಂಧ್ರಗಳು ಕಾಣಿಸುತ್ತವೆ. ಎಳೆ ಸಸಿಗಳ ಬೆಳವಣಿಗೆ ಕುಂಠಿತವಾಗುತ್ತದೆ.',
    symptomsTa: 'மட்டைகள் விரியும் போது "V" வடிவில் கத்தரித்தது போன்ற வெட்டுக்கள் காணப்படும். உச்சிக் குருத்தில் நார் வெளியே தள்ளப்பட்ட துளைகள் இருக்கும்.',
    symptomsTe: 'విచ్చుకున్న కొబ్బరి మట్టలపై "V" ఆకారపు కత్తిరింపులు కనిపిస్తాయి. సుడి మొదట్లో పీచుతో కూడిన రంధ్రాలు ఉంటాయి.',
    cause: 'Adult stout black horn-bearing beetles burrowing into the soft developing heart tissues of the crown.',
    favourableConditions: 'Presence of decaying organic manure pits, rotting coconut logs, and compost heaps near plantations where grubs breed.',
    favourableHumidity: '60-85%',
    favourableTemp: '24-32°C',
    favourableSeasons: ['Kharif', 'Rabi', 'Zaid'],
    affectedStages: ['Vegetative Growth', 'Flowering', 'Fruiting'],
    spreadPattern: 'Adult beetles fly actively at night from breeding breeding manure piles to palm crowns.',
    culturalControl: 'Hook out and destroy adult beetles from crown holes using an iron hook. Treat manure pits and rotting palm logs where grubs develop. Fill leaf axils around the crown with a 1:1 mixture of sand and neem cake (or naphthalene balls).',
    culturalControlKn: 'ಕಬ್ಬಿಣದ ಕೊಂಡಿಯಿಂದ ಸುಳಿಯಲ್ಲಿರುವ ದುಂಬಿಗಳನ್ನು ಹೊರತೆಗೆದು ನಾಶಮಾಡಿ. ಸುಳಿಯ ಎಲೆಗಳ ಕಂಕುಳಿನಲ್ಲಿ ಮರಳು ಮತ್ತು ಬೇವಿನ ಹಿಂಡಿ ಮಿಶ್ರಣವನ್ನು ತುಂಬಿ. ಗೊಬ್ಬರದ ಗುಂಡಿಗಳನ್ನು ಸ್ವಚ್ಛವಾಗಿಡಿ.',
    culturalControlTa: 'இரும்பு கம்பியால் வண்டுகளை குத்தி எடுக்கவும். மட்டை இடுக்குகளில் மணல் மற்றும் வேப்பம்பிண்ணாக்கு கலவை வைக்கவும். எருக் குழிகளை பராமரிக்கவும்.',
    culturalControlTe: 'ఇనుప చువ్వతో సుడిలోని పురుగులను బయటకు తీసి చంపండి. మట్టల సందుల్లో ఇసుక, వేప పిండి మిశ్రమం లేదా పాదరసపు ఉండలు పెట్టండి.',
    biologicalControl: 'Incorporate fungal bio-agent Metarhizium anisopliae into manure breeding pits to kill grubs. Release Baculovirus oryctes infected adult beetles for population suppression.',
    biologicalControlKn: 'ಗೊಬ್ಬರದ ಗುಂಡಿಗಳಿಗೆ ಮೆಟಾರೈಜಿಯಮ್ ಜೈವಿಕ ಶಿಲೀಂಧ್ರ ಹಾಕಿ ದುಂಬಿಯ ಮರಿಹುಳುಗಳನ್ನು ಕೊಲ್ಲಿ.',
    biologicalControlTa: 'எருக் குழிகளில் மெட்டாரைசியம் பூஞ்சாணத்தை இட்டு புழுக்களை அழிக்கவும்.',
    biologicalControlTe: 'ఎరువు గుంతల్లో మెటారైజియం ద్రావణం చల్లి పిల్ల పురుగులను నాశనం చేయండి.',
    organicControl: 'Erect Rhinolure pheromone traps (one trap per 5 acres) to capture adult flying beetles. Place naphthalene balls (3-4 balls) covered with sand in topmost leaf axils.',
    organicControlKn: '5 ಎಕರೆಗೆ ಒಂದು ರೈನೋಲ್ಯೂರ್ ಮೋಹಕ ಬಲೆ ಹಾಕಿ. ಸುಳಿಯ ಕಂಕುಳಿನಲ್ಲಿ ಕರ್ಪೂರ/ಡಾಂಬರು ಗುಳಿಗೆ ಇಡಿ.',
    organicControlTa: '5 ஏக்கருக்கு ஒரு ரைனோலூர் பொறி வைக்கவும். நாப்தலீன் உருண்டைகளை மட்டை இடுக்கில் வைக்கவும்.',
    organicControlTe: '5 ఎకరాలకు ఒక ఫెరమోన్ బుట్ట పెట్టండి. మట్టల సందుల్లో నాఫ్తలీన్ గోళీలు పెట్టండి.',
    chemicalControl: 'Mix Sand with Chlorantraniliprole granules or Cartap Hydrochloride and place in the innermost 2-3 leaf axils of the crown. Note: Follow label recommendations carefully; consult local horticulture department / CPCRI.',
    chemicalControlKn: 'ಮರಳು ಜೊತೆ ಕೀಟನಾಶಕ ಬೆರೆಸಿ ಸುಳಿಯ ಸುತ್ತಲಿನ 2-3 ಎಲೆಗಳ ಕಂಕುಳಿನಲ್ಲಿ ಹಾಕಿ. ಲೇಬಲ್ ಸೂಚನೆ ಪಾಲಿಸಿ.',
    chemicalControlTa: 'மணலுடன் பூச்சிக்கொல்லி கலந்து உள் மட்டை இடுக்குகளில் வைக்கவும்.',
    chemicalControlTe: 'ఇసుకతో పురుగుమందు కలిపి లోపలి మట్టల సందుల్లో పెట్టండి.',
    preventionSteps: ['Regular crown cleaning twice a year.', 'Treat manure pits with Metarhizium.', 'Place sand-neem cake mixture in top leaf axils.'],
    preventionStepsKn: ['ವರ್ಷಕ್ಕೆ ಎರಡು ಬಾರಿ ಮರದ ಸುಳಿ ಸ್ವಚ್ಛಗೊಳಿಸಿ.', 'ಗೊಬ್ಬರದ ಗುಂಡಿಗಳಿಗೆ ಜೈವಿಕ ಶಿಲೀಂಧ್ರ ಹಾಕಿ.'],
    preventionStepsTa: ['ஆண்டுக்கு இருமுறை மரம் சுத்தம் செய்யவும்.', 'எருக் குழிகளை தூய்மைப்படுத்தவும்.'],
    preventionStepsTe: ['ఏడాదికి రెండుసార్లు చెట్లను శుభ్రం చేయండి.', 'ఎరువు గుంతల్లో జీవ శిలీంధ్రం వేయండి.'],
    ipmSteps: [
      'Step 1: Physical hooking of beetles from crowns.',
      'Step 2: Sand + neem cake / naphthalene placement in innermost leaf axils.',
      'Step 3: Metarhizium anisopliae drench in compost breeding sites.',
      'Step 4: Rhinolure pheromone trapping across the plantation.'
    ],
    ipmStepsKn: ['ಹಂತ 1: ಕಬ್ಬಿಣದ ಕೊಂಡಿಯಿಂದ ದುಂಬಿ ತೆಗೆಯುವುದು', 'ಹಂತ 2: ಸುಳಿಯಲ್ಲಿ ಮರಳು-ಬೇವಿನ ಹಿಂಡಿ ಮಿಶ್ರಣ', 'ಹಂತ 3: ಮೆಟಾರೈಜಿಯಮ್ ಬಳಕೆ', 'ಹಂತ 4: ಮೋಹಕ ಬಲೆ'],
    ipmStepsTa: ['படி 1: கம்பி மூலம் வண்டு நீக்குதல்', 'படி 2: மணல்-வேப்பம்பிண்ணாக்கு இடுதல்', 'படி 3: எருக் குழியில் மெட்டாரைசியம்', 'படி 4: ரைனோலூர் பொறி'],
    ipmStepsTe: ['దశ 1: ఇనుప చువ్వతో పురుగులను తీయడం', 'దశ 2: మట్టల సందుల్లో ఇసుక మిశ్రమం', 'దశ 3: ఎరువు గుంతల్లో మెటారైజియం', 'దశ 4: లింగాకర్షక బుట్టలు'],
    safetyNotes: 'Use safety harnesses when climbing tall coconut palms. Do not drop heavy tools down near workers.',
    lookAlikes: [
      { name: 'Red Palm Weevil', difference: 'Red palm weevil grubs feed inside the trunk/stem producing gnawing sounds and brown viscous fluid from trunk cracks without V-shaped leaf cuts.' },
      { name: 'Lightning Injury', difference: 'Lightning scorches the entire crown uniformly black overnight without geometric leaf frond notches.' }
    ],
    whenToCallExpert: 'Call CPCRI or local horticulture department if more than 20% of palms show V-shaped fronds or if young seedlings start drooping.',
    whenToCallExpertKn: 'ಶೇಕಡಾ 20 ಕ್ಕಿಂತ ಹೆಚ್ಚು ಮರಗಳಲ್ಲಿ "V" ಆಕಾರದ ಎಲೆಗಳು ಕಂಡುಬಂದರೆ ತೋಟಗಾರಿಕಾ ಅಧಿಕಾರಿಯನ್ನು ಸಂಪರ್ಕಿಸಿ.',
    whenToCallExpertTa: '20% மேற்பட்ட மரங்களில் "V" வடிவ வெட்டுக்கள் இருந்தால் உடனடியாக தோட்டக்கலை அலுவலரை அணுகவும்.',
    whenToCallExpertTe: '20% పైగా చెట్లలో "V" ఆకారపు మట్టలు కనిపిస్తే వెంటనే ఉద్యానవన శాఖ అధికారిని సంప్రదించండి.',
    confidence: 'verified',
    sources: 'ICAR-Central Plantation Crops Research Institute (CPCRI) Kasaragod.',
    crops: [
      { cropName: 'Coconut (Kalpavriksha)', cropSlug: 'coconut', importance: 'primary' },
      { cropName: 'Areca nut (Betel Nut / Supari)', cropSlug: 'arecanut', importance: 'secondary' }
    ],
    symptomTags: [
      { tagSlug: 'part-leaf', weight: 3.0, isPrimary: true },
      { tagSlug: 'pattern-holes', weight: 3.0, isPrimary: true },
      { tagSlug: 'part-stem', weight: 2.0, isPrimary: false },
      { tagSlug: 'pattern-insects-visible', weight: 2.0, isPrimary: false },
      { tagSlug: 'spread-few-plants', weight: 1.0, isPrimary: false }
    ],
    images: [
      {
        path: '/problems/rhinoceros-beetle-coconut/v-shaped-cut-fronds.webp',
        caption: 'Geometric V-shaped wedge cuts on opened coconut fronds caused by Oryctes rhinoceros crown feeding.',
        captionKn: 'ತೆಂಗಿನ ಗರಿಗಳು "V" ಆಕಾರದಲ್ಲಿ ಕತ್ತರಿಸಲ್ಪಟ್ಟಿರುವ ಕಪ್ಪು ದುಂಬಿಯ ಬಾಧೆ.',
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
  // POMEGRANATE PROBLEMS
  // ==========================================
  {
    slug: 'bacterial-blight-pomegranate',
    name: 'Bacterial Blight of Pomegranate (Telya Disease)',
    nameKn: 'ದಾಳಿಂಬೆ ಎಣ್ಣೆ ಮಚ್ಚೆ ರೋಗ / ಬ್ಯಾಕ್ಟೀರಿಯಾ ಕರಕಲು (Telya)',
    nameTa: 'மாதுளை பாக்டீரியா கருகல் நோய் (எண்ணெய் புள்ளி)',
    nameTe: 'దానిమ్మ నూనె మచ్చ తెగులు (టెలియా)',
    scientificName: 'Xanthomonas axonopodis pv. punicae',
    type: 'bacterial',
    severity: 'critical',
    symptoms: 'Water-soaked oily dark spots with yellowish halo on leaves, turning necrotic and brown; dark brown to black elongated cankers on stems that crack and cause branches to break; fruit spots: Dark oily spots that crack deeply in a characteristic "L" or "Y" shaped star pattern, ruining the arils inside.',
    symptomsKn: 'ಎಲೆಗಳ ಮೇಲೆ ಎಣ್ಣೆ ಹನಿದಂತಹ ಕಪ್ಪು ಕಲೆಗಳು ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತವೆ. ಕಾಂಡದ ಮೇಲೆ ಕಪ್ಪು ಕಲೆಗಳು ಉಂಟಾಗಿ ಬಿರುಕು ಬಿಟ್ಟು ಕೊಂಬೆಗಳು ಮುರಿಯುತ್ತವೆ. ಹಣ್ಣಿನ ಮೇಲೆ ಎಣ್ಣೆ ಮಚ್ಚೆಗಳು ಮೂಡಿ "L" ಅಥವಾ "Y" ಆಕಾರದಲ್ಲಿ ಸೀಳುತ್ತವೆ (ತೆಲ್ಯಾ ರೋಗ).',
    symptomsTa: 'இலைகளில் எண்ணெய் போன்ற கருப்பு புள்ளிகள் தோன்றும். கிளைகளில் விரிசல் ஏற்பட்டு ஒடியும். பழங்களின் மேல் எண்ணெய் புள்ளிகள் தோன்றி "L" அல்லது "Y" வடிவில் வெடிக்கும்.',
    symptomsTe: 'ఆకులపై నూనె లాంటి నల్లటి మచ్చలు వస్తాయి. కొమ్మలపై పగుళ్లు వచ్చి విరిగిపోతాయి. కాయలపై నూనె మచ్చలు ఏర్పడి "L" లేదా "Y" ఆకారంలో పగులుతాయి ("టెలియా").',
    cause: 'Bacterium Xanthomonas axonopodis pv. punicae spreading in hot humid rainy conditions.',
    favourableConditions: 'Cloudy weather, intermittent monsoon rains, temperatures 25-35°C, high humidity (>75%), and contaminated pruning shears.',
    favourableHumidity: '>75%',
    favourableTemp: '25-35°C',
    favourableSeasons: ['Kharif'],
    affectedStages: ['Vegetative Growth', 'Flowering', 'Fruiting'],
    spreadPattern: 'Wind-blown rain splashes carry bacterial ooze from cankers; pruning shears spread it tree to tree.',
    culturalControl: 'Prune infected twigs 5-10 cm below lesion during dry spells and paste cuts with Bordeaux paste (10%). Disinfect secateurs with sodium hypochlorite (1%) between cuts. Burn pruned twigs outside the orchard immediately.',
    culturalControlKn: 'ಒಣ ಹವೆಯಿರುವಾಗ ರೋಗಪೀಡಿತ ಕೊಂಬೆಗಳನ್ನು ಕತ್ತರಿಸಿ ಬೋರ್ಡೋ ಪೇಸ್ಟ್ ಹಚ್ಚಿ. ಕತ್ತರಿಸುವ ಕತ್ತರಿಯನ್ನು ಕ್ರಿಮಿನಾಶಕ ದ್ರಾವಣದಲ್ಲಿ ಅದ್ದಿ ಬಳಸಿ. ಕತ್ತರಿಸಿದ ರೆಂಬೆಗಳನ್ನು ತಕ್ಷಣ ಸುಟ್ಟುಹಾಕಿ.',
    culturalControlTa: 'காய்ந்த காலநிலையில் கவாத்து செய்து போர்டோ பசை பூசவும். கவாத்து கத்தியை கிருமிநாசினி கொண்டு சுத்தம் செய்யவும். கழிவுகளை எரிக்கவும்.',
    culturalControlTe: 'పొడి వాతావరణంలో కొమ్మలను కత్తిరించి బోర్డో పేస్ట్ పూయండి. కత్తిరింపు కత్తులను క్రిమిసంహారకంతో శుభ్రం చేయండి. వ్యర్థాలను కాల్చండి.',
    biologicalControl: 'Foliar spray of antagonistic bacteria Bacillus subtilis or Pseudomonas fluorescens formulations.',
    biologicalControlKn: 'ಬ್ಯಾಸಿಲಸ್ ಸಬ್ಟಿಲಿಸ್ ಅಥವಾ ಸ್ಯೂಡೋಮೊನಾಸ್ ಜೈವಿಕ ದ್ರಾವಣ ಸಿಂಪಡಿಸಿ.',
    biologicalControlTa: 'பேசிலஸ் சப்டிலிஸ் அல்லது சூடோமோனாஸ் தெளிக்கவும்.',
    biologicalControlTe: 'బాసిల్లస్ సబ్టిలిస్ లేదా సూడోమోనాస్ పిచికారీ చేయండి.',
    organicControl: 'Foliar spray of 1% neutral Bordeaux mixture or Copper Hydroxide (organic formulation) before monsoon showers.',
    organicControlKn: 'ಮುಂಗಾರು ಮಳೆಗೆ ಮುನ್ನ 1% ಬೋರ್ಡೋ ದ್ರಾವಣ ಮುಂಜಾಗ್ರತೆಯಾಗಿ ಸಿಂಪಡಿಸಿ.',
    organicControlTa: 'மழைக்கு முன் 1% போர்டோ கலவை தெளிக்கவும்.',
    organicControlTe: 'వర్షాలకు ముందే 1% బోర్డో మిశ్రమం పిచికారీ చేయండి.',
    chemicalControl: 'Foliar spray of Copper Oxychloride or Copper Hydroxide combined with Streptocycline or Kasugamycin, alternating with 2-bromo-2-nitropropane-1,3-diol (Bronopol). Note: Strictly observe registered container label dosage and safety intervals; consult local KVK.',
    chemicalControlKn: 'ತಾಮ್ರದ ಆಕ್ಸಿಕ್ಲೋರೈಡ್ ಮತ್ತು ಸ್ಟ್ರೆಪ್ಟೊಸೈಕ್ಲಿನ್ ಅಥವಾ ಬ್ರೊನೊಪೋಲ್ ಸಿಂಪಡಿಸಿ. ಲೇಬಲ್ ಸೂಚನೆ ತಪ್ಪದೆ ಪಾಲಿಸಿ.',
    chemicalControlTa: 'காப்பர் ஆக்ஸிகுளோரைடு மற்றும் ஸ்ட்ரೆப்டோமைசின் அல்லது புரோனோபோல் தெளிக்கவும்.',
    chemicalControlTe: 'కాపర్ ఆక్సిక్లోరైడ్ మరియు స్ట్రెప్టోమైసిన్ లేదా బ్రోనోపోల్ పిచికారీ చేయండి.',
    preventionSteps: ['Always sterilize secateurs between trees.', 'Adopt clean certified tissue-culture planting material.', 'Avoid overhead sprinkler watering.'],
    preventionStepsKn: ['ಕತ್ತರಿಯನ್ನು ಸೋಂಕುರಹಿತಗೊಳಿಸಿ.', 'ಪ್ರಮಾಣಿತ ಸಸಿಗಳನ್ನು ಮಾತ್ರ ಬೆಳೆಯಿರಿ.'],
    preventionStepsTa: ['கவாத்து கருவிகளை தூய்மைப்படுத்தவும்.', 'சான்றளிக்கப்பட்ட கன்றுகளை நடவும்.'],
    preventionStepsTe: ['కత్తులను శానిటైజ్ చేయండి.', 'ధృవీకరించిన మొక్కలను వాడండి.'],
    ipmSteps: [
      'Step 1: Strict tool sterilization with 1% bleach between bushes.',
      'Step 2: Dry-season sanitation pruning and paste sealing.',
      'Step 3: Pre-monsoon prophylactic copper bactericide spray.',
      'Step 4: Alternate bactericide sprays during rainy flushes.'
    ],
    ipmStepsKn: ['ಹಂತ 1: ಕತ್ತರಿ ನೈರ್ಮಲ್ಯ', 'ಹಂತ 2: ಒಣ ಕಾಲದಲ್ಲಿ ಕವಲೊಡೆಯುವುದು', 'ಹಂತ 3: ಮುಂಗಾರು ಪೂರ್ವ ತಾಮ್ರ ಸಿಂಪರಣೆ', 'ಹಂತ 4: ಸಕಾಲಿಕ ಬ್ಯಾಕ್ಟೀರಿಯಾನಾಶಕ'],
    ipmStepsTa: ['படி 1: கத்தி தூய்மை', 'படி 2: உலர் பருவ கவாத்து', 'படி 3: மழைக்கு முன் காப்பர் தெளிப்பு', 'படி 4: பாக்டீரியா மருந்து தெளிப்பு'],
    ipmStepsTe: ['దశ 1: కత్తుల శుభ్రత', 'దశ 2: పొడి కాలంలో కత్తిరింపు', 'దశ 3: వర్షాలకు ముందు కాపర్ స్ప్రే', 'దశ 4: సకాలంలో రసాయన పిచికారీ'],
    safetyNotes: 'Streptocycline must not be overused to prevent antibiotic resistance; wear goggles during copper applications.',
    lookAlikes: [
      { name: 'Pomegranate Anthracnose', difference: 'Anthracnose causes circular brown sunken spots without oily water-soaked margins or characteristic L/Y fruit cracking.' },
      { name: 'Cercospora Fruit Spot', difference: 'Cercospora forms tiny red-brown spots without fruit cracking or stem black arm.' }
    ],
    whenToCallExpert: 'Call National Research Centre on Pomegranate (NRCP) or local KVK immediately if oily spots crack fruit rinds; Telya can cause 80-100% crop loss.',
    whenToCallExpertKn: 'ದಾಳಿಂಬೆ ಹಣ್ಣುಗಳು ಎಣ್ಣೆ ಮಚ್ಚೆಯಿಂದ ಸೀಳಲು ಪ್ರಾರಂಭಿಸಿದರೆ ತಕ್ಷಣ ಕೃಷಿ ಅಧಿಕಾರಿಯನ್ನು ತೋಟಕ್ಕೆ ಕರೆಯಿಸಿ.',
    whenToCallExpertTa: 'பழங்கள் வெடிக்கத் தொடங்கினால் உடனடியாக தேசிய மாதுளை ஆராய்ச்சி மையத்தை அணுகவும்.',
    whenToCallExpertTe: 'కాయలపై నూనె మచ్చలు వచ్చి పగులుతుంటే వెంటనే జాతీయ దానిమ్మ పరిశోధన కేంద్రం నిపుణులను సంప్రదించండి.',
    confidence: 'verified',
    sources: 'ICAR-National Research Centre on Pomegranate (NRCP) Solapur, UAS Bagalkot.',
    crops: [
      { cropName: 'Pomegranate', cropSlug: 'pomegranate', importance: 'primary' }
    ],
    symptomTags: [
      { tagSlug: 'part-fruit-grain', weight: 3.0, isPrimary: true },
      { tagSlug: 'part-stem', weight: 2.5, isPrimary: true },
      { tagSlug: 'part-leaf', weight: 2.0, isPrimary: false },
      { tagSlug: 'pattern-spots', weight: 2.5, isPrimary: true },
      { tagSlug: 'colour-black', weight: 2.0, isPrimary: false }
    ],
    images: [
      {
        path: '/problems/bacterial-blight-pomegranate/y-crack-oily-fruit.webp',
        caption: 'Dark oily necrotic lesion with characteristic deep Y-shaped rind crack on pomegranate fruit caused by Xanthomonas.',
        captionKn: 'ದಾಳಿಂಬೆ ಹಣ್ಣಿನ ಮೇಲೆ ಎಣ್ಣೆ ಮಚ್ಚೆ ರೋಗದಿಂದ ಉಂಟಾದ "Y" ಆಕಾರದ ಬಿರುಕು.',
        kind: 'symptom_closeup',
        source: 'Wikimedia Commons',
        author: 'NRCP Solapur',
        licence: 'CC BY-SA 4.0',
        attribution: 'ICAR-NRCP / Wikimedia Commons',
        isPrimary: true
      }
    ]
  }
];
