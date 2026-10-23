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
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useTranslation } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  LAND_UNIT_OPTIONS,
  getLandConversionSummary,
  getLocalizedUnitLabel,
} from '../utils/landUnits';

// Determine the natural agricultural season based on current calendar month
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

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);

  // NO arbitrary preselected defaults for new assessments
  const [formData, setFormData] = useState({
    soilType: '', // starts UNSELECTED
    waterSource: '', // starts UNSELECTED
    irrigationType: '', // starts UNSELECTED
    state: user?.state || 'Karnataka',
    district: user?.district || '',
    village: user?.village || '',
    farmSize: user?.farmSize || '',
    farmUnit: user?.farmUnit || 'Acres',
    season: '', // starts UNSELECTED
    sowingMonth: '',
    previousCrop: '', // starts UNSELECTED
    hasSoilReport: false,
    ph: '' as string | number,
    nitrogen: '' as string | number,
    phosphorus: '' as string | number,
    potassium: '' as string | number,
    drainage: '', // starts UNSELECTED
    budget: '', // starts UNSELECTED
    soilIssues: '',
  });

  // Only load previous assessment values if this farmer has actually saved one before
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
            waterSource: latest.waterSource || '',
            irrigationType: latest.irrigationType || '',
            state: latest.state || user.state || 'Karnataka',
            district: latest.district || user.district || '',
            village: latest.village || user.village || '',
            farmSize: latest.farmSize || user.farmSize || '',
            farmUnit: latest.farmUnit || user.farmUnit || 'Acres',
            season: latest.season || '',
            previousCrop: latest.previousCrop || '',
            drainage: latest.drainage || '',
            budget: latest.budget || '',
            ph: latest.ph !== null && latest.ph !== undefined ? latest.ph : '',
            nitrogen: latest.nitrogen !== null && latest.nitrogen !== undefined ? latest.nitrogen : '',
            phosphorus: latest.phosphorus !== null && latest.phosphorus !== undefined ? latest.phosphorus : '',
            potassium: latest.potassium !== null && latest.potassium !== undefined ? latest.potassium : '',
            hasSoilReport: Boolean(latest.ph || latest.nitrogen),
          }));
        }
      } catch {
        // Silently keep clean unselected state if past fetch fails
      }
    }
    loadPastAssessment();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const soilTypes = [
    {
      id: 'red',
      name: t('soilRed') || 'Red Soil (ಕೆಂಪು ಮಣ್ಣು)',
      desc: 'Porous, well-drained, rich in iron',
      icon: '🧱',
    },
    {
      id: 'black',
      name: t('soilBlack') || 'Black Soil (ಕಪ್ಪು ಮಣ್ಣು)',
      desc: 'High clay, moisture retentive (Cotton/Sugarcane)',
      icon: '🌑',
    },
    {
      id: 'loamy',
      name: t('soilLoamy') || 'Loamy Soil (ಗೋಡು ಮಣ್ಣು)',
      desc: 'Ideal balanced mix of sand, silt, and clay',
      icon: '🌱',
    },
    {
      id: 'clay',
      name: t('soilClay') || 'Clay Soil (ಜೇಡಿ ಮಣ್ಣು)',
      desc: 'Heavy, high water-holding capacity (Paddy)',
      icon: '🏺',
    },
    {
      id: 'sandy',
      name: t('soilSandy') || 'Sandy Soil (ಮರಳು ಮಣ್ಣು)',
      desc: 'Fast draining, requires frequent light watering',
      icon: '🏖️',
    },
    {
      id: 'unknown',
      name: 'Not Sure / Mixed Soil',
      desc: 'Standard district agronomy rules will apply',
      icon: '❓',
    },
  ];

  const waterSources = [
    {
      id: 'rainfed',
      name: t('waterRainfed') || 'Rainfed Only (ಮಳೆ ಆಶ್ರಿತ)',
      icon: CloudRain,
      desc: 'Dependent on seasonal monsoon rains',
    },
    {
      id: 'borewell',
      name: t('waterBorewell') || 'Borewell / Tube Well (ಬೋರ್‌ವೆಲ್)',
      icon: Droplets,
      desc: 'Underground pump with regular supply',
    },
    {
      id: 'canal',
      name: t('waterCanal') || 'Canal Irrigation (ಕಾಲುವೆ ನೀರು)',
      icon: Waves,
      desc: 'Government irrigation canal system',
    },
    {
      id: 'tank',
      name: t('waterTank') || 'Farm Pond / Lake (ಕೆರೆ / ಹೊಂಡ)',
      icon: HelpCircle,
      desc: 'Surface rainwater harvesting storage',
    },
    {
      id: 'other',
      name: 'Not Sure / Seasonal Water',
      desc: 'General average water availability',
      icon: Droplets,
    },
  ];

  // Validate step before advancing
  const validateCurrentStep = (): boolean => {
    setStepError(null);

    if (currentStep === 1) {
      if (!formData.soilType) {
        setStepError('Please select your soil type. This is essential to find crops suited to your soil texture.');
        return false;
      }
      if (!formData.waterSource) {
        setStepError('Please select your water availability. Water source determines whether high or low-water crops will thrive.');
        return false;
      }
    }

    if (currentStep === 2) {
      if (!formData.district || formData.district.trim() === '') {
        setStepError('Please enter your District to match your agro-climatic zone and local rainfall.');
        return false;
      }
      if (!formData.farmSize || Number(formData.farmSize) <= 0) {
        setStepError('Please enter your land size (e.g. 1 Acre or 20 Guntas) to estimate seed cost and yield.');
        return false;
      }
    }

    if (currentStep === 3) {
      if (!formData.season) {
        setStepError('Please select a sowing season or choose "Use Current Season".');
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    if (currentStep < 5) {
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
      const payload = {
        ...formData,
        farmSize: Number(formData.farmSize) || 2.0,
        ph: formData.ph !== '' ? Number(formData.ph) : null,
        nitrogen: formData.nitrogen !== '' ? Number(formData.nitrogen) : null,
        phosphorus: formData.phosphorus !== '' ? Number(formData.phosphorus) : null,
        potassium: formData.potassium !== '' ? Number(formData.potassium) : null,
        season: formData.season || 'Kharif',
        previousCrop: formData.previousCrop || 'None',
        drainage: formData.drainage || 'good',
        budget: formData.budget || 'medium',
      };

      const res = await api.soil.submitAssessment(payload);

      // Navigate to /crops with the generated recommendations in state
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
  const conversionSummary = getLandConversionSummary(formData.farmSize, formData.farmUnit, language);

  return (
    <div className="max-w-xl mx-auto py-2">
      {/* Top Header with Progress */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={handleBack}
          className="p-2 rounded-full bg-white border border-gray-200 text-dark-text hover:bg-gray-50 transition"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="text-center">
          <h1 className="text-sm font-extrabold text-dark-text">
            {t('soilAssessmentTitle') || 'Field Assessment'}
          </h1>
          <span className="text-xs font-semibold text-forest">
            Step {currentStep} of 5
          </span>
        </div>

        <button
          onClick={() => navigate('/home')}
          className="p-1.5 text-xs text-dark-muted hover:text-dark-text font-bold"
        >
          Cancel
        </button>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center gap-1.5 justify-center mb-4">
        {[1, 2, 3, 4, 5].map((s) => (
          <div
            key={s}
            className={`h-2 rounded-full transition-all duration-300 ${
              s === currentStep
                ? 'w-10 bg-forest'
                : s < currentStep
                ? 'w-4 bg-leaf'
                : 'w-4 bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Validation Error Alert */}
      {stepError && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 mb-4 rounded-2xl bg-amber-50 border border-amber-300 text-xs font-bold text-amber-900 flex items-start gap-2.5 shadow-sm"
        >
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <span>{stepError}</span>
          </div>
          <button onClick={() => setStepError(null)} className="text-amber-500 hover:text-amber-800">
            <XCircle className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* Step Container Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-5 sm:p-6 min-h-[460px] flex flex-col justify-between">
        <AnimatePresence mode="wait">
          {/* STEP 1: Soil Texture & Water Availability (UNSELECTED BY DEFAULT) */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-base font-extrabold text-dark-text">
                    1. What type of soil is on your field? *
                  </h2>
                  {formData.soilType && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, soilType: '' })}
                      className="text-[11px] text-red-600 font-bold hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <p className="text-xs text-dark-muted mb-3">
                  Select the primary soil texture of your plot (nothing is preselected):
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {soilTypes.map((st) => {
                    const isSelected = formData.soilType === st.id;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            soilType: isSelected ? '' : st.id,
                          });
                          setStepError(null);
                        }}
                        className={`relative p-3 rounded-2xl border-2 flex flex-col items-center justify-center text-center transition-all ${
                          isSelected
                            ? 'border-forest bg-mint/80 shadow-md ring-2 ring-forest/20 scale-[1.02]'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-forest text-white flex items-center justify-center shadow-sm">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                        <span className="text-2xl mb-1">{st.icon}</span>
                        <span className="text-xs font-extrabold text-dark-text leading-tight block">
                          {st.name}
                        </span>
                        <span className="text-[10px] text-dark-muted leading-tight mt-1 line-clamp-2">
                          {st.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-base font-extrabold text-dark-text">
                    2. What is your water source? *
                  </h2>
                  {formData.waterSource && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, waterSource: '' })}
                      className="text-[11px] text-red-600 font-bold hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <p className="text-xs text-dark-muted mb-3">
                  Water availability is required to ensure suitable crop hydration:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {waterSources.map((ws) => {
                    const Icon = ws.icon;
                    const isSelected = formData.waterSource === ws.id;
                    return (
                      <button
                        key={ws.id}
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            waterSource: isSelected ? '' : ws.id,
                          });
                          setStepError(null);
                        }}
                        className={`p-3 rounded-2xl border-2 flex items-center gap-3 text-left transition-all ${
                          isSelected
                            ? 'border-forest bg-mint/80 shadow-md ring-2 ring-forest/20'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div
                          className={`p-2.5 rounded-xl flex-shrink-0 ${
                            isSelected ? 'bg-forest text-white' : 'bg-gray-100 text-forest'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <span className="text-xs font-extrabold text-dark-text block leading-tight">
                            {ws.name}
                          </span>
                          <span className="text-[10px] text-dark-muted block mt-0.5">
                            {ws.desc}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-forest text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Location & Land Measurements (Supports Indian Units) */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <h2 className="text-base font-extrabold text-dark-text mb-1">
                  Farm Location & Plot Size *
                </h2>
                <p className="text-xs text-dark-muted mb-3">
                  Helps calibrate local weather, regional rainfall, and estimated yields:
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-dark-text mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-gray-200 text-xs font-semibold focus:border-forest outline-none bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-dark-text mb-1">
                    District *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.district}
                    onChange={(e) => {
                      setFormData({ ...formData, district: e.target.value });
                      setStepError(null);
                    }}
                    placeholder="e.g. Mandya / Mysore / Belagavi"
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-gray-200 text-xs font-semibold focus:border-forest outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-dark-text mb-1">
                  Village / Hobli (Optional)
                </label>
                <div className="relative flex items-center">
                  <MapPin className="absolute left-3 w-4 h-4 text-forest" />
                  <input
                    type="text"
                    value={formData.village}
                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                    placeholder="Enter village or hobli name"
                    className="w-full pl-9 pr-3 py-2.5 rounded-2xl border border-gray-200 text-xs font-semibold focus:border-forest outline-none"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-cream-light border border-harvest/20">
                <label className="block text-xs font-extrabold text-dark-text mb-1">
                  Plot Size & Measurement Unit *
                </label>
                <div className="flex gap-2.5">
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={formData.farmSize}
                    onChange={(e) => {
                      setFormData({ ...formData, farmSize: e.target.value });
                      setStepError(null);
                    }}
                    placeholder="e.g. 2"
                    className="w-28 px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-extrabold focus:border-forest outline-none bg-white"
                  />
                  <select
                    value={formData.farmUnit}
                    onChange={(e) => setFormData({ ...formData, farmUnit: e.target.value })}
                    className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-extrabold focus:border-forest outline-none bg-white"
                  >
                    {LAND_UNIT_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {language === 'kn' ? opt.labelKn : language === 'ta' ? opt.labelTa : language === 'te' ? opt.labelTe : opt.labelEn}
                      </option>
                    ))}
                  </select>
                </div>

                {conversionSummary && (
                  <p className="text-[11px] font-bold text-forest mt-2 flex items-center gap-1.5">
                    <span>📐</span>
                    <span>{conversionSummary}</span>
                  </p>
                )}
                <span className="text-[10px] text-dark-muted block mt-1">
                  Supports Acres, Guntas (1 Acre = 40 Guntas), Cents, and Hectares.
                </span>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Sowing Season & Crop History (UNSELECTED BY DEFAULT) */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <h2 className="text-base font-extrabold text-dark-text mb-1">
                  Sowing Season & Preceding Crop *
                </h2>
                <p className="text-xs text-dark-muted mb-2">
                  Matching season ensures rainfall alignment. Crop rotation prevents soil nutrient depletion:
                </p>

                {/* Date-Derived Quick Shortcut */}
                <div className="p-3 rounded-2xl bg-mint/50 border border-forest/20 flex items-center justify-between mb-3">
                  <div>
                    <span className="text-xs font-bold text-forest block">
                      Current Natural Season: {currentSeasonInfo.season}
                    </span>
                    <span className="text-[10px] text-dark-muted">
                      {currentSeasonInfo.monthLabel}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, season: currentSeasonInfo.season });
                      setStepError(null);
                    }}
                    className="py-1 px-3 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest-dark transition"
                  >
                    Select {currentSeasonInfo.season}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-dark-text mb-2">
                  Choose Planting Season *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'Kharif', label: 'Kharif (ಖಾರೀಫ್)', icon: '🌧️', sub: 'Monsoon' },
                    { id: 'Rabi', label: 'Rabi (ರಬಿ)', icon: '❄️', sub: 'Winter' },
                    { id: 'Zaid', label: 'Zaid (ಜೈದ್)', icon: '☀️', sub: 'Summer' },
                  ].map((s) => {
                    const isSelected = formData.season === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, season: isSelected ? '' : s.id });
                          setStepError(null);
                        }}
                        className={`p-3 rounded-2xl border-2 text-center transition-all ${
                          isSelected
                            ? 'border-forest bg-mint font-extrabold text-forest shadow-sm ring-2 ring-forest/20'
                            : 'border-gray-200 bg-white text-dark-text hover:border-gray-300'
                        }`}
                      >
                        <span className="text-xl block mb-1">{s.icon}</span>
                        <span className="text-xs block font-bold">{s.label}</span>
                        <span className="text-[10px] text-dark-muted block">{s.sub}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-dark-text">
                    What was grown here previously?
                  </label>
                  {formData.previousCrop && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, previousCrop: '' })}
                      className="text-[11px] text-red-600 font-bold hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    'None / Fallow land',
                    'Paddy (Rice)',
                    'Maize',
                    'Sugarcane',
                    'Cotton',
                    'Pulses / Gram',
                    'Groundnut',
                    'Tomato / Veg',
                    'Not Sure / First Time',
                  ].map((cropName) => {
                    const isSelected = formData.previousCrop === cropName;
                    return (
                      <button
                        key={cropName}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            previousCrop: isSelected ? '' : cropName,
                          })
                        }
                        className={`py-2 px-2.5 rounded-xl border text-xs text-left transition-all ${
                          isSelected
                            ? 'border-forest bg-mint text-forest font-bold shadow-sm'
                            : 'border-gray-200 bg-white text-dark-text hover:bg-gray-50'
                        }`}
                      >
                        {cropName}
                      </button>
                    );
                  })}
                </div>
                <span className="text-[10px] text-dark-muted mt-1.5 block">
                  💡 Legume crops like pulses leave natural nitrogen in the soil for the next crop.
                </span>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Optional Soil Testing Lab Values (EMPTY BY DEFAULT) */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <h2 className="text-base font-extrabold text-dark-text mb-1">
                  Soil Health Card Laboratory Values (Optional)
                </h2>
                <p className="text-xs text-dark-muted mb-3">
                  If you have tested your soil in a government Soil Health lab, enter values below. If not tested, simply skip this step:
                </p>
              </div>

              {/* Toggle Switch */}
              <div
                onClick={() =>
                  setFormData({ ...formData, hasSoilReport: !formData.hasSoilReport })
                }
                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-colors flex items-center justify-between ${
                  formData.hasSoilReport
                    ? 'border-forest bg-mint/80 text-forest'
                    : 'border-gray-200 bg-white text-dark-text hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-forest" />
                  <span className="text-xs font-extrabold">
                    {formData.hasSoilReport ? '✓ I have laboratory soil test values' : 'No soil test report (Skip this)'}
                  </span>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    formData.hasSoilReport ? 'bg-forest text-white' : 'border-gray-300'
                  }`}
                >
                  {formData.hasSoilReport && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>

              {formData.hasSoilReport ? (
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-dark-text mb-1">
                        Soil pH (e.g. 6.5 - 7.5)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="3"
                        max="11"
                        value={formData.ph}
                        onChange={(e) => setFormData({ ...formData, ph: e.target.value })}
                        placeholder="e.g. 6.8"
                        className="w-full px-3.5 py-2.5 rounded-2xl border border-gray-200 text-xs font-bold focus:border-forest outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-dark-text mb-1">
                        Nitrogen (kg/ha)
                      </label>
                      <input
                        type="number"
                        value={formData.nitrogen}
                        onChange={(e) => setFormData({ ...formData, nitrogen: e.target.value })}
                        placeholder="e.g. 280"
                        className="w-full px-3.5 py-2.5 rounded-2xl border border-gray-200 text-xs font-bold focus:border-forest outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-dark-text mb-1">
                        Phosphorus (kg/ha)
                      </label>
                      <input
                        type="number"
                        value={formData.phosphorus}
                        onChange={(e) => setFormData({ ...formData, phosphorus: e.target.value })}
                        placeholder="e.g. 24"
                        className="w-full px-3.5 py-2.5 rounded-2xl border border-gray-200 text-xs font-bold focus:border-forest outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-dark-text mb-1">
                        Potassium (kg/ha)
                      </label>
                      <input
                        type="number"
                        value={formData.potassium}
                        onChange={(e) => setFormData({ ...formData, potassium: e.target.value })}
                        placeholder="e.g. 180"
                        className="w-full px-3.5 py-2.5 rounded-2xl border border-gray-200 text-xs font-bold focus:border-forest outline-none"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-cream-light border border-harvest/20 text-center text-xs text-dark-muted leading-relaxed">
                  🌾 <strong>No testing card? No problem!</strong> Raitha Mitra uses established ICAR soil benchmarks for your district when laboratory reports are not available.
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 5: Drainage & Investment Budget (UNSELECTED BY DEFAULT) */}
          {currentStep === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <h2 className="text-base font-extrabold text-dark-text mb-1">
                  Drainage Condition & Budget
                </h2>
                <p className="text-xs text-dark-muted mb-3">
                  Ensures recommendations align with your field safety and investment capacity:
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-dark-text">
                    Field Drainage Condition
                  </label>
                  {formData.drainage && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, drainage: '' })}
                      className="text-[11px] text-red-600 font-bold hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {[
                    { id: 'good', label: 'Good Drainage', desc: 'Rainwater drains within 12 hours' },
                    { id: 'moderate', label: 'Moderate Drainage', desc: 'Retains moisture, slow drainage' },
                    { id: 'waterlogged', label: 'Waterlogged / Flood-Prone', desc: 'Standing water during rains (Paddy friendly)' },
                    { id: 'not_sure', label: 'Not Sure / Normal', desc: 'Standard average drainage conditions' },
                  ].map((d) => {
                    const isSelected = formData.drainage === d.id;
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, drainage: isSelected ? '' : d.id })
                        }
                        className={`w-full p-3 rounded-2xl border-2 text-left flex items-center justify-between transition-all ${
                          isSelected
                            ? 'border-forest bg-mint font-bold text-forest shadow-sm'
                            : 'border-gray-200 bg-white text-dark-text hover:border-gray-300'
                        }`}
                      >
                        <div>
                          <span className="text-xs font-extrabold block">{d.label}</span>
                          <span className="text-[10px] text-dark-muted block">{d.desc}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-forest flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-dark-text">
                    Target Investment Budget
                  </label>
                  {formData.budget && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, budget: '' })}
                      className="text-[11px] text-red-600 font-bold hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'low', label: 'Low', sub: '< ₹15,000/ac' },
                    { id: 'medium', label: 'Medium', sub: '₹15k - 35k/ac' },
                    { id: 'high', label: 'Commercial', sub: '> ₹35,000/ac' },
                  ].map((b) => {
                    const isSelected = formData.budget === b.id;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, budget: isSelected ? '' : b.id })
                        }
                        className={`p-3 rounded-2xl border-2 text-center transition-all ${
                          isSelected
                            ? 'border-forest bg-mint font-extrabold text-forest shadow-sm'
                            : 'border-gray-200 bg-white text-dark-text hover:border-gray-300'
                        }`}
                      >
                        <span className="text-xs font-extrabold block">{b.label}</span>
                        <span className="text-[10px] text-dark-muted block">{b.sub}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Button Footer */}
        <div className="pt-6 border-t border-gray-100 flex items-center gap-3">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="py-3 px-4 rounded-2xl border border-gray-200 text-dark-text text-xs font-bold hover:bg-gray-50 transition"
            >
              Back
            </button>
          )}
          <Button
            type="button"
            onClick={handleNext}
            size="lg"
            fullWidth
            isLoading={isLoading}
            className="shadow-xl shadow-forest/20 flex items-center justify-center gap-2"
          >
            <span>{currentStep === 5 ? 'Get Crop Recommendations' : 'Next Step'}</span>
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
