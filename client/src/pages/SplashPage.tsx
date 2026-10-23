import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Volume2, VolumeX, Globe, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useTranslation } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { speechService, SupportedLanguageCode } from '../services/speechService';
import krushiLogo from '../assets/krushi-sathi-logo.png';

export const SplashPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, language, currentLanguageOption } = useTranslation();
  const { isAuthenticated } = useAuth();
  const shouldReduceMotion = useReducedMotion();

  const [imageError, setImageError] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechNotice, setSpeechNotice] = useState<string | null>(null);

  // Returning authenticated users are immediately redirected to the dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Clean up any ongoing speech synthesis on unmount
  useEffect(() => {
    return () => {
      speechService.stopSpeaking();
    };
  }, []);

  const handleStart = () => {
    speechService.stopSpeaking();
    if (isAuthenticated) {
      navigate('/home');
    } else {
      navigate('/language');
    }
  };

  const handleToggleSpeech = () => {
    setSpeechNotice(null);

    if (isSpeaking) {
      speechService.stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    if (!speechService.isSynthesisSupported()) {
      setSpeechNotice(t('speechNotSupported'));
      return;
    }

    const welcomeText = t('introAudioWelcome');
    const langCode = (['en', 'kn', 'ta', 'te'].includes(language)
      ? language
      : 'en') as SupportedLanguageCode;

    setIsSpeaking(true);

    const started = speechService.speak(welcomeText, langCode, {
      onStart: () => {
        setIsSpeaking(true);
      },
      onEnd: () => {
        setIsSpeaking(false);
      },
      onError: () => {
        setIsSpeaking(false);
        setSpeechNotice(t('speechNotSupported'));
      },
      onInterrupted: () => {
        setIsSpeaking(false);
      },
    });

    if (!started) {
      setIsSpeaking(false);
      setSpeechNotice(t('speechNotSupported'));
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#FFFDF7] via-[#FFF9EC] to-[#EBF5ED] flex flex-col justify-between p-4 sm:p-6 overflow-x-hidden selection:bg-mint selection:text-forest">
      {/* Ambient background glows for farm sunrise warmth */}
      <div className="absolute -top-16 -right-16 w-80 h-80 rounded-full bg-harvest/25 blur-3xl opacity-70 pointer-events-none" />
      <div className="absolute top-1/3 -left-20 w-80 h-80 rounded-full bg-mint/50 blur-3xl opacity-80 pointer-events-none" />
      <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-leaf/10 blur-3xl opacity-60 pointer-events-none" />

      {/* Top Header: Brand status and Quick Language Switcher */}
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-xl mx-auto flex items-center justify-between pt-2 z-20"
      >
        <div className="flex items-center gap-2 py-1 px-3 rounded-full bg-white/90 border border-forest/15 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-leaf-light animate-pulse" />
          <span className="text-xs font-bold text-forest tracking-wide">
            Krushi Sathi
          </span>
        </div>

        <button
          onClick={() => {
            speechService.stopSpeaking();
            navigate('/language');
          }}
          className="flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-white/90 border border-forest/15 text-xs font-semibold text-dark-text shadow-xs hover:border-forest/40 hover:bg-white transition-all active:scale-95"
          aria-label="Change language"
        >
          <Globe className="w-3.5 h-3.5 text-forest" />
          <span>{currentLanguageOption.nativeLabel}</span>
        </button>
      </motion.div>

      {/* Middle Section: Hero Logo Artwork + Welcome Message */}
      <div className="relative my-auto flex flex-col items-center justify-center z-10 py-4 w-full max-w-xl mx-auto text-center">
        {/* Subtle decorative floating leaves around artwork */}
        {!shouldReduceMotion && (
          <>
            <motion.div
              animate={{
                y: [-6, 8, -6],
                rotate: [0, 15, 0],
              }}
              transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-2 left-6 text-xl pointer-events-none drop-shadow-sm select-none opacity-80 hidden xs:block"
              aria-hidden="true"
            >
              🍃
            </motion.div>
            <motion.div
              animate={{
                y: [8, -8, 8],
                rotate: [10, -10, 10],
              }}
              transition={{ duration: 6.2, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
              className="absolute top-10 right-6 text-lg pointer-events-none drop-shadow-sm select-none opacity-80 hidden xs:block"
              aria-hidden="true"
            >
              🌾
            </motion.div>
          </>
        )}

        {/* Hero Artwork Container with sunrise halo */}
        <div className="relative flex items-center justify-center w-full px-2">
          {/* Gentle background sunrise glow */}
          <div className="absolute w-56 h-56 sm:w-72 sm:h-72 rounded-full bg-gradient-to-tr from-harvest/25 via-mint/40 to-forest/10 blur-2xl pointer-events-none" />

          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.94, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full flex justify-center"
          >
            {!imageError ? (
              <img
                src={krushiLogo}
                alt="Krushi Sathi — Your Farming Companion"
                className="w-full max-w-[310px] xs:max-w-[350px] sm:max-w-[410px] md:max-w-[450px] h-auto object-contain mx-auto filter drop-shadow-[0_12px_24px_rgba(23,107,58,0.12)] transition-transform duration-300 hover:scale-[1.01]"
                loading="eager"
                onError={() => setImageError(true)}
              />
            ) : (
              /* High quality graceful fallback */
              <div className="p-8 rounded-3xl bg-white border border-forest/15 shadow-card text-center max-w-sm mx-auto">
                <span className="text-5xl mb-3 block">🌾</span>
                <h1 className="text-3xl font-extrabold text-forest tracking-tight">
                  Krushi Sathi
                </h1>
                <p className="text-sm font-semibold text-dark-muted mt-1">
                  Your Farming Companion
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Welcome Message */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-3 sm:mt-5 space-y-2 px-4"
        >
          {/* Small pill badge */}
          <span className="inline-flex items-center gap-1.5 py-1 px-3.5 rounded-full bg-white/90 border border-forest/15 text-forest text-[11px] sm:text-xs font-bold uppercase tracking-wider shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-harvest-dark" />
            {t('aiCompanionBadge')}
          </span>

          {/* Heading */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#18352B] tracking-tight max-w-md mx-auto leading-tight">
            {t('taglineSub')}
          </h2>

          {/* Supporting Text */}
          <p className="text-sm sm:text-base text-dark-muted font-medium max-w-xs sm:max-w-sm mx-auto leading-relaxed">
            {t('welcomeSupportText')}
          </p>
        </motion.div>
      </div>

      {/* Bottom Action Section */}
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="w-full max-w-sm mx-auto space-y-3 pt-2 pb-3 z-20"
      >
        {/* Large Forest-Green Get Started Button */}
        <Button
          onClick={handleStart}
          size="lg"
          fullWidth
          className="shadow-xl shadow-forest/25 text-base sm:text-lg font-bold py-4 rounded-2xl sm:rounded-3xl flex items-center justify-center gap-2 group transition-all"
        >
          <span>{t('getStarted')}</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
        </Button>

        {/* Small Secondary Hear Introduction Button */}
        <div className="flex items-center justify-center">
          <button
            onClick={handleToggleSpeech}
            type="button"
            className={`inline-flex items-center gap-2 py-2 px-4 rounded-full text-xs font-semibold transition-all duration-200 active:scale-95 ${
              isSpeaking
                ? 'bg-forest text-white shadow-md shadow-forest/20 ring-2 ring-forest/30'
                : 'bg-white/90 hover:bg-white text-forest border border-forest/20 shadow-xs hover:border-forest/40'
            }`}
            aria-label={isSpeaking ? t('stopIntroduction') : t('hearIntroduction')}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-4 h-4 text-harvest" />
                <span>{t('stopIntroduction')}</span>
                <span className="flex gap-0.5 items-end h-3 ml-1" aria-hidden="true">
                  <span className="w-0.5 h-full bg-white animate-bounce" />
                  <span className="w-0.5 h-2 bg-white animate-bounce [animation-delay:0.15s]" />
                  <span className="w-0.5 h-2.5 bg-white animate-bounce [animation-delay:0.3s]" />
                </span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-forest" />
                <span>{t('hearIntroduction')}</span>
              </>
            )}
          </button>
        </div>

        {/* Accessible fallback notification if speech audio is unavailable */}
        {speechNotice && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-[11px] text-amber-900 bg-amber-50/90 border border-amber-200/80 rounded-xl py-1.5 px-3 font-medium shadow-xs"
            role="status"
          >
            {speechNotice}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
