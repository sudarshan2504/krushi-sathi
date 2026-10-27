import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  X,
  Sparkles,
  Droplets,
  Clock,
  Layers,
  Sprout,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Info,
  ExternalLink,
  BookOpen,
  Compass,
} from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';
import { api } from '../services/api';
import { CropCatalogItem, CatalogPagination } from '../types';

const ALPHABET = [
  'All', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I',
  'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S',
  'T', 'U', 'V', 'W', 'Y', 'Z',
];

const CATEGORIES = [
  { id: 'all', name: 'All Categories', kn: 'ಎಲ್ಲಾ ವರ್ಗಗಳು', ta: 'அனைத்து பிரிவுகள்', te: 'అన్ని వర్గాలు' },
  { id: 'cereal_millet', name: 'Cereals & Millets', kn: 'ಧಾನ್ಯಗಳು & ಸಿರಿಧಾನ್ಯ', ta: 'தானியங்கள் & சிறுதானியங்கள்', te: 'ధాన్యాలు & చిరుధాన్యాలు' },
  { id: 'pulse', name: 'Pulses & Legumes', kn: 'ದ್ವಿದಳ ಧಾನ್ಯ / ಬೇಳೆಕಾಳು', ta: 'பயறு & பருப்பு வகைகள்', te: 'పప్పుధాన్యాలు' },
  { id: 'vegetable', name: 'Vegetables', kn: 'ತರಕಾರಿಗಳು', ta: 'காய்கறிகள்', te: 'కూరగాయలు' },
  { id: 'fruit', name: 'Fruits (Seasonal)', kn: 'ಹಣ್ಣಿನ ಬೆಳೆಗಳು', ta: 'பழங்கள்', te: 'పండ్ల తోటలు' },
  { id: 'flower', name: 'Commercial Flowers', kn: 'ವಾಣಿಜ್ಯ ಹೂಗಳು', ta: 'மலர்கள்', te: 'వాణిజ్య పూలు' },
  { id: 'plantation', name: 'Plantation & Long-Term', kn: 'ತೋಟಗಾರಿಕೆ & ದೀರ್ಘಾವಧಿ', ta: 'தோட்டக்கலை பயிர்கள்', te: 'తోట పంటలు' },
  { id: 'spice', name: 'Spices & Condiments', kn: 'ಮಸಾಲೆ ಬೆಳೆಗಳು', ta: 'நறுமணப் பயிர்கள்', te: 'సుగంధ ద్రవ్యాలు' },
  { id: 'oilseed', name: 'Oilseeds', kn: 'ಎಣ್ಣೆಕಾಳು ಬೆಳೆಗಳು', ta: 'எண்ணெய் வித்துக்கள்', te: 'నూనెగింజలు' },
  { id: 'fodder', name: 'Fodder Crops', kn: 'ಪೌಷ್ಟಿಕ ಮೇವಿನ ಬೆಳೆಗಳು', ta: 'தீவனப் பயிர்கள்', te: 'పశుగ్రాస పంటలు' },
  { id: 'medicinal', name: 'Medicinal & Herbal', kn: 'ಔಷಧಿ & ಸುಗಂಧ ಸಸ್ಯಗಳು', ta: 'மூலிகைப் பயிர்கள்', te: 'ఔషధ మొక్కలు' },
];

const SEASONS = [
  { id: 'all', label: 'All Seasons' },
  { id: 'Kharif', label: 'Kharif (Monsoon / ಮುಂಗಾರು)' },
  { id: 'Rabi', label: 'Rabi (Winter / ಹಿಂಗಾರು)' },
  { id: 'Zaid', label: 'Zaid (Summer / ಬೇಸಿಗೆ)' },
  { id: 'Year-round', label: 'Year-Round (ವಾರ್ಷಿಕ)' },
];

const DURATIONS = [
  { id: 'all', label: 'All Durations' },
  { id: 'short', label: 'Short (<90 days)' },
  { id: 'medium', label: 'Medium (90-150 days)' },
  { id: 'long', label: 'Long (150-240 days)' },
  { id: 'perennial', label: 'Perennial (Multi-year)' },
];

const SOIL_TYPES = [
  { id: 'all', label: 'All Soil Types' },
  { id: 'red', label: 'Red Soil (ಕೆಂಪು ಮಣ್ಣು)' },
  { id: 'black', label: 'Black Soil / Regur (ಕಪ್ಪು ಮಣ್ಣು)' },
  { id: 'loamy', label: 'Loamy Soil (ಗೋಡು ಮಣ್ಣು)' },
  { id: 'alluvial', label: 'Alluvial Soil (ಮೆಕ್ಕಲು ಮಣ್ಣು)' },
  { id: 'laterite', label: 'Laterite Soil (ಲ್ಯಾಟರೈಟ್ / ಮುರಕಲ್ಲು)' },
  { id: 'sandy_loam', label: 'Sandy Loam (ಮರಳು ಗೋಡು)' },
  { id: 'clay', label: 'Clay / Heavy Soil (ಜೇಡಿ ಮಣ್ಣು)' },
];

const WATER_NEEDS = [
  { id: 'all', label: 'All Water Levels' },
  { id: 'low', label: 'Low (Dryland / Rainfed)' },
  { id: 'moderate', label: 'Moderate (Standard)' },
  { id: 'high', label: 'High (Irrigated / Wetland)' },
];

export const CropLibraryPage: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useTranslation();

  // Search & Filter state
  const [selectedLetter, setSelectedLetter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSeason, setSelectedSeason] = useState('all');
  const [selectedDuration, setSelectedDuration] = useState('all');
  const [selectedSoil, setSelectedSoil] = useState('all');
  const [selectedWater, setSelectedWater] = useState('all');
  const [recommendedOnly, setRecommendedOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  // Farmer's saved assessment context (from localStorage if available)
  const [farmerContext, setFarmerContext] = useState<{
    soilType?: string;
    season?: string;
    taluk?: string;
  }>({});

  // Catalog data state
  const [crops, setCrops] = useState<CropCatalogItem[]>([]);
  const [pagination, setPagination] = useState<CatalogPagination>({
    total: 0,
    page: 1,
    limit: 24,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load saved soil / location assessment from localStorage to recommend crops
  useEffect(() => {
    try {
      const saved = localStorage.getItem('krushi_sathi_soil_assessment');
      if (saved) {
        const parsed = JSON.parse(saved);
        setFarmerContext({
          soilType: parsed.soilType || parsed.texture,
          season: parsed.season || 'Kharif',
          taluk: parsed.taluk || parsed.district,
        });
      }
    } catch {
      // Ignore
    }
  }, []);

  // Fetch crops catalog on filter or page change
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);
    setError(null);

    api.crops
      .getCatalog({
        letter: selectedLetter,
        category: selectedCategory,
        season: selectedSeason,
        duration: selectedDuration,
        soilType: selectedSoil,
        waterNeed: selectedWater,
        search: searchQuery,
        page,
        limit: 24,
        farmerSoilType: farmerContext.soilType,
        farmerSeason: farmerContext.season,
        farmerTaluk: farmerContext.taluk,
        recommendedOnly,
      })
      .then((res) => {
        if (!isCancelled) {
          setCrops(res.data || []);
          if (res.pagination) {
            setPagination(res.pagination);
          }
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          setError(err.message || 'Unable to load crops catalog');
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [
    selectedLetter,
    selectedCategory,
    selectedSeason,
    selectedDuration,
    selectedSoil,
    selectedWater,
    searchQuery,
    page,
    recommendedOnly,
    farmerContext,
  ]);

  // Reset to page 1 whenever filters change
  const handleFilterChange = (setter: (v: any) => void, val: any) => {
    setter(val);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSelectedLetter('All');
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedSeason('all');
    setSelectedDuration('all');
    setSelectedSoil('all');
    setSelectedWater('all');
    setRecommendedOnly(false);
    setPage(1);
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedLetter !== 'All') count++;
    if (selectedCategory !== 'all') count++;
    if (selectedSeason !== 'all') count++;
    if (selectedDuration !== 'all') count++;
    if (selectedSoil !== 'all') count++;
    if (selectedWater !== 'all') count++;
    if (recommendedOnly) count++;
    if (searchQuery.trim()) count++;
    return count;
  }, [
    selectedLetter,
    selectedCategory,
    selectedSeason,
    selectedDuration,
    selectedSoil,
    selectedWater,
    recommendedOnly,
    searchQuery,
  ]);

  const getLocalizedName = (crop: CropCatalogItem) => {
    if (language === 'kn' && crop.nameKannada) return crop.nameKannada;
    if (language === 'ta' && crop.nameTamil) return crop.nameTamil;
    if (language === 'te' && crop.nameTelugu) return crop.nameTelugu;
    return crop.name;
  };

  const getCategoryLabel = (catId: string) => {
    const found = CATEGORIES.find((c) => c.id === catId);
    if (!found) return catId;
    if (language === 'kn') return found.kn;
    if (language === 'ta') return found.ta;
    if (language === 'te') return found.te;
    return found.name;
  };

  return (
    <div className="min-h-dvh bg-earth-light/40 py-4 sm:py-6 px-2.5 sm:px-6 max-w-7xl mx-auto space-y-5 sm:space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-forest via-forest-dark to-forest-DEFAULT text-white rounded-3xl p-6 sm:p-8 shadow-card relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold text-mint-light">
            <BookOpen className="w-4 h-4 text-goldenrod" />
            <span>South India Master Crop Catalog (112 Crops)</span>
          </div>
          
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {language === 'kn'
              ? 'ದಕ್ಷಿಣ ಭಾರತ ಬೆಳೆ ಗ್ರಂಥಾಲಯ (A-Z)'
              : language === 'ta'
              ? 'தென்னிந்திய பயிர் நூலகம் (A-Z)'
              : language === 'te'
              ? 'దక్షిణ భారత పంటల గ్రంథాలయం (A-Z)'
              : 'South India Crop Library & A-Z Catalog'}
          </h1>
          
          <p className="text-sm sm:text-base text-mint-light/90 leading-relaxed">
            Verified agricultural package of practices across Karnataka, Tamil Nadu, Andhra Pradesh, Telangana & Kerala.
            Every crop includes verified botanical imagery, soil/climate requirements, fertilizer schedule, lifecycle timeline & economics.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-semibold">
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>100% Offline Local Images</span>
            </div>
            <a
              href="/crop-images-review.html"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 bg-goldenrod text-forest-dark px-3 py-1.5 rounded-xl hover:bg-yellow-400 font-bold transition shadow-sm"
            >
              <span>Image Review Dashboard</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={() => navigate('/credits')}
              className="flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-xl hover:bg-white/20 transition text-white"
            >
              <span>Licensing & Attribution Credits</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* A-Z Alphabet Bar */}
      <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-gray-200">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 shrink-0">
            A-Z:
          </span>
          {ALPHABET.map((letter) => {
            const isActive = selectedLetter === letter;
            return (
              <button
                key={letter}
                onClick={() => handleFilterChange(setSelectedLetter, letter)}
                className={`min-w-[44px] min-h-[44px] px-2.5 rounded-xl text-xs font-extrabold transition shrink-0 flex items-center justify-center touch-target active:scale-95 ${
                  isActive
                    ? 'bg-forest text-white shadow-sm ring-2 ring-forest/30 scale-105'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-dark-text'
                }`}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
          {/* Multilingual Search Bar */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleFilterChange(setSearchQuery, e.target.value)}
              placeholder="Search in English, ಕನ್ನಡ, தமிழ், తెలుగు or Botanical name (e.g., Ragi, தக்காளி, Citrus)..."
              className="w-full pl-11 pr-10 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-forest focus:border-forest shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => handleFilterChange(setSearchQuery, '')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Location Recommendation Toggle */}
          <button
            onClick={() => handleFilterChange(setRecommendedOnly, !recommendedOnly)}
            className={`px-4 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition border ${
              recommendedOnly
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Sparkles className={`w-4 h-4 ${recommendedOnly ? 'text-yellow-200' : 'text-emerald-600'}`} />
            <span>Recommended for My Soil</span>
          </button>

          {/* Filter Modal Trigger (Mobile & Compact) */}
          <button
            onClick={() => setShowFiltersModal(true)}
            className="sm:hidden px-4 py-3 bg-white border border-gray-200 rounded-2xl text-xs font-bold text-gray-700 flex items-center justify-center gap-2"
          >
            <Filter className="w-4 h-4 text-forest" />
            <span>Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
          </button>
        </div>

        {/* Quick Filter Dropdowns (Desktop & Tablet) */}
        <div className="hidden sm:grid grid-cols-2 lg:grid-cols-5 gap-2.5 bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm">
          {/* Category */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => handleFilterChange(setSelectedCategory, e.target.value)}
              className="w-full text-xs font-semibold py-2 px-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-forest"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Season */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Season
            </label>
            <select
              value={selectedSeason}
              onChange={(e) => handleFilterChange(setSelectedSeason, e.target.value)}
              className="w-full text-xs font-semibold py-2 px-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-forest"
            >
              {SEASONS.map((sn) => (
                <option key={sn.id} value={sn.id}>
                  {sn.label}
                </option>
              ))}
            </select>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Duration
            </label>
            <select
              value={selectedDuration}
              onChange={(e) => handleFilterChange(setSelectedDuration, e.target.value)}
              className="w-full text-xs font-semibold py-2 px-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-forest"
            >
              {DURATIONS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {/* Soil Type */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Soil Type
            </label>
            <select
              value={selectedSoil}
              onChange={(e) => handleFilterChange(setSelectedSoil, e.target.value)}
              className="w-full text-xs font-semibold py-2 px-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-forest"
            >
              {SOIL_TYPES.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.label}
                </option>
              ))}
            </select>
          </div>

          {/* Water Need */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Water Need
            </label>
            <select
              value={selectedWater}
              onChange={(e) => handleFilterChange(setSelectedWater, e.target.value)}
              className="w-full text-xs font-semibold py-2 px-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-forest"
            >
              {WATER_NEEDS.map((wn) => (
                <option key={wn.id} value={wn.id}>
                  {wn.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters Pills & Summary */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-dark-muted">
            <span className="font-extrabold text-dark-text">
              Showing {crops.length} of {pagination.total} crops
            </span>
            {selectedLetter !== 'All' && (
              <span className="bg-forest/10 text-forest font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                Letter: {selectedLetter}
                <X className="w-3 h-3 cursor-pointer" onClick={() => handleFilterChange(setSelectedLetter, 'All')} />
              </span>
            )}
            {selectedCategory !== 'all' && (
              <span className="bg-forest/10 text-forest font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                {getCategoryLabel(selectedCategory)}
                <X className="w-3 h-3 cursor-pointer" onClick={() => handleFilterChange(setSelectedCategory, 'all')} />
              </span>
            )}
            {selectedSeason !== 'all' && (
              <span className="bg-forest/10 text-forest font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                {selectedSeason}
                <X className="w-3 h-3 cursor-pointer" onClick={() => handleFilterChange(setSelectedSeason, 'all')} />
              </span>
            )}
            {recommendedOnly && (
              <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                Recommended Only
                <X className="w-3 h-3 cursor-pointer" onClick={() => handleFilterChange(setRecommendedOnly, false)} />
              </span>
            )}
          </div>

          {activeFiltersCount > 0 && (
            <button
              onClick={handleResetFilters}
              className="text-xs font-bold text-red-600 hover:text-red-700 underline"
            >
              Reset all filters
            </button>
          )}
        </div>
      </div>

      {/* Main Crop Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 py-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm animate-pulse space-y-3">
              <div className="w-full h-44 bg-gray-200 rounded-2xl" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="h-6 bg-gray-100 rounded-lg" />
                <div className="h-6 bg-gray-100 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-white rounded-3xl p-8 border border-red-200 text-center max-w-md mx-auto space-y-3">
          <Info className="w-8 h-8 text-red-500 mx-auto" />
          <h3 className="text-base font-extrabold text-dark-text">Failed to load crops</h3>
          <p className="text-xs text-dark-muted">{error}</p>
          <button
            onClick={() => handleFilterChange(setPage, 1)}
            className="px-4 py-2 bg-forest text-white rounded-xl text-xs font-bold hover:bg-forest-dark"
          >
            Retry
          </button>
        </div>
      ) : crops.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-gray-100 text-center max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-mint text-forest flex items-center justify-center mx-auto">
            <Sprout className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-dark-text">No Crops Match Your Filters</h3>
            <p className="text-xs text-dark-muted mt-1 leading-relaxed">
              Try adjusting the alphabet letter, clearing search keywords, or selecting "All Categories" to view the full 112 South Indian crop catalog.
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="px-5 py-2.5 bg-forest text-white rounded-2xl text-xs font-bold hover:bg-forest-dark shadow-sm"
          >
            Clear Filters & View All
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {crops.map((crop) => {
            const localizedTitle = getLocalizedName(crop);
            const primaryImage =
              crop.images && crop.images.length > 0
                ? crop.images[0].path
                : crop.imageUrl || '/crops/placeholder.svg';

            return (
              <motion.div
                key={crop.id}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.15 }}
                onClick={() => navigate(`/crops/${crop.id}`, { state: { crop } })}
                className="bg-white rounded-3xl border border-gray-100 shadow-card hover:shadow-lg overflow-hidden flex flex-col cursor-pointer group transition-all"
              >
                {/* Crop Photo Container */}
                <div className="relative h-44 sm:h-48 w-full bg-mint/30 overflow-hidden">
                  <img
                    src={primaryImage}
                    alt={crop.name}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      // Graceful fallback to SVG placeholder
                      (e.currentTarget as HTMLImageElement).src = '/crops/placeholder.svg';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Recommendation Badge */}
                  {crop.isRecommendedForFarmer && (
                    <div className="absolute top-3 left-3 bg-emerald-700/90 backdrop-blur-md text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-yellow-300" />
                      <span>Recommended for You</span>
                    </div>
                  )}

                  {/* Category Pill */}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-forest-dark text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-sm">
                    {getCategoryLabel(crop.category)}
                  </div>

                  {/* Confidence Badge (Bottom Right) */}
                  <div className="absolute bottom-2.5 right-2.5">
                    {crop.confidence === 'high' ? (
                      <span className="bg-emerald-950/70 backdrop-blur-md text-emerald-300 text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>ICAR Verified</span>
                      </span>
                    ) : (
                      <span className="bg-amber-950/70 backdrop-blur-md text-amber-300 text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Info className="w-2.5 h-2.5" />
                        <span>Regional Specialist</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    {/* Botanical Scientific Name */}
                    <div className="text-[11px] font-semibold text-forest italic truncate">
                      {crop.scientificName}
                    </div>

                    {/* Crop Name */}
                    <h3 className="text-base font-extrabold text-dark-text group-hover:text-forest transition line-clamp-1">
                      {localizedTitle}
                    </h3>

                    {/* Secondary name if different */}
                    {localizedTitle !== crop.name && (
                      <p className="text-xs text-dark-muted truncate mt-0.5">{crop.name}</p>
                    )}
                  </div>

                  {/* Agronomic Quick Specs */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-gray-100">
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Clock className="w-3.5 h-3.5 text-forest shrink-0" />
                      <span className="truncate">{crop.durationDays}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Droplets className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span className="truncate">{crop.waterRequirement} Water</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Layers className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="truncate">{crop.idealSoilTypes.slice(0, 2).join(', ')}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Sprout className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{crop.seasons[0]}</span>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="pt-2 flex items-center justify-between text-xs font-bold text-forest group-hover:translate-x-0.5 transition-transform">
                    <span>Explore Agronomy Guide</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!pagination.hasPrev}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold border border-gray-200 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-1">
            <span className="text-xs font-extrabold text-dark-text">
              Page {pagination.page} of {pagination.totalPages}
            </span>
          </div>

          <button
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={!pagination.hasNext}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold border border-gray-200 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Mobile Filter Modal */}
      <AnimatePresence>
        {showFiltersModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 space-y-4 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <h3 className="text-base font-extrabold text-dark-text">Filter Crop Catalog</h3>
                <button
                  onClick={() => setShowFiltersModal(false)}
                  className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => handleFilterChange(setSelectedCategory, e.target.value)}
                  className="w-full text-xs font-semibold py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Season */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Season</label>
                <select
                  value={selectedSeason}
                  onChange={(e) => handleFilterChange(setSelectedSeason, e.target.value)}
                  className="w-full text-xs font-semibold py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl"
                >
                  {SEASONS.map((sn) => (
                    <option key={sn.id} value={sn.id}>
                      {sn.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Duration</label>
                <select
                  value={selectedDuration}
                  onChange={(e) => handleFilterChange(setSelectedDuration, e.target.value)}
                  className="w-full text-xs font-semibold py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl"
                >
                  {DURATIONS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Soil */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Soil Type</label>
                <select
                  value={selectedSoil}
                  onChange={(e) => handleFilterChange(setSelectedSoil, e.target.value)}
                  className="w-full text-xs font-semibold py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl"
                >
                  {SOIL_TYPES.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Water */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Water Need</label>
                <select
                  value={selectedWater}
                  onChange={(e) => handleFilterChange(setSelectedWater, e.target.value)}
                  className="w-full text-xs font-semibold py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl"
                >
                  {WATER_NEEDS.map((wn) => (
                    <option key={wn.id} value={wn.id}>
                      {wn.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleResetFilters}
                  className="flex-1 py-3 border border-gray-200 rounded-2xl text-xs font-bold text-gray-700 hover:bg-gray-50"
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowFiltersModal(false)}
                  className="flex-1 py-3 bg-forest text-white rounded-2xl text-xs font-bold hover:bg-forest-dark"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
