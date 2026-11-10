import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Trees,
  TrendingUp,
  Clock,
  Coins,
  ShieldCheck,
  ArrowRight,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { CropImage } from '../ui/CropImage';

interface LongTermCropsSectionProps {
  onSelectCrop?: (cropId: string) => void;
}

export const LongTermCropsSection: React.FC<LongTermCropsSectionProps> = ({
  onSelectCrop,
}) => {
  const { language } = useTranslation();
  const [longTermCrops, setLongTermCrops] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.crops
      .getLongTermCrops()
      .then((data) => {
        if (mounted && data) {
          setLongTermCrops(data);
        }
      })
      .catch((err) => {
        console.warn('Failed to load long-term crops:', err);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const getLocalizedName = (crop: any) => {
    switch (language) {
      case 'kn':
        return crop.nameKannada || crop.name;
      case 'ta':
        return crop.nameTamil || crop.name;
      case 'te':
        return crop.nameTelugu || crop.name;
      default:
        return crop.name;
    }
  };

  const getLocalizedDescription = (crop: any) => {
    switch (language) {
      case 'kn':
        return crop.descriptionKn || crop.description;
      case 'ta':
        return crop.descriptionTa || crop.description;
      case 'te':
        return crop.descriptionTe || crop.description;
      default:
        return crop.description;
    }
  };

  return (
    <div className="bg-gradient-to-br from-emerald-900 via-forest-900 to-forest-800 rounded-3xl p-6 text-white shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-forest-700/60 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-mint-400/20 text-mint-300 flex items-center justify-center border border-mint-400/30">
            <Trees className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-lg tracking-tight text-white">
                {language === 'kn'
                  ? 'ದೀರ್ಘಾವಧಿ & ತೋಟಗಾರಿಕೆ ಬೆಳೆಗಳು'
                  : language === 'ta'
                  ? 'நீண்டகால & தோட்டப்பயிர்கள்'
                  : language === 'te'
                  ? 'దీర్ఘకాలిక & తోట పంటలు'
                  : 'Plantation & Long-Term Crops'}
              </h3>
              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-mint-500/20 text-mint-300 border border-mint-400/30">
                Wealth Builder
              </span>
            </div>
            <p className="text-xs text-mint-100/80 mt-0.5">
              {language === 'kn'
                ? 'ಗರ್ಭಾವಧಿ ವರ್ಷಗಳು, ಅಂತರಬೆಳೆ ಮಾದರಿಗಳು ಮತ್ತು ಹೂಡಿಕೆ ಲಾಭದಾಯಕತೆ'
                : language === 'ta'
                ? 'வளர்ச்சி ஆண்டுகள், ஊடுபயிர் முறைகள் மற்றும் நீண்டகால முதலீட்டு வருமானம்'
                : language === 'te'
                ? 'గర్భధారణ సంవత్సరాలు, అంతరపంట పద్ధతులు మరియు దీర్ఘకాలిక రాబడి'
                : 'High-value perennial trees, timber, gestation timelines, and multi-tier intercropping'}
            </p>
          </div>
        </div>

        {/* Tip Badge */}
        <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-xl border border-white/10 text-xs text-mint-200">
          <Layers className="w-4 h-4 text-mint-300 flex-shrink-0" />
          <span>Intercrop during gestation for year-round income!</span>
        </div>
      </div>

      {/* Crop Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {longTermCrops.map((crop) => (
          <motion.div
            key={crop.id}
            whileHover={{ y: -4 }}
            className="bg-forest-800/80 backdrop-blur-sm rounded-2xl p-4 border border-forest-600/60 shadow-lg flex flex-col justify-between hover:border-mint-400/40 transition-all"
          >
            <div>
              {/* Header with image */}
              <div className="flex items-start justify-between gap-2.5 mb-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <CropImage
                    cropId={crop.id}
                    src={crop.imageUrl}
                    useFallback={crop.imageStatus === 'use-fallback'}
                    alt={crop.name}
                    cropName={getLocalizedName(crop)}
                    showFallbackLabel={false}
                    containerClassName="w-12 h-12 rounded-xl overflow-hidden border border-forest-600 flex-shrink-0 relative"
                    className="w-full h-full object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-sm text-white truncate">{getLocalizedName(crop)}</h4>
                    <p className="text-[11px] text-mint-200/70 italic truncate">{crop.scientificName || crop.name}</p>
                  </div>
                </div>
                {crop.gestationYears && (
                  <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/30 whitespace-nowrap shrink-0">
                    {crop.gestationYears} Yrs Gestation
                  </span>
                )}
              </div>

              <p className="text-xs text-forest-100/90 line-clamp-2 mb-3">
                {getLocalizedDescription(crop)}
              </p>

              {/* Economics & Gestation Box */}
              <div className="bg-forest-900/90 rounded-xl p-3 border border-forest-700/60 space-y-2 mb-3 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-forest-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-mint-400" />
                    <span>Harvest / Lifespan:</span>
                  </span>
                  <span className="font-bold text-white">{crop.durationDays}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-forest-300 flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    <span>Est. Cost / Acre:</span>
                  </span>
                  <span className="font-bold text-white">{crop.estimatedCostPerAcre}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-forest-300 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Expected ROI:</span>
                  </span>
                  <span className="font-bold text-mint-300">{crop.roiEstimate || crop.potentialYieldPerAcre}</span>
                </div>
              </div>

              {/* Intercropping Options */}
              {crop.intercroppingOptions && crop.intercroppingOptions.length > 0 && (
                <div className="mb-2">
                  <span className="text-[10px] font-bold text-mint-300 block mb-1">
                    {language === 'kn'
                      ? 'ಸೂಕ್ತ ಅಂತರಬೆಳೆಗಳು (Intercropping):'
                      : language === 'ta'
                      ? 'பரிந்துரைக்கப்பட்ட ஊடுபயிர்கள்:'
                      : language === 'te'
                      ? 'సిఫార్సు చేయబడిన అంతరపంటలు:'
                      : 'Recommended Intercrops:'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {crop.intercroppingOptions.map((opt: string, idx: number) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-forest-700/80 text-mint-100 border border-forest-600"
                      >
                        {opt}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {onSelectCrop && (
              <button
                onClick={() => onSelectCrop(crop.id)}
                className="w-full mt-3 py-2 px-3 rounded-xl bg-mint-500 hover:bg-mint-400 text-forest-950 text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>
                  {language === 'kn'
                    ? 'ಬೆಳೆ ಯೋಜನೆ ವೀಕ್ಷಿಸಿ'
                    : language === 'ta'
                    ? 'பயிர் வழிகாட்டியைப் பார்க்க'
                    : language === 'te'
                    ? 'పంట ప్రణాళిక చూడండి'
                    : 'Explore Plan & Lifecycle'}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};
