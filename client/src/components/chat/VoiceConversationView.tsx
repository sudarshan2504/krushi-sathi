import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Bot,
  User as UserIcon,
  AlertCircle,
  X,
  MessageSquare,
  Radio,
  CheckCircle2,
} from 'lucide-react';
import { SupportedLanguageCode, speechService } from '../../services/speechService';
import { VoiceAssistantState } from '../../hooks/useVoiceAssistant';
import { ChatMessage } from '../../types';

export interface VoiceConversationViewProps {
  state: VoiceAssistantState;
  interimTranscript: string;
  lastFarmerWords: string;
  lastAssistantWords: string;
  lastAssistantMessage: ChatMessage | null;
  lastSpokenSummary?: string;
  language: SupportedLanguageCode;
  onLanguageChange: (lang: SupportedLanguageCode) => void;
  voiceGender?: 'female' | 'male';
  onToggleVoiceGender?: () => void;
  ttsProvider?: 'gemini-tts' | 'edge-neural' | 'browser' | null;
  voiceName?: string | null;
  autoListen: boolean;
  onToggleAutoListen: () => void;
  errorMessage: string | null;
  isPermissionDenied: boolean;
  voiceNotice: string | null;
  onStartListening: () => void;
  onCancelListening: () => void;
  onStopSpeaking: () => void;
  onRepeatResponse: () => void;
  onSwitchToTextChat: () => void;
  onQuickQuestion: (question: string) => void;
  isGeminiActive: boolean;
  geminiModel?: string;
}

const STATE_LABELS: Record<SupportedLanguageCode, Record<VoiceAssistantState, string>> = {
  en: {
    ready: 'Tap to Speak',
    listening: 'Listening to your voice...',
    understanding: 'Understanding your question...',
    preparing: 'Consulting agricultural advisor...',
    speaking: 'Speaking answer aloud...',
    interrupted: 'Interrupted • Listening...',
    error: 'Tap to Try Again',
  },
  kn: {
    ready: 'ಮಾತನಾಡಲು ಟ್ಯಾಪ್ ಮಾಡಿ',
    listening: 'ನಿಮ್ಮ ಧ್ವನಿಯನ್ನು ಆಲಿಸಲಾಗುತ್ತಿದೆ...',
    understanding: 'ಪ್ರಶ್ನೆಯನ್ನು ಗ್ರಹಿಸಲಾಗುತ್ತಿದೆ...',
    preparing: 'ಕೃಷಿ ಸಲಹೆಯನ್ನು ಸಿದ್ಧಪಡಿಸಲಾಗುತ್ತಿದೆ...',
    speaking: 'ಧ್ವನಿಯಲ್ಲಿ ಉತ್ತರಿಸಲಾಗುತ್ತಿದೆ...',
    interrupted: 'ನಿಲ್ಲಿಸಲಾಗಿದೆ • ಕೇಳಲಾಗುತ್ತಿದೆ...',
    error: 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಲು ಟ್ಯಾಪ್ ಮಾಡಿ',
  },
  ta: {
    ready: 'பேச தட்டவும்',
    listening: 'உங்கள் குரலைக் கேட்கிறது...',
    understanding: 'கேள்வியைப் புரிந்து கொள்கிறது...',
    preparing: 'வேளாண் பதிலை தயாரிக்கிறது...',
    speaking: 'பதிலை உரக்கப் பேசுகிறது...',
    interrupted: 'நிறுத்தப்பட்டது • கேட்கிறது...',
    error: 'மீண்டும் முயற்சிக்க தட்டவும்',
  },
  te: {
    ready: 'మాట్లాడటానికి నొక్కండి',
    listening: 'మీ మాటలను వింటోంది...',
    understanding: 'ప్రశ్నను అర్థం చేసుకుంటోంది...',
    preparing: 'వ్యవసాయ సమాధానం సిద్ధం చేస్తోంది...',
    speaking: 'సమాధానం వినిపిస్తోంది...',
    interrupted: 'ఆపివేయబడింది • వింటోంది...',
    error: 'మళ్ళీ ప్రయత్నించడానికి నొక్కండి',
  },
};

const STATE_HINTS: Record<SupportedLanguageCode, Record<VoiceAssistantState, string>> = {
  en: {
    ready: 'Ask anything about crops, pests, soil, fertilizers, or weather',
    listening: 'Utterance ends automatically when you finish speaking',
    understanding: 'Converting speech into farming query',
    preparing: 'Retrieving context from soil test and weather data',
    speaking: 'Tap microphone anytime to interrupt and ask a follow-up',
    interrupted: 'Microphone reopened for your new question',
    error: 'Check microphone permissions or try asking in a quieter place',
  },
  kn: {
    ready: 'ಬೆಳೆ, ಕೀಟ ರೋಗ, ಮಣ್ಣು, ಗೊಬ್ಬರ ಅಥವಾ ಹವಾಮಾನದ ಬಗ್ಗೆ ಧ್ವನಿಯಲ್ಲಿ ಕೇಳಿ',
    listening: 'ನೀವು ಮಾತನಾಡಿ ಮುಗಿಸಿದ ತಕ್ಷಣ ಉತ್ತರ ನೀಡಲಾಗುತ್ತದೆ',
    understanding: 'ನಿಮ್ಮ ಧ್ವನಿ ಪ್ರಶ್ನೆಯನ್ನು ಪರಿವರ್ತಿಸಲಾಗುತ್ತಿದೆ',
    preparing: 'ಮಣ್ಣಿನ ಪರೀಕ್ಷೆ ಮತ್ತು ಹವಾಮಾನ ಮಾಹಿತಿಯನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ',
    speaking: 'ಮೈಕ್ರೊಫೋನ್ ಟ್ಯಾಪ್ ಮಾಡುವ ಮೂಲಕ ಯಾವುದೇ ಸಮಯದಲ್ಲಿ ಹೊಸ ಪ್ರಶ್ನೆ ಕೇಳಿ',
    interrupted: 'ಹೊಸ ಪ್ರಶ್ನೆಗಾಗಿ ಮೈಕ್ರೊಫೋನ್ ಮತ್ತೆ ಸಕ್ರಿಯವಾಗಿದೆ',
    error: 'ಮೈಕ್ರೊಫೋನ್ ಅನುಮತಿ ಪರಿಶೀಲಿಸಿ ಅಥವಾ ಪುನಃ ಮಾತನಾಡಿ',
  },
  ta: {
    ready: 'பயிர், பூச்சி, மண், உரம் அல்லது வானிலை பற்றி பேசுங்கள்',
    listening: 'நீங்கள் பேசி முடித்ததும் தானாக பதில் தயாரிக்கும்',
    understanding: 'குரல் கேள்வியை உரையாக மாற்றுகிறது',
    preparing: 'மண் சோதனை மற்றும் வானிலை தரவுகளிலிருந்து ஆராய்கிறது',
    speaking: 'புதிய கேள்வி கேட்க எப்போது வேண்டுமானாலும் மைக்கை தட்டலாம்',
    interrupted: 'புதிய கேள்விக்காக மைக் மீண்டும் தயாராக உள்ளது',
    error: 'மைக் அனுமதியை சரிபார்க்கவும் அல்லது மீண்டும் பேசவும்',
  },
  te: {
    ready: 'పంట, తెగుళ్లు, నేల, ఎరువులు లేదా వాతావరణం గురించి మాట్లాడండి',
    listening: 'మీరు మాట్లాడటం ముగించగానే సమాధానం సిద్ధమవుతుంది',
    understanding: 'మీ మాటలను వ్యవసాయ ప్రశ్నగా మారుస్తోంది',
    preparing: 'నేల రకం మరియు వాతావరణ సమాచారంతో సరిపోలుస్తోంది',
    speaking: 'కొత్త ప్రశ్న అడగడానికి మైక్రోఫోన్‌ను ఎప్పుడైనా నొక్కవచ్చు',
    interrupted: 'కొత్త ప్రశ్న కోసం మైక్ మళ్లీ సిద్ధంగా ఉంది',
    error: 'మైక్ అనుమతిని తనిఖీ చేయండి లేదా మళ్లీ మాట్లాడండి',
  },
};

const QUICK_SUGGESTIONS: Record<SupportedLanguageCode, string[]> = {
  en: [
    'Which fertilizer is best for tomato in flowering stage?',
    'How can I control stem borer in paddy?',
    'Will it rain this week in my district?',
    'What crop can I sow in red loamy soil?',
  ],
  kn: [
    'ಹೂವಾಡುವ ಹಂತದಲ್ಲಿ ಟೊಮ್ಯಾಟೊ ಬೆಳೆಗೆ ಯಾವ ಗೊಬ್ಬರ ನೀಡಬೇಕು?',
    'ಭತ್ತದ ಕಾಂಡ ಕೊರೆಯುವ ಕೀಟ ನಿಯಂತ್ರಣ ಹೇಗೆ?',
    'ಈ ವಾರ ನನ್ನ ಜಿಲ್ಲೆಯಲ್ಲಿ ಮಳೆ ಬೀಳುವ ಸಾಧ್ಯತೆ ಇದೆಯೇ?',
    'ಕೆಂಪು ಮಣ್ಣಿಗೆ ಯಾವ ಬೆಳೆ ಉತ್ತಮ?',
  ],
  ta: [
    'பூக்கும் பருவத்தில் தக்காளிக்கு என்ன உரம் இட வேண்டும்?',
    'நெல்லில் தண்டு துளைப்பான் பூச்சியை எப்படி கட்டுப்படுத்துவது?',
    'இந்த வாரம் என் மாவட்டத்தில் மழை பெய்யுமா?',
    'செம்மண் நிலத்திற்கு எந்த பயிர் சிறந்தது?',
  ],
  te: [
    'పూత దశలో టమాటా పంటకు ఏ ఎరువు వేయాలి?',
    'వరిలో కాండం తొలుచు పురుగు నివారణ ఎలా?',
    'ఈ వారం నా జిల్లాలో వర్షం పడే అవకాశం ఉందా?',
    'ఎర్ర నేలల్లో ఏ పంట వేయడం మంచిది?',
  ],
};

export const VoiceConversationView: React.FC<VoiceConversationViewProps> = ({
  state,
  interimTranscript,
  lastFarmerWords,
  lastAssistantWords,
  lastAssistantMessage,
  lastSpokenSummary,
  language,
  onLanguageChange,
  voiceGender = 'female',
  onToggleVoiceGender,
  ttsProvider,
  voiceName,
  autoListen,
  onToggleAutoListen,
  errorMessage,
  isPermissionDenied,
  voiceNotice,
  onStartListening,
  onCancelListening,
  onStopSpeaking,
  onRepeatResponse,
  onSwitchToTextChat,
  onQuickQuestion,
  isGeminiActive,
  geminiModel,
}) => {
  const isListening = state === 'listening';
  const isSpeaking = state === 'speaking';
  const isUnderstanding = state === 'understanding';
  const isPreparing = state === 'preparing';
  const isInterrupted = state === 'interrupted';
  const isError = state === 'error';

  const labels = STATE_LABELS[language] || STATE_LABELS.en;
  const hints = STATE_HINTS[language] || STATE_HINTS.en;
  const quickQuestions = QUICK_SUGGESTIONS[language] || QUICK_SUGGESTIONS.en;

  const handleMicClick = () => {
    if (isListening) {
      onCancelListening();
    } else if (isSpeaking) {
      // Interruption: Clicking mic while speaking interrupts and starts listening
      onStartListening();
    } else {
      onStartListening();
    }
  };

  // Waveform bar heights generator
  const waveformBars = 22;

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto px-3 py-2 justify-between">
      {/* Top Bar Controls */}
      <div className="flex items-center justify-between gap-2 bg-white/90 backdrop-blur-md p-3 rounded-2xl border border-gray-100 shadow-sm flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-forest/10 flex items-center justify-center text-forest">
            <Radio className="w-4 h-4 animate-pulse text-forest" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-dark-text flex items-center gap-1.5 flex-wrap">
              <span>Krushi Sathi Voice</span>
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold border ${
                  isGeminiActive
                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                {isGeminiActive ? `Gemini (${geminiModel || '3.5'})` : 'ICAR Local Demo'}
              </span>
              {ttsProvider && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-mint/60 text-forest border border-forest/20">
                  {ttsProvider === 'gemini-tts'
                    ? `✨ Gemini TTS (${voiceName || 'Natural'})`
                    : ttsProvider === 'edge-neural'
                    ? `🎙️ Regional Neural (${voiceName || 'Indic'})`
                    : `🔊 Device Voice (${voiceName || 'Browser'})`}
                </span>
              )}
            </h3>
            <p className="text-[10px] text-dark-muted">South Indian Regional Farming Companion</p>
          </div>
        </div>

        {/* Right Action: Voice Gender + Language tabs + Text Chat Switch */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {onToggleVoiceGender && (
            <button
              type="button"
              onClick={onToggleVoiceGender}
              className="px-2 py-1 rounded-xl bg-gray-100 hover:bg-forest/10 text-xs font-bold text-dark-text flex items-center gap-1 border border-gray-200 transition"
              title="Switch Voice Gender"
            >
              <span>{voiceGender === 'female' ? '👩 Female' : '👨 Male'}</span>
            </button>
          )}

          <div className="flex bg-gray-100 p-0.5 rounded-xl">
            {(['kn', 'en', 'ta', 'te'] as SupportedLanguageCode[]).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => onLanguageChange(code)}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                  language === code
                    ? 'bg-forest text-white shadow-sm'
                    : 'text-gray-600 hover:text-dark-text'
                }`}
              >
                {code === 'kn' ? 'ಕನ್ನಡ' : code === 'ta' ? 'தமிழ்' : code === 'te' ? 'తెలుగు' : 'EN'}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onSwitchToTextChat}
            className="flex items-center gap-1 text-xs font-bold text-forest hover:bg-forest/10 px-2.5 py-1.5 rounded-xl border border-forest/20 transition active:scale-95"
            title="Switch to Text Chat view"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Text Chat</span>
          </button>
        </div>
      </div>

      {/* Notice / Warning Bar (if voice missing on device or mic denied) */}
      <AnimatePresence>
        {voiceNotice && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{voiceNotice}</span>
          </motion.div>
        )}

        {isPermissionDenied && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-2 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-start gap-2.5 shadow-sm"
          >
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Microphone access was blocked</p>
              <p className="text-[11px] text-red-700 mt-0.5">
                Please click the lock/camera icon in your browser address bar and choose &quot;Allow&quot; for the microphone to talk with Raitha Mitra.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Center Area: Large Animated Microphone & Waveform */}
      <div className="flex-1 flex flex-col items-center justify-center my-4 relative">
        {/* Pulsing Backlight Rings */}
        <div className="relative flex items-center justify-center">
          {isListening && (
            <>
              <motion.div
                className="absolute w-44 h-44 rounded-full bg-red-400/20"
                animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0.1, 0.6] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute w-36 h-36 rounded-full bg-red-500/30"
                animate={{ scale: [1, 1.25, 1], opacity: [0.7, 0.2, 0.7] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
              />
            </>
          )}

          {isSpeaking && (
            <>
              <motion.div
                className="absolute w-44 h-44 rounded-full bg-emerald-400/20"
                animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0.15, 0.6] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute w-36 h-36 rounded-full bg-forest/25"
                animate={{ scale: [1, 1.2, 1], opacity: [0.7, 0.2, 0.7] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0.15 }}
              />
            </>
          )}

          {isPreparing && (
            <motion.div
              className="absolute w-40 h-40 rounded-full border-2 border-purple-400 border-dashed"
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            />
          )}

          {/* Central Microphone Button */}
          <button
            type="button"
            onClick={handleMicClick}
            disabled={isPreparing || isUnderstanding}
            className={`relative z-10 w-28 h-28 md:w-32 md:h-32 rounded-full flex flex-col items-center justify-center text-white shadow-xl transition-all duration-300 active:scale-95 ${
              isListening
                ? 'bg-gradient-to-tr from-red-600 to-rose-500 ring-8 ring-red-100 shadow-red-200'
                : isSpeaking
                ? 'bg-gradient-to-tr from-forest to-emerald-500 ring-8 ring-emerald-100 shadow-emerald-200'
                : isPreparing || isUnderstanding
                ? 'bg-gradient-to-tr from-purple-600 to-indigo-500 ring-8 ring-purple-100 shadow-purple-200 cursor-wait'
                : isError
                ? 'bg-gradient-to-tr from-amber-600 to-red-500 ring-8 ring-red-100 shadow-red-200'
                : 'bg-gradient-to-tr from-forest to-forest-dark ring-8 ring-mint shadow-forest/20 hover:scale-105'
            }`}
          >
            {isListening ? (
              <Mic className="w-10 h-10 md:w-12 md:h-12 animate-pulse" />
            ) : isSpeaking ? (
              <Volume2 className="w-10 h-10 md:w-12 md:h-12 animate-bounce" />
            ) : isPreparing || isUnderstanding ? (
              <Sparkles className="w-10 h-10 md:w-12 md:h-12 animate-spin" />
            ) : isError ? (
              <AlertCircle className="w-10 h-10 md:w-12 md:h-12" />
            ) : (
              <Mic className="w-10 h-10 md:w-12 md:h-12" />
            )}

            <span className="text-[10px] md:text-xs font-black tracking-wide mt-1 uppercase">
              {isListening ? 'Stop' : isSpeaking ? 'Interrupt' : 'Talk'}
            </span>
          </button>
        </div>

        {/* State Label & Subtitle */}
        <div className="text-center mt-5 px-4 max-w-md">
          <motion.h2
            key={state}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-lg md:text-xl font-black ${
              isListening
                ? 'text-red-600'
                : isSpeaking
                ? 'text-forest'
                : isPreparing
                ? 'text-purple-700'
                : isError
                ? 'text-red-600'
                : 'text-dark-text'
            }`}
          >
            {labels[state]}
          </motion.h2>

          <p className="text-xs text-dark-muted mt-1 leading-relaxed">
            {errorMessage ? errorMessage : hints[state]}
          </p>
        </div>

        {/* Animated Waveform Display during Listening or Speaking */}
        {(isListening || isSpeaking) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center justify-center gap-1.5 my-4 px-6 py-2.5 bg-white/80 backdrop-blur rounded-full border border-gray-150 shadow-sm"
          >
            {Array.from({ length: waveformBars }).map((_, i) => (
              <motion.span
                key={i}
                className={`w-1 rounded-full ${
                  isListening ? 'bg-red-500' : 'bg-forest'
                }`}
                animate={{
                  height: isListening
                    ? [8, 28, 14, 36, 10][i % 5]
                    : [10, 32, 16, 40, 12][(i + 2) % 5],
                }}
                transition={{
                  repeat: Infinity,
                  repeatType: 'reverse',
                  duration: 0.45 + (i % 4) * 0.12,
                  ease: 'easeInOut',
                  delay: i * 0.04,
                }}
                style={{ height: 14 }}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* Transcript & Response Area */}
      <div className="space-y-2.5">
        {/* Farmer Spoken Words Pill */}
        {(interimTranscript || lastFarmerWords) && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-forest/5 border border-forest/15 rounded-2xl p-3 flex items-start gap-2.5 shadow-sm"
          >
            <div className="w-6 h-6 rounded-full bg-harvest text-dark-text flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
              <UserIcon className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 text-xs">
              <div className="font-bold text-forest mb-0.5 flex items-center justify-between">
                <span>You Spoke ({language.toUpperCase()}):</span>
                {isListening && (
                  <span className="flex items-center gap-1 text-[10px] text-red-600 font-bold animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                    Transcribing...
                  </span>
                )}
              </div>
              <p className="text-dark-text font-medium italic text-sm">
                &ldquo;{interimTranscript || lastFarmerWords}&rdquo;
              </p>
            </div>
          </motion.div>
        )}

        {/* Assistant Response Card */}
        {lastAssistantWords && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-4 border border-gray-150 shadow-md max-h-56 overflow-y-auto"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-forest text-white flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-forest">Raitha Mitra Advisory</span>
                {lastAssistantMessage?.mode === 'gemini' && (
                  <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md font-bold border border-purple-200">
                    ✨ Gemini ({lastAssistantMessage.modelUsed || '2.5'})
                  </span>
                )}
                {(lastAssistantMessage?.mode === 'local_demo' || lastAssistantMessage?.mode === 'local') && (
                  <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md font-bold border border-emerald-200">
                    🌿 ICAR Local Demo
                  </span>
                )}
              </div>

              {/* Action Buttons for Assistant response */}
              <div className="flex items-center gap-1.5">
                {isSpeaking ? (
                  <button
                    type="button"
                    onClick={onStopSpeaking}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 text-xs font-bold border border-red-200 transition"
                    title="Stop speaking"
                  >
                    <VolumeX className="w-3.5 h-3.5" />
                    <span>Stop</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onRepeatResponse}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-forest/10 text-forest hover:bg-forest/20 text-xs font-bold border border-forest/20 transition"
                    title="Listen again"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Repeat</span>
                  </button>
                )}
              </div>
            </div>

            {/* Spoken summary highlight if available */}
            {lastSpokenSummary && lastSpokenSummary !== lastAssistantWords && (
              <div className="mb-3 p-2.5 rounded-xl bg-forest/5 border border-forest/15 text-xs text-forest-dark">
                <span className="font-bold text-[10px] uppercase text-forest tracking-wider block mb-0.5">
                  🗣️ Spoken Summary:
                </span>
                <p className="font-medium leading-relaxed">{lastSpokenSummary}</p>
              </div>
            )}

            <div className="text-xs md:text-sm text-dark-text leading-relaxed whitespace-pre-wrap">
              {lastAssistantWords}
            </div>

            {/* Sources grounding tags */}
            {lastAssistantMessage?.sources && lastAssistantMessage.sources.length > 0 && (
              <div className="mt-3 pt-2 border-t border-gray-100 flex flex-wrap gap-1 items-center">
                <span className="text-[10px] font-semibold text-gray-400">Sources:</span>
                {lastAssistantMessage.sources.map((src, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] bg-gray-50 text-gray-600 px-1.5 py-0.5 rounded border border-gray-150"
                  >
                    {src}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Suggested Quick Questions Pills (when idle) */}
        {!lastAssistantWords && !interimTranscript && (
          <div className="pt-2">
            <p className="text-[11px] font-bold text-dark-muted mb-1.5 text-center">
              Suggested questions you can speak:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {quickQuestions.slice(0, 4).map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onQuickQuestion(q)}
                  disabled={isListening || isPreparing}
                  className="p-2 rounded-xl text-left text-xs bg-white hover:bg-mint/40 border border-gray-200 hover:border-forest/40 text-forest font-semibold transition active:scale-[0.99] disabled:opacity-50"
                >
                  &ldquo;{q}&rdquo;
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Turn-Taking & Mode Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
          {/* Hands-free Continuous Conversation Toggle */}
          <button
            type="button"
            onClick={onToggleAutoListen}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition ${
              autoListen
                ? 'bg-forest text-white border-forest shadow-sm'
                : 'bg-white text-gray-600 hover:text-dark-text border-gray-200'
            }`}
            title="Auto-listen for your follow-up question right after assistant finishes speaking"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                autoListen ? 'bg-mint animate-pulse' : 'bg-gray-300'
              }`}
            />
            <span>Hands-Free Auto-Listen: {autoListen ? 'ON' : 'OFF'}</span>
          </button>

          {/* Quick Clear / New Conversation */}
          {isListening && (
            <button
              type="button"
              onClick={onCancelListening}
              className="text-xs text-red-600 font-bold hover:underline flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
