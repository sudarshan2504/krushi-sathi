import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  ShieldCheck,
  ExternalLink,
  Camera,
  Thermometer,
  CloudRain,
  DollarSign,
  TrendingUp,
  Bug,
  Sparkles,
  Info,
  CheckCircle2,
  Trees,
  FlaskConical,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { StickyBottomBar } from '../components/ui/StickyBottomBar';
import { StatTile } from '../components/ui/StatTile';
import { CropImage as CropImageTile } from '../components/ui/CropImage';
import { useTranslation } from '../context/LanguageContext';
import { api } from '../services/api';
import { CropImage as CropImageMeta } from '../types';

export const CropDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { cropId } = useParams<{ cropId: string }>();
  const location = useLocation();
  const { t, language } = useTranslation();

  const stateCrop = (location.state as any)?.crop;
  const [crop, setCrop] = useState<any>(stateCrop || null);
  const [activeTab, setActiveTab] = useState<'overview' | 'sowing' | 'timeline' | 'pests' | 'economics'>('overview');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(!stateCrop);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);

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

  const [cropImageMeta, setCropImageMeta] = useState<any>(null);

  useEffect(() => {
    if (!stateCrop && cropId && cropId !== 'recommend') {
      fetchCropData();
    }
  }, [cropId]);

  useEffect(() => {
    const effectiveId = crop?.id || cropId;
    if (effectiveId) {
      fetch('/crops/crops-images.json')
        .then(res => res.json())
        .then((records: any[]) => {
          const found = records.find(r => r.cropId === effectiveId);
          if (found) setCropImageMeta(found);
        })
        .catch(() => {});
    }
  }, [crop?.id, cropId]);

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

  if (loadError || (!crop && !isLoading)) {
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

  if (isLoading || !crop) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 space-y-4 animate-pulse">
        <div className="h-64 bg-gray-200 rounded-3xl w-full" />
        <div className="h-6 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="grid grid-cols-4 gap-2 pt-4">
          <div className="h-16 bg-gray-100 rounded-2xl" />
          <div className="h-16 bg-gray-100 rounded-2xl" />
          <div className="h-16 bg-gray-100 rounded-2xl" />
          <div className="h-16 bg-gray-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  const cropName = crop.name || crop.cropName || 'Crop';
  const localName =
    language === 'kn' && crop.nameKannada
      ? crop.nameKannada
      : language === 'ta' && crop.nameTamil
      ? crop.nameTamil
      : language === 'te' && crop.nameTelugu
      ? crop.nameTelugu
      : crop.name;

  const isFallbackImage =
    crop?.imageStatus === 'use-fallback' || cropImageMeta?.status === 'use-fallback';

  // Local gallery images if present
  const imagesList: CropImageMeta[] = crop.images && crop.images.length > 0
    ? crop.images
    : [
        {
          type: 'plant',
          path: isFallbackImage ? '' : (cropImageMeta?.filePath || crop.imageUrl || (crop.id ? `/crops/${crop.id}.webp` : '')),
          source: cropImageMeta?.source || 'Botanical Species Archive',
          author: cropImageMeta?.photographer || 'Field Contributor',
          license: cropImageMeta?.license || 'CC BY-SA 4.0',
          attributionUrl: cropImageMeta?.sourceUrl || undefined,
        },
      ];

  const currentImage = imagesList[selectedImageIndex] || imagesList[0];

  const getImageTypeLabel = (type: string) => {
    switch (type) {
      case 'plant':
        return 'Whole Plant';
      case 'flower':
        return 'Flower';
      case 'fruit':
        return 'Fruit';
      case 'produce':
      case 'grain':
        return 'Grain / Harvest';
      case 'seed':
        return 'Seed';
      case 'leaf':
        return 'Leaf';
      default:
        return 'Photo';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 py-4 px-3 sm:px-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-white border border-gray-200 text-dark-text hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-forest transition"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <span className="text-xs font-extrabold text-forest uppercase tracking-wider">
          Agronomy Guide & Package of Practices
        </span>

        <button
          onClick={() => navigate('/credits')}
          className="text-xs font-bold text-gray-600 hover:text-forest transition"
        >
          Image Credits
        </button>
      </div>

      {/* Hero Crop Photo & Interactive Gallery */}
      <div className="rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-card">
        {/* Main Image Stage */}
        <div className="relative h-64 sm:h-80 w-full bg-mint/30 overflow-hidden">
          <CropImageTile
            cropId={crop.id || cropId}
            src={isFallbackImage ? null : currentImage.path}
            useFallback={isFallbackImage}
            alt={`${cropName} - ${currentImage.type}`}
            cropName={cropName}
            containerClassName="w-full h-full relative overflow-hidden"
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent pointer-events-none z-10" />

          {/* Top Badges */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-auto z-20">
            <div className="flex items-center gap-2">
              <span className="bg-forest-dark/85 backdrop-blur-md text-white text-xs font-extrabold px-3 py-1 rounded-full border border-forest/30 shadow-sm">
                {crop.category?.toUpperCase() || 'AGRICULTURE'}
              </span>
              {crop.confidence === 'high' ? (
                <span className="bg-emerald-900/80 backdrop-blur-md text-emerald-200 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ICAR Verified</span>
                </span>
              ) : (
                <span className="bg-amber-900/80 backdrop-blur-md text-amber-200 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                  <Info className="w-3.5 h-3.5" />
                  <span>Regional Specialist</span>
                </span>
              )}
            </div>

            {crop.isRecommendedForFarmer && (
              <div className="bg-emerald-700/90 backdrop-blur-md text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span>Recommended for your location</span>
              </div>
            )}
          </div>

          {/* Crop Title on Hero Image */}
          <div className="absolute bottom-4 left-4 right-4 text-white pointer-events-auto space-y-1 z-20">
            <span className="text-xs font-semibold text-mint italic block">
              {crop.scientificName}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black drop-shadow-sm text-white">
              {cropName}
            </h1>
            {localName !== cropName && (
              <span className="text-sm font-bold text-mint-light drop-shadow-sm block">
                {localName}
              </span>
            )}
          </div>
        </div>

        {/* Gallery Thumbnails & Image Type Selector */}
        {imagesList.length > 1 && (
          <div className="p-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2 overflow-x-auto">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider pl-1 shrink-0">
              Gallery:
            </span>
            {imagesList.map((img, idx) => {
              const isSelected = selectedImageIndex === idx;
              return (
                <button
                  key={`${img.path}-${idx}`}
                  onClick={() => {
                    setSelectedImageIndex(idx);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shrink-0 ${
                    isSelected
                      ? 'bg-forest text-white shadow-sm ring-2 ring-forest/30 scale-102'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <span>{getImageTypeLabel(img.type)}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Image Attribution Line (Academic & Open License Transparency) */}
        {currentImage.author && (
          <div className="px-4 py-2 bg-cream-light/60 border-b border-gray-100 flex flex-wrap items-center justify-between text-[11px] text-gray-600 gap-2">
            <div className="flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-gray-400" />
              <span>
                Photo: <strong className="text-gray-900">{currentImage.author}</strong> ({currentImage.license})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span>Source: {currentImage.source}</span>
              {currentImage.attributionUrl && (
                <a
                  href={currentImage.attributionUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-forest hover:underline flex items-center gap-0.5 font-bold"
                >
                  <span>License details</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* 4 Metadata Quick Chips using StatTile */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-gray-50 dark:bg-dark-elevated border-b border-gray-100 dark:border-dark-border text-center">
          <div className="p-2.5 rounded-2xl bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border">
            <StatTile
              icon={<Clock className="w-4 h-4 text-brand-600 dark:text-brand-400" />}
              label="Duration"
              value={crop.durationDays || crop.growingDuration || '100-120 days'}
            />
          </div>

          <div className="p-2.5 rounded-2xl bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border">
            <StatTile
              icon={<Droplets className="w-4 h-4 text-blue-500" />}
              label="Water Need"
              value={crop.waterRequirement || crop.waterRequirements?.split(' ')[0] || 'Moderate'}
            />
          </div>

          <div className="p-2.5 rounded-2xl bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border">
            <StatTile
              icon={<Layers className="w-4 h-4 text-amber-700" />}
              label="Ideal Soil & pH"
              value={crop.minPh && crop.maxPh ? `pH ${crop.minPh}-${crop.maxPh}` : 'Loamy / Red'}
            />
          </div>

          <div className="p-2.5 rounded-2xl bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border">
            <StatTile
              icon={<Calendar className="w-4 h-4 text-emerald-600" />}
              label="Best Season"
              value={Array.isArray(crop.seasons) ? crop.seasons.join(', ') : crop.seasons || 'Kharif'}
            />
          </div>
        </div>

        {/* Multilingual Names Strip */}
        <div className="p-3.5 bg-gray-50 border-b border-gray-100 text-xs">
          <span className="font-bold text-gray-500 text-[10px] uppercase tracking-wider block mb-1">
            Names across South Indian Languages:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-2 rounded-xl bg-white border border-gray-200">
              <span className="text-[10px] text-gray-400 block">English</span>
              <span className="font-extrabold text-gray-900 truncate block">{crop.name}</span>
            </div>
            <div className="p-2 rounded-xl bg-white border border-gray-200">
              <span className="text-[10px] text-gray-400 block">ಕನ್ನಡ (Kannada)</span>
              <span className="font-extrabold text-gray-900 truncate block">{crop.nameKannada || '-'}</span>
            </div>
            <div className="p-2 rounded-xl bg-white border border-gray-200">
              <span className="text-[10px] text-gray-400 block">தமிழ் (Tamil)</span>
              <span className="font-extrabold text-gray-900 truncate block">{crop.nameTamil || '-'}</span>
            </div>
            <div className="p-2 rounded-xl bg-white border border-gray-200">
              <span className="text-[10px] text-gray-400 block">తెలుగు (Telugu)</span>
              <span className="font-extrabold text-gray-900 truncate block">{crop.nameTelugu || '-'}</span>
            </div>
          </div>
        </div>

        {/* Nav Tabs */}
        <div className="flex border-b border-gray-100 bg-white px-2 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'sowing', label: 'Sowing & Nutrients' },
            { id: 'timeline', label: 'Stage Lifecycle' },
            { id: 'pests', label: 'Pest Guard' },
            { id: 'economics', label: 'Yield & Cost' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 min-h-[46px] py-2.5 px-3 text-xs font-bold transition-all relative flex items-center justify-center shrink-0 ${
                activeTab === tab.id ? 'text-forest' : 'text-gray-600 hover:text-gray-900'
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
        <div className="p-4 sm:p-6 space-y-4">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4 text-xs leading-relaxed">
              <p className="text-gray-900 font-medium text-sm">
                {language === 'kn' && crop.descriptionKn
                  ? crop.descriptionKn
                  : language === 'ta' && crop.descriptionTa
                  ? crop.descriptionTa
                  : language === 'te' && crop.descriptionTe
                  ? crop.descriptionTe
                  : crop.description ||
                    'Comprehensive agricultural package of practices approved by ICAR and regional agricultural universities.'}
              </p>

              {/* Confidence & Verification Note */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Confidence Level: {crop.confidence ? crop.confidence.toUpperCase() : 'HIGH'}</span>
                </div>
                <p className="text-[11px] text-emerald-800">
                  {crop.confidenceNote || 'Package of practices benchmarked from ICAR-IIHR, UAS Bangalore and TNAU agronomic bulletins.'}
                </p>
                <p className="text-[10px] text-emerald-700 italic">
                  Note: Verify specific seed varieties and localized microclimate recommendations with your local Raitha Samparka Kendra / Krishi Vigyan Kendra (KVK).
                </p>
              </div>

              {/* Climate & Soil Requirements */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-gray-900">
                    <Thermometer className="w-4 h-4 text-red-500" />
                    <span>Climate & Temperature</span>
                  </div>
                  <p className="text-[11px] text-gray-600">
                    Ideal Range: <strong>{crop.minTemp || 20}°C to {crop.maxTemp || 35}°C</strong>.
                  </p>
                  {crop.rainfallMm && (
                    <p className="text-[11px] text-gray-600">
                      Annual Rainfall: <strong>{crop.rainfallMm}</strong>
                    </p>
                  )}
                </div>

                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-gray-900">
                    <CloudRain className="w-4 h-4 text-blue-500" />
                    <span>Water & Irrigation</span>
                  </div>
                  <p className="text-[11px] text-gray-600">
                    Requirement: <strong>{crop.waterRequirement} ({crop.waterMm || '500-700 mm'})</strong>.
                  </p>
                  <p className="text-[11px] text-gray-600">
                    Critical Stages: Vegetative, Flowering & Pod/Fruit formation.
                  </p>
                </div>
              </div>

              {/* Suitable Soil Types */}
              {crop.idealSoilTypes && (
                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                  <span className="font-bold text-gray-900 block mb-1.5">Suitable Soil Types:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {crop.idealSoilTypes.map((st: string, idx: number) => (
                      <span
                        key={idx}
                        className="py-1 px-2.5 rounded-lg bg-white border border-gray-200 text-gray-700 font-bold capitalize text-[11px]"
                      >
                        {st} soil
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Intercropping & Gestation for Orchard / Long-term */}
              {(crop.gestationYears || crop.fruitingTime || (crop.intercroppingOptions && crop.intercroppingOptions.length > 0)) && (
                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2.5">
                  <span className="font-extrabold text-amber-900 text-xs flex items-center gap-1.5">
                    <Trees className="w-4 h-4 text-amber-700" />
                    <span>Orchard & Plantation Specifications:</span>
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    {crop.gestationYears && (
                      <div className="p-2 rounded-xl bg-white/80 border border-amber-100">
                        <span className="text-amber-800 block text-[10px]">Gestation Period</span>
                        <span className="font-bold text-amber-950">{crop.gestationYears} Years to commercial yield</span>
                      </div>
                    )}
                    {crop.fruitingTime && (
                      <div className="p-2 rounded-xl bg-white/80 border border-amber-100">
                        <span className="text-amber-800 block text-[10px]">Fruiting Schedule</span>
                        <span className="font-bold text-amber-950">{crop.fruitingTime}</span>
                      </div>
                    )}
                    {crop.roiEstimate && (
                      <div className="p-2 rounded-xl bg-white/80 border border-amber-100 col-span-2">
                        <span className="text-amber-800 block text-[10px]">Projected Economic ROI</span>
                        <span className="font-bold text-forest">{crop.roiEstimate}</span>
                      </div>
                    )}
                  </div>

                  {crop.intercroppingOptions && crop.intercroppingOptions.length > 0 && (
                    <div className="pt-1">
                      <span className="text-[11px] font-bold text-amber-950 block mb-1">
                        Recommended Multi-Tier Intercropping:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {crop.intercroppingOptions.map((opt: string, idx: number) => (
                          <span
                            key={idx}
                            className="py-0.5 px-2 rounded-md bg-white text-amber-900 text-[10px] font-bold border border-amber-200"
                          >
                            + {opt}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SOWING & NUTRIENTS */}
          {activeTab === 'sowing' && (
            <div className="space-y-4 text-xs leading-relaxed">
              <h3 className="text-sm font-bold text-gray-900">Agronomic Sowing & Spacing Specifications</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                  <span className="text-gray-500 font-semibold block text-[10px] uppercase">Sowing Time & Months</span>
                  <span className="font-bold text-gray-900 text-sm">
                    {Array.isArray(crop.sowingMonths) ? crop.sowingMonths.join(', ') : crop.sowingMonths || 'June - July'}
                  </span>
                  <p className="text-[11px] text-gray-500">
                    Harvest Window: {Array.isArray(crop.harvestMonths) ? crop.harvestMonths.join(', ') : crop.harvestMonths || 'October - November'}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                  <span className="text-gray-500 font-semibold block text-[10px] uppercase">Recommended Spacing</span>
                  <span className="font-bold text-gray-900 text-sm">
                    {crop.spacing || '45 cm × 15 cm'}
                  </span>
                  <p className="text-[11px] text-gray-500">
                    Row-to-row × Plant-to-plant optimum density
                  </p>
                </div>
              </div>

              {/* Fertilizer Schedule */}
              <div className="p-4 rounded-2xl bg-brand-50/40 dark:bg-brand-950/20 border border-brand-200/40 dark:border-brand-800/40 space-y-2.5">
                <span className="font-extrabold text-brand-800 dark:text-brand-300 text-sm flex items-center gap-1.5">
                  <FlaskConical className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  <span>ICAR Standard Fertilizer & Nutrient Schedule (Per Acre)</span>
                </span>
                <div className="space-y-2 text-gray-900">
                  <div className="p-2.5 rounded-xl bg-white border border-forest/10">
                    <strong className="text-forest font-extrabold block">1. Basal Application (At Sowing/Planting):</strong>
                    <span className="text-[11px] text-gray-600 block mt-0.5">
                      Apply 8-10 tonnes well-decomposed FYM/Compost + 50% Nitrogen (Urea) + 100% Phosphorus (DAP/SSP) + 50% Potash (MOP).
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-forest/10">
                    <strong className="text-forest font-extrabold block">2. First Top Dressing (30 Days After Sowing):</strong>
                    <span className="text-[11px] text-gray-600 block mt-0.5">
                      Apply 25% Nitrogen (Urea) following light weeding and earthing up. Irrigate immediately.
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-forest/10">
                    <strong className="text-forest font-extrabold block">3. Second Top Dressing (Flowering / Booting):</strong>
                    <span className="text-[11px] text-gray-600 block mt-0.5">
                      Apply remaining 25% Nitrogen + 50% Potash (MOP) to boost grain filling / fruit size.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STAGES & LIFECYCLE */}
          {activeTab === 'timeline' && (
            <div className="space-y-3 text-xs">
              <h3 className="text-sm font-bold text-gray-900 mb-1">
                Day 1 to Harvest Stage Roadmap
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
                          <span className="font-extrabold text-gray-900">{st.stage}</span>
                          <span className="text-[10px] text-forest font-bold">
                            Days {st.dayRange || st.duration}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-600 mt-0.5">
                          {st.description || (st.tasks && st.tasks.map((t: any) => t.taskName || t).join(' • '))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-600 bg-gray-50 rounded-2xl">
                  Full day-by-day task checklist generated upon adding crop to your field tracking plan.
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PESTS & DISEASES */}
          {activeTab === 'pests' && (
            <div className="space-y-3 text-xs">
              <h3 className="text-sm font-bold text-gray-900 mb-1">
                Common Pests & Integrated Pest Management (IPM)
              </h3>
              {crop.diseases && crop.diseases.length > 0 ? (
                <div className="space-y-2.5">
                  {crop.diseases.map((d: any, idx: number) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200">
                      <div className="flex items-center gap-1.5 font-bold text-amber-900">
                        <Bug className="w-4 h-4 text-amber-700" />
                        <span>{d.name || d}</span>
                      </div>
                      {d.symptoms && (
                        <p className="text-[11px] text-amber-900 mt-1">
                          <strong>Symptoms:</strong> {d.symptoms}
                        </p>
                      )}
                      {d.prevention && (
                        <p className="text-[11px] text-amber-800 mt-0.5">
                          <strong>IPM Remedy:</strong> {d.prevention}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
                    <span className="font-bold text-amber-900 block">Sucking Pests & Borers</span>
                    <span className="text-[11px] text-amber-800">
                      Install yellow sticky traps (10/acre) and spray Neem oil (5ml/L) at first notice of pest activity.
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200">
                    <span className="font-bold text-red-900 block">Fungal & Root Rot Management</span>
                    <span className="text-[11px] text-red-800">
                      Ensure good field drainage. Seed treatment with Trichoderma viride (10g/kg seed) before sowing.
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: ECONOMICS & YIELD */}
          {activeTab === 'economics' && (
            <div className="space-y-3.5 text-xs">
              <h3 className="text-sm font-bold text-gray-900 mb-1">
                Estimated Farm Economics & Market Viability (Per Acre)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">Approx. Cultivation Cost</span>
                  <span className="text-lg font-extrabold text-gray-900">
                    {crop.estimatedCost || crop.estimatedCostPerAcre || '₹18,000 - ₹24,000'}
                  </span>
                  <p className="text-[10px] text-gray-500">Includes land prep, seed, fertilizer & labor</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-mint border border-forest/20 space-y-1">
                  <span className="text-forest block text-[10px] uppercase font-bold">Potential Harvest Yield</span>
                  <span className="text-lg font-extrabold text-forest">
                    {crop.potentialYield || crop.potentialYieldPerAcre || '22 - 28 Quintals'}
                  </span>
                  <p className="text-[10px] text-forest/80">Under recommended ICAR scientific package</p>
                </div>
              </div>

              {crop.roiEstimate && (
                <div className="p-3.5 rounded-2xl bg-forest-50 border border-forest/20 flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-forest shrink-0" />
                  <div>
                    <span className="font-extrabold text-forest text-xs block">Expected Economic Returns</span>
                    <span className="text-[11px] text-gray-900">{crop.roiEstimate}</span>
                  </div>
                </div>
              )}

              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-[11px] text-gray-600">
                <strong>Post-Harvest & Storage:</strong> Dry produce to safe moisture levels (typically &lt;12% for grains/pulses). Store in clean, moisture-proof bags on raised wooden pallets.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Select Crop Sticky Action CTA */}
      <StickyBottomBar>
        <Button
          onClick={handleStartPlan}
          size="lg"
          fullWidth
          isLoading={isCreatingPlan}
          className="shadow-md shadow-forest/20 flex items-center justify-center gap-2 min-h-[46px]"
        >
          <span>{t('selectCrop') || 'Select Crop & Start Plan'}</span>
          <ArrowRight className="w-5 h-5" />
        </Button>
      </StickyBottomBar>
    </div>
  );
};
