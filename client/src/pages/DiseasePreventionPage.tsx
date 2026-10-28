import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Search,
  Filter,
  ShieldAlert,
  Calendar,
  Sparkles,
  ChevronDown,
  ChevronUp,
  X,
  SlidersHorizontal,
  Info,
} from 'lucide-react';
import { api } from '../services/api';
import { ProblemItem } from '../types';
import { useTranslation } from '../context/LanguageContext';
import { LoadingState } from '../components/ui/LoadingState';
import { CropSelector, CropOption } from '../components/cropHealth/CropSelector';
import { ProblemCard } from '../components/cropHealth/ProblemCard';
import { ProblemDetailModal } from '../components/cropHealth/ProblemDetailModal';
import { PreventionCalendar } from '../components/cropHealth/PreventionCalendar';
import { SymptomCheckerWizard } from '../components/cropHealth/SymptomCheckerWizard';

const PROBLEM_TYPES = [
  { key: 'all', labelKey: 'allTypes' },
  { key: 'insect_pest', labelKey: 'typeInsectPest' },
  { key: 'fungal', labelKey: 'typeFungal' },
  { key: 'bacterial', labelKey: 'typeBacterial' },
  { key: 'viral', labelKey: 'typeViral' },
  { key: 'nematode', labelKey: 'typeNematode' },
  { key: 'nutrient_deficiency', labelKey: 'typeNutrient' },
  { key: 'abiotic_stress', labelKey: 'typeAbiotic' },
  { key: 'weed', labelKey: 'typeWeed' },
];

const SEVERITIES = [
  { key: 'all', labelKey: 'allSeverities' },
  { key: 'critical', labelKey: 'sevCritical' },
  { key: 'high', labelKey: 'sevHigh' },
  { key: 'medium', labelKey: 'sevMedium' },
  { key: 'low', labelKey: 'sevLow' },
];

const STAGES = [
  { key: 'all', label: 'All Stages' },
  { key: 'seedling', label: 'Seedling / Nursery' },
  { key: 'vegetative', label: 'Vegetative' },
  { key: 'flowering', label: 'Flowering' },
  { key: 'fruiting', label: 'Fruiting / Grain' },
  { key: 'harvest', label: 'Harvest' },
];

const SEASONS = [
  { key: 'all', label: 'All Seasons' },
  { key: 'Kharif', label: 'Kharif (Monsoon)' },
  { key: 'Rabi', label: 'Rabi (Winter)' },
  { key: 'Summer', label: 'Summer' },
];

export const DiseasePreventionPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { t, language } = useTranslation();

  // Active top navigation tab
  const [activeTab, setActiveTab] = useState<'common' | 'calendar' | 'checker'>('common');

  // Crops & Problems Database State
  const [crops, setCrops] = useState<CropOption[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<CropOption | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [allProblems, setAllProblems] = useState<ProblemItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [selectedSeason, setSelectedSeason] = useState<string>('all');
  const [showFilterDrawer, setShowFilterDrawer] = useState<boolean>(false);

  // Collapsible sections
  const [showSecondaryProblems, setShowSecondaryProblems] = useState<boolean>(false);
  const [showOtherCropProblems, setShowOtherCropProblems] = useState<boolean>(false);

  // Active Modal Problem Detail
  const [activeDetailProblem, setActiveDetailProblem] = useState<ProblemItem | null>(null);

  // Initial Data Fetch
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [cropsData, problemsData, userPlans] = await Promise.all([
          api.diseases.getCropsCatalog().catch(() => []),
          api.diseases.getAll().catch(() => []),
          api.lifecycle.getPlans().catch(() => []),
        ]);

        setCrops(cropsData);
        setAllProblems(problemsData);

        // Determine pre-selected crop
        const savedCropId = localStorage.getItem('krushi_sathi_crop_health_crop');
        let initialCrop: CropOption | null = null;

        // 1. Try saved crop from localStorage
        if (savedCropId) {
          initialCrop = cropsData.find((c: CropOption) => c.id === savedCropId || c.name.toLowerCase().includes(savedCropId.toLowerCase())) || null;
        }

        // 2. If none saved, check farmer's active crop plans
        if (!initialCrop && userPlans && userPlans.length > 0) {
          const activePlan = userPlans.find((p: any) => p.status === 'active') || userPlans[0];
          if (activePlan) {
            initialCrop = cropsData.find((c: CropOption) =>
              c.name.toLowerCase().includes(activePlan.cropName.toLowerCase()) ||
              c.id === activePlan.cropId
            ) || null;
          }
        }

        // 3. Fallback to Paddy / first crop
        if (!initialCrop && cropsData.length > 0) {
          initialCrop = cropsData.find((c: CropOption) => c.name.toLowerCase().includes('paddy')) || cropsData[0];
        }

        if (initialCrop) {
          setSelectedCrop(initialCrop);
          if (initialCrop.category) {
            setSelectedCategory(initialCrop.category);
          }
        }

        // Deep-link check: ?problem=slug or state.selectedProblemId
        const problemParam = searchParams.get('problem') || (location.state as any)?.selectedProblemId;
        if (problemParam && problemsData.length > 0) {
          const match = problemsData.find((p: any) => p.slug === problemParam || p.id === problemParam);
          if (match) {
            setActiveDetailProblem(match);
          }
        }
      } catch (err) {
        console.error('Error loading crop health data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [searchParams]);

  // Handler for Crop Selection
  const handleSelectCrop = (crop: CropOption) => {
    setSelectedCrop(crop);
    localStorage.setItem('krushi_sathi_crop_health_crop', crop.id);
  };

  // Filter application
  const selectedCropSlug = selectedCrop ? selectedCrop.name.toLowerCase().split(' ')[0] : 'paddy';

  const applyFilters = (items: ProblemItem[]) => {
    return items.filter((p) => {
      // Type filter
      if (selectedType !== 'all' && p.type !== selectedType) {
        return false;
      }
      // Severity filter
      if (selectedSeverity !== 'all' && p.severity !== selectedSeverity) {
        return false;
      }
      // Stage filter
      if (selectedStage !== 'all' && p.affectedStages) {
        if (!p.affectedStages.some(s => s.toLowerCase().includes(selectedStage.toLowerCase()))) {
          return false;
        }
      }
      // Season filter
      if (selectedSeason !== 'all' && p.favourableSeasons) {
        if (!p.favourableSeasons.some(s => s.toLowerCase().includes(selectedSeason.toLowerCase()))) {
          return false;
        }
      }
      // Search Query filter (matches names, symptoms, and symptom tags)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName =
          p.name.toLowerCase().includes(q) ||
          p.nameKannada?.toLowerCase().includes(q) ||
          p.nameTamil?.toLowerCase().includes(q) ||
          p.nameTelugu?.toLowerCase().includes(q) ||
          p.scientificName?.toLowerCase().includes(q);

        const matchesSymptoms =
          p.symptoms.toLowerCase().includes(q) ||
          (p.symptomsKn && p.symptomsKn.toLowerCase().includes(q)) ||
          (p.symptomsTa && p.symptomsTa.toLowerCase().includes(q)) ||
          (p.symptomsTe && p.symptomsTe.toLowerCase().includes(q));

        const matchesTags = p.symptomTags?.some((st) =>
          st.symptomTag.labelEn.toLowerCase().includes(q) ||
          st.symptomTag.labelKn.toLowerCase().includes(q) ||
          st.symptomTag.labelTa.toLowerCase().includes(q) ||
          st.symptomTag.labelTe.toLowerCase().includes(q)
        );

        if (!matchesName && !matchesSymptoms && !matchesTags) {
          return false;
        }
      }

      return true;
    });
  };

  // Group problems relative to selected crop:
  // 1. Primary problems for this crop
  const primaryCropProblems = applyFilters(
    allProblems.filter((p) => {
      return p.crops?.some(
        c => (c.cropName.toLowerCase().includes(selectedCropSlug) || c.cropSlug.toLowerCase().includes(selectedCropSlug)) &&
             c.importance === 'primary'
      );
    })
  );

  // 2. Secondary problems that can also affect this crop
  const secondaryCropProblems = applyFilters(
    allProblems.filter((p) => {
      const isPrimary = p.crops?.some(
        c => (c.cropName.toLowerCase().includes(selectedCropSlug) || c.cropSlug.toLowerCase().includes(selectedCropSlug)) &&
             c.importance === 'primary'
      );
      if (isPrimary) return false;

      return p.crops?.some(
        c => c.cropName.toLowerCase().includes(selectedCropSlug) || c.cropSlug.toLowerCase().includes(selectedCropSlug)
      );
    })
  );

  // 3. Problems in other crops
  const otherCropProblems = applyFilters(
    allProblems.filter((p) => {
      const affectsCurrentCrop = p.crops?.some(
        c => c.cropName.toLowerCase().includes(selectedCropSlug) || c.cropSlug.toLowerCase().includes(selectedCropSlug)
      );
      return !affectsCurrentCrop;
    })
  );

  // Group primary problems by type for tidy layout with counts
  const groupByType = (items: ProblemItem[]) => {
    const groups: Record<string, ProblemItem[]> = {};
    for (const item of items) {
      const groupKey = item.type || 'other';
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(item);
    }
    return groups;
  };

  const primaryGrouped = groupByType(primaryCropProblems);

  const getTypeHeading = (typeKey: string) => {
    switch (typeKey) {
      case 'insect_pest':
        return t('typeInsectPest') || 'Insect Pests';
      case 'fungal':
        return t('typeFungal') || 'Fungal Diseases';
      case 'bacterial':
        return t('typeBacterial') || 'Bacterial Diseases';
      case 'viral':
        return t('typeViral') || 'Viral Diseases';
      case 'nematode':
        return t('typeNematode') || 'Nematodes';
      case 'nutrient_deficiency':
        return t('typeNutrient') || 'Nutrient Deficiencies';
      case 'abiotic_stress':
        return t('typeAbiotic') || 'Weather & Abiotic Stress';
      case 'weed':
        return t('typeWeed') || 'Weeds';
      default:
        return 'Other Health Issues';
    }
  };

  const hasActiveFilters =
    selectedType !== 'all' ||
    selectedSeverity !== 'all' ||
    selectedStage !== 'all' ||
    selectedSeason !== 'all' ||
    searchQuery.trim().length > 0;

  const handleClearFilters = () => {
    setSelectedType('all');
    setSelectedSeverity('all');
    setSelectedStage('all');
    setSelectedSeason('all');
    setSearchQuery('');
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4">
        <LoadingState type="list" loadingText="Loading verified ICAR Crop Health library..." />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4 py-3 px-2 sm:px-4">
      {/* Top Navigation Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/home')}
          className="min-w-[48px] min-h-[48px] flex items-center justify-center p-2 rounded-2xl bg-white border border-gray-200 text-dark-text hover:bg-gray-50 active:scale-95 transition cursor-pointer shadow-sm"
          aria-label={t('navBack')}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h1 className="text-base sm:text-lg font-black text-dark-text flex items-center justify-center gap-1.5">
            <ShieldAlert className="w-5 h-5 text-forest" />
            <span>{t('pestAndDiseases') || 'Crop Health'}</span>
          </h1>
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
            Verified ICAR / UAS / TNAU Guidance
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowFilterDrawer(!showFilterDrawer)}
          className={`min-w-[48px] min-h-[48px] flex items-center justify-center p-2 rounded-2xl border transition cursor-pointer shadow-sm relative ${
            hasActiveFilters
              ? 'bg-forest text-white border-forest'
              : 'bg-white border-gray-200 text-dark-text hover:bg-gray-50'
          }`}
          aria-label="Filter"
        >
          <SlidersHorizontal className="w-5 h-5" />
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
          )}
        </button>
      </div>

      {/* Main Mode Tabs */}
      <div className="flex rounded-2xl bg-white p-1.5 border border-gray-200 shadow-sm text-xs sm:text-sm font-bold gap-1 overflow-x-auto scrollbar-none snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          type="button"
          onClick={() => setActiveTab('common')}
          className={`shrink-0 sm:flex-1 min-h-[44px] py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center text-center gap-1.5 whitespace-nowrap snap-start touch-target ${
            activeTab === 'common' ? 'bg-forest text-white shadow-sm' : 'text-dark-muted hover:text-dark-text'
          }`}
        >
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span className="truncate max-w-[150px] sm:max-w-none">{t('commonProblems') || 'Common Problems'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('calendar')}
          className={`shrink-0 sm:flex-1 min-h-[44px] py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center text-center gap-1.5 whitespace-nowrap snap-start touch-target ${
            activeTab === 'calendar' ? 'bg-forest text-white shadow-sm' : 'text-dark-muted hover:text-dark-text'
          }`}
        >
          <Calendar className="w-4 h-4 shrink-0" />
          <span className="truncate max-w-[150px] sm:max-w-none">{t('preventionCalendar') || 'Prevention Calendar'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('checker')}
          className={`shrink-0 sm:flex-1 min-h-[44px] py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center text-center gap-1.5 whitespace-nowrap snap-start touch-target ${
            activeTab === 'checker' ? 'bg-forest text-white shadow-sm' : 'text-dark-muted hover:text-dark-text'
          }`}
        >
          <Sparkles className="w-4 h-4 shrink-0 text-amber-300" />
          <span className="truncate max-w-[150px] sm:max-w-none">{t('diagnoseLeaf') || 'Symptom Checker'}</span>
        </button>
      </div>

      {/* CROP SELECTOR (Database driven with categories & cards) */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-100 shadow-card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            {t('selectCrop') || 'Select Crop to View Health Profile'}:
          </span>
          {selectedCrop && (
            <span className="text-xs font-bold text-forest">
              {primaryCropProblems.length} major problems
            </span>
          )}
        </div>

        <CropSelector
          crops={crops}
          selectedCropId={selectedCrop?.id || ''}
          onSelectCrop={handleSelectCrop}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </div>

      {/* FILTER DRAWER / EXPANDABLE ACCORDION */}
      <AnimatePresence>
        {showFilterDrawer && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-200 shadow-card space-y-3.5 overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <span className="text-xs font-extrabold text-dark-text uppercase tracking-wider flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-forest" />
                Advanced Filters
              </span>
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-xs font-bold text-red-600 hover:underline"
              >
                Reset Filters
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Type Filter */}
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                  Problem Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold focus:border-forest outline-none min-h-[40px]"
                >
                  {PROBLEM_TYPES.map((pt) => (
                    <option key={pt.key} value={pt.key}>
                      {t(pt.labelKey as any) || pt.key}
                    </option>
                  ))}
                </select>
              </div>

              {/* Severity Filter */}
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                  Severity
                </label>
                <select
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold focus:border-forest outline-none min-h-[40px]"
                >
                  {SEVERITIES.map((sv) => (
                    <option key={sv.key} value={sv.key}>
                      {t(sv.labelKey as any) || sv.key}
                    </option>
                  ))}
                </select>
              </div>

              {/* Growth Stage Filter */}
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                  Growth Stage
                </label>
                <select
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold focus:border-forest outline-none min-h-[40px]"
                >
                  {STAGES.map((st) => (
                    <option key={st.key} value={st.key}>
                      {st.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Season Filter */}
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                  Season
                </label>
                <select
                  value={selectedSeason}
                  onChange={(e) => setSelectedSeason(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold focus:border-forest outline-none min-h-[40px]"
                >
                  {SEASONS.map((sn) => (
                    <option key={sn.key} value={sn.key}>
                      {sn.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TAB 1: COMMON PROBLEMS (Crop-First Grouping) */}
      {activeTab === 'common' && (
        <div className="space-y-4">
          {/* Multilingual Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-forest" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by pest name, symptom (e.g. leaf spots, borer), or signs..."
              className="w-full pl-10 pr-10 py-3 min-h-[48px] rounded-2xl bg-white border border-gray-200 text-xs sm:text-sm font-semibold focus:border-forest outline-none shadow-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Group 1: Primary Documented Problems for Selected Crop */}
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
              <h2 className="text-sm sm:text-base font-black text-dark-text">
                Documented Problems in <span className="text-forest">{selectedCrop?.name}</span> ({primaryCropProblems.length})
              </h2>
              <span className="text-[10px] font-bold bg-forest/10 text-forest px-2.5 py-1 rounded-full">
                Primary Threats
              </span>
            </div>

            {primaryCropProblems.length === 0 ? (
              <div className="p-8 bg-white rounded-3xl border border-gray-200 text-center space-y-2">
                <ShieldAlert className="w-10 h-10 text-gray-300 mx-auto" />
                <h3 className="text-sm font-bold text-dark-text">No primary problems match your filters</h3>
                <p className="text-xs text-dark-muted max-w-sm mx-auto">
                  Try adjusting the type or severity filter above, or check the secondary problems section below.
                </p>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="mt-2 px-4 py-2 bg-gray-100 rounded-xl text-xs font-bold text-dark-text hover:bg-gray-200 transition"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              Object.entries(primaryGrouped).map(([typeKey, items]) => (
                <div key={typeKey} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-forest" />
                    <h3 className="text-xs sm:text-sm font-extrabold text-dark-text">
                      {getTypeHeading(typeKey)}
                    </h3>
                    <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {items.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {items.map((prob) => (
                      <ProblemCard
                        key={prob.id}
                        problem={prob}
                        onSelect={setActiveDetailProblem}
                        selectedCropSlug={selectedCropSlug}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Group 2: Collapsible Secondary Problems That Can Also Affect This Crop */}
          {secondaryCropProblems.length > 0 && (
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
              <button
                type="button"
                onClick={() => setShowSecondaryProblems(!showSecondaryProblems)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-extrabold text-dark-text">
                    Other Problems That Can Also Affect {selectedCrop?.name} ({secondaryCropProblems.length})
                  </span>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                    Secondary Hosts
                  </span>
                </div>
                {showSecondaryProblems ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
              </button>

              <AnimatePresence>
                {showSecondaryProblems && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 border-t border-gray-100 bg-gray-50/50"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {secondaryCropProblems.map((prob) => (
                        <ProblemCard
                          key={prob.id}
                          problem={prob}
                          onSelect={setActiveDetailProblem}
                          selectedCropSlug={selectedCropSlug}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Group 3: Collapsible Problems in Other Crops */}
          {otherCropProblems.length > 0 && (
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
              <button
                type="button"
                onClick={() => setShowOtherCropProblems(!showOtherCropProblems)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-extrabold text-gray-700">
                    Problems in Other Crops ({otherCropProblems.length})
                  </span>
                  <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    General Library
                  </span>
                </div>
                {showOtherCropProblems ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
              </button>

              <AnimatePresence>
                {showOtherCropProblems && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 border-t border-gray-100 bg-gray-50/50"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {otherCropProblems.map((prob) => (
                        <ProblemCard
                          key={prob.id}
                          problem={prob}
                          onSelect={setActiveDetailProblem}
                          selectedCropSlug={selectedCropSlug}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PREVENTION CALENDAR */}
      {activeTab === 'calendar' && (
        <PreventionCalendar
          cropName={selectedCrop?.name || 'Selected Crop'}
          cropSlug={selectedCropSlug}
          problems={[...primaryCropProblems, ...secondaryCropProblems]}
          onSelectProblem={setActiveDetailProblem}
        />
      )}

      {/* TAB 3: SYMPTOM CHECKER WIZARD */}
      {activeTab === 'checker' && (
        <SymptomCheckerWizard
          crops={crops}
          selectedCropSlug={selectedCropSlug}
          onSelectCropSlug={(slug) => {
            const found = crops.find(c => c.name.toLowerCase().includes(slug.toLowerCase()));
            if (found) handleSelectCrop(found);
          }}
          onOpenProblemDetail={setActiveDetailProblem}
          allProblems={allProblems}
        />
      )}

      {/* Problem Detail Modal */}
      <AnimatePresence>
        {activeDetailProblem && (
          <ProblemDetailModal
            problem={activeDetailProblem}
            onClose={() => setActiveDetailProblem(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
