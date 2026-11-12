import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  Volume2,
  RotateCcw,
  Square,
  ChevronDown,
  AlertCircle,
  X,
  Settings,
  User as UserIcon,
  Sprout,
} from 'lucide-react';
import { SupportedLanguageCode } from '../../services/speechService';
import { VoiceAssistantState } from '../../hooks/useVoiceAssistant';
import { ChatMessage } from '../../types';
import { VoiceWaveform } from '../ai/VoiceWaveform';

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

interface LocalizedStrings {
  statusReady: string;
  statusListening: string;
  statusThinking: string;
  statusSpeaking: string;
  statusError: string;
  tapToSpeak: string;
  tapToStop: string;
  tapToInterrupt: string;
  tapToRetry: string;
  readFullAdvice: string;
  showLess: string;
  voiceSettings: string;
  voiceGender: string;
  female: string;
  male: string;
  handsFreeAutoListen: string;
  handsFreeDesc: string;
  on: string;
  off: string;
  close: string;
  deviceVoiceNotice: string;
  micBlockedTitle: string;
  micBlockedDesc: string;
  tryAsking: string;
  youAsked: string;
}

const UI_TEXT: Record<SupportedLanguageCode, LocalizedStrings> = {
  en: {
    statusReady: 'Ready',
    statusListening: 'Listening...',
    statusThinking: 'Thinking...',
    statusSpeaking: 'Speaking...',
    statusError: 'Unable to hear',
    tapToSpeak: 'Tap to speak',
    tapToStop: 'Tap to stop',
    tapToInterrupt: 'Tap to interrupt',
    tapToRetry: 'Tap to retry',
    readFullAdvice: 'Read full advice',
    showLess: 'Show less',
    voiceSettings: 'Voice Settings',
    voiceGender: 'Assistant Voice',
    female: 'Female',
    male: 'Male',
    handsFreeAutoListen: 'Continuous Listening',
    handsFreeDesc: 'Listen automatically after the assistant finishes speaking',
    on: 'On',
    off: 'Off',
    close: 'Close',
    deviceVoiceNotice: 'Voice may sound basic on this device.',
    micBlockedTitle: 'Microphone access is blocked',
    micBlockedDesc: 'Please allow microphone access in your browser settings to speak.',
    tryAsking: 'Try asking',
    youAsked: 'You asked',
  },
  kn: {
    statusReady: 'ಸಿದ್ಧವಾಗಿದೆ',
    statusListening: 'ಆಲಿಸಲಾಗುತ್ತಿದೆ...',
    statusThinking: 'ಯೋಚಿಸುತ್ತಿದೆ...',
    statusSpeaking: 'ಮಾತನಾಡುತ್ತಿದೆ...',
    statusError: 'ಧ್ವನಿ ಕೇಳಿಸಲಿಲ್ಲ',
    tapToSpeak: 'ಮಾತನಾಡಲು ಟ್ಯಾಪ್ ಮಾಡಿ',
    tapToStop: 'ನಿಲ್ಲಿಸಲು ಟ್ಯಾಪ್ ಮಾಡಿ',
    tapToInterrupt: 'ನಿಲ್ಲಿಸಲು ಟ್ಯಾಪ್ ಮಾಡಿ',
    tapToRetry: 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ',
    readFullAdvice: 'ಪೂರ್ಣ ಸಲಹೆ ಓದಿ',
    showLess: 'ಕಡಿಮೆ ತೋರಿಸಿ',
    voiceSettings: 'ಧ್ವನಿ ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
    voiceGender: 'ಸಹಾಯಕ ಧ್ವನಿ',
    female: 'ಮಹಿಳೆ',
    male: 'ಪುರುಷ',
    handsFreeAutoListen: 'ನಿರಂತರ ಆಲಿಸುವಿಕೆ',
    handsFreeDesc: 'ಸಹಾಯಕ ಮಾತನಾಡಿದ ನಂತರ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಆಲಿಸಿ',
    on: 'ಆನ್',
    off: 'ಆಫ್',
    close: 'ಮುಚ್ಚಿ',
    deviceVoiceNotice: 'ಈ ಸಾಧನದಲ್ಲಿ ಧ್ವನಿ ಸರಳವಾಗಿ ಕೇಳಿಸಬಹುದು.',
    micBlockedTitle: 'ಮೈಕ್ರೊಫೋನ್ ಅನುಮತಿ ನಿರಾಕರಿಸಲಾಗಿದೆ',
    micBlockedDesc: 'ಮಾತನಾಡಲು ಬ್ರೌಸರ್ ಸೆಟ್ಟಿಂಗ್ಸ್‌ನಲ್ಲಿ ಮೈಕ್ರೊಫೋನ್ ಅನುಮತಿಸಿ.',
    tryAsking: 'ಹೀಗೆ ಕೇಳಿ',
    youAsked: 'ನಿಮ್ಮ ಪ್ರಶ್ನೆ',
  },
  ta: {
    statusReady: 'தயாராக உள்ளது',
    statusListening: 'கேட்கிறது...',
    statusThinking: 'யோசிக்கிறது...',
    statusSpeaking: 'பேசுகிறது...',
    statusError: 'குரல் கேட்கவில்லை',
    tapToSpeak: 'பேச தட்டவும்',
    tapToStop: 'நிறுத்த தட்டவும்',
    tapToInterrupt: 'நிறுத்த தட்டவும்',
    tapToRetry: 'மீண்டும் முயற்சிக்கவும்',
    readFullAdvice: 'முழு ஆலோசனையை படிக்கவும்',
    showLess: 'சுருக்கவும்',
    voiceSettings: 'குரல் அமைப்புகள்',
    voiceGender: 'உதவியாளர் குரல்',
    female: 'பெண்',
    male: 'ஆண்',
    handsFreeAutoListen: 'தொடர் கேட்பு',
    handsFreeDesc: 'உதவியாளர் பேசியதும் தானாகவே கேட்கும்',
    on: 'ஆன்',
    off: 'ஆஃப்',
    close: 'மூடு',
    deviceVoiceNotice: 'இந்த சாதனத்தில் குரல் சாதாரணமாக ஒலிக்கலாம்.',
    micBlockedTitle: 'மைக் அனுமதி தடுக்கப்பட்டுள்ளது',
    micBlockedDesc: 'பேச உலாவி அமைப்புகளில் மைக் அனுமதியை இயக்கவும்.',
    tryAsking: 'இப்படி கேளுங்கள்',
    youAsked: 'உங்கள் கேள்வி',
  },
  te: {
    statusReady: 'సిద్ధంగా ఉంది',
    statusListening: 'వింటోంది...',
    statusThinking: 'ఆలోచిస్తోంది...',
    statusSpeaking: 'మాట్లాడుతోంది...',
    statusError: 'వాయిస్ వినబడలేదు',
    tapToSpeak: 'మాట్లాడటానికి నొక్కండి',
    tapToStop: 'ఆపడానికి నొక్కండి',
    tapToInterrupt: 'ఆపడానికి నొక్కండి',
    tapToRetry: 'మళ్ళీ ప్రయత్నించండి',
    readFullAdvice: 'పూర్తి సలహా చదవండి',
    showLess: 'తక్కువ చూపించు',
    voiceSettings: 'వాయిస్ సెట్టింగ్‌లు',
    voiceGender: 'సహాయక వాయిస్',
    female: 'మహిళ',
    male: 'పురుషుడు',
    handsFreeAutoListen: 'నిరంతర వినడం',
    handsFreeDesc: 'సహాయకుడు మాట్లాడిన తర్వాత స్వయంచాలకంగా వింటుంది',
    on: 'ఆన్',
    off: 'ఆఫ్',
    close: 'మూసివేయి',
    deviceVoiceNotice: 'ఈ పరికరంలో వాయిస్ సాధారణంగా వినిపించవచ్చు.',
    micBlockedTitle: 'మైక్రోఫోన్ అనుమతి నిరోధించబడింది',
    micBlockedDesc: 'మాట్లాడటానికి బ్రౌజర్ సెట్టింగ్‌లలో మైక్ అనుమతించండి.',
    tryAsking: 'ఇలా అడగండి',
    youAsked: 'మీ ప్రశ్న',
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
  lastSpokenSummary,
  language,
  voiceGender = 'female',
  onToggleVoiceGender,
  autoListen,
  onToggleAutoListen,
  errorMessage,
  isPermissionDenied,
  voiceNotice,
  onStartListening,
  onCancelListening,
  onStopSpeaking,
  onRepeatResponse,
  onQuickQuestion,
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAdviceExpanded, setIsAdviceExpanded] = useState(false);
  const [isNoticeDismissed, setIsNoticeDismissed] = useState(false);

  const isListening = state === 'listening';
  const isSpeaking = state === 'speaking';
  const isThinking = state === 'understanding' || state === 'preparing';
  const isError = state === 'error';

  const txt = UI_TEXT[language] || UI_TEXT.en;
  const quickQuestions = QUICK_SUGGESTIONS[language] || QUICK_SUGGESTIONS.en;

  const isIndic = language === 'kn' || language === 'ta' || language === 'te';
  const textClass = isIndic ? 'text-[15px] leading-relaxed' : 'text-sm leading-normal';
  const quoteClass = isIndic ? 'text-[15px] leading-relaxed' : 'text-sm leading-normal';

  const handleMicClick = () => {
    if (isListening) {
      onCancelListening();
    } else if (isSpeaking) {
      onStartListening();
    } else {
      onStartListening();
    }
  };

  // Primary short advice for display
  const spokenAdvice = lastSpokenSummary && lastSpokenSummary.trim().length > 0
    ? lastSpokenSummary
    : lastAssistantWords;

  const hasLongerAdvice = Boolean(
    lastAssistantWords &&
    (lastAssistantWords.length > (spokenAdvice?.length || 0) + 40 ||
      lastAssistantWords.includes('\n'))
  );

  return (
    <div className="flex flex-col h-full w-full max-w-xl mx-auto px-4 py-2 select-none justify-between">
      {/* 1. Top Status & Settings Bar */}
      <div className="flex items-center justify-between min-h-[48px] py-1">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isListening
                ? 'bg-red-500 animate-pulse'
                : isSpeaking
                ? 'bg-forest animate-pulse'
                : isThinking
                ? 'bg-forest/60'
                : isError
                ? 'bg-red-500'
                : 'bg-forest'
            }`}
          />
          <h2 className="text-sm font-semibold text-gray-700 tracking-wide">
            {isListening
              ? txt.statusListening
              : isSpeaking
              ? txt.statusSpeaking
              : isThinking
              ? txt.statusThinking
              : isError
              ? txt.statusError
              : txt.statusReady}
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setIsSettingsOpen(true)}
          className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-full text-gray-500 hover:text-forest transition-colors cursor-pointer"
          title={txt.voiceSettings}
          aria-label={txt.voiceSettings}
        >
          <Settings className="w-5 h-5 stroke-[1.8]" />
        </button>
      </div>

      {/* 2. Dismissible Alerts & Permissions */}
      <div className="space-y-2">
        {voiceNotice && !isNoticeDismissed && (
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-200/80 text-gray-700 text-[13px] flex items-center justify-between gap-3">
            <span>{txt.deviceVoiceNotice}</span>
            <button
              type="button"
              onClick={() => setIsNoticeDismissed(true)}
              className="min-w-[48px] min-h-[48px] flex items-center justify-center text-gray-600 hover:text-gray-800 cursor-pointer -mr-2"
              aria-label={txt.close}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {isPermissionDenied && (
          <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-gray-800 text-[13px] flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-gray-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-900">{txt.micBlockedTitle}</p>
              <p className="text-gray-600 mt-0.5 leading-relaxed">{txt.micBlockedDesc}</p>
            </div>
          </div>
        )}
      </div>

      {/* 3. Middle Scrollable Conversation Area */}
      <div className="flex-1 overflow-y-auto space-y-4 py-3 my-1">
        {/* Farmer Question */}
        {(interimTranscript || lastFarmerWords) && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-l-2 border-forest/40 pl-3.5 py-1"
          >
            <p className="text-xs text-gray-600 font-semibold mb-1 uppercase tracking-wider">
              {txt.youAsked}
            </p>
            <p className={`text-gray-700 italic font-medium ${quoteClass}`}>
              &ldquo;{interimTranscript || lastFarmerWords}&rdquo;
            </p>
          </motion.div>
        )}

        {/* Assistant Response Card */}
        {lastAssistantWords && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-4 border border-gray-200/70 space-y-3"
          >
            {/* Card Header with Sprout icon & Play/Stop action */}
            <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-forest/10 flex items-center justify-center text-forest">
                  <Sprout className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm font-bold text-forest">Krushi Sathi</span>
              </div>

              {isSpeaking ? (
                <button
                  type="button"
                  onClick={onStopSpeaking}
                  className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition cursor-pointer"
                  title={txt.tapToStop}
                  aria-label={txt.tapToStop}
                >
                  <Square className="w-4 h-4 fill-current" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onRepeatResponse}
                  className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-xl bg-forest/10 hover:bg-forest/15 text-forest transition cursor-pointer"
                  title={txt.statusSpeaking}
                  aria-label={txt.statusSpeaking}
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Advice Content */}
            <div className={`text-gray-900 ${textClass}`}>
              {isAdviceExpanded ? (
                <p className="whitespace-pre-wrap">{lastAssistantWords}</p>
              ) : (
                <p>{spokenAdvice}</p>
              )}
            </div>

            {/* Expand / Collapse Control */}
            {hasLongerAdvice && (
              <button
                type="button"
                onClick={() => setIsAdviceExpanded(!isAdviceExpanded)}
                className="min-h-[48px] flex items-center gap-1.5 text-[13px] font-semibold text-forest hover:text-forest-dark transition-colors cursor-pointer pt-1"
              >
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isAdviceExpanded ? 'rotate-180' : ''
                  }`}
                />
                <span>{isAdviceExpanded ? txt.showLess : txt.readFullAdvice}</span>
              </button>
            )}
          </motion.div>
        )}

        {/* Suggested Prompts (when no interaction yet) */}
        {!lastAssistantWords && !interimTranscript && !lastFarmerWords && (
          <div className="py-2">
            <p className="text-[13px] font-semibold text-gray-500 mb-2">
              {txt.tryAsking}:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quickQuestions.slice(0, 4).map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onQuickQuestion(q)}
                  disabled={isListening || isThinking}
                  className="min-h-[48px] p-3 rounded-xl text-left bg-white border border-gray-200/80 hover:border-forest/50 text-gray-800 transition active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                >
                  <span className={textClass}>&ldquo;{q}&rdquo;</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. Lower Third: Thumb-Reachable Control Area */}
      <div className="flex flex-col items-center justify-end pb-3 pt-1 space-y-2">
        {/* Slim Waveform */}
        <div className="h-6 flex items-center justify-center">
          {isListening && <VoiceWaveform isRecording={true} variant="recording" />}
          {isSpeaking && <VoiceWaveform isRecording={false} variant="speaking" />}
        </div>

        {/* Live Interim Transcript or Error Hint */}
        <div className="min-h-[22px] px-4 text-center max-w-sm">
          {isListening && (
            <p className="text-[13px] text-gray-500 italic truncate">
              {interimTranscript || txt.statusListening}
            </p>
          )}
          {isError && (
            <button
              type="button"
              onClick={onStartListening}
              className="min-h-[44px] inline-flex items-center px-3 text-[13px] text-red-600 font-semibold hover:underline cursor-pointer"
            >
              {errorMessage || txt.tapToRetry}
            </button>
          )}
        </div>

        {/* Main Microphone Button */}
        <div className="relative flex items-center justify-center py-1">
          {/* Soft Single Pulse Ring while listening */}
          {isListening && (
            <motion.div
              className="absolute -inset-2.5 rounded-full bg-red-500/15 pointer-events-none"
              animate={{ scale: [1, 1.15, 1], opacity: [0.7, 0.2, 0.7] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}

          <button
            type="button"
            data-testid="voice-mic-button"
            onClick={handleMicClick}
            disabled={isThinking}
            aria-label={
              isListening
                ? txt.tapToStop
                : isSpeaking
                ? txt.tapToInterrupt
                : isError
                ? txt.tapToRetry
                : txt.tapToSpeak
            }
            className={`relative z-10 w-20 h-20 min-h-[48px] min-w-[48px] rounded-full flex items-center justify-center text-white transition-all cursor-pointer ${
              isListening
                ? 'bg-red-600 shadow-sm'
                : isSpeaking
                ? 'bg-forest hover:bg-forest-dark shadow-sm'
                : isThinking
                ? 'bg-forest/80 cursor-wait shadow-sm'
                : isError
                ? 'bg-forest hover:bg-forest-dark shadow-sm'
                : 'bg-forest hover:bg-forest-dark shadow-sm active:scale-95'
            }`}
          >
            {isListening ? (
              <Square className="w-7 h-7 fill-current" />
            ) : isSpeaking ? (
              <Square className="w-7 h-7 fill-current" />
            ) : isThinking ? (
              <div className="flex items-center gap-1.5" aria-label={txt.statusThinking}>
                {[0, 1, 2].map((dot) => (
                  <motion.span
                    key={dot}
                    className="w-2 h-2 rounded-full bg-white"
                    animate={{ scale: [0.8, 1.25, 0.8], opacity: [0.4, 1, 0.4] }}
                    transition={{
                      duration: 0.85,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: dot * 0.16,
                    }}
                  />
                ))}
              </div>
            ) : isError ? (
              <RotateCcw className="w-8 h-8" />
            ) : (
              <Mic className="w-8 h-8 stroke-[2]" />
            )}
          </button>
        </div>

        {/* Status Label Under Mic */}
        <p className="text-[13px] font-medium text-gray-600 text-center">
          {isListening
            ? txt.tapToStop
            : isSpeaking
            ? txt.tapToInterrupt
            : isThinking
            ? txt.statusThinking
            : isError
            ? txt.tapToRetry
            : txt.tapToSpeak}
        </p>
      </div>

      {/* 5. Voice Settings Bottom Sheet */}
      <AnimatePresence>
        {isSettingsOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="fixed inset-0 bg-black/25 z-[9980] backdrop-blur-2xs"
            />

            {/* Bottom Sheet Modal */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed bottom-0 inset-x-0 bg-white rounded-t-3xl p-5 shadow-xl z-[9990] max-w-md mx-auto border-t border-gray-150"
            >
              {/* Sheet Header */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-150">
                <h3 className="text-base font-bold text-gray-900">
                  {txt.voiceSettings}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="min-h-[48px] min-w-[48px] flex items-center justify-center text-gray-600 hover:text-gray-900 cursor-pointer -mr-2"
                  aria-label={txt.close}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sheet Body */}
              <div className="space-y-5 pt-4 pb-2">
                {/* Voice Gender Toggle */}
                {onToggleVoiceGender && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      {txt.voiceGender}
                    </label>
                    <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => {
                          if (voiceGender !== 'female') onToggleVoiceGender();
                        }}
                        className={`min-h-[48px] py-2 px-4 rounded-lg text-sm font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                          voiceGender === 'female'
                            ? 'bg-forest text-white shadow-xs'
                            : 'text-gray-700 hover:text-gray-900'
                        }`}
                      >
                        <UserIcon className="w-4 h-4" />
                        <span>{txt.female}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (voiceGender !== 'male') onToggleVoiceGender();
                        }}
                        className={`min-h-[48px] py-2 px-4 rounded-lg text-sm font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                          voiceGender === 'male'
                            ? 'bg-forest text-white shadow-xs'
                            : 'text-gray-700 hover:text-gray-900'
                        }`}
                      >
                        <UserIcon className="w-4 h-4" />
                        <span>{txt.male}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Continuous Hands-Free Listen Mode */}
                <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-100">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {txt.handsFreeAutoListen}
                    </p>
                    <p className="text-xs text-gray-500 leading-snug mt-0.5">
                      {txt.handsFreeDesc}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={onToggleAutoListen}
                    className={`min-h-[48px] min-w-[72px] px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                      autoListen
                        ? 'bg-forest text-white border-forest'
                        : 'bg-gray-100 text-gray-700 border-gray-200'
                    }`}
                  >
                    {autoListen ? txt.on : txt.off}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
