import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Volume2, VolumeX, Globe, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useTranslation } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { speechService, SupportedLanguageCode } from '../services/speechService';

export const SplashPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, language, currentLanguageOption } = useTranslation();
  const { isAuthenticated } = useAuth();
  const shouldReduceMotion = useReducedMotion();

  const [imageError, setImageError] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechNotice, setSpeechNotice] = useState<string | null>(null);

  // Authenticated users auto-redirect quickly (under 2 seconds)
  useEffect(() => {
    if (isAuthenticated) {
      const timer = setTimeout(() => {
        navigate('/home', { replace: true });
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, navigate]);

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

  return (
    <main className="fixed inset-0 z-50 w-full h-full min-h-dvh bg-bg dark:bg-dark-bg flex flex-col justify-between pt-[max(1rem,env(safe-area-inset-top,0px))] pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] px-6 overflow-y-auto selection:bg-brand-50 selection:text-brand-800">
      {/* Top Header: Brand badge + Language button */}
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm mx-auto flex items-center justify-between pt-2 z-10"
      >
        <div className="flex items-center gap-2 py-1 px-3 rounded-full bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border shadow-xs">
          <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
          <span className="text-[12px] font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            Krushi Sathi
          </span>
        </div>

        <button
          onClick={() => {
            speechService.stopSpeaking();
            navigate('/language');
          }}
          className="flex items-center gap-1.5 min-h-[38px] py-1.5 px-3 rounded-full bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-[12px] font-semibold text-gray-700 dark:text-gray-300 shadow-xs hover:border-brand-500 transition-all active:scale-95"
          aria-label="Change language"
        >
          <Globe className="w-3.5 h-3.5 text-brand-600" />
          <span>{currentLanguageOption.nativeLabel}</span>
        </button>
      </motion.div>

      {/* Center: Minimal Logo Reveal + Title */}
      <div className="my-auto flex flex-col items-center justify-center text-center py-8 z-10 max-w-sm mx-auto w-full">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="mb-6"
        >
          {!imageError ? (
            <div className="w-24 h-24 rounded-4xl bg-brand-700 p-4 shadow-card flex items-center justify-center mx-auto">
              <picture className="w-full h-full flex items-center justify-center">
                <source srcSet="/krushi-sathi-logo.webp" type="image/webp" />
                <img
                  src="/krushi-sathi-logo.png"
                  alt="Krushi Sathi Logo"
                  width="72"
                  height="72"
                  className="w-full h-full object-contain brightness-0 invert"
                  loading="eager"
                  onError={() => setImageError(true)}
                />
              </picture>
            </div>
          ) : (
            <div className="w-24 h-24 rounded-4xl bg-brand-700 text-white flex items-center justify-center mx-auto shadow-card font-extrabold text-2xl">
              KS
            </div>
          )}
        </motion.div>

        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="space-y-2"
        >
          <span className="inline-flex items-center gap-1.5 py-0.5 px-3 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-[11px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-brand-600" />
            {t('aiCompanionBadge')}
          </span>

          <h2 className="text-display font-extrabold text-gray-900 dark:text-gray-100 tracking-tight leading-tight">
            {t('taglineSub')}
          </h2>

          <p className="text-[14px] text-gray-500 dark:text-gray-400 font-medium max-w-xs mx-auto leading-relaxed">
            {t('welcomeSupportText')}
          </p>
        </motion.div>
      </div>

      {/* Bottom Action Area */}
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.2 }}
        className="w-full max-w-sm mx-auto space-y-3 z-10"
      >
        <Button
          onClick={handleStart}
          size="lg"
          fullWidth
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          {t('getStarted')}
        </Button>

        <div className="flex items-center justify-center">
          <button
            onClick={handleToggleSpeech}
            type="button"
            className={[
              'inline-flex items-center justify-center gap-2 min-h-[42px] py-2 px-4 rounded-full text-xs font-semibold transition-all active:scale-95',
              isSpeaking
                ? 'bg-brand-700 text-white shadow-xs'
                : 'bg-white dark:bg-dark-surface text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-dark-border hover:border-brand-500',
            ].join(' ')}
            aria-label={isSpeaking ? t('stopIntroduction') : t('hearIntroduction')}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-4 h-4" />
                <span>{t('stopIntroduction')}</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-brand-600" />
                <span>{t('hearIntroduction')}</span>
              </>
            )}
          </button>
        </div>

        {speechNotice && (
          <div
            className="text-center text-[12px] text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800/40 rounded-2xl py-2 px-3 font-medium"
            role="status"
          >
            {speechNotice}
          </div>
        )}
      </motion.div>
    </main>
  );
};

export default SplashPage;
