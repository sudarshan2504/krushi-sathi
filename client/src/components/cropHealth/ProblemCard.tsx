import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ShieldCheck, Bug, Activity, ArrowRight, Eye } from 'lucide-react';
import { ProblemItem } from '../../types';
import { useTranslation } from '../../context/LanguageContext';

interface ProblemCardProps {
  problem: ProblemItem;
  onSelect: (problem: ProblemItem) => void;
  selectedCropSlug?: string;
}

export const ProblemCard: React.FC<ProblemCardProps> = ({
  problem,
  onSelect,
  selectedCropSlug,
}) => {
  const { t, language } = useTranslation();
  const [imgSrc, setImgSrc] = useState<string>(() => {
    if (problem.images && problem.images.length > 0) {
      return problem.images[0].path;
    }
    return '/problems/placeholder-crop-health.webp';
  });

  const getLocalizedName = () => {
    if (language === 'kn') return problem.nameKn || problem.nameKannada || problem.name;
    if (language === 'ta') return problem.nameTa || problem.nameTamil || problem.name;
    if (language === 'te') return problem.nameTe || problem.nameTelugu || problem.name;
    return problem.name;
  };

  const getLocalizedSymptoms = () => {
    if (language === 'kn') return problem.symptomsKn || problem.symptoms;
    if (language === 'ta') return problem.symptomsTa || problem.symptoms;
    if (language === 'te') return problem.symptomsTe || problem.symptoms;
    return problem.symptoms;
  };

  // Severity styling: low=green, medium=yellow/amber, high=orange, critical=red
  const getSeverityBadge = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'low':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'medium':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'high':
        return 'bg-orange-50 text-orange-800 border-orange-200';
      case 'critical':
      default:
        return 'bg-red-50 text-red-800 border-red-200';
    }
  };

  // Type styling
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'insect_pest':
        return { label: t('typeInsectPest') || 'Insect Pest', color: 'bg-amber-100 text-amber-900' };
      case 'fungal':
        return { label: t('typeFungal') || 'Fungal', color: 'bg-purple-100 text-purple-900' };
      case 'bacterial':
        return { label: t('typeBacterial') || 'Bacterial', color: 'bg-blue-100 text-blue-900' };
      case 'viral':
        return { label: t('typeViral') || 'Viral', color: 'bg-rose-100 text-rose-900' };
      case 'nematode':
        return { label: t('typeNematode') || 'Nematode', color: 'bg-stone-100 text-stone-900' };
      case 'nutrient_deficiency':
        return { label: t('typeNutrient') || 'Nutrient Deficiency', color: 'bg-lime-100 text-lime-900' };
      case 'abiotic_stress':
        return { label: t('typeAbiotic') || 'Weather Stress', color: 'bg-sky-100 text-sky-900' };
      case 'weed':
        return { label: t('typeWeed') || 'Weed', color: 'bg-teal-100 text-teal-900' };
      default:
        return { label: type?.replace('_', ' ') || 'Disease', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const typeInfo = getTypeBadge(problem.type);
  const localizedName = getLocalizedName();
  const symptomsOneLiner = getLocalizedSymptoms().split('.')[0] + '.';

  // Check if primary to the current crop
  const isPrimaryForCrop = problem.crops?.some(
    c => c.cropSlug === selectedCropSlug && c.importance === 'primary'
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      onClick={() => onSelect(problem)}
      className="p-4 rounded-3xl bg-white border border-gray-100 shadow-card hover:border-forest/30 transition-all cursor-pointer flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start gap-3.5 mb-3">
          {/* Problem Local Image */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200/70 shadow-inner relative">
            <img
              src={imgSrc}
              alt={localizedName}
              loading="lazy"
              onError={() => setImgSrc('/problems/placeholder-crop-health.webp')}
              className="w-full h-full object-cover"
            />
            {isPrimaryForCrop && (
              <span className="absolute bottom-1 left-1 bg-forest/90 text-white text-[11px] font-bold px-1.5 py-0.5 rounded shadow">
                Major
              </span>
            )}
          </div>

          {/* Core Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1.5 mb-1 flex-wrap">
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${typeInfo.color}`}>
                {typeInfo.label}
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${getSeverityBadge(problem.severity)}`}>
                {problem.severity ? (t(`sev${problem.severity.charAt(0).toUpperCase() + problem.severity.slice(1)}` as any) || problem.severity) : 'Medium'}
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-gray-100 truncate">
              {localizedName}
            </h3>

            {problem.scientificName && (
              <span className="text-[11px] text-gray-500 italic block truncate">
                {problem.scientificName}
              </span>
            )}

            {/* If viewed in regional language and english name differs */}
            {language !== 'en' && problem.name !== localizedName && (
              <span className="text-[11px] text-gray-600 block truncate">
                {problem.name}
              </span>
            )}
          </div>
        </div>

        {/* What to look for */}
        <div className="bg-cream-light/40 rounded-2xl p-2.5 mb-3 border border-cream-dark/20">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-forest mb-0.5">
            <Eye className="w-3.5 h-3.5" />
            <span>{t('whatToLookFor') || 'What to look for'}:</span>
          </div>
          <p className="text-xs text-gray-800 dark:text-gray-100 line-clamp-2 leading-relaxed">
            {symptomsOneLiner}
          </p>
        </div>
      </div>

      {/* Footer: Crops Affected & CTA */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
        <div className="text-[11px] text-gray-500 truncate max-w-[65%]">
          <span className="font-semibold text-gray-700">{t('crops') || 'Crops'}: </span>
          {problem.crops && problem.crops.length > 0
            ? problem.crops.map(c => c.cropName).slice(0, 3).join(', ') + (problem.crops.length > 3 ? '...' : '')
            : problem.affectedCrops?.slice(0, 3).join(', ') || 'Various'}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(problem);
          }}
          className="min-h-[44px] px-3.5 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest-dark transition-colors inline-flex items-center gap-1.5 shadow-sm flex-shrink-0 cursor-pointer"
        >
          <span>{t('viewSolution') || 'View Solution'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
};
