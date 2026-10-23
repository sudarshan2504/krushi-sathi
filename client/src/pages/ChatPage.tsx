import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MessageSquare,
  AudioLines,
  Sparkles,
  ChevronRight,
  Sprout,
  Bug,
  CloudSun,
  Coins,
  Leaf,
  Volume2,
  VolumeX,
  RotateCcw,
  Send,
  Trash2,
  Settings,
  X,
  Check,
  Bot,
  User as UserIcon,
  AlertCircle,
  Cpu,
} from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ChatMessage } from '../types';
import { useVoiceAssistant } from '../hooks/useVoiceAssistant';
import { SupportedLanguageCode } from '../services/speechService';
import farmLandscapeImg from '../assets/farm_landscape.jpg';
import farmerBannerImg from '../assets/farmer_banner.jpg';

interface SuggestedCard {
  text: string;
  query: string;
  type: 'crop' | 'pest' | 'weather' | 'fertilizer';
}

const PRIMARY_CARDS: Record<string, SuggestedCard[]> = {
  en: [
    { text: 'Which crop is\nbest for my field?', query: 'Which crop is best for my field?', type: 'crop' },
    { text: 'How to control\npests naturally?', query: 'How to control pests naturally?', type: 'pest' },
    { text: "What will be\ntomorrow's weather?", query: "What will be tomorrow's weather in my district?", type: 'weather' },
    { text: 'How much fertilizer\nto use?', query: 'How much fertilizer should I use for my crop?', type: 'fertilizer' },
  ],
  kn: [
    { text: 'ನನ್ನ ಹೊಲಕ್ಕೆ ಯಾವ ಬೆಳೆ ಉತ್ತಮ?', query: 'ನನ್ನ ಹೊಲಕ್ಕೆ ಯಾವ ಬೆಳೆ ಉತ್ತಮ?', type: 'crop' },
    { text: 'ಕೀಟಗಳನ್ನು ನೈಸರ್ಗಿಕವಾಗಿ ನಿಯಂತ್ರಿಸುವುದು ಹೇಗೆ?', query: 'ಕೀಟಗಳನ್ನು ನೈಸರ್ಗಿಕವಾಗಿ ನಿಯಂತ್ರಿಸುವುದು ಹೇಗೆ?', type: 'pest' },
    { text: 'ನಾಳೆಯ ಹವಾಮಾನ ಹೇಗಿರುತ್ತದೆ?', query: 'ನಾಳೆಯ ಹವಾಮಾನ ಹೇಗಿರುತ್ತದೆ?', type: 'weather' },
    { text: 'ಎಷ್ಟು ಗೊಬ್ಬರ ಬಳಸಬೇಕು?', query: 'ಎಷ್ಟು ಗೊಬ್ಬರ ಬಳಸಬೇಕು?', type: 'fertilizer' },
  ],
  ta: [
    { text: 'என் நிலத்திற்கு எந்த பயிர் சிறந்தது?', query: 'என் நிலத்திற்கு எந்த பயிர் சிறந்தது?', type: 'crop' },
    { text: 'பூச்சிகளை இயற்கையாக கட்டுப்படுத்துவது எப்படி?', query: 'பூச்சிகளை இயற்கையாக கட்டுப்படுத்துவது எப்படி?', type: 'pest' },
    { text: 'நாளைய வானிலை எப்படி இருக்கும்?', query: 'நாளைய வானிலை எப்படி இருக்கும்?', type: 'weather' },
    { text: 'எவ்வளவு உரம் பயன்படுத்த வேண்டும்?', query: 'எவ்வளவு உரம் பயன்படுத்த வேண்டும்?', type: 'fertilizer' },
  ],
  te: [
    { text: 'నా పొలానికి ఏ పంట మంచిది?', query: 'నా పొలానికి ఏ పంట మంచిది?', type: 'crop' },
    { text: 'తెగుళ్ళను సహజంగా ఎలా నివారించాలి?', query: 'తెగుళ్ళను సహజంగా ఎలా నివారించాలి?', type: 'pest' },
    { text: 'రేపటి వాతావరణం ఎలా ఉంటుంది?', query: 'రేపటి వాతావరణం ఎలా ఉంటుంది?', type: 'weather' },
    { text: 'ఎంత ఎరువు వాడాలి?', query: 'ఎంత ఎరువు వాడాలి?', type: 'fertilizer' },
  ],
};

const SECONDARY_CARDS: Record<string, SuggestedCard[]> = {
  en: [
    { text: 'How to test\nsoil health at farm?', query: 'How do I test my soil health?', type: 'crop' },
    { text: 'Remedy for stem\nborer in paddy?', query: 'What is the remedy for stem borer in paddy?', type: 'pest' },
    { text: 'Monsoon rain\nforecast this week?', query: 'What is the monsoon rainfall forecast this week?', type: 'weather' },
    { text: 'Drip irrigation\nwater saving tips?', query: 'How can I save water using drip irrigation?', type: 'fertilizer' },
  ],
  kn: [
    { text: 'ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಪರೀಕ್ಷೆ ಹೇಗೆ?', query: 'ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಪರೀಕ್ಷೆ ಹೇಗೆ ಮಾಡಿಸಬೇಕು?', type: 'crop' },
    { text: 'ಭತ್ತದ ಕಾಂಡ ಕೊರೆಯುವ ಹುಳು ನಿಯಂತ್ರಣ?', query: 'ಭತ್ತದ ಕಾಂಡ ಕೊರೆಯುವ ಹುಳು ನಿಯಂತ್ರಣ ಹೇಗೆ?', type: 'pest' },
    { text: 'ಈ ವಾರದ ಮಳೆ ಮುನ್ಸೂಚನೆ ಏನು?', query: 'ಈ ವಾರದ ಮಳೆ ಮುನ್ಸೂಚನೆ ಏನು?', type: 'weather' },
    { text: 'ಹನಿ ನೀರಾವರಿ ಪದ್ಧತಿಯ ಅನುಕೂಲ?', query: 'ಹನಿ ನೀರಾವರಿ ಪದ್ಧತಿಯ ಅನುಕೂಲವೇನು?', type: 'fertilizer' },
  ],
  ta: [
    { text: 'மண் பரிசோதனை செய்வது எப்படி?', query: 'மண் பரிசோதனை செய்வது எப்படி?', type: 'crop' },
    { text: 'நெல்லில் தண்டு துளைப்பான் தீர்வு?', query: 'நெல்லில் தண்டு துளைப்பான் தீர்வு என்ன?', type: 'pest' },
    { text: 'இந்த வார மழை முன்னறிவிப்பு?', query: 'இந்த வார மழை முன்னறிவிப்பு என்ன?', type: 'weather' },
    { text: 'சொட்டு நீர் பாசன வழிகாட்டுதல்?', query: 'சொட்டு நீர் பாசன வழிகாட்டுதல் கூறுங்கள்', type: 'fertilizer' },
  ],
  te: [
    { text: 'నేల సారవంత పరీక్ష ఎలా చేయాలి?', query: 'నేల సారవంత పరీక్ష ఎలా చేయాలి?', type: 'crop' },
    { text: 'వరిలో కాండం తొలుచు పురుగు నివారణ?', query: 'వరిలో కాండం తొలుచు పురుగు నివారణ ఏమిటి?', type: 'pest' },
    { text: 'ఈ వారం వర్ష సూచన వివరాలు?', query: 'ఈ వారం వర్ష సూచన వివరాలు ఏమిటి?', type: 'weather' },
    { text: 'బిందు సేద్యం నీటి ఆదా పద్ధతులు?', query: 'బిందు సేద్యం నీటి ఆదా పద్ధతులు ఏమిటి?', type: 'fertilizer' },
  ],
};

const STATE_MESSAGES: Record<string, { listening: string; preparing: string; speaking: string; error: string }> = {
  en: {
    listening: 'Listening to your voice...',
    preparing: 'Consulting agricultural advisor...',
    speaking: 'Speaking answer aloud...',
    error: 'Could not hear you clearly. Tap to retry.',
  },
  kn: {
    listening: 'ನಿಮ್ಮ ಧ್ವನಿಯನ್ನು ಆಲಿಸಲಾಗುತ್ತಿದೆ...',
    preparing: 'ಕೃಷಿ ಸಲಹೆಯನ್ನು ಸಿದ್ಧಪಡಿಸಲಾಗುತ್ತಿದೆ...',
    speaking: 'ಧ್ವನಿಯಲ್ಲಿ ಉತ್ತರಿಸಲಾಗುತ್ತಿದೆ...',
    error: 'ಧ್ವನಿ ಸರಿಯಾಗಿ ಕೇಳಿಸಲಿಲ್ಲ. ಮತ್ತೆ ಟ್ಯಾಪ್ ಮಾಡಿ.',
  },
  ta: {
    listening: 'உங்கள் குரலைக் கேட்கிறது...',
    preparing: 'வேளாண் பதிலை தயாரிக்கிறது...',
    speaking: 'பதிலை உரக்கப் பேசுகிறது...',
    error: 'குரல் கேட்கவில்லை. மீண்டும் தட்டவும்.',
  },
  te: {
    listening: 'మీ మాటలను వింటోంది...',
    preparing: 'వ్యవసాయ సమాధానం సిద్ధం చేస్తోంది...',
    speaking: 'సమాధానం వినిపిస్తోంది...',
    error: 'మాటలు సరిగా వినపడలేదు. మళ్ళీ నొక్కండి.',
  },
};

export const ChatPage: React.FC = () => {
  const { language, setLanguage } = useTranslation();
  const { user } = useAuth();

  const [chatMode, setChatMode] = useState<'voice' | 'chat'>('voice');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [failedMessage, setFailedMessage] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [showSettings, setShowSettings] = useState(false);
  const [aiStatus, setAiStatus] = useState<any>(null);
  const [showSecondaryCards, setShowSecondaryCards] = useState(false);

  // Settings modal states
  const [geminiModel, setGeminiModel] = useState('gemini-3.5-flash');
  const [geminiKey, setGeminiKey] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  // Voice assistant state hook
  const {
    state: voiceState,
    interimTranscript,
    lastFarmerWords,
    lastAssistantWords,
    lastSpokenSummary,
    lastAssistantMessage,
    autoListen,
    setAutoListen,
    voiceGender,
    setVoiceGender,
    providerChoice,
    setProviderChoice,
    ttsProvider,
    voiceName,
    errorMessage: voiceErrorMessage,
    isPermissionDenied,
    voiceNotice,
    startListening,
    cancelListening,
    stopSpeaking,
    repeatResponse,
    submitQuery,
  } = useVoiceAssistant({
    language: (language as SupportedLanguageCode) || 'en',
    onLanguageChange: (newLang) => {
      setLanguage(newLang as any);
      if (user) {
        api.auth.updateProfile({ language: newLang }).catch(() => {});
      }
    },
    conversationId,
    onConversationIdChange: (newId) => {
      setConversationId(newId);
    },
    onNewMessage: (msg) => {
      setMessages((prev) => {
        if (msg.id && prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    },
  });

  const isListening = voiceState === 'listening';
  const isSpeaking = voiceState === 'speaking';
  const isUnderstanding = voiceState === 'understanding';
  const isPreparing = voiceState === 'preparing';
  const isInterrupted = voiceState === 'interrupted';
  const isError = voiceState === 'error';

  useEffect(() => {
    if (chatMode === 'chat') {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, chatMode]);

  useEffect(() => {
    api.chat
      .getStatus()
      .then((res) => {
        if (res) {
          setAiStatus(res);
          if (res.geminiModel) setGeminiModel(res.geminiModel);
        }
      })
      .catch(() => {});
  }, []);

  const handleSendText = async (textToSend?: string) => {
    const text = (textToSend != null ? textToSend : input).trim();
    if (!text || isLoading) return;

    setInput('');
    setError(null);
    setFailedMessage(null);

    const userMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: text,
      language,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await api.chat.sendMessage(text, language, conversationId);
      if (res.conversationId && !conversationId) {
        setConversationId(res.conversationId);
      }
      setMessages((prev) => [...prev, res.message]);
      if (res.message?.language && res.message.language !== language) {
        setLanguage(res.message.language as any);
      }
    } catch (err: any) {
      console.error('[chat error]', err);
      setError(err.message || 'Could not send message. Please try again.');
      setFailedMessage(text);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = { geminiModel };
      if (geminiKey) payload.geminiApiKey = geminiKey;

      await api.chat.updateKeys(payload);
      setSaveSuccess(true);
      const updated = await api.chat.getStatus();
      setAiStatus(updated);
      setTimeout(() => {
        setSaveSuccess(false);
        setShowSettings(false);
      }, 1500);
    } catch (err: any) {
      alert('Failed to save settings: ' + err.message);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setConversationId(undefined);
    setError(null);
    setFailedMessage(null);
    stopSpeaking();
    cancelListening();
  };

  const handleMicClick = () => {
    if (isListening) {
      cancelListening();
    } else if (isSpeaking) {
      startListening(); // Interrupts playback and starts listening
    } else {
      startListening();
    }
  };

  // Determine farmer greeting name
  const farmerFirstName = user?.name ? user.name.split(' ')[0] : 'Aunty';
  const greetingText = `Hello ${farmerFirstName}!`;

  const stateTexts = STATE_MESSAGES[language] || STATE_MESSAGES.en;
  const cardsList = showSecondaryCards
    ? (SECONDARY_CARDS[language] || SECONDARY_CARDS.en)
    : (PRIMARY_CARDS[language] || PRIMARY_CARDS.en);

  const getCardIcon = (type: SuggestedCard['type']) => {
    switch (type) {
      case 'crop':
        return <Sprout className="w-5 h-5 text-[#176B3A]" />;
      case 'pest':
        return <Bug className="w-5 h-5 text-[#D32F2F]" />;
      case 'weather':
        return <CloudSun className="w-5 h-5 text-[#1976D2]" />;
      case 'fertilizer':
        return <Coins className="w-5 h-5 text-[#F59E0B]" />;
    }
  };

  const getCardBg = (type: SuggestedCard['type']) => {
    switch (type) {
      case 'crop':
        return 'bg-[#E6F4E8]';
      case 'pest':
        return 'bg-[#FEECEC]';
      case 'weather':
        return 'bg-[#E3F2FD]';
      case 'fertilizer':
        return 'bg-[#FFF8E1]';
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-130px)] bg-[#FFFCF5] text-[#18352B] selection:bg-[#E6F4E8] selection:text-[#176B3A]">
      {/* 1. Welcome and Landscape Section */}
      <div className="relative w-full h-48 sm:h-56 overflow-hidden select-none">
        <img
          src={farmLandscapeImg}
          alt="Agricultural landscape"
          className="w-full h-full object-cover object-bottom"
        />
        {/* Soft gradient wash */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#FFFCF5] via-transparent to-black/5" />

        {/* Welcome Greeting */}
        <div className="absolute top-4 left-5 right-5 z-10">
          <motion.h1
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-[26px] font-black text-[#18352B] tracking-tight flex items-center gap-2"
          >
            <span>{greetingText}</span>
            <span className="inline-block animate-wave origin-[70%_70%]">👋</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xs sm:text-sm text-[#60717A] font-medium mt-0.5"
          >
            How can I help you today?
          </motion.p>
        </div>

        {/* Small settings & clear controls top-right */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowSettings(true)}
            title="Configure Gemini AI Model"
            className="p-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-[#E8EDE8] text-[#60717A] hover:text-[#176B3A] shadow-sm transition"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
          {messages.length > 0 && (
            <button
              type="button"
              onClick={handleClearChat}
              title="Clear Conversation"
              className="p-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-[#E8EDE8] text-[#60717A] hover:text-red-600 shadow-sm transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Voice and Chat Segmented Control & Language Selector */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 -mt-6 relative z-20 px-4">
        {/* Voice vs Chat Switch */}
        <div className="bg-white/95 backdrop-blur-md rounded-full p-1 border border-[#E8EDE8] shadow-md inline-flex items-center gap-1">
          <button
            type="button"
            onClick={() => setChatMode('voice')}
            className={`flex items-center gap-2 py-2 px-6 sm:px-7 rounded-full text-sm font-bold transition-all duration-200 active:scale-95 ${
              chatMode === 'voice'
                ? 'bg-[#176B3A] text-white shadow-sm'
                : 'text-[#18352B] hover:text-[#176B3A]'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>Voice</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setChatMode('chat');
              stopSpeaking();
            }}
            className={`flex items-center gap-2 py-2 px-6 sm:px-7 rounded-full text-sm font-bold transition-all duration-200 active:scale-95 ${
              chatMode === 'chat'
                ? 'bg-[#176B3A] text-white shadow-sm'
                : 'text-[#18352B] hover:text-[#176B3A]'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chat</span>
          </button>
        </div>

        {/* 4 South Indian Languages Selector */}
        <div className="bg-white/95 backdrop-blur-md rounded-full p-1 border border-[#E8EDE8] shadow-md inline-flex items-center gap-0.5">
          {(['kn', 'en', 'ta', 'te'] as SupportedLanguageCode[]).map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => {
                setLanguage(code as any);
                if (user) {
                  api.auth.updateProfile({ language: code }).catch(() => {});
                }
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 ${
                language === code
                  ? 'bg-[#176B3A] text-white shadow-sm'
                  : 'text-[#60717A] hover:text-[#18352B]'
              }`}
            >
              {code === 'kn' ? 'ಕನ್ನಡ' : code === 'ta' ? 'தமிழ்' : code === 'te' ? 'తెలుగు' : 'English'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Voice Interaction Screen vs Text Chat Screen */}
      {chatMode === 'voice' ? (
        <div className="flex flex-col flex-1 pb-4">
          {/* Permission warning banner if microphone blocked */}
          {isPermissionDenied && (
            <div className="mx-4 mt-3 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center gap-2.5 shadow-sm">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>
                Microphone access is blocked in browser settings. Please allow microphone permissions to speak with Raitha Mitra.
              </span>
            </div>
          )}

          {voiceNotice && (
            <div className="mx-4 mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{voiceNotice}</span>
            </div>
          )}

          {/* 3. Main Microphone Interaction (The Visual Centerpiece) */}
          <div className="flex flex-col items-center justify-center pt-7 sm:pt-9 pb-3 relative px-4 select-none">
            {/* Concentric Pulsing Rings */}
            <div className="relative flex items-center justify-center">
              {/* Outer Ring */}
              <motion.div
                animate={
                  isListening
                    ? { scale: [1, 1.14, 1], opacity: [0.65, 0.25, 0.65] }
                    : isSpeaking
                    ? { scale: [1, 1.08, 1], opacity: [0.7, 0.4, 0.7] }
                    : { scale: [1, 1.03, 1], opacity: [0.7, 0.9, 0.7] }
                }
                transition={{
                  duration: isListening ? 1.4 : isSpeaking ? 1.6 : 3.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className={`w-60 h-60 sm:w-68 sm:h-68 rounded-full flex items-center justify-center transition-colors duration-500 ${
                  isListening ? 'bg-red-100/60' : 'bg-[#E6F4E8]/60'
                }`}
              >
                {/* Middle Ring */}
                <motion.div
                  animate={
                    isListening
                      ? { scale: [1, 1.08, 1] }
                      : isSpeaking
                      ? { scale: [1, 1.05, 1] }
                      : {}
                  }
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                  className={`w-48 h-48 sm:w-54 sm:h-54 rounded-full flex items-center justify-center transition-colors duration-300 ${
                    isListening ? 'bg-red-200/70' : 'bg-[#E6F4E8]'
                  }`}
                >
                  {/* Center Microphone Button */}
                  <button
                    type="button"
                    onClick={handleMicClick}
                    disabled={isPreparing || isUnderstanding}
                    aria-label={isListening ? 'Stop recording' : 'Start speaking'}
                    className={`w-36 h-36 sm:w-40 sm:h-40 rounded-full shadow-xl shadow-green-950/20 flex items-center justify-center text-white cursor-pointer active:scale-95 hover:scale-105 transition-all duration-200 focus:outline-none ${
                      isListening
                        ? 'bg-gradient-to-b from-red-500 to-rose-600 shadow-red-900/30 ring-4 ring-red-300/40'
                        : isSpeaking
                        ? 'bg-gradient-to-b from-[#1F8C4C] to-[#105C32] ring-4 ring-[#E6F4E8]'
                        : 'bg-gradient-to-b from-[#1F8C4C] via-[#176B3A] to-[#105C32]'
                    }`}
                  >
                    <Mic className="w-14 h-14 sm:w-16 sm:h-16 text-white stroke-[2.2]" />
                  </button>
                </motion.div>
              </motion.div>

              {/* Voice Gender Control button positioned to the left */}
              <div className="absolute left-0 sm:left-3 top-1/2 -translate-y-8 flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => setVoiceGender(voiceGender === 'female' ? 'male' : 'female')}
                  title="Toggle Assistant Voice Gender (Female / Male)"
                  className="w-11 h-11 rounded-full bg-white border border-[#E8EDE8] shadow-sm flex items-center justify-center transition-all active:scale-95 text-base hover:border-[#176B3A]/40"
                >
                  <span>{voiceGender === 'female' ? '👩' : '👨'}</span>
                </button>
                <span className="text-[10px] text-[#60717A] font-semibold text-center mt-1 leading-tight">
                  {voiceGender === 'female' ? 'Female' : 'Male'}
                  <br />
                  Voice
                </span>
              </div>

              {/* Listen Mode Control button positioned to the right */}
              <div className="absolute right-0 sm:right-3 top-1/2 -translate-y-8 flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => setAutoListen(!autoListen)}
                  title="Toggle Hands-Free Continuous Listen Mode"
                  className={`w-11 h-11 rounded-full bg-white border shadow-sm flex items-center justify-center transition-all active:scale-95 ${
                    autoListen
                      ? 'border-[#176B3A] text-[#176B3A] ring-2 ring-[#E6F4E8]'
                      : 'border-[#E8EDE8] text-[#18352B] hover:border-[#176B3A]/40'
                  }`}
                >
                  <AudioLines
                    className={`w-5 h-5 ${autoListen ? 'text-[#176B3A] animate-pulse' : 'text-[#18352B]'}`}
                  />
                </button>
                <span className="text-[10px] text-[#60717A] font-semibold text-center mt-1 leading-tight">
                  Listen
                  <br />
                  Mode
                </span>
              </div>
            </div>

            {/* Action State Title */}
            <h2 className="text-xl sm:text-[22px] font-bold text-[#18352B] mt-3 sm:mt-4 tracking-tight text-center">
              {isListening
                ? stateTexts.listening
                : isSpeaking
                ? stateTexts.speaking
                : isPreparing
                ? stateTexts.preparing
                : isError
                ? stateTexts.error
                : 'Tap to Speak'}
            </h2>

            {/* Active Speech Provider Badge */}
            <div className="mt-1 flex items-center justify-center gap-1.5 flex-wrap">
              <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-[#E6F4E8] text-[#176B3A] border border-[#176B3A]/20">
                {ttsProvider === 'gemini-tts'
                  ? `✨ Gemini TTS (${voiceName || (voiceGender === 'male' ? 'Charon' : 'Aoede')})`
                  : ttsProvider === 'edge-neural'
                  ? `🎙️ Regional Neural (${voiceName || `${language.toUpperCase()} Neural`})`
                  : ttsProvider === 'browser'
                  ? `🔊 Device Voice (${voiceName || 'Browser'})`
                  : `🎙️ South Indian Voice: ${language.toUpperCase()} (${voiceGender === 'female' ? 'Female' : 'Male'})`}
              </span>
            </div>

            {/* Subtitle Description */}
            <p className="text-xs sm:text-[13px] text-[#60717A] text-center max-w-xs mt-1 leading-relaxed font-medium">
              Ask anything about crops, pests, soil, fertilizers, weather or farming practices
            </p>

            {/* Animated Waveform during Listening or Speaking */}
            {(isListening || isSpeaking) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center gap-1.5 mt-3 py-1.5 px-4 bg-white/90 rounded-full border border-[#E8EDE8] shadow-sm"
              >
                {Array.from({ length: 18 }).map((_, i) => (
                  <motion.span
                    key={i}
                    className={`w-1 rounded-full ${isListening ? 'bg-red-500' : 'bg-[#176B3A]'}`}
                    animate={{
                      height: isListening
                        ? [8, 26, 12, 32, 10][i % 5]
                        : [10, 28, 14, 34, 12][(i + 2) % 5],
                    }}
                    transition={{
                      repeat: Infinity,
                      repeatType: 'reverse',
                      duration: 0.45 + (i % 4) * 0.12,
                      ease: 'easeInOut',
                      delay: i * 0.04,
                    }}
                    style={{ height: 12 }}
                  />
                ))}
              </motion.div>
            )}
          </div>

          {/* Spoken Query / Assistant Answer Card Overlay (if words present) */}
          <AnimatePresence>
            {(interimTranscript || lastFarmerWords || lastAssistantWords) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mx-4 my-2 p-3.5 bg-white rounded-2xl border border-[#E8EDE8] shadow-md space-y-2.5"
              >
                {/* Farmer Spoken Transcript */}
                {(interimTranscript || lastFarmerWords) && (
                  <div className="flex items-start gap-2 text-xs">
                    <div className="w-5 h-5 rounded-full bg-[#176B3A] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      You
                    </div>
                    <p className="text-[#18352B] font-semibold italic text-sm">
                      &ldquo;{interimTranscript || lastFarmerWords}&rdquo;
                    </p>
                  </div>
                )}

                {/* Assistant Answer */}
                {lastAssistantWords && (
                  <div className="pt-2 border-t border-[#E8EDE8] text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <Bot className="w-3.5 h-3.5 text-[#176B3A]" />
                        <span className="font-bold text-[#176B3A]">Raitha Mitra</span>
                        {lastAssistantMessage?.mode === 'gemini' && (
                          <span className="text-[9px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded font-bold border border-purple-200">
                            ✨ Gemini
                          </span>
                        )}
                        {(lastAssistantMessage?.mode === 'local_demo' ||
                          lastAssistantMessage?.mode === 'local') && (
                          <span className="text-[9px] bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded font-bold border border-emerald-200">
                            🌿 ICAR Demo
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        {isSpeaking ? (
                          <button
                            type="button"
                            onClick={stopSpeaking}
                            className="flex items-center gap-1 text-[11px] font-bold text-red-600 px-2 py-0.5 rounded-lg bg-red-50 hover:bg-red-100"
                          >
                            <VolumeX className="w-3 h-3" />
                            <span>Stop</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={repeatResponse}
                            className="flex items-center gap-1 text-[11px] font-bold text-[#176B3A] px-2 py-0.5 rounded-lg bg-[#E6F4E8] hover:bg-mint"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Repeat</span>
                          </button>
                        )}
                      </div>
                    </div>
                    {/* Spoken summary highlight if available */}
                    {lastSpokenSummary && lastSpokenSummary !== lastAssistantWords && (
                      <div className="mb-2 p-2 rounded-xl bg-[#E6F4E8]/80 border border-[#176B3A]/15 text-xs text-[#105C32]">
                        <span className="font-bold text-[10px] uppercase text-[#176B3A] tracking-wider block mb-0.5">
                          🗣️ Spoken Summary:
                        </span>
                        <p className="font-medium leading-relaxed">{lastSpokenSummary}</p>
                      </div>
                    )}
                    <p className="text-[#18352B] leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto">
                      {lastAssistantWords}
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* 4. Suggested Questions Section */}
          <div className="px-4 mt-2">
            {/* Header row */}
            <div className="flex items-center justify-between mb-2.5 px-1">
              <div className="flex items-center gap-1.5 text-sm font-bold text-[#18352B]">
                <Sparkles className="w-4 h-4 text-[#176B3A]" />
                <span>Try asking</span>
              </div>
              <button
                type="button"
                onClick={() => setShowSecondaryCards(!showSecondaryCards)}
                className="text-xs text-[#60717A] hover:text-[#176B3A] font-semibold flex items-center gap-0.5 transition cursor-pointer"
              >
                <span>{showSecondaryCards ? 'Back' : 'See more'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 2x2 Grid of Cards */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              {cardsList.map((card, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => submitQuery(card.query)}
                  className="bg-white rounded-2xl p-3 border border-[#E8EDE8] shadow-sm hover:shadow-md hover:border-[#176B3A]/30 transition-all active:scale-[0.98] flex items-center justify-between gap-2.5 text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-2xl ${getCardBg(
                        card.type
                      )} flex items-center justify-center shrink-0`}
                    >
                      {getCardIcon(card.type)}
                    </div>
                    <span className="text-xs font-bold text-[#18352B] leading-snug whitespace-pre-line">
                      {card.text}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#176B3A] shrink-0 transition" />
                </button>
              ))}
            </div>
          </div>

          {/* 5. Farmer-Friendly Language Banner */}
          <div className="px-4 mt-3.5 mb-2">
            <div className="bg-gradient-to-r from-[#EAF5EC] via-[#F2FAF3] to-[#EAF5EC] rounded-2xl p-3 sm:p-3.5 border border-[#DCECDC] relative overflow-hidden flex items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={farmerBannerImg}
                  alt="Indian Farmer"
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover shrink-0 shadow-sm border border-emerald-200/50"
                />
                <div>
                  <h3 className="text-sm font-bold text-[#18352B] leading-tight">
                    Just speak in your language
                  </h3>
                  <p className="text-xs text-[#60717A] leading-relaxed mt-0.5">
                    Get clear, simple and practical advice for your farm.
                  </p>
                </div>
              </div>
              <Leaf className="w-7 h-7 text-[#2E8B57]/60 shrink-0 hidden sm:block" />
            </div>
          </div>
        </div>
      ) : (
        /* Classic Text Chat Mode */
        <div className="flex-1 flex flex-col px-4 pt-3 pb-4">
          <div className="flex-1 overflow-y-auto space-y-3 p-2 bg-white rounded-2xl border border-[#E8EDE8] shadow-sm mb-3 min-h-[300px] max-h-[500px]">
            {messages.length === 0 ? (
              <div className="my-auto flex flex-col items-center justify-center py-10 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#E6F4E8] flex items-center justify-center text-2xl mb-2">
                  🌱
                </div>
                <h3 className="text-base font-bold text-[#18352B] mb-1">
                  Raitha Mitra AI Farming Chat
                </h3>
                <p className="text-xs text-[#60717A] max-w-sm mb-4">
                  Ask any question about crops, fertilizers, pest diseases, or weather.
                </p>
              </div>
            ) : (
              messages.map((m) => {
                const isUser = m.role === 'user';
                return (
                  <div
                    key={m.id || Math.random()}
                    className={`flex gap-2.5 max-w-[85%] ${
                      isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                        isUser ? 'bg-amber-400 text-[#18352B]' : 'bg-[#176B3A] text-white'
                      }`}
                    >
                      {isUser ? <UserIcon className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                    </div>
                    <div
                      className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                        isUser
                          ? 'bg-[#176B3A] text-white rounded-tr-none font-medium'
                          : 'bg-[#FFFCF5] text-[#18352B] border border-[#E8EDE8] rounded-tl-none'
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                );
              })
            )}

            {isLoading && (
              <div className="flex gap-2.5 mr-auto max-w-[85%] items-center">
                <div className="w-7 h-7 rounded-full bg-[#176B3A] text-white flex items-center justify-center text-xs font-bold shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-[#E8EDE8] shadow-sm text-xs font-bold text-[#176B3A] flex items-center gap-1.5">
                  <span>Raitha Mitra is thinking...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Retry Error Banner */}
          {failedMessage && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-3 flex items-center justify-between gap-2 mb-2 text-red-800 text-xs shadow-sm">
              <div className="flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{error || 'Message failed to send.'}</span>
              </div>
              <button
                type="button"
                onClick={() => handleSendText(failedMessage)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1 rounded-xl text-xs"
              >
                Retry
              </button>
            </div>
          )}

          {/* Input Form with Quick Mic Button */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendText();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask any farming question..."
              className="flex-1 px-4 py-3 rounded-2xl bg-white border border-[#E8EDE8] focus:border-[#176B3A] outline-none text-xs sm:text-sm font-semibold shadow-sm"
            />
            <button
              type="button"
              onClick={() => {
                setChatMode('voice');
                startListening();
              }}
              title="Speak with Voice Assistant"
              className="p-3 rounded-2xl bg-[#E6F4E8] text-[#176B3A] hover:bg-mint font-bold transition shadow-sm active:scale-95"
            >
              <Mic className="w-5 h-5" />
            </button>
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-[#176B3A] hover:bg-[#105C32] text-white p-3 rounded-2xl font-bold flex items-center justify-center transition shadow-sm active:scale-95 disabled:opacity-40"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}

      {/* AI Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E8EDE8]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-700">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[#18352B] text-base">Google Gemini Settings</h3>
                  <p className="text-xs text-[#60717A]">
                    Active: {aiStatus?.provider || 'Local Demo Mode'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveKeys} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#18352B] mb-1">
                  Google Gemini Model
                </label>
                <input
                  type="text"
                  value={geminiModel}
                  onChange={(e) => setGeminiModel(e.target.value)}
                  placeholder="gemini-3.5-flash"
                  className="w-full px-3 py-2 rounded-xl border border-[#E8EDE8] focus:border-[#176B3A] outline-none font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-[#18352B] mb-1">
                  Google Gemini API Key
                </label>
                <input
                  type="password"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-3 py-2 rounded-xl border border-[#E8EDE8] focus:border-[#176B3A] outline-none font-mono text-xs"
                />
                <p className="text-[10px] text-[#60717A] mt-0.5">
                  {aiStatus?.hasGeminiKey
                    ? '✅ Gemini API key is currently saved on server.'
                    : 'Get your key at aistudio.google.com/apikey.'}
                </p>
              </div>

              <div>
                <label className="block font-bold text-[#18352B] mb-1">
                  Text-to-Speech (TTS) Voice Engine
                </label>
                <select
                  value={providerChoice}
                  onChange={(e) => setProviderChoice(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8EDE8] focus:border-[#176B3A] outline-none text-xs bg-white"
                >
                  <option value="auto">Auto (Best Quality: Gemini TTS → Regional Neural)</option>
                  <option value="edge-neural">Regional Neural Voice (Karnataka / Tamil / Telugu)</option>
                  <option value="gemini-tts">Google Gemini 3.8 Flash TTS</option>
                  <option value="browser">Device Browser Voice (Offline Fallback)</option>
                </select>
                <p className="text-[10px] text-[#60717A] mt-0.5">
                  Regional Neural provides fluent, authentic South Indian pronunciation with zero daily rate limits.
                </p>
              </div>

              <div>
                <label className="block font-bold text-[#18352B] mb-1">
                  Assistant Voice Gender
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setVoiceGender('female')}
                    className={`flex-1 py-2 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition ${
                      voiceGender === 'female'
                        ? 'bg-[#176B3A] text-white border-[#176B3A]'
                        : 'bg-white text-gray-700 border-[#E8EDE8]'
                    }`}
                  >
                    <span>👩 Female</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setVoiceGender('male')}
                    className={`flex-1 py-2 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition ${
                      voiceGender === 'male'
                        ? 'bg-[#176B3A] text-white border-[#176B3A]'
                        : 'bg-white text-gray-700 border-[#E8EDE8]'
                    }`}
                  >
                    <span>👨 Male</span>
                  </button>
                </div>
              </div>

              {saveSuccess && (
                <div className="p-2.5 rounded-xl bg-green-50 text-green-700 border border-green-200 font-bold flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>Configuration saved successfully!</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#E8EDE8] font-bold text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#176B3A] hover:bg-[#105C32] text-white font-bold transition shadow-sm"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};