/**
 * Language Resolver & Script Detector for Raitha Mitra
 * Detects target language based on:
 * 1. Explicit conversational switch requests ("switch to kannada", "speak in tamil", "తెలుగులో చెప్పండి")
 * 2. Indic Unicode script detection (Kannada, Tamil, Telugu)
 * 3. Client UI requested language (selected language tab)
 */

export type SupportedLanguage = 'en' | 'kn' | 'ta' | 'te';

export const LANGUAGE_DISPLAY_NAMES: Record<SupportedLanguage, string> = {
  en: 'English',
  kn: 'Kannada (ಕನ್ನಡ)',
  ta: 'Tamil (தமிழ்)',
  te: 'Telugu (తెలుగు)',
};

export function isValidScriptForLanguage(text: string, targetLanguage: string): boolean {
  if (!text || text.trim() === '') return false;

  const knCount = (text.match(/[\u0C80-\u0CFF]/g) || []).length;
  const taCount = (text.match(/[\u0B80-\u0BFF]/g) || []).length;
  const teCount = (text.match(/[\u0C00-\u0C7F]/g) || []).length;
  const latinCount = (text.match(/[a-zA-Z]/g) || []).length;

  if (targetLanguage === 'kn') {
    return knCount >= 4 && knCount > taCount && knCount > teCount;
  }
  if (targetLanguage === 'ta') {
    return taCount >= 4 && taCount > knCount && taCount > teCount;
  }
  if (targetLanguage === 'te') {
    return teCount >= 4 && teCount > knCount && teCount > taCount;
  }
  if (targetLanguage === 'en') {
    const indicTotal = knCount + taCount + teCount;
    return latinCount >= 4 && latinCount > indicTotal;
  }
  return true;
}

export function cleanTransliteratedGreeting(text: string, targetLanguage: string): string {
  if (!text) return text;
  let cleaned = text;

  // Clean corrupted transliterations like "ನaste", "ನnamaste", "ನnamaskara"
  if (targetLanguage === 'kn') {
    cleaned = cleaned.replace(/^(\s*[*_#\s]*)(?:ನaste|ನnamaste|ನnamaskara|ನamaste|ನamaskara)\b/i, '$1ನಮಸ್ಕಾರ');
  } else if (targetLanguage === 'ta') {
    cleaned = cleaned.replace(/^(\s*[*_#\s]*)(?:வvanakkam|வanakkam|வnamaste)\b/i, '$1வணக்கம்');
  } else if (targetLanguage === 'te') {
    cleaned = cleaned.replace(/^(\s*[*_#\s]*)(?:నnamaste|నamaste|నnamaskaram)\b/i, '$1నమస్కారం');
  } else if (targetLanguage === 'en') {
    cleaned = cleaned.replace(/^(\s*[*_#\s]*)(?:ನಮಸ್ಕಾರ|வணக்கம்|నమస్కారం)\b/i, '$1Hello');
  }

  return cleaned;
}

export function resolveEffectiveLanguage(
  message?: string,
  requestedLang?: string,
  userProfileLang?: string
): SupportedLanguage {
  const text = (message || '').trim();

  // 1. Explicit conversational switch intent in message
  if (text) {
    const lower = text.toLowerCase();

    // Kannada intent: check both Latin script phrases and native script intent
    if (
      /\b(kannada|kannadadalli|kannada dalli|in kannada|to kannada|with kannada|speak in kannada|tell in kannada|reply in kannada|switch to kannada)\b/i.test(lower) ||
      text.includes('ಕನ್ನಡ') ||
      text.includes('ಕನ್ನಡದಲ್ಲಿ') ||
      text.includes('ಕನ್ನಡಕ್ಕೆ')
    ) {
      return 'kn';
    }

    // Tamil intent: check both Latin script phrases and native script intent
    if (
      /\b(tamil|tamilil|thamizh|in tamil|to tamil|with tamil|speak in tamil|tell in tamil|reply in tamil|switch to tamil)\b/i.test(lower) ||
      text.includes('தமிழ்') ||
      text.includes('தமிழில்') ||
      text.includes('தமிழுக்கு')
    ) {
      return 'ta';
    }

    // Telugu intent: check both Latin script phrases and native script intent
    if (
      /\b(telugu|telugulo|in telugu|to telugu|with telugu|speak in telugu|tell in telugu|reply in telugu|switch to telugu)\b/i.test(lower) ||
      text.includes('తెలుగు') ||
      text.includes('తెలుగులో') ||
      text.includes('తెలుగుకు')
    ) {
      return 'te';
    }

    // English intent: must be an explicit instruction to switch to English
    if (
      /\b(switch to english|speak in english|tell in english|reply in english|in english|talk in english|change to english|change language to english)\b/i.test(lower) ||
      /^(english|english please)\b/i.test(lower) ||
      text.includes('ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಹೇಳಿ') ||
      text.includes('ஆங்கிலத்தில் பேசுங்கள்') ||
      text.includes('ఇంగ్లీష్‌లో చెప్పండి')
    ) {
      return 'en';
    }

    // 2. Indic Unicode Script Detection (if native characters are typed)
    // Kannada Unicode Range: \u0C80-\u0CFF
    if (/[\u0C80-\u0CFF]/.test(text)) {
      return 'kn';
    }

    // Tamil Unicode Range: \u0B80-\u0BFF
    if (/[\u0B80-\u0BFF]/.test(text)) {
      return 'ta';
    }

    // Telugu Unicode Range: \u0C00-\u0C7F
    if (/[\u0C00-\u0C7F]/.test(text)) {
      return 'te';
    }
  }

  // 3. Honor explicitly requested language from UI tab / API call
  if (requestedLang && ['en', 'kn', 'ta', 'te'].includes(requestedLang)) {
    return requestedLang as SupportedLanguage;
  }

  // 4. Fallback to user profile preferred language
  if (userProfileLang && ['en', 'kn', 'ta', 'te'].includes(userProfileLang)) {
    return userProfileLang as SupportedLanguage;
  }

  return 'en';
}
