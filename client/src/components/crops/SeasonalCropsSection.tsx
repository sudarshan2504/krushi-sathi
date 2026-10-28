import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Sun,
  CloudRain,
  Sparkles,
  Calendar,
  Clock,
  ArrowRight,
  TrendingUp,
  Droplets,
  Award,
} from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { RecommendationResult } from '../../types';
import { CropImage } from '../ui/CropImage';

interface SeasonalCropsSectionProps {
  currentSeason?: string;
  agroZone?: string;
  onSelectCrop?: (cropId: string) => void;
}

export const SeasonalCropsSection: React.FC<SeasonalCropsSectionProps> = ({
  currentSeason = 'Kharif',
  agroZone,
  onSelectCrop,
}) => {
  const { language } = useTranslation();
  const [seasonalFruits, setSeasonalFruits] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'fruits' | 'current_season'>('fruits');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.crops
      .getSeasonalFruits()
      .then((data) => {
        if (mounted && data) {
          setSeasonalFruits(data);
        }
      })
      .catch((err) => {
        console.warn('Failed to load seasonal fruits:', err);
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
    <div className="bg-gradient-to-br from-amber-50/70 via-cream-50 to-emerald-50/60 rounded-3xl p-5 border border-amber-200/70 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-700 flex items-center justify-center">
            <Sun className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-earth-900 text-base">
                {language === 'kn'
                  ? 'ಋತುಮಾನದ ಹಣ್ಣುಗಳು & ಬೆಳೆಗಳು'
                  : language === 'ta'
                  ? 'பருவகால பழங்கள் & பயிர்கள்'
                  : language === 'te'
                  ? 'కాలానుగుణ పండ్లు & పంటలు'
                  : 'Seasonal Fruits & Orchard Crops'}
              </h3>
              <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-amber-500 text-white shadow-xs">
                {currentSeason}
              </span>
            </div>
            <p className="text-xs text-earth-600">
              {language === 'kn'
                ? 'ಪ್ರಸ್ತುತ ಹವಾಮಾನ ಮತ್ತು ಕೃಷಿ ವಲಯಕ್ಕೆ ಸೂಕ್ತವಾದ ಹಣ್ಣಿನ ತೋಟಗಳು'
                : language === 'ta'
                ? 'தற்போதைய வானிலை மற்றும் வேளாண் மண்டலத்திற்கு ஏற்ற பழத்தோட்டங்கள்'
                : language === 'te'
                ? 'ప్రస్తుత వాతావరణం మరియు వ్యవసాయ మండలానికి సరిపోయే పండ్ల తోటలు'
                : 'Orchard crops and fruiting schedules tailored for your region'}
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-white/80 p-1 rounded-xl border border-amber-200/80 shadow-xs">
          <button
            onClick={() => setActiveTab('fruits')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'fruits'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-earth-600 hover:text-earth-900'
            }`}
          >
            {language === 'kn'
              ? 'ಹಣ್ಣಿನ ಬೆಳೆಗಳು'
              : language === 'ta'
              ? 'பழப் பயிர்கள்'
              : language === 'te'
              ? 'పండ్ల పంటలు'
              : 'Fruit Orchards'}
          </button>
          <button
            onClick={() => setActiveTab('current_season')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'current_season'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-earth-600 hover:text-earth-900'
            }`}
          >
            {language === 'kn'
              ? 'ಋತುಮಾನದ ಕ್ಯಾಲೆಂಡರ್'
              : language === 'ta'
              ? 'பருவகால நாள்காட்டி'
              : language === 'te'
              ? 'కాలానుగుణ క్యాలెండర్'
              : 'Season Calendar'}
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'fruits' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {seasonalFruits.map((crop) => (
            <motion.div
              key={crop.id}
              whileHover={{ y: -3 }}
              className="bg-white rounded-2xl p-4 border border-earth-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-mint shrink-0 border border-earth-100">
                      <CropImage
                        src={crop.imageUrl}
                        alt={crop.name}
                        cropName={crop.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-sm text-earth-900 truncate">{getLocalizedName(crop)}</h4>
                      <p className="text-[11px] text-earth-500 italic truncate">{crop.scientificName || crop.name}</p>
                    </div>
                  </div>
                  {crop.marketDemand && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                      {crop.marketDemand} Demand
                    </span>
                  )}
                </div>

                <p className="text-xs text-earth-600 line-clamp-2 mb-3">
                  {getLocalizedDescription(crop)}
                </p>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 text-[11px] bg-earth-50/80 p-2.5 rounded-xl border border-earth-100 mb-3">
                  <div>
                    <span className="text-earth-400 block text-[10px]">
                      {language === 'kn'
                        ? 'ಫಲ ಬಿಡುವ ಸಮಯ'
                        : language === 'ta'
                        ? 'பழம் தரும் காலம்'
                        : language === 'te'
                        ? 'పండ్ల సమయం'
                        : 'Fruiting Time'}
                    </span>
                    <span className="font-semibold text-earth-800">
                      {crop.fruitingTime || 'Annual / Seasonal'}
                    </span>
                  </div>
                  <div>
                    <span className="text-earth-400 block text-[10px]">
                      {language === 'kn'
                        ? 'ಬೆಳವಣಿಗೆ ಅವಧಿ'
                        : language === 'ta'
                        ? 'வளர்ச்சி காலம்'
                        : language === 'te'
                        ? 'గర్భధారణ కాలం'
                        : 'Gestation'}
                    </span>
                    <span className="font-semibold text-earth-800">
                      {crop.gestationYears
                        ? `${crop.gestationYears} Years`
                        : crop.durationDays}
                    </span>
                  </div>
                  <div>
                    <span className="text-earth-400 block text-[10px]">
                      {language === 'kn'
                        ? 'ಅಂದಾಜು ವೆಚ್ಚ'
                        : language === 'ta'
                        ? 'மதிப்பீட்டு செலவு'
                        : language === 'te'
                        ? 'అంచనా వ్యయం'
                        : 'Est. Cost'}
                    </span>
                    <span className="font-semibold text-earth-800">{crop.estimatedCostPerAcre}</span>
                  </div>
                  <div>
                    <span className="text-earth-400 block text-[10px]">
                      {language === 'kn'
                        ? 'ಸಾಧ್ಯವಿರುವ ಆದಾಯ'
                        : language === 'ta'
                        ? 'வருவாய் மதிப்பீடு'
                        : language === 'te'
                        ? 'అంచనా రాబడి'
                        : 'Yield / Return'}
                    </span>
                    <span className="font-semibold text-earth-800">{crop.potentialYieldPerAcre}</span>
                  </div>
                </div>

                {/* Intercropping / Sowing tags */}
                {crop.intercroppingOptions && crop.intercroppingOptions.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-earth-600 mb-2">
                    <span className="font-bold text-forest-700">Intercrop:</span>
                    {crop.intercroppingOptions.slice(0, 3).map((item: string, i: number) => (
                      <span key={i} className="bg-forest-50 text-forest-700 px-1.5 py-0.5 rounded-md border border-forest-100">
                        {item}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {onSelectCrop && (
                <button
                  onClick={() => onSelectCrop(crop.id)}
                  className="w-full mt-2 py-2 px-3 rounded-xl bg-earth-100 hover:bg-forest-600 hover:text-white text-earth-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <span>
                    {language === 'kn'
                      ? 'ವಿವರಗಳು ಮತ್ತು ಹಂತಗಳು'
                      : language === 'ta'
                      ? 'விவரங்கள் & படிகள்'
                      : language === 'te'
                      ? 'వివరాలు & దశలు'
                      : 'View Crop Guide'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-4 border border-earth-200/80 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Kharif */}
            <div className={`p-3.5 rounded-xl border ${currentSeason === 'Kharif' ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20' : 'bg-earth-50/50 border-earth-200'}`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-extrabold text-xs text-emerald-800 uppercase tracking-wide">Kharif (Monsoon)</span>
                <span className="text-[10px] text-earth-500 font-semibold">Jun - Oct</span>
              </div>
              <p className="text-xs text-earth-700 mb-2">Paddy, Ragi, Maize, Tur Dal, Cotton, Groundnut, Soybean.</p>
              <div className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                <CloudRain className="w-3.5 h-3.5" />
                <span>Heavy rain reliant; excellent for field crops</span>
              </div>
            </div>

            {/* Rabi */}
            <div className={`p-3.5 rounded-xl border ${currentSeason === 'Rabi' ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-500/20' : 'bg-earth-50/50 border-earth-200'}`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-extrabold text-xs text-amber-800 uppercase tracking-wide">Rabi (Winter)</span>
                <span className="text-[10px] text-earth-500 font-semibold">Oct - Mar</span>
              </div>
              <p className="text-xs text-earth-700 mb-2">Wheat, Gram, Mustard, Sunflower, Onion, Potato, Peas.</p>
              <div className="text-[11px] font-semibold text-amber-700 flex items-center gap-1">
                <Sun className="w-3.5 h-3.5" />
                <span>Cool weather; requires timely irrigation</span>
              </div>
            </div>

            {/* Zaid */}
            <div className={`p-3.5 rounded-xl border ${currentSeason === 'Zaid' ? 'bg-orange-50/70 border-orange-300 ring-2 ring-orange-500/20' : 'bg-earth-50/50 border-earth-200'}`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-extrabold text-xs text-orange-800 uppercase tracking-wide">Zaid (Summer)</span>
                <span className="text-[10px] text-earth-500 font-semibold">Mar - Jun</span>
              </div>
              <p className="text-xs text-earth-700 mb-2">Watermelon, Muskmelon, Cucumber, Vegetables, Fodder crops.</p>
              <div className="text-[11px] font-semibold text-orange-700 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Fast maturity; hot dry tolerance with drip</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
