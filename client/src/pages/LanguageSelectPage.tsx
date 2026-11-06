import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useTranslation } from '../context/LanguageContext';
import { LanguageCode } from '../i18n';

export const LanguageSelectPage: React.FC = () => {
  const navigate = useNavigate();
  const { language, setLanguage, languages, t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();

  const handleContinue = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-dvh bg-bg dark:bg-dark-bg flex flex-col justify-between pt-[max(1.5rem,env(safe-area-inset-top,0px))] pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] px-6 max-w-sm mx-auto w-full">
      {/* Header */}
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-4 text-center"
      >
        <span className="w-10 h-1 rounded-full bg-brand-600/30 inline-block mb-4" />
        <h1 className="text-display font-extrabold text-gray-900 dark:text-gray-100 tracking-tight leading-tight">
          {t('chooseLanguage')}
        </h1>
        <p className="text-[14px] text-gray-500 dark:text-gray-400 font-medium mt-1.5 max-w-xs mx-auto leading-relaxed">
          {t('selectLanguageComfortable')}
        </p>
      </motion.div>

      {/* 2x2 Language Cards Grid */}
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: shouldReduceMotion ? 0 : 0.05, duration: 0.25 }}
        className="grid grid-cols-2 gap-3.5 my-auto py-6"
      >
        {languages.map((lang, index) => {
          const isSelected = language === lang.code;

          return (
            <motion.button
              key={lang.code}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: shouldReduceMotion ? 0 : 0.04 * index }}
              onClick={() => setLanguage(lang.code as LanguageCode)}
              className={[
                'relative flex flex-col items-center justify-center p-5 min-h-[140px] rounded-4xl border-2 transition-all duration-150 select-none text-center',
                isSelected
                  ? 'border-brand-700 bg-brand-50/60 dark:bg-brand-900/25 dark:border-brand-500 shadow-sm'
                  : 'border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface hover:border-brand-300 dark:hover:border-brand-700 shadow-xs',
              ].join(' ')}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-brand-700 dark:bg-brand-600 text-white flex items-center justify-center shadow-xs">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}

              {/* Indic Script Character Emblem */}
              <div
                className={[
                  'w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-bold mb-3 shadow-xs',
                  isSelected
                    ? 'bg-brand-700 text-white dark:bg-brand-600'
                    : 'bg-gray-100 text-gray-700 dark:bg-dark-elevated dark:text-gray-300',
                ].join(' ')}
              >
                {lang.symbol}
              </div>

              {/* Native Language Name */}
              <span className="text-[17px] font-bold text-gray-900 dark:text-gray-100 block leading-tight">
                {lang.nativeLabel}
              </span>

              {/* English Sub-label */}
              <span className="text-[12px] font-medium text-gray-400 dark:text-gray-500 mt-0.5">
                {lang.label}
              </span>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Bottom Action Area */}
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="pb-2"
      >
        <Button
          onClick={handleContinue}
          size="lg"
          fullWidth
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          {t('navContinue') || 'Continue'}
        </Button>
      </motion.div>
    </div>
  );
};

export default LanguageSelectPage;
