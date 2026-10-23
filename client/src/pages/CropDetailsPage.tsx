import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Clock,
  Droplets,
  Layers,
  Calendar,
  Check,
  ArrowRight,
  AlertTriangle,
  RefreshCw,
  Sprout,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { LoadingState } from '../components/ui/LoadingState';
import { useTranslation } from '../context/LanguageContext';
import { api } from '../services/api';

export const CropDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { cropId } = useParams<{ cropId: string }>();
  const location = useLocation();
  const { t, language } = useTranslation();

  const stateCrop = (location.state as any)?.crop;
  const [crop, setCrop] = useState<any>(stateCrop || null);
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'pests' | 'cost'>('overview');
  const [isLoading, setIsLoading] = useState(!stateCrop);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  // If URL was accidentally /crops/recommend, redirect gracefully to /crops
  useEffect(() => {
    if (cropId === 'recommend') {
      navigate('/crops', { replace: true, state: location.state });
    }
  }, [cropId, navigate, location.state]);

  const fetchCropData = () => {
    if (cropId === 'recommend' || !cropId) return;

    setIsLoading(true);
    setLoadError(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 10000);

    api.crops
      .getById(cropId)
      .then((data) => {
        if (data) {
          setCrop(data);
          setLoadError(null);
        } else {
          setLoadError(`Crop details for "${cropId}" could not be found.`);
        }
      })
      .catch((err) => {
        if (err.name === 'AbortError') {
          setLoadError('Request timed out. Please check your connection and retry.');
        } else {
          setLoadError(err.message || 'Failed to load crop details');
        }
      })
      .finally(() => {
        clearTimeout(timeoutId);
        setIsLoading(false);
      });

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  };

  useEffect(() => {
    if (!stateCrop && cropId && cropId !== 'recommend') {
      fetchCropData();
    }
  }, [cropId]);

  const handleStartPlan = async () => {
    if (!crop) return;
    setIsCreatingPlan(true);
    try {
      const plan = await api.lifecycle.createPlan({
        cropId: crop.id || crop.cropId,
        fieldName: 'Main Field',
        areaAcre: 1.5,
      });
      navigate(`/crops/lifecycle/${plan.id}`);
    } catch (err: any) {
      alert(err.message || 'Please log in to track your crop plan');
      navigate('/login');
    } finally {
      setIsCreatingPlan(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-xl mx-auto py-4">
        <LoadingState
          loadingText="Loading crop agronomy & guidelines..."
          type="details"
          timeoutMs={10000}
          onRetry={fetchCropData}
          onBack={() => navigate('/crops')}
        />
      </div>
    );
  }

  // Error / Not Found State with explicit Retry & Go Back (Fixes Priority 1 Infinite Loading)
  if (loadError || !crop) {
    return (
      <div className="max-w-md mx-auto my-8 p-6 bg-white rounded-3xl border border-red-200 shadow-card text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-base font-extrabold text-dark-text">Crop Details Unavailable</h2>
          <p className="text-xs text-dark-muted mt-1 leading-relaxed">
            {loadError || 'Unable to retrieve crop information from the agricultural database.'}
          </p>
        </div>
        <div className="flex gap-2 justify-center pt-2">
          <button
            onClick={() => navigate('/crops')}
            className="py-2.5 px-4 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
          >
            Back to Crops
          </button>
          <Button
            onClick={fetchCropData}
            size="sm"
            className="flex items-center gap-1.5 shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </Button>
        </div>
      </div>
    );
  }

  const cropName = crop.name || crop.cropName || 'Crop';
  const localName =
    language === 'kn'
      ? crop.nameKannada
      : language === 'ta'
      ? crop.nameTamil
      : language === 'te'
      ? crop.nameTelugu
      : crop.scientificName || crop.category;

  const fallbackHeroImage =
    'https://images.unsplash.com/photo-1536657464919-892534f60d6e?w=800&auto=format&fit=crop&q=80';

  return (
    <div className="max-w-xl mx-auto space-y-4 py-2">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => navigate('/crops')}
          className="p-2 rounded-full bg-white border border-gray-200 text-dark-text hover:bg-gray-50 transition"
          aria-label="Back to crops"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="text-xs font-extrabold text-forest uppercase tracking-wider">
          Agronomy Guide
        </span>
        <div className="w-8" />
      </div>

      {/* Hero Crop Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-card">
        <div className="h-48 sm:h-56 w-full relative bg-mint/50">
          {!imageFailed ? (
            <img
              src={crop.imageUrl || fallbackHeroImage}
              alt={cropName}
              className="w-full h-full object-cover"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-forest to-emerald-800 flex flex-col items-center justify-center text-white">
              <Sprout className="w-16 h-16 text-mint mb-1" />
              <span className="font-extrabold text-lg">{cropName}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-text/85 via-dark-text/25 to-transparent" />

          {/* Suitability badge top right */}
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md py-1 px-3.5 rounded-full border border-forest/20 shadow-md flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-forest animate-pulse" />
            <span className="text-xs font-black text-forest">
              {crop.suitabilityScore ? `${crop.suitabilityScore}% Suitable` : 'ICAR Recommended'}
            </span>
          </div>

          {/* Crop Title on hero image */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h1 className="text-2xl font-black drop-shadow-sm">{cropName}</h1>
            <span className="text-xs font-bold text-mint drop-shadow-sm block mt-0.5">
              {localName}
            </span>
          </div>
        </div>

        {/* 4 Metadata Chips */}
        <div className="grid grid-cols-4 gap-1 p-3 bg-cream-light border-b border-gray-100 text-center">
          <div className="p-1.5 rounded-xl bg-white/80 border border-gray-100">
            <Clock className="w-3.5 h-3.5 text-forest mx-auto mb-1" />
            <span className="text-[10px] text-dark-muted block">Duration</span>
            <span className="text-[11px] font-bold text-dark-text block truncate">
              {crop.growingDuration || crop.durationDays || '100-120 days'}
            </span>
          </div>

          <div className="p-1.5 rounded-xl bg-white/80 border border-gray-100">
            <Droplets className="w-3.5 h-3.5 text-blue-500 mx-auto mb-1" />
            <span className="text-[10px] text-dark-muted block">Water</span>
            <span className="text-[11px] font-bold text-dark-text block truncate">
              {crop.waterRequirements
                ? crop.waterRequirements.split(' ')[0]
                : crop.waterRequirement || 'Moderate'}
            </span>
          </div>

          <div className="p-1.5 rounded-xl bg-white/80 border border-gray-100">
            <Layers className="w-3.5 h-3.5 text-amber-700 mx-auto mb-1" />
            <span className="text-[10px] text-dark-muted block">Soil</span>
            <span className="text-[11px] font-bold text-dark-text block truncate">
              {Array.isArray(crop.idealSoilTypes)
                ? crop.idealSoilTypes.slice(0, 2).join(', ')
                : 'Clay, Loamy'}
            </span>
          </div>

          <div className="p-1.5 rounded-xl bg-white/80 border border-gray-100">
            <Calendar className="w-3.5 h-3.5 text-emerald-600 mx-auto mb-1" />
            <span className="text-[10px] text-dark-muted block">Season</span>
            <span className="text-[11px] font-bold text-dark-text block truncate">
              {Array.isArray(crop.seasons) ? crop.seasons[0] : crop.seasons || 'Kharif'}
            </span>
          </div>
        </div>

        {/* Nav Tabs */}
        <div className="flex border-b border-gray-100 bg-white px-2">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'timeline', label: 'Stages' },
            { id: 'pests', label: 'Pest Guard' },
            { id: 'cost', label: 'Yield & Cost' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 text-xs font-bold transition-all relative ${
                activeTab === tab.id ? 'text-forest' : 'text-dark-muted hover:text-dark-text'
              }`}
            >
              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div
                  layoutId="cropTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-forest"
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-5">
          {activeTab === 'overview' && (
            <div className="space-y-4 text-xs leading-relaxed">
              <p className="text-dark-text font-medium">
                {language === 'kn' && crop.descriptionKn
                  ? crop.descriptionKn
                  : language === 'ta' && crop.descriptionTa
                  ? crop.descriptionTa
                  : language === 'te' && crop.descriptionTe
                  ? crop.descriptionTe
                  : crop.description ||
                    'Comprehensive agricultural package of practices approved by ICAR and state agricultural universities.'}
              </p>

              {crop.keyReasons && crop.keyReasons.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-mint/40 border border-forest/15 space-y-2">
                  <span className="font-extrabold text-forest text-xs block">
                    🌱 Why this crop fits your field:
                  </span>
                  {crop.keyReasons.map((reason: string, rIdx: number) => (
                    <div key={rIdx} className="flex items-center gap-2 text-dark-text">
                      <div className="w-4 h-4 rounded-full bg-forest text-white flex items-center justify-center flex-shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span className="font-medium">{reason}</span>
                    </div>
                  ))}
                </div>
              )}

              {crop.benefits && crop.benefits.length > 0 && (
                <div>
                  <h3 className="font-bold text-dark-text mb-1.5">Key Agronomic Benefits</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {crop.benefits.map((b: string, i: number) => (
                      <span
                        key={i}
                        className="py-1 px-2.5 rounded-lg bg-gray-100 text-dark-text text-[11px] font-semibold"
                      >
                        ✓ {b}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-3 text-xs">
              <h3 className="text-sm font-bold text-dark-text mb-1">
                Growth Stages & Operations
              </h3>
              {crop.stages && crop.stages.length > 0 ? (
                <div className="space-y-2.5">
                  {crop.stages.map((st: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-cream-light border border-gray-100 flex items-start gap-3"
                    >
                      <div className="w-6 h-6 rounded-full bg-forest text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="font-extrabold text-dark-text">{st.stage}</span>
                          <span className="text-[10px] text-forest font-bold">
                            Days {st.dayRange || st.duration}
                          </span>
                        </div>
                        <p className="text-[11px] text-dark-muted mt-0.5">
                          {st.description || st.tasks?.slice(0, 2).map((t: any) => t.taskName || t).join(' • ')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-dark-muted bg-gray-50 rounded-2xl">
                  Day-by-day calendar generated upon adding crop to your field tracking plan.
                </div>
              )}
            </div>
          )}

          {activeTab === 'pests' && (
            <div className="space-y-3 text-xs">
              <h3 className="text-sm font-bold text-dark-text mb-1">
                Common Pests & Preventative Measures
              </h3>
              <div className="space-y-2">
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200">
                  <span className="font-bold text-amber-900 block">Yellow Stem Borer / Sucking Pests</span>
                  <span className="text-[11px] text-amber-800">
                    Set up yellow sticky traps (10/acre) and install pheromone traps early in the vegetative cycle.
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-red-50 border border-red-200">
                  <span className="font-bold text-red-900 block">Blast / Leaf Spot Guard</span>
                  <span className="text-[11px] text-red-800">
                    Avoid excessive urea nitrogen application during humid or cloudy periods. Maintain field aeration.
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cost' && (
            <div className="space-y-3 text-xs">
              <h3 className="text-sm font-bold text-dark-text mb-1">
                Estimated Economics (Per Acre)
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                  <span className="text-dark-muted block mb-0.5">Approx. Cultivation Cost</span>
                  <span className="text-base font-extrabold text-dark-text">
                    {crop.estimatedCost || crop.estimatedCostPerAcre || '₹18,000 - ₹24,000'}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-mint border border-forest/20">
                  <span className="text-forest block mb-0.5">Expected Yield</span>
                  <span className="text-base font-extrabold text-forest">
                    {crop.potentialYield || crop.potentialYieldPerAcre || '22 - 28 Quintals'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Select Crop Action CTA */}
      <div className="pt-2">
        <Button
          onClick={handleStartPlan}
          size="lg"
          fullWidth
          isLoading={isCreatingPlan}
          className="shadow-xl shadow-forest/20 flex items-center justify-center gap-2"
        >
          <span>{t('selectCrop') || 'Select Crop & Start Plan'}</span>
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};
