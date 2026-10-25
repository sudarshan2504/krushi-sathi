import prisma from '../utils/prisma';
import { config } from '../config';
import { getGeminiClient } from './aiService';
import sharp from 'sharp';

export interface SymptomInput {
  crop?: string;
  cropSlug?: string;
  plantPart?: 'leaf' | 'stem' | 'root' | 'fruit_grain' | 'flower' | 'whole_plant' | string;
  pattern?: string;
  colour?: string;
  spread?: string;
  stage?: string;
  onset?: string;
  note?: string;
  imageData?: string; // base64 data-URL
  consentToStoreImage?: boolean;
  weather?: {
    temperature?: number;
    humidity?: number;
    season?: string;
  };
}

export interface DiagnosisCandidate {
  id: string;
  slug: string;
  name: string;
  nameKannada?: string;
  nameTamil?: string;
  nameTelugu?: string;
  scientificName?: string;
  type: string;
  severity: string;
  score: number;
  confidence: 'high' | 'medium' | 'low';
  whyMatched: string[];
  differentiator: string;
  preliminaryNotice: string;
  culturalControl?: string;
  biologicalControl?: string;
  organicControl?: string;
  chemicalControl?: string;
  imageUrl: string;
}

export interface DiagnosisResult {
  success: boolean;
  mode: 'symptom_scored' | 'vision_verified' | 'uncertain';
  confidence: 'high' | 'medium' | 'low';
  message: string;
  candidates: DiagnosisCandidate[];
  extractedTags?: {
    plantPart?: string;
    pattern?: string;
    colour?: string;
    spread?: string;
    stage?: string;
  };
  visionObservation?: string;
  suggestedFollowUpChecks?: string[];
  kvkAdvisory: string;
}

// Multilingual keyword dictionary for offline or non-AI note extraction
const KEYWORD_DICTIONARY: Record<string, { plantPart?: string; pattern?: string; colour?: string }> = {
  // English
  leaf: { plantPart: 'leaf' },
  leaves: { plantPart: 'leaf' },
  stem: { plantPart: 'stem' },
  shoot: { plantPart: 'stem' },
  stalk: { plantPart: 'stem' },
  root: { plantPart: 'root' },
  roots: { plantPart: 'root' },
  fruit: { plantPart: 'fruit_grain' },
  grain: { plantPart: 'fruit_grain' },
  pod: { plantPart: 'fruit_grain' },
  flower: { plantPart: 'flower' },
  spot: { pattern: 'spots' },
  spots: { pattern: 'spots' },
  streak: { pattern: 'streaks' },
  streaks: { pattern: 'streaks' },
  yellow: { colour: 'yellow', pattern: 'yellowing' },
  yellowing: { colour: 'yellow', pattern: 'yellowing' },
  brown: { colour: 'brown' },
  browning: { colour: 'brown' },
  black: { colour: 'black' },
  white: { colour: 'white' },
  wilt: { pattern: 'wilting' },
  wilting: { pattern: 'wilting' },
  hole: { pattern: 'holes' },
  holes: { pattern: 'holes' },
  borer: { pattern: 'holes' },
  curl: { pattern: 'rolling_curling' },
  curling: { pattern: 'rolling_curling' },
  powder: { pattern: 'powdery_mould', colour: 'white' },
  powdery: { pattern: 'powdery_mould' },
  mould: { pattern: 'powdery_mould' },
  rot: { pattern: 'rot' },
  rotting: { pattern: 'rot' },
  gall: { pattern: 'galls' },
  stunted: { pattern: 'stunting' },
  stunting: { pattern: 'stunting' },
  caterpillar: { pattern: 'insects_visible' },
  insect: { pattern: 'insects_visible' },
  aphid: { pattern: 'insects_visible' },

  diamond: { pattern: 'spots', plantPart: 'leaf' },
  spindle: { pattern: 'spots', plantPart: 'leaf' },
  blast: { pattern: 'spots', colour: 'brown' },
  hopperburn: { pattern: 'insects_visible', colour: 'brown' },
  blight: { pattern: 'spots', colour: 'brown' },
  pustule: { pattern: 'spots', colour: 'brown' },
  pustules: { pattern: 'spots', colour: 'brown' },
  rust: { pattern: 'spots', colour: 'brown' },
  rhizome: { plantPart: 'root', pattern: 'rot' },

  // Kannada (ಕನ್ನಡ)
  'ಎಲೆ': { plantPart: 'leaf' },
  'ಎಲೆಗಳು': { plantPart: 'leaf' },
  'ಕಾಂಡ': { plantPart: 'stem' },
  'ಬೇರು': { plantPart: 'root' },
  'ಗೆಡ್ಡೆ': { plantPart: 'root' },
  'ಹಣ್ಣು': { plantPart: 'fruit_grain' },
  'ಕಾಳು': { plantPart: 'fruit_grain' },
  'ತೆನೆ': { plantPart: 'fruit_grain' },
  'ಕುತ್ತಿಗೆ': { plantPart: 'fruit_grain' },
  'ಹೂವು': { plantPart: 'flower' },
  'ಚುಕ್ಕೆ': { pattern: 'spots' },
  'ಚುಕ್ಕೆಗಳು': { pattern: 'spots' },
  'ಗೆರೆಗಳು': { pattern: 'streaks' },
  'ಹಳದಿ': { colour: 'yellow', pattern: 'yellowing' },
  'ಕಂದು': { colour: 'brown' },
  'ಕಪ್ಪು': { colour: 'black' },
  'ಬಿಳಿ': { colour: 'white' },
  'ಒಣಗುವುದು': { pattern: 'wilting' },
  'ಬಾಡುವಿಕೆ': { pattern: 'wilting' },
  'ಬಾಡಿ': { pattern: 'wilting' },
  'ರಂಧ್ರ': { pattern: 'holes' },
  'ತೂತು': { pattern: 'holes' },
  'ಸುರುಳಿ': { pattern: 'rolling_curling' },
  'ಮುದುಡು': { pattern: 'rolling_curling' },
  'ಬೂದಿ': { pattern: 'powdery_mould', colour: 'white' },
  'ಕೊಳೆಯುವುದು': { pattern: 'rot' },
  'ಕೊಳತ': { pattern: 'rot' },
  'ಗಿಡ್ಡಾಗುವಿಕೆ': { pattern: 'stunting' },
  'ಹುಳು': { pattern: 'insects_visible' },
  'ಜಿಗಿಹುಳು': { pattern: 'insects_visible' },

  // Tamil (தமிழ்)
  'இலை': { plantPart: 'leaf' },
  'இலைகள்': { plantPart: 'leaf' },
  'தண்டு': { plantPart: 'stem' },
  'வேர்': { plantPart: 'root' },
  'காய்': { plantPart: 'fruit_grain' },
  'தானியம்': { plantPart: 'fruit_grain' },
  'பூ': { plantPart: 'flower' },
  'புள்ளி': { pattern: 'spots' },
  'புள்ளிகள்': { pattern: 'spots' },
  'வரிகள்': { pattern: 'streaks' },
  'மஞ்சள்': { colour: 'yellow', pattern: 'yellowing' },
  'பழுப்பு': { colour: 'brown' },
  'கருப்பு': { colour: 'black' },
  'வெள்ளை': { colour: 'white' },
  'வாடல்': { pattern: 'wilting' },
  'வாடுகிறது': { pattern: 'wilting' },
  'துளை': { pattern: 'holes' },
  'சுருள்': { pattern: 'rolling_curling' },
  'சாம்பல்': { pattern: 'powdery_mould' },
  'அழுகல்': { pattern: 'rot' },
  'வளர்ச்சிக்குன்றுதல்': { pattern: 'stunting' },
  'புழு': { pattern: 'insects_visible' },
  'பூச்சி': { pattern: 'insects_visible' },

  // Telugu (తెలుగు)
  'ఆకు': { plantPart: 'leaf' },
  'ఆకులు': { plantPart: 'leaf' },
  'కాండం': { plantPart: 'stem' },
  'మొదలు': { plantPart: 'root' },
  'వేరు': { plantPart: 'root' },
  'వేర్లు': { plantPart: 'root' },
  'కాయ': { plantPart: 'fruit_grain' },
  'గింజ': { plantPart: 'fruit_grain' },
  'పువ్వు': { plantPart: 'flower' },
  'మచ్చ': { pattern: 'spots' },
  'మచ్చలు': { pattern: 'spots' },
  'గీతలు': { pattern: 'streaks' },
  'పసుపు': { colour: 'yellow', pattern: 'yellowing' },
  'గోధుమ': { colour: 'brown' },
  'నలుపు': { colour: 'black' },
  'తెలుపు': { colour: 'white' },
  'వాడిపోవడం': { pattern: 'wilting' },
  'రంధ్రాలు': { pattern: 'holes' },
  'తొలుచు': { pattern: 'holes' },
  'ముడుచుకోవడం': { pattern: 'rolling_curling' },
  'బూడిద': { pattern: 'powdery_mould', colour: 'white' },
  'కుళ్లు': { pattern: 'rot' },
  'కుళ్ళి': { pattern: 'rot' },
  'ఎదుగుదల లోపం': { pattern: 'stunting' },
  'పురుగు': { pattern: 'insects_visible' },
};

/**
 * Extract structured symptom tags from free text note using Gemini or dictionary fallback
 */
async function extractTagsFromNote(note: string): Promise<{
  plantPart?: string;
  pattern?: string;
  colour?: string;
  spread?: string;
  stage?: string;
}> {
  if (!note || note.trim().length < 3) return {};

  const gemini = getGeminiClient();
  if (gemini && config.geminiApiKey) {
    try {
      const prompt = `You are an Indian agricultural entomology and plant pathology assistant.
Extract structured crop symptom tags from this farmer's note written in English, Kannada, Tamil, or Telugu:
"${note}"

Available valid values:
- plantPart: "leaf", "stem", "root", "fruit_grain", "flower", "whole_plant"
- pattern: "spots", "streaks", "yellowing", "browning", "wilting", "holes", "rolling_curling", "powdery_mould", "rot", "galls", "dead_heart", "stunting", "insects_visible"
- colour: "yellow", "brown", "black", "white", "grey", "red_purple", "light_green"
- spread: "few_plants", "patches", "whole_field"
- stage: "seedling", "vegetative", "flowering", "fruiting", "harvest"

Output strictly in JSON format without markdown ticks:
{ "plantPart": string or null, "pattern": string or null, "colour": string or null, "spread": string or null, "stage": string or null }`;

      const response = await gemini.models.generateContent({
        model: config.geminiModel || 'gemini-2.0-flash',
        contents: prompt,
      });

      const text = response.text || '';
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return {
        plantPart: parsed.plantPart || undefined,
        pattern: parsed.pattern || undefined,
        colour: parsed.colour || undefined,
        spread: parsed.spread || undefined,
        stage: parsed.stage || undefined,
      };
    } catch (err: any) {
      console.warn('[diagnosisService] Gemini note extraction error, falling back to dictionary:', err.message);
    }
  }

  // Fallback to multilingual keyword dictionary
  const lower = note.toLowerCase();
  const extracted: any = {};
  for (const [key, mapping] of Object.entries(KEYWORD_DICTIONARY)) {
    if (lower.includes(key)) {
      if (mapping.plantPart && !extracted.plantPart) extracted.plantPart = mapping.plantPart;
      if (mapping.pattern && !extracted.pattern) extracted.pattern = mapping.pattern;
      if (mapping.colour && !extracted.colour) extracted.colour = mapping.colour;
    }
  }
  return extracted;
}

/**
 * Verify image using Gemini Vision constrained strictly to candidate problem slugs
 */
async function verifyPhotoWithGeminiVision(
  imageData: string,
  cropName: string,
  candidates: any[]
): Promise<{ matchedSlug?: string; confidenceScore: number; observedSigns?: string }> {
  const gemini = getGeminiClient();
  if (!gemini || !config.geminiApiKey || !imageData) {
    return { confidenceScore: 0 };
  }

  try {
    // Process base64
    const match = imageData.match(/^data:image\/(jpeg|png|webp|gif);base64,(.+)$/);
    if (!match) return { confidenceScore: 0 };

    const mimeType = 'image/jpeg';
    const buffer = Buffer.from(match[2], 'base64');

    // Strip EXIF and resize with sharp
    const cleanBuffer = await sharp(buffer)
      .rotate()
      .resize(800, 800, { fit: 'inside' })
      .jpeg({ quality: 80 })
      .toBuffer();

    const candidateSlugs = candidates.map(c => ({
      slug: c.slug,
      name: c.name,
      symptoms: c.symptoms.substring(0, 100),
    }));

    const prompt = `You are an expert ICAR agricultural diagnostician examining a field photo of a ${cropName} crop.
The candidate problems for this crop are strictly limited to the following list:
${JSON.stringify(candidateSlugs, null, 2)}

Instructions:
1. Carefully inspect the visual plant symptoms in the image (lesions, discoloration, holes, fungal fruiting, insect presence).
2. You MUST select ONLY one slug from the candidate list that best matches, OR return null if none match well.
3. Return strict JSON without markdown formatting:
{
  "matchedSlug": "slug-name" or null,
  "confidenceScore": integer between 0 and 100,
  "observedSigns": "Brief description of what you observed on the plant"
}`;

    const res = await gemini.models.generateContent({
      model: config.geminiModel || 'gemini-2.0-flash',
      contents: [
        {
          inlineData: {
            mimeType,
            data: cleanBuffer.toString('base64'),
          },
        },
        prompt,
      ],
    });

    const text = res.text || '';
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(cleaned);

    return {
      matchedSlug: result.matchedSlug || undefined,
      confidenceScore: Math.min(100, Math.max(0, result.confidenceScore || 0)),
      observedSigns: result.observedSigns,
    };
  } catch (err: any) {
    console.warn('[diagnosisService] Gemini Vision diagnosis error:', err.message);
    return { confidenceScore: 0 };
  }
}

/**
 * Core Diagnosis Engine: Weighted tag overlap + crop match + season & weather + honest thresholding
 */
export async function diagnoseCropProblem(input: SymptomInput): Promise<DiagnosisResult> {
  const cropQuery = (input.cropSlug || input.crop || '').toLowerCase().trim();

  // 1. Extract and merge tags from user note
  const noteTags = await extractTagsFromNote(input.note || '');
  const activePlantPart = input.plantPart || noteTags.plantPart;
  const activePattern = input.pattern || noteTags.pattern;
  const activeColour = input.colour || noteTags.colour;
  const activeSpread = input.spread || noteTags.spread;
  const activeStage = input.stage || noteTags.stage;

  // 2. Fetch all problems and their relationships
  const allProblems = await prisma.problem.findMany({
    include: {
      crops: { include: { crop: true } },
      symptomTags: { include: { symptomTag: true } },
      images: true,
    },
  });

  // 3. Determine current season & weather suitability
  const nowMonth = new Date().getMonth() + 1;
  const currentSeason = (nowMonth >= 6 && nowMonth <= 10)
    ? 'Kharif'
    : (nowMonth >= 11 || nowMonth <= 2)
    ? 'Rabi'
    : 'Summer';

  const humidity = input.weather?.humidity || 75; // default moderate-high for Indian crop zones
  const temperature = input.weather?.temperature || 28;

  // 4. Score every problem
  const scored = allProblems.map((prob) => {
    let symptomPoints = 0;
    let cropPoints = 0;
    let weatherPoints = 0;
    const whyMatched: string[] = [];

    // --- CROP MATCH (Up to 30 points) ---
    const primaryCropMatch = prob.crops.find(
      c => c.cropSlug.toLowerCase().includes(cropQuery) || c.cropName.toLowerCase().includes(cropQuery)
    );

    if (cropQuery) {
      if (primaryCropMatch) {
        if (primaryCropMatch.importance === 'primary') {
          cropPoints += 30;
          whyMatched.push(`Major documented threat for ${primaryCropMatch.cropName}`);
        } else {
          cropPoints += 18;
          whyMatched.push(`Affects ${primaryCropMatch.cropName} as secondary host`);
        }
      } else {
        // Severe penalty if query specified a completely different crop and this problem is host-specific
        cropPoints -= 35;
      }
    } else {
      cropPoints += 10;
    }

    // --- SYMPTOM TAG MATCHING (Up to 55 points) ---
    const tags = prob.symptomTags.map(st => st.symptomTag);

    // Pattern Match (20 pts)
    let hasPatternMatch = false;
    if (activePattern) {
      const matchPattern = tags.find(t => t.pattern === activePattern);
      if (matchPattern) {
        hasPatternMatch = true;
        symptomPoints += 20;
        whyMatched.push(`Visual pattern matches '${matchPattern.labelEn}'`);
      } else if (prob.symptoms.toLowerCase().includes(activePattern.replace('_', ' '))) {
        hasPatternMatch = true;
        symptomPoints += 12;
        whyMatched.push(`Symptoms describe '${activePattern.replace('_', ' ')}'`);
      }
    }

    // Plant Part Match (15 pts)
    if (activePlantPart) {
      const matchPart = tags.find(t => t.plantPart === activePlantPart);
      if (matchPart) {
        symptomPoints += 15;
        whyMatched.push(`Located on plant part: ${activePlantPart}`);
      }
    }

    // Colour Match (10 pts)
    if (activeColour) {
      const matchColour = tags.find(t => t.colour === activeColour);
      if (matchColour) {
        symptomPoints += 10;
        whyMatched.push(`Lesion / sign colour matches ${activeColour}`);
      }
    }

    // Spread Pattern (5 pts)
    if (activeSpread) {
      const matchSpread = tags.find(t => t.spread === activeSpread);
      if (matchSpread) {
        symptomPoints += 5;
        whyMatched.push(`Field spread matches '${activeSpread.replace('_', ' ')}'`);
      }
    }

    // Stage Match (5 pts)
    if (activeStage) {
      let stages: string[] = [];
      try {
        stages = typeof prob.affectedStages === 'string' ? JSON.parse(prob.affectedStages) : prob.affectedStages || [];
      } catch {
        stages = [];
      }
      if (stages.some(s => s.toLowerCase().includes(activeStage.toLowerCase()))) {
        symptomPoints += 5;
        whyMatched.push(`Known to occur at ${activeStage} stage`);
      }
    }

    // --- WEATHER & SEASON SUITABILITY (Up to 15 points) ---
    let probSeasons: string[] = [];
    try {
      probSeasons = typeof prob.favourableSeasons === 'string' ? JSON.parse(prob.favourableSeasons) : prob.favourableSeasons || [];
    } catch {
      probSeasons = [];
    }

    if (probSeasons.includes(currentSeason)) {
      weatherPoints += 7;
      whyMatched.push(`Active during current ${currentSeason} season`);
    }

    if (humidity >= 75 && (prob.type === 'fungal' || prob.type === 'bacterial')) {
      weatherPoints += 8;
      whyMatched.push('High relative humidity favours disease proliferation');
    } else if (temperature >= 32 && (prob.type === 'mite' || prob.type === 'insect_pest')) {
      weatherPoints += 8;
      whyMatched.push('Dry / warm temperature accelerates pest reproduction');
    }

    // If NO core symptoms matched, the score must stay below the uncertain threshold (< 25)
    let finalScore = 0;
    if (symptomPoints === 0) {
      finalScore = 10;
    } else if (activePattern && !hasPatternMatch) {
      // User observed a distinct physical pattern, but this problem has an entirely different pattern
      finalScore = 15;
    } else if (symptomPoints < 15) {
      finalScore = 18;
    } else {
      finalScore = Math.min(100, Math.max(0, cropPoints + symptomPoints + weatherPoints));
    }

    let differentiator = 'Examine lesion margins and insect structures closely.';
    try {
      const looks = typeof prob.lookAlikes === 'string' ? JSON.parse(prob.lookAlikes) : prob.lookAlikes || [];
      if (looks.length > 0 && looks[0].difference) {
        differentiator = `To distinguish from ${looks[0].name}: ${looks[0].difference}`;
      }
    } catch {
      // default
    }

    return {
      problem: prob,
      score: finalScore,
      whyMatched,
      differentiator,
    };
  });

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  // 5. Vision Verification (if image was supplied)
  let visionObservation: string | undefined;
  if (input.imageData && config.geminiApiKey) {
    const topCandidates = scored.slice(0, 6).map(s => s.problem);
    const visionResult = await verifyPhotoWithGeminiVision(
      input.imageData,
      cropQuery || 'crop',
      topCandidates
    );

    if (visionResult.matchedSlug) {
      visionObservation = visionResult.observedSigns;
      // Boost the vision-matched candidate
      const target = scored.find(s => s.problem.slug === visionResult.matchedSlug);
      if (target) {
        target.score = Math.min(100, target.score + Math.round(visionResult.confidenceScore * 0.35));
        target.whyMatched.unshift(`Photo vision confirmed: ${visionResult.observedSigns || 'Characteristic physical lesions observed'}`);
        // Re-sort with boost
        scored.sort((a, b) => b.score - a.score);
      }
    }
  }

  // 6. Honest Threshold Gate (< 25 points is uncertain)
  const best = scored[0];
  const isUncertain = !best || best.score < 25;

  if (isUncertain) {
    return {
      success: true,
      mode: 'uncertain',
      confidence: 'low',
      message: 'The observed symptoms do not match any single pest or disease in our verified catalog with sufficient certainty.',
      candidates: scored.slice(0, 3).map(s => formatCandidate(s, 'low')),
      extractedTags: {
        plantPart: activePlantPart,
        pattern: activePattern,
        colour: activeColour,
        spread: activeSpread,
        stage: activeStage,
      },
      visionObservation,
      suggestedFollowUpChecks: [
        'Inspect the underside of leaves with a hand lens for tiny webbing, mites, or whitefly nymphs',
        'Examine the stem base at the soil line for discoloured bark or fungal mycelium collar rot',
        'Cut open the stem to check for internal tunneling or browning characteristic of borers',
        'Take a fresh affected leaf sample to your nearest Raitha Samparka Kendra (RSK) or KVK',
      ],
      kvkAdvisory: 'Call the National Kisan Call Center at 1800-180-1551 (toll-free) or visit your local Raitha Samparka Kendra for in-person diagnosis.',
    };
  }

  // 7. Format Top 3 Candidates
  const top3 = scored.slice(0, 3).map(s => {
    let conf: 'high' | 'medium' | 'low' = 'low';
    if (s.score >= 70) conf = 'high';
    else if (s.score >= 45) conf = 'medium';
    return formatCandidate(s, conf);
  });

  const bestConfidence = top3[0].confidence;

  return {
    success: true,
    mode: input.imageData && config.geminiApiKey ? 'vision_verified' : 'symptom_scored',
    confidence: bestConfidence,
    message: bestConfidence === 'high'
      ? 'Strong match found in verified ICAR/UAS pathology profiles.'
      : 'Preliminary candidate matches identified based on symptoms.',
    candidates: top3,
    extractedTags: {
      plantPart: activePlantPart,
      pattern: activePattern,
      colour: activeColour,
      spread: activeSpread,
      stage: activeStage,
    },
    visionObservation,
    kvkAdvisory: 'Preliminary identification only. Always verify with your local agricultural officer before spraying chemical pesticides. Do NOT exceed approved dosages.',
  };
}

function formatCandidate(s: { problem: any; score: number; whyMatched: string[]; differentiator: string }, confidence: 'high' | 'medium' | 'low'): DiagnosisCandidate {
  const p = s.problem;
  const primaryImg = p.images?.find((img: any) => img.isPrimary) || p.images?.[0];

  return {
    id: p.slug,
    slug: p.slug,
    name: p.name,
    nameKannada: p.nameKn,
    nameTamil: p.nameTa,
    nameTelugu: p.nameTe,
    scientificName: p.scientificName,
    type: p.type,
    severity: p.severity,
    score: s.score,
    confidence,
    whyMatched: s.whyMatched.slice(0, 3),
    differentiator: s.differentiator,
    preliminaryNotice: 'Preliminary identification, not a certified laboratory diagnosis.',
    culturalControl: p.culturalControl,
    biologicalControl: p.biologicalControl,
    organicControl: p.organicControl,
    chemicalControl: p.chemicalControl,
    imageUrl: primaryImg?.path || '/problems/placeholder-crop-health.webp',
  };
}
