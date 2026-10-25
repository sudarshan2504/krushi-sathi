import { Router, Request, Response } from 'express';
import prisma from '../utils/prisma';
import { config } from '../config';
import { diagnoseCropProblem } from '../services/diagnosisService';
import { analyzeCropPhotos } from '../services/photoAnalysisService';

const router = Router();

// Helper to format a Problem record into API response with backward-compatible aliases
export function formatProblemResponse(p: any) {
  const primaryImg = p.images?.find((img: any) => img.isPrimary) || p.images?.[0];
  const cropNames = p.crops?.map((pc: any) => pc.cropName) || [];
  const cropSlugs = p.crops?.map((pc: any) => pc.cropSlug) || [];

  let seasons: string[] = [];
  try {
    seasons = typeof p.favourableSeasons === 'string' ? JSON.parse(p.favourableSeasons) : p.favourableSeasons || [];
  } catch {
    seasons = [];
  }

  let stages: string[] = [];
  try {
    stages = typeof p.affectedStages === 'string' ? JSON.parse(p.affectedStages) : p.affectedStages || [];
  } catch {
    stages = [];
  }

  let ipm: string[] = [];
  try {
    ipm = typeof p.ipmSteps === 'string' ? JSON.parse(p.ipmSteps) : p.ipmSteps || [];
  } catch {
    ipm = [];
  }

  let ipmKn: string[] = [];
  try {
    ipmKn = typeof p.ipmStepsKn === 'string' ? JSON.parse(p.ipmStepsKn) : p.ipmStepsKn || [];
  } catch {
    ipmKn = [];
  }

  let ipmTa: string[] = [];
  try {
    ipmTa = typeof p.ipmStepsTa === 'string' ? JSON.parse(p.ipmStepsTa) : p.ipmStepsTa || [];
  } catch {
    ipmTa = [];
  }

  let ipmTe: string[] = [];
  try {
    ipmTe = typeof p.ipmStepsTe === 'string' ? JSON.parse(p.ipmStepsTe) : p.ipmStepsTe || [];
  } catch {
    ipmTe = [];
  }

  let lookAlikesList: any[] = [];
  try {
    lookAlikesList = typeof p.lookAlikes === 'string' ? JSON.parse(p.lookAlikes) : p.lookAlikes || [];
  } catch {
    lookAlikesList = [];
  }

  return {
    ...p,
    // Backward-compatibility properties
    id: p.slug, // ensure consistent slug-based routing
    dbId: p.id,
    nameKannada: p.nameKn,
    nameTamil: p.nameTa,
    nameTelugu: p.nameTe,
    affectedCrops: cropNames,
    cropSlugs,
    conditions: p.favourableConditions,
    prevention: p.culturalControl,
    preventionKn: p.culturalControlKn,
    preventionTa: p.culturalControlTa,
    preventionTe: p.culturalControlTe,
    ipmSteps: ipm,
    ipmStepsKn: ipmKn,
    ipmStepsTa: ipmTa,
    ipmStepsTe: ipmTe,
    expertAdvice: p.whenToCallExpert,
    expertAdviceKn: p.whenToCallExpertKn,
    expertAdviceTa: p.whenToCallExpertTa,
    expertAdviceTe: p.whenToCallExpertTe,
    imageUrl: primaryImg?.path || '/problems/placeholder-crop-health.webp',
    favourableSeasons: seasons,
    affectedStages: stages,
    lookAlikes: lookAlikesList,
  };
}

// 1. Get structured Symptom Tags for Diagnostic Flow
router.get('/tags/all', async (_req: Request, res: Response) => {
  try {
    const tags = await prisma.symptomTag.findMany({
      orderBy: [{ plantPart: 'asc' }, { pattern: 'asc' }],
    });
    res.json({
      success: true,
      data: tags,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch symptom tags' });
  }
});

// 2. List all crops from Database with localized names & problem counts
router.get('/crops/catalog', async (_req: Request, res: Response) => {
  try {
    const crops = await prisma.crop.findMany({
      include: {
        problemCrops: {
          select: { problemId: true, importance: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    const formatted = crops.map(c => ({
      id: c.id,
      name: c.name,
      scientificName: c.scientificName,
      nameKannada: c.nameKannada,
      nameTamil: c.nameTamil,
      nameTelugu: c.nameTelugu,
      category: c.category,
      imageUrl: c.imageUrl,
      problemCount: c.problemCrops.length,
      primaryProblemCount: c.problemCrops.filter(pc => pc.importance === 'primary').length,
    }));

    res.json({
      success: true,
      data: formatted,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch crop catalog' });
  }
});

// 3. List all problems / diseases with crop, type, severity, season, stage & multilingual search filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const { crop, type, severity, stage, season, search } = req.query;

    const where: any = {};

    if (type && type !== 'all') {
      where.type = String(type);
    }

    if (severity && severity !== 'all') {
      where.severity = String(severity);
    }

    const rawProblems = await prisma.problem.findMany({
      where,
      include: {
        crops: {
          include: { crop: true },
        },
        symptomTags: {
          include: { symptomTag: true },
        },
        images: true,
      },
      orderBy: [{ severity: 'desc' }, { name: 'asc' }],
    });

    let problems = rawProblems.map(formatProblemResponse);

    // Filter by Crop
    if (crop && crop !== 'all') {
      const cropQuery = String(crop).toLowerCase().trim();
      problems = problems.filter(p => {
        const hasCropMatch = p.cropSlugs.some((s: string) => s.toLowerCase() === cropQuery || s.toLowerCase().includes(cropQuery));
        const hasNameMatch = p.affectedCrops.some((n: string) => n.toLowerCase().includes(cropQuery));
        return hasCropMatch || hasNameMatch;
      });
    }

    // Filter by Stage
    if (stage && stage !== 'all') {
      const stageQuery = String(stage).toLowerCase();
      problems = problems.filter(p => p.affectedStages.some((s: string) => s.toLowerCase().includes(stageQuery)));
    }

    // Filter by Season
    if (season && season !== 'all') {
      const seasonQuery = String(season).toLowerCase();
      problems = problems.filter(p => p.favourableSeasons.some((s: string) => s.toLowerCase().includes(seasonQuery)));
    }

    // Multilingual Search matching names, symptoms, and symptom tags
    if (search && String(search).trim()) {
      const q = String(search).toLowerCase().trim();
      problems = problems.filter(p => {
        const textMatch =
          p.name.toLowerCase().includes(q) ||
          p.nameKn?.toLowerCase().includes(q) ||
          p.nameTa?.toLowerCase().includes(q) ||
          p.nameTe?.toLowerCase().includes(q) ||
          p.scientificName?.toLowerCase().includes(q) ||
          p.symptoms.toLowerCase().includes(q) ||
          p.symptomsKn?.toLowerCase().includes(q) ||
          p.symptomsTa?.toLowerCase().includes(q) ||
          p.symptomsTe?.toLowerCase().includes(q);

        const tagMatch = p.symptomTags?.some((ps: any) =>
          ps.symptomTag.labelEn.toLowerCase().includes(q) ||
          ps.symptomTag.labelKn.toLowerCase().includes(q) ||
          ps.symptomTag.labelTa.toLowerCase().includes(q) ||
          ps.symptomTag.labelTe.toLowerCase().includes(q)
        );

        return textMatch || tagMatch;
      });
    }

    res.json({
      success: true,
      count: problems.length,
      data: problems,
    });
  } catch (err: any) {
    console.error('Error fetching problems:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve problems from database' });
  }
});

// 4. Get single problem by slug or ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const problem = await prisma.problem.findFirst({
      where: {
        OR: [{ slug: id }, { id: id }],
      },
      include: {
        crops: {
          include: { crop: true },
        },
        symptomTags: {
          include: { symptomTag: true },
        },
        images: true,
      },
    });

    if (!problem) {
      return res.status(404).json({ success: false, message: 'Crop health problem not found' });
    }

    res.json({
      success: true,
      data: formatProblemResponse(problem),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error retrieving problem details' });
  }
});

// In-memory rate limiting map (IP -> timestamps array)
const rateLimitMap = new Map<string, number[]>();

function checkRateLimit(ip: string, maxRequests = 30, windowMs = 60000): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  const validTimestamps = timestamps.filter(t => now - t < windowMs);

  if (validTimestamps.length >= maxRequests) {
    return false;
  }

  validTimestamps.push(now);
  rateLimitMap.set(ip, validTimestamps);
  return true;
}

// 5. Intelligent /diagnose (Reads from Database, Weighted Scoring, Multilingual Note, Gemini Vision)
router.post('/diagnose', async (req: Request, res: Response) => {
  try {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    if (!checkRateLimit(clientIp)) {
      return res.status(429).json({
        success: false,
        message: 'Rate limit exceeded. Please wait a minute before requesting another crop diagnosis.',
      });
    }

    const {
      crop,
      cropName,
      cropSlug,
      plantPart,
      pattern,
      colour,
      spread,
      stage,
      onset,
      note,
      symptomsDescription,
      imageData,
      image,
      consentToStoreImage,
      weather,
    } = req.body;

    const effectiveCrop = cropSlug || crop || cropName;
    const effectiveNote = note || symptomsDescription;
    const effectiveImage = imageData || image;

    const result = await diagnoseCropProblem({
      crop: effectiveCrop,
      cropSlug: cropSlug || (effectiveCrop ? effectiveCrop.toLowerCase().replace(/[^a-z0-9]/g, '-') : undefined),
      plantPart,
      pattern,
      colour,
      spread,
      stage,
      onset,
      note: effectiveNote,
      imageData: effectiveImage,
      consentToStoreImage: Boolean(consentToStoreImage),
      weather,
    });

    res.json(result);
  } catch (err: any) {
    console.error('Diagnosis route error:', err);
    res.status(500).json({
      success: false,
      message: 'Crop diagnosis service error. Please consult your local Krishi Vigyan Kendra.',
    });
  }
});

// 6. REAL MULTI-PHOTO VISION ANALYSIS (POST /api/diseases/analyze-photo)
router.post('/analyze-photo', async (req: Request, res: Response) => {
  try {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    if (!checkRateLimit(clientIp, 15, 60000)) {
      return res.status(429).json({
        success: false,
        message: 'Rate limit exceeded. Please wait a minute before requesting another photo analysis.',
      });
    }

    const {
      photos,
      crop,
      cropSlug,
      location,
      season,
      weather,
      guidedTags,
      consentToStore,
      language,
    } = req.body;

    if (!crop && !cropSlug) {
      return res.status(400).json({
        success: false,
        message: 'Crop selection is required for visual analysis.',
      });
    }

    if (!photos || !Array.isArray(photos) || photos.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one plant photo is required.',
      });
    }

    const result = await analyzeCropPhotos({
      photos,
      crop: crop || cropSlug,
      cropSlug: cropSlug || (crop ? crop.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'crop'),
      location,
      season,
      weather,
      guidedTags,
      consentToStore: Boolean(consentToStore),
      language: ['en', 'kn', 'ta', 'te'].includes(language) ? language : 'en',
    });

    res.json(result);
  } catch (err: any) {
    console.error('[diseaseRoutes] analyze-photo error:', err.message);
    res.status(500).json({
      success: false,
      message: err.message || 'Error occurred during plant photo analysis.',
    });
  }
});

// 7. RECORD DIAGNOSIS ACCURACY FEEDBACK (POST /api/diseases/feedback)
router.post('/feedback', async (req: Request, res: Response) => {
  try {
    const {
      problemSlug,
      confidence,
      crop,
      rating,
      farmerCorrection,
      notes,
      hasConsent,
      storedImagePath,
    } = req.body;

    if (!problemSlug || !rating) {
      return res.status(400).json({
        success: false,
        message: 'problemSlug and rating are required.',
      });
    }

    const feedback = await prisma.diagnosisFeedback.create({
      data: {
        problemSlug: String(problemSlug),
        confidence: String(confidence || 'medium'),
        crop: String(crop || 'unknown'),
        rating: String(rating), // 'correct' | 'incorrect' | 'not_sure'
        farmerCorrection: farmerCorrection ? String(farmerCorrection) : null,
        notes: notes ? String(notes) : null,
        hasConsent: Boolean(hasConsent),
        storedImagePath: storedImagePath ? String(storedImagePath) : null,
      },
    });

    res.json({
      success: true,
      message: 'Feedback recorded successfully. Thank you for helping improve Krushi Sathi!',
      data: feedback,
    });
  } catch (err: any) {
    console.error('[diseaseRoutes] feedback error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to record diagnosis feedback.',
    });
  }
});

export default router;

