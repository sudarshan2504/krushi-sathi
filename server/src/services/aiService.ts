import { GoogleGenAI } from '@google/genai';
import { config } from '../config';
import { buildSystemPrompt } from '../prompts/farmerChatPrompt';
import { CROPS_DATA } from '../data/cropKnowledge';
import { DISEASES_DATA } from '../data/diseaseKnowledge';
import { AGRICULTURAL_FAQS } from '../data/agriculturalFaq';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

export interface ChatResponse {
  answer: string;
  speechContent?: string;
  language: string;
  mode: 'gemini' | 'local_demo';
  modelUsed?: string;
  sources?: string[];
  suggestedQuestions?: string[];
  fallbackReason?: string;
}

export interface FarmerContext {
  farmerName?: string;
  state?: string;
  district?: string;
  village?: string;
  soilType?: string;
  soilInfo?: string;
  landSize?: string | number;
  currentCrops?: string[];
  cropStage?: string;
  weatherSummary?: string;
  groundingKnowledge?: string;
  language?: string;
}

export interface HistoryTurn {
  role: 'user' | 'model';
  parts: { text: string }[];
}

let geminiClientInstance: GoogleGenAI | null = null;
let cachedGeminiKey = '';

export function getGeminiClient(): GoogleGenAI | null {
  const currentKey = (config.geminiApiKey || '').trim();
  if (!currentKey) {
    geminiClientInstance = null;
    cachedGeminiKey = '';
    return null;
  }
  if (!geminiClientInstance || cachedGeminiKey !== currentKey) {
    geminiClientInstance = new GoogleGenAI({ apiKey: currentKey });
    cachedGeminiKey = currentKey;
  }
  return geminiClientInstance;
}

function getLocalFallbackBanner(language: string, reason: string): string {
  if (language === 'kn') {
    return `ℹ️ [ಸ್ಥಳೀಯ ಡೆಮೊ ಮೋಡ್: ${reason}. ಕೃಷಿ ಇಲಾಖೆ ಹಾಗೂ ಐಸಿಎಆರ್ ಅನುಮೋದಿತ ಮಾಹಿತಿ ನೀಡಲಾಗುತ್ತಿದೆ.]\n\n`;
  }
  if (language === 'ta') {
    return `ℹ️ [உள்ளூர் டெமோ முறை: ${reason}. ஐசிஏஆர் மற்றும் வேளாண் பல்கலைக்கழக வழிகாட்டுதல் மூலம் பதில் வழங்கப்படுகிறது.]\n\n`;
  }
  if (language === 'te') {
    return `ℹ️ [స్థానిక డెమో మోడ్: ${reason}. ఐసీఏఆర్ మరియు వ్యవసాయ విశ్వవిద్యాలయ మార్గదర్శకాల సమాధానం అందించబడుతోంది.]\n\n`;
  }
  return `ℹ️ [Local Demo Mode: ${reason}. Providing verified agricultural advice from Krushi Sathi ICAR / KVK Knowledge Base]:\n\n`;
}

import {
  resolveEffectiveLanguage,
  isValidScriptForLanguage,
  cleanTransliteratedGreeting,
  LANGUAGE_DISPLAY_NAMES,
  SupportedLanguage,
} from '../utils/languageResolver';

async function ensureCorrectScriptWithGemini(
  client: GoogleGenAI,
  model: string,
  rawText: string,
  targetLanguage: string
): Promise<string> {
  const cleaned = cleanTransliteratedGreeting(rawText, targetLanguage);
  if (isValidScriptForLanguage(cleaned, targetLanguage)) {
    return cleaned;
  }

  const targetName = LANGUAGE_DISPLAY_NAMES[targetLanguage as SupportedLanguage] || targetLanguage;
  console.warn(`[aiService] Detected script mismatch for '${targetLanguage}'. Running Gemini auto-correction...`);

  try {
    const res = await client.models.generateContent({
      model,
      contents: `You are an expert Indian agricultural advisor. Translate the following advisory completely and strictly into ${targetName}. Use authentic native script only. Do NOT include any sentences from other languages. Write the full response in ${targetName}:\n\n${cleaned}`,
      config: {
        temperature: 0.1,
        maxOutputTokens: 600,
      },
    });

    if (res.text && isValidScriptForLanguage(res.text, targetLanguage)) {
      console.log(`[aiService] Successfully auto-corrected response to ${targetLanguage}!`);
      return cleanTransliteratedGreeting(res.text.trim(), targetLanguage);
    }
  } catch (err: any) {
    console.warn(`[aiService] Auto-correction translation failed: ${err.message}`);
  }

  return cleaned;
}

/**
 * Strips markdown, emojis, asterisks, system tags, and bullets so the text
 * is cleanly and smoothly articulated by speech synthesis without token pauses.
 */
export function cleanSpeechFormatting(text: string): string {
  if (!text) return '';
  return text
    .replace(/<\/?speech_summary>/gi, '')
    .replace(/\[[^\]]*\]:?/g, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/^[\s*•\-–—]+\s*/gm, '')
    .replace(/^\d+[\.\)]\s*/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    .replace(/[;:]\s*/g, ', ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Creates a clean, 2-3 sentence speakable summary from raw agricultural text
 * if no explicit speech_summary tag is found.
 */
export function cleanForSpeakableSummary(rawText: string, language: string): string {
  const cleaned = cleanSpeechFormatting(rawText);
  if (!cleaned) return '';

  const sentences = cleaned.split(/(?<=[.!?।])\s+/).filter((s) => s.trim().length > 3);
  if (sentences.length === 0) return cleaned;

  const summary = sentences.slice(0, 3).join(' ');
  return summary.length > 350 ? summary.slice(0, 350) + '...' : summary;
}

/**
 * Extracts written advisory and speechContent from an AI response.
 * Uses <speech_summary> if provided by Gemini, or falls back to cleanForSpeakableSummary.
 */
export function extractSpeechContent(
  rawText: string,
  language: string
): { writtenAnswer: string; speechContent: string } {
  let writtenAnswer = rawText;
  let speechContent = '';

  const speechMatch = rawText.match(/<speech_summary>([\s\S]*?)<\/speech_summary>/i);
  if (speechMatch && speechMatch[1]) {
    speechContent = cleanSpeechFormatting(speechMatch[1].trim());
    writtenAnswer = rawText.replace(/<speech_summary>[\s\S]*?<\/speech_summary>/gi, '').trim();
  }

  if (!speechContent) {
    speechContent = cleanForSpeakableSummary(writtenAnswer, language);
  }

  return { writtenAnswer, speechContent };
}

export interface SpeechGenerationParams {
  text: string;
  language?: string;
  gender?: 'female' | 'male';
  provider?: 'auto' | 'gemini-tts' | 'edge-neural' | 'browser';
  speed?: number;
}

export interface SpeechGenerationResult {
  audio: string; // base64 encoded audio
  mimeType: string; // audio/wav or audio/mp3
  voiceUsed: string;
  provider: 'gemini-tts' | 'edge-neural' | 'browser';
  language?: string;
}

export const REGIONAL_NEURAL_VOICES: Record<string, { female: string; male: string }> = {
  kn: {
    female: 'kn-IN-SapnaNeural',
    male: 'kn-IN-GaganNeural',
  },
  ta: {
    female: 'ta-IN-PallaviNeural',
    male: 'ta-IN-ValluvarNeural',
  },
  te: {
    female: 'te-IN-ShrutiNeural',
    male: 'te-IN-MohanNeural',
  },
  en: {
    female: 'en-IN-NeerjaNeural',
    male: 'en-IN-PrabhatNeural',
  },
};

/**
 * Synthesizes audio using Microsoft Edge Regional Neural voices.
 * Provides completely natural South Indian conversational voices for
 * Kannada, Tamil, Telugu, and Indian English with zero rate limit restrictions.
 */
async function synthesizeWithEdgeNeural(
  text: string,
  language: string,
  gender: 'female' | 'male' = 'female'
): Promise<SpeechGenerationResult | null> {
  const safeLang = ['en', 'kn', 'ta', 'te'].includes(language) ? language : 'en';
  const voiceConfig = REGIONAL_NEURAL_VOICES[safeLang] || REGIONAL_NEURAL_VOICES.en;
  const voiceName = gender === 'male' ? voiceConfig.male : voiceConfig.female;

  try {
    const tts = new MsEdgeTTS();
    await tts.setMetadata(voiceName, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    const { audioStream } = tts.toStream(text);

    const buffer = await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      const timeout = setTimeout(() => {
        reject(new Error(`Edge Neural TTS timed out after 12s for voice ${voiceName}`));
      }, 12000);

      audioStream.on('data', (chunk: Buffer) => chunks.push(chunk));
      audioStream.on('end', () => {
        clearTimeout(timeout);
        resolve(Buffer.concat(chunks));
      });
      audioStream.on('error', (err: any) => {
        clearTimeout(timeout);
        reject(err);
      });
    });

    if (buffer && buffer.length > 0) {
      return {
        audio: buffer.toString('base64'),
        mimeType: 'audio/mp3',
        voiceUsed: voiceName,
        provider: 'edge-neural',
        language: safeLang,
      };
    }
  } catch (err: any) {
    console.warn(`[aiService] Edge Neural TTS failed (${voiceName}): ${err.message || err}`);
  }
  return null;
}

/**
 * Synthesizes audio using Google Gemini 3.8 Flash TTS via official interactions API.
 */
async function synthesizeWithGeminiTts(
  text: string,
  language: string,
  gender: 'female' | 'male' = 'female'
): Promise<SpeechGenerationResult | null> {
  const apiKey = (config.geminiApiKey || '').trim();
  if (!apiKey) return null;

  const safeLang = ['en', 'kn', 'ta', 'te'].includes(language) ? language : 'en';
  const voiceName = gender === 'male' ? 'Charon' : 'Aoede';
  const styleDescription = 'warm, respectful and natural regional farming companion';

  const ttsModels = ['gemini-3.8-flash-tts', 'gemini-3.8-flash-lite-tts'];

  for (const model of ttsModels) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/interactions?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          input: [
            {
              type: 'user_input',
              content: [
                {
                  type: 'text',
                  text,
                  annotations: [
                    {
                      type: 'speech_metadata',
                      style: styleDescription,
                    },
                  ],
                },
              ],
            },
          ],
          response_format: { type: 'audio' },
          generation_config: {
            speech_config: [{ voice: voiceName }],
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (res.status === 429) {
        console.warn(`[aiService] Gemini TTS (${model}) hit rate limit (429).`);
        return null;
      }

      if (!res.ok) {
        console.warn(`[aiService] Gemini TTS (${model}) HTTP ${res.status}`);
        continue;
      }

      const data: any = await res.json();
      const audioStep = data.steps?.find((s: any) => s.type === 'model_output');
      const audioContent = audioStep?.content?.find((c: any) => c.type === 'audio');

      if (audioContent?.data) {
        return {
          audio: audioContent.data,
          mimeType: audioContent.mime_type || 'audio/wav',
          voiceUsed: `${model}:${voiceName}`,
          provider: 'gemini-tts',
          language: safeLang,
        };
      }
    } catch (err: any) {
      console.warn(`[aiService] Gemini TTS (${model}) attempt failed: ${err.message || err}`);
    }
  }

  return null;
}

/**
 * Primary Configurable Speech Synthesis Engine.
 * Supports:
 * - 'gemini-tts': Gemini 3.8 Flash TTS
 * - 'edge-neural': Regional Neural voices (kn, ta, te, en)
 * - 'auto': Gemini TTS first; if quota exceeded or unavailable, seamlessly falls back to Edge Neural!
 * - 'browser': returns null so client directly uses browser SpeechSynthesis.
 */
export async function generateSpeechAudio({
  text,
  language = 'en',
  gender = 'female',
  provider = 'auto',
}: SpeechGenerationParams): Promise<SpeechGenerationResult | null> {
  const cleanText = cleanSpeechFormatting(text);
  if (!cleanText || cleanText.trim().length === 0) {
    return null;
  }

  const safeLang = ['en', 'kn', 'ta', 'te'].includes(language) ? language : 'en';
  const safeGender = gender === 'male' ? 'male' : 'female';
  const textToSynthesize = cleanText.length > 800 ? cleanText.slice(0, 800) + '...' : cleanText;

  if (provider === 'browser') {
    return null;
  }

  if (provider === 'gemini-tts') {
    const geminiRes = await synthesizeWithGeminiTts(textToSynthesize, safeLang, safeGender);
    if (geminiRes) return geminiRes;
    return null;
  }

  if (provider === 'edge-neural') {
    return synthesizeWithEdgeNeural(textToSynthesize, safeLang, safeGender);
  }

  // provider === 'auto':
  // 1. Try Gemini TTS if key configured
  if (config.geminiApiKey) {
    const geminiRes = await synthesizeWithGeminiTts(textToSynthesize, safeLang, safeGender);
    if (geminiRes) return geminiRes;
  }

  // 2. Fall back to South Indian Regional Neural Edge TTS
  const edgeRes = await synthesizeWithEdgeNeural(textToSynthesize, safeLang, safeGender);
  if (edgeRes) return edgeRes;

  return null;
}

export async function callGoogleGeminiWithSdk(
  query: string,
  systemPrompt: string,
  history: HistoryTurn[] = [],
  targetLanguage = 'en'
): Promise<{ text: string; modelUsed: string } | null> {
  const client = getGeminiClient();
  if (!client) {
    return null;
  }

  // Model selection: user configured model or available model fallback
  const preferredModel = (config.geminiModel || 'gemini-3.5-flash').trim();
  const modelsToTry = Array.from(
    new Set([
      preferredModel,
      'gemini-3.5-flash',
      'gemini-3.5-flash-lite',
      'gemini-3.8-flash',
      'gemini-flash-latest',
    ])
  );

  // Build sanitized history
  let validHistory: HistoryTurn[] = [];
  for (const turn of history) {
    if (turn.parts && turn.parts.length > 0 && turn.parts[0]?.text) {
      validHistory.push({
        role: turn.role,
        parts: [{ text: turn.parts[0].text }],
      });
    }
  }

  // Gemini requires that history begins with a user turn
  while (validHistory.length > 0 && validHistory[0].role !== 'user') {
    validHistory.shift();
  }

  // Check if the previous conversation had a different script/language
  let isLanguageSwitch = false;
  if (validHistory.length > 0) {
    const lastTurnText = validHistory[validHistory.length - 1].parts[0]?.text || '';
    if (!isValidScriptForLanguage(lastTurnText, targetLanguage)) {
      isLanguageSwitch = true;
      // If switching languages, prune distant history to prevent previous script bias
      if (validHistory.length > 2) {
        validHistory = validHistory.slice(-2);
        while (validHistory.length > 0 && validHistory[0].role !== 'user') {
          validHistory.shift();
        }
      }
    }
  }

  // Language directive injected directly into the user turn to overcome history bias
  const langDirectives: Record<string, string> = {
    kn: '[MANDATORY: You MUST reply strictly and entirely in Kannada (ಕನ್ನಡ) script. Do NOT use English, Tamil, or Telugu. Start with a proper Kannada greeting like "ನಮಸ್ಕಾರ".]',
    ta: '[MANDATORY: You MUST reply strictly and entirely in Tamil (தமிழ்) script. Do NOT use English, Kannada, or Telugu. Start with a proper Tamil greeting like "வணக்கம்".]',
    te: '[MANDATORY: You MUST reply strictly and entirely in Telugu (తెలుగు) script. Do NOT use English, Kannada, or Tamil. Start with a proper Telugu greeting like "నమస్కారం".]',
    en: '[MANDATORY: You MUST reply strictly and entirely in English. Do NOT use Kannada, Tamil, or Telugu script. Start with an English greeting like "Hello" or "Greetings".]',
  };

  const directive = langDirectives[targetLanguage] || langDirectives.en;
  const switchNotice = isLanguageSwitch
    ? `[LANGUAGE SWITCH: The farmer has switched to ${LANGUAGE_DISPLAY_NAMES[targetLanguage as SupportedLanguage] || targetLanguage}. Disregard previous languages.]\n`
    : '';
  const userContent = `${switchNotice}${directive}\n\n${query}`;

  const contents = [
    ...validHistory,
    {
      role: 'user' as const,
      parts: [{ text: userContent }],
    },
  ];

  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      // 20 second timeout for safety
      const timeoutPromise = new Promise<never>((_, reject) => {
        const id = setTimeout(() => {
          clearTimeout(id);
          reject(new Error('Gemini API request timed out after 20 seconds'));
        }, 20000);
      });

      const generatePromise = client.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.25,
          maxOutputTokens: 600,
        },
      });

      const response = await Promise.race([generatePromise, timeoutPromise]);
      if (response && response.text) {
        const finalizedText = await ensureCorrectScriptWithGemini(
          client,
          model,
          response.text.trim(),
          targetLanguage
        );

        return {
          text: finalizedText,
          modelUsed: model,
        };
      }
    } catch (err: any) {
      lastError = err;
      const status = err?.status || err?.statusCode;
      const msg = err?.message || '';

      // If model not found (404), temporarily unavailable / high demand (503), or quota (429), try next candidate
      if (
        status === 404 ||
        status === 503 ||
        status === 429 ||
        msg.includes('not found') ||
        msg.includes('is not supported') ||
        msg.includes('UNAVAILABLE') ||
        msg.includes('high demand') ||
        msg.includes('RESOURCE_EXHAUSTED') ||
        msg.includes('quota')
      ) {
        console.warn(`[aiService] Gemini model '${model}' temporarily unavailable or rate-limited (${status || msg}), trying next candidate...`);
        continue;
      }

      // If authentication error (400/401/403) or network timeout, break out
      break;
    }
  }

  if (lastError) {
    throw lastError;
  }

  return null;
}

export async function generateChatResponse(
  query: string,
  language = 'en',
  context?: FarmerContext,
  history: HistoryTurn[] = []
): Promise<ChatResponse> {
  const normQuery = query.trim();
  const effectiveLang = resolveEffectiveLanguage(normQuery, language, context?.language);

  // 1. Build System Prompt with farmer context and verified agricultural grounding
  const systemPrompt = buildSystemPrompt({
    language: effectiveLang,
    farmerName: context?.farmerName || 'Farmer',
    location: `${context?.district || 'Mandya'}, ${context?.state || 'South India'}`,
    landSize: context?.landSize || '2',
    soilInfo: context?.soilInfo,
    activeCrops: context?.currentCrops,
    cropStage: context?.cropStage,
    weatherSummary: context?.weatherSummary,
    groundingKnowledge: context?.groundingKnowledge,
  });

  // 2. PRIMARY: Try Official Google Gemini API if key is present
  if (config.geminiApiKey && config.geminiApiKey.trim() !== '') {
    try {
      const geminiResult = await callGoogleGeminiWithSdk(normQuery, systemPrompt, history, effectiveLang);
      if (geminiResult && geminiResult.text) {
        const { writtenAnswer, speechContent } = extractSpeechContent(geminiResult.text, effectiveLang);
        return {
          answer: writtenAnswer,
          speechContent,
          language: effectiveLang,
          mode: 'gemini',
          modelUsed: geminiResult.modelUsed,
          sources: [
            `Google Gemini Generative AI (${geminiResult.modelUsed})`,
            'ICAR / Krishi Vigyan Kendra (KVK) Agronomy Standards',
          ],
          suggestedQuestions: getSuggestedQuestions(effectiveLang),
        };
      }
    } catch (err: any) {
      const status = err?.status || err?.statusCode;
      const message = err?.message || String(err);
      let errorCategory = 'Gemini service unavailable';

      if (status === 429 || message.includes('RESOURCE_EXHAUSTED') || message.includes('quota')) {
        errorCategory = 'Gemini API quota exceeded (HTTP 429)';
      } else if (
        status === 400 ||
        status === 401 ||
        status === 403 ||
        message.includes('API_KEY_INVALID') ||
        message.includes('API key not valid')
      ) {
        errorCategory = 'Gemini API key is invalid or unauthorized';
      } else if (message.includes('timed out') || message.includes('fetch failed')) {
        errorCategory = 'Gemini API network timeout';
      }

      console.warn(`[aiService] Gemini API call failed (${errorCategory}). Safely falling back to local demo agronomy engine.`);

      const expertAnswer = generateContextualAgronomyAnswer(normQuery, effectiveLang, context);
      const { writtenAnswer, speechContent } = extractSpeechContent(expertAnswer, effectiveLang);
      const banner = getLocalFallbackBanner(effectiveLang, errorCategory);

      return {
        answer: `${banner}${writtenAnswer}`,
        speechContent,
        language: effectiveLang,
        mode: 'local_demo',
        fallbackReason: errorCategory,
        sources: ['Krushi Sathi Local Agronomy Knowledge System (ICAR & UAS Guidelines)'],
        suggestedQuestions: getSuggestedQuestions(effectiveLang),
      };
    }
  }

  // 3. FALLBACK: Gemini API key not configured -> Clean local demo mode (Requirement 7)
  const expertAnswer = generateContextualAgronomyAnswer(normQuery, effectiveLang, context);
  const { writtenAnswer, speechContent } = extractSpeechContent(expertAnswer, effectiveLang);
  const banner = getLocalFallbackBanner(effectiveLang, 'Gemini API key not configured');

  return {
    answer: `${banner}${writtenAnswer}`,
    speechContent,
    language: effectiveLang,
    mode: 'local_demo',
    fallbackReason: 'Gemini API key not configured',
    sources: ['Krushi Sathi Local Agronomy Knowledge System (ICAR & UAS Guidelines)'],
    suggestedQuestions: getSuggestedQuestions(effectiveLang),
  };
}

// ==========================================
// Built-in Contextual Agronomy Engine
// ==========================================

function generateContextualAgronomyAnswer(
  query: string,
  language: string,
  context?: FarmerContext
): string {
  const q = query.toLowerCase();

  // 1. Language switch & greeting requests
  // Check if query contains any agricultural keywords or context
  const hasAgriKeywords =
    /ಬೆಳೆ|ರೋಗ|ಕೀಟ|ಹುಳು|ಎಲೆ|ಹೂವು|ಕಾಂಡ|ತೆನೆ|ಗೊಬ್ಬರ|ಔಷಧ|ಮಣ್ಣು|ಹಳದಿ|ಸಿಂಪಡ|ಭತ್ತ|ರಾಗಿ|ಟೊಮ್ಯಾಟೊ|ತೊಗರಿ|ಹತ್ತಿ|ಕಬ್ಬು|ಮೆಕ್ಕೆಜೋಳ|பயிர்|நோய்|பூச்சி|புழு|இலை|பூ|தண்டு|கதிர்|உரம்|மருந்து|மண்|மஞ்சள்|தெளி|நெல்|தக்காளி|பருத்தி|கரும்பு|மக்காச்சோளம்|பంట|తెగులు|పురుగు|ఆకు|పూత|కాండం|వెన్ను|ఎరువు|మందు|నేల|పసుపు|పిచికారీ|వరి|మిరప|పత్తి|చెరకు|మొక్కజొన్న|టమాటా|crop|disease|pest|worm|borer|leaf|flower|stem|ear|fertilizer|spray|soil|yellow|paddy|rice|tomato|cotton|chilli|maize|sugarcane|ragi|pulse/i.test(q);

  const isPureGreeting =
    !hasAgriKeywords &&
    (/^s*(hi|hello|hey|namaste|vanakkam|namaskara|namaskaram|who are you|good morning|good evening)[s!.,?]*$/i.test(q) ||
     /^s*(ನಮಸ್ಕಾರ|ಹಲೋ|ನಮಸ್ತೆ)[s!.,?]*$/i.test(q) ||
     /^s*(வணக்கம்|ஹலோ|வணக்கமுங்க)[s!.,?]*$/i.test(q) ||
     /^s*(నమస్కారం|హలో|నమస్తే|బాగున్నారా)[s!.,?]*$/i.test(q) ||
     (q.length < 25 && (/(hi|hello|hey|who are you)/i.test(q) || q.includes('ನಮಸ್ಕಾರ') || q.includes('வணக்கம்') || q.includes('నమస్కారం'))));

  const isLanguageSwitch =
    /(kannada|tamil|telugu|english)/i.test(q) ||
    q.includes('ಕನ್ನಡ') ||
    q.includes('தமிழ்') ||
    q.includes('తెలుగు') ||
    q.includes('ಕನ್ನಡದಲ್ಲಿ') ||
    q.includes('தமிழில்') ||
    q.includes('తెలుగులో');

  if (isPureGreeting || isLanguageSwitch) {
    if (language === 'kn') {
      return (
        `ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಕೃಷಿ ಸಂಗಾತಿ 'ಕೃಷಿ ಸಾಥಿ'.\n\n` +
        `ಖಂಡಿತ, ನಾನು ನಿಮ್ಮ ಜೊತೆ ಸಂಪೂರ್ಣವಾಗಿ ಕನ್ನಡದಲ್ಲೇ ಮಾತನಾಡುತ್ತೇನೆ. ನಿಮ್ಮ ಹೊಲದ ಬೆಳೆ, ಮಣ್ಣು, ರೋಗ-ಕೀಟ ಬಾಧೆ ಅಥವಾ ಗೊಬ್ಬರದ ಬಗ್ಗೆ ಯಾವುದೇ ಪ್ರಶ್ನೆ ಇದ್ದರೂ ಮುಕ್ತವಾಗಿ ಕೇಳಿ.\n\n` +
        `ಮುಂದಿನ ಹೆಜ್ಜೆ: ನಿಮ್ಮ ಜಮೀನಿನ ಮಣ್ಣಿನ ವಿಧ ಮತ್ತು ಈಗ ಬೆಳೆಯುತ್ತಿರುವ ಬೆಳೆಯ ಹೆಸರನ್ನು ನನಗೆ ತಿಳಿಸಿ.\n\n` +
        `<speech_summary>ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಕೃಷಿ ಸಂಗಾತಿ ಕೃಷಿ ಸಾಥಿ. ನಿಮ್ಮ ಹೊಲದ ಬೆಳೆ, ಮಣ್ಣು ಮತ್ತು ಗೊಬ್ಬರದ ಬಗ್ಗೆ ಯಾವುದೇ ಪ್ರಶ್ನೆ ಇದ್ದರೂ ಕೇಳಿ. ನಿಮ್ಮ ಜಮೀನಿನ ಮಣ್ಣಿನ ವಿಧ ಮತ್ತು ಈಗ ಬೆಳೆಯುತ್ತಿರುವ ಬೆಳೆ ಯಾವುದು?</speech_summary>`
      );
    }
    if (language === 'ta') {
      return (
        `வணக்கம்! நான் உங்கள் விவசாய வழிகாட்டி 'கிருஷி சாதி' (Krushi Sathi).\n\n` +
        `நிச்சயமாக, நான் உங்களுடன் தமிழிலேயே உரையாடுவேன். உங்கள் பயிர், மண் வளம், பூச்சி தாக்குதல் அல்லது உர மேலாண்மை குறித்த சந்தேகங்களை தயங்காமல் கேட்கலாம்.\n\n` +
        `அடுத்த நடவடிக்கை: உங்கள் நிலத்தின் மண் வகை மற்றும் தற்போதைய பயிர் விவரத்தை கூறுங்கள்.\n\n` +
        `<speech_summary>வணக்கம்! நான் உங்கள் விவசாய வழிகாட்டி கிருஷி சாதி. உங்கள் பயிர், மண் வளம் மற்றும் உரம் குறித்த சந்தேகங்களை தயங்காமல் கேளுங்கள். உங்கள் நிலத்தின் மண் வகை மற்றும் தற்போதைய பயிர் என்ன?</speech_summary>`
      );
    }
    if (language === 'te') {
      return (
        `నమస్కారం! నేను మీ వ్యవసాయ సహచరుడు 'కృషి సాథి' (Krushi Sathi).\n\n` +
        `తప్పకుండా, నేను మీతో పూర్తిగా తెలుగులోనే మాట్లాడతాను. మీ పొలం నేల, పంటలు, పురుగుల నివారణ లేదా ఎరువుల వాడకం గురించి ఎలాంటి ప్రశ్న ఉన్నా అడగండి.\n\n` +
        `తదుపరి చర్య: మీ పొలం నేల రకం మరియు ప్రస్తుత పంట వివరాలను చెప్పండి.\n\n` +
        `<speech_summary>నమస్కారం! నేను మీ వ్యవసాయ సహచరుడు కృషి సాథి. మీ పొలం నేల, పంటలు మరియు ఎరువుల గురించి ఎలాంటి సందేహం ఉన్నా అడగండి. మీ పొలం నేల రకం మరియు ప్రస్తుత పంట ఏమిటి?</speech_summary>`
      );
    }
    return (
      `Hello! I am Krushi Sathi, your friendly farming companion.\n\n` +
      `I am right here to help you in English, Kannada (ಕನ್ನಡ), Tamil (தமிழ்), or Telugu (తెలుగు). Feel free to ask about your crops, soil, pest attacks, or fertilizers.\n\n` +
      `Next Action: Tell me which crop you are planning to sow or what issue you are noticing in your field.\n\n` +
      `<speech_summary>Hello! I am Krushi Sathi, your friendly farming companion. I am here to help you with crops, soil, pest attacks, and fertilizers. Tell me what crop you are planning to sow or what issue you notice in your field.</speech_summary>`
    );
  }

  // 1.5. General Crop Suitability / Which Crop is Best
  const isGeneralCropQuery =
    q.includes('best crop') ||
    q.includes('which crop') ||
    q.includes('crop recommendation') ||
    q.includes('what to grow') ||
    q.includes('ಯಾವ ಬೆಳೆ') ||
    q.includes('ಬೆಳೆ ಉತ್ತಮ') ||
    q.includes('ಎಂತ ಬೆಳೆ') ||
    q.includes('எந்த பயிர்') ||
    q.includes('பயிர் சிறந்தது') ||
    q.includes('ఏ పంట') ||
    q.includes('పంట మంచిది');

  if (isGeneralCropQuery && !q.includes('red') && !q.includes('black') && !q.includes('ಕೆಂಪು') && !q.includes('ಕಪ್ಪು') && !q.includes('செம்மண்') && !q.includes('கரிசல்') && !q.includes('ఎర్ర') && !q.includes('నల్ల')) {
    if (language === 'kn') {
      return (
        `🌾 **ಮಣ್ಣಿನ ಆಧಾರದ ಮೇಲೆ ಸೂಕ್ತ ಬೆಳೆಗಳು (Crop Guide)**:\n` +
        `1. ಕೆಂಪು ಮಣ್ಣು (Red Soil): ರಾಗಿ, ನೆಲಗಡಲೆ, ಮೆಕ್ಕೆಜೋಳ, ತೊಗರಿ ಮತ್ತು ಟೊಮ್ಯಾಟೊ ಅತ್ಯಂತ ಸೂಕ್ತ.\n` +
        `2. ಕಪ್ಪು ಮಣ್ಣು (Black Soil): ಹತ್ತಿ, ಜೋಳ, ಕಡಲೆ, ಸೋಯಾಬೀನ್ ಮತ್ತು ಸೂರ್ಯಕಾಂತಿ ಉತ್ತಮ ಇಳುವರಿ ನೀಡುತ್ತವೆ.\n` +
        `3. ಗೋಡು / ಮೆಕ್ಕಲು ಮಣ್ಣು: ಭತ್ತ, ಕಬ್ಬು, ಬಾಳೆ ಮತ್ತು ತರಕಾರಿಗಳು ಭರ್ಜರಿಯಾಗಿ ಬೆಳೆಯುತ್ತವೆ.\n` +
        `4. ಸಾವಯವ ಸಲಹೆ: ಬಿತ್ತನೆಗೆ ಮುಂಚೆ ಎಕರೆಗೆ 4 ಟನ್ ಕೊಟ್ಟಿಗೆ ಗೊಬ್ಬರ ಹಾಕಿ ಮಣ್ಣಿನ ತೇವಾಂಶ ಹೆಚ್ಚಿಸಿ.\n\n` +
        `ಮುಂದಿನ ಹೆಜ್ಜೆ: ನಿಮ್ಮ ಜಮೀನಿನ ಮಣ್ಣಿನ ಬಣ್ಣ (ಕೆಂಪು/ಕಪ್ಪು) ಮತ್ತು ನೀರಾವರಿ ಸೌಲಭ್ಯ (ಬೋರ್‌ವೆಲ್/ಮಳೆ) ತಿಳಿಸಿ.\n\n` +
        `<speech_summary>ಕೆಂಪು ಮಣ್ಣಿಗೆ ರಾಗಿ ಮತ್ತು ಶೇಂಗಾ, ಕಪ್ಪು ಮಣ್ಣಿಗೆ ಹತ್ತಿ ಮತ್ತು ಜೋಳ ಅತ್ಯುತ್ತಮ. ನಿಮ್ಮ ಹೊಲದ ಮಣ್ಣಿನ ಬಣ್ಣ ಮತ್ತು ನೀರಾವರಿ ಸೌಲಭ್ಯ ಹೇಗಿದೆ?</speech_summary>`
      );
    }
    if (language === 'ta') {
      return (
        `🌾 **மண் வகைக்கு ஏற்ற பயிர் பரிந்துரை (Crop Guide)**:\n` +
        `1. செம்மண் (Red Soil): நிலக்கடலை, கேழ்வரகு (ராகி), மக்காச்சோளம், துவரை மற்றும் தக்காளி.\n` +
        `2. கரிசல் மண் (Black Soil): பருத்தி, சோளம், கொண்டைக்கடலை மற்றும் சோயாபீன்ஸ்.\n` +
        `3. வண்டல் மண்: நெல், கரும்பு, வாழை மற்றும் காய்கறி பயிர்கள்.\n` +
        `4. உர வழிகாட்டல்: விதைப்பிற்கு முன் ஏக்கருக்கு 4 டன் மக்கிய தொழுவுரம் இடவும்.\n\n` +
        `அடுத்த நடவடிக்கை: உங்கள் நிலத்தின் மண் வகை மற்றும் நீர் பாசன வசதியை கூறுங்கள்.\n\n` +
        `<speech_summary>செம்மண்ணிற்கு நிலக்கடலை மற்றும் கேழ்வரகு, கரிசல் மண்ணிற்கு பருத்தி சிறந்தது. உங்கள் நிலத்தின் மண் வகை மற்றும் பாசன வசதி என்ன?</speech_summary>`
      );
    }
    if (language === 'te') {
      return (
        `🌾 **నేల రకానికి తగిన పంటల సిఫార్సు (Crop Guide)**:\n` +
        `1. ఎర్ర నేలలు (Red Soil): వేరుశనగ, రాగి, మొక్కజొన్న, కంది మరియు టమాటా.\n` +
        `2. నల్ల రేగడి నేలలు (Black Soil): పత్తి, శనగ, జొన్న, సోయాబీన్ మరియు పొద్దుతిరుగుడు.\n` +
        `3. ఒండ్రు నేలలు: వరి, చెరకు, అరటి మరియు కూరగాయల సాగు.\n` +
        `4. సేంద్రీయ ఎరువు: విత్తే ముందు ఎకరాకు 4 టన్నుల పశువుల ఎరువు వేయండి.\n\n` +
        `తదుపరి చర్య: మీ పొలం నేల రకం మరియు నీటి వసతి (బోరు / వర్షాధారం) వివరాలను చెప్పండి.\n\n` +
        `<speech_summary>ఎర్ర నేలలకు వేరుశనగ మరియు రాగి, నల్ల నేలలకు పత్తి చాలా మంచిది. మీ పొలం నేల రకం మరియు నీటి వసతి ఏమిటి?</speech_summary>`
      );
    }
    return (
      `🌾 **Crop Recommendations by Soil Type**:\n` +
      `1. Red Soil (Well-drained): Ragi (Finger millet), Groundnut, Maize, Red gram, and Tomato.\n` +
      `2. Black Soil (Clay/Moisture-retentive): Cotton, Chickpea (Bengal gram), Soybean, Sorghum (Jowar), and Sunflower.\n` +
      `3. Alluvial / Loam Soil: Paddy (Rice), Sugarcane, Banana, and seasonal vegetables.\n` +
      `4. Organic Foundation: Incorporate 4 tonnes of Farm Yard Manure (FYM) per acre before sowing.\n\n` +
      `Next Action: Tell me your soil color (Red or Black) and water source (Borewell or Rainfed) for tailored advice.\n\n` +
      `<speech_summary>Red soil is great for Groundnut and Ragi, while black soil is ideal for Cotton and Chickpea. What is your soil type and water source?</speech_summary>`
    );
  }

  // 1.6. Red Soil Match
  if (
    q.includes('red soil') ||
    q.includes('red loam') ||
    (q.includes('ಕೆಂಪು') && (q.includes('ಮಣ್ಣ') || q.includes('ಬೆಳೆ') || q.includes('ಜಮೀನು'))) ||
    q.includes('செம்மண்') ||
    q.includes('ఎర్ర నేల') ||
    q.includes('ఎర్ర')
  ) {
    if (language === 'kn') {
      return (
        `🌱 **ಕೆಂಪು ಮಣ್ಣಿಗೆ ಅತ್ಯುತ್ತಮ ಬೆಳೆಗಳು (Red Soil)**:\n` +
        `1. ರಾಗಿ (Finger Millet): ಮಳೆಯಾಶ್ರಿತ ಅಥವಾ ನೀರಾವರಿಗೆ ಅತ್ಯಂತ ಯಶಸ್ವಿ ಬೆಳೆ.\n` +
        `2. ನೆಲಗಡಲೆ / ಶೇಂಗಾ (Groundnut): ಸುಲಭವಾಗಿ ನೀರು ಬಸಿದುಹೋಗುವ ಕೆಂಪು ಮಣ್ಣಿನಲ್ಲಿ ಕಾಯಿ ಚೆನ್ನಾಗಿ ಕಟ್ಟುತ್ತದೆ.\n` +
        `3. ಮೆಕ್ಕೆಜೋಳ (Maize) ಮತ್ತು ತೊಗರಿ (Red Gram): ಕಡಿಮೆ ಖರ್ಚಿನಲ್ಲಿ ಉತ್ತಮ ಇಳುವರಿ ನೀಡುತ್ತವೆ.\n` +
        `4. ತೋಟಗಾರಿಕೆ: ಟೊಮ್ಯಾಟೊ, ಮೆಣಸಿನಕಾಯಿ ಮತ್ತು ಮಾವು ಕೆಂಪು ಮಣ್ಣಿಗೆ ಹೇಳಿಮಾಡಿಸಿದ ಬೆಳೆಗಳು.\n\n` +
        `ಮುಂದಿನ ಹೆಜ್ಜೆ: ಬಿತ್ತನೆಗೆ ಮುನ್ನ ಎಕರೆಗೆ 4 ಟನ್ ಕೊಟ್ಟಿಗೆ ಗೊಬ್ಬರ ಮಣ್ಣಿಗೆ ಸೇರಿಸಿ ತೇವಾಂಶ ಕಾಪಾಡಿ.\n\n` +
        `<speech_summary>ಕೆಂಪು ಮಣ್ಣಿಗೆ ರಾಗಿ, ನೆಲಗಡಲೆ ಮತ್ತು ಟೊಮ್ಯಾಟೊ ಅತ್ಯಂತ ಸೂಕ್ತ. ಬಿತ್ತನೆಗೆ ಮುನ್ನ 4 ಟನ್ ಕೊಟ್ಟಿಗೆ ಗೊಬ್ಬರ ಸೇರಿಸಿ. ನಿಮ್ಮ ಜಮೀನಿನಲ್ಲಿ ನೀರಾವರಿ ಸೌಲಭ್ಯವಿದೆಯೇ?</speech_summary>`
      );
    }
    if (language === 'ta') {
      return (
        `🌱 **செம்மண்ணிற்கு ஏற்ற சிறந்த பயிர்கள் (Red Soil)**:\n` +
        `1. நிலக்கடலை: செம்மண்ணில் நல்ல மகசூல் தரும் மிகச் சிறந்த பணப்பயிர்.\n` +
        `2. கேழ்வரகு (ராகி) மற்றும் மக்காச்சோளம்: குறைந்த நீரில் அதிக லாபம் தரும் பயிர்கள்.\n` +
        `3. துவரை மற்றும் பயறு வகைகள்: மண்ணின் தழைச்சத்தை அதிகரித்து நல்ல விளைச்சல் தரும்.\n` +
        `4. காய்கறிகள்: தக்காளி, மிளகாய் மற்றும் வெங்காயம் செம்மண்ணிற்கு மிகவும் ஏற்றவை.\n\n` +
        `அடுத்த நடவடிக்கை: விதைப்பதற்கு முன் ஏக்கருக்கு 4 டன் தொழுவுரம் இட்டு உழவு செய்யவும்.\n\n` +
        `<speech_summary>செம்மண்ணிற்கு நிலக்கடலை, கேழ்வரகு மற்றும் தக்காளி மிகவும் ஏற்றவை. விதைப்பதற்கு முன் 4 டன் தொழுவுரம் இடவும். உங்கள் நிலத்தில் பாசன வசதி உள்ளதா?</speech_summary>`
      );
    }
    if (language === 'te') {
      return (
        `🌱 **ఎర్ర నేలలకు అనుకూలమైన పంటలు (Red Soil)**:\n` +
        `1. వేరుశనగ: ఎర్ర నేలల్లో కాయలు బాగా ఊరి అధిక దిగుబడిని ఇస్తుంది.\n` +
        `2. రాగి మరియు మొక్కజొన్న: తక్కువ నీటితో సులభంగా సాగు చేయగల పంటలు.\n` +
        `3. కంది మరియు పెసర: నేల సారాన్ని పెంచి మంచి లాభాన్ని అందిస్తాయి.\n` +
        `4. కూరగాయలు: టమాటా, మిరప సాగుకు ఎర్ర నేలలు ఎంతో అనువైనవి.\n\n` +
        `తదుపరి చర్య: విత్తే ముందు ఎకరాకు 4 టన్నుల పశువుల ఎరువు వేసి తేమను కాపాడండి.\n\n` +
        `<speech_summary>ఎర్ర నేలలకు వేరుశనగ, రాగి మరియు టమాటా పంటలు ఎంతో అనుకూలం. విత్తే ముందు 4 టన్నుల పశువుల ఎరువు వేయండి. మీ పొలంలో బోరు నీటి వసతి ఉందా?</speech_summary>`
      );
    }
    return (
      `🌱 **Best Crops for Red Soil (Well-Drained Loam)**:\n` +
      `1. Ragi (Finger Millet): Highly resilient, climate-smart crop with minimal pest risk.\n` +
      `2. Groundnut (Peanut): Aerated red soil allows excellent pod development and easy harvesting.\n` +
      `3. Maize & Pulses (Red gram, Green gram): Fast-growing with strong local market demand.\n` +
      `4. Vegetables: Tomato and Chilli thrive on red soil with moderate drip or furrow irrigation.\n\n` +
      `Next Action: Mix 4 tonnes of Farm Yard Manure (FYM) per acre during primary ploughing to retain moisture.\n\n` +
      `<speech_summary>Red soil is ideal for Ragi, Groundnut, Maize, and Tomato. Mix 4 tonnes of organic manure per acre. What is your primary water source?</speech_summary>`
    );
  }

  // 1.7. Black Soil Match
  if (
    q.includes('black soil') ||
    q.includes('black cotton') ||
    (q.includes('ಕಪ್ಪು') && (q.includes('ಮಣ್ಣ') || q.includes('ಬೆಳೆ') || q.includes('ಜಮೀನು'))) ||
    q.includes('கரிசல்') ||
    q.includes('నల్ల రేగడి') ||
    q.includes('నల్ల నేల')
  ) {
    if (language === 'kn') {
      return (
        `🌾 **ಕಪ್ಪು ಮಣ್ಣಿಗೆ ಅತ್ಯುತ್ತಮ ಬೆಳೆಗಳು (Black Soil)**:\n` +
        `1. ಹತ್ತಿ (Cotton): ತೇವಾಂಶ ಹಿಡಿದಿಟ್ಟುಕೊಳ್ಳುವ ಕಪ್ಪು ಮಣ್ಣಿನಲ್ಲಿ ಹತ್ತಿ ಅತ್ಯಧಿಕ ಇಳುವರಿ ನೀಡುತ್ತದೆ.\n` +
        `2. ಜೋಳ (Jowar) ಮತ್ತು ಗೋಧಿ: ರಬಿ ಹಂಗಾಮಿನಲ್ಲಿ ಅತ್ಯುತ್ತಮವಾಗಿ ಬೆಳೆಯುತ್ತವೆ.\n` +
        `3. ಸೋಯಾಬೀನ್ ಮತ್ತು ಕಡಲೆ (Bengal Gram): ಕಡಿಮೆ ನೀರಿನಲ್ಲಿ ಭರ್ಜರಿ ಲಾಭ ತರುತ್ತವೆ.\n` +
        `4. ಸೂರ್ಯಕಾಂತಿ: ಕಪ್ಪು ಮಣ್ಣಿನ ಎಣ್ಣೆಕಾಳು ಬೆಳೆಗೆ ಅತ್ಯಂತ ಸೂಕ್ತ.\n\n` +
        `ಮುಂದಿನ ಹೆಜ್ಜೆ: ಕಪ್ಪು ಮಣ್ಣಿನಲ್ಲಿ ನೀರು ನಿಲ್ಲದಂತೆ ಬಸಿಗಾಲುವೆಗಳನ್ನು ವ್ಯವಸ್ಥಿತವಾಗಿ ನಿರ್ವಹಿಸಿ.\n\n` +
        `<speech_summary>ಕಪ್ಪು ಮಣ್ಣಿನಲ್ಲಿ ತೇವಾಂಶ ಚೆನ್ನಾಗಿ ಹಿಡಿದಿಟ್ಟುಕೊಳ್ಳುವುದರಿಂದ ಹತ್ತಿ, ಜೋಳ ಮತ್ತು ಕಡಲೆ ಉತ್ತಮ ಇಳುವರಿ ನೀಡುತ್ತವೆ. ನಿಮ್ಮ ಹೊಲದಲ್ಲಿ ಬಸಿಗಾಲುವೆ ಮಾಡಲಾಗಿದೆಯೇ?</speech_summary>`
      );
    }
    if (language === 'ta') {
      return (
        `🌾 **கரிசல் மண்ணிற்கு ஏற்ற பயிர்கள் (Black Soil)**:\n` +
        `1. பருத்தி: ஈரப்பதத்தை தக்கவைக்கும் கரிசல் மண்ணிற்கு பருத்தி மிகச் சிறந்த தேர்வு.\n` +
        `2. சோளம் மற்றும் கம்பு: மானாவாரி பயிராக சிறந்த பலன் தரும்.\n` +
        `3. கொண்டைக்கடலை மற்றும் சோயாபீன்ஸ்: மண்வளத்தை பெருக்கி நல்ல வருமானம் தரும்.\n` +
        `4. சூரியகாந்தி: குறைந்த செலவில் நிறைந்த மகசூல் கொடுக்கும் எண்ணெய் வித்து பயிர்.\n\n` +
        `அடுத்த நடவடிக்கை: தண்ணீர் தேங்காமல் இருக்க வடிகால் அமைப்பை உறுதி செய்யுங்கள்.\n\n` +
        `<speech_summary>கரிசல் மண்ணிற்கு பருத்தி, சோளம் மற்றும் கொண்டைக்கடலை சிறந்த பயிர்கள். நிலத்தில் தண்ணீர் தேங்காமல் வடிகால் அமைக்கப்பட்டுள்ளதா?</speech_summary>`
      );
    }
    if (language === 'te') {
      return (
        `🌾 **నల్ల రేగడి నేలలకు అనుకూలమైన పంటలు (Black Soil)**:\n` +
        `1. పత్తి: ఎక్కువ తేమను నిలుపుకునే నల్ల రేగడి నేలలో పత్తి బ్రహ్మాండమైన దిగుబడినిస్తుంది.\n` +
        `2. శనగ మరియు సోయాబీన్: రబీ కాలంలో తక్కువ ఖర్చుతో అధిక లాభం చేకూరుస్తాయి.\n` +
        `3. జొన్న మరియు సజ్జ: తక్కువ వర్షపాతంలో కూడా స్థిరమైన దిగుబడినిస్తాయి.\n` +
        `4. పొద్దుతిరుగుడు (Sunflower): నల్ల నేలలో నూనె గింజల సాగుకు చాలా అనుకూలం.\n\n` +
        `తదుపరి చర్య: పొలంలో నీరు నిల్వ ఉండకుండా మురుగు నీటి కాలువలు ఏర్పాటు చేసుకోండి.\n\n` +
        `<speech_summary>నల్ల రేగడి నేలల్లో పత్తి, శనగ మరియు జొన్న మంచి దిగుబడినిస్తాయి. పొలంలో నీరు నిల్వ ఉండకుండా మురుగు కాల్వలు ఉన్నాయా?</speech_summary>`
      );
    }
    return (
      `🌾 **Best Crops for Black Soil (Moisture-Retentive Clay)**:\n` +
      `1. Cotton: The premier cash crop for black soil due to its deep moisture-holding capacity.\n` +
      `2. Chickpea (Bengal Gram): Outstanding rabi pulse crop requiring minimal supplementary irrigation.\n` +
      `3. Soybean & Sunflower: High-yield oilseed options with assured government MSP support.\n` +
      `4. Sorghum (Jowar): Deep-rooted cereal that withstands dry spells after heavy rains.\n\n` +
      `Next Action: Ensure proper drainage furrows to prevent waterlogging during monsoon downpours.\n\n` +
      `<speech_summary>Black soil holds moisture well and is excellent for Cotton, Chickpea, and Jowar. Do you have proper field drainage trenches?</speech_summary>`
    );
  }

  // 2. Pest & Disease detection
  for (const disease of DISEASES_DATA) {
    const dName = disease.name.toLowerCase();
    const dKn = disease.nameKannada.toLowerCase();
    const dTa = disease.nameTamil.toLowerCase();
    const dTe = disease.nameTelugu.toLowerCase();

    // Check specific vernacular disease/pest names and keywords
    const isPestDiseaseQuery =
      q.includes('pest') ||
      q.includes('insect') ||
      q.includes('worm') ||
      q.includes('borer') ||
      q.includes('bollworm') ||
      q.includes('dead heart') ||
      q.includes('blast') ||
      q.includes('spot') ||
      q.includes('curl') ||
      q.includes('yellow') ||
      q.includes('disease') ||
      q.includes('thrips') ||
      q.includes('mildew') ||
      q.includes('rot') ||
      q.includes('dry') ||
      q.includes('drop') ||
      q.includes('ರೋಗ') ||
      q.includes('ಕೀಟ') ||
      q.includes('ಹುಳು') ||
      q.includes('ಕೊರೆಯುವ') ||
      q.includes('ಬೆಂಕಿ') ||
      q.includes('ಸುರುಟು') ||
      q.includes('ಬೂದಿ') ||
      q.includes('ಹಳದಿ') ||
      q.includes('ಒಣಗ') ||
      q.includes('நோய்') ||
      q.includes('பூச்சி') ||
      q.includes('புழு') ||
      q.includes('துளைப்பான்') ||
      q.includes('குலை') ||
      q.includes('சுருட்டை') ||
      q.includes('சாம்பல்') ||
      q.includes('பூ உதிர்') ||
      q.includes('உதிர்கிறது') ||
      q.includes('புరుగు') ||
      q.includes('తెగులు') ||
      q.includes('తొలుచు') ||
      q.includes('అగ్గి') ||
      q.includes('ముడుత') ||
      q.includes('ముడుచు') ||
      q.includes('తామర') ||
      q.includes('రాలడం') ||
      q.includes('బూడిద');

    const matchesDiseaseName =
      q.includes(dName.split(' ')[0]) ||
      (dName.includes('stem borer') && (q.includes('stem borer') || q.includes('ಕಾಂಡ ಕೊರೆಯುವ') || q.includes('ತಂಡು') || q.includes('துளைப்பான்') || q.includes('కాండం తొలుచు'))) ||
      (dName.includes('blast') && (q.includes('blast') || q.includes('ಬೆಂಕಿ ರೋಗ') || q.includes('குலை நோய்') || q.includes('అగ్గి తెగులు'))) ||
      (dName.includes('leaf curl') && (q.includes('leaf curl') || q.includes('curl') || q.includes('ಸುರುಟು') || q.includes('சுருட்டை') || q.includes('ముడుత') || q.includes('ముడుచు'))) ||
      (dName.includes('bollworm') && (q.includes('bollworm') || q.includes('pink bollworm') || q.includes('ಕಾಯಿಕೊರೆಯುವ') || q.includes('காய் துளைப்பான்') || q.includes('గులాబీ రంగు'))) ||
      (dName.includes('powdery mildew') && (q.includes('powdery') || q.includes('mildew') || q.includes('ಬೂದಿ') || q.includes('சாம்பல்') || q.includes('బూడిద తెగులు'))) ||
      q.includes(dKn) ||
      q.includes(dTa) ||
      q.includes(dTe);

    // Also check if any crop in query or in context matches affectedCrops
    const contextCrops = context?.currentCrops || [];
    const matchesCrop =
      disease.affectedCrops.some((c) => {
        const cLower = c.toLowerCase().split(' ')[0];
        return (
          q.includes(cLower) ||
          (cLower === 'paddy' && (q.includes('rice') || q.includes('ಭತ್ತ') || q.includes('ಗದ್ದೆ') || q.includes('ನೆಲ್') || q.includes('வரி') || q.includes('వరి'))) ||
          (cLower === 'tomato' && (q.includes('ಟೊಮ್ಯಾಟೊ') || q.includes('தக்காளி') || q.includes('టమాటా'))) ||
          (cLower === 'cotton' && (q.includes('ಹತ್ತಿ') || q.includes('பருத்தி') || q.includes('పత్తి'))) ||
          (cLower === 'chilli' && (q.includes('ಮೆಣಸಿನಕಾಯಿ') || q.includes('மிளகாய்') || q.includes('మిరప'))) ||
          (cLower === 'ragi' && (q.includes('ರಾಗಿ') || q.includes('கேழ்வரகு') || q.includes('రాగి'))) ||
          contextCrops.some((ctxC) => ctxC.toLowerCase().includes(cLower))
        );
      });

    const isMatched = matchesDiseaseName || (matchesCrop && isPestDiseaseQuery);

    if (isMatched) {
      if (language === 'kn') {
        const cropKn = q.includes('ಭತ್ತ') || context?.currentCrops?.some(c => c.includes('Paddy') || c.includes('ಭತ್ತ')) ? 'ಭತ್ತದ' :
                       q.includes('ಟೊಮ್ಯಾಟೊ') ? 'ಟೊಮ್ಯಾಟೊ' :
                       q.includes('ಹತ್ತಿ') ? 'ಹತ್ತಿಯ' : 'ನಿಮ್ಮ';
        return (
          `🌿 **${disease.nameKannada} ನಿರ್ವಹಣೆ ಕ್ರಮಗಳು**:\n` +
          `1. ಲಕ್ಷಣ: ${disease.symptomsKn}.\n` +
          `2. ಮೊದಲಿಗೆ 5 ಮಿ.ಲೀ ಬೇವಿನ ಎಣ್ಣೆಯನ್ನು ಪ್ರತಿ ಲೀಟರ್ ನೀರಿಗೆ ಬೆರೆಸಿ ಎಲೆಗಳ ಮೇಲೆ ಸಿಂಪಡಿಸಿ.\n` +
          `3. ಸುರಕ್ಷತಾ ನಿಯಮ: ಔಷಧ ಸಿಂಪರಣೆ ಮಾಡುವಾಗ ಮುಖಗವಸು ಮತ್ತು ಕೈಗವಸು ಧರಿಸಿ, ಗಾಳಿ ಜೋರಿದ್ದಾಗ ಸಿಂಪಡಿಸಬೇಡಿ.\n` +
          `4. ಹಾನಿ ಹೆಚ್ಚಾಗಿದ್ದರೆ ಸಮೀಪದ ರೈತ ಸಂಪರ್ಕ ಕೇಂದ್ರ ಅಥವಾ ಕಿಸಾನ್ ಕಾಲ್ ಸೆಂಟರ್ 1800-180-1551 ಗೆ ಕರೆ ಮಾಡಿ.\n\n` +
          `ಮುಂದಿನ ಹೆಜ್ಜೆ: ಲಕ್ಷಣಗಳು ಕಾಣಿಸಿಕೊಂಡು ಎಷ್ಟು ದಿನಗಳಾಗಿವೆ ಎಂಬುದನ್ನು ಪರಿಶೀಲಿಸಿ ಕ್ರಮ ಕೈಗೊಳ್ಳಿ.\n\n` +
          `<speech_summary>ನಮಸ್ಕಾರ, ${cropKn} ಬೆಳೆಯಲ್ಲಿ ${disease.nameKannada.split('(')[0].trim()} ನಿಯಂತ್ರಣಕ್ಕೆ ಮೊದಲಿಗೆ ಪ್ರತಿ ಲೀಟರ್ ನೀರಿಗೆ 5 ಮಿ.ಲೀ ಬೇವಿನ ಎಣ್ಣೆ ಸಿಂಪಡಿಸಿ. ನಿಮ್ಮ ಹೊಲದಲ್ಲಿ ರೋಗದ ಲಕ್ಷಣ ಎಷ್ಟು ದಿನಗಳಿಂದ ಕಾಣಿಸಿಕೊಂಡಿದೆ?</speech_summary>`
        );
      }
      if (language === 'ta') {
        const cropTa = q.includes('தக்காளி') || context?.currentCrops?.some(c => c.includes('Tomato') || c.includes('தக்காளி')) ? 'தக்காளி' :
                       q.includes('நெல்') ? 'நெல்' :
                       q.includes('பருத்தி') ? 'பருத்தி' : 'உங்கள்';
        return (
          `🌿 **${disease.nameTamil} கட்டுப்பாட்டு முறைகள்**:\n` +
          `1. அறிகுறி: ${disease.symptomsTa}.\n` +
          `2. முதலில் ஒரு லிட்டர் தண்ணீருக்கு 5 மி.லி வேப்பெண்ணெய் கலந்து பயிரில் தெளிக்கவும்.\n` +
          `3. பாதுகாப்பு: மருந்து தெளிக்கும் போது முகக்கவசம் மற்றும் கையுறை அணியவும், பலத்த காற்றில் தெளிக்க வேண்டாம்.\n` +
          `4. கூடுதல் ஆலோசனைக்கு வேளாண்மை அலுவலர் அல்லது கிசான் கால் சென்டர் 1800-180-1551 அணுகவும்.\n\n` +
          `அடுத்த நடவடிக்கை: பாதிக்கப்பட்ட இலைகளை உடனே அப்புறப்படுத்தி எரிக்கவும்.\n\n` +
          `<speech_summary>வணக்கம், ${cropTa} பயிரில் ${disease.nameTamil.split('(')[0].trim()} கட்டுப்படுத்த ஒரு லிட்டர் தண்ணீருக்கு 5 மி.லி வேப்பெண்ணெய் கலந்து தெளிக்கவும். உங்கள் பயிர் நட்டு எத்தனை நாட்கள் ஆகிறது?</speech_summary>`
        );
      }
      if (language === 'te') {
        const cropTe = q.includes('మిరప') || context?.currentCrops?.some(c => c.includes('Chilli') || c.includes('మిరప')) ? 'మిరప' :
                       q.includes('వరి') ? 'వరి' :
                       q.includes('పత్తి') ? 'పత్తి' :
                       q.includes('టమాటా') ? 'టమాటా' : 'మీ';
        return (
          `🌿 **${disease.nameTelugu} నివారణ మార్గాలు**:\n` +
          `1. లక్షణం: ${disease.symptomsTe}.\n` +
          `2. మొదట లీటరు నీటికి 5 మి.లీ వేప నూనె కలిపి ఆకులపై పిచికారీ చేయండి.\n` +
          `3. భద్రతా జాగ్రత్త: మందు పిచికారీ చేసేటప్పుడు మాస్క్, గ్లౌజులు ధరించండి; గాలి తీవ్రంగా ఉన్నప్పుడు చేయవద్దు.\n` +
          `4. సమస్య తగ్గకపోతే సమీప రైతు భరోసా కేంద్రం లేదా కిసాన్ కాల్ సెంటర్ 1800-180-1551 ను సంప్రదించండి.\n\n` +
          `తదుపరి చర్య: తెగులు సోకిన ఆకులను తీసివేసి నాశనం చేయండి.\n\n` +
          `<speech_summary>నమస్కారం, ${cropTe} పంటలో ${disease.nameTelugu.split('(')[0].trim()} నివారణకు మొదట లీటరు నీటికి 5 మి.లీ వేప నూనె కలిపి పిచికారీ చేయండి. మీ పొలంలో ఎన్ని ఎకరాల్లో ఈ సమస్య ఉంది?</speech_summary>`
        );
      }
      const cropEn = q.includes('cotton') || context?.currentCrops?.some(c => c.toLowerCase().includes('cotton')) ? 'cotton' :
                     q.includes('paddy') ? 'paddy' :
                     q.includes('tomato') ? 'tomato' : 'your crop';
      return (
        `🌿 **Management for ${disease.name}**:\n` +
        `1. Symptom: ${disease.symptoms}.\n` +
        `2. Start with an organic spray: 5ml Neem Oil per litre of water on both sides of leaves.\n` +
        `3. Safety First: Wear gloves and mask when spraying. Never spray during strong wind or before rain.\n` +
        `4. Check exact pesticide dosage on the product label or consult your local Raitha Samparka Kendra / KVK.\n\n` +
        `Next Action: Inspect how many plants per square metre are showing these symptoms.\n\n` +
        `<speech_summary>Hello, for managing ${disease.name.split('(')[0].trim()} in ${cropEn}, start by spraying 5ml neem oil per litre of water and remove severely damaged parts. How many days ago did you first observe these symptoms?</speech_summary>`
      );
    }
  }

  // 3. Crop Advice & Soil Matching
  for (const crop of CROPS_DATA) {
    const cName = crop.name.toLowerCase();
    const cFirst = crop.name.split(' ')[0].toLowerCase();
    const cKn = crop.nameKannada.toLowerCase();
    const cTa = crop.nameTamil.toLowerCase();
    const cTe = crop.nameTelugu.toLowerCase();

    const matchesCrop =
      q.includes(cName) ||
      q.includes(cFirst) ||
      q.includes(cKn) ||
      (cFirst === 'paddy' && (q.includes('rice') || q.includes('ಭತ್ತ') || q.includes('ಗದ್ದೆ') || q.includes('ನೆಲ್') || q.includes('வரி') || q.includes('వరి'))) ||
      (cFirst === 'tomato' && (q.includes('ಟೊಮ್ಯಾಟೊ') || q.includes('தக்காளி') || q.includes('టమాటా'))) ||
      (cFirst === 'cotton' && (q.includes('ಹತ್ತಿ') || q.includes('பருத்தி') || q.includes('పత్తి'))) ||
      (cFirst === 'chilli' && (q.includes('ಮೆಣಸಿನಕಾಯಿ') || q.includes('மிளகாய்') || q.includes('మిరప'))) ||
      (cFirst === 'ragi' && (q.includes('ರಾಗಿ') || q.includes('கேழ்வரகு') || q.includes('రాగి'))) ||
      (cFirst === 'maize' && (q.includes('ಮೆಕ್ಕೆಜೋಳ') || q.includes('மக்காச்சோளம்') || q.includes('మొక్కజొన్న'))) ||
      q.includes(cTa) ||
      q.includes(cTe) ||
      (context?.currentCrops && context.currentCrops.some((ctxC) => ctxC.toLowerCase().includes(cFirst)));

    if (matchesCrop) {
      if (language === 'kn') {
        return (
          `🌾 **${crop.nameKannada} ಬೆಳೆಯ ಪ್ರಮುಖ ಸಲಹೆಗಳು**:\n` +
          `1. ಸೂಕ್ತ ಮಣ್ಣು: ${crop.idealSoilTypes.join(', ')}.\n` +
          `2. ಬೆಳೆಯ ಅವಧಿ: ${crop.durationDays}, ನೀರಿನ ಅಗತ್ಯ: ${crop.waterRequirement}.\n` +
          `3. ಗೊಬ್ಬರ: ಬಿತ್ತನೆಗೆ ಮುನ್ನ ಎಕರೆಗೆ 4 ಟನ್ ಚೆನ್ನಾಗಿ ಕಳಿತ ಕೊಟ್ಟಿಗೆ ಗೊಬ್ಬರ ಮಣ್ಣಿಗೆ ಸೇರಿಸಿ.\n` +
          `4. ನಿರೀಕ್ಷಿತ ಇಳುವರಿ: ಎಕರೆಗೆ ಸುಮಾರು ${crop.potentialYieldPerAcre}.\n\n` +
          `ಮುಂದಿನ ಹೆಜ್ಜೆ: ನಿಮ್ಮ ಜಮೀನಿಗೆ ಬೇಕಾದ ಬೀಜ ಪ್ರಮಾಣವನ್ನು ಲೆಕ್ಕಹಾಕಲು 'Crop Lifecycle' ಪುಟ ನೋಡಿ.\n\n` +
          `<speech_summary>${crop.nameKannada} ಬೆಳೆಗೆ ಎಕರೆಗೆ 4 ಟನ್ ಕೊಟ್ಟಿಗೆ ಗೊಬ್ಬರ ಹಾಕಿ, ಸರಿಯಾದ ತೇವಾಂಶ ಕಾಪಾಡಿ. ನಿಮ್ಮ ಜಮೀನಿಗೆ ಬೇಕಾದ ಬೀಜದ ಪ್ರಮಾಣ ಲೆಕ್ಕಹಾಕಬೇಕೆ?</speech_summary>`
        );
      }
      if (language === 'ta') {
        return (
          `🌾 **${crop.nameTamil} சாகுபடி வழிகாட்டல்**:\n` +
          `1. ஏற்ற மண்: ${crop.idealSoilTypes.join(', ')}.\n` +
          `2. பயிர் காலம்: ${crop.durationDays}, நீர் தேவை: ${crop.waterRequirement}.\n` +
          `3. உரம்: விதைப்பிற்கு முன் ஏக்கருக்கு 4 டன் தொழுவுரம் இட்டு உழவு செய்யவும்.\n` +
          `4. எதிர்பார்க்கப்படும் மகசூல்: ஏக்கருக்கு ${crop.potentialYieldPerAcre}.\n\n` +
          `அடுத்த நடவடிக்கை: விரிவான நாள்காட்டிக்கு 'Crop Lifecycle' பக்கத்தை பார்க்கவும்.\n\n` +
          `<speech_summary>${crop.nameTamil} சாகுபடிக்கு ஏக்கருக்கு 4 டன் தொழுவுரம் இட்டு நிலத்தை தயார் செய்யுங்கள். விதை அளவு மற்றும் நாற்று நடும் முறை பற்றி அறிய வேண்டுமா?</speech_summary>`
        );
      }
      if (language === 'te') {
        return (
          `🌾 **${crop.nameTelugu} పంట సాగు వివరాలు**:\n` +
          `1. అనుకూల నేలలు: ${crop.idealSoilTypes.join(', ')}.\n` +
          `2. పంట కాలం: ${crop.durationDays}, నీటి అవసరం: ${crop.waterRequirement}.\n` +
          `3. ఎరువుల యాజమాన్యం: విత్తే ముందు ఎకరాకు 4 టన్నుల పశువుల ఎరువు వేయండి.\n` +
          `4. దిగుబడి అంచనా: ఎకరాకు ${crop.potentialYieldPerAcre}.\n\n` +
          `తదుపరి చర్య: దశలవారీ పనుల కోసం 'Crop Lifecycle' పేజీని చూడండి.\n\n` +
          `<speech_summary>${crop.nameTelugu} సాగుకు ఎకరాకు 4 టన్నుల పశువుల ఎరువు వేసి నేలను సిద్ధం చేసుకోండి. విత్తన మోతాదు మరియు విత్తే విధానం గురించి తెలుసుకోవాలనుకుంటున్నారా?</speech_summary>`
        );
      }
      return (
        `🌾 **Farming Tips for ${crop.name}**:\n` +
        `1. Best Soil: ${crop.idealSoilTypes.join(', ')} with good drainage.\n` +
        `2. Growth Duration: ${crop.durationDays} with ${crop.waterRequirement} water requirement.\n` +
        `3. Soil Preparation: Incorporate 4 tonnes of well-rotted Farm Yard Manure (FYM) per acre before sowing.\n` +
        `4. Potential Yield: Around ${crop.potentialYieldPerAcre} under recommended care.\n\n` +
        `Next Action: Open the 'Crop Lifecycle' page to view the day-by-day task checklist.\n\n` +
        `<speech_summary>For ${crop.name}, apply 4 tonnes of Farm Yard Manure per acre during land preparation and maintain balanced soil moisture. Would you like to check the recommended seed rate?</speech_summary>`
      );
    }
  }

  // 4. Rain & Weather Protection
  if (q.includes('rain') || q.includes('water') || q.includes('flood') || q.includes('ಮಳೆ') || q.includes('மழை') || q.includes('వర్షం')) {
    if (language === 'kn') {
      return (
        `🌧️ **ಭಾರೀ ಮಳೆಯಿಂದ ಬೆಳೆ ಸಂರಕ್ಷಣೆ ಕ್ರಮಗಳು**:\n` +
        `1. ಹೊಲದಲ್ಲಿ ನೀರು ನಿಲ್ಲದಂತೆ ತಕ್ಷಣವೇ ಬಸಿಗಾಲುವೆ (drainage trenches) ತೆರೆದು ನೀರು ಹೊರಹಾಕಿ.\n` +
        `2. ಮಳೆ ಮುಂದುವರಿಯುವಾಗ ಯಾವುದೇ ರಾಸಾಯನಿಕ ಗೊಬ್ಬರ ಅಥವಾ ಕೀಟನಾಶಕ ಸಿಂಪಡಿಸಬೇಡಿ, ಅದು ನೀರಿನಲ್ಲಿ ವ್ಯರ್ಥವಾಗುತ್ತದೆ.\n` +
        `3. ಮಳೆ ನಿಂತ ತಕ್ಷಣ ಬೇರು ಕೊಳೆತ ತಡೆಯಲು ಎಕರೆಗೆ ಟ್ರೈಕೋಡರ್ಮಾ ಅಥವಾ ಬೇವಿನ ಹಿಂಡಿ ಮಣ್ಣಿಗೆ ಹಾಕಿ.\n` +
        `4. ಬೆಳೆ ಹಾನಿಯಾಗಿದ್ದರೆ 72 ಗಂಟೆಯೊಳಗೆ PMFBY ಬೆಳೆ ವಿಮೆ ಟೋಲ್ ಫ್ರೀ ಸಂಖ್ಯೆ 1800-180-1551 ಗೆ ದೂರು ದಾಖಲಿಸಿ.\n\n` +
        `ಮುಂದಿನ ಹೆಜ್ಜೆ: ನಿಮ್ಮ ಹೊಲದ ಬಸಿಗಾಲುವೆಗಳನ್ನು ಈಗಲೇ ಪರಿಶೀಲಿಸಿ ಸರಿಪಡಿಸಿ.\n\n` +
        `<speech_summary>ಮಳೆಯ ಸಮಯದಲ್ಲಿ ಹೊಲದಲ್ಲಿ ನೀರು ನಿಲ್ಲದಂತೆ ಬಸಿಗಾಲುವೆ ತೆರೆಯಿರಿ. ಮಳೆ ನಿಲ್ಲುವವರೆಗೆ ಯಾವುದೇ ಗೊಬ್ಬರ ಸಿಂಪಡಿಸಬೇಡಿ. ನಿಮ್ಮ ಜಮೀನಿನಲ್ಲಿ ನೀರು ನಿಂತಿದೆಯೇ?</speech_summary>`
      );
    }
    if (language === 'ta') {
      return (
        `🌧️ **மழைக்கால பயிர் பாதுகாப்பு நடவடிக்கைகள்**:\n` +
        `1. நிலத்தில் தண்ணீர் தேங்காமல் இருக்க வடிகால் வாய்க்கால்களை உடனடியாக அமையுங்கள்.\n` +
        `2. மழை பெய்யும் போது எந்த உரமும் பூச்சிக்கொல்லியும் தெளிக்க வேண்டாம்.\n` +
        `3. மழை நின்ற பிறகு வேரழுகல் நோயைத் தடுக்க ட்ரைக்கோடெர்மா அல்லது வேப்பம் புண்ணாக்கு இடவும்.\n` +
        `4. பயிர் சேதமடைந்தால் 72 மணி நேரத்திற்குள் PMFBY பயிர் காப்பீட்டுக்கு தகவல் தெரிவிக்கவும்.\n\n` +
        `அடுத்த நடவடிக்கை: உங்கள் வயலில் தண்ணீர் வடிவதை உறுதி செய்யுங்கள்.\n\n` +
        `<speech_summary>மழைக்காலத்தில் வயலில் தண்ணீர் தேங்காமல் வடிகால் அமையுங்கள். மழை நின்ற பிறகே உரம் இடவும். உங்கள் நிலத்தில் பயிர் மூழ்கியுள்ளதா?</speech_summary>`
      );
    }
    if (language === 'te') {
      return (
        `🌧️ **భారీ వర్షాల నుండి పంట రక్షణ మార్గాలు**:\n` +
        `1. పొలంలో నీరు నిల్వ ఉండకుండా మురుగు కాల్వలు తవ్వి నీటిని వెంటనే బయటకు పంపండి.\n` +
        `2. వర్షం పడుతున్నప్పుడు ఎరువులు లేదా రసాయన మందులు చల్లవద్దు.\n` +
        `3. వర్షం తగ్గాక వేరుకుళ్ళు తెగులు రాకుండా ట్రైకోడెర్మా లేదా వేపపిండి వేయండి.\n` +
        `4. పంట నష్టం జరిగితే 72 గంటల్లోపు PMFBY పంట బీమా హెల్ప్‌లైన్ 1800-180-1551 కు కాల్ చేయండి.\n\n` +
        `తదుపరి చర్య: పొలంలో నీటి పారుదల వసతిని తనిఖీ చేయండి.\n\n` +
        `<speech_summary>భారీ వర్షాల సమయంలో పొలంలో నీరు నిల్వ ఉండకుండా మురుగు కాల్వలు తవ్వండి. వర్షం తగ్గాక మాత్రమే ఎరువులు వేయండి. మీ పంట నీట మునిగిందా?</speech_summary>`
      );
    }
    return (
      `🌧️ **Rain & Drainage Protection Steps**:\n` +
      `1. Immediately clear field trenches to drain standing water away from crop root zones.\n` +
      `2. Do not apply top-dressing fertilizers or sprays while rain continues, as they leach away.\n` +
      `3. Once the rain stops, apply bio-control agent Trichoderma or neem cake to safeguard roots from fungal rot.\n` +
      `4. Report localized flood damage within 72 hours under PMFBY crop insurance helpline (1800-180-1551).\n\n` +
      `Next Action: Check all field outlets to ensure excess water is flowing out freely.\n\n` +
      `<speech_summary>Clear field trenches immediately to drain standing water away from roots and hold off on spraying until dry weather. Is there any standing water in your field?</speech_summary>`
    );
  }

  // 5. Fertilizer & Soil Quality Advice
  if (q.includes('fertilizer') || q.includes('soil') || q.includes('urea') || q.includes('dap') || q.includes('ಗೊಬ್ಬರ') || q.includes('ಮಣ್ಣು') || q.includes('உரம்') || q.includes('ఎరువు')) {
    if (language === 'kn') {
      return (
        `🌱 **ಮಣ್ಣಿನ ಫಲವತ್ತತೆ ಮತ್ತು ಗೊಬ್ಬರ ನಿರ್ವಹಣೆ**:\n` +
        `1. ರಸಗೊಬ್ಬರ ಕೊಡುವ ಮುನ್ನ ಕಡ್ಡಾಯವಾಗಿ ಮಣ್ಣು ಪರೀಕ್ಷೆ ಮಾಡಿಸಿ ಸಾರಜನಕ, ರಂಜಕ, ಪೊಟ್ಯಾಶ್ ತಿಳಿಯಿರಿ.\n` +
        `2. ಯಾವಾಗಲೂ ರಾಸಾಯನಿಕ ಗೊಬ್ಬರದ ಜೊತೆಗೆ ಎಕರೆಗೆ 2 ಟನ್ ಎರೆಹುಳು ಗೊಬ್ಬರ (vermicompost) ಬಳಸಿ.\n` +
        `3. ಯೂರಿಯಾವನ್ನು ಒಂದೇ ಬಾರಿಗೆ ಹಾಕದೆ 2 ಅಥವಾ 3 ಕಂತುಗಳಲ್ಲಿ ಬೆಳೆ ಬೇರಿನ ಹತ್ತಿರ ನೀಡಿ.\n` +
        `4. ಯಾವುದೇ ಗೊಬ್ಬರ ಬಳಸುವಾಗ ಕೈಗವಸು ಧರಿಸಿ, ಮಕ್ಕಳು ಮತ್ತು ಪ್ರಾಣಿಗಳಿಂದ ದೂರವಿಡಿ.\n\n` +
        `ಮುಂದಿನ ಹೆಜ್ಜೆ: ನಿಮ್ಮ ಹತ್ತಿರದ ರೈತ ಸಂಪರ್ಕ ಕೇಂದ್ರದಲ್ಲಿ ಮಣ್ಣಿನ ಮಾದರಿ ಪರೀಕ್ಷೆಗೆ ಕೊಡಿ.\n\n` +
        `<speech_summary>ರಸಗೊಬ್ಬರ ಕೊಡುವ ಮುನ್ನ ಮಣ್ಣು ಪರೀಕ್ಷೆ ಮಾಡಿಸಿ, ಯೂರಿಯಾವನ್ನು 2-3 ಕಂತುಗಳಲ್ಲಿ ನೀಡಿ. ನಿಮ್ಮ ಜಮೀನಿನ ಮಣ್ಣು ಪರೀಕ್ಷೆ ಮಾಡಿಸಿದ್ದೀರಾ?</speech_summary>`
      );
    }
    if (language === 'ta') {
      return (
        `🌱 **மண் வளம் மற்றும் உர மேலாண்மை**:\n` +
        `1. உரம் இடுவதற்கு முன் மண் பரிசோதனை செய்து சத்துக்களின் அளவை அறியவும்.\n` +
        `2. ரசாயன உரத்துடன் சேர்த்து ஏக்கருக்கு 2 டன் மண்புழு உரம் இடுவது மண்ணை வளப்படுத்தும்.\n` +
        `3. யூரியாவை ஒரே முறையில் இடாமல் 2-3 தவணைகளாக பிரித்து இடவும்.\n` +
        `4. உரங்களை கையாளும் போது கையுறை அணிந்து எச்சரிக்கையுடன் செயல்படவும்.\n\n` +
        `அடுத்த நடவடிக்கை: உங்கள் கிராம வேளாண் உதவி அலுவலரை அணுகி மண் அட்டை பெறவும்.\n\n` +
        `<speech_summary>உரம் இடுவதற்கு முன் மண் பரிசோதனை செய்யுங்கள். யூரியாவை 2-3 தவணைகளாக பிரித்து இடவும். நீங்கள் மண் அட்டை பெற்றுள்ளீர்களா?</speech_summary>`
      );
    }
    if (language === 'te') {
      return (
        `🌱 **నేల బలం మరియు ఎరువుల సమగ్ర నిర్వహణ**:\n` +
        `1. ఎరువులు వేసే ముందు నేల పరీక్ష చేయించి పోషకాల లోపాన్ని తెలుసుకోండి.\n` +
        `2. రసాయన ఎరువులతో పాటు ఎకరాకు 2 టన్నుల వర్మీకంపోస్ట్ వాడటం నేలకు చాలా మంచిది.\n` +
        `3. యూరియాను ఒకేసారి వేయకుండా 2-3 దఫాలుగా విభజించి పంటకు అందించండి.\n` +
        `4. ఎరువులు చల్లేటప్పుడు తప్పనిసరిగా చేతులకు గ్లౌజులు ధరించండి.\n\n` +
        `తదుపరి చర్య: సమీప రైతు సేవా కేంద్రంలో మీ నేల నమూనాను పరీక్షకు ఇవ్వండి.\n\n` +
        `<speech_summary>ఎరువులు వేసే ముందు నేల పరీక్ష చేయించండి, యూరియాను 2-3 దఫాలుగా విభజించి వేయండి. మీరు ఇంతకు ముందు నేల పరీక్ష చేయించారా?</speech_summary>`
      );
    }
    return (
      `🌱 **Soil Nutrition & Fertilizer Guidelines**:\n` +
      `1. Soil Test First: Base all nutrient doses on a certified Soil Health Card rather than guessing.\n` +
      `2. Balance Organics: Combine chemical fertilizers with 2 tonnes of vermicompost or FYM per acre.\n` +
      `3. Split Urea: Never broadcast all nitrogen at once; apply in 2 to 3 split doses at active tillering/growth.\n` +
      `4. Safe Application: Wear protective gloves and apply fertilizers into moist soil, not bone-dry ground.\n\n` +
      `Next Action: Collect a soil sample from 5 spots in your field and submit it to your local KVK.\n\n` +
      `<speech_summary>Base all fertilizers on a soil test and split urea into 2 to 3 doses rather than broadcasting all at once. Do you have a recent Soil Health Card?</speech_summary>`
    );
  }

  // 6. Generic Agricultural Query Match from FAQs
  for (const faq of AGRICULTURAL_FAQS) {
    for (const kw of faq.keywords) {
      if (q.includes(kw.toLowerCase())) {
        const ans =
          language === 'kn' ? faq.answerKn :
          language === 'ta' ? faq.answerTa :
          language === 'te' ? faq.answerTe :
          faq.answerEn;
        return ans;
      }
    }
  }

  // 7. Helpful Farming Assistant default
  if (language === 'kn') {
    return (
      `ನಮಸ್ಕಾರ, ನಾನು ನಿಮ್ಮ ಕೃಷಿ ಸಾಥಿ ಕೃಷಿ ಸಂಗಾತಿ.\n\n` +
      `1. ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಇನ್ನಷ್ಟು ಸರಳವಾಗಿ ತಿಳಿಸಿ, ಉದಾಹರಣೆಗೆ: ಬೆಳೆ ಹೆಸರು, ಮಣ್ಣಿನ ಬಣ್ಣ, ಅಥವಾ ರೋಗದ ಲಕ್ಷಣ.\n` +
      `2. ಭತ್ತ, ರಾಗಿ, ಮೆಕ್ಕೆಜೋಳ, ಹತ್ತಿ, ಟೊಮ್ಯಾಟೊ ಕೃಷಿ ನಿರ್ವಹಣೆಗೆ ನಾನು ಸಂಪೂರ್ಣ ನೆರವು ನೀಡಬಲ್ಲೆ.\n` +
      `3. ಕೀಟ ಬಾಧೆಗೆ ಮುಂಚಿತವಾಗಿ ಬೇವಿನ ಎಣ್ಣೆ ಸಿಂಪಡಿಸಿ ಜಮೀನಿನ ಸ್ವಚ್ಛತೆ ಕಾಪಾಡಿ.\n` +
      `4. ತಕ್ಷಣದ ಕೃಷಿ ತಜ್ಞರ ಸಲಹೆಗಾಗಿ ಉಚಿತ ಕಿಸಾನ್ ಕಾಲ್ ಸೆಂಟರ್ ಸಂಖ್ಯೆ 1800-180-1551 ಗೆ ಕರೆ ಮಾಡಿ.\n\n` +
      `ಮುಂದಿನ ಹೆಜ್ಜೆ: ನಿಮ್ಮ ಹೊಲದ ಮಣ್ಣು ಮತ್ತು ಪ್ರಸ್ತುತ ಬೆಳೆಯ ವಿವರ ತಿಳಿಸಿ.\n\n` +
      `<speech_summary>ನಮಸ್ಕಾರ, ನಾನು ನಿಮ್ಮ ಕೃಷಿ ಸಾಥಿ. ನಿಮ್ಮ ಬೆಳೆ ಹೆಸರು, ಮಣ್ಣಿನ ವಿಧ ಅಥವಾ ರೋಗದ ಲಕ್ಷಣ ತಿಳಿಸಿದರೆ ಸೂಕ್ತ ಸಲಹೆ ನೀಡಬಲ್ಲೆ. ನಿಮ್ಮ ಹೊಲದಲ್ಲಿ ಈಗ ಯಾವ ಬೆಳೆ ಬೆಳೆಯುತ್ತಿದ್ದೀರಿ?</speech_summary>`
    );
  }
  if (language === 'ta') {
    return (
      `வணக்கம், நான் உங்கள் கிருஷி சாதி விவசாய வழிகாட்டி.\n\n` +
      `1. உங்கள் கேள்வியை மேலும் தெளிவாக கூறுங்கள் (எ.கா: பயிர் பெயர், மண் வகை அல்லது பூச்சியின் அறிகுறி).\n` +
      `2. நெல், கேழ்வரகு, மக்காச்சோளம், பருத்தி, தக்காளி பயிர்களுக்கு முழு வழிகாட்டல் உண்டு.\n` +
      `3. பூச்சி தாக்கினால் முதலில் வேப்பெண்ணெய் கரைசல் தெளிக்கவும்.\n` +
      `4. அரசு விவசாய உதவிக்கு கிசான் கால் சென்டர் 1800-180-1551 அழைக்கவும்.\n\n` +
      `அடுத்த நடவடிக்கை: உங்கள் பயிர் மற்றும் மண் வகையை இங்கே பதிவிடவும்.\n\n` +
      `<speech_summary>வணக்கம், நான் உங்கள் கிருஷி சாதி. உங்கள் பயிர் பெயர், மண் வகை அல்லது பூச்சியின் அறிகுறியை கூறினால் நல்ல வழிகாட்டல் தருகிறேன். உங்கள் நிலத்தில் இப்போது என்ன பயிர் உள்ளது?</speech_summary>`
    );
  }
  if (language === 'te') {
    return (
      `నమస్కారం, నేను మీ కృషి సాథి వ్యవసాయ సహచరుడిని.\n\n` +
      `1. మీ ప్రశ్నను సులభంగా వివరించండి (ఉదాహరణకు: పంట పేరు, నేల రకం లేదా తెగులు లక్షణాలు).\n` +
      `2. వరి, రాగి, మొక్కజొన్న, పత్తి, టమాటా పంటల సాగుకు నేను పూర్తి సలహాలు ఇస్తాను.\n` +
      `3. పురుగుల నివారణకు మొదట వేప నూనె పిచికారీ చేయడం మంచిది.\n` +
      `4. ఉచిత ప్రభుత్వ వ్యవసాయ సహాయం కోసం కిసాన్ కాల్ సెంటర్ 1800-180-1551 కు కాల్ చేయండి.\n\n` +
      `తదుపరి చర్య: మీ పొలం నేల మరియు పంట వివరాలను తెలియజేయండి.\n\n` +
      `<speech_summary>నమస్కారం, నేను మీ కృషి సాథి. మీ పంట పేరు, నేల రకం లేదా తెగులు లక్షణాలు చెబితే సరైన సలహా ఇస్తాను. మీ పొలంలో ప్రస్తుతం ఏ పంట సాగు చేస్తున్నారు?</speech_summary>`
    );
  }
  return (
    `Hello! I am Krushi Sathi, your agricultural companion.\n\n` +
    `1. Please tell me a bit more about your field, such as your crop name, soil type, or symptoms on leaves.\n` +
    `2. I can assist with Paddy, Ragi, Maize, Cotton, Tomato, pest control, and fertilizers.\n` +
    `3. Always start pest prevention with 5ml neem oil per litre of water and clean field bunds.\n` +
    `4. For government farmer support, you can also dial the Kisan Call Centre at 1800-180-1551.\n\n` +
    `Next Action: Type your crop name or question, and I will guide you step by step.\n\n` +
    `<speech_summary>Hello! I am Krushi Sathi, your agricultural companion. Tell me your crop name, soil type, or leaf symptoms so I can guide you. What crop are you currently growing in your field?</speech_summary>`
  );
}

function getSuggestedQuestions(language: string): string[] {
  if (language === 'kn') {
    return [
      'ನನ್ನ ಮಣ್ಣಿಗೆ ಯಾವ ಬೆಳೆ ಉತ್ತಮ?',
      'ಮಳೆಯಿಂದ ನನ್ನ ಬೆಳೆಗಳನ್ನು ಹೇಗೆ ರಕ್ಷಿಸುವುದು?',
      'ಟೊಮ್ಯಾಟೊ ಬೆಳೆಗೆ ಯಾವ ಗೊಬ್ಬರ ಬಳಸಬೇಕು?',
      'ಭತ್ತದ ಬೆಳೆ ಕೀಟ ನಿರ್ವಹಣೆ ಹೇಗೆ?',
      'ಕಿಸಾನ್ ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ ಮಾಹಿತಿ ನೀಡಿ',
    ];
  }
  if (language === 'ta') {
    return [
      'என் மண்ணிற்கு எந்த பயிர் சிறந்தது?',
      'மழையிலிருந்து என் பயிர்களை எப்படி பாதுகாப்பது?',
      'தக்காளிக்கு என்ன உரம் பயன்படுத்த வேண்டும்?',
      'நெல் பயிர் பூச்சி மேலாண்மை எப்படி?',
      'கிசான் கிரெடிட் கார்டு தகவல்',
    ];
  }
  if (language === 'te') {
    return [
      'నా నేలకు ఏ పంట మంచిది?',
      'వర్షం నుండి నా పంటలను ఎలా కాపాడుకోవాలి?',
      'టమాటా పంటకు ఏ ఎరువు వాడాలి?',
      'వరి పంట తెగుళ్ళ నివారణ ఎలా?',
      'కిసాన్ క్రెడిట్ కార్డు సమాచారం',
    ];
  }
  return [
    'Which crop is best for my soil?',
    'How do I protect my crops from rain?',
    'What fertilizer should I use for tomato?',
    'How to prevent pest attacks on paddy?',
    'How do I apply for PM-Kisan scheme?',
  ];
}