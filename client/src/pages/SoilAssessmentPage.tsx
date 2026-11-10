import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  CloudRain,
  Droplets,
  Waves,
  HelpCircle,
  Check,
  Sparkles,
  MapPin,
  Calendar,
  Layers,
  AlertCircle,
  XCircle,
  Compass,
  FileText,
  Activity,
  Trees,
  Sun,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { StickyBottomBar } from '../components/ui/StickyBottomBar';
import { useTranslation } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import {
  LAND_UNIT_OPTIONS,
  getLandConversionSummary,
} from '../utils/landUnits';

// Soil components
import { SoilTypeSelector } from '../components/soil/SoilTypeSelector';
import { SoilHelpModal } from '../components/soil/SoilHelpModal';
import { PhSlider } from '../components/soil/PhSlider';
import { NpkSelector } from '../components/soil/NpkSelector';

// Location components
import { GoogleMapPicker } from '../components/location/GoogleMapPicker';
import { ManualLocationFallback } from '../components/location/ManualLocationFallback';

// Crop components
import { CategorySelector } from '../components/crops/CategorySelector';

const getCalculatedCurrentSeason = (): { season: string; monthLabel: string } => {
  const month = new Date().getMonth() + 1; // 1-12
  if (month >= 6 && month <= 10) {
    return { season: 'Kharif', monthLabel: 'Monsoon Sowing (June - October)' };
  } else if (month >= 11 || month <= 2) {
    return { season: 'Rabi', monthLabel: 'Winter Sowing (November - February)' };
  } else {
    return { season: 'Zaid', monthLabel: 'Summer Sowing (March - May)' };
  }
};

export const SoilAssessmentPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, language } = useTranslation();
  const { showToast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [useMapPicker, setUseMapPicker] = useState(true);

  // Season auto-detection state
  const [detectedSeason, setDetectedSeason] = useState<any | null>(null);
  const [isManualSeasonOverride, setIsManualSeasonOverride] = useState(false);
  const [isDetectingSeason, setIsDetectingSeason] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Soil Type & Cues
    soilType: '',
    soilColour: '',
    soilTexture: '',

    // Step 2: Soil Moisture, Organic Matter & Drainage
    moistureLevel: '',
    organicMatter: '',
    drainage: '',
    soilIssues: [] as string[],

    // Step 3: Location & Farm Size
    state: user?.state || 'Karnataka',
    district: user?.district || '',
    taluk: '',
    village: user?.village || '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    agroZone: '',
    farmSize: user?.farmSize || '',
    farmUnit: user?.farmUnit || 'Acres',
    guntas: '' as string | number,

    // Step 4: Water & Irrigation
    waterSource: '',
    irrigationType: '',

    // Step 5: Crop Category & Season
    category: '',
    season: '',
    previousCrop: '',
    budget: '',

    // Step 6: Soil Health Card (pH & NPK)
    hasSoilReport: false,
    ph: '' as string | number,
    isPhUnknown: true,
    npkLevelN: 'medium' as 'low' | 'medium' | 'high',
    npkLevelP: 'medium' as 'low' | 'medium' | 'high',
    npkLevelK: 'medium' as 'low' | 'medium' | 'high',
    nitrogen: '' as string | number,
    phosphorus: '' as string | number,
    potassium: '' as string | number,
  });

  // Load previous assessment values if available
  useEffect(() => {
    let isMounted = true;
    async function loadPastAssessment() {
      if (!user) return;
      try {
        const pastAssessments = await api.soil.getAssessments();
        if (isMounted && pastAssessments && pastAssessments.length > 0) {
          const latest = pastAssessments[0];
          setFormData((prev) => ({
            ...prev,
            soilType: latest.soilType || '',
            soilColour: latest.soilColour || '',
            soilTexture: latest.soilTexture || '',
            moistureLevel: latest.moistureLevel || '',
            organicMatter: latest.organicMatter || '',
            drainage: latest.drainage || '',
            waterSource: latest.waterSource || '',
            irrigationType: latest.irrigationType || '',
            state: latest.state || user.state || 'Karnataka',
            district: latest.district || user.district || '',
            taluk: latest.taluk || '',
            village: latest.village || user.village || '',
            farmSize: latest.farmSize || user.farmSize || '',
            farmUnit: latest.farmUnit || user.farmUnit || 'Acres',
            season: latest.season || '',
            category: latest.category || '',
            previousCrop: latest.previousCrop || '',
            budget: latest.budget || '',
            ph: latest.ph !== null && latest.ph !== undefined ? latest.ph : '',
            isPhUnknown: latest.ph === null || latest.ph === undefined,
            nitrogen: latest.nitrogen !== null && latest.nitrogen !== undefined ? latest.nitrogen : '',
            phosphorus: latest.phosphorus !== null && latest.phosphorus !== undefined ? latest.phosphorus : '',
            potassium: latest.potassium !== null && latest.potassium !== undefined ? latest.potassium : '',
            npkLevelN: (latest.npkNitrogen as any) || 'medium',
            npkLevelP: (latest.npkPhosphorus as any) || 'medium',
            npkLevelK: (latest.npkPotassium as any) || 'medium',
            hasSoilReport: Boolean(latest.ph || latest.nitrogen),
          }));
        }
      } catch {
        // Keep default state
      }
    }
    loadPastAssessment();
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Auto-detect season based on location and today's date
  useEffect(() => {
    let isMounted = true;
    async function loadDetectedSeason() {
      const locState = formData.state || user?.state || 'Karnataka';
      const locDistrict = formData.district || user?.district;
      const lat = formData.latitude ?? user?.latitude;
      const lon = formData.longitude ?? user?.longitude;

      if (!locDistrict && lat === undefined) return;

      setIsDetectingSeason(true);
      try {
        const res = await api.season.detect({
          state: locState,
          district: locDistrict,
          taluk: formData.taluk,
          lat: lat !== null ? lat : undefined,
          lon: lon !== null ? lon : undefined,
        });

        if (isMounted && res.success && res.data?.season) {
          setDetectedSeason(res.data.season);
          setFormData((prev) => ({
            ...prev,
            season: isManualSeasonOverride && prev.season ? prev.season : res.data.season.standardSeason,
          }));
        }
      } catch (err) {
        console.warn('Season detection fallback:', err);
      } finally {
        if (isMounted) setIsDetectingSeason(false);
      }
    }

    loadDetectedSeason();
    return () => {
      isMounted = false;
    };
  }, [formData.state, formData.district, formData.latitude, formData.longitude, user]);

  const waterSources = [
    {
      id: 'borewell',
      name: t('waterBorewell') || 'Borewell / Tube Well (ಬೋರ್‌ವೆಲ್)',
      icon: Droplets,
      desc: 'Underground pumped water supply',
    },
    {
      id: 'rainfed',
      name: t('waterRainfed') || 'Rainfed Only (ಮಳೆ ಆಶ್ರಿತ)',
      icon: CloudRain,
      desc: 'Monsoon-dependent agriculture',
    },
    {
      id: 'canal',
      name: t('waterCanal') || 'Canal Irrigation (ಕಾಲುವೆ ನೀರು)',
      icon: Waves,
      desc: 'River / reservoir canal network',
    },
    {
      id: 'tank',
      name: t('waterTank') || 'Farm Pond / Lake (ಕೆರೆ / ಹೊಂಡ)',
      icon: HelpCircle,
      desc: 'Rainwater harvesting pond storage',
    },
    {
      id: 'river',
      name: 'River / Stream Lift',
      icon: Waves,
      desc: 'Riverbank lift irrigation pump',
    },
  ];

  const irrigationTypes = [
    { id: 'drip', name: 'Drip Irrigation', desc: 'Saves 50% water, uniform delivery' },
    { id: 'sprinkler', name: 'Sprinkler System', desc: 'Ideal for undulating terrain' },
    { id: 'flood', name: 'Flood / Furrow', desc: 'Traditional gravity flow' },
    { id: 'rainfed', name: 'Rainfed (No System)', desc: 'Dependent on seasonal showers' },
  ];

  const soilColours = [
    { id: 'red', name: 'Red / Reddish Brown', color: 'bg-red-700' },
    { id: 'black', name: 'Deep Black / Dark Grey', color: 'bg-stone-900' },
    { id: 'brown', name: 'Medium Brown / Loam', color: 'bg-amber-900' },
    { id: 'yellow', name: 'Yellowish / Light Ocre', color: 'bg-yellow-600' },
    { id: 'grey', name: 'Light Grey / Alluvial', color: 'bg-stone-500' },
  ];

  const soilTextures = [
    { id: 'clayey', name: 'Clayey / Sticky', desc: 'Forms tight ribbons, sticky when wet' },
    { id: 'sandy', name: 'Sandy / Gritty', desc: 'Gritty feel, slips through fingers' },
    { id: 'loamy', name: 'Loamy / Crumbly', desc: 'Soft, crumbly, holds together gently' },
    { id: 'silty', name: 'Silty / Smooth', desc: 'Smooth floury feel when dry, slippery wet' },
  ];

  const moistureLevels = [
    { id: 'dry', name: 'Dry / Arid', desc: 'Crumbly, low soil moisture' },
    { id: 'moderate', name: 'Adequate / Moist', desc: 'Optimal moisture, cool to touch' },
    { id: 'wet', name: 'Very Wet', desc: 'High water saturation' },
    { id: 'waterlogged', name: 'Waterlogged', desc: 'Standing water / puddle risk' },
  ];

  const organicMatterLevels = [
    { id: 'low', name: 'Low (<0.5%)', desc: 'Pale color, little earthworm activity' },
    { id: 'medium', name: 'Medium (0.5% - 0.75%)', desc: 'Healthy soil with moderate compost' },
    { id: 'high', name: 'High (>0.75%)', desc: 'Dark rich humus, frequent FYM application' },
  ];

  const drainageOptions = [
    { id: 'good', label: 'Good / Well Drained', desc: 'Rainwater absorbs within a few hours' },
    { id: 'moderate', label: 'Moderate Drainage', desc: 'Holds moisture, drains in 12-24 hours' },
    { id: 'poor', label: 'Poor / Waterlogged', desc: 'Prone to stagnant water, clay compaction' },
  ];

  // Validation
  const validateCurrentStep = (): boolean => {
    setStepError(null);

    if (currentStep === 1) {
      if (!formData.soilType) {
        setStepError('Please select your soil type. Tap "Help me identify" if unsure.');
        return false;
      }
    }

    if (currentStep === 2) {
      if (!formData.drainage) {
        setStepError('Please select your field drainage condition.');
        return false;
      }
    }

    if (currentStep === 3) {
      if (!formData.district || formData.district.trim() === '') {
        setStepError('Please select or enter your District.');
        return false;
      }
      if (!formData.farmSize || Number(formData.farmSize) <= 0) {
        setStepError('Please enter your farm land size.');
        return false;
      }
    }

    if (currentStep === 4) {
      if (!formData.waterSource) {
        setStepError('Please select your water source.');
        return false;
      }
    }

    if (currentStep === 5) {
      if (!formData.season) {
        setStepError('Please select a sowing season or use current season.');
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    if (currentStep < 7) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    setStepError(null);
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else {
      navigate(-1);
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;
    setIsLoading(true);
    setStepError(null);

    try {
      // Calculate total guntas: if farmUnit is Acres, Acres * 40 + additional guntas
      let totalGuntas: number | undefined = undefined;
      const acresVal = Number(formData.farmSize) || 0;
      const additionalGuntas = Number(formData.guntas) || 0;
      if (formData.farmUnit === 'Acres') {
        totalGuntas = Math.round(acresVal * 40 + additionalGuntas);
      } else if (formData.farmUnit === 'Guntas') {
        totalGuntas = Math.round(acresVal);
      }

      const payload = {
        soilType: formData.soilType,
        soilColour: formData.soilColour || undefined,
        soilTexture: formData.soilTexture || undefined,
        moistureLevel: formData.moistureLevel || undefined,
        organicMatter: formData.organicMatter || undefined,
        drainage: formData.drainage || 'good',
        soilIssues: formData.soilIssues.join(', ') || undefined,

        state: formData.state || 'Karnataka',
        district: formData.district || 'Mandya',
        taluk: formData.taluk || undefined,
        village: formData.village || undefined,
        latitude: formData.latitude,
        longitude: formData.longitude,
        farmSize: Number(formData.farmSize) || 2.0,
        farmUnit: formData.farmUnit || 'Acres',
        landSizeGuntas: totalGuntas,

        waterSource: formData.waterSource || 'borewell',
        irrigationType: formData.irrigationType || undefined,

        category: formData.category || undefined,
        season: formData.season || 'Kharif',
        previousCrop: formData.previousCrop || 'None',
        budget: formData.budget || 'medium',

        ph: !formData.isPhUnknown && formData.ph !== '' ? Number(formData.ph) : null,
        nitrogen: formData.nitrogen !== '' ? Number(formData.nitrogen) : null,
        phosphorus: formData.phosphorus !== '' ? Number(formData.phosphorus) : null,
        potassium: formData.potassium !== '' ? Number(formData.potassium) : null,
        npkNitrogen: formData.npkLevelN,
        npkPhosphorus: formData.npkLevelP,
        npkPotassium: formData.npkLevelK,
      };

      const res = await api.soil.submitAssessment(payload);
      showToast(t('toastSuccess') || 'Assessment saved successfully!', 'success');

      navigate('/crops', {
        state: {
          assessment: res.assessment,
          recommendations: res.recommendations,
        },
      });
    } catch (err: any) {
      setStepError(err.message || 'Failed to submit soil assessment. Please try again.');
      setIsLoading(false);
    }
  };

  const currentSeasonInfo = getCalculatedCurrentSeason();
  const conversionSummary = getLandConversionSummary(
    formData.farmSize,
    formData.farmUnit,
    language
  );

  return (
    <div className="max-w-2xl mx-auto py-2 pb-24 px-3 sm:px-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={handleBack}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-white border border-earth-200 text-earth-800 hover:bg-earth-50 transition"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h1 className="text-sm font-extrabold text-earth-900">
            {language === 'kn'
              ? 'ವಿಸ್ತೃತ ಮಣ್ಣಿನ ಪರೀಕ್ಷೆ ಮತ್ತು ಜಮೀನು ವಿವರ'
              : language === 'ta'
              ? 'விரிவான மண் சோதனை & பண்ணை விவரம்'
              : language === 'te'
              ? 'వివరణాత్మక నేల పరీక్ష & వ్యవసాయ వివరాలు'
              : 'Advanced Soil & Field Assessment'}
          </h1>
          <span className="text-xs font-bold text-forest-700">
            Step {currentStep} of 7: {
              currentStep === 1
                ? 'Soil Type & Cues'
                : currentStep === 2
                ? 'Moisture & Drainage'
                : currentStep === 3
                ? 'Location & Land Size'
                : currentStep === 4
                ? 'Water & Irrigation'
                : currentStep === 5
                ? 'Crop Category & Season'
                : currentStep === 6
                ? 'Soil Health Card (pH & NPK)'
                : 'Review & Generate Plan'
            }
          </span>
        </div>

        <button
          onClick={() => navigate('/home')}
          className="text-xs text-earth-500 hover:text-earth-900 font-bold px-2 py-1 rounded-lg"
        >
          Cancel
        </button>
      </div>

      {/* Progress Dots */}
      <div className="flex items-center gap-1.5 justify-center mb-4">
        {[1, 2, 3, 4, 5, 6, 7].map((s) => (
          <div
            key={s}
            className={`h-2 rounded-full transition-all duration-300 ${
              s === currentStep
                ? 'w-8 bg-forest-600'
                : s < currentStep
                ? 'w-3 bg-mint-500'
                : 'w-3 bg-earth-200'
            }`}
          />
        ))}
      </div>

      {/* Validation Alert */}
      {stepError && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 mb-4 rounded-2xl bg-amber-50 border border-amber-300 text-xs font-bold text-amber-900 flex items-start gap-2.5 shadow-sm"
        >
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <span className="flex-1">{stepError}</span>
          <button onClick={() => setStepError(null)} className="text-amber-500 hover:text-amber-800">
            <XCircle className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* Step Container Card */}
      <div className="bg-white rounded-3xl border border-earth-200/80 shadow-md p-5 sm:p-6 min-h-[480px] flex flex-col justify-between">
        <AnimatePresence mode="wait">
          {/* STEP 1: Soil Type Selection (7 Types) + Visual Cues Modal */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div>
                <h2 className="text-base font-extrabold text-earth-900 mb-1">
                  1. What type of soil is on your land? *
                </h2>
                <p className="text-xs text-earth-500 mb-4">
                  Select your soil type below. Tap "Help me identify" for tactile and squeeze tests.
                </p>

                <SoilTypeSelector
                  selectedType={formData.soilType}
                  onSelectType={(st: string) => {
                    setFormData({ ...formData, soilType: st });
                    setStepError(null);
                  }}
                  onOpenHelp={() => setShowHelpModal(true)}
                />
              </div>

              {/* Secondary Texture & Colour Cues */}
              <div className="pt-2 border-t border-earth-100 space-y-3">
                <label className="block text-xs font-bold text-earth-800">
                  Soil Texture Feel (Optional)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {soilTextures.map((st) => {
                    const isSelected = formData.soilTexture === st.id;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            soilTexture: isSelected ? '' : st.id,
                          })
                        }
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-forest-50 border-forest-500 text-forest-800 ring-1 ring-forest-400'
                            : 'bg-white border-earth-200 text-earth-700 hover:bg-earth-50'
                        }`}
                      >
                        <span className="text-xs font-bold block">{st.name}</span>
                        <span className="text-[10px] text-earth-400 block mt-0.5">{st.desc}</span>
                      </button>
                    );
                  })}
                </div>

                <label className="block text-xs font-bold text-earth-800 pt-1">
                  Soil Colour Shade (Optional)
                </label>
                <div className="flex flex-wrap gap-2">
                  {soilColours.map((sc) => {
                    const isSelected = formData.soilColour === sc.id;
                    return (
                      <button
                        key={sc.id}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            soilColour: isSelected ? '' : sc.id,
                          })
                        }
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-forest-600 text-white border-forest-600 shadow-sm'
                            : 'bg-white text-earth-700 border-earth-200 hover:bg-earth-50'
                        }`}
                      >
                        <span className={`w-3 h-3 rounded-full ${sc.color} border border-white`} />
                        <span>{sc.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Soil Moisture, Organic Matter & Drainage */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <h2 className="text-base font-extrabold text-earth-900 mb-1">
                  2. Drainage, Moisture & Soil Health *
                </h2>
                <p className="text-xs text-earth-500 mb-3">
                  These physical properties determine root aeration and crop waterlogging tolerance.
                </p>
              </div>

              {/* Drainage */}
              <div>
                <label className="block text-xs font-bold text-earth-800 mb-1.5">
                  Field Drainage Condition *
                </label>
                <div className="space-y-2">
                  {drainageOptions.map((d) => {
                    const isSelected = formData.drainage === d.id;
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, drainage: d.id });
                          setStepError(null);
                        }}
                        className={`w-full p-3 rounded-2xl border-2 text-left flex items-center justify-between transition-all ${
                          isSelected
                            ? 'border-forest-600 bg-mint-50/80 font-bold text-forest-900 shadow-sm'
                            : 'border-earth-200 bg-white text-earth-800 hover:border-earth-300'
                        }`}
                      >
                        <div>
                          <span className="text-xs font-extrabold block">{d.label}</span>
                          <span className="text-[10px] text-earth-500 block">{d.desc}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-forest-600 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Moisture Level */}
              <div>
                <label className="block text-xs font-bold text-earth-800 mb-1.5">
                  Current Soil Moisture
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {moistureLevels.map((ml) => {
                    const isSelected = formData.moistureLevel === ml.id;
                    return (
                      <button
                        key={ml.id}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, moistureLevel: isSelected ? '' : ml.id })
                        }
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-forest-50 border-forest-500 text-forest-800 font-bold ring-1 ring-forest-400'
                            : 'bg-white border-earth-200 text-earth-700 hover:bg-earth-50'
                        }`}
                      >
                        <span className="text-xs block">{ml.name}</span>
                        <span className="text-[10px] text-earth-400 block">{ml.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Organic Matter Level */}
              <div>
                <label className="block text-xs font-bold text-earth-800 mb-1.5">
                  Organic Matter / Humus Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {organicMatterLevels.map((om) => {
                    const isSelected = formData.organicMatter === om.id;
                    return (
                      <button
                        key={om.id}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, organicMatter: isSelected ? '' : om.id })
                        }
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          isSelected
                            ? 'bg-forest-600 text-white border-forest-600 font-bold shadow-xs'
                            : 'bg-white border-earth-200 text-earth-700 hover:bg-earth-50'
                        }`}
                      >
                        <span className="text-xs block">{om.name}</span>
                        <span className={`text-[9px] block mt-0.5 ${isSelected ? 'text-mint-200' : 'text-earth-400'}`}>
                          {om.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Location with Google Maps & Land Size */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-extrabold text-earth-900 mb-1">
                    3. Exact Farm Location & Land Size *
                  </h2>
                  <p className="text-xs text-earth-500">
                    Locate your farm on Google Maps to fetch local agro-climatic zone and live weather.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setUseMapPicker(!useMapPicker)}
                  className="text-xs font-bold text-forest-700 hover:underline flex items-center gap-1"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>{useMapPicker ? 'Use Dropdowns' : 'Use Map'}</span>
                </button>
              </div>

              {/* Location Picker: Map or Fallback Dropdowns */}
              {useMapPicker ? (
                <GoogleMapPicker
                  initialLat={formData.latitude}
                  initialLon={formData.longitude}
                  initialDistrict={formData.district}
                  onLocationSelected={(loc: any) => {
                    setFormData((prev) => ({
                      ...prev,
                      latitude: loc.latitude || loc.lat,
                      longitude: loc.longitude || loc.lon,
                      district: loc.district || prev.district,
                      taluk: loc.taluk || prev.taluk,
                      state: loc.state || prev.state,
                      agroZone: loc.agroZone || prev.agroZone,
                    }));
                    setStepError(null);
                  }}
                />
              ) : (
                <ManualLocationFallback
                  selectedState={formData.state}
                  selectedDistrict={formData.district}
                  selectedTaluk={formData.taluk}
                  onLocationChange={(loc: any) => {
                    setFormData((prev) => ({
                      ...prev,
                      state: loc.state,
                      district: loc.district,
                      taluk: loc.taluk,
                      agroZone: loc.agroZone || prev.agroZone,
                      latitude: loc.latitude || loc.lat,
                      longitude: loc.longitude || loc.lon,
                    }));
                    setStepError(null);
                  }}
                />
              )}

              {/* Land Size: Acres + Guntas */}
              <div className="p-4 rounded-2xl bg-earth-50 border border-earth-200">
                <label className="block text-xs font-extrabold text-earth-900 mb-1.5">
                  Farm Land Size & Unit *
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <span className="text-[10px] text-earth-500 block mb-0.5">Primary Measurement</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.1"
                      min="0.1"
                      value={formData.farmSize}
                      onChange={(e) => {
                        setFormData({ ...formData, farmSize: e.target.value });
                        setStepError(null);
                      }}
                      placeholder="e.g. 2"
                      className="w-full px-3 py-2.5 rounded-xl border border-earth-300 text-base font-bold bg-white outline-none focus:border-forest-600 min-h-[44px]"
                    />
                  </div>

                  <div className="w-36">
                    <span className="text-[10px] text-earth-500 block mb-0.5">Unit</span>
                    <select
                      value={formData.farmUnit}
                      onChange={(e) => setFormData({ ...formData, farmUnit: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-earth-300 text-sm font-bold bg-white outline-none focus:border-forest-600 min-h-[44px]"
                    >
                      {LAND_UNIT_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {language === 'kn' ? opt.labelKn : opt.labelEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  {formData.farmUnit === 'Acres' && (
                    <div className="w-28">
                      <span className="text-[10px] text-earth-500 block mb-0.5">+ Guntas</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        min="0"
                        max="39"
                        value={formData.guntas}
                        onChange={(e) => setFormData({ ...formData, guntas: e.target.value })}
                        placeholder="0 - 39"
                        className="w-full px-3 py-2.5 rounded-xl border border-earth-300 text-base font-bold bg-white outline-none focus:border-forest-600 min-h-[44px]"
                      />
                    </div>
                  )}
                </div>

                {conversionSummary && (
                  <p className="text-[11px] font-bold text-forest-700 mt-2 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5" />
                    <span>{conversionSummary}</span>
                  </p>
                )}
                <span className="text-[10px] text-earth-500 block mt-1">
                  1 Acre = 40 Guntas = 43,560 sq.ft = 0.404 Hectares.
                </span>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Water Source & Irrigation Method */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <h2 className="text-base font-extrabold text-earth-900 mb-1">
                  4. Water Availability & Irrigation Method *
                </h2>
                <p className="text-xs text-earth-500 mb-3">
                  Crop water requirements must match your pumping capacity and rainfall dependence.
                </p>
              </div>

              {/* Water Source */}
              <div>
                <label className="block text-xs font-bold text-earth-800 mb-1.5">
                  Primary Water Source *
                </label>
                <div className="space-y-2">
                  {waterSources.map((ws) => {
                    const Icon = ws.icon;
                    const isSelected = formData.waterSource === ws.id;
                    return (
                      <button
                        key={ws.id}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, waterSource: ws.id });
                          setStepError(null);
                        }}
                        className={`w-full p-3 rounded-2xl border-2 flex items-center gap-3 text-left transition-all ${
                          isSelected
                            ? 'border-forest-600 bg-mint-50/80 shadow-xs ring-1 ring-forest-400'
                            : 'border-earth-200 bg-white hover:border-earth-300'
                        }`}
                      >
                        <div
                          className={`p-2.5 rounded-xl flex-shrink-0 ${
                            isSelected ? 'bg-forest-600 text-white' : 'bg-earth-100 text-forest-700'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <span className="text-xs font-extrabold text-earth-900 block leading-tight">
                            {ws.name}
                          </span>
                          <span className="text-[10px] text-earth-500 block mt-0.5">{ws.desc}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-forest-600 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Irrigation Type */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-earth-800 mb-1.5">
                  Irrigation Delivery Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {irrigationTypes.map((it) => {
                    const isSelected = formData.irrigationType === it.id;
                    return (
                      <button
                        key={it.id}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            irrigationType: isSelected ? '' : it.id,
                          })
                        }
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-forest-50 border-forest-500 text-forest-900 font-bold ring-1 ring-forest-400'
                            : 'bg-white border-earth-200 text-earth-700 hover:bg-earth-50'
                        }`}
                      >
                        <span className="text-xs block">{it.name}</span>
                        <span className="text-[10px] text-earth-400 block">{it.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 5: Crop Preferences, Season & Preceding Crop */}
          {currentStep === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <h2 className="text-base font-extrabold text-earth-900 mb-1">
                  5. Crop Category & Planting Season *
                </h2>
                <p className="text-xs text-earth-500 mb-3">
                  Filter by desired category or let Krushi Sathi recommend across all options.
                </p>
              </div>

              {/* Category Selector */}
              <div>
                <CategorySelector
                  selectedCategory={formData.category}
                  onSelectCategory={(cat) => setFormData({ ...formData, category: cat })}
                />
              </div>

              {/* Auto-Detected Sowing Season from Location & Date */}
              <div className="pt-2 border-t border-earth-100">
                {!formData.district && formData.latitude === undefined ? (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="text-xs font-extrabold block">Location Required for Sowing Season</span>
                      <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                        Please set your farm location (Step 3) to automatically determine your agro-climatic sowing window, weather risks, and crop suitability.
                      </p>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(3)}
                        className="mt-2.5 px-3.5 py-1.5 bg-amber-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-amber-700 cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Set Farm Location (Step 3) →</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-mint-50/70 to-cream-light/60 border border-forest-200 shadow-2xs">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-forest-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-forest-100 text-forest-800 border border-forest-200/60 inline-block mb-1">
                            {isDetectingSeason ? 'Detecting Regional Calendar...' : 'Auto-Detected Sowing Season'}
                          </span>
                          <p className="text-xs sm:text-sm font-bold text-dark-text leading-snug">
                            {language === 'kn'
                              ? detectedSeason?.confirmationLine?.kn
                              : language === 'ta'
                              ? detectedSeason?.confirmationLine?.ta
                              : language === 'te'
                              ? detectedSeason?.confirmationLine?.te
                              : detectedSeason?.confirmationLine?.en ||
                                `Detected: ${formData.season || 'Rabi'} sowing season in ${formData.district || 'your area'}.`}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-dark-muted font-medium">
                            <span className="font-bold text-forest flex items-center gap-1">
                              <span>Window:</span>
                              <span className="text-dark-text">{detectedSeason?.sowingWindow || 'Active Sowing Window'}</span>
                            </span>
                            {detectedSeason?.sowingWindowStatus && (
                              <span
                                className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                  detectedSeason.sowingWindowStatus === 'open'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : detectedSeason.sowingWindowStatus === 'closing_soon'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {detectedSeason.sowingWindowStatus === 'open'
                                  ? 'Active Sowing Window'
                                  : detectedSeason.sowingWindowStatus === 'closing_soon'
                                  ? `Closing Soon (${detectedSeason.daysRemainingInWindow}d left)`
                                  : 'Window Closed'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsManualSeasonOverride(!isManualSeasonOverride)}
                        className="text-xs font-bold text-forest-700 hover:text-forest-900 underline shrink-0 cursor-pointer px-1 py-0.5"
                      >
                        {isManualSeasonOverride ? 'Hide' : 'Change'}
                      </button>
                    </div>

                    {/* Manual Season Override Expansion */}
                    {isManualSeasonOverride && (
                      <div className="mt-3.5 pt-3 border-t border-forest-200/60 space-y-2">
                        <span className="text-xs font-bold text-dark-text block">
                          Manual Season Override:
                        </span>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: 'Kharif', label: 'Kharif', sub: 'Jun - Oct (Monsoon)', iconComponent: CloudRain },
                            { id: 'Rabi', label: 'Rabi', sub: 'Oct - Mar (Winter)', iconComponent: Activity },
                            { id: 'Zaid', label: 'Zaid', sub: 'Mar - Jun (Summer)', iconComponent: Sun },
                          ].map((s) => {
                            const isSelected = formData.season === s.id;
                            const SeasonIcon = s.iconComponent;
                            return (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => {
                                  setFormData({ ...formData, season: s.id });
                                  setStepError(null);
                                }}
                                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                                  isSelected
                                    ? 'border-forest-600 bg-white font-extrabold text-forest-900 shadow-sm ring-2 ring-forest-400/30'
                                    : 'border-earth-200 bg-white/70 text-earth-800 hover:bg-white'
                                }`}
                              >
                                <SeasonIcon className="w-5 h-5 mx-auto mb-1 text-forest-600" />
                                <span className="text-xs block font-bold">{s.label}</span>
                                <span className="text-[10px] text-earth-500 block">{s.sub}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Preceding Crop */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-earth-800 mb-1.5">
                  Preceding Crop (For Crop Rotation)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    'None / Fallow',
                    'Paddy (Rice)',
                    'Pulses / Gram',
                    'Maize',
                    'Sugarcane',
                    'Vegetables',
                  ].map((c) => {
                    const isSelected = formData.previousCrop === c;
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, previousCrop: isSelected ? '' : c })
                        }
                        className={`py-2 px-2 rounded-xl border text-xs text-center transition-all ${
                          isSelected
                            ? 'border-forest-600 bg-mint-50 text-forest-900 font-bold'
                            : 'border-earth-200 bg-white text-earth-700 hover:bg-earth-50'
                        }`}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 6: Soil Health Card (pH Slider + NPK Selector) */}
          {currentStep === 6 && (
            <motion.div
              key="step6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div>
                <h2 className="text-base font-extrabold text-earth-900 mb-1">
                  6. Soil Health Card (pH & NPK Lab Values)
                </h2>
                <p className="text-xs text-earth-500 mb-3">
                  Have laboratory soil test results? Enter them below for scientific precision.
                </p>
              </div>

              {/* Soil pH Slider */}
              <div className="bg-earth-50 p-4 rounded-2xl border border-earth-200">
                <PhSlider
                  value={formData.ph}
                  isUnknown={formData.isPhUnknown}
                  onChange={(val: string | number) => setFormData({ ...formData, ph: val })}
                  onToggleUnknown={(unk: boolean) => setFormData({ ...formData, isPhUnknown: unk })}
                />
              </div>

              {/* NPK Selector */}
              <div className="bg-earth-50 p-4 rounded-2xl border border-earth-200">
                <NpkSelector
                  nitrogenLevel={formData.npkLevelN}
                  phosphorusLevel={formData.npkLevelP}
                  potassiumLevel={formData.npkLevelK}
                  nitrogenExact={formData.nitrogen}
                  phosphorusExact={formData.phosphorus}
                  potassiumExact={formData.potassium}
                  onNitrogenChange={(lvl: any, exact?: string | number) =>
                    setFormData((prev) => ({
                      ...prev,
                      npkLevelN: lvl,
                      nitrogen: exact !== undefined ? exact : prev.nitrogen,
                    }))
                  }
                  onPhosphorusChange={(lvl: any, exact?: string | number) =>
                    setFormData((prev) => ({
                      ...prev,
                      npkLevelP: lvl,
                      phosphorus: exact !== undefined ? exact : prev.phosphorus,
                    }))
                  }
                  onPotassiumChange={(lvl: any, exact?: string | number) =>
                    setFormData((prev) => ({
                      ...prev,
                      npkLevelK: lvl,
                      potassium: exact !== undefined ? exact : prev.potassium,
                    }))
                  }
                />
              </div>
            </motion.div>
          )}

          {/* STEP 7: Review & Submit */}
          {currentStep === 7 && (
            <motion.div
              key="step7"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <h2 className="text-base font-extrabold text-earth-900 mb-1">
                  7. Review & Generate Recommendations
                </h2>
                <p className="text-xs text-earth-500 mb-3">
                  Review your farm assessment before generating tailored crop matches:
                </p>
              </div>

              <div className="bg-gradient-to-br from-earth-50 to-cream-50 rounded-2xl p-4 border border-earth-200 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2 pb-2 border-b border-earth-200/80">
                  <div>
                    <span className="text-[10px] text-earth-400 block">Soil Type:</span>
                    <span className="font-extrabold text-earth-900 capitalize">
                      {formData.soilType || 'Not specified'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-earth-400 block">Drainage:</span>
                    <span className="font-extrabold text-earth-900 capitalize">
                      {formData.drainage || 'Good'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pb-2 border-b border-earth-200/80">
                  <div>
                    <span className="text-[10px] text-earth-400 block">Location:</span>
                    <span className="font-extrabold text-earth-900">
                      {formData.district || 'Karnataka'}, {formData.taluk || formData.state}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-earth-400 block">Land Size:</span>
                    <span className="font-extrabold text-earth-900">
                      {formData.farmSize} {formData.farmUnit}
                      {formData.guntas ? ` + ${formData.guntas} Guntas` : ''}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pb-2 border-b border-earth-200/80">
                  <div>
                    <span className="text-[10px] text-earth-400 block">Water Source:</span>
                    <span className="font-extrabold text-earth-900 capitalize">
                      {formData.waterSource || 'Borewell'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-earth-400 block">Season & Category:</span>
                    <span className="font-extrabold text-earth-900">
                      {formData.season} ({formData.category ? formData.category : 'All Categories'})
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-earth-400 block">Soil Chemistry:</span>
                  <span className="font-semibold text-earth-800">
                    pH: {formData.isPhUnknown ? 'Standard' : formData.ph} | N: {formData.npkLevelN} | P: {formData.npkLevelP} | K: {formData.npkLevelK}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-forest-50 border border-forest-200 flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-forest-700 flex-shrink-0" />
                <p className="text-xs text-forest-900">
                  Our Agronomic Engine will evaluate 30+ crops against your exact soil type, rainfall, agro-climatic zone, and market demand.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sticky Action Button Footer */}
        <StickyBottomBar>
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="min-h-[46px] min-w-[76px] py-2.5 px-4 rounded-2xl border border-earth-300 text-earth-800 text-sm font-bold hover:bg-earth-50 transition active:scale-95"
            >
              {t('navBack') || 'Back'}
            </button>
          )}
          <Button
            type="button"
            onClick={handleNext}
            size="lg"
            fullWidth
            isLoading={isLoading}
            className="shadow-md shadow-forest-600/20 flex items-center justify-center gap-2 min-h-[46px]"
          >
            <span>{currentStep === 7 ? 'Generate Crop Recommendations' : 'Next Step'}</span>
            <ArrowRight className="w-5 h-5" />
          </Button>
        </StickyBottomBar>
      </div>

      {/* Squeeze Test Modal */}
      <SoilHelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        onSelectSoil={(st: string) => {
          setFormData((prev) => ({ ...prev, soilType: st }));
          setStepError(null);
        }}
      />
    </div>
  );
};
