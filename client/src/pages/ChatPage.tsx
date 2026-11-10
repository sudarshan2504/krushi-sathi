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
import farmLandscapeImg from '../assets/farm_landscape.webp';
import { StickyBottomBar } from '../components/ui/StickyBottomBar';
import { VoiceConversationView } from '../components/chat/VoiceConversationView';

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
  const { language, setLanguage, t } = useTranslation();
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
  const isGeminiActive = Boolean(aiStatus?.hasGeminiKey);

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

    const streamingTempId = `stream-assistant-${Date.now()}`;
    let streamText = '';

    try {
      const res = await api.chat.sendMessage(text, language, conversationId, {
        onChunk: (chunk: string) => {
          streamText += chunk;
          setIsLoading(false);
          setMessages((prev) => {
            const index = prev.findIndex((m) => m.id === streamingTempId);
            if (index >= 0) {
              const updated = [...prev];
              updated[index] = { ...updated[index], content: streamText };
              return updated;
            } else {
              return [
                ...prev,
                {
                  id: streamingTempId,
                  role: 'assistant',
                  content: streamText,
                  language,
                  createdAt: new Date().toISOString(),
                },
              ];
            }
          });
        },
      });

      if (res.conversationId && !conversationId) {
        setConversationId(res.conversationId);
      }

      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== streamingTempId);
        return [...filtered, res.message];
      });

      if (res.message?.language && res.message.language !== language) {
        setLanguage(res.message.language as any);
      }
    } catch (err: any) {
      console.error('[chat error]', err);
      setMessages((prev) => prev.filter((m) => m.id !== streamingTempId || m.content.trim().length > 0));
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
    <div className="flex flex-col min-h-[calc(100vh-130px)] bg-cream-50 dark:bg-dark-bg text-gray-900 dark:text-gray-50">
      {/* 1. Welcome and Landscape Section */}
      <div className="relative w-full h-44 sm:h-52 overflow-hidden select-none">
        <img
          src={farmLandscapeImg}
          alt="Agricultural landscape"
          width="800"
          height="208"
          className="w-full h-full object-cover object-bottom"
          loading="eager"
        />
        {/* Soft gradient wash */}
        <div className="absolute inset-0 bg-gradient-to-t from-cream-50 dark:from-dark-bg via-transparent to-black/10" />

        {/* Welcome Greeting */}
        <div className="absolute top-4 left-5 right-5 z-10">
          <motion.h1
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-[26px] font-black text-gray-900 dark:text-gray-50 tracking-tight flex items-center gap-2"
          >
            <span>{greetingText}</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-medium mt-0.5"
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
            className="p-2 rounded-full bg-white/90 dark:bg-dark-surface/90 backdrop-blur-sm border border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-300 hover:text-brand-600 shadow-sm transition"
          >
            <Settings className="w-4 h-4" />
          </button>
          {messages.length > 0 && (
            <button
              type="button"
              onClick={handleClearChat}
              title="Clear Conversation"
              className="p-2 rounded-full bg-white/90 dark:bg-dark-surface/90 backdrop-blur-sm border border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-300 hover:text-red-600 shadow-sm transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Voice and Chat Underlined Tabs */}
      <div className="border-b border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface px-4">
        <div className="max-w-md mx-auto flex items-center justify-center gap-10">
          <button
            type="button"
            onClick={() => setChatMode('voice')}
            className={`min-h-[48px] py-3 px-3 text-sm flex items-center gap-2 relative transition-all cursor-pointer ${
              chatMode === 'voice'
                ? 'text-brand-700 dark:text-brand-400 font-bold'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 font-medium'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>{t('voiceTab')}</span>
            {chatMode === 'voice' && (
              <motion.div
                layoutId="chatModeUnderline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 dark:bg-brand-400"
              />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setChatMode('chat');
              stopSpeaking();
            }}
            className={`min-h-[48px] py-3 px-3 text-sm flex items-center gap-2 relative transition-all cursor-pointer ${
              chatMode === 'chat'
                ? 'text-brand-700 dark:text-brand-400 font-bold'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 font-medium'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>{t('chatTab')}</span>
            {chatMode === 'chat' && (
              <motion.div
                layoutId="chatModeUnderline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 dark:bg-brand-400"
              />
            )}
          </button>
        </div>
      </div>

      {/* Main Content: Voice Interaction Screen vs Text Chat Screen */}
      {chatMode === 'voice' ? (
        <div className="flex-1 flex flex-col min-h-[calc(100dvh-320px)] pb-2">
          <VoiceConversationView
            state={voiceState}
            interimTranscript={interimTranscript}
            lastFarmerWords={lastFarmerWords}
            lastAssistantWords={lastAssistantWords}
            lastAssistantMessage={lastAssistantMessage}
            lastSpokenSummary={lastSpokenSummary}
            language={language}
            onLanguageChange={(code) => {
              setLanguage(code);
              if (user) {
                api.auth.updateProfile({ language: code }).catch(() => {});
              }
            }}
            voiceGender={voiceGender}
            onToggleVoiceGender={() => setVoiceGender(voiceGender === 'female' ? 'male' : 'female')}
            ttsProvider={ttsProvider}
            voiceName={voiceName}
            autoListen={autoListen}
            onToggleAutoListen={() => setAutoListen(!autoListen)}
            errorMessage={voiceErrorMessage}
            isPermissionDenied={isPermissionDenied}
            voiceNotice={voiceNotice}
            onStartListening={startListening}
            onCancelListening={cancelListening}
            onStopSpeaking={stopSpeaking}
            onRepeatResponse={repeatResponse}
            onSwitchToTextChat={() => setChatMode('chat')}
            onQuickQuestion={(q) => submitQuery(q)}
            isGeminiActive={isGeminiActive}
            geminiModel={geminiModel}
          />
        </div>
      ) : (
        /* Classic Text Chat Mode */
        <div className="flex-1 flex flex-col px-3 sm:px-4 pt-2 pb-24">
          <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-white dark:bg-dark-surface rounded-3xl border border-gray-200 dark:border-dark-border shadow-card mb-2 h-[calc(100dvh-310px)] md:h-[calc(100dvh-340px)]">
            {messages.length === 0 ? (
              <div className="my-auto flex flex-col items-center justify-center py-10 text-center">
                <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-dark-elevated flex items-center justify-center mb-2">
                  <Sprout className="w-7 h-7 text-brand-600 dark:text-brand-400" />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">
                  Raitha Mitra AI Farming Chat
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mb-4">
                  Ask any question about crops, fertilizers, pest diseases, or weather.
                </p>
              </div>
            ) : (
              messages.map((m) => {
                const isUser = m.role === 'user';
                return (
                  <div
                    key={m.id || Math.random()}
                    className={`flex gap-2.5 max-w-[88%] sm:max-w-[85%] ${
                      isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                        isUser ? 'bg-amber-400 text-gray-900' : 'bg-brand-700 text-white'
                      }`}
                    >
                      {isUser ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div
                      className={`p-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-xs ${
                        isUser
                          ? 'bg-brand-700 text-white rounded-tr-none font-medium'
                          : 'bg-gray-50 dark:bg-dark-elevated text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-dark-border rounded-tl-none'
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
                <div className="w-8 h-8 rounded-full bg-brand-700 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-gray-50 dark:bg-dark-elevated p-3 rounded-2xl rounded-tl-none border border-gray-200 dark:border-dark-border shadow-xs text-xs font-bold text-brand-700 dark:text-brand-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
                  <span>Raitha Mitra is thinking...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none px-1">
            {cardsList.map((card, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendText(card.query)}
                className="shrink-0 px-3 py-1.5 rounded-full bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-xs font-semibold text-gray-700 dark:text-gray-300 hover:border-brand-500 hover:text-brand-700 dark:hover:text-brand-400 transition shadow-xs flex items-center gap-1.5"
              >
                {getCardIcon(card.type)}
                <span>{card.text.replace('\n', ' ')}</span>
              </button>
            ))}
          </div>

          {/* Retry Error Banner */}
          {failedMessage && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-2xl p-3 flex items-center justify-between gap-2 mb-2 text-red-800 dark:text-red-300 text-xs shadow-sm">
              <div className="flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{error || 'Message failed to send.'}</span>
              </div>
              <button
                type="button"
                onClick={() => handleSendText(failedMessage)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs min-h-[36px]"
              >
                Retry
              </button>
            </div>
          )}

          {/* Input Form with Quick Mic Button in StickyBottomBar */}
          <StickyBottomBar>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendText();
              }}
              className="flex items-center gap-2 w-full"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask any farming question..."
                autoComplete="off"
                className="flex-1 px-4 py-2.5 rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-gray-900 dark:text-gray-100 focus:border-brand-600 outline-none text-sm font-semibold shadow-inner min-h-[44px]"
              />
              <button
                type="button"
                onClick={() => {
                  setChatMode('voice');
                  startListening();
                }}
                title="Speak with Voice Assistant"
                aria-label="Speak with Voice Assistant"
                className={`p-2.5 min-w-[44px] min-h-[44px] rounded-2xl bg-brand-50 dark:bg-dark-elevated text-brand-700 dark:text-brand-300 hover:bg-brand-100 font-bold transition shadow-sm active:scale-95 flex items-center justify-center cursor-pointer shrink-0 touch-target ${
                  isListening ? 'ring-2 ring-red-400 animate-pulse bg-red-50 text-red-600' : ''
                }`}
              >
                <Mic className="w-5 h-5" />
              </button>
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                aria-label="Send message"
                className="bg-brand-600 hover:bg-brand-700 text-white p-2.5 min-w-[44px] min-h-[44px] rounded-2xl font-bold flex items-center justify-center transition shadow-sm active:scale-95 disabled:opacity-40 cursor-pointer shrink-0 touch-target"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </StickyBottomBar>
        </div>
      )}

      {/* AI Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-surface rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-dark-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-700">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base">Google Gemini Settings</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Active: {aiStatus?.provider || 'Local Demo Mode'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-elevated"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveKeys} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-900 dark:text-gray-100 mb-1">
                  Google Gemini Model
                </label>
                <input
                  type="text"
                  value={geminiModel}
                  onChange={(e) => setGeminiModel(e.target.value)}
                  placeholder="gemini-3.5-flash"
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-gray-900 dark:text-gray-100 focus:border-brand-600 outline-none font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-900 dark:text-gray-100 mb-1">
                  Google Gemini API Key
                </label>
                <input
                  type="password"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-gray-900 dark:text-gray-100 focus:border-brand-600 outline-none font-mono text-xs"
                />
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                  {aiStatus?.hasGeminiKey
                    ? 'Gemini API key is currently saved on server.'
                    : 'Get your key at aistudio.google.com/apikey.'}
                </p>
              </div>

              <div>
                <label className="block font-bold text-gray-900 dark:text-gray-100 mb-1">
                  Text-to-Speech (TTS) Voice Engine
                </label>
                <select
                  value={providerChoice}
                  onChange={(e) => setProviderChoice(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-gray-900 dark:text-gray-100 focus:border-brand-600 outline-none text-xs"
                >
                  <option value="auto">Auto (Best Quality: Gemini TTS → Regional Neural)</option>
                  <option value="edge-neural">Regional Neural Voice (Karnataka / Tamil / Telugu)</option>
                  <option value="gemini-tts">Google Gemini 3.8 Flash TTS</option>
                  <option value="browser">Device Browser Voice (Offline Fallback)</option>
                </select>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                  Regional Neural provides fluent, authentic South Indian pronunciation with zero daily rate limits.
                </p>
              </div>

              <div>
                <label className="block font-bold text-gray-900 dark:text-gray-100 mb-1">
                  Assistant Voice Gender
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setVoiceGender('female')}
                    className={`flex-1 py-2 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition ${
                      voiceGender === 'female'
                        ? 'bg-brand-600 text-white border-brand-600'
                        : 'bg-white dark:bg-dark-surface text-gray-700 dark:text-gray-300 border-gray-200 dark:border-dark-border'
                    }`}
                  >
                    <span>Female</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setVoiceGender('male')}
                    className={`flex-1 py-2 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition ${
                      voiceGender === 'male'
                        ? 'bg-brand-600 text-white border-brand-600'
                        : 'bg-white dark:bg-dark-surface text-gray-700 dark:text-gray-300 border-gray-200 dark:border-dark-border'
                    }`}
                  >
                    <span>Male</span>
                  </button>
                </div>
              </div>

              {saveSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>Configuration saved successfully!</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-elevated transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold transition shadow-sm"
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