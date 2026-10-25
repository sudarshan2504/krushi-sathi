import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  AlertTriangle,
  ShieldCheck,
  Bug,
  Activity,
  Layers,
  Thermometer,
  CloudRain,
  Calendar,
  AlertCircle,
  HelpCircle,
  PhoneCall,
  CheckCircle2,
  Share2,
  Info,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { ProblemItem, ProblemImage } from '../../types';
import { useTranslation } from '../../context/LanguageContext';

interface ProblemDetailModalProps {
  problem: ProblemItem | null;
  onClose: () => void;
}

export const ProblemDetailModal: React.FC<ProblemDetailModalProps> = ({ problem, onClose }) => {
  const { t, language } = useTranslation();
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);

  if (!problem) return null;

  const images: ProblemImage[] = (problem.images && problem.images.length > 0)
    ? problem.images
    : [
        {
          path: '/problems/placeholder-crop-health.webp',
          caption: 'Representative image for ' + problem.name,
          kind: 'symptom_closeup',
        },
      ];

  const currentImage = images[selectedImageIdx] || images[0];

  const getLocalizedName = () => {
    if (language === 'kn') return problem.nameKn || problem.nameKannada || `${problem.name} [ಕನ್ನಡ ಶೀಘ್ರದಲ್ಲೇ]`;
    if (language === 'ta') return problem.nameTa || problem.nameTamil || `${problem.name} [தமிழில் விரைவில்]`;
    if (language === 'te') return problem.nameTe || problem.nameTelugu || `${problem.name} [తెలుగులో త్వరలో]`;
    return problem.name;
  };

  const getLocalizedSymptoms = () => {
    if (language === 'kn') return problem.symptomsKn || problem.symptoms;
    if (language === 'ta') return problem.symptomsTa || problem.symptoms;
    if (language === 'te') return problem.symptomsTe || problem.symptoms;
    return problem.symptoms;
  };

  const getLocalizedCultural = () => {
    if (language === 'kn') return problem.culturalControlKn || problem.culturalControl;
    if (language === 'ta') return problem.culturalControlTa || problem.culturalControl;
    if (language === 'te') return problem.culturalControlTe || problem.culturalControl;
    return problem.culturalControl;
  };

  const getLocalizedBiological = () => {
    if (language === 'kn') return problem.biologicalControlKn || problem.biologicalControl;
    if (language === 'ta') return problem.biologicalControlTa || problem.biologicalControl;
    if (language === 'te') return problem.biologicalControlTe || problem.biologicalControl;
    return problem.biologicalControl;
  };

  const getLocalizedOrganic = () => {
    if (language === 'kn') return problem.organicControlKn || problem.organicControl;
    if (language === 'ta') return problem.organicControlTa || problem.organicControl;
    if (language === 'te') return problem.organicControlTe || problem.organicControl;
    return problem.organicControl;
  };

  const getLocalizedChemical = () => {
    if (language === 'kn') return problem.chemicalControlKn || problem.chemicalControl;
    if (language === 'ta') return problem.chemicalControlTa || problem.chemicalControl;
    if (language === 'te') return problem.chemicalControlTe || problem.chemicalControl;
    return problem.chemicalControl;
  };

  const getLocalizedWhenToCall = () => {
    if (language === 'kn') return problem.whenToCallExpertKn || problem.whenToCallExpert;
    if (language === 'ta') return problem.whenToCallExpertTa || problem.whenToCallExpert;
    if (language === 'te') return problem.whenToCallExpertTe || problem.whenToCallExpert;
    return problem.whenToCallExpert;
  };

  const getLocalizedPreventionSteps = (): string[] => {
    if (language === 'kn' && problem.preventionStepsKn && problem.preventionStepsKn.length > 0) {
      return problem.preventionStepsKn;
    }
    if (language === 'ta' && problem.preventionStepsTa && problem.preventionStepsTa.length > 0) {
      return problem.preventionStepsTa;
    }
    if (language === 'te' && problem.preventionStepsTe && problem.preventionStepsTe.length > 0) {
      return problem.preventionStepsTe;
    }
    return problem.preventionSteps || (problem.prevention ? [problem.prevention] : []);
  };

  const getLocalizedIpmSteps = (): string[] => {
    if (language === 'kn' && problem.ipmStepsKn && problem.ipmStepsKn.length > 0) {
      return problem.ipmStepsKn;
    }
    if (language === 'ta' && problem.ipmStepsTa && problem.ipmStepsTa.length > 0) {
      return problem.ipmStepsTa;
    }
    if (language === 'te' && problem.ipmStepsTe && problem.ipmStepsTe.length > 0) {
      return problem.ipmStepsTe;
    }
    return problem.ipmSteps || [];
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'low':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'medium':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'critical':
      default:
        return 'bg-red-100 text-red-800 border-red-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden border border-gray-100 my-4 max-h-[92vh] flex flex-col"
      >
        {/* Sticky Header with Close Button */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white/95 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-forest uppercase tracking-wider">
              {t('pestAndDiseases') || 'Crop Health'}
            </span>
            <span className="text-gray-300">•</span>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getSeverityBadge(problem.severity)}`}>
              {problem.severity?.toUpperCase()} SEVERITY
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Main Title & Scientific Identification */}
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-dark-text leading-tight mb-1">
              {getLocalizedName()}
            </h1>
            {problem.scientificName && (
              <p className="text-sm text-forest italic font-medium">
                {problem.scientificName}
              </p>
            )}
            {language !== 'en' && problem.name !== getLocalizedName() && (
              <p className="text-xs text-gray-400 mt-0.5">
                English reference: {problem.name}
              </p>
            )}
          </div>

          {/* Photo Gallery with Verified Local WebP Images & Captions */}
          <div className="bg-gray-900 rounded-3xl overflow-hidden text-white shadow-lg">
            <div className="relative aspect-video max-h-80 sm:max-h-96 w-full bg-black flex items-center justify-center">
              <img
                src={currentImage.path}
                alt={currentImage.caption || problem.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/problems/placeholder-crop-health.webp';
                }}
              />

              {/* Prev / Next controls if multiple images */}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setSelectedImageIdx((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/90 transition"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedImageIdx((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/90 transition"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Kind Badge */}
              <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-white/20">
                {currentImage.kind?.replace('_', ' ') || 'Symptom Closeup'}
              </div>
            </div>

            {/* Caption & Attribution Info */}
            <div className="p-3.5 bg-gray-900/90 border-t border-white/10 text-xs">
              <p className="text-white/95 font-medium leading-relaxed">
                <span className="font-bold text-emerald-400">What to look for: </span>
                {currentImage.caption}
              </p>
              {currentImage.author && (
                <p className="text-[10px] text-white/50 mt-1">
                  Source: {currentImage.source || 'Wikimedia Commons'} | Photo: {currentImage.author} | Licence: {currentImage.licence || 'CC BY-SA'}
                </p>
              )}
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex gap-2 p-3 bg-black/40 overflow-x-auto border-t border-white/10">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`w-16 h-12 rounded-xl overflow-hidden border-2 flex-shrink-0 transition cursor-pointer ${
                      selectedImageIdx === idx ? 'border-emerald-400 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img.path}
                      alt={img.caption}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Facts Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-2xl bg-cream-light/60 border border-gray-100">
              <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                {t('growthStage') || 'Affected Stages'}
              </span>
              <span className="text-xs font-bold text-dark-text block">
                {problem.affectedStages?.join(', ') || 'All stages'}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-cream-light/60 border border-gray-100">
              <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                {t('season') || 'Favourable Season'}
              </span>
              <span className="text-xs font-bold text-dark-text block">
                {problem.favourableSeasons?.join(', ') || 'Monsoon / Humid'}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-cream-light/60 border border-gray-100">
              <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                {t('weatherConditions') || 'Temp & Humidity'}
              </span>
              <span className="text-xs font-bold text-dark-text block truncate">
                {problem.favourableTemp || '20-32°C'} | {problem.favourableHumidity || '>80% RH'}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-cream-light/60 border border-gray-100">
              <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                Spread Pattern
              </span>
              <span className="text-xs font-bold text-dark-text block truncate">
                {problem.spreadPattern || 'Wind / Splashing rain'}
              </span>
            </div>
          </div>

          {/* Symptoms Details */}
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-2">
            <h3 className="text-sm font-black text-dark-text flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-forest" />
              {t('symptoms') || 'Symptoms & Identification'}
            </h3>
            <p className="text-xs sm:text-sm text-dark-text/90 leading-relaxed whitespace-pre-line">
              {getLocalizedSymptoms()}
            </p>
            {problem.cause && (
              <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100 mt-2">
                <span className="font-bold text-gray-800">Causal Organism / Origin: </span>
                {problem.cause}
              </p>
            )}
          </div>

          {/* 4-TIER TREATMENT LADDER (Cultural -> Biological -> Organic -> Chemical Generic Active Ingredients) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-dark-text flex items-center gap-2">
                <Layers className="w-4 h-4 text-forest" />
                {t('treatmentLadder') || 'Treatment Ladder (Graduated Control)'}
              </h3>
              <span className="text-[10px] font-bold text-gray-500">ICAR / UAS Recommended</span>
            </div>

            <div className="space-y-2.5">
              {/* Step 1: Cultural Control */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-6 h-6 rounded-full bg-forest text-white text-xs font-bold flex items-center justify-center">1</span>
                  <h4 className="text-xs sm:text-sm font-bold text-forest">
                    {t('culturalControl') || 'Cultural & Physical Control (Start Here)'}
                  </h4>
                </div>
                <p className="text-xs text-dark-text/90 pl-8 leading-relaxed">
                  {getLocalizedCultural() || 'Clean field boundaries, rogue out infected seedlings, and maintain recommended plant spacing for airflow.'}
                </p>
              </div>

              {/* Step 2: Biological Control */}
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">2</span>
                  <h4 className="text-xs sm:text-sm font-bold text-blue-900">
                    {t('biologicalControl') || 'Biological Control'}
                  </h4>
                </div>
                <p className="text-xs text-dark-text/90 pl-8 leading-relaxed">
                  {getLocalizedBiological() || 'Apply antagonistic fungi (Trichoderma) or beneficial biocontrol parasitoids / predators.'}
                </p>
              </div>

              {/* Step 3: Organic Control */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs font-bold flex items-center justify-center">3</span>
                  <h4 className="text-xs sm:text-sm font-bold text-amber-900">
                    {t('organicControl') || 'Organic & Botanical Formulations'}
                  </h4>
                </div>
                <p className="text-xs text-dark-text/90 pl-8 leading-relaxed">
                  {getLocalizedOrganic() || 'Spray cold-pressed Neem seed kernel extract (NSKE 5%) or certified botanicals at early pest onset.'}
                </p>
              </div>

              {/* Step 4: Chemical Control (Generic Active Ingredients Only) */}
              <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-6 h-6 rounded-full bg-rose-600 text-white text-xs font-bold flex items-center justify-center">4</span>
                  <h4 className="text-xs sm:text-sm font-bold text-rose-900">
                    {t('chemicalControl') || 'Chemical Control (Last Resort)'}
                  </h4>
                </div>
                <p className="text-xs text-dark-text/90 pl-8 leading-relaxed font-medium">
                  {getLocalizedChemical() || 'Use approved active ingredients as advised by the regional KVK.'}
                </p>

                {/* Strict Statutory Label Advisory */}
                <div className="mt-3 ml-8 p-3 bg-white rounded-xl border border-rose-300 text-[11px] text-rose-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                    <span>Statutory Pesticide Safety Notice</span>
                  </div>
                  <p className="leading-normal">
                    {t('chemicalLabelWarning') || 'Only generic active ingredient names are shown. Always follow the registered container label directions, safety precautions, and local Krishi Vigyan Kendra (KVK) / Raitha Samparka Kendra advisory. Krushi Sathi does NOT prescribe chemical doses.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Prevention Steps */}
          {getLocalizedPreventionSteps().length > 0 && (
            <div className="bg-emerald-50/40 rounded-3xl p-5 border border-forest/15 space-y-2">
              <h3 className="text-sm font-black text-forest flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                {t('prevention') || 'Long-Term Prevention Strategy'}
              </h3>
              <ul className="space-y-1.5 pl-1">
                {getLocalizedPreventionSteps().map((step, idx) => (
                  <li key={idx} className="text-xs text-dark-text/90 flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-forest flex-shrink-0 mt-0.5" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Look-alikes comparison */}
          {problem.lookAlikes && problem.lookAlikes.length > 0 && (
            <div className="bg-gray-50 rounded-3xl p-5 border border-gray-200 space-y-3">
              <h3 className="text-sm font-black text-dark-text flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-600" />
                Look-Alike Problems & Distinguishing Checks
              </h3>
              <div className="space-y-2">
                {problem.lookAlikes.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-white border border-gray-200 text-xs">
                    <span className="font-bold text-dark-text block mb-1">
                      Confused with: {item.name}
                    </span>
                    <span className="text-gray-600">
                      <strong className="text-forest">How to distinguish: </strong>
                      {item.difference}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Safety Notes */}
          {problem.safetyNotes && (
            <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-200 text-xs text-amber-900 space-y-1">
              <span className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                Safety Notes & Pollinator Protection
              </span>
              <p className="leading-relaxed">
                {problem.safetyNotes}
              </p>
            </div>
          )}

          {/* Expert Advisory Card */}
          <div className="rounded-3xl p-5 bg-gradient-to-br from-forest to-forest-dark text-white shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-emerald-300" />
                {t('expertAdvisory') || 'When to Contact Agricultural Officer'}
              </h3>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                Toll Free 1800-180-1551
              </span>
            </div>
            <p className="text-xs text-white/90 leading-relaxed">
              {getLocalizedWhenToCall() || 'If more than 10% of plants show severe symptoms or if symptoms rapidly spread after heavy rains, immediately visit your local Raitha Samparka Kendra (RSK) or call Kisan Call Center.'}
            </p>
            <div className="pt-2 border-t border-white/15 flex items-center justify-between text-[11px] text-white/80">
              <span>National Kisan Call Center (KCC)</span>
              <a
                href="tel:18001801551"
                className="font-bold text-emerald-300 hover:underline flex items-center gap-1"
              >
                Call 1800-180-1551
              </a>
            </div>
          </div>
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-forest text-white text-xs sm:text-sm font-bold hover:bg-forest-dark transition cursor-pointer min-h-[44px]"
          >
            {t('navBack') || 'Done'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
