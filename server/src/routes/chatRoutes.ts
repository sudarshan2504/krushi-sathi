import { Router, Request, Response } from 'express';
import { optionalAuthMiddleware, AuthRequest, authMiddleware } from '../middleware/auth';
import { createRateLimiter } from '../middleware/rateLimiter';
import prisma from '../utils/prisma';
import {
  generateChatResponse,
  generateSpeechAudio,
  callGoogleGeminiWithSdkStream,
  callOpenRouterStream,
  extractSpeechContent,
  getSuggestedQuestions,
  FarmerContext,
  HistoryTurn,
} from '../services/aiService';
import { fetchWeatherData } from '../services/weatherService';
import { CROPS_DATA } from '../data/cropKnowledge';
import { DISEASES_DATA } from '../data/diseaseKnowledge';
import { config } from '../config';
import { buildSystemPrompt } from '../prompts/farmerChatPrompt';
import { resolveEffectiveLanguage } from '../utils/languageResolver';
import { detectSeasonFromLocation, getLocationConditions } from '../services/seasonService';
import fs from 'fs';
import path from 'path';

const router = Router();

function parsePositiveInt(val: string | undefined, fallback: number): number {
  const parsed = parseInt(val || '', 10);
  return !isNaN(parsed) && parsed > 0 ? parsed : fallback;
}

const chatMessageRateLimiter = createRateLimiter({
  keyPrefix: 'chat-messages',
  windowMs: 60 * 1000,
  maxRequests: () => parsePositiveInt(process.env.CHAT_RATE_LIMIT_MAX, 30),
  message: 'Rate limit exceeded: You have sent too many requests. Please wait a minute before trying again.',
});

const ttsRateLimiter = createRateLimiter({
  keyPrefix: 'chat-tts',
  windowMs: 60 * 1000,
  maxRequests: () => parsePositiveInt(process.env.TTS_RATE_LIMIT_MAX, 30),
  message: 'Rate limit exceeded for speech synthesis. Please wait a minute before trying again.',
});

// SSE helper: write a named SSE event
function sseWrite(res: Response, event: string, data: object) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

/**
 * POST /api/chat/messages — SSE-streamed chat endpoint.
 *
 * SSE protocol:
 *   event: chunk   { text: string }         — incremental text chunk (Gemini streaming only)
 *   event: done    { conversationId, message, speechContent, suggestedQuestions }
 *   event: error   { message: string }
 *
 * For the local rule-based fallback, the full reply is sent as a single "done" event
 * so the client code path is identical regardless of provider.
 *
 * UTF-8 safety: the Gemini SDK streams complete Unicode code points (the SDK buffers
 * internally per chunk boundary), so no partial-character handling is needed here.
 */
router.post('/messages', optionalAuthMiddleware, chatMessageRateLimiter, async (req: AuthRequest, res: Response) => {
  const { language = 'en', conversationId } = req.body;
  const message = req.body.message || req.body.content;

  if (!message || typeof message !== 'string' || message.trim() === '') {
    return res.status(400).json({ success: false, message: 'Message content cannot be empty' });
  }
  const trimmedMessage = message.trim();
  if (trimmedMessage.length > 2000) {
    return res.status(400).json({ success: false, message: 'Message exceeds the maximum allowed length of 2000 characters' });
  }

  const safeLanguage = ['en', 'kn', 'ta', 'te'].includes(language) ? language : 'en';
  const user = req.user;
  let convId = conversationId;
  let history: HistoryTurn[] = [];

  // ── Pre-flight: load conversation history (before SSE headers) ──────────────
  try {
    if (convId) {
      const existingConv = await prisma.chatConversation.findUnique({
        where: { id: convId },
        select: {
          id: true,
          userId: true,
          messages: { orderBy: { createdAt: 'asc' }, take: 8, select: { role: true, content: true } },
        },
      });
      if (!existingConv) return res.status(404).json({ success: false, message: 'Conversation not found' });
      if (existingConv.userId && (!user || existingConv.userId !== user.id)) {
        return res.status(403).json({ success: false, message: "Unauthorized: You do not have permission to access another farmer's conversation." });
      }
      history = existingConv.messages
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(m => ({ role: m.role === 'assistant' ? ('model' as const) : ('user' as const), parts: [{ text: m.content }] }));
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to load conversation history' });
  }

  // ── Grounding knowledge lookup ───────────────────────────────────────────────
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

  // ── Build farmer context ─────────────────────────────────────────────────────
  let farmerContext: FarmerContext | undefined;
  try {
    if (user) {
      // Run independent database lookups and weather fetch in parallel
      const [latestSoil, activePlans, weatherData] = await Promise.all([
        prisma.soilAssessment.findFirst({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' },
          select: {
            soilType: true, soilColour: true, soilTexture: true, organicMatter: true, drainage: true,
            ph: true, npkNitrogen: true, npkPhosphorus: true, npkPotassium: true,
            nitrogen: true, phosphorus: true, potassium: true,
            waterSource: true, irrigationType: true, soilIssues: true, category: true,
          },
        }),
        prisma.cropPlan.findMany({
          where: { userId: user.id, status: 'active' },
          select: {
            cropName: true,
            tasks: { where: { isCompleted: false }, orderBy: { stageOrder: 'asc' }, take: 1, select: { stage: true } },
          },
        }),
        // Fast 1.2s timeout so weather preflight never blocks chat response start
        Promise.race([
          fetchWeatherData(user.district || 'Mandya', user.latitude || undefined, user.longitude || undefined).catch(() => null),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 1200)),
        ]),
      ]);

      let soilInfo: string | undefined;
      if (latestSoil) {
        const parts = [
          `Type: ${latestSoil.soilType}`,
          latestSoil.soilColour ? `Colour: ${latestSoil.soilColour}` : null,
          latestSoil.soilTexture ? `Texture: ${latestSoil.soilTexture}` : null,
          latestSoil.organicMatter ? `Organic matter: ${latestSoil.organicMatter}` : null,
          latestSoil.drainage ? `Drainage: ${latestSoil.drainage}` : null,
          latestSoil.ph ? `pH: ${latestSoil.ph}` : null,
          latestSoil.npkNitrogen ? `Nitrogen: ${latestSoil.npkNitrogen}` : (latestSoil.nitrogen ? `Nitrogen: ${latestSoil.nitrogen} kg/ha` : null),
          latestSoil.npkPhosphorus ? `Phosphorus: ${latestSoil.npkPhosphorus}` : (latestSoil.phosphorus ? `Phosphorus: ${latestSoil.phosphorus} kg/ha` : null),
          latestSoil.npkPotassium ? `Potassium: ${latestSoil.npkPotassium}` : (latestSoil.potassium ? `Potassium: ${latestSoil.potassium} kg/ha` : null),
          latestSoil.waterSource ? `Water: ${latestSoil.waterSource}` : null,
          latestSoil.irrigationType ? `Irrigation: ${latestSoil.irrigationType}` : null,
          latestSoil.soilIssues ? `Soil issues: ${latestSoil.soilIssues}` : null,
        ].filter(Boolean);
        soilInfo = parts.join(', ');
      }

      const currentCrops = activePlans.map(p => p.cropName);
      const cropStage = activePlans.length > 0
        ? activePlans.map(p => `${p.cropName} (Current Stage: ${p.tasks[0]?.stage || 'Active Field'})`).join('; ')
        : undefined;

      let weatherSummary: string | undefined;
      if (weatherData) {
        weatherSummary = `${weatherData.temperature}°C, ${weatherData.condition}, Humidity: ${weatherData.humidity}%, Rain Chance: ${weatherData.rainfallProbability}%. ${weatherData.farmingAlert ? 'Alert: ' + weatherData.farmingAlert : ''}`;
      }

      const locCond = getLocationConditions(
        user.latitude || 12.5244, user.longitude || 76.8969, user.state, user.district, user.taluk || undefined
      );

      farmerContext = {
        farmerName: user.name, state: user.state, district: user.district,
        village: user.village || undefined, taluk: user.taluk || undefined,
        agroZone: locCond.location?.agroZone,
        currentSeason: locCond.season ? `${locCond.season.name} (${locCond.season.currentPhase})` : undefined,
        localSeasonName: locCond.season?.localSeasonName,
        sowingWindowStatusSummary: locCond.season ? `${locCond.season.sowingWindow} (${locCond.season.sowingWindowStatus})` : undefined,
        preferredCategory: latestSoil?.category || undefined,
        landSize: user.farmSize || 2.5,
        soilInfo, currentCrops, cropStage, weatherSummary,
        groundingKnowledge: matchedGrounding.slice(0, 3).join('\n---\n'),
      };

      if (!convId) {
        const conv = await prisma.chatConversation.create({ data: { userId: user.id, title: trimmedMessage.slice(0, 40) + '...' } });
        convId = conv.id;
      }
      await prisma.chatMessage.create({ data: { conversationId: convId, role: 'user', content: trimmedMessage, language: safeLanguage } });
    } else {
      farmerContext = { state: 'South India', district: 'Mandya', groundingKnowledge: matchedGrounding.slice(0, 3).join('\n---\n') };
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to prepare request context' });
  }

  // ── Set SSE response headers (after all pre-flight DB work) ─────────────────
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx/proxy buffering
  res.flushHeaders();

  const effectiveLang = resolveEffectiveLanguage(trimmedMessage, safeLanguage);
  const hasGemini = !!(config.geminiApiKey && config.geminiApiKey.trim() !== '');

  if (hasGemini) {
    // ── GEMINI STREAMING PATH ──────────────────────────────────────────────────
    try {
      const autoSeason = (farmerContext?.state || farmerContext?.district)
        ? detectSeasonFromLocation(farmerContext?.state, farmerContext?.district)
        : null;
      const effectiveSeason = farmerContext?.currentSeason || autoSeason?.standardSeason || 'Kharif';
      const effectiveLocalSeason = farmerContext?.localSeasonName || autoSeason?.localSeasonName;
      const effectiveSowingSummary = farmerContext?.sowingWindowStatusSummary ||
        (autoSeason ? `${autoSeason.sowingWindow} (${autoSeason.sowingWindowStatus})` : undefined);
      const locDisplay = farmerContext?.district
        ? `${farmerContext.district}${farmerContext.state ? ', ' + farmerContext.state : ''}`
        : farmerContext?.state || 'South India';

      const systemPrompt = buildSystemPrompt({
        language: effectiveLang,
        farmerName: farmerContext?.farmerName || 'Farmer',
        location: locDisplay, taluk: farmerContext?.taluk, agroZone: farmerContext?.agroZone,
        currentSeason: effectiveSeason, localSeasonName: effectiveLocalSeason,
        sowingWindowStatusSummary: effectiveSowingSummary,
        preferredCategory: farmerContext?.preferredCategory,
        landSize: farmerContext?.landSize || '2',
        soilInfo: farmerContext?.soilInfo, activeCrops: farmerContext?.currentCrops,
        cropStage: farmerContext?.cropStage, weatherSummary: farmerContext?.weatherSummary,
        groundingKnowledge: farmerContext?.groundingKnowledge,
      });

      let fullText = '';
      let modelUsed = '';

      for await (const event of callGoogleGeminiWithSdkStream(trimmedMessage, systemPrompt, history, effectiveLang)) {
        if (req.socket.destroyed) break; // client disconnected — stop streaming
        if (event.chunk) {
          fullText += event.chunk;
          sseWrite(res, 'chunk', { text: event.chunk });
        }
        if (event.done) modelUsed = event.modelUsed || '';
      }

      if (!req.socket.destroyed) {
        const { writtenAnswer, speechContent } = extractSpeechContent(fullText, effectiveLang);
        const suggestedQuestions = getSuggestedQuestions(effectiveLang);

        // Persist to DB once after stream completes
        if (user && convId) {
          await prisma.chatMessage.create({ data: { conversationId: convId, role: 'assistant', content: writtenAnswer, language: effectiveLang, mode: 'gemini' } });
          await prisma.chatConversation.update({ where: { id: convId }, data: { updatedAt: new Date() } });
          if (user.language !== effectiveLang) {
            await prisma.user.update({ where: { id: user.id }, data: { language: effectiveLang } }).catch(() => {});
          }
        }

        sseWrite(res, 'done', {
          conversationId: convId,
          message: { role: 'assistant', content: writtenAnswer, speechContent, language: effectiveLang, mode: 'gemini', modelUsed, sources: [`Google Gemini (${modelUsed})`, 'ICAR / KVK Agronomy Standards'], createdAt: new Date().toISOString() },
          speechContent,
          suggestedQuestions,
        });
      }
      res.end();
      return;
    } catch (geminiErr: any) {
      // Gemini failed — fall through to local fallback
      console.warn('[chatRoutes] Gemini stream failed, using local fallback:', geminiErr.message);
    }
  }

  const hasOpenRouter = !!(config.openRouterApiKey && config.openRouterApiKey.trim() !== '');
  if (hasOpenRouter) {
    // ── OPENROUTER STREAMING PATH ──────────────────────────────────────────────
    try {
      const autoSeason = (farmerContext?.state || farmerContext?.district)
        ? detectSeasonFromLocation(farmerContext?.state, farmerContext?.district)
        : null;
      const effectiveSeason = farmerContext?.currentSeason || autoSeason?.standardSeason || 'Kharif';
      const effectiveLocalSeason = farmerContext?.localSeasonName || autoSeason?.localSeasonName;
      const effectiveSowingSummary = farmerContext?.sowingWindowStatusSummary ||
        (autoSeason ? `${autoSeason.sowingWindow} (${autoSeason.sowingWindowStatus})` : undefined);
      const locDisplay = farmerContext?.district
        ? `${farmerContext.district}${farmerContext.state ? ', ' + farmerContext.state : ''}`
        : farmerContext?.state || 'South India';

      const systemPrompt = buildSystemPrompt({
        language: effectiveLang,
        farmerName: farmerContext?.farmerName || 'Farmer',
        location: locDisplay, taluk: farmerContext?.taluk, agroZone: farmerContext?.agroZone,
        currentSeason: effectiveSeason, localSeasonName: effectiveLocalSeason,
        sowingWindowStatusSummary: effectiveSowingSummary,
        preferredCategory: farmerContext?.preferredCategory,
        landSize: farmerContext?.landSize || '2',
        soilInfo: farmerContext?.soilInfo, activeCrops: farmerContext?.currentCrops,
        cropStage: farmerContext?.cropStage, weatherSummary: farmerContext?.weatherSummary,
        groundingKnowledge: farmerContext?.groundingKnowledge,
      });

      let fullText = '';
      let modelUsed = '';

      for await (const event of callOpenRouterStream(trimmedMessage, systemPrompt, history, effectiveLang)) {
        if (req.socket.destroyed) break;
        if (event.chunk) {
          fullText += event.chunk;
          sseWrite(res, 'chunk', { text: event.chunk });
        }
        if (event.done) modelUsed = event.modelUsed || '';
      }

      if (!req.socket.destroyed && fullText.trim()) {
        const { writtenAnswer, speechContent } = extractSpeechContent(fullText, effectiveLang);
        const suggestedQuestions = getSuggestedQuestions(effectiveLang);

        if (user && convId) {
          await prisma.chatMessage.create({ data: { conversationId: convId, role: 'assistant', content: writtenAnswer, language: effectiveLang, mode: 'openrouter' } });
          await prisma.chatConversation.update({ where: { id: convId }, data: { updatedAt: new Date() } });
          if (user.language !== effectiveLang) {
            await prisma.user.update({ where: { id: user.id }, data: { language: effectiveLang } }).catch(() => {});
          }
        }

        sseWrite(res, 'done', {
          conversationId: convId,
          message: { role: 'assistant', content: writtenAnswer, speechContent, language: effectiveLang, mode: 'openrouter', modelUsed, sources: [`OpenRouter (${modelUsed})`, 'ICAR / KVK Agronomy Standards'], createdAt: new Date().toISOString() },
          speechContent,
          suggestedQuestions,
        });
        res.end();
        return;
      }
    } catch (orErr: any) {
      console.warn('[chatRoutes] OpenRouter stream failed, falling through to local engine:', orErr.message);
    }
  }

  // ── LOCAL FALLBACK PATH ────────────────────────────────────────────────────
  try {
    const aiResult = await generateChatResponse(trimmedMessage, effectiveLang, farmerContext, history);

    if (user && convId) {
      await prisma.chatMessage.create({ data: { conversationId: convId, role: 'assistant', content: aiResult.answer, language: aiResult.language, mode: aiResult.mode } });
      await prisma.chatConversation.update({ where: { id: convId }, data: { updatedAt: new Date() } });
      if (user.language !== aiResult.language) {
        await prisma.user.update({ where: { id: user.id }, data: { language: aiResult.language } }).catch(() => {});
      }
    }

    // Single "done" event — client code path identical to streaming
    sseWrite(res, 'done', {
      conversationId: convId,
      message: { role: 'assistant', content: aiResult.answer, speechContent: aiResult.speechContent, language: aiResult.language, mode: aiResult.mode, modelUsed: aiResult.modelUsed, sources: aiResult.sources, createdAt: new Date().toISOString() },
      speechContent: aiResult.speechContent,
      suggestedQuestions: aiResult.suggestedQuestions,
    });
    res.end();
  } catch (err: any) {
    console.error('[chatRoutes error]', err.message || err);
    sseWrite(res, 'error', { message: 'Farming assistant encountered an error. Please try again.' });
    res.end();
  }
});

// Synthesize natural regional speech using Gemini 3.8 Flash TTS or Edge Regional Neural TTS with graceful browser fallback
router.post('/tts', authMiddleware, ttsRateLimiter, async (req: AuthRequest, res: Response) => {
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
        data: { provider: 'browser', language: safeLang },
      });
    }

    res.json({
      success: true,
      data: { audio: ttsResult.audio, mimeType: ttsResult.mimeType, provider: ttsResult.provider, voice: ttsResult.voiceUsed, language: safeLang },
    });
  } catch (err: any) {
    console.error('[TTS Route error]', err.message || err);
    res.json({
      success: false,
      fallbackToBrowser: true,
      message: err.message || 'TTS generation failed. Fallback to browser synthesis.',
      data: { provider: 'browser' },
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
      select: {
        id: true,
        title: true,
        updatedAt: true,
        messages: { orderBy: { createdAt: 'desc' }, take: 1, select: { content: true } },
      },
    });

    res.json({
      success: true,
      data: conversations.map(c => ({ id: c.id, title: c.title, updatedAt: c.updatedAt, lastMessage: c.messages[0]?.content || '' })),
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
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });

    if (!conv || conv.userId !== req.user!.id) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    res.json({ success: true, data: conv.messages });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch messages' });
  }
});

// Delete conversation
router.delete('/conversations/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const conv = await prisma.chatConversation.findUnique({ where: { id: req.params.id } });

    if (!conv || conv.userId !== req.user!.id) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    await prisma.chatConversation.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Conversation deleted' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to delete conversation' });
  }
});

// Check active AI provider status
router.get('/status', (req, res) => {
  const hasGemini = !!(config.geminiApiKey && config.geminiApiKey.trim() !== '');
  const hasOpenRouter = !!(config.openRouterApiKey && config.openRouterApiKey.trim() !== '');
  const hasLiveAi = hasGemini || hasOpenRouter;
  const activeProvider = hasGemini
    ? `Google Gemini (${config.geminiModel || 'gemini-2.5-flash'})`
    : hasOpenRouter
    ? `OpenRouter (${config.openRouterModel || 'openrouter/free'})`
    : 'Krushi Sathi Agronomy Knowledge Base (Local Demo Mode)';

  res.json({
    success: true,
    data: {
      provider: activeProvider,
      hasGeminiKey: hasLiveAi,
      hasOpenRouterKey: hasOpenRouter,
      openRouterModel: config.openRouterModel || 'openrouter/free',
      geminiModel: config.geminiModel || 'gemini-2.5-flash',
      availableModels: ['openrouter/free', 'gemini-2.5-flash', 'gemini-1.5-flash'],
      isLocalDemoFallback: !hasLiveAi,
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

// Update AI Keys dynamically (Auth-protected & disabled in production)
router.post('/keys', authMiddleware, (req: AuthRequest, res: Response) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      message: 'Modifying API keys via HTTP is disabled in production environments.',
    });
  }

  try {
    const { geminiApiKey, geminiModel } = req.body || {};

    if (geminiApiKey === undefined && geminiModel === undefined) {
      return res.status(400).json({
        success: false,
        message: 'At least one configuration field (geminiApiKey or geminiModel) is required.',
      });
    }

    if (geminiApiKey !== undefined && typeof geminiApiKey !== 'string') {
      return res.status(400).json({ success: false, message: 'geminiApiKey must be a string' });
    }
    if (geminiModel !== undefined && typeof geminiModel !== 'string') {
      return res.status(400).json({ success: false, message: 'geminiModel must be a string' });
    }

    if (geminiApiKey !== undefined) {
      config.geminiApiKey = geminiApiKey.trim();
      process.env.GEMINI_API_KEY = geminiApiKey.trim();
    }
    if (geminiModel !== undefined && geminiModel.trim() !== '') {
      config.geminiModel = geminiModel.trim();
      process.env.GEMINI_MODEL = geminiModel.trim();
    }

    // Persist to server/.env only in active local development (never during test runs)
    const envPath = path.resolve(__dirname, '../../.env');
    if (process.env.NODE_ENV === 'development' && fs.existsSync(envPath)) {
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
      data: { geminiModel: config.geminiModel, hasGeminiKey: !!(config.geminiApiKey && config.geminiApiKey.trim() !== '') },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to update keys' });
  }
});

export default router;
