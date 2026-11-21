import { Router, Request, Response } from 'express';
import multer from 'multer';
import prisma from '../utils/prisma';
import { config } from '../config';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { createRateLimiter } from '../middleware/rateLimiter';
import { diagnoseCropProblem } from '../services/diagnosisService';
import { analyzeCropPhotos } from '../services/photoAnalysisService';
import { getCropImageMetadataMap } from '../services/cropImageService';
import { diagnoseCropPhotos, validateImageBuffer } from '../services/photoDiagnosisService';
import { generateReportPdf } from '../services/reportPdfService';

const router = Router();

const photoUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max
    files: 3,
  },
});

function handlePhotoUpload(req: Request, res: Response, next: any) {
  photoUpload.array('images', 3)(req, res, (err: any) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File size exceeds maximum permitted limit of 5 MB',
        });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE' || err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          message: 'Maximum 3 photos are permitted per diagnosis.',
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || 'Image upload error',
      });
    }
    next();
  });
}

const photoDiagnoseRateLimiter = createRateLimiter({
  keyPrefix: 'photo-diagnose',
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10,
  message: 'Rate limit exceeded. You can submit up to 10 crop photo diagnoses per hour.',
});

function parsePositiveInt(val: string | undefined, fallback: number): number {
  const parsed = parseInt(val || '', 10);
  return !isNaN(parsed) && parsed > 0 ? parsed : fallback;
}

const diagnoseRateLimiter = createRateLimiter({
  keyPrefix: 'disease-diagnose',
  windowMs: 60 * 1000,
  maxRequests: () => parsePositiveInt(process.env.DIAGNOSE_RATE_LIMIT_MAX, 30),
  message: 'Rate limit exceeded. Please wait a minute before requesting another crop diagnosis.',
});

const analyzePhotoRateLimiter = createRateLimiter({
  keyPrefix: 'disease-photo',
  windowMs: 60 * 1000,
  maxRequests: () => parsePositiveInt(process.env.ANALYZE_PHOTO_RATE_LIMIT_MAX, 15),
  message: 'Rate limit exceeded. Please wait a minute before requesting another photo analysis.',
});

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

    const metaMap = getCropImageMetadataMap();
    const formatted = crops.map(c => {
      const meta = metaMap.get(c.id);
      const imageStatus = meta?.status || 'approved';
      return {
        id: c.id,
        name: c.name,
        scientificName: c.scientificName,
        nameKannada: c.nameKannada,
        nameTamil: c.nameTamil,
        nameTelugu: c.nameTelugu,
        category: c.category,
        imageStatus,
        imageUrl: imageStatus === 'use-fallback' ? '' : `/crops/${c.id}.webp`,
        problemCount: c.problemCrops.length,
        primaryProblemCount: c.problemCrops.filter(pc => pc.importance === 'primary').length,
      };
    });

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

// 4. PHOTO-BASED CROP HEALTH DIAGNOSIS (POST /api/diseases/diagnose-image)
router.post(
  '/diagnose-image',
  authMiddleware,
  photoDiagnoseRateLimiter,
  handlePhotoUpload,
  async (req: AuthRequest, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'At least one plant photo is required for diagnosis.',
        });
      }

      const { cropId, userNote, language } = req.body;
      const effectiveLanguage = ['en', 'kn', 'ta', 'te'].includes(language) ? language : 'en';

      // Validate files by magic bytes
      for (const file of files) {
        const val = validateImageBuffer(file.buffer);
        if (!val.valid) {
          return res.status(400).json({
            success: false,
            message: val.error || 'Invalid image file provided. Only JPEG, PNG, or WebP permitted.',
          });
        }
      }

      const result = await diagnoseCropPhotos({
        userId: req.user!.id,
        files,
        cropId: cropId === 'unsure' ? undefined : cropId,
        userNote,
        language: effectiveLanguage,
      });

      // Persist in Prisma DiseaseReport table
      const reportRecord = await prisma.diseaseReport.create({
        data: {
          userId: req.user!.id,
          cropId: cropId || null,
          resultJson: JSON.stringify(result.report),
          language: effectiveLanguage,
          thumbnailPath: result.thumbnailRelativePath || null,
        },
      });

      res.json({
        success: true,
        data: {
          id: reportRecord.id,
          thumbnailPath: result.thumbnailRelativePath,
          createdAt: reportRecord.createdAt,
          ...result.report,
        },
      });
    } catch (err: any) {
      console.error('[diseaseRoutes] diagnose-image error:', err.message);
      res.status(500).json({
        success: false,
        message: err.message || 'Error occurred during photo-based crop diagnosis.',
      });
    }
  }
);

// 5. LIST USER'S SAVED DIAGNOSTIC REPORTS (GET /api/diseases/reports)
router.get('/reports', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const reports = await prisma.diseaseReport.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = reports.map(r => {
      let data: any = {};
      try {
        data = JSON.parse(r.resultJson);
      } catch {}

      return {
        id: r.id,
        cropId: r.cropId,
        language: r.language,
        thumbnailPath: r.thumbnailPath,
        createdAt: r.createdAt,
        crop: data.crop || { name: 'Crop' },
        status: data.status || 'unclear',
        topFindings: data.topFindings || [],
        verifiedSource: data.verifiedSource || 'AI-generated, verify with an expert',
        isSample: Boolean(data.isSample),
      };
    });

    res.json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (err: any) {
    console.error('[diseaseRoutes] reports list error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve diagnostic reports.',
    });
  }
});

// 6. GET SINGLE DIAGNOSTIC REPORT (GET /api/diseases/reports/:id)
router.get('/reports/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const report = await prisma.diseaseReport.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id,
      },
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Diagnostic report not found.',
      });
    }

    let reportData: any = {};
    try {
      reportData = JSON.parse(report.resultJson);
    } catch {
      reportData = {};
    }

    res.json({
      success: true,
      data: {
        id: report.id,
        cropId: report.cropId,
        language: report.language,
        thumbnailPath: report.thumbnailPath,
        createdAt: report.createdAt,
        ...reportData,
      },
    });
  } catch (err: any) {
    console.error('[diseaseRoutes] single report error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve diagnostic report details.',
    });
  }
});

// 7. DELETE DIAGNOSTIC REPORT (DELETE /api/diseases/reports/:id)
router.delete('/reports/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const report = await prisma.diseaseReport.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id,
      },
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Diagnostic report not found.',
      });
    }

    await prisma.diseaseReport.delete({
      where: { id: req.params.id },
    });

    res.json({
      success: true,
      message: 'Diagnostic report deleted successfully.',
    });
  } catch (err: any) {
    console.error('[diseaseRoutes] delete report error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to delete diagnostic report.',
    });
  }
});

// 8. DOWNLOAD DETAILED PDF REPORT (GET /api/diseases/reports/:id/pdf)
router.get('/reports/:id/pdf', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const report = await prisma.diseaseReport.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id,
      },
      include: {
        user: {
          select: { name: true },
        },
      },
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Diagnostic report not found.',
      });
    }

    let reportData: any = {};
    try {
      reportData = JSON.parse(report.resultJson);
    } catch {
      return res.status(500).json({
        success: false,
        message: 'Report data is corrupted and cannot be rendered to PDF.',
      });
    }

    const pdfBuffer = await generateReportPdf({
      reportId: report.id,
      reportData,
      farmerName: report.user?.name || 'Farmer',
      language: report.language || 'en',
      thumbnailPath: report.thumbnailPath,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="krushi-sathi-report-${report.id}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.end(pdfBuffer);
  } catch (err: any) {
    console.error('[diseaseRoutes] PDF generation error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to generate PDF report.',
    });
  }
});

// 9. Get single problem by slug or ID
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

// 5. Intelligent /diagnose (Auth + Rate Limited; reads from Database, Weighted Scoring, Multilingual Note, Gemini Vision)
router.post('/diagnose', authMiddleware, diagnoseRateLimiter, async (req: AuthRequest, res: Response) => {
  try {
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

    if (!effectiveCrop && !plantPart && !pattern && !colour && !effectiveNote && !effectiveImage) {
      return res.status(400).json({
        success: false,
        message: 'Please specify a crop, symptoms, or plant photo for diagnosis.',
      });
    }

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
router.post('/analyze-photo', authMiddleware, analyzePhotoRateLimiter, async (req: AuthRequest, res: Response) => {
  try {
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
router.post('/feedback', authMiddleware, async (req: AuthRequest, res: Response) => {
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

    const VALID_RATINGS = ['correct', 'incorrect', 'not_sure'];
    const VALID_CONFIDENCES = ['high', 'medium', 'low'];

    if (!problemSlug || typeof problemSlug !== 'string' || !problemSlug.trim() || !rating || typeof rating !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'problemSlug and rating are required.',
      });
    }

    if (!VALID_RATINGS.includes(rating)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid rating. Allowed values: correct, incorrect, not_sure.',
      });
    }

    if (confidence !== undefined && (typeof confidence !== 'string' || !VALID_CONFIDENCES.includes(confidence))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid confidence. Allowed values: high, medium, low.',
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

