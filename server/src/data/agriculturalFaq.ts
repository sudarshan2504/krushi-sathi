export interface FaqItem {
  id: string;
  keywords: string[];
  intents: string[];
  questionEn: string;
  questionKn: string;
  questionTa: string;
  questionTe: string;
  answerEn: string;
  answerKn: string;
  answerTa: string;
  answerTe: string;
  category: 'crop_selection' | 'soil' | 'pest_disease' | 'fertilizer' | 'irrigation' | 'organic' | 'schemes' | 'general';
}

export const AGRICULTURAL_FAQS: FaqItem[] = [
  {
    id: 'faq-crop-soil',
    keywords: ['which crop', 'crop recommendation', 'suitable crop', 'what to grow', 'best crop', 'soil crop', 'red soil', 'black soil', 'clay soil', 'sandy soil'],
    intents: ['crop_recommendation', 'soil_selection'],
    questionEn: 'Which crop is good for my field?',
    questionKn: 'ನನ್ನ ಜಮೀನಿಗೆ ಯಾವ ಬೆಳೆ ಸೂಕ್ತ?',
    questionTa: 'என் நிலத்திற்கு எந்த பயிர் சிறந்தது?',
    questionTe: 'నా పొలానికి ఏ పంట అనుకూలం?',
    answerEn: 'Crop suitability depends on your soil type and water availability:\n• Red Soil (Rainfed/Borewell): Ragi (Finger millet), Groundnut, Maize, Red gram.\n• Black Soil (Clayey/Moisture retentive): Cotton, Chickpea (Bengal gram), Wheat, Soybean.\n• Clay/Loamy Soil with assured canal/borewell water: Paddy (Rice), Sugarcane, Banana, Tomato.\nUse our "Check My Soil" and "Recommend a Crop" features on the home page for a customized assessment!',
    answerKn: 'ನಿಮ್ಮ ಜಮೀನಿನ ಮಣ್ಣು ಮತ್ತು ನೀರಿನ ಸೌಲಭ್ಯದ ಮೇಲೆ ಬೆಳೆ ಅವಲಂಬಿತವಾಗಿರುತ್ತದೆ:\n• ಕೆಂಪು ಮಣ್ಣು (ಮಳೆಯಾಶ್ರಿತ/ಬೋರ್‌ವೆಲ್): ರಾಗಿ, ಕಡಲೆಕಾಯಿ, ಮೆಕ್ಕೆಜೋಳ, ತೊಗರಿ.\n• ಕಪ್ಪು ಮಣ್ಣು: ಹತ್ತಿ, ಕಡಲೆ, ಗೋಧಿ, ಸೋಯಾಬೀನ್.\n• ಜೇಡಿ/ಗೋಡು ಮಣ್ಣು ಮತ್ತು ಸಮೃದ್ಧ ನೀರು: ಭತ್ತ, ಕಬ್ಬು, ಟೊಮೆಟೊ.\nಹೆಚ್ಚಿನ ವಿವರಗಳಿಗಾಗಿ ಹೋಮ್ ಪೇಜ್‌ನಲ್ಲಿರುವ "Check My Soil" ಪರೀಕ್ಷೆ ಮಾಡಿ!',
    answerTa: 'உங்கள் நிலத்தின் மண் மற்றும் நீர் வசதியைப் பொறுத்து பயிரை தேர்வு செய்யவும்:\n• செம்மண் (மானாவாரி/போர்வெல்): கேழ்வரகு, நிலக்கடலை, மக்காச்சோளம், துவரை.\n• கரிசல் மண்: பருத்தி, கொண்டைக்கடலை, சோயாபீன்.\n• களிமண் / வண்டல் மண்: நெல், கரும்பு, தக்காளி.\nதுல்லியமான பரிந்துரைக்கு முகப்புப் பக்கத்தில் உள்ள "Check My Soil" கருவியை பயன்படுத்தவும்!',
    answerTe: 'మీ నేల రకం మరియు నీటి లభ్యతను బట్టి పంటను ఎంచుకోవాలి:\n• ఎర్ర నేలలు (వర్షాధార/బోరు): రాగులు, వేరుశనగ, మొక్కజొన్న, కంది.\n• నల్లరేగడి నేలలు: పత్తి, శనగలు, సోయాబీన్.\n• బంకమట్టి / ఒండ్రు నేలలు: వరి, చెరకు, టమోటా.\nఖచ్చితమైన వివరాల కోసం హోమ్ పేజీలోని "Check My Soil" ను ఉపయోగించండి!',
    category: 'crop_selection'
  },
  {
    id: 'faq-paddy-soil-prep',
    keywords: ['prepare soil for paddy', 'paddy land preparation', 'puddling', 'rice soil', 'paddy field'],
    intents: ['land_preparation', 'paddy_guide'],
    questionEn: 'How to prepare soil for paddy?',
    questionKn: 'ಭತ್ತದ ಗದ್ದೆ ಸಿದ್ಧತೆ ಮಾಡುವುದು ಹೇಗೆ?',
    questionTa: 'நெல்லுக்கு நிலம் தயாரிப்பது எப்படி?',
    questionTe: 'వరి పొలాన్ని ఎలా సిద్ధం చేయాలి?',
    answerEn: 'To prepare field for paddy:\n1. Plough the dry field 2-3 times to break hard clods.\n2. Flood with 5-7 cm water and puddle using cage wheels or cultivator.\n3. Incorporate 5 tonnes well-rotted FYM or green manure (Daincha/Sunnhemp).\n4. Level the land meticulously using a wooden plank or laser leveler.\n5. Strengthen and plaster outer field bunds to retain water.',
    answerKn: 'ಭತ್ತದ ಗದ್ದೆ ಸಿದ್ಧತೆ ಹಂತಗಳು:\n1. ಮಣ್ಣನ್ನು ಮೃದು ಮಾಡಲು 2-3 ಬಾರಿ ಒಣ ಉಳುಮೆ ಮಾಡಿ.\n2. 5-7 ಸೆಂ.ಮೀ ನೀರು ನಿಲ್ಲಿಸಿ ಕೇಜ್ ವೀಲ್‌ನಿಂದ ಕೆಸರು ಗದ್ದೆ ಮಾಡಿ (Puddling).\n3. 5 ಟನ್ ತಿಪ್ಪೆ ಗೊಬ್ಬರ ಅಥವಾ ಸೆಣಬು/ಡೈಂಚ ಹಸಿರೆಲೆ ಗೊಬ್ಬರ ಸೇರಿಸಿ.\n4. ಹಲಗೆಯಿಂದ ಗದ್ದೆಯನ್ನು ಸಮತಟ್ಟು ಮಾಡಿ.\n5. ನೀರು ಪೋಲಾಗದಂತೆ ಗಟ್ಟಿ ಬದುಗಳನ್ನು ಕಟ್ಟಿ.',
    answerTa: 'நெல் நிலம் தயாரிக்கும் வழிமுறைகள்:\n1. கட்டிகளை உடைக்க 2-3 முறை உழவு செய்யவும்.\n2. 5-7 செ.மீ நீர் நிறுத்தி சேறுழவு (Puddling) செய்யவும்.\n3. 5 டன் தொழுவுரம் அல்லது தக்கைப்பூண்டு பசுந்தாள் உரம் இடவும்.\n4. பலகை கொண்டு நிலத்தை சீராக சமன் செய்யவும்.\n5. வரப்புகளை பலப்படுத்தி செப்பனிடவும்.',
    answerTe: 'వరి పొలం తయారీ విధానం:\n1. నేలను 2-3 సార్లు దున్నండి.\n2. 5-7 సెం.మీ నీరు పెట్టి దమ్ము చేయండి (Puddling).\n3. 5 టన్నుల పశువుల ఎరువు లేదా జీలుగ పచ్చిరొట్ట ఎరువు వేయండి.\n4. చెక్క బద్దతో నేలను సమంగా చదును చేయండి.\n5. నీరు నిల్వ ఉండేలా గట్లను పటిష్టంగా చేయండి.',
    category: 'soil'
  },
  {
    id: 'faq-rice-pests',
    keywords: ['common pests in rice', 'pests in paddy', 'rice disease', 'rice insects', 'stem borer', 'blast', 'hopper'],
    intents: ['pest_control', 'paddy_pests'],
    questionEn: 'What are the common pests in rice?',
    questionKn: 'ಭತ್ತದ ಪ್ರಮುಖ ರೋಗ ಮತ್ತು ಹುಳುಗಳು ಯಾವುವು?',
    questionTa: 'நெல்லில் தாக்கும் முக்கிய பூச்சிகள் மற்றும் நோய்கள் யாவை?',
    questionTe: 'వరిలో వచ్చే ప్రధాన పురుగులు మరియు తెగుళ్లు ఏమిటి?',
    answerEn: 'Major rice pests and diseases include:\n1. Yellow Stem Borer: Causes "dead hearts" in vegetative stage and white chaffy earheads.\n2. Blast Disease (Fungus): Diamond-shaped spots on leaves and broken neck nodes.\n3. Brown Planthopper (BPH): Sucks sap at stem base causing circular burnt patches ("hopper burn").\n4. Leaf Folder: Caterpillars roll leaves longitudinally and scrape green chlorophyll.\nExplore the "Pests & Diseases" section in Krishi Sathi for full symptom photos and IPM solutions!',
    answerKn: 'ಭತ್ತದ ಪ್ರಮುಖ ರೋಗ ಮತ್ತು ಹುಳುಗಳು:\n1. ಕಾಂಡ ಕೊರೆಯುವ ಹುಳು: ಸುಳಿ ಒಣಗುವಿಕೆ ಮತ್ತು ಬಿಳಿ ಜೊಳ್ಳು ತೆನೆ ಉಂಟುಮಾಡುತ್ತದೆ.\n2. ಬೆಂಕಿ ರೋಗ (ಬ್ಲಾಸ್ಟ್): ಎಲೆಗಳಲ್ಲಿ ಕಂದು ಚುಕ್ಕೆ ಮತ್ತು ತೆನೆಯ ಕುತ್ತಿಗೆ ಕಪ್ಪಾಗಿ ಮುರಿಯುತ್ತದೆ.\n3. ಕಂದು ಜಿಗಿ ಹುಳು (BPH): ಗದ್ದೆಯಲ್ಲಿ ಬೆಂಕಿ ಬಿದ್ದಂತೆ ವೃತ್ತಾಕಾರವಾಗಿ ಪೈರು ಒಣಗುತ್ತದೆ.\n4. ಎಲೆ ಸುರುಳಿ ಹುಳು: ಎಲೆಗಳನ್ನು ಮಡಚಿ ಹಸಿರನ್ನು ತಿನ್ನುತ್ತದೆ.\nಸಂಪೂರ್ಣ ಪರಿಹಾರಕ್ಕಾಗಿ ನಮ್ಮ "Pests & Diseases" ವಿಭಾಗವನ್ನು ನೋಡಿ!',
    answerTa: 'நெல்லில் தாக்கும் முக்கிய பூச்சிகள்:\n1. தண்டு துளைப்பான்: குருத்து காய்ந்து வெண்கதிர்கள் தோன்றும்.\n2. குலை நோய்: இலைகளில் கண் போன்ற புள்ளிகள் மற்றும் கதிர் கழுத்தழுகல்.\n3. பழுப்பு தத்துப்பூச்சி (BPH): செடிகள் தீய்ந்தது போல் வட்டமாக காய்ந்துவிடும்.\n4. இலை சுருட்டுப்புழு: இலைகளை சுருட்டி பச்சையத்தை சுரண்டி உண்ணும்.\nமுழு விவரங்களுக்கு "Pests & Diseases" பக்கத்தை பார்வையிடவும்!',
    answerTe: 'వరిలో వచ్చే ముఖ్యమైన పురుగులు, తెగుళ్లు:\n1. కాండం తొలుచు పురుగు: ఎండిన సుడులు మరియు తెల్ల కంకులు ఏర్పడతాయి.\n2. అగ్గి తెగులు (బ్లాస్ట్): ఆకులపై మచ్చలు మరియు మెడ విరుపు తెగులు.\n3. సుడి దోమ (BPH): పొలంలో గుండ్రంగా పైరు కాలిపోయినట్లు ఎండిపోతుంది.\n4. ఆకు చుట్టు పురుగు: ఆకులను చుట్టి పచ్చదనాన్ని గోకి తింటుంది.\nపూర్తి సమాచారం కోసం "Pests & Diseases" విభాగాన్ని చూడండి!',
    category: 'pest_disease'
  },
  {
    id: 'faq-weather-rain',
    keywords: ['when will it rain', 'rain this week', 'weather forecast', 'rain forecast', 'should i spray', 'irrigate today'],
    intents: ['weather_forecast', 'rain_advisory'],
    questionEn: 'When will it rain this week?',
    questionKn: 'ಈ ವಾರ ಯಾವಾಗ ಮಳೆಯಾಗಬಹುದು?',
    questionTa: 'இந்த வாரம் எப்போது மழை பெய்யும்?',
    questionTe: 'ఈ వారం వర్షం ఎప్పుడు పడుతుంది?',
    answerEn: 'Please consult the live 7-Day & 14-Day Weather Widget on your Krishi Sathi Home Dashboard!\n• Rain Chance > 50%: Postpone pesticide/fertilizer spraying and chemical application to avoid wash-off.\n• Clear Sunny Days: Ideal window for harvesting, sun-drying grains, land tillage and weed control.\n• Check humidity: High humidity (>80%) accompanied by overcast skies triggers fungal spores like blast and blight.',
    answerKn: 'ನಿಮ್ಮ ಕೃಷಿ ಸಾಥಿ ಹೋಮ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ನಲ್ಲಿರುವ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ ವೀಕ್ಷಿಸಿ!\n• ಮಳೆಯ ಸಂಭವ > 50% ಇದ್ದಾಗ: ಕ್ರಿಮಿನಾಶಕ ಅಥವಾ ಗೊಬ್ಬರ ಸಿಂಪಡಿಸುವುದನ್ನು ಮುಂದೂಡಿ.\n• ಬಿಸಿಲು ಇರುವ ದಿನಗಳು: ಕೊಯ್ಲು, ಒಕ್ಕಣೆ ಮತ್ತು ಭೂಮಿ ಉಳುಮೆಗೆ ಸೂಕ್ತ.\n• ತೇವಾಂಶ 80% ಗಿಂತ ಹೆಚ್ಚಿದ್ದರೆ ಬೆಂಕಿ ರೋಗದ ಬಗ್ಗೆ ಜಾಗರೂಕರಾಗಿರಿ.',
    answerTa: 'உங்கள் முகப்பு பக்கத்தில் உள்ள 7 நாள் வானிலை முன்னறிவிப்பை பார்க்கவும்!\n• மழை வாய்ப்பு > 50% இருந்தால்: உரம் மற்றும் பூச்சிக்கொல்லி தெளிப்பதை தள்ளிப்போடவும்.\n• வெயில் உள்ள நாட்கள்: அறுவடை, கதிரடித்தல் மற்றும் உழவுக்கு ஏற்றது.\n• காற்றில் ஈரப்பதம் அதிகமிருந்தால் பூஞ்சாண நோய்கள் பரவும் வாய்ப்பு அதிகம்.',
    answerTe: 'మీ హోమ్ డాష్‌బోర్డ్‌లోని 7 రోజుల వాతావరణ సమాచారాన్ని పరిశీలించండి!\n• వర్షం సూచన > 50% ఉంటే: ఎరువులు మరియు మందుల పిచికారీని వాయిదా వేయండి.\n• ఎండగా ఉన్న రోజులు: పంట కోత, నూర్పిడి మరియు దుక్కికి అనుకూలం.\n• గాలిలో తేమ ఎక్కువగా ఉంటే తెగుళ్ల వ్యాప్తికి అవకాశం ఉంది.',
    category: 'general'
  },
  {
    id: 'faq-fertilizer-dosage',
    keywords: ['fertilizer', 'urea', 'dap', 'potash', 'npk', 'how much fertilizer', 'nutrient dosage'],
    intents: ['fertilizer_schedule'],
    questionEn: 'How much fertilizer should I apply?',
    questionKn: 'ಎಷ್ಟು ಗೊಬ್ಬರ ಹಾಕಬೇಕು?',
    questionTa: 'எவ்வளவு உரம் இட வேண்டும்?',
    questionTe: 'ఎంత ఎరువు వేయాలి?',
    answerEn: 'General recommended doses per acre:\n• Paddy: Basal: 50 kg DAP + 25 kg MOP. Top dressing: 30 kg Urea at tillering (25 days) and 25 kg Urea + 15 kg MOP at panicle initiation (45 days).\n• Maize: Basal: 50 kg DAP + 20 kg Potash. Top dressing: 35 kg Urea at knee-high (30 days) and 35 kg Urea at tasseling (55 days).\n• Ragi: Basal: 35 kg DAP. Top dressing: 20 kg Urea at 25 days.\nAlways apply urea when soil is moist, never on parched soil or just before heavy downpours!',
    answerKn: 'ಸಾಮಾನ್ಯ ಶಿಫಾರಸು ಮಾಡಿದ ಗೊಬ್ಬರದ ಪ್ರಮಾಣ (ಪ್ರತಿ ಎಕರೆಗೆ):\n• ಭತ್ತ: ನಾಟಿಗೆ ಮುನ್ನ 50 ಕೆಜಿ ಡಿಎಪಿ + 25 ಕೆಜಿ ಪೊಟ್ಯಾಷ್. ನಾಟಿಯ 25 ದಿನಕ್ಕೆ 30 ಕೆಜಿ ಯೂರಿಯಾ, 45 ದಿನಕ್ಕೆ 25 ಕೆಜಿ ಯೂರಿಯಾ + 15 ಕೆಜಿ ಪೊಟ್ಯಾಷ್.\n• ಮೆಕ್ಕೆಜೋಳ: 50 ಕೆಜಿ ಡಿಎಪಿ. 30 ದಿನಕ್ಕೆ 35 ಕೆಜಿ ಯೂರಿಯಾ ಮತ್ತು ಹೂಬಿಡುವಾಗ 35 ಕೆಜಿ ಯೂರಿಯಾ.\n• ರಾಗಿ: 35 ಕೆಜಿ ಡಿಎಪಿ ಮತ್ತು 25 ದಿನಕ್ಕೆ 20 ಕೆಜಿ ಯೂರಿಯಾ.\nಯಾವಾಗಲೂ ಮಣ್ಣಿನಲ್ಲಿ ತೇವಾಂಶವಿದ್ದಾಗ ಮಾತ್ರ ಯೂರಿಯಾ ಹಾಕಿ!',
    answerTa: 'ஏக்கருக்கு பொதுவான உர பரிந்துரை:\n• நெல்: அடியுரம்: 50 கிலோ டி.ஏ.பி + 25 கிலோ பொட்டாஷ். மேலுரம்: 25 ஆம் நாளில் 30 கிலோ யூரியா, 45 ஆம் நாளில் 25 கிலோ யூரியா + 15 கிலோ பொட்டாஷ்.\n• மக்காச்சோளம்: 50 கிலோ டி.ஏ.பி. 30 ஆம் நாளில் 35 கிலோ யூரியா, பூக்கும் போது 35 கிலோ யூரியா.\n• கேழ்வரகு: 35 கிலோ டி.ஏ.பி மற்றும் 25 ஆம் நாளில் 20 கிலோ யூரியா.\nமண்ணில் ஈரப்பதம் இருக்கும் போது மட்டுமே யூரியா இட வேண்டும்!',
    answerTe: 'ఎకరానికి సాధారణ ఎరువుల మోతాదు:\n• వరి: ఆఖరి దుక్కిలో: 50 కిలోల డిఎపి + 25 కిలోల పొటాష్. పైపాటుగా: 25 రోజులకు 30 కిలోల యూరియా, 45 రోజులకు 25 కిలోల యూరియా + 15 కిలోల పొటాష్.\n• మొక్కజొన్న: 50 కిలోల డిఎపి. 30 రోజులకు 35 కిలోల యూరియా, పూత సమయంలో 35 కిలోల యూరియా.\n• రాగులు: 35 కిలోల డిఎపి మరియు 25 రోజులకు 20 కిలోల యూరియా.\nనేలలో తేమ ఉన్నప్పుడు మాత్రమే యూరియా వేయండి!',
    category: 'fertilizer'
  },
  {
    id: 'faq-organic-neem',
    keywords: ['organic pest', 'neem oil', 'jeevamrutha', 'panchagavya', 'natural farming', 'bio pesticide'],
    intents: ['organic_farming'],
    questionEn: 'How to make and use organic pest repellents?',
    questionKn: 'ನೈಸರ್ಗಿಕ ಕೀಟ ನಿಯಂತ್ರಣ ಮತ್ತು ಬೇವಿನ ಎಣ್ಣೆ ಬಳಕೆ ಹೇಗೆ?',
    questionTa: 'இயற்கை பூச்சி விரட்டி மற்றும் வேப்பெண்ணெய் தயாரிப்பது எப்படி?',
    questionTe: 'సేంద్రీయ పురుగుల మందులు మరియు వేప నూనె ఎలా వాడాలి?',
    answerEn: 'Natural Organic Formulations:\n• Neem Oil Spray: Mix 5ml pure cold-pressed Neem Oil (10,000 ppm) with 1ml liquid soap / shampoo in 1 Litre of water. Emulsify thoroughly and spray in late evening.\n• Jeevamrutha: 10 kg native desi cow dung + 10 L cow urine + 2 kg jaggery + 2 kg pulse flour + handful of fertile bund soil stirred in 200 L water for 48 hours. Irrigate with water.\n• These natural remedies repel aphids, whiteflies, thrips and caterpillars safely without killing beneficial honeybees.',
    answerKn: 'ನೈಸರ್ಗಿಕ ಕೀಟನಾಶಕ ವಿಧಾನಗಳು:\n• ಬೇವಿನ ಎಣ್ಣೆ ಸಿಂಪಡಣೆ: 1 ಲೀಟರ್ ನೀರಿಗೆ 5 ಮಿ.ಲೀ ಬೇವಿನ ಎಣ್ಣೆ ಮತ್ತು 1 ಮಿ.ಲೀ ಸಾಬೂನು ದ್ರಾವಣ ಬೆರೆಸಿ ಸಂಜೆ ವೇಳೆ ಸಿಂಪಡಿಸಿ.\n• ಜೀವಾಮೃತ: 10 ಕೆಜಿ ದೇಸಿ ಹಸುವಿನ ಸಗಣಿ + 10 ಲೀಟರ್ ಗೋಮೂತ್ರ + 2 ಕೆಜಿ ಬೆಲ್ಲ + 2 ಕೆಜಿ ದ್ವಿದಳ ಧಾನ್ಯದ ಹಿಟ್ಟು + ಹಿಡಿ ಮಣ್ಣನ್ನು 200 ಲೀಟರ್ ನೀರಿನಲ್ಲಿ 2 ದಿನ ನೆನೆಸಿ ಗಿಡಗಳಿಗೆ ನೀಡಿ.\nಇದು ಜೇನುನೊಣಗಳನ್ನು ಕೊಲ್ಲದೆ ಕೀಟಗಳನ್ನು ಹಿಮ್ಮೆಟ್ಟಿಸುತ್ತದೆ.',
    answerTa: 'இயற்கை பூச்சி மேலாண்மை முறைகள்:\n• வேப்பெண்ணெய் கரைசல்: 1 லிட்டர் தண்ணீருக்கு 5 மி.லி வேப்பெண்ணெய் மற்றும் 1 மி.லி காதி சோப்பு கரைத்து மாலையில் தெளிக்கவும்.\n• ஜீவாமிர்தம்: 10 கிலோ நாட்டு மாட்டு சாணம் + 10 லிட்டர் கோமியம் + 2 கிலோ வெல்லம் + 2 கிலோ பயறு மாவு + கைப்பிடி மண் கலந்து 200 லிட்டர் நீரில் 48 மணி நேரம் ஊறவைத்து பாசன நீரில் விடவும்.',
    answerTe: 'సహజ పురుగు నివారణ పద్ధతులు:\n• వేప నూనె ద్రావణం: 1 లీటరు నీటికి 5 మి.లీ వేప నూనె మరియు 1 మి.లీ సబ్బు నీరు కలిపి సాయంత్రం వేళ పిచికారీ చేయండి.\n• జీవామృతం: 10 కిలోల దేశీ ఆవు పేడ + 10 లీటర్ల ఆవు మూత్రం + 2 కిలోల బెల్లం + 2 కిలోల శనగపిండి + గుప్పెడు పుట్టమన్ను 200 లీటర్ల నీటిలో 2 రోజులు పులియబెట్టి తడితో ఇవ్వండి.',
    category: 'organic'
  },
  {
    id: 'faq-govt-schemes',
    keywords: ['pm kisan', 'subsidies', 'government schemes', 'pmfby', 'crop insurance', 'kisan credit card', 'kcc'],
    intents: ['government_schemes'],
    questionEn: 'What government farming schemes can I apply for?',
    questionKn: 'ರೈತರಿಗೆ ಸಿಗುವ ಸರಕಾರಿ ಯೋಜನೆಗಳು ಯಾವುವು?',
    questionTa: 'விவசாயிகளுக்கான அரசு திட்டங்கள் யாவை?',
    questionTe: 'రైతులకు లభించే ప్రభుత్వ పథకాలు ఏమిటి?',
    answerEn: 'Key Indian Agricultural Schemes:\n1. PM-KISAN: ₹6,000/year direct cash support in three ₹2,000 installments into farmer Aadhaar-linked accounts.\n2. PMFBY (Pradhan Mantri Fasal Bima Yojana): Low premium crop insurance (2% Kharif, 1.5% Rabi) covering flood, drought and pest loss.\n3. Kisan Credit Card (KCC): Concessional 4% crop loans up to ₹3 Lakhs.\n4. PM Krishi Sinchayee Yojana (PMKSY): 50-70% subsidy on Drip and Sprinkler micro-irrigation systems.\nVisit your local Grama Panchayat, Raitha Samparka Kendra or CSC center to register.',
    answerKn: 'ರೈತರಿಗೆ ಲಭ್ಯವಿರುವ ಪ್ರಮುಖ ಸರಕಾರಿ ಯೋಜನೆಗಳು:\n1. ಪಿಎಂ-ಕಿಸಾನ್: ವಾರ್ಷಿಕ ₹6,000 ನೇರ ನಗದು ಸಹಾಯ.\n2. ಪ್ರಧಾನ ಮಂತ್ರಿ ಫಸಲ್ ಬಿಮಾ ಯೋಜನೆ (PMFBY): ನೈಸರ್ಗಿಕ ವಿಕೋಪ ಮತ್ತು ಬೆಳೆ ಹಾನಿಗೆ ಕಡಿಮೆ ಪ್ರೀಮಿಯಂ ಬೆಳೆ ವಿಮೆ.\n3. ಕಿಸಾನ್ ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ (KCC): ಶೇ. 4 ರಿಯಾಯಿತಿ ಬಡ್ಡಿದರದಲ್ಲಿ ₹3 ಲಕ್ಷದವರೆಗೆ ಬೆಳೆ ಸಾಲ.\n4. ಹನಿ ನೀರಾವರಿ ಸಹಾಯಧನ: ಶೇ. 50-70 ರವರೆಗೆ ಸಬ್ಸಿಡಿ.\nಸ್ಥಳೀಯ ರೈತ ಸಂಪರ್ಕ ಕೇಂದ್ರ (RSK) ಅಥವಾ ಗ್ರಾಮ ಒನ್ ಕೇಂದ್ರಕ್ಕೆ ಭೇಟಿ ನೀಡಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ.',
    answerTa: 'விவசாயிகளுக்கான முக்கிய அரசு திட்டங்கள்:\n1. பி.எம்-கிசான்: ஆண்டுக்கு ₹6,000 நேரடி வங்கி நிதி உதவி.\n2. பிரதம மந்திரி பயிர் காப்பீட்டுத் திட்டம் (PMFBY): இயற்கை சீற்றங்களால் ஏற்படும் பயிர் இழப்பிற்கு காப்பீடு.\n3. கிசான் கிரெடிட் கார்டு (KCC): 4% குறைந்த வட்டியில் ₹3 லட்சம் வரை பயிர்க்கடன்.\n4. சொட்டுநீர் பாசன மானியம்: 50-70% வரை அரசு மானியம்.\nவிவரங்களுக்கு உங்கள் வட்டார வேளாண்மை விரிவாக்க மையத்தை அணுகவும்.',
    answerTe: 'రైతులకు అందుబాటులో ఉన్న ముఖ్య ప్రభుత్వ పథకాలు:\n1. పిఎం-కిసాన్: సంవత్సరానికి ₹6,000 నేరుగా బ్యాంకు ఖాతాలో జమ.\n2. ప్రధానమంత్రి ఫసల్ బీమా యోజన (PMFBY): తక్కువ ప్రీమియంతో పంట బీమా రక్షణ.\n3. కిసాన్ క్రెడిట్ కార్డ్ (KCC): 4% తక్కువ వడ్డీతో ₹3 లక్షల వరకు పంట రుణం.\n4. సూక్ష్మ సేద్యం (డ్రిప్/స్ప్రింక్లర్) సబ్సిడీ: 50-70% రాయితీ.\nదరఖాస్తు కోసం మీ రైతు భరోసా కేంద్రం (RBK) లేదా మీ-సేవను సంప్రదించండి.',
    category: 'schemes'
  }
];
