import { Router, Response } from 'express';
import { optionalAuthMiddleware, AuthRequest, authMiddleware } from '../middleware/auth';
import prisma from '../utils/prisma';
import { generateChatResponse, generateSpeechAudio, FarmerContext, HistoryTurn } from '../services/aiService';
import { fetchWeatherData } from '../services/weatherService';
import { CROPS_DATA } from '../data/cropKnowledge';
import { DISEASES_DATA } from '../data/diseaseKnowledge';
import { config } from '../config';
import fs from 'fs';
import path from 'path';

const router = Router();

// In-memory rate limiter: max 30 requests per minute per IP/user
const rateLimitWindow = 60 * 1000;
const maxRequestsPerMinute = 30;
const ipRateLimitMap = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = ipRateLimitMap.get(key);
  if (!entry || now > entry.resetTime) {
    ipRateLimitMap.set(key, { count: 1, resetTime: now + rateLimitWindow });
    return false;
  }
  if (entry.count >= maxRequestsPerMinute) {
    return true;
  }
  entry.count++;
  return false;
}

// Send message to AI / local assistant
router.post('/messages', optionalAuthMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const rateLimitKey = req.user ? `user-${req.user.id}` : `ip-${req.ip || 'anon'}`;
    if (isRateLimited(rateLimitKey)) {
      return res.status(429).json({
        success: false,
        message: 'Rate limit exceeded: You have sent too many requests. Please wait a minute before trying again.',
      });
    }

    const { language = 'en', conversationId } = req.body;
    const message = req.body.message || req.body.content;

    // Server-side validation
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({ success: false, message: 'Message content cannot be empty' });
    }

    const trimmedMessage = message.trim();
    if (trimmedMessage.length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Message exceeds the maximum allowed length of 2000 characters',
      });
    }

    const safeLanguage = ['en', 'kn', 'ta', 'te'].includes(language) ? language : 'en';
    const user = req.user;
    let convId = conversationId;
    let history: HistoryTurn[] = [];

    // Verify conversation access if conversationId is provided
    if (convId) {
      const existingConv = await prisma.chatConversation.findUnique({
        where: { id: convId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            take: 8,
          },
        },
      });

      if (!existingConv) {
        return res.status(404).json({ success: false, message: 'Conversation not found' });
      }

      // Authorization check: User cannot access another farmer's conversation
      if (user && existingConv.userId !== user.id) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: You do not have permission to access another farmer’s conversation.',
        });
      }

      // Map past messages to Gemini multi-turn format for follow-up context
      history = existingConv.messages
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(m => ({
          role: m.role === 'assistant' ? ('model' as const) : ('user' as const),
          parts: [{ text: m.content }],
        }));
    }

    // Grounding knowledge lookup from verified ICAR data for crops and diseases mentioned
    const qLower = trimmedMessage.toLowerCase();
    const matchedGrounding: string[] = [];

    for (const crop of CROPS_DATA) {
      if (
        qLower.includes(crop.name.toLowerCase()) ||
        (crop.nameKannada && trimmedMessage.includes(crop.nameKannada)) ||
        (crop.nameTamil && trimmedMessage.includes(crop.nameTamil)) ||
        (crop.nameTelugu && trimmedMessage.includes(crop.nameTelugu))
      ) {
        matchedGrounding.push(
          `[ICAR Crop Reference - ${crop.name}]: Ideal Soil: ${crop.idealSoilTypes}, Water Requirement: ${crop.waterRequirement} (${crop.waterMm || ''}), Duration: ${crop.durationDays}, Seasons: ${crop.seasons}. Cost: ${crop.estimatedCostPerAcre}. Expected Yield: ${crop.potentialYieldPerAcre}. Description: ${crop.description}`
        );
      }
    }

    for (const dis of DISEASES_DATA) {
      if (
        qLower.includes(dis.name.toLowerCase()) ||
        (dis.nameKannada && trimmedMessage.includes(dis.nameKannada)) ||
        (dis.nameTamil && trimmedMessage.includes(dis.nameTamil)) ||
        (dis.nameTelugu && trimmedMessage.includes(dis.nameTelugu)) ||
        qLower.split(' ').some((w: string) => w.length > 4 && dis.symptoms.toLowerCase().includes(w))
      ) {
        matchedGrounding.push(
          `[ICAR Disease Reference - ${dis.name}]: Affected Crops: ${dis.affectedCrops}. Symptoms: ${dis.symptoms}. Prevention: ${dis.prevention}. IPM Actions: ${dis.ipmSteps.join('; ')}. Advisory: ${dis.expertAdvice}`
        );
      }
    }

    // Build farmer context from database if user is authenticated
    let farmerContext: FarmerContext | undefined;
    if (user) {
      // 1. Soil assessment details
      const latestSoil = await prisma.soilAssessment.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
      });

      let soilInfo: string | undefined;
      if (latestSoil) {
        const parts = [
          `Type: ${latestSoil.soilType}`,
          latestSoil.ph ? `pH: ${latestSoil.ph}` : null,
          latestSoil.waterSource ? `Water: ${latestSoil.waterSource}` : null,
          latestSoil.irrigationType ? `Irrigation: ${latestSoil.irrigationType}` : null,
          latestSoil.drainage ? `Drainage: ${latestSoil.drainage}` : null,
          latestSoil.soilIssues ? `Soil issues: ${latestSoil.soilIssues}` : null,
          latestSoil.nitrogen ? `Nitrogen: ${latestSoil.nitrogen} kg/ha` : null,
          latestSoil.phosphorus ? `Phosphorus: ${latestSoil.phosphorus} kg/ha` : null,
          latestSoil.potassium ? `Potassium: ${latestSoil.potassium} kg/ha` : null,
        ].filter(Boolean);
        soilInfo = parts.join(', ');
      }

      // 2. Active crop plans and current growth stages
      const activePlans = await prisma.cropPlan.findMany({
        where: { userId: user.id, status: 'active' },
        include: {
          tasks: {
            where: { isCompleted: false },
            orderBy: { stageOrder: 'asc' },
            take: 1,
          },
        },
      });

      const currentCrops = activePlans.map(p => p.cropName);
      const cropStage =
        activePlans.length > 0
          ? activePlans
              .map(p => `${p.cropName} (Current Stage: ${p.tasks[0]?.stage || 'Active Field'})`)
              .join('; ')
          : undefined;

      // 3. Local weather
      let weatherSummary: string | undefined;
      try {
        const w = await fetchWeatherData(user.district || 'Mandya');
        if (w) {
          weatherSummary = `${w.temperature}°C, ${w.condition}, Humidity: ${w.humidity}%, Rain Chance: ${w.rainfallProbability}%. ${w.farmingAlert ? 'Alert: ' + w.farmingAlert : ''}`;
        }
      } catch {
        // Weather fetch is best-effort
      }

      farmerContext = {
        farmerName: user.name,
        state: user.state,
        district: user.district,
        village: user.village || undefined,
        landSize: user.farmSize || 2.5,
        soilInfo,
        currentCrops,
        cropStage,
        weatherSummary,
        groundingKnowledge: matchedGrounding.slice(0, 3).join('\n---\n'),
      };

      // Create conversation if not exists
      if (!convId) {
        const conv = await prisma.chatConversation.create({
          data: {
            userId: user.id,
            title: trimmedMessage.slice(0, 40) + '...',
          },
        });
        convId = conv.id;
      }

      // Save user message to database
      await prisma.chatMessage.create({
        data: {
          conversationId: convId,
          role: 'user',
          content: trimmedMessage,
          language: safeLanguage,
        },
      });
    } else {
      farmerContext = {
        state: 'South India',
        district: 'Mandya',
        groundingKnowledge: matchedGrounding.slice(0, 3).join('\n---\n'),
      };
    }

    // Generate response using official Google Gemini API (Mode A) with local demo fallback (Mode B)
    const aiResult = await generateChatResponse(trimmedMessage, safeLanguage, farmerContext, history);

    // Save assistant message if in an authenticated conversation
    if (user && convId) {
      await prisma.chatMessage.create({
        data: {
          conversationId: convId,
          role: 'assistant',
          content: aiResult.answer,
          language: aiResult.language,
          mode: aiResult.mode,
        },
      });

      await prisma.chatConversation.update({
        where: { id: convId },
        data: { updatedAt: new Date() },
      });

      if (user.language !== aiResult.language) {
        await prisma.user.update({
          where: { id: user.id },
          data: { language: aiResult.language },
        }).catch(() => {});
      }
    }

    res.json({
      success: true,
      data: {
        conversationId: convId,
        message: {
          role: 'assistant',
          content: aiResult.answer,
          speechContent: aiResult.speechContent,
          language: aiResult.language,
          mode: aiResult.mode,
          modelUsed: aiResult.modelUsed,
          sources: aiResult.sources,
          createdAt: new Date().toISOString(),
        },
        speechContent: aiResult.speechContent,
        suggestedQuestions: aiResult.suggestedQuestions,
      },
    });
  } catch (err: any) {
    console.error('[chatRoutes error]', err.message || err);
    res.status(500).json({ success: false, message: 'Farming assistant encountered an error. Please try again.' });
  }
});

// Synthesize natural regional speech using Gemini 3.8 Flash TTS or Edge Regional Neural TTS with graceful browser fallback
router.post('/tts', async (req, res) => {
  try {
    const { text, language = 'en', gender = 'female', provider = 'auto', speed = 1.0 } = req.body;
    if (!text || typeof text !== 'string' || text.trim() === '') {
      return res.status(400).json({ success: false, message: 'Text is required for TTS synthesis' });
    }

    const safeLang = ['en', 'kn', 'ta', 'te'].includes(language) ? language : 'en';
    const safeGender = gender === 'male' ? 'male' : 'female';
    const safeProvider = ['auto', 'gemini-tts', 'edge-neural', 'browser'].includes(provider) ? provider : 'auto';

    const ttsResult = await generateSpeechAudio({
      text,
      language: safeLang,
      gender: safeGender,
      provider: safeProvider as any,
      speed: Number(speed) || 1.0,
    });

    if (!ttsResult) {
      return res.json({
        success: false,
        fallbackToBrowser: true,
        message: 'Cloud TTS unavailable or browser provider requested. Fallback to client browser synthesis.',
        data: {
          provider: 'browser',
          language: safeLang,
        },
      });
    }

    res.json({
      success: true,
      data: {
        audio: ttsResult.audio,
        mimeType: ttsResult.mimeType,
        provider: ttsResult.provider,
        voice: ttsResult.voiceUsed,
        language: safeLang,
      },
    });
  } catch (err: any) {
    console.error('[TTS Route error]', err.message || err);
    res.json({
      success: false,
      fallbackToBrowser: true,
      message: err.message || 'TTS generation failed. Fallback to browser synthesis.',
      data: {
        provider: 'browser',
      },
    });
  }
});

// Get user conversations
router.get('/conversations', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const conversations = await prisma.chatConversation.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    res.json({
      success: true,
      data: conversations.map(c => ({
        id: c.id,
        title: c.title,
        updatedAt: c.updatedAt,
        lastMessage: c.messages[0]?.content || '',
      })),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch conversations' });
  }
});

// Get conversation messages
router.get('/conversations/:id/messages', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const conv = await prisma.chatConversation.findUnique({
      where: { id: req.params.id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conv || conv.userId !== req.user!.id) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    res.json({
      success: true,
      data: conv.messages,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch messages' });
  }
});

// Delete conversation
router.delete('/conversations/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const conv = await prisma.chatConversation.findUnique({
      where: { id: req.params.id },
    });

    if (!conv || conv.userId !== req.user!.id) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    await prisma.chatConversation.delete({
      where: { id: req.params.id },
    });

    res.json({
      success: true,
      message: 'Conversation deleted',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to delete conversation' });
  }
});

// Check active AI provider status
router.get('/status', (req, res) => {
  const hasGemini = !!(config.geminiApiKey && config.geminiApiKey.trim() !== '');
  const activeProvider = hasGemini
    ? `Google Gemini (${config.geminiModel || 'gemini-3.8-flash'})`
    : 'Krushi Sathi Agronomy Knowledge Base (Local Demo Mode)';

  res.json({
    success: true,
    data: {
      provider: activeProvider,
      hasGeminiKey: hasGemini,
      geminiModel: config.geminiModel || 'gemini-3.8-flash',
      availableModels: ['gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-3.8-flash'],
      isLocalDemoFallback: !hasGemini,
      tts: {
        provider: 'Gemini 3.8 Flash TTS + Regional Neural Edge TTS',
        model: 'gemini-3.8-flash-tts',
        isCloudTtsAvailable: true,
        supportedLanguages: ['kn', 'ta', 'te', 'en'],
        voices: {
          gemini: { female: 'Aoede', male: 'Charon' },
          regionalNeural: {
            kn: { female: 'kn-IN-SapnaNeural', male: 'kn-IN-GaganNeural' },
            ta: { female: 'ta-IN-PallaviNeural', male: 'ta-IN-ValluvarNeural' },
            te: { female: 'te-IN-ShrutiNeural', male: 'te-IN-MohanNeural' },
            en: { female: 'en-IN-NeerjaNeural', male: 'en-IN-PrabhatNeural' },
          },
        },
      },
    },
  });
});

// Update AI Keys dynamically (Backend only - never exposed to client)
router.post('/keys', (req, res) => {
  try {
    const { geminiApiKey, geminiModel } = req.body;

    if (geminiApiKey !== undefined) {
      config.geminiApiKey = geminiApiKey.trim();
      process.env.GEMINI_API_KEY = geminiApiKey.trim();
    }
    if (geminiModel !== undefined && geminiModel.trim() !== '') {
      config.geminiModel = geminiModel.trim();
      process.env.GEMINI_MODEL = geminiModel.trim();
    }

    // Persist to server/.env if file exists
    const envPath = path.resolve(__dirname, '../../.env');
    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, 'utf8');
      if (geminiApiKey !== undefined) {
        if (/^GEMINI_API_KEY=/m.test(envContent)) {
          envContent = envContent.replace(/^GEMINI_API_KEY=.*/m, `GEMINI_API_KEY="${geminiApiKey.trim()}"`);
        } else {
          envContent += `\nGEMINI_API_KEY="${geminiApiKey.trim()}"`;
        }
      }
      if (geminiModel !== undefined && geminiModel.trim() !== '') {
        if (/^GEMINI_MODEL=/m.test(envContent)) {
          envContent = envContent.replace(/^GEMINI_MODEL=.*/m, `GEMINI_MODEL="${geminiModel.trim()}"`);
        } else {
          envContent += `\nGEMINI_MODEL="${geminiModel.trim()}"`;
        }
      }
      fs.writeFileSync(envPath, envContent, 'utf8');
    }

    res.json({
      success: true,
      message: 'Gemini AI Provider configuration updated successfully',
      data: {
        geminiModel: config.geminiModel,
        hasGeminiKey: !!(config.geminiApiKey && config.geminiApiKey.trim() !== ''),
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to update keys' });
  }
});

export default router;
