import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  Volume2,
  VolumeX,
  Sprout,
  CloudSun,
  Bug,
  TrendingUp,
  Cpu,
} from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { speechService, SupportedLanguageCode } from '../services/speechService';
import { BrandLogo } from '../components/ui/BrandLogo';
import { WhitePill } from '../components/ui/WhitePill';
import { LanguagePill } from '../components/ui/LanguagePill';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { OutlineButton } from '../components/ui/OutlineButton';
import { WaveFooter } from '../components/ui/WaveFooter';
import { SceneBackground } from '../components/ui/SceneBackground';

export const SplashPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const { isAuthenticated } = useAuth();
  const shouldReduceMotion = useReducedMotion();

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechNotice, setSpeechNotice] = useState<string | null>(null);

  // Authenticated users auto-redirect smoothly to /home
  useEffect(() => {
    if (isAuthenticated) {
      const timer = setTimeout(() => {
        navigate('/home', { replace: true });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => {
      speechService.stopSpeaking();
    };
  }, []);

  const handleGetStarted = () => {
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
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => {
        setIsSpeaking(false);
        setSpeechNotice(t('speechNotSupported'));
      },
      onInterrupted: () => setIsSpeaking(false),
    });

    if (!started) {
      setIsSpeaking(false);
      setSpeechNotice(t('speechNotSupported'));
    }
  };

  // 4 Feature Highlights for the Frosted Cards
  const featureCards = [
    { key: 'cropAdvice', icon: Sprout, label: t('cropAdvice') },
    { key: 'weatherAlerts', icon: CloudSun, label: t('weatherAlerts') },
    { key: 'pestDetection', icon: Bug, label: t('pestDetection') },
    { key: 'marketPrices', icon: TrendingUp, label: t('marketPrices') },
  ];

  return (
    <SceneBackground variant="splash">
      {/* 1. Top Action Bar (2.6-6.1% screen height) */}
      <div className="relative z-30 pt-5 px-5 flex items-center justify-between">
          {/* Left Pill: Sprout + "Krushi Sathi" */}
          <WhitePill className="py-1 px-3 text-[11px] font-bold gap-1.5 shadow-xs">
            <Sprout className="w-3.5 h-3.5 text-forest shrink-0" />
            <span>Krushi Sathi</span>
          </WhitePill>

          {/* Right Pill: Language Dropdown */}
          <LanguagePill variant="full" />
        </div>

        {/* 4. Branding & Titles Region (9.6-45% screen height) */}
        <div className="relative z-10 px-5 pt-3 flex flex-col items-center text-center">
          {/* Logo Mark + Wordmark */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="mb-3"
          >
            <BrandLogo size="lg" variant="emblem" />
          </motion.div>

          <h2 className="text-xl font-bold tracking-tight text-forest-dark -mt-1 mb-2">
            Krushi Sathi
          </h2>

          {/* AI Farming Companion Badge (24.5-27.6%) */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F8EE] border border-[#BBF7D0] text-[#144D29] text-[10px] font-extrabold uppercase tracking-widest shadow-xs mb-3">
            <Cpu className="w-3 h-3 text-[#228B22] shrink-0" />
            <span>{t('aiCompanionBadge')}</span>
          </div>

          {/* Staggered Headline (29.4-37.9%) */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-center"
          >
            <h1 className="text-3xl sm:text-[34px] font-extrabold tracking-tight leading-[1.15]">
              <span className="text-[#0D2B18] block">
                {t('betterFarming')}
              </span>
              <span className="relative inline-block text-[#228B22]">
                {t('brighterTomorrow')}
                {/* Hand-drawn green underline swoosh */}
                <svg
                  className="absolute -bottom-1.5 left-0 w-full h-2 overflow-visible"
                  viewBox="0 0 120 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M 2 5 Q 60 9 118 3"
                    stroke="#228B22"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>
            <p className="text-xs sm:text-[13px] text-zinc-600 font-medium mt-2 max-w-[280px] mx-auto">
              {t('welcomeSupportText')}
            </p>
          </motion.div>

          {/* 5. Four Frosted-Glass Cards (45-53% screen height) */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="grid grid-cols-4 gap-2 w-full max-w-sm mt-4 px-1"
          >
            {featureCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.key}
                  className="bg-white/80 backdrop-blur-md border border-white/70 rounded-2xl p-2.5 flex flex-col items-center justify-center text-center shadow-[0_2px_8px_rgba(0,0,0,0.04)] min-h-[78px]"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-forest flex items-center justify-center mb-1">
                    <Icon className="w-4 h-4 text-[#228B22] stroke-[2.2]" />
                  </div>
                  <span className="text-[10px] font-bold text-[#0D2B18] leading-tight line-clamp-2">
                    {card.label}
                  </span>
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* 6. Photo zone (54-78%) is preserved clear for the farmer and sunrise */}

        {/* 7. Carousel Dots (78%) & Wave Footer with CTAs (80-96%) */}
        <div className="relative z-10 w-full mt-auto">
          {/* 3 Carousel Dots */}
          <div className="flex items-center justify-center gap-1.5 pb-2">
            <div className="w-5 h-1.5 rounded-full bg-white shadow-xs" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
          </div>

          {/* Wave Footer */}
          <WaveFooter heightClass="min-h-[160px] pb-6 pt-1">
            {/* "Get Started ->" PrimaryButton */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-[84%] max-w-[320px]"
            >
              <PrimaryButton
                size="lg"
                fullWidth
                onClick={handleGetStarted}
                iconRight={<ArrowRight className="w-4 h-4 stroke-[2.5]" />}
                className="shadow-[0_8px_20px_rgba(20,77,41,0.45)]"
              >
                {t('getStarted')}
              </PrimaryButton>
            </motion.div>

            {/* "Hear Introduction" OutlineButton */}
            <OutlineButton
              size="md"
              theme="white"
              onClick={handleToggleSpeech}
              icon={
                isSpeaking ? (
                  <VolumeX className="w-4 h-4 text-emerald-300 animate-pulse" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )
              }
              className="w-[72%] max-w-[270px] text-xs font-semibold py-2.5"
            >
              {isSpeaking ? t('stopIntroduction') : t('hearIntroduction')}
            </OutlineButton>

            {speechNotice && (
              <p className="text-[11px] text-emerald-200 mt-1 text-center">
                {speechNotice}
              </p>
            )}
          </WaveFooter>
        </div>
    </SceneBackground>
  );
};
