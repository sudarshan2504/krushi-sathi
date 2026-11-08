import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, ArrowRight, Sprout } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';
import { LanguageCode } from '../i18n';
import { BrandLogo } from '../components/ui/BrandLogo';
import { LeafCorners } from '../components/ui/LeafCorners';
import { WaveFooter } from '../components/ui/WaveFooter';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { SceneBackground } from '../components/ui/SceneBackground';

export const LanguageSelectPage: React.FC = () => {
  const navigate = useNavigate();
  const { language, setLanguage, languages, t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();

  const handleContinue = () => {
    navigate('/login');
  };

  return (
    <SceneBackground variant="sky-cream" className="justify-between relative">
      {/* 1. Leaf corner accents with gentle natural wind sway */}
      <LeafCorners showLeft showRight />

      {/* Top Header Region (3-15% screen height) */}
      <div className="pt-8 px-6 flex flex-col items-center text-center relative z-10">
        {/* Centered Brand Emblem + Logo Wordmark */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-4"
        >
          <BrandLogo size="md" variant="full" />
        </motion.div>

        {/* 2-Step Progress Indicator (14% height) */}
        <div className="flex items-center gap-1.5 mb-5" aria-label="Step 1 of 2: Language Selection">
          {/* Active Step 1: Long forest-green pill */}
          <div className="w-8 h-1.5 rounded-full bg-[#144D29] dark:bg-emerald-400" />
          {/* Inactive Step 2: Short gray dot */}
          <div className="w-2.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
        </div>

        {/* Headline: "Choose Your" in dark green, "Language" in medium green with leaf at top-right */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="text-center"
        >
          <h1 className="text-3xl font-extrabold tracking-tight leading-tight">
            <span className="text-[#0D2B18] dark:text-zinc-100 block">
              {language === 'en' ? 'Choose Your' : t('chooseLanguage')}
            </span>
            {language === 'en' && (
              <span className="text-[#228B22] dark:text-emerald-400 inline-flex items-center gap-1">
                Language
                <Sprout className="w-5 h-5 text-[#228B22] dark:text-emerald-400 rotate-12 inline-block shrink-0 -mt-2" />
              </span>
            )}
          </h1>
          <p className="text-xs sm:text-[13px] text-zinc-500 dark:text-zinc-400 font-medium mt-1.5 max-w-xs mx-auto">
            {t('selectLanguageComfortable')}
          </p>
        </motion.div>
      </div>

      {/* 2. 2x2 Grid of Language Cards (33-70% screen height) */}
      <div className="px-5 py-4 my-auto relative z-10">
        <div className="grid grid-cols-2 gap-3.5 max-w-sm mx-auto">
          {languages.map((lang, index) => {
            const isSelected = language === lang.code;

            return (
              <motion.button
                key={lang.code}
                type="button"
                whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: shouldReduceMotion ? 0 : 0.05 * index }}
                onClick={() => setLanguage(lang.code as LanguageCode)}
                className={`relative flex flex-col items-center justify-center p-4 min-h-[145px] rounded-3xl transition-all duration-200 select-none text-center cursor-pointer shadow-card ${
                  isSelected
                    ? 'border-[3px] border-[#144D29] bg-gradient-to-b from-[#E8F8EE] to-[#DCFCE7] dark:bg-emerald-950/40 dark:border-emerald-400 shadow-md scale-[1.02]'
                    : 'border border-white/80 dark:border-zinc-800 bg-white/95 dark:bg-zinc-800/95 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                {/* Checkmark badge at top-right for selected item */}
                {isSelected && (
                  <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-[#144D29] text-white flex items-center justify-center shadow-xs">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}

                {/* Native Script Character Tile */}
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-bold mb-2.5 transition-colors duration-150 ${
                    isSelected
                      ? 'bg-[#144D29] text-white shadow-xs'
                      : 'bg-zinc-100 dark:bg-zinc-700/80 text-[#0D2B18] dark:text-zinc-200'
                  }`}
                >
                  {lang.symbol}
                </div>

                {/* Native Language Name (Bold) */}
                <span className="text-[17px] font-bold text-[#0D2B18] dark:text-zinc-100 block leading-tight">
                  {lang.nativeLabel}
                </span>

                {/* English Name (Mid-Gray) */}
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-1">
                  {lang.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* 3. Bottom Landscape Scene Strip & Wave Footer */}
      <div className="w-full relative z-10 mt-auto">
        {/* Sunrise Field Landscape Graphic (73-88% height) */}
        <div className="w-full overflow-hidden select-none -mb-1">
          <img
            src="/design/sunrise-landscape-strip.webp"
            alt="Sunrise over farm field"
            className="w-full h-24 sm:h-28 object-cover object-bottom"
            loading="eager"
          />
        </div>

        {/* Wave Footer with Continue CTA */}
        <WaveFooter heightClass="min-h-[110px] pb-6 pt-1">
          <PrimaryButton
            size="md"
            onClick={handleContinue}
            iconRight={<ArrowRight className="w-4 h-4" />}
            className="w-[78%] max-w-[280px] shadow-lg"
          >
            {t('navContinue')}
          </PrimaryButton>
        </WaveFooter>
      </div>
    </SceneBackground>
  );
};
