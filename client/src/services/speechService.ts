/**
 * Krushi Sathi Speech Service
 * Provides Speech Recognition (STT) and Natural Regional Text-to-Speech (TTS)
 * for Kannada (kn-IN), English (en-IN), Tamil (ta-IN), and Telugu (te-IN).
 * Supports Gemini 3.8 Flash TTS with seamless fallback to browser SpeechSynthesis.
 */

import { api } from './api';

export type SupportedLanguageCode = 'en' | 'kn' | 'ta' | 'te';

export type TtsProviderChoice = 'auto' | 'gemini-tts' | 'edge-neural' | 'browser';
export type ActiveTtsProvider = 'gemini-tts' | 'edge-neural' | 'browser';

export interface LanguageLocaleConfig {
  code: SupportedLanguageCode;
  locale: string;
  nativeName: string;
  voiceKeywords: string[];
}

export const LANGUAGE_LOCALE_MAP: Record<SupportedLanguageCode, LanguageLocaleConfig> = {
  kn: {
    code: 'kn',
    locale: 'kn-IN',
    nativeName: 'ಕನ್ನಡ',
    voiceKeywords: ['kannada', 'kn-in', 'kn_in', 'sapna', 'gagan'],
  },
  en: {
    code: 'en',
    locale: 'en-IN',
    nativeName: 'English',
    voiceKeywords: ['en-in', 'india', 'indian', 'neerja', 'prabhat', 'en-us', 'en_us', 'english'],
  },
  ta: {
    code: 'ta',
    locale: 'ta-IN',
    nativeName: 'தமிழ்',
    voiceKeywords: ['tamil', 'ta-in', 'ta_in', 'pallavi', 'valluvar'],
  },
  te: {
    code: 'te',
    locale: 'te-IN',
    nativeName: 'తెలుగు',
    voiceKeywords: ['telugu', 'te-in', 'te_in', 'shruti', 'mohan'],
  },
};

export interface SpeechCapabilities {
  recognitionSupported: boolean;
  synthesisSupported: boolean;
  voicesByLanguage: Record<SupportedLanguageCode, SpeechSynthesisVoice | null>;
  voiceCount: number;
  cloudTtsSupported: boolean;
}

export interface RecognitionCallbacks {
  onStart?: () => void;
  onInterimResult?: (transcript: string) => void;
  onFinalResult?: (transcript: string) => void;
  onError?: (error: { code: string; message: string; isPermissionDenied: boolean }) => void;
  onEnd?: () => void;
}

export interface SpeakOptions {
  gender?: 'female' | 'male';
  provider?: TtsProviderChoice;
  preferCloud?: boolean;
  speed?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
  onInterrupted?: () => void;
  onProviderSelected?: (provider: ActiveTtsProvider, voiceName?: string) => void;
}

class SpeechService {
  private activeRecognition: any = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private activeAudio: HTMLAudioElement | null = null;
  private currentProvider: ActiveTtsProvider | null = null;
  private preferredGender: 'female' | 'male' = 'female';
  private preferredProvider: TtsProviderChoice = 'auto';
  private preferCloud = true;
  private cachedVoices: SpeechSynthesisVoice[] = [];
  private voicesLoaded = false;
  private playbackToken = 0;
  private isCancelled = false;
  private audioBufferCache = new Map<string, { audio: string; mimeType: string; provider: ActiveTtsProvider; voice?: string }>();

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.initVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        this.initVoices();
      };
    }
  }

  public setGender(gender: 'female' | 'male'): void {
    this.preferredGender = gender;
  }

  public getGender(): 'female' | 'male' {
    return this.preferredGender;
  }

  public setProvider(provider: TtsProviderChoice): void {
    this.preferredProvider = provider;
  }

  public getProvider(): TtsProviderChoice {
    return this.preferredProvider;
  }

  public setPreferCloud(prefer: boolean): void {
    this.preferCloud = prefer;
  }

  public isCloudPreferred(): boolean {
    return this.preferCloud;
  }

  public getCurrentProvider(): ActiveTtsProvider | null {
    return this.currentProvider;
  }

  private initVoices(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      this.cachedVoices = voices;
      this.voicesLoaded = true;
    }
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (this.cachedVoices.length === 0 && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.cachedVoices = window.speechSynthesis.getVoices();
    }
    return this.cachedVoices;
  }

  public isRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(window.SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  public isSynthesisSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
  }

  /**
   * Find the best available SpeechSynthesisVoice for a given language.
   * Searches by exact locale, prefix match, and voice name keywords.
   */
  public findBestVoice(langCode: SupportedLanguageCode): SpeechSynthesisVoice | null {
    const voices = this.getVoices();
    if (!voices || voices.length === 0) return null;

    const config = LANGUAGE_LOCALE_MAP[langCode] || LANGUAGE_LOCALE_MAP.en;
    const targetLocale = config.locale.toLowerCase();
    const targetPrefix = config.code.toLowerCase();

    // 1. Exact locale match (e.g. kn-IN)
    const exactMatch = voices.find(
      (v) => v.lang.toLowerCase() === targetLocale || v.lang.toLowerCase().replace('_', '-') === targetLocale
    );
    if (exactMatch) return exactMatch;

    // 2. Prefix match (e.g. starts with 'kn')
    const prefixMatch = voices.find(
      (v) => v.lang.toLowerCase().startsWith(targetPrefix)
    );
    if (prefixMatch) return prefixMatch;

    // 3. Name keyword search
    for (const keyword of config.voiceKeywords) {
      const nameMatch = voices.find((v) => v.name.toLowerCase().includes(keyword.toLowerCase()));
      if (nameMatch) return nameMatch;
    }

    // 4. For English fallback, try any English voice
    if (langCode === 'en') {
      const anyEn = voices.find((v) => v.lang.toLowerCase().startsWith('en'));
      if (anyEn) return anyEn;
    }

    return null;
  }

  /**
   * Diagnostic capability check across all 4 languages.
   */
  public getCapabilities(): SpeechCapabilities {
    const recognitionSupported = this.isRecognitionSupported();
    const synthesisSupported = this.isSynthesisSupported();
    const voices = this.getVoices();

    const voicesByLanguage: Record<SupportedLanguageCode, SpeechSynthesisVoice | null> = {
      en: this.findBestVoice('en'),
      kn: this.findBestVoice('kn'),
      ta: this.findBestVoice('ta'),
      te: this.findBestVoice('te'),
    };

    return {
      recognitionSupported,
      synthesisSupported,
      voicesByLanguage,
      voiceCount: voices.length,
      cloudTtsSupported: true,
    };
  }

  /**
   * Cleans raw text for natural speech synthesis:
   * Extracts speakable summary if present, and strips markdown formatting,
   * symbols, emojis, and citation tags without altering native Indic scripts.
   */
  public cleanTextForSpeech(text: string): string {
    if (!text) return '';

    let contentToSpeak = text;
    // Extract concise <speech_summary> if present
    const summaryMatch = text.match(/<speech_summary>([\s\S]*?)<\/speech_summary>/i);
    if (summaryMatch && summaryMatch[1]?.trim()) {
      contentToSpeak = summaryMatch[1].trim();
    } else {
      // If no speech summary tag, remove any stray speech_summary tags if left
      contentToSpeak = text.replace(/<\/?speech_summary>/gi, '');
    }

    return contentToSpeak
      // Remove system tags and brackets like [ICAR Crop Reference - Paddy]
      .replace(/\[(?:ICAR|KVK|Local Demo|Google Gemini)[^\]]*\]:?/gi, '')
      // Remove markdown headings
      .replace(/^#{1,6}\s+/gm, '')
      // Remove bold and italics
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/__([^_]+)__/g, '$1')
      .replace(/_([^_]+)_/g, '$1')
      // Remove markdown bullet points
      .replace(/^[-*•]\s+/gm, '')
      // Remove markdown links [text](url) -> text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove URLs
      .replace(/https?:\/\/\S+/g, '')
      // Remove emojis to prevent voice engines reading raw Unicode descriptions
      .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
      // Remove extraneous spaces and dashes
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Start Speech-to-Text session
   */
  public startRecognition(
    langCode: SupportedLanguageCode,
    callbacks: RecognitionCallbacks
  ): boolean {
    if (!this.isRecognitionSupported()) {
      callbacks.onError?.({
        code: 'not_supported',
        message: 'Speech recognition is not supported in this browser. Please use Chrome or Edge.',
        isPermissionDenied: false,
      });
      return false;
    }

    // Cancel any active recognition first
    this.stopRecognition();

    // Cancel any ongoing speech synthesis to prevent feedback loop
    this.stopSpeaking();

    const SpeechRecognitionClass =
      window.SpeechRecognition || (window as any).webkitSpeechRecognition;

    const recognition = new SpeechRecognitionClass();
    const config = LANGUAGE_LOCALE_MAP[langCode] || LANGUAGE_LOCALE_MAP.en;

    recognition.lang = config.locale;
    recognition.continuous = false; // Turn-based conversation
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    let finalTranscript = '';
    let hasEmittedFinal = false;

    recognition.onstart = () => {
      callbacks.onStart?.();
    };

    recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          finalTranscript += item[0].transcript;
        } else {
          interim += item[0].transcript;
        }
      }

      if (interim) {
        callbacks.onInterimResult?.(interim);
      }

      if (finalTranscript && !hasEmittedFinal) {
        hasEmittedFinal = true;
        callbacks.onFinalResult?.(finalTranscript.trim());
      }
    };

    recognition.onerror = (event: any) => {
      const isPermissionDenied = event.error === 'not-allowed' || event.error === 'service-not-allowed';
      let message = 'Could not capture speech.';

      switch (event.error) {
        case 'not-allowed':
          message = 'Microphone permission was denied. Please allow microphone access in your browser settings.';
          break;
        case 'no-speech':
          message = 'No speech was detected. Please tap the microphone and speak clearly.';
          break;
        case 'network':
          message = 'Network error occurred during speech recognition. Please check your connection.';
          break;
        case 'audio-capture':
          message = 'Microphone hardware was not found or is busy.';
          break;
        default:
          message = `Speech recognition error: ${event.error}`;
      }

      callbacks.onError?.({
        code: event.error,
        message,
        isPermissionDenied,
      });
    };

    recognition.onend = () => {
      this.activeRecognition = null;
      callbacks.onEnd?.();
    };

    try {
      this.activeRecognition = recognition;
      recognition.start();
      return true;
    } catch (err: any) {
      callbacks.onError?.({
        code: 'start_failed',
        message: err.message || 'Failed to start microphone.',
        isPermissionDenied: false,
      });
      return false;
    }
  }

  /**
   * Stop Speech-to-Text session
   */
  public stopRecognition(): void {
    if (this.activeRecognition) {
      try {
        this.activeRecognition.abort();
      } catch {
        // Best-effort abort
      }
      this.activeRecognition = null;
    }
  }

  /**
   * Play base64 WAV/MP3 audio buffer returned from Gemini Cloud TTS or Edge Regional Neural TTS
   */
  public playAudioBase64(
    base64Data: string,
    mimeType: string,
    provider: ActiveTtsProvider,
    token: number,
    callbacks?: {
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (err: any) => void;
      onInterrupted?: () => void;
    }
  ): boolean {
    if (typeof window === 'undefined') return false;

    // Check token before playing
    if (this.playbackToken !== token || this.isCancelled) {
      return false;
    }

    try {
      const audioUrl = `data:${mimeType || 'audio/mp3'};base64,${base64Data}`;
      const audio = new Audio(audioUrl);
      this.activeAudio = audio;
      this.currentProvider = provider;

      let isFinished = false;

      audio.onplay = () => {
        if (this.playbackToken !== token || this.isCancelled) return;
        callbacks?.onStart?.();
      };

      audio.onended = () => {
        if (this.playbackToken !== token || this.isCancelled) return;
        if (!isFinished) {
          isFinished = true;
          this.activeAudio = null;
          this.currentProvider = null;
          callbacks?.onEnd?.();
        }
      };

      audio.onerror = (e) => {
        // If playback was cancelled or superseded by a newer token, do NOT fire error / fallback
        if (this.playbackToken !== token || this.isCancelled) return;
        if (!isFinished) {
          isFinished = true;
          this.activeAudio = null;
          this.currentProvider = null;
          callbacks?.onError?.(e);
        }
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          if (this.playbackToken !== token || this.isCancelled) return;
          if (!isFinished) {
            isFinished = true;
            this.activeAudio = null;
            this.currentProvider = null;
            if (err.name === 'AbortError') {
              callbacks?.onInterrupted?.();
            } else {
              callbacks?.onError?.(err);
            }
          }
        });
      }

      return true;
    } catch (err) {
      this.activeAudio = null;
      this.currentProvider = null;
      if (this.playbackToken === token && !this.isCancelled) {
        callbacks?.onError?.(err);
      }
      return false;
    }
  }

  /**
   * Browser SpeechSynthesis fallback implementation
   */
  public speakBrowser(
    text: string,
    langCode: SupportedLanguageCode,
    options?: SpeakOptions,
    token?: number
  ): boolean {
    if (!this.isSynthesisSupported()) {
      options?.onError?.(new Error('Speech synthesis is not supported in this browser.'));
      return false;
    }

    const currentToken = token !== undefined ? token : ++this.playbackToken;
    this.isCancelled = false;

    // Detach and cancel any current browser utterance or audio
    this.stopAudioElementOnly();

    if (this.playbackToken !== currentToken || this.isCancelled) {
      return false;
    }

    const cleanText = this.cleanTextForSpeech(text);
    if (!cleanText) {
      options?.onEnd?.();
      return false;
    }

    const config = LANGUAGE_LOCALE_MAP[langCode] || LANGUAGE_LOCALE_MAP.en;
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = config.locale;
    utterance.rate = options?.speed || (langCode === 'en' ? 1.0 : 0.95);
    utterance.pitch = 1.0;

    const matchedVoice = this.findBestVoice(langCode);
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    this.currentProvider = 'browser';
    options?.onProviderSelected?.('browser', matchedVoice?.name);

    let isFinished = false;

    utterance.onstart = () => {
      if (this.playbackToken !== currentToken || this.isCancelled) return;
      options?.onStart?.();
    };

    utterance.onend = () => {
      if (this.playbackToken !== currentToken || this.isCancelled) return;
      if (!isFinished) {
        isFinished = true;
        this.currentUtterance = null;
        this.currentProvider = null;
        options?.onEnd?.();
      }
    };

    utterance.onerror = (event: any) => {
      if (this.playbackToken !== currentToken || this.isCancelled) return;
      if (!isFinished) {
        isFinished = true;
        this.currentUtterance = null;
        this.currentProvider = null;
        if (event.error === 'interrupted' || event.error === 'canceled') {
          options?.onInterrupted?.();
        } else {
          options?.onError?.(event);
        }
      }
    };

    this.currentUtterance = utterance;

    try {
      window.speechSynthesis.speak(utterance);
      return true;
    } catch (err: any) {
      this.currentUtterance = null;
      this.currentProvider = null;
      options?.onError?.(err);
      return false;
    }
  }

  /**
   * Primary Natural Regional TTS Engine:
   * First attempts natural Indic speech using Gemini 3.8 Flash TTS or Edge Regional Neural TTS.
   * Seamlessly falls back to browser voice if offline or unavailable.
   */
  public async speakNatural(
    text: string,
    langCode: SupportedLanguageCode,
    options?: SpeakOptions
  ): Promise<boolean> {
    // Cleanly cancel previous speech first
    this.stopSpeaking();

    // Assign a new token for THIS playback session
    const token = ++this.playbackToken;
    this.isCancelled = false;

    const cleanText = this.cleanTextForSpeech(text);
    if (!cleanText) {
      options?.onEnd?.();
      return false;
    }

    const gender = options?.gender || this.preferredGender;
    const providerChoice = options?.provider || this.preferredProvider || 'auto';
    const speed = options?.speed || 1.0;

    // If user explicitly chose browser only
    if (providerChoice === 'browser') {
      return this.speakBrowser(cleanText, langCode, options, token);
    }

    const hasAuthToken =
      typeof localStorage !== 'undefined' && Boolean(localStorage.getItem('krishi_sathi_token'));
    const shouldTryBackend = options?.preferCloud !== false && this.preferCloud && hasAuthToken;

    if (shouldTryBackend) {
      const cacheKey = `${langCode}_${gender}_${providerChoice}_${cleanText}`;
      const cachedItem = this.audioBufferCache.get(cacheKey);

      if (cachedItem && (cachedItem.provider === 'gemini-tts' || cachedItem.provider === 'edge-neural')) {
        console.log(`[Voice Perf] Instant client audio cache hit (0ms)`);
        return this.playAudioBase64(cachedItem.audio, cachedItem.mimeType, cachedItem.provider, token, {
          onStart: () => {
            if (this.playbackToken !== token || this.isCancelled) return;
            this.currentProvider = cachedItem.provider;
            options?.onProviderSelected?.(cachedItem.provider, cachedItem.voice);
            options?.onStart?.();
          },
          onEnd: () => {
            if (this.playbackToken !== token || this.isCancelled) return;
            this.currentProvider = null;
            this.activeAudio = null;
            options?.onEnd?.();
          },
          onInterrupted: () => {
            this.currentProvider = null;
            this.activeAudio = null;
            options?.onInterrupted?.();
          },
          onError: (err) => {
            if (this.playbackToken !== token || this.isCancelled) return;
            this.speakBrowser(cleanText, langCode, options, token);
          },
        });
      }

      try {
        const t0 = performance.now();
        const res = await api.chat.synthesizeSpeech(cleanText, langCode, gender, providerChoice, speed);
        const t1 = performance.now();

        // Check if token changed while waiting for network TTS synthesis
        if (this.playbackToken !== token || this.isCancelled) {
          console.log(`[Voice Perf] Speech token superseded or cancelled (${token} vs ${this.playbackToken}). Discarding TTS.`);
          return false;
        }

        if (res && res.audio && (res.provider === 'gemini-tts' || res.provider === 'edge-neural')) {
          console.log(`[Voice Perf] TTS synthesized via ${res.provider} in ${Math.round(t1 - t0)}ms`);
          const activeProvider: ActiveTtsProvider = res.provider;

          // Store in client LRU audio cache for instant replay
          if (this.audioBufferCache.size >= 50) {
            const firstKey = this.audioBufferCache.keys().next().value;
            if (firstKey) this.audioBufferCache.delete(firstKey);
          }
          this.audioBufferCache.set(cacheKey, {
            audio: res.audio,
            mimeType: res.mimeType || 'audio/mp3',
            provider: activeProvider,
            voice: res.voice,
          });

          return this.playAudioBase64(res.audio, res.mimeType || 'audio/mp3', activeProvider, token, {
            onStart: () => {
              if (this.playbackToken !== token || this.isCancelled) return;
              this.currentProvider = activeProvider;
              options?.onProviderSelected?.(activeProvider, res.voice);
              options?.onStart?.();
            },
            onEnd: () => {
              if (this.playbackToken !== token || this.isCancelled) return;
              this.currentProvider = null;
              this.activeAudio = null;
              options?.onEnd?.();
            },
            onInterrupted: () => {
              this.currentProvider = null;
              this.activeAudio = null;
              options?.onInterrupted?.();
            },
            onError: (err) => {
              // Crucial: Only fall back if this playback session is still the active one!
              if (this.playbackToken !== token || this.isCancelled) return;
              console.warn('[speechService] Backend audio playback failed, falling back to browser voice:', err);
              this.speakBrowser(cleanText, langCode, options, token);
            },
          });
        }
      } catch (err) {
        if (this.playbackToken !== token || this.isCancelled) return false;
        console.warn('[speechService] Backend TTS request failed, gracefully falling back to browser voice:', err);
      }
    }

    // Graceful fallback to browser SpeechSynthesis (only if still active token)
    if (this.playbackToken !== token || this.isCancelled) {
      return false;
    }
    return this.speakBrowser(cleanText, langCode, options, token);
  }

  /**
   * Speak method that delegates to natural speech synthesis
   */
  public speak(
    text: string,
    langCode: SupportedLanguageCode,
    options?: SpeakOptions
  ): boolean {
    this.speakNatural(text, langCode, options).catch((err) => {
      console.warn('[speechService] speakNatural failed:', err);
    });
    return true;
  }

  /**
   * Helper to detach and stop active audio element without modifying playbackToken
   */
  private stopAudioElementOnly(): void {
    if (this.activeAudio) {
      const audio = this.activeAudio;
      this.activeAudio = null;
      // Detach all handlers BEFORE pausing or clearing src to prevent error events triggering fallback
      audio.onplay = null;
      audio.onended = null;
      audio.onerror = null;
      audio.onpause = null;
      audio.oncanplay = null;
      try {
        audio.pause();
        audio.currentTime = 0;
        audio.src = '';
      } catch {
        // Best effort pause
      }
    }
  }

  /**
   * Immediately cancel any active speech synthesis (both cloud audio and browser utterance).
   * Detaches all handlers before pausing or clearing src so an intentional stop never triggers fallback.
   */
  public stopSpeaking(): void {
    // Invalidate any current or in-flight playback token
    this.playbackToken++;
    this.isCancelled = true;

    this.stopAudioElementOnly();

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (this.currentUtterance) {
        this.currentUtterance.onstart = null;
        this.currentUtterance.onend = null;
        this.currentUtterance.onerror = null;
        this.currentUtterance = null;
      }
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Best-effort cancel
      }
    }

    this.currentProvider = null;
  }

  /**
   * Returns whether speech is currently active (either HTML5 Audio or browser SpeechSynthesis)
   */
  public isSpeaking(): boolean {
    const isAudioPlaying = !!(this.activeAudio && !this.activeAudio.paused && !this.activeAudio.ended);
    const isSynthesisSpeaking = typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking;
    return isAudioPlaying || isSynthesisSpeaking;
  }
}

export const speechService = new SpeechService();
