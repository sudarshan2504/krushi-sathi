import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  ArrowRight,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Sprout,
  PlusCircle,
  HelpCircle,
} from 'lucide-react';
import { RecommendationResult } from '../types';
import { api } from '../services/api';
import { useTranslation } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { LoadingState } from '../components/ui/LoadingState';
import { Button } from '../components/ui/Button';

export const CropRecommendationsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { t, language } = useTranslation();

  const stateData = location.state as
    | { recommendations?: RecommendationResult[]; assessment?: any }
    | undefined;

  const [recommendations, setRecommendations] = useState<RecommendationResult[]>(
    stateData?.recommendations || []
  );
  const [assessment, setAssessment] = useState<any>(stateData?.assessment || null);
  const [isLoading, setIsLoading] = useState(!stateData?.recommendations);
  const [error, setError] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const loadRecommendations = useCallback(() => {
    setIsLoading(true);
    setError(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    // 1. If user is authenticated, check for their saved assessment
    api.soil
      .getAssessments()
      .then((pastAssessments) => {
        if (pastAssessments && pastAssessments.length > 0) {
          const latest = pastAssessments[0];
          setAssessment(latest);
          if (latest.latestRecommendations && latest.latestRecommendations.length > 0) {
            setRecommendations(latest.latestRecommendations);
            setIsLoading(false);
            return;
          }
        }
        // Fallback: request default regional recommendations without hardcoding values into user profile
        return api.crops
          .quickRecommend({
            soilType: 'loamy',
            waterSource: 'borewell',
            season: 'Kharif',
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
          // If past assessments fetch failed (e.g. guest), try quick recommend directly
          api.crops
            .quickRecommend({
              soilType: 'loamy',
              waterSource: 'borewell',
              season: 'Kharif',
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

  const handleImageError = (cropId: string) => {
    setFailedImages((prev) => ({ ...prev, [cropId]: true }));
  };

  return (
    <div className="max-w-xl mx-auto space-y-4 py-2">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/home')}
            className="p-2 rounded-full bg-white border border-gray-200 text-dark-text hover:bg-gray-50 transition"
            aria-label="Back to home"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-black text-dark-text leading-tight">
              {t('recommendedCrops') || 'Recommended Crops'}
            </h1>
            <p className="text-xs text-dark-muted font-medium">
              {assessment
                ? `Matched to your ${assessment.soilType || 'field'} soil & ${assessment.season || 'Kharif'} season`
                : 'ICAR agronomic suitability matching for your region'}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/soil')}
          className="py-1.5 px-3 rounded-full bg-forest text-white text-xs font-bold hover:bg-forest-dark transition flex items-center gap-1 shadow-sm flex-shrink-0"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Assessment</span>
        </button>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <LoadingState
          loadingText="Analyzing soil compatibility & regional climate..."
          type="list"
          timeoutMs={12000}
          onRetry={loadRecommendations}
          onBack={() => navigate('/home')}
        />
      )}

      {/* Error State with Retry */}
      {!isLoading && error && (
        <div className="p-6 bg-white rounded-3xl border border-red-200 shadow-card text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-dark-text">Unable to Load Recommendations</h3>
            <p className="text-xs text-dark-muted mt-1">{error}</p>
          </div>
          <div className="flex gap-2 justify-center pt-2">
            <button
              onClick={() => navigate('/soil')}
              className="py-2 px-4 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
            >
              Start Assessment
            </button>
            <Button onClick={loadRecommendations} size="sm" className="flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </Button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && recommendations.length === 0 && (
        <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-card text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-mint flex items-center justify-center text-forest mx-auto">
            <Sprout className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-dark-text">No Field Assessment Found</h3>
            <p className="text-xs text-dark-muted mt-1 leading-relaxed max-w-sm mx-auto">
              Complete a quick 2-minute field assessment to generate crop recommendations scientifically tailored to your soil texture, water source, and planting budget.
            </p>
          </div>
          <Button
            onClick={() => navigate('/soil')}
            size="md"
            className="mx-auto flex items-center gap-2 shadow-md"
          >
            <span>Start Field Assessment</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Recommendations Cards List */}
      {!isLoading && !error && recommendations.length > 0 && (
        <div className="space-y-3.5">
          {recommendations.slice(0, 5).map((crop, idx) => {
            const isBestMatch = idx === 0 || crop.suitabilityScore >= 85;
            const hasImageFailed = failedImages[crop.cropId];

            return (
              <motion.div
                key={crop.cropId || idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08, duration: 0.4 }}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
                className={`p-5 rounded-3xl bg-white border-2 shadow-card hover:shadow-card-hover transition-all ${
                  isBestMatch
                    ? 'border-forest/40 ring-2 ring-forest/10'
                    : 'border-gray-100'
                }`}
              >
                {/* Crop Card Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-mint flex-shrink-0 border border-forest/10 flex items-center justify-center">
                      {!hasImageFailed ? (
                        <img
                          src={crop.imageUrl}
                          alt={crop.name}
                          className="w-full h-full object-cover"
                          onError={() => handleImageError(crop.cropId)}
                        />
                      ) : (
                        <Sprout className="w-7 h-7 text-forest" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-extrabold text-dark-text">
                          {crop.name}
                        </h2>
                        {isBestMatch && (
                          <span className="py-0.5 px-2.5 rounded-full bg-forest text-white text-[10px] font-black tracking-wide">
                            {t('bestMatch') || 'Best Match'}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-forest font-bold block">
                        {language === 'kn'
                          ? crop.nameKannada
                          : language === 'ta'
                          ? crop.nameTamil
                          : language === 'te'
                          ? crop.nameTelugu
                          : crop.category}
                      </span>
                    </div>
                  </div>

                  {/* Circular Suitability Indicator with Animation */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className="relative w-12 h-12 flex items-center justify-center">
                      <svg className="w-12 h-12 transform -rotate-90">
                        <circle
                          cx="24"
                          cy="24"
                          r="20"
                          stroke="currentColor"
                          strokeWidth="3.5"
                          className="text-gray-100"
                          fill="transparent"
                        />
                        <motion.circle
                          cx="24"
                          cy="24"
                          r="20"
                          stroke="currentColor"
                          strokeWidth="3.5"
                          strokeDasharray={125.6}
                          initial={{ strokeDashoffset: 125.6 }}
                          animate={{
                            strokeDashoffset: 125.6 - (125.6 * crop.suitabilityScore) / 100,
                          }}
                          transition={{ duration: 0.9, delay: 0.2 + idx * 0.1 }}
                          strokeLinecap="round"
                          className={isBestMatch ? 'text-forest' : 'text-emerald-500'}
                          fill="transparent"
                        />
                      </svg>
                      <span className="absolute text-[11px] font-black text-dark-text">
                        {crop.suitabilityScore}%
                      </span>
                    </div>
                    <span className="text-[9px] font-extrabold text-dark-muted mt-0.5 uppercase tracking-wider">
                      {crop.matchTier || 'Match'}
                    </span>
                  </div>
                </div>

                {/* Key Agronomic Reasons */}
                <div className="space-y-1.5 py-2.5 border-t border-gray-100">
                  {crop.keyReasons &&
                    crop.keyReasons.slice(0, 3).map((reason, rIdx) => (
                      <div key={rIdx} className="flex items-center gap-2 text-xs text-dark-text">
                        <div className="w-4 h-4 rounded-full bg-mint text-forest flex items-center justify-center flex-shrink-0">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span className="font-medium">{reason}</span>
                      </div>
                    ))}
                </div>

                {/* Meta details & Action */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="text-[11px] text-dark-muted space-x-2 font-medium">
                    <span>⏱️ {crop.growingDuration}</span>
                    <span>•</span>
                    <span>💧 {crop.waterRequirements?.split(' ')[0] || 'Moderate'}</span>
                  </div>

                  <button
                    onClick={() =>
                      navigate(`/crops/${crop.cropId}`, { state: { crop } })
                    }
                    className="py-2 px-4 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest-dark transition-colors flex items-center gap-1.5 shadow-sm"
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

      {/* Advisory Disclaimer */}
      <div className="p-3.5 rounded-2xl bg-cream border border-harvest/30 flex items-start gap-2 text-xs text-dark-text/80 leading-relaxed">
        <AlertCircle className="w-4 h-4 text-earth flex-shrink-0 mt-0.5" />
        <span>
          Agronomic suitability assessment grounded in ICAR and state agricultural university research. Yields and costs may vary with local weather and soil management.
        </span>
      </div>
    </div>
  );
};
