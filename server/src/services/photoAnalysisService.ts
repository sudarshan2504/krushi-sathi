import sharp from 'sharp';
import { PrismaClient } from '@prisma/client';
import { getGeminiClient } from './aiService';
import { config } from '../config';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export interface PhotoInputItem {
  kind: 'closeup_leaf' | 'whole_plant' | 'underside_stem';
  dataUrl: string; // base64 data url
}

export interface AnalyzePhotoRequest {
  photos: PhotoInputItem[];
  crop: string;
  cropSlug: string;
  location?: { state?: string; district?: string };
  season?: string;
  weather?: { humidity?: number; temperature?: number; condition?: string };
  guidedTags?: {
    plantPart?: string;
    pattern?: string;
    colour?: string;
    spread?: string;
    onset?: string;
    note?: string;
  };
  consentToStore?: boolean;
  language?: 'en' | 'kn' | 'ta' | 'te';
}

export interface GeminiCandidate {
  slug: string;
  confidence: 'high' | 'medium' | 'low';
  matchedSigns: string[];
  notMatchingSigns: string[];
}

export interface GeminiVisionResponse {
  plantVisible: boolean;
  imageQuality: 'good' | 'poor';
  observedSigns: string[];
  healthy: boolean;
  candidates: GeminiCandidate[];
  unknownOrOutsideCatalog: boolean;
  followUpQuestion: string | null;
  retakeAdvice: string | null;
}

export interface PhotoAnalysisResult {
  success: boolean;
  photoAnalysisAvailable: boolean;
  plantVisible: boolean;
  imageQuality: 'good' | 'poor';
  observedSigns: string[];
  healthy: boolean;
  unknownOrOutsideCatalog: boolean;
  followUpQuestion: string | null;
  retakeAdvice: string | null;
  confidence: 'high' | 'medium' | 'low';
  candidates: any[];
  disagreementDetected?: boolean;
  savedPhotoPath?: string;
  notice: string;
  kvkAdvisory: string;
  message?: string;
}

/**
 * Validate image buffer magic bytes (JPEG, PNG, WebP)
 */
function validateMagicBytes(buffer: Buffer): { isValid: boolean; mimeType?: string } {
  if (buffer.length < 12) return { isValid: false };

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { isValid: true, mimeType: 'image/jpeg' };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { isValid: true, mimeType: 'image/png' };
  }

  // WebP: 'RIFF' .... 'WEBP'
  const riff = buffer.toString('ascii', 0, 4);
  const webp = buffer.toString('ascii', 8, 12);
  if (riff === 'RIFF' && webp === 'WEBP') {
    return { isValid: true, mimeType: 'image/webp' };
  }

  return { isValid: false };
}

/**
 * Strips EXIF / GPS metadata and resizes image to max 1280px WebP
 */
async function sanitizeAndStripExif(buffer: Buffer): Promise<Buffer> {
  return await sharp(buffer)
    .rotate() // auto-orient based on EXIF before stripping
    .resize(1280, 1280, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer();
}

/**
 * Main Service: Real Multi-Photo Crop Health Analysis with Gemini Vision
 */
export async function analyzeCropPhotos(
  req: AnalyzePhotoRequest
): Promise<PhotoAnalysisResult> {
  const language = req.language || 'en';

  // 1. Verify GEMINI_API_KEY presence
  if (!config.geminiApiKey || config.geminiApiKey.trim() === '') {
    return {
      success: false,
      photoAnalysisAvailable: false,
      plantVisible: false,
      imageQuality: 'poor',
      observedSigns: [],
      healthy: false,
      unknownOrOutsideCatalog: true,
      followUpQuestion: null,
      retakeAdvice: null,
      confidence: 'low',
      candidates: [],
      notice: 'Preliminary suggestion, not a confirmed diagnosis.',
      kvkAdvisory: 'Consult your local KVK or Raitha Samparka Kendra.',
      message: 'Photo analysis is currently unavailable because GEMINI_API_KEY is not configured on the server. Please use the Guided Symptom Checker below.',
    };
  }

  const gemini = getGeminiClient();
  if (!gemini) {
    return {
      success: false,
      photoAnalysisAvailable: false,
      plantVisible: false,
      imageQuality: 'poor',
      observedSigns: [],
      healthy: false,
      unknownOrOutsideCatalog: true,
      followUpQuestion: null,
      retakeAdvice: null,
      confidence: 'low',
      candidates: [],
      notice: 'Preliminary suggestion, not a confirmed diagnosis.',
      kvkAdvisory: 'Consult your local KVK or Raitha Samparka Kendra.',
      message: 'Gemini client initialization failed. Please check server configuration.',
    };
  }

  // 2. Validate Photos
  if (!req.photos || !Array.isArray(req.photos) || req.photos.length === 0) {
    throw new Error('At least one plant photo is required for visual analysis.');
  }

  if (req.photos.length > 3) {
    throw new Error('A maximum of 3 photos (closeup, whole plant, underside/stem) can be submitted.');
  }

  const processedImages: { kind: string; cleanBuffer: Buffer; base64: string; mimeType: string }[] = [];

  for (let i = 0; i < req.photos.length; i++) {
    const item = req.photos[i];
    const match = (item.dataUrl || '').match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    if (!match) {
      throw new Error(`Invalid image format at photo index #${i + 1}. Expected base64 data URL.`);
    }

    const rawBuffer = Buffer.from(match[2], 'base64');
    const magicCheck = validateMagicBytes(rawBuffer);
    if (!magicCheck.isValid) {
      throw new Error(`File at photo index #${i + 1} is not a valid JPEG, PNG, or WebP image.`);
    }

    // Strip EXIF / GPS and compress
    const cleanBuffer = await sanitizeAndStripExif(rawBuffer);
    processedImages.push({
      kind: item.kind,
      cleanBuffer,
      base64: cleanBuffer.toString('base64'),
      mimeType: 'image/webp',
    });
  }

  // 3. Optionally Save Photo If Consent Granted
  let savedPhotoPath: string | undefined;
  if (req.consentToStore && processedImages.length > 0) {
    try {
      const uploadDir = path.resolve(__dirname, '../../uploads/crop-health-feedback');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const filename = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.webp`;
      const fullPath = path.join(uploadDir, filename);
      fs.writeFileSync(fullPath, processedImages[0].cleanBuffer);
      savedPhotoPath = `/uploads/crop-health-feedback/${filename}`;
    } catch (saveErr: any) {
      console.warn('[photoAnalysisService] Could not persist consented image:', saveErr.message);
    }
  }

  // 4. Retrieve candidate problems from database for the selected crop + relevant look-alikes
  const cropQuery = (req.cropSlug || req.crop || '').toLowerCase().trim();

  // Find all problems associated with this crop
  const primaryProblems = await prisma.problem.findMany({
    where: {
      crops: {
        some: {
          OR: [
            { cropSlug: { contains: cropQuery } },
            { cropName: { contains: cropQuery } },
          ],
        },
      },
    },
    include: {
      crops: true,
      images: true,
      symptomTags: {
        include: { symptomTag: true },
      },
    },
  });

  // Also fetch general look-alike problems from other crops to prevent false positives
  const otherProblems = await prisma.problem.findMany({
    where: {
      crops: {
        none: {
          OR: [
            { cropSlug: { contains: cropQuery } },
            { cropName: { contains: cropQuery } },
          ],
        },
      },
    },
    take: 6,
    include: {
      crops: true,
      images: true,
      symptomTags: {
        include: { symptomTag: true },
      },
    },
  });

  const allCandidateProblems = [...primaryProblems, ...otherProblems];

  // Construct strict candidate summary for Gemini prompt
  const candidateDomain = allCandidateProblems.map(p => ({
    slug: p.slug,
    name: p.name,
    type: p.type,
    severity: p.severity,
    symptoms: p.symptoms.substring(0, 160),
    keySigns: p.symptomTags.map(st => `${st.symptomTag.plantPart}:${st.symptomTag.pattern}`).slice(0, 5),
    isPrimaryHost: primaryProblems.some(pp => pp.id === p.id),
  }));

  // 5. Construct Gemini Multimodal Prompt
  const languageNames: Record<string, string> = {
    en: 'English',
    kn: 'Kannada (ಕನ್ನಡ)',
    ta: 'Tamil (தமிழ்)',
    te: 'Telugu (తెలుగు)',
  };
  const targetLangName = languageNames[language] || 'English';

  const systemInstruction = `You are an expert ICAR (Indian Council of Agricultural Research) diagnostic entomologist and plant pathologist.
You are assisting Indian smallholder farmers by examining real field photos of a ${req.crop || 'crop'} plant.

STRICT CONSTRAINTS:
1. You are an advisory assistant, NOT giving a certified laboratory diagnosis. Label all findings as preliminary observations.
2. You MUST identify candidates ONLY from the provided candidate list below. NEVER invent problem slugs or diseases.
3. If the photo does not clearly match any candidate, or if the photo is blurry, unidentifiable, or shows an unrelated plant or object:
   - Set "unknownOrOutsideCatalog": true
   - Set "candidates": []
   - Provide friendly "retakeAdvice" and a helpful "followUpQuestion".
4. NEVER provide chemical dosages or instructions to buy proprietary brands.
5. Provide the "observedSigns", "matchedSigns", "notMatchingSigns", and "followUpQuestion" in ${targetLangName}.
6. Describe only what is physically observable in the submitted photos (e.g. leaf spots, yellowing veins, holes, caterpillars, powdery bloom).`;

  const userPrompt = `Crop Name: ${req.crop} (Season: ${req.season || 'Current'}, Weather: ${req.weather?.condition || 'Moderate'})
${req.guidedTags?.note ? `Farmer's Note: "${req.guidedTags.note}"` : ''}

Candidate Problems Domain for ${req.crop}:
${JSON.stringify(candidateDomain, null, 2)}

Instructions:
Carefully inspect the provided ${processedImages.length} photo(s).
Analyze whether a real plant/crop is visible, evaluate image quality, record visible pathological symptoms, and match up to 3 candidate slugs strictly from the supplied domain.

Respond strictly in valid JSON matching this schema without markdown code blocks:
{
  "plantVisible": true or false,
  "imageQuality": "good" or "poor",
  "observedSigns": ["Clear physical signs visible in photo in ${targetLangName}"],
  "healthy": true or false,
  "candidates": [
    {
      "slug": "slug-from-supplied-list-only",
      "confidence": "high" or "medium" or "low",
      "matchedSigns": ["Visible signs that match this problem in ${targetLangName}"],
      "notMatchingSigns": ["Key signs of this problem missing from photo in ${targetLangName}"]
    }
  ],
  "unknownOrOutsideCatalog": true or false,
  "followUpQuestion": "A clarifying question for the farmer in ${targetLangName} to distinguish this from look-alikes" or null,
  "retakeAdvice": "Actionable advice in ${targetLangName} if photo is dark, blurry, or at a bad angle" or null
}`;

  // Build multimodal contents array
  const contents: any[] = [
    { text: systemInstruction },
    ...processedImages.map(img => ({
      inlineData: {
        mimeType: img.mimeType,
        data: img.base64,
      },
    })),
    { text: userPrompt },
  ];

  // 6. Execute Gemini Call with Retry
  let geminiOutput: GeminiVisionResponse | null = null;
  const preferredModel = (config.geminiModel || 'gemini-2.0-flash').trim();

  try {
    const response = await gemini.models.generateContent({
      model: preferredModel,
      contents,
    });

    const rawText = response.text || '';
    const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    geminiOutput = JSON.parse(cleaned);
  } catch (firstErr: any) {
    console.warn(`[photoAnalysisService] First Gemini attempt with ${preferredModel} failed: ${firstErr.message}. Retrying once with gemini-3.8-flash...`);
    try {
      const retryResponse = await gemini.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
      });
      const rawText = retryResponse.text || '';
      const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      geminiOutput = JSON.parse(cleaned);
    } catch (retryErr: any) {
      console.error('[photoAnalysisService] Gemini Vision analysis failed after retry:', retryErr.message);
      // Return honest error with guided symptom fallback recommendation
      return {
        success: false,
        photoAnalysisAvailable: true,
        plantVisible: true,
        imageQuality: 'good',
        observedSigns: [],
        healthy: false,
        unknownOrOutsideCatalog: true,
        followUpQuestion: 'Could you select your observed symptoms in the Guided Symptom Checker below?',
        retakeAdvice: 'AI image analysis is currently experiencing high load. You can continue using our guided symptom checker.',
        confidence: 'low',
        candidates: [],
        notice: 'Preliminary suggestion, not a confirmed diagnosis.',
        kvkAdvisory: 'Visit your nearest Raitha Samparka Kendra (RSK) or KVK.',
        message: 'AI Vision analysis is temporarily busy (Quota or Timeout). Please use the Guided Symptom Checker below.',
      };
    }
  }

  if (!geminiOutput) {
    throw new Error('Failed to parse response from agricultural vision model.');
  }

  // 7. Server-side validation of candidates: DROP any slug not in candidateDomain
  const validSlugs = new Set(allCandidateProblems.map(p => p.slug));
  const sanitizedCandidates: GeminiCandidate[] = (geminiOutput.candidates || [])
    .filter(c => validSlugs.has(c.slug))
    .slice(0, 3);

  // Confidence Cap Rules:
  // - If imageQuality === 'poor' or only 1 photo submitted, cap confidence at 'medium'
  const isSinglePhoto = processedImages.length === 1;
  const isPoorQuality = geminiOutput.imageQuality === 'poor';

  for (const c of sanitizedCandidates) {
    if ((isSinglePhoto || isPoorQuality) && c.confidence === 'high') {
      c.confidence = 'medium';
    }
  }

  // 8. Combine with Guided Symptom Tags (if farmer also answered wizard questions)
  let disagreementDetected = false;
  let finalCandidates: any[] = [];

  const matchedProblemRecords = sanitizedCandidates.map(c => {
    const prob = allCandidateProblems.find(p => p.slug === c.slug)!;
    return {
      candidate: c,
      problem: prob,
    };
  });

  if (req.guidedTags?.pattern && matchedProblemRecords.length > 0) {
    const userPattern = req.guidedTags.pattern.toLowerCase();
    const topMatch = matchedProblemRecords[0];
    const topHasPattern = topMatch.problem.symptomTags.some(
      st => st.symptomTag.pattern.toLowerCase() === userPattern
    );

    // If guided pattern conflicts with Gemini's top pick, lower confidence and highlight disagreement
    if (!topHasPattern) {
      disagreementDetected = true;
      if (topMatch.candidate.confidence === 'high') topMatch.candidate.confidence = 'medium';
      else if (topMatch.candidate.confidence === 'medium') topMatch.candidate.confidence = 'low';
    }
  }

  // Map to rich candidate output with verified treatment ladder and local images
  finalCandidates = matchedProblemRecords.map(({ candidate, problem }) => {
    const primaryImg = problem.images?.find(img => img.isPrimary) || problem.images?.[0];
    const localGallery = (problem.images || []).map(img => ({
      path: img.path,
      caption: (language === 'kn' && img.captionKn) ? img.captionKn :
               (language === 'ta' && img.captionTa) ? img.captionTa :
               (language === 'te' && img.captionTe) ? img.captionTe : img.caption,
      kind: img.kind,
      author: img.author,
      licence: img.licence,
    }));

    let lookAlikesParsed = [];
    try {
      lookAlikesParsed = typeof problem.lookAlikes === 'string' ? JSON.parse(problem.lookAlikes) : problem.lookAlikes || [];
    } catch {
      lookAlikesParsed = [];
    }

    return {
      id: problem.slug,
      slug: problem.slug,
      name: problem.name,
      nameKannada: problem.nameKn,
      nameTamil: problem.nameTa,
      nameTelugu: problem.nameTe,
      scientificName: problem.scientificName,
      type: problem.type,
      severity: problem.severity,
      confidence: candidate.confidence,
      matchedSigns: candidate.matchedSigns,
      notMatchingSigns: candidate.notMatchingSigns,
      // Verified treatment ladder from DB (zero invented doses)
      culturalControl: (language === 'kn' && problem.culturalControlKn) ? problem.culturalControlKn :
                       (language === 'ta' && problem.culturalControlTa) ? problem.culturalControlTa :
                       (language === 'te' && problem.culturalControlTe) ? problem.culturalControlTe : problem.culturalControl,
      biologicalControl: (language === 'kn' && problem.biologicalControlKn) ? problem.biologicalControlKn :
                         (language === 'ta' && problem.biologicalControlTa) ? problem.biologicalControlTa :
                         (language === 'te' && problem.biologicalControlTe) ? problem.biologicalControlTe : problem.biologicalControl,
      organicControl: (language === 'kn' && problem.organicControlKn) ? problem.organicControlKn :
                      (language === 'ta' && problem.organicControlTa) ? problem.organicControlTa :
                      (language === 'te' && problem.organicControlTe) ? problem.organicControlTe : problem.organicControl,
      chemicalControl: (language === 'kn' && problem.chemicalControlKn) ? problem.chemicalControlKn :
                       (language === 'ta' && problem.chemicalControlTa) ? problem.chemicalControlTa :
                       (language === 'te' && problem.chemicalControlTe) ? problem.chemicalControlTe : problem.chemicalControl,
      safetyNotes: problem.safetyNotes,
      lookAlikes: lookAlikesParsed,
      imageUrl: primaryImg?.path || '/problems/placeholder-crop-health.webp',
      referenceImages: localGallery,
      whenToCallExpert: (language === 'kn' && problem.whenToCallExpertKn) ? problem.whenToCallExpertKn :
                        (language === 'ta' && problem.whenToCallExpertTa) ? problem.whenToCallExpertTa :
                        (language === 'te' && problem.whenToCallExpertTe) ? problem.whenToCallExpertTe : problem.whenToCallExpert,
    };
  });

  const overallConfidence = finalCandidates.length > 0 ? finalCandidates[0].confidence : 'low';
  const isUncertain = geminiOutput.unknownOrOutsideCatalog || finalCandidates.length === 0 || overallConfidence === 'low';

  return {
    success: true,
    photoAnalysisAvailable: true,
    plantVisible: geminiOutput.plantVisible,
    imageQuality: geminiOutput.imageQuality,
    observedSigns: geminiOutput.observedSigns || [],
    healthy: geminiOutput.healthy || false,
    unknownOrOutsideCatalog: isUncertain,
    followUpQuestion: geminiOutput.followUpQuestion,
    retakeAdvice: geminiOutput.retakeAdvice,
    confidence: overallConfidence,
    candidates: finalCandidates,
    disagreementDetected,
    savedPhotoPath,
    notice: 'Preliminary suggestion, not a confirmed diagnosis. Always verify with your local agricultural officer before spraying chemical pesticides. Follow the registered container label.',
    kvkAdvisory: 'If symptoms persist or spread rapidly, contact Kisan Call Centre (Toll Free: 1800-180-1551) or visit your nearest Raitha Samparka Kendra / Krishi Vigyan Kendra.',
  };
}
