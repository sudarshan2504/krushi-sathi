import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useTranslation } from '../context/LanguageContext';
import { LanguageCode } from '../i18n';

export const LanguageSelectPage: React.FC = () => {
  const navigate = useNavigate();
  const { language, setLanguage, languages, t } = useTranslation();

  const handleContinue = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream via-white to-mint-light flex flex-col justify-between p-6 max-w-md mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-6 text-center"
      >
        <span className="w-12 h-1.5 rounded-full bg-forest/20 inline-block mb-6" />
        <h1 className="text-2xl sm:text-3xl font-extrabold text-dark-text leading-tight">
          {t('chooseLanguage')}
        </h1>
        <p className="text-sm text-dark-muted font-medium mt-2 max-w-xs mx-auto">
          {t('selectLanguageComfortable')}
        </p>
      </motion.div>

      {/* 2x2 Language Cards Grid (Matching Screen 2) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="grid grid-cols-2 gap-4 my-auto py-6"
      >
        {languages.map((lang, index) => {
          const isSelected = language === lang.code;

          return (
            <motion.button
              key={lang.code}
              whileTap={{ scale: 0.96 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              onClick={() => setLanguage(lang.code as LanguageCode)}
              className={`relative flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all duration-200 select-none ${
                isSelected
                  ? 'border-forest bg-mint/50 shadow-xl shadow-forest/15 ring-2 ring-forest/20'
                  : 'border-gray-100 bg-white hover:border-forest/30 shadow-card'
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-forest text-white flex items-center justify-center shadow-sm">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}

              {/* Indic Script Character */}
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl font-bold mb-3 shadow-sm ${
                  isSelected ? 'bg-forest text-white' : 'bg-mint-light text-forest border border-forest/10'
                }`}
              >
                {lang.symbol}
              </div>

              {/* Native Language Name */}
              <span className="text-lg font-extrabold text-dark-text block">
                {lang.nativeLabel}
              </span>

              {/* English Sub-label */}
              <span className="text-xs font-semibold text-dark-muted mt-0.5">
                {lang.label}
              </span>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Bottom Action */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="pb-4"
      >
        <Button
          onClick={handleContinue}
          size="lg"
          fullWidth
          className="shadow-xl shadow-forest/20 flex items-center justify-center gap-2 group"
        >
          <span>{t('navContinue')}</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </motion.div>
    </div>
  );
};
