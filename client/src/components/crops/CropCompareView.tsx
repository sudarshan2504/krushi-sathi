import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Check,
  AlertTriangle,
  Clock,
  Droplets,
  Coins,
  TrendingUp,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Sprout,
} from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';
import { RecommendationResult } from '../../types';

interface CropCompareViewProps {
  crops: (RecommendationResult | any)[];
  isOpen: boolean;
  onClose: () => void;
  onSelectCrop?: (cropId: string) => void;
}

export const CropCompareView: React.FC<CropCompareViewProps> = ({
  crops,
  isOpen,
  onClose,
  onSelectCrop,
}) => {
  const { language } = useTranslation();

  if (!isOpen || crops.length === 0) return null;

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

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-earth-200 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-earth-100 bg-earth-50/60">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-forest-600 text-white flex items-center justify-center shadow-sm">
                <Sparkles className="w-5 h-5 text-mint-300" />
              </div>
              <div>
                <h2 className="font-extrabold text-lg text-earth-900">
                  {language === 'kn'
                    ? 'ಬೆಳೆಗಳ ಹೋಲಿಕೆ'
                    : language === 'ta'
                    ? 'பயிர்களின் ஒப்பீடு'
                    : language === 'te'
                    ? 'పంటల పోలిక'
                    : 'Side-by-Side Crop Comparison'}
                </h2>
                <p className="text-xs text-earth-500">
                  {language === 'kn'
                    ? 'ವೆಚ್ಚ, ಇಳುವರಿ, ನೀರಿನ ಬೇಡಿಕೆ ಮತ್ತು ಅವಧಿಯನ್ನು ಹೋಲಿಸಿ ನಿರ್ಧರಿಸಿ'
                    : language === 'ta'
                    ? 'செலவு, விளைச்சல், நீர் தேவை மற்றும் காலத்தை ஒப்பிட்டு முடிவு செய்யுங்கள்'
                    : language === 'te'
                    ? 'ఖర్చు, దిగుబడి, నీటి అవసరం మరియు కాలాన్ని పోల్చి నిర్ణయించుకోండి'
                    : 'Compare economics, duration, water, and soil requirements to choose the best crop'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-earth-100 hover:bg-earth-200 text-earth-600 flex items-center justify-center transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body - Scrollable Comparison Grid */}
          <div className="p-5 overflow-y-auto space-y-6">
            {/* Crop Header Cards */}
            <div
              className={`grid gap-4 ${
                crops.length === 2 ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-3'
              }`}
            >
              {crops.map((crop) => (
                <div
                  key={crop.cropId || crop.id}
                  className="bg-earth-50 rounded-2xl p-4 border border-earth-200 flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={crop.imageUrl}
                      alt={crop.name}
                      className="w-14 h-14 rounded-xl object-cover border border-earth-200 flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="min-w-0">
                      <h3 className="font-bold text-earth-900 text-sm leading-tight truncate">
                        {getLocalizedName(crop)}
                      </h3>
                      <p className="text-[11px] text-earth-500 italic truncate">{crop.name}</p>
                      {crop.suitabilityScore !== undefined && (
                        <span className="inline-block mt-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-forest-600 text-white">
                          {crop.suitabilityScore}% Match
                        </span>
                      )}
                    </div>
                  </div>

                  {onSelectCrop && (
                    <button
                      onClick={() => {
                        onClose();
                        onSelectCrop(crop.cropId || crop.id);
                      }}
                      className="w-full mt-3 py-1.5 px-3 rounded-xl bg-forest-600 hover:bg-forest-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-xs"
                    >
                      <span>Choose Crop</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Comparison Rows */}
            <div className="space-y-4">
              {/* Row 1: Duration & Gestation */}
              <div className="bg-white rounded-2xl p-4 border border-earth-200/80 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-bold text-forest-700 uppercase tracking-wide mb-3">
                  <Clock className="w-4 h-4" />
                  <span>Growing Duration & Gestation</span>
                </div>
                <div
                  className={`grid gap-4 ${
                    crops.length === 2 ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-3'
                  }`}
                >
                  {crops.map((crop) => (
                    <div key={crop.cropId || crop.id} className="text-xs">
                      <p className="font-bold text-earth-900">{crop.growingDuration || crop.durationDays}</p>
                      {crop.gestationYears && (
                        <p className="text-[11px] text-amber-700 font-semibold mt-0.5">
                          {crop.gestationYears} Years gestation period
                        </p>
                      )}
                      {crop.durationType && (
                        <span className="inline-block mt-1 text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-earth-100 text-earth-700">
                          {crop.durationType}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 2: Water & Irrigation */}
              <div className="bg-white rounded-2xl p-4 border border-earth-200/80 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-bold text-forest-700 uppercase tracking-wide mb-3">
                  <Droplets className="w-4 h-4" />
                  <span>Water Requirement</span>
                </div>
                <div
                  className={`grid gap-4 ${
                    crops.length === 2 ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-3'
                  }`}
                >
                  {crops.map((crop) => (
                    <div key={crop.cropId || crop.id} className="text-xs">
                      <p className="font-bold text-earth-900">
                        {crop.waterRequirements || crop.waterRequirement || 'Moderate'}
                      </p>
                      {crop.waterMm && (
                        <p className="text-[11px] text-earth-500 mt-0.5">{crop.waterMm} mm requirement</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 3: Financials (Cost & Yield & ROI) */}
              <div className="bg-white rounded-2xl p-4 border border-earth-200/80 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-bold text-forest-700 uppercase tracking-wide mb-3">
                  <Coins className="w-4 h-4" />
                  <span>Economics: Cost, Yield & ROI</span>
                </div>
                <div
                  className={`grid gap-4 ${
                    crops.length === 2 ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-3'
                  }`}
                >
                  {crops.map((crop) => (
                    <div key={crop.cropId || crop.id} className="text-xs space-y-1">
                      <div>
                        <span className="text-[10px] text-earth-400 block">Est. Cost / Acre</span>
                        <span className="font-bold text-earth-800">
                          {crop.estimatedCost || crop.estimatedCostPerAcre}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-earth-400 block">Potential Yield</span>
                        <span className="font-bold text-earth-800">
                          {crop.potentialYield || crop.potentialYieldPerAcre}
                        </span>
                      </div>
                      {(crop.roiEstimate || crop.marketDemand) && (
                        <div className="pt-1">
                          <span className="text-[10px] text-earth-400 block">Market Demand / ROI</span>
                          <span className="font-bold text-forest-700">
                            {crop.roiEstimate || crop.marketDemand}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 4: Soil Compatibility */}
              <div className="bg-white rounded-2xl p-4 border border-earth-200/80 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-bold text-forest-700 uppercase tracking-wide mb-3">
                  <Sprout className="w-4 h-4" />
                  <span>Soil Requirements</span>
                </div>
                <div
                  className={`grid gap-4 ${
                    crops.length === 2 ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-3'
                  }`}
                >
                  {crops.map((crop) => (
                    <div key={crop.cropId || crop.id} className="text-xs">
                      <p className="text-earth-700 leading-relaxed">
                        {crop.soilRequirements ||
                          (crop.idealSoilTypes ? crop.idealSoilTypes.join(', ') : 'Well drained loamy')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 5: Intercropping / Long-term benefits */}
              <div className="bg-white rounded-2xl p-4 border border-earth-200/80 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-bold text-forest-700 uppercase tracking-wide mb-3">
                  <Layers className="w-4 h-4" />
                  <span>Intercropping & Key Benefits</span>
                </div>
                <div
                  className={`grid gap-4 ${
                    crops.length === 2 ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-3'
                  }`}
                >
                  {crops.map((crop) => (
                    <div key={crop.cropId || crop.id} className="text-xs space-y-1.5">
                      {crop.intercroppingOptions && crop.intercroppingOptions.length > 0 && (
                        <div>
                          <span className="text-[10px] font-bold text-forest-700 block">Intercropping:</span>
                          <p className="text-[11px] text-earth-600">
                            {crop.intercroppingOptions.join(', ')}
                          </p>
                        </div>
                      )}
                      {crop.benefits && crop.benefits.length > 0 && (
                        <ul className="space-y-1">
                          {crop.benefits.slice(0, 2).map((b: string, i: number) => (
                            <li key={i} className="flex items-start gap-1 text-[11px] text-emerald-800">
                              <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 6: Risks & Disease Vulnerabilities */}
              <div className="bg-white rounded-2xl p-4 border border-earth-200/80 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wide mb-3">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Risks & Vulnerabilities</span>
                </div>
                <div
                  className={`grid gap-4 ${
                    crops.length === 2 ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-3'
                  }`}
                >
                  {crops.map((crop) => (
                    <div key={crop.cropId || crop.id} className="text-xs">
                      {crop.risks && crop.risks.length > 0 ? (
                        <ul className="space-y-1">
                          {crop.risks.slice(0, 2).map((r: string, i: number) => (
                            <li key={i} className="flex items-start gap-1 text-[11px] text-amber-900">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                              <span>{r}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-[11px] text-earth-400">Standard agricultural risks apply.</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-earth-100 bg-earth-50/50 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-earth-200 hover:bg-earth-300 text-earth-800 text-xs font-bold transition-all"
            >
              Close Comparison
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
