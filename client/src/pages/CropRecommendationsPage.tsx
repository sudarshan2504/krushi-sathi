import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  ArrowRight,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Sprout,
  PlusCircle,
  Layers,
  Scale,
  Sun,
  Trees,
  Filter,
  X,
} from 'lucide-react';
import { RecommendationResult } from '../types';
import { api } from '../services/api';
import { useTranslation } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { LoadingState } from '../components/ui/LoadingState';
import { Button } from '../components/ui/Button';
import { CropImage } from '../components/ui/CropImage';

// Crop Components
import { CategorySelector } from '../components/crops/CategorySelector';
import { DurationFilter } from '../components/crops/DurationFilter';
import { SeasonalCropsSection } from '../components/crops/SeasonalCropsSection';
import { LongTermCropsSection } from '../components/crops/LongTermCropsSection';
import { CropCompareView } from '../components/crops/CropCompareView';

export const CropRecommendationsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { t, language } = useTranslation();
  const shouldReduceMotion = useReducedMotion();

  const stateData = location.state as
    | { recommendations?: RecommendationResult[]; assessment?: any; initialTab?: 'matches' | 'seasonal' | 'long_term' }
    | undefined;

  const [recommendations, setRecommendations] = useState<RecommendationResult[]>(
    stateData?.recommendations || []
  );
  const [assessment, setAssessment] = useState<any>(stateData?.assessment || null);
  const [isLoading, setIsLoading] = useState(!stateData?.recommendations);
  const [error, setError] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState<'matches' | 'seasonal' | 'long_term'>(
    stateData?.initialTab || 'matches'
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<string>('');

  // Crop Comparison State (up to 3 crops)
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  const loadRecommendations = useCallback((categoryOverride?: string) => {
    setIsLoading(true);
    setError(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    // If assessment exists or was fetched, use recommend endpoint with category
    api.soil
      .getAssessments()
      .then((pastAssessments) => {
        if (pastAssessments && pastAssessments.length > 0) {
          const latest = pastAssessments[0];
          setAssessment(latest);

          return api.crops
            .quickRecommend({
              soilType: latest.soilType || 'loamy',
              waterSource: latest.waterSource || 'borewell',
              season: latest.season || 'Kharif',
              category: categoryOverride !== undefined ? categoryOverride : (latest.category || undefined),
              district: latest.district,
              state: latest.state,
              taluk: latest.taluk,
              drainage: latest.drainage,
              ph: latest.ph,
              nitrogen: latest.nitrogen,
              phosphorus: latest.phosphorus,
              potassium: latest.potassium,
            })
            .then((data) => {
              setRecommendations(data || []);
              setIsLoading(false);
            });
        }

        // Fallback: request default regional recommendations
        return api.crops
          .quickRecommend({
            soilType: 'loamy',
            waterSource: 'borewell',
            season: 'Kharif',
            category: categoryOverride || undefined,
          })
          .then((data) => {
            setRecommendations(data || []);
            setIsLoading(false);
          });
      })
      .catch((err) => {
        if (err.name === 'AbortError') {
          setError('Recommendation request timed out. Please retry.');
        } else {
          api.crops
            .quickRecommend({
              soilType: 'loamy',
              waterSource: 'borewell',
              season: 'Kharif',
              category: categoryOverride || undefined,
            })
            .then((data) => {
              setRecommendations(data || []);
              setIsLoading(false);
            })
            .catch((qErr) => {
              setError(qErr.message || 'Failed to load crop recommendations');
              setIsLoading(false);
            });
        }
      })
      .finally(() => {
        clearTimeout(timeoutId);
      });

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (!stateData?.recommendations) {
      loadRecommendations();
    }
  }, [stateData, loadRecommendations]);

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    loadRecommendations(cat);
  };

  const handleToggleCompare = (cropId: string) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(cropId)) {
        return prev.filter((id) => id !== cropId);
      }
      if (prev.length >= 3) {
        return [prev[1], prev[2], cropId];
      }
      return [...prev, cropId];
    });
  };

  // Filter recommendations by duration if selected
  const filteredRecommendations = useMemo(() => {
    if (!selectedDuration || selectedDuration === 'all') return recommendations;
    return recommendations.filter((c) => {
      if (!c.durationType) return true;
      return c.durationType === selectedDuration;
    });
  }, [recommendations, selectedDuration]);

  // Selected crops for comparison modal
  const compareCropObjects = useMemo(() => {
    return recommendations.filter((c) => selectedForCompare.includes(c.cropId));
  }, [recommendations, selectedForCompare]);

  const handleImageError = (cropId: string) => {
    setFailedImages((prev) => ({ ...prev, [cropId]: true }));
  };

  const getLocalizedName = (crop: RecommendationResult) => {
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
    <div className="max-w-4xl mx-auto space-y-5 py-2 px-3 sm:px-0">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/home')}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-white border border-earth-200 text-earth-800 hover:bg-earth-50 transition shadow-xs"
            aria-label="Back to home"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-earth-900 leading-tight">
              {language === 'kn'
                ? 'ಶಿಫಾರಸು ಮಾಡಿದ ಬೆಳೆಗಳು'
                : language === 'ta'
                ? 'பரிந்துரைக்கப்பட்ட பயிர்கள்'
                : language === 'te'
                ? 'సిఫార్సు చేయబడిన పంటలు'
                : 'Crop Recommendations'}
            </h1>
            <p className="text-xs text-earth-500 font-medium">
              {assessment
                ? `Matched to your ${assessment.soilType || 'field'} soil in ${assessment.district || 'Mandya'} (${assessment.season || 'Kharif'})`
                : 'ICAR agronomic suitability matching for your regional conditions'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedForCompare.length >= 2 && (
            <button
              onClick={() => setIsCompareOpen(true)}
              className="py-2 px-3.5 rounded-full bg-forest-700 text-white text-xs font-bold hover:bg-forest-800 transition flex items-center gap-1.5 shadow-sm animate-pulse"
            >
              <Scale className="w-4 h-4 text-mint-300" />
              <span>Compare ({selectedForCompare.length})</span>
            </button>
          )}

          <button
            onClick={() => navigate('/soil')}
            className="py-2 px-3.5 rounded-full bg-forest-600 text-white text-xs font-bold hover:bg-forest-700 transition flex items-center gap-1.5 shadow-sm flex-shrink-0"
          >
            <PlusCircle className="w-4 h-4 text-mint-300" />
            <span>Retest Soil</span>
          </button>
        </div>
      </div>

      {/* Main Mode Tabs: Tailored Matches | Seasonal Fruits | Long-Term Crops */}
      <div className="flex items-center bg-earth-100 p-1.5 rounded-2xl gap-1">
        <button
          onClick={() => setActiveTab('matches')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'matches'
              ? 'bg-white text-forest-900 shadow-sm'
              : 'text-earth-600 hover:text-earth-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-forest-600" />
          <span>
            {language === 'kn' ? 'ಸೂಕ್ತ ಬೆಳೆಗಳು' : 'Best Matches'}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('seasonal')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'seasonal'
              ? 'bg-white text-amber-900 shadow-sm'
              : 'text-earth-600 hover:text-earth-900'
          }`}
        >
          <Sun className="w-4 h-4 text-amber-600" />
          <span>
            {language === 'kn' ? 'ಋತುಮಾನದ ಹಣ್ಣುಗಳು' : 'Seasonal Fruits'}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('long_term')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'long_term'
              ? 'bg-white text-emerald-950 shadow-sm'
              : 'text-earth-600 hover:text-earth-900'
          }`}
        >
          <Trees className="w-4 h-4 text-emerald-700" />
          <span>
            {language === 'kn' ? 'ದೀರ್ಘಾವಧಿ ತೋಟಗಾರಿಕೆ' : 'Long-Term Crops'}
          </span>
        </button>
      </div>

      {/* TAB 1: TAILORED BEST MATCHES */}
      {activeTab === 'matches' && (
        <div className="space-y-4">
          {/* Category Filter Chips */}
          <div className="bg-white p-3.5 rounded-2xl border border-earth-200/80 shadow-xs">
            <CategorySelector
              selectedCategory={selectedCategory}
              onSelectCategory={handleSelectCategory}
              compact={true}
            />
          </div>

          {/* Duration Filter Chips */}
          <div className="flex items-center justify-between gap-2">
            <DurationFilter
              selectedDuration={selectedDuration}
              onSelectDuration={(d) => setSelectedDuration(d)}
            />
            {selectedForCompare.length > 0 && (
              <button
                onClick={() => setSelectedForCompare([])}
                className="text-[11px] font-semibold text-earth-500 hover:text-earth-800 whitespace-nowrap"
              >
                Clear compare ({selectedForCompare.length})
              </button>
            )}
          </div>

          {/* Loading Skeleton */}
          {isLoading && (
            <LoadingState
              loadingText="Evaluating agronomic matches against soil & climate..."
              type="list"
              timeoutMs={12000}
              onRetry={() => loadRecommendations(selectedCategory)}
              onBack={() => navigate('/home')}
            />
          )}

          {/* Error State */}
          {!isLoading && error && (
            <div className="p-6 bg-white rounded-3xl border border-red-200 shadow-sm text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-earth-900">Unable to Load Recommendations</h3>
                <p className="text-xs text-earth-500 mt-1">{error}</p>
              </div>
              <div className="flex gap-2 justify-center pt-2">
                <button
                  onClick={() => navigate('/soil')}
                  className="py-2 px-4 rounded-xl border border-earth-200 text-xs font-bold text-earth-700 hover:bg-earth-50"
                >
                  Start Assessment
                </button>
                <Button onClick={() => loadRecommendations(selectedCategory)} size="sm" className="flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry</span>
                </Button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && filteredRecommendations.length === 0 && (
            <div className="p-8 bg-white rounded-3xl border border-earth-200 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-mint-100 flex items-center justify-center text-forest-700 mx-auto">
                <Sprout className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-earth-900">No Matching Crops Found</h3>
                <p className="text-xs text-earth-500 mt-1 max-w-sm mx-auto">
                  Try clearing the category or duration filter to see more crop matches.
                </p>
              </div>
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => {
                    setSelectedCategory('');
                    setSelectedDuration('');
                    loadRecommendations('');
                  }}
                  className="px-4 py-2 rounded-xl bg-forest-600 text-white text-xs font-bold hover:bg-forest-700 transition"
                >
                  View All Crops
                </button>
              </div>
            </div>
          )}

          {/* Recommendations Cards Grid */}
          {!isLoading && !error && filteredRecommendations.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRecommendations.map((crop, idx) => {
                const isBestMatch = idx === 0 || crop.suitabilityScore >= 85;
                const isSelectedForCompare = selectedForCompare.includes(crop.cropId);
                const hasImageFailed = failedImages[crop.cropId];

                return (
                  <motion.div
                    key={crop.cropId || idx}
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: shouldReduceMotion ? 0 : idx * 0.04, duration: 0.25 }}
                    className={`p-4 rounded-3xl bg-white border-2 transition-all flex flex-col justify-between ${
                      isBestMatch
                        ? 'border-forest-500/40 shadow-sm ring-1 ring-forest-500/10'
                        : 'border-earth-200/80 shadow-xs'
                    }`}
                  >
                    <div>
                      {/* Top bar with Image, Title and Suitability Score */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-mint shrink-0 border border-earth-200">
                            <CropImage
                              src={crop.imageUrl}
                              alt={crop.name}
                              cropName={crop.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h2 className="text-base font-extrabold text-earth-900 leading-tight break-words">
                                {getLocalizedName(crop)}
                              </h2>
                              {isBestMatch && (
                                <span className="py-0.5 px-2 rounded-full bg-forest-600 text-white text-[9px] font-black uppercase tracking-wide shrink-0">
                                  Top Pick
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-forest-700 font-bold block">
                              {crop.name} {crop.category && `• ${crop.category}`}
                            </span>
                          </div>
                        </div>

                        {/* Circular Score */}
                        <div className="flex flex-col items-center flex-shrink-0">
                          <div className="relative w-11 h-11 flex items-center justify-center">
                            <svg className="w-11 h-11 transform -rotate-90">
                              <circle
                                cx="22"
                                cy="22"
                                r="18"
                                stroke="currentColor"
                                strokeWidth="3"
                                className="text-earth-100"
                                fill="transparent"
                              />
                              <circle
                                cx="22"
                                cy="22"
                                r="18"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeDasharray={113}
                                strokeDashoffset={113 - (113 * crop.suitabilityScore) / 100}
                                strokeLinecap="round"
                                className={isBestMatch ? 'text-forest-600' : 'text-emerald-500'}
                                fill="transparent"
                              />
                            </svg>
                            <span className="absolute text-[11px] font-black text-earth-900">
                              {crop.suitabilityScore}%
                            </span>
                          </div>
                          <span className="text-[9px] font-extrabold text-earth-400 mt-0.5 uppercase tracking-wider">
                            {crop.matchTier || 'Match'}
                          </span>
                        </div>
                      </div>

                      {/* Explanation box: "Why this crop" */}
                      {crop.explanation && (
                        <div className="bg-forest-50/70 p-2.5 rounded-xl border border-forest-100 mb-3 text-xs text-forest-900 leading-snug">
                          <span className="font-bold text-forest-800">Why this crop: </span>
                          <span>{crop.explanation}</span>
                        </div>
                      )}

                      {/* Sowing Window Status */}
                      {crop.sowingWindowStatus && (
                        <div className="mb-2.5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border ${
                              crop.sowingWindowStatus.status === 'open'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : crop.sowingWindowStatus.status === 'closing_soon'
                                ? 'bg-amber-50 text-amber-900 border-amber-200'
                                : crop.sowingWindowStatus.status === 'opens_in_n_days'
                                ? 'bg-blue-50 text-blue-800 border-blue-200'
                                : 'bg-gray-100 text-gray-700 border-gray-200'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                            <span>
                              {language === 'kn'
                                ? crop.sowingWindowStatus.labelKn || crop.sowingWindowStatus.label
                                : language === 'ta'
                                ? crop.sowingWindowStatus.labelTa || crop.sowingWindowStatus.label
                                : language === 'te'
                                ? crop.sowingWindowStatus.labelTe || crop.sowingWindowStatus.label
                                : crop.sowingWindowStatus.label}
                            </span>
                          </span>
                        </div>
                      )}

                      {/* Key Reasons */}
                      <div className="space-y-1 mb-3">
                        {crop.keyReasons &&
                          crop.keyReasons.slice(0, 2).map((reason, rIdx) => (
                            <div key={rIdx} className="flex items-center gap-1.5 text-xs text-earth-700">
                              <div className="w-3.5 h-3.5 rounded-full bg-mint-100 text-forest-700 flex items-center justify-center flex-shrink-0">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </div>
                              <span className="line-clamp-1">{reason}</span>
                            </div>
                          ))}
                      </div>

                      {/* Quick Meta badges */}
                      <div className="flex items-center flex-wrap gap-2 text-[11px] text-earth-600 font-medium pb-3 border-t border-earth-100 pt-2">
                        <span className="bg-earth-100 px-2 py-0.5 rounded-md">
                          ⏱️ {crop.growingDuration}
                        </span>
                        <span className="bg-earth-100 px-2 py-0.5 rounded-md">
                          💧 {crop.waterRequirements?.split(' ')[0] || 'Moderate'}
                        </span>
                        {crop.estimatedCost && (
                          <span className="bg-earth-100 px-2 py-0.5 rounded-md">
                            💰 {crop.estimatedCost}
                          </span>
                        )}
                        {crop.potentialYield && (
                          <span className="bg-earth-100 px-2 py-0.5 rounded-md">
                            🌾 {crop.potentialYield}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Bar: Compare Checkbox + View Details Button */}
                    <div className="flex items-center justify-between pt-2 border-t border-earth-100 gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleCompare(crop.cropId)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                          isSelectedForCompare
                            ? 'bg-forest-700 text-white border-forest-700 shadow-xs'
                            : 'bg-white text-earth-700 border-earth-200 hover:bg-earth-50'
                        }`}
                      >
                        <Scale className="w-3.5 h-3.5" />
                        <span>{isSelectedForCompare ? 'Compared ✓' : '+ Compare'}</span>
                      </button>

                      <button
                        onClick={() =>
                          navigate(`/crops/${crop.cropId}`, { state: { crop } })
                        }
                        className="py-1.5 px-3.5 rounded-xl bg-forest-600 hover:bg-forest-700 text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-xs"
                      >
                        <span>{t('viewDetails') || 'View Details'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SEASONAL FRUITS & CALENDAR */}
      {activeTab === 'seasonal' && (
        <SeasonalCropsSection
          currentSeason={assessment?.season || 'Kharif'}
          agroZone={assessment?.taluk}
          onSelectCrop={(cropId) => navigate(`/crops/${cropId}`)}
        />
      )}

      {/* TAB 3: LONG-TERM PLANTATION & AGROFORESTRY */}
      {activeTab === 'long_term' && (
        <LongTermCropsSection
          onSelectCrop={(cropId) => navigate(`/crops/${cropId}`)}
        />
      )}

      {/* Floating Compare Drawer when items are selected */}
      {selectedForCompare.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-forest-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-4 border border-forest-700 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-mint-300" />
            <span className="text-xs font-bold">
              {selectedForCompare.length} {selectedForCompare.length === 1 ? 'crop' : 'crops'} selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={selectedForCompare.length < 2}
              onClick={() => setIsCompareOpen(true)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                selectedForCompare.length >= 2
                  ? 'bg-mint-400 hover:bg-mint-300 text-forest-950 shadow-md'
                  : 'bg-forest-800 text-forest-400 cursor-not-allowed'
              }`}
            >
              Compare Side-by-Side
            </button>
            <button
              onClick={() => setSelectedForCompare([])}
              className="p-1 rounded-full hover:bg-forest-800 text-forest-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Crop Compare View Modal */}
      <CropCompareView
        crops={compareCropObjects}
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        onSelectCrop={(cropId) => navigate(`/crops/${cropId}`)}
      />
    </div>
  );
};
