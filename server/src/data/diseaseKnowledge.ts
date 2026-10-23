export interface DiseaseData {
  id: string;
  name: string;
  nameKannada: string;
  nameTamil: string;
  nameTelugu: string;
  affectedCrops: string[];
  symptoms: string;
  symptomsKn: string;
  symptomsTa: string;
  symptomsTe: string;
  conditions: string;
  prevention: string;
  preventionKn: string;
  preventionTa: string;
  preventionTe: string;
  ipmSteps: string[];
  ipmStepsKn: string[];
  ipmStepsTa: string[];
  ipmStepsTe: string[];
  expertAdvice: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  imageUrl: string;
}

export const DISEASES_DATA: DiseaseData[] = [
  {
    id: 'disease-stem-borer',
    name: 'Stem Borer (Yellow Stem Borer)',
    nameKannada: 'ಕಾಂಡ ಕೊರೆಯುವ ಹುಳು (Stem Borer)',
    nameTamil: 'தண்டு துளைப்பான் (Stem Borer)',
    nameTelugu: 'కాండం తొలుచు పురుగు (Stem Borer)',
    affectedCrops: ['Paddy (Rice)', 'Maize (Corn)', 'Sugarcane'],
    symptoms: 'Larvae bore into main stems causing "Dead Hearts" (drying of central shoot) in vegetative stage and empty "White Ears" (chaffy erect white panicles) at heading.',
    symptomsKn: 'ಹುಳುಗಳು ಕಾಂಡವನ್ನು ಕೊರೆದು ತಿನ್ನುವುದರಿಂದ ಸುಳಿ ಒಣಗುತ್ತದೆ ("ಡೆಡ್ ಹಾರ್ಟ್") ಮತ್ತು ತೆನೆ ಬರುವ ಹಂತದಲ್ಲಿ ಬಿಳಿ ಜೊಳ್ಳು ತೆನೆಗಳು ಉಂಟಾಗುತ್ತವೆ.',
    symptomsTa: 'புழுக்கள் தண்டினுள் நுழைந்து திசுக்களை உண்பதால் குருத்து காய்ந்து விடும் (Dead Heart). கதிர் வரும் பருவம் வெண்கதிர்களாக (White Ears) மாறும்.',
    symptomsTe: 'లార్వాలు కాండం లోపలికి చొచ్చుకుపోయి తినడం వల్ల ఎండిన సుడులు ("డెడ్ హార్ట్స్") మరియు వెన్ను దశలో తెల్ల కంకులు ఏర్పడతాయి.',
    conditions: 'High relative humidity (>85%), warm temperatures (25-30°C), cloudy weather and excessive uncalibrated nitrogen/urea fertilizer.',
    prevention: 'Use resistant crop varieties, balance nitrogen application with split doses of potash, clip seedling tips before transplanting to destroy egg masses.',
    preventionKn: 'ರೋಗ ನಿರೋಧಕ ತಳಿಗಳನ್ನು ಬಳಸಿ, ಯೂರಿಯಾವನ್ನು ಮಿತವಾಗಿ ನೀಡಿ, ನಾಟಿ ಮಾಡುವ ಮುನ್ನ ಸಸಿಗಳ ತುದಿಯನ್ನು ಚಿವುಟಿ ಮೊಟ್ಟೆಗಳನ್ನು ನಾಶಮಾಡಿ.',
    preventionTa: 'எதிர்ப்புத் திறன் கொண்ட ரகங்களை நடவும், தழைச்சத்தை சமச்சீராக இடவும், நடவின் போது நாற்றின் நுனியை கிள்ளி முட்டைக்குவியல்களை அழிக்கவும்.',
    preventionTe: 'తెగులును తట్టుకునే రకాలను ఎంచుకోండి, యూరియాను మితంగా వాడండి, నాటే ముందు నారు చివర్లను తుంచి గుడ్ల సముదాయాలను నాశనం చేయండి.',
    ipmSteps: [
      'Install 5 pheromone traps per acre at 30 days after transplanting for adult moth monitoring.',
      'Release Trichogramma japonicum egg parasitoid cards (40,000 eggs/acre) 3 times at weekly intervals.',
      'Perch predatory bird stands (T-shaped bamboo sticks, 10/acre) to encourage insect-eating birds.',
      'Clip and burn leaf tips where adult female moths deposit egg masses covered in buff-colored hairs.',
      'If ETL crossed (>5% dead hearts or 1 egg mass/sq.m), apply Chlorantraniliprole 0.4% G (4 kg/acre) or spray Cartap Hydrochloride 50% SP (2g/L).'
    ],
    ipmStepsKn: [
      'ಎಕರೆಗೆ 5 ಮೋಹಕ ಬಲೆಗಳನ್ನು ಅಳವಡಿಸಿ ಪತಂಗಗಳ ಚಲನವಲನವನ್ನು ಗಮನಿಸಿ.',
      'ಟ್ರೈಕೋಗ್ರಾಮಾ ಪರಾವಲಂಬಿ ಕಾರ್ಡ್‌ಗಳನ್ನು ವಾರಕ್ಕೊಮ್ಮೆ ಗದ್ದೆಯಲ್ಲಿ ಕಟ್ಟಿ.',
      'ಹಕ್ಕಿಗಳು ಕುಳಿತು ಹುಳು ತಿನ್ನಲು ಎಕರೆಗೆ 10 "T" ಆಕಾರದ ಬಿದಿರು ಕಡ್ಡಿಗಳನ್ನು ನೆಡಿ.',
      'ಸಸಿಗಳ ತುದಿಯಲ್ಲಿರುವ ಮೊಟ್ಟೆಯ ಗುಂಪುಗಳನ್ನು ಕಿತ್ತು ನಾಶಪಡಿಸಿ.'
    ],
    ipmStepsTa: [
      'ஏக்கருக்கு 5 இனக்கவர்ச்சி பொறி அமைத்து அந்திப்பூச்சிகளை கண்காணிக்கவும்.',
      'டிரைக்கோகிரம்மா ஒட்டுண்ணி அட்டைகளை வாரம் ஒருமுறை வயலில் கட்டவும்.',
      'பறவைகள் அமர்ந்து புழுக்களை தின்ன ஏக்கருக்கு 10 "T" வடிவ குச்சிகளை நடவும்.',
      'நாற்றின் நுனியில் உள்ள முட்டைக் குவியல்களை கிள்ளி அழிக்கவும்.'
    ],
    ipmStepsTe: [
      'ఎకరానికి 5 లింగాకర్షక బుట్టలను అమర్చి పురుగుల ఉధృతిని గమనించండి.',
      'ట్రైకోగ్రామా కార్డులను వారానికి ఒకసారి పొలంలో అమర్చండి.',
      'పక్షులు వాలి పురుగులను తినడానికి ఎకరానికి 10 "T" ఆకారపు కర్రలను పాతిపెట్టండి.',
      'నారు చివర్లలో ఉన్న గుడ్లను తుంచి నాశనం చేయండి.'
    ],
    expertAdvice: 'Always inspect the bottom 10 cm of the rice tiller. Avoid spraying broad-spectrum pyrethroid insecticides which trigger secondary spider mite and brown planthopper outbreaks.',
    severity: 'high',
    imageUrl: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'disease-blast-magnaporthe',
    name: 'Blast Disease (Magnaporthe oryzae)',
    nameKannada: 'ಬೆಂಕಿ ರೋಗ (Blast Disease)',
    nameTamil: 'குலை நோய் (Blast Disease)',
    nameTelugu: 'అగ్గి తెగులు (Blast Disease)',
    affectedCrops: ['Paddy (Rice)', 'Ragi (Finger Millet)'],
    symptoms: 'Diamond or spindle-shaped lesions with ash-grey center and brown-red margin on leaves (Leaf Blast). Black rotting at the neck node of panicles causing breaking and drooping (Neck Blast).',
    symptomsKn: 'ಎಲೆಗಳ ಮೇಲೆ ಕಂದು ಅಂಚಿನ ಬೂದಿ ಬಣ್ಣದ ಚುಕ್ಕೆಗಳು ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತವೆ. ತೆನೆಯ ಕುತ್ತಿಗೆ ಕಪ್ಪಾಗಿ ಮುರಿದು ಬೀಳುತ್ತದೆ (ಕುತ್ತಿಗೆ ಬೆಂಕಿ ರೋಗ).',
    symptomsTa: 'இலைகளில் கண் போன்ற வடிவத்தில் மையத்தில் சாம்பல் நிறமும் விளிம்பில் பழுப்பு நிறமும் கொண்ட புள்ளிகள் தோன்றும். கதிர் கழுத்துப் பகுதி கருப்பாகி ஒடிந்து தொங்கும்.',
    symptomsTe: 'ఆకులపై కంటి ఆకారంలో బూడిద రంగు మధ్యభాగం, గోధుమ రంగు అంచులు గల మచ్చలు ఏర్పడతాయి. వెన్ను మెడ భాగం నల్లగా మారి విరిగిపోతుంది.',
    conditions: 'Continuous nighttime temperatures below 22°C with morning dew, high relative humidity (>90%), intermittent rainy spells and excessive nitrogen fertilizer.',
    prevention: 'Treat seeds with Tricyclazole 75 WP or Pseudomonas fluorescens (10g/kg). Maintain proper plant spacing and avoid excessive urea applications during cloudy periods.',
    preventionKn: 'ಬೀಜೋಪಚಾರ ಮಾಡಿ. ಮೋಡ ಕವಿದ ವಾತಾವರಣದಲ್ಲಿ ಯೂರಿಯಾ ಗೊಬ್ಬರ ಕೊಡುವುದನ್ನು ತಕ್ಷಣ ನಿಲ್ಲಿಸಿ.',
    preventionTa: 'விதை நேர்த்தி செய்யவும். மேகமூட்டமான நாட்களில் யூரியா உரம் இடுவதை முற்றிலும் தவிர்க்கவும்.',
    preventionTe: 'విత్తన శుద్ధి చేయండి. మబ్బు వాతావరణంలో యూరియా వాడకాన్ని పూర్తిగా నిలిపివేయండి.',
    ipmSteps: [
      'Burn severely infected crop stubbles after harvest.',
      'Apply bio-agent Pseudomonas fluorescens (5g/L) as protective foliar spray.',
      'Split nitrogen doses into 3-4 applications instead of bulk early dumping.',
      'If leaf blast lesions appear on >5% leaves, spray Tricyclazole 75% WP (0.6g/L) or Isoprothiolane 40% EC (1.5ml/L).'
    ],
    ipmStepsKn: [
      'ಸೋಂಕಿತ ಗದ್ದೆಯ ಕಸ ಕಡ್ಡಿಗಳನ್ನು ಸುಟ್ಟು ಹಾಕಿ.',
      'ಸ್ಯೂಡೋಮೊನಾಸ್ ಜೈವಿಕ ದ್ರಾವಣವನ್ನು ಸಿಂಪಡಿಸಿ.',
      'ಯೂರಿಯಾ ಗೊಬ್ಬರವನ್ನು ಒಂದೇ ಬಾರಿಗೆ ಹಾಕದೆ ಹಂತ ಹಂತವಾಗಿ ನೀಡಿ.',
      'ರೋಗ ಲಕ್ಷಣ ಕಂಡಾಗ ಟ್ರೈಸೈಕ್ಲಾಜೋಲ್ ಸಿಂಪಡಿಸಿ.'
    ],
    ipmStepsTa: [
      'பாதிக்கப்பட்ட பயிர் எச்சங்களை எரித்து அழிக்கவும்.',
      'சூடோமோனாஸ் கரைசலை பயிரின் மேல் தெளிக்கவும்.',
      'தழைச்சத்தை பிரித்து 3-4 தவணைகளாக இடவும்.',
      'நோய் தீவிரம் அடைந்தால் டிரைசைக்ளசோல் தெளிக்கவும்.'
    ],
    ipmStepsTe: [
      'తెగులు సోకిన పంట వ్యర్థాలను కాల్చివేయండి.',
      'సూడోమోనాస్ ద్రవణాన్ని పిచికారీ చేయండి.',
      'యూరియాను ఒకేసారి వేయకుండా విడతల వారీగా వేయండి.',
      'తీవ్రత ఉంటే ట్రైసైక్లాజోల్ పిచికారీ చేయండి.'
    ],
    expertAdvice: 'Neck blast is irreversible once the fungus girdles the panicle node. Preventive spraying immediately upon panicle emergence is mandatory in endemic taluks.',
    severity: 'critical',
    imageUrl: 'https://images.unsplash.com/photo-1599818817281-cf1b4142f155?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'disease-fall-armyworm',
    name: 'Fall Armyworm (Spodoptera frugiperda)',
    nameKannada: 'ಮೆಕ್ಕೆಜೋಳದ ಲದ್ದಿ ಹುಳು (Fall Armyworm)',
    nameTamil: 'மக்காச்சோள படைப்புழு (Fall Armyworm)',
    nameTelugu: 'మొక్కజొన్న కత్తెర పురుగు (Fall Armyworm)',
    affectedCrops: ['Maize (Corn)', 'Sorghum', 'Sugarcane'],
    symptoms: 'Pinholes and ragged windows in young leaves. Deep burrowing inside central whorl with heavy accumulation of coarse yellowish sawdust-like excreta (frass).',
    symptomsKn: 'ಎಳೆ ಎಲೆಗಳಲ್ಲಿ ರಂಧ್ರಗಳು ಮತ್ತು ಹರಿದ ಗುರುತುಗಳು. ಸುಳಿಯೊಳಗೆ ರಂಧ್ರ ಕೊರೆದು ಮರದ ಪುಡಿಯಂತಹ ಮಲವನ್ನು ಶೇಖರಿಸುತ್ತದೆ.',
    symptomsTa: 'இளம் இலைகளில் சிறு துளைகள் மற்றும் கிழிந்த விளிம்புகள் தோன்றும். சுருள் இலையினுள் மரத்தூள் போன்ற கழிவுகள் தேங்கி புழு உள்ளே மறைந்திருக்கும்.',
    symptomsTe: 'లేత ఆకులపై చిన్న చిన్న రంధ్రాలు పడతాయి. మొక్క సుడిలో దూరుతూ రంపపు పొట్టు లాంటి మలాన్ని విసర్జిస్తుంది.',
    conditions: 'Dry and warm spells followed by light showers; monoculture maize plantings with staggered sowing dates.',
    prevention: 'Synchronized community sowing within 10-15 days. Deep summer ploughing to expose pupae. Intercropping with legumes (Cowpea/Soybean 2:1 ratio).',
    preventionKn: 'ಊರಿನ ಎಲ್ಲಾ ರೈತರು ಒಟ್ಟಿಗೆ 10-15 ದಿನಗಳಲ್ಲಿ ಬಿತ್ತನೆ ಮುಗಿಸಿ. ಅಲಸಂದಿ ಅಥವಾ ಸೋಯಾಬೀನ್ ಮಿಶ್ರಬೆಳೆ ಬೆಳೆಯಿರಿ.',
    preventionTa: 'ஒரே நேரத்தில் 10-15 நாட்களுக்குள் விதைப்பை முடிக்கவும். தட்டைப்பயறு அல்லது சோயாபீன் ஊடுபயிராக பயிரிடவும்.',
    preventionTe: 'ప్రాంతంలోని రైతులంతా ఒకేసారి 10-15 రోజుల్లో విత్తడం పూర్తి చేయండి. అలసంద లేదా సోయాను అంతరపంటగా వేయండి.',
    ipmSteps: [
      'Drop a pinch of dry sand mixed with wood ash or neem cake directly into whorls.',
      'Deploy 4 FAW pheromone traps per acre at 10 days after germination.',
      'Apply Metarhizium rileyi or Beauveria bassiana bio-fungal spray (5g/L) during evening hours.',
      'If ETL exceeded (>10% damaged whorls in first 30 days), spray Emamectin Benzoate 5% SG (0.4g/L) or Spinetoram 11.7% SC (0.5ml/L) directed directly into the whorl cup.'
    ],
    ipmStepsKn: [
      'ಮರಳು ಮತ್ತು ಬೇವಿನ ಹಿಂಡಿ ಮಿಶ್ರಣವನ್ನು ಸುಳಿಯೊಳಗೆ ಹಾಕಿ.',
      'ಎಕರೆಗೆ 4 ಮೋಹಕ ಬಲೆಗಳನ್ನು ಅಳವಡಿಸಿ.',
      'ಬೆವೋರಿಯಾ ಜೈವಿಕ ಕೀಟನಾಶಕವನ್ನು ಸಂಜೆ ವೇಳೆಯಲ್ಲಿ ಸಿಂಪಡಿಸಿ.',
      'ಹಾನಿ ಹೆಚ್ಚಿದ್ದರೆ ಇಮಾಮೆಕ್ಟಿನ್ ಬೆಂಜೊಯೆಟ್ ಅನ್ನು ಸುಳಿಯೊಳಗೆ ಬೀಳುವಂತೆ ಸಿಂಪಡಿಸಿ.'
    ],
    ipmStepsTa: [
      'சாம்பல் அல்லது வேப்பம்பிண்ணாக்கு கலந்த மணலை சுருள் இலையில் போடவும்.',
      'ஏக்கருக்கு 4 இனக்கவர்ச்சி பொறி வைக்கவும்.',
      'பவேரியா பூஞ்சாணத்தை மாலையில் தெளிக்கவும்.',
      'தாக்குதல் அதிகமானால் எமாமெக்டின் பென்சோயேட் மருந்தை சுருளினுள் நேராக படுமாறு தெளிக்கவும்.'
    ],
    ipmStepsTe: [
      'ఇసుక మరియు వేప పిండి మిశ్రమాన్ని సుడిలో వేయండి.',
      'ఎకరానికి 4 లింగాకర్షక బుట్టలు పెట్టండి.',
      'బవేరియా ద్రావణాన్ని సాయంత్రం వేళ పిచికారీ చేయండి.',
      'ఉధృతి ఎక్కువగా ఉంటే ఇమామెక్టిన్ బెంజోయేట్ మందును నేరుగా సుడిలో పడేలా పిచికారీ చేయండి.'
    ],
    expertAdvice: 'Spray nozzles must be directed straight downwards into the funnel/whorl cavity of each maize plant, not sprayed over the top canopy, to reach the hidden larvae.',
    severity: 'critical',
    imageUrl: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'disease-brown-planthopper',
    name: 'Brown Planthopper (Nilaparvata lugens)',
    nameKannada: 'ಕಂದು ಜಿಗಿ ಹುಳು (Brown Planthopper - BPH)',
    nameTamil: 'பழுப்பு தத்துப்பூச்சி (BPH)',
    nameTelugu: 'సుడి దోమ (Brown Planthopper)',
    affectedCrops: ['Paddy (Rice)'],
    symptoms: 'Nymphs and adults congregate in large numbers at stem bases near water level, sucking sap. Affected plants turn yellow, dry out and collapse in circular burnt patches called "Hopper Burn".',
    symptomsKn: 'ಹುಳುಗಳು ನೀರಿನ ಮೇಲ್ಮೈಯಲ್ಲಿ ಕಾಂಡದ ಬುಡಕ್ಕೆ ಅಂಟಿಕೊಂಡು ರಸ ಹೀರುತ್ತವೆ. ಗದ್ದೆಯಲ್ಲಿ ವೃತ್ತಾಕಾರವಾಗಿ ಪೈರು ಸುಟ್ಟುಹೋದಂತೆ ಒಣಗುತ್ತದೆ ("ಹಾಪ್ಪರ್ ಬರ್ನ್").',
    symptomsTa: 'பூச்சிகள் நீர் மட்டத்திற்கு மேல் தண்டுப் பகுதியில் கூட்டமாக அமர்ந்து சாற்றை உறிஞ்சும். வட்ட வடிவில் பயிர் தீய்ந்து காய்ந்து போகும் (Hopper Burn).',
    symptomsTe: 'పురుగులు నీటి మట్టం పైన కాండం మొదళ్ల వద్ద గుంపులుగా చేరి రసం పీలుస్తాయి. పొలంలో గుండ్రటి ప్రదేశాల్లో పైరు కాలిపోయినట్లు ఎండిపోతుంది ("సుడి తెగులు").',
    conditions: 'Dense canopy planting with stagnant deep water, closed microclimate, high humidity (>90%) and indiscriminate use of synthetic pyrethroids.',
    prevention: 'Provide "alleyways" (leaving 30 cm gap after every 2 meters of planting) for aeration and sunlight. Drain field water intermittently.',
    preventionKn: 'ಗದ್ದೆಯಲ್ಲಿ ಗಾಳಿ ಬೆಳಕು ಆಡಲು ಪ್ರತಿ 2 ಮೀಟರ್‌ಗೆ 30 ಸೆಂ.ಮೀ ಕಾಲುದಾರಿ (ಅಲ್ಲಿವೇ) ಬಿಡಿ. ನೀರನ್ನು ಕಾಲಕಾಲಕ್ಕೆ ಬಸಿದು ಒಣಗಿಸಿ.',
    preventionTa: 'காற்றோட்டத்திற்கு 2 மீட்டருக்கு ஒரு முறை 30 செ.மீ இடைவெளி (பாதை) விடவும். அவ்வப்போது நீரை வடித்து காயவிடவும்.',
    preventionTe: 'గాలి, వెలుతురు ప్రసారానికి ప్రతి 2 మీటర్లకు 30 సెం.మీ సందులు (బాటలు) వదలండి. నీటిని తీసివేసి నేలను ఆరనివ్వండి.',
    ipmSteps: [
      'Form "Alleyways" of 30 cm width every 8-10 rows during transplanting.',
      'Alternate Wetting and Drying (AWD) — drain water for 3-4 days to expose base of tillers.',
      'Protect natural spiders (Lycosa pseudoannulata) and mirid bugs which devour 10-15 planthoppers per day.',
      'If ETL exceeded (10-15 hoppers/hill), spray Pymetrozine 50% WG (0.6g/L) or Triflumezopyrim 10% SC (0.5ml/L) targeted specifically at plant bases.'
    ],
    ipmStepsKn: [
      'ನಾಟಿ ಮಾಡುವಾಗ ಪ್ರತಿ 8-10 ಸಾಲುಗಳಿಗೆ ಕಾಲುದಾರಿ ಬಿಡಿ.',
      'ಗದ್ದೆಯ ನೀರನ್ನು 3-4 ದಿನ ಬಸಿದು ಬುಡ ಒಣಗಲು ಬಿಡಿ.',
      'ನೈಸರ್ಗಿಕ ಜೇಡಗಳನ್ನು ರಕ್ಷಿಸಿ.',
      'ಹುಳುಗಳ ಸಂಖ್ಯೆ ಹೆಚ್ಚಿದ್ದರೆ ಬುಡಕ್ಕೆ ತಾಗುವಂತೆ ಪೈಮೆಟ್ರೋಜಿನ್ ಸಿಂಪಡಿಸಿ.'
    ],
    ipmStepsTa: [
      'நடவின் போது 8-10 வரிகளுக்கு ஒரு பாதை விடவும்.',
      'நீரை 3-4 நாட்கள் வடித்து தண்டுப்பகுதியை காயவிடவும்.',
      'வயலில் உள்ள சிலந்திகளை பாதுகாக்கவும்.',
      'பூச்சி அதிகரித்தால் தண்டின் அடியில் படுமாறு பைமெட்ரோசின் மருந்து தெளிக்கவும்.'
    ],
    ipmStepsTe: [
      'నాట్లు వేసేటప్పుడు ప్రతి 8-10 వరుసలకు ఒక బాటను వదలండి.',
      'పొలంలోని నీటిని 3-4 రోజులు తీసివేసి మొదళ్లను ఆరనివ్వండి.',
      'సహజ సాలీళ్లను కాపాడుకోండి.',
      'పురుగు ఉధృతి ఉంటే మొదళ్లకు తగిలేలా పైమెట్రోజిన్ మందు పిచికారీ చేయండి.'
    ],
    expertAdvice: 'Always part the rice hill to observe the base stems before spraying; spraying the upper foliage is completely useless against BPH which lives exclusively at the water-stem waterline.',
    severity: 'critical',
    imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'disease-early-blight-tomato',
    name: 'Early Blight of Tomato (Alternaria solani)',
    nameKannada: 'ಟೊಮೆಟೊ ಎಲೆ ಕರಕಲು ರೋಗ (Early Blight)',
    nameTamil: 'தக்காளி முன்கூட்டிய கருகல் நோய் (Early Blight)',
    nameTelugu: 'టమోటా ముందస్తు మచ్చ తెగులు (Early Blight)',
    affectedCrops: ['Tomato', 'Chilli', 'Potato'],
    symptoms: 'Concentric dark brown rings resembling a "target board" or bullseye on older lower leaves. Surrounding leaf tissue turns yellow and falls off prematurely.',
    symptomsKn: 'ಕೆಳಗಿನ ಹಳೆಯ ಎಲೆಗಳ ಮೇಲೆ ಗುರಿ ಹಲಗೆಯಂತಹ (ಟಾರ್ಗೆಟ್ ಬೋರ್ಡ್) ವೃತ್ತಾಕಾರದ ಕಂದು ಗೆರೆಗಳ ಚುಕ್ಕೆಗಳು ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತವೆ. ನಂತರ ಎಲೆ ಹಳದಿಯಾಗಿ ಉದುರುತ್ತದೆ.',
    symptomsTa: 'கீழ் இலைகளில் இலக்கு பலகை (Target board) போன்ற வட்ட வளைய புள்ளிகள் தோன்றும். இலைகள் மஞ்சள் நிறமாகி உதிர்ந்து விடும்.',
    symptomsTe: 'కింది ముదిరిన ఆకులపై వలయాల వంటి గోధుమ రంగు మచ్చలు ఏర్పడతాయి. ఆకులు పసుపు రంగులోకి మారి రాలిపోతాయి.',
    conditions: 'Warm temperatures (24-29°C) with intermittent rain and dew; stressed crops suffering from nitrogen or potassium deficiency.',
    prevention: 'Prune lower leaves touching wet soil. Mulch beds with plastic or straw. Rotate with non-solanaceous crops.',
    preventionKn: 'ಮಣ್ಣಿಗೆ ತಾಗುವ ಕೆಳಗಿನ ಎಲೆಗಳನ್ನು ಕತ್ತರಿಸಿ. ಮಣ್ಣಿನ ಮೇಲೆ ಹೊದಿಕೆ (ಮಲ್ಚಿಂಗ್) ಮಾಡಿ. ಬೆಳೆ ಪರಿವರ್ತನೆ ಮಾಡಿ.',
    preventionTa: 'மண்ணில் படும் அடி இலைகளை கவாத்து செய்யவும். நிலப்போர்வை அமைக்கவும். பயிர் சுழற்சி முறை பின்பற்றவும்.',
    preventionTe: 'నేలకు తగిలే కింది ఆకులను కత్తిరించండి. మల్చింగ్ చేయండి. పంట మార్పిడి పద్ధతిని పాటించండి.',
    ipmSteps: [
      'Remove lower infected leaves and burn outside the field.',
      'Ensure proper bamboo trellising so plant foliage stays off wet soil.',
      'Spray Mancozeb 75% WP (2.5g/L) as preventive spray at first symptom.',
      'For severe spread, apply Azoxystrobin + Difenoconazole (1ml/L).'
    ],
    ipmStepsKn: [
      'ರೋಗಪೀಡಿತ ಕೆಳಗಿನ ಎಲೆಗಳನ್ನು ಕಿತ್ತು ಸುಟ್ಟುಹಾಕಿ.',
      'ಗಿಡಗಳಿಗೆ ಕಡ್ಡಿ ಕಟ್ಟಿ ಮಣ್ಣಿನಿಂದ ಮೇಲಕ್ಕೆ ನಿಲ್ಲಿಸಿ.',
      'ಲಕ್ಷಣ ಕಂಡ ತಕ್ಷಣ ಮ್ಯಾಂಕೋಜೆಬ್ ಸಿಂಪಡಿಸಿ.'
    ],
    ipmStepsTa: [
      'பாதிக்கப்பட்ட அடி இலைகளை அகற்றி எரிக்கவும்.',
      'செடிகளை குச்சி நட்டு மேலே கட்டவும்.',
      'ஆரம்பத்தில் மாங்கோசெப் தெளிக்கவும்.'
    ],
    ipmStepsTe: [
      'తెగులు సోకిన కింది ఆకులను తుంచి కాల్చివేయండి.',
      'కర్రలు కట్టి మొక్కలను పైకి లేపండి.',
      'మొదట్లోనే మ్యాంకోజెబ్ పిచికారీ చేయండి.'
    ],
    expertAdvice: 'Maintain uniform irrigation; fluctuating drought and flooding triggers severe Alternaria leaf shedding.',
    severity: 'medium',
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80'
  }
];
