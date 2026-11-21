import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  ChevronLeft,
  Search,
  RefreshCw,
  MapPin,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  Download,
  X,
  Layers,
  Store,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowUpDown,
  Building2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useTranslation } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { LanguagePill } from '../components/ui/LanguagePill';
import { api } from '../services/api';
import {
  MandiPriceItem,
  MarketSummaryData,
  MarketFilterOptions,
  CropPriceDetailsData,
  CropPriceHistoryData,
} from '../types';

export const MarketPricesPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const { showToast } = useToast();
  const shouldReduceMotion = useReducedMotion();

  // Data states
  const [items, setItems] = useState<MandiPriceItem[]>([]);
  const [summary, setSummary] = useState<MarketSummaryData | null>(null);
  const [filterOptions, setFilterOptions] = useState<MarketFilterOptions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter & Pagination states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedMarket, setSelectedMarket] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'modalPrice' | 'arrivalDate' | 'commodity' | 'district'>('arrivalDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Crop Detail & Comparison Modal states
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  const [cropDetails, setCropDetails] = useState<CropPriceDetailsData | null>(null);
  const [cropHistory, setCropHistory] = useState<CropPriceHistoryData | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '15d' | '30d' | '3m' | '6m'>('30d');
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Sync Diagnostics modal state
  const [showSyncModal, setShowSyncModal] = useState(false);

  // Fetch Summary & Dynamic Filters on mount
  const loadInitialMetadata = useCallback(async () => {
    try {
      const [sumData, filterData] = await Promise.all([
        api.market.getSummary(),
        api.market.getFilters(),
      ]);
      setSummary(sumData);
      setFilterOptions(filterData);
    } catch (err: any) {
      console.warn('[MarketPricesPage] Error loading metadata:', err.message);
    }
  }, []);

  // Fetch Paginated Mandi Prices
  const loadPrices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.market.getPrices({
        state: 'Karnataka',
        district: selectedDistrict !== 'All' ? selectedDistrict : undefined,
        market: selectedMarket !== 'All' ? selectedMarket : undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        q: searchQuery.trim() || undefined,
        page,
        limit: 15,
        sortBy,
        sortOrder,
      });

      setItems(res.data);
      setTotalPages(res.pagination.totalPages);
      setTotalCount(res.pagination.total);
    } catch (err: any) {
      console.error('[MarketPricesPage] Error fetching prices:', err);
      setError(err?.message || 'Failed to load mandi prices');
    } finally {
      setIsLoading(false);
    }
  }, [selectedDistrict, selectedMarket, selectedCategory, searchQuery, page, sortBy, sortOrder]);

  useEffect(() => {
    loadInitialMetadata();
  }, [loadInitialMetadata]);

  useEffect(() => {
    loadPrices();
  }, [loadPrices]);

  // Load Crop Details and Historical Chart when a crop is selected
  useEffect(() => {
    if (!selectedCrop) {
      setCropDetails(null);
      setCropHistory(null);
      return;
    }

    let isMounted = true;
    setIsLoadingDetails(true);

    Promise.all([
      api.market.getCropDetails(selectedCrop),
      api.market.getPriceHistory(selectedCrop, selectedTimeframe),
    ])
      .then(([details, history]) => {
        if (!isMounted) return;
        setCropDetails(details);
        setCropHistory(history);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('[MarketPricesPage] Error loading crop detail:', err);
        showToast('Failed to load crop comparison details', 'error');
      })
      .finally(() => {
        if (isMounted) setIsLoadingDetails(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCrop, selectedTimeframe, showToast]);

  // Trigger Manual Sync
  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const res = await api.market.triggerSync();
      showToast(res.message || t('syncSuccessMsg'), 'success');
      await Promise.all([loadInitialMetadata(), loadPrices()]);
    } catch (err: any) {
      showToast(err?.message || 'Sync failed. Serving cached records.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Export to CSV
  const handleExportCsv = () => {
    const exportUrl = api.market.getExportUrl({
      district: selectedDistrict !== 'All' ? selectedDistrict : undefined,
      market: selectedMarket !== 'All' ? selectedMarket : undefined,
      category: selectedCategory !== 'All' ? selectedCategory : undefined,
      q: searchQuery.trim() || undefined,
    });
    window.open(exportUrl, '_blank');
    showToast('Exporting Karnataka Mandi Prices CSV...', 'info');
  };

  // Filter markets matching the selected district
  const availableMarkets = useMemo(() => {
    if (!filterOptions?.markets) return [];
    if (selectedDistrict === 'All') return filterOptions.markets;
    return filterOptions.markets.filter((m) =>
      m.district.toLowerCase().includes(selectedDistrict.toLowerCase())
    );
  }, [filterOptions, selectedDistrict]);

  const hasActiveFilters =
    selectedDistrict !== 'All' ||
    selectedMarket !== 'All' ||
    selectedCategory !== 'All' ||
    searchQuery.trim() !== '';

  const clearFilters = () => {
    setSelectedDistrict('All');
    setSelectedMarket('All');
    setSelectedCategory('All');
    setSearchQuery('');
    setPage(1);
  };

  return (
    <div className="min-h-screen min-h-dvh w-full bg-[#FAF8F2] dark:bg-[#1E2320] flex justify-center pb-32 safe-bottom selection:bg-emerald-100 selection:text-forest-dark overflow-x-hidden">
      <div className="w-full max-w-[540px] min-h-screen min-h-dvh flex flex-col px-4 pt-3 space-y-4">
        {/* Top Navigation Header */}
        <header className="flex items-center justify-between py-1.5 z-20">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="w-11 h-11 rounded-full bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200/70 dark:border-zinc-700 flex items-center justify-center shadow-xs hover:bg-zinc-50 active:scale-95 transition cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 text-zinc-700 dark:text-zinc-200" />
          </button>

          <div className="text-center">
            <h1 className="text-base sm:text-lg font-extrabold text-[#0D2B18] dark:text-cream tracking-tight">
              {t('mandiTracker')}
            </h1>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">
              Karnataka APMC • data.gov.in
            </p>
          </div>

          <LanguagePill variant="compact" />
        </header>

        {/* Hero Card Summary Dashboard */}
        <div className="rounded-3xl bg-gradient-to-b from-[#144D29] to-[#0D351B] text-white p-4 sm:p-5 shadow-card relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 text-emerald-200 text-[11px] font-bold">
              <MapPin className="w-3.5 h-3.5" />
              <span>31 Karnataka Districts APMC</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleExportCsv}
                aria-label="Export CSV"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition active:scale-95 cursor-pointer"
                title="Download CSV"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleManualSync}
                disabled={isSyncing}
                aria-label="Synchronize data"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition active:scale-95 cursor-pointer disabled:opacity-50"
                title="Sync Latest Government Prices"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
            Daily Mandi Rate Tracker
          </h2>
          <p className="text-xs text-emerald-100/90 mt-1">
            {t('mandiSubtitle')}
          </p>

          {/* 4 Quick Stats Badges */}
          <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-white/15 text-center">
            <div className="p-1.5 rounded-xl bg-white/10">
              <div className="text-sm sm:text-base font-black text-white">
                {summary?.totalCommodities || '--'}
              </div>
              <div className="text-[10px] text-emerald-200 font-semibold truncate">
                {t('totalCommoditiesLabel')}
              </div>
            </div>

            <div className="p-1.5 rounded-xl bg-white/10">
              <div className="text-sm sm:text-base font-black text-white">
                {summary?.totalMarkets || '--'}
              </div>
              <div className="text-[10px] text-emerald-200 font-semibold truncate">
                {t('totalMarketsLabel')}
              </div>
            </div>

            <div className="p-1.5 rounded-xl bg-white/10">
              <div className="text-sm sm:text-base font-black text-white">
                {summary?.totalDistricts || '--'}
              </div>
              <div className="text-[10px] text-emerald-200 font-semibold truncate">
                {t('totalDistrictsLabel')}
              </div>
            </div>

            <div className="p-1.5 rounded-xl bg-white/10">
              <div className="text-sm sm:text-base font-black text-white">
                {summary?.latestArrivalDate ? summary.latestArrivalDate.slice(5) : '--'}
              </div>
              <div className="text-[10px] text-emerald-200 font-semibold truncate">
                {t('latestArrivalDateLabel')}
              </div>
            </div>
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 px-3 shadow-xs">
            <Search className="w-4 h-4 text-zinc-500 mr-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder={t('searchCropPlaceholder')}
              aria-label="Search crops"
              className="w-full min-h-[44px] bg-transparent text-xs font-semibold text-zinc-800 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-1 text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowSyncModal(true)}
            className="px-3 min-h-[44px] rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 text-xs font-bold text-forest dark:text-emerald-400 flex items-center gap-1.5 shadow-xs"
            title="View Sync Diagnostics & Source info"
          >
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Status</span>
          </button>
        </div>

        {/* Filter Dropdowns Row */}
        <div className="grid grid-cols-3 gap-2">
          {/* District Filter */}
          <select
            value={selectedDistrict}
            onChange={(e) => {
              setSelectedDistrict(e.target.value);
              setSelectedMarket('All');
              setPage(1);
            }}
            aria-label="Filter by district"
            className="min-h-[42px] px-2.5 py-1.5 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-200 shadow-xs focus:outline-none truncate"
          >
            <option value="All">{t('allDistrictsOption')}</option>
            {filterOptions?.districts.map((d) => (
              <option key={d.name} value={d.name}>
                {language === 'kn' ? d.nameKannada : d.name}
              </option>
            ))}
          </select>

          {/* APMC Market Filter */}
          <select
            value={selectedMarket}
            onChange={(e) => {
              setSelectedMarket(e.target.value);
              setPage(1);
            }}
            aria-label="Filter by APMC market"
            className="min-h-[42px] px-2.5 py-1.5 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-200 shadow-xs focus:outline-none truncate"
          >
            <option value="All">{t('allMarketsOption')}</option>
            {availableMarkets.map((m) => (
              <option key={m.id} value={m.name}>
                {m.name}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            aria-label="Filter by category"
            className="min-h-[42px] px-2.5 py-1.5 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-200 shadow-xs focus:outline-none truncate"
          >
            <option value="All">{t('allCategoriesOption')}</option>
            {filterOptions?.categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Results Counter & Sort Controls */}
        <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 font-medium px-1">
          <span>
            Showing <strong className="text-zinc-900 dark:text-zinc-100">{totalCount}</strong> prices
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="ml-2 text-forest dark:text-emerald-400 font-bold underline cursor-pointer"
              >
                Reset
              </button>
            )}
          </span>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-zinc-500">Sort:</span>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-');
                setSortBy(sb as any);
                setSortOrder(so as any);
                setPage(1);
              }}
              className="bg-transparent text-xs font-bold text-zinc-800 dark:text-zinc-200 focus:outline-none cursor-pointer"
            >
              <option value="arrivalDate-desc">Latest Date</option>
              <option value="modalPrice-desc">Price: High to Low</option>
              <option value="modalPrice-asc">Price: Low to High</option>
              <option value="commodity-asc">Commodity A-Z</option>
              <option value="district-asc">District A-Z</option>
            </select>
          </div>
        </div>

        {/* Loading Spinner Skeleton */}
        {isLoading && (
          <div className="space-y-3 py-4">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="p-4 rounded-3xl bg-white dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-700 animate-pulse flex flex-col gap-2"
              >
                <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/3" />
                <div className="h-3 bg-zinc-100 dark:bg-zinc-700/60 rounded w-1/2" />
                <div className="h-6 bg-zinc-200 dark:bg-zinc-700 rounded w-1/4 self-end" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && items.length === 0 && (
          <div className="p-8 rounded-3xl bg-white dark:bg-zinc-800/90 border border-zinc-200/80 dark:border-zinc-700 text-center space-y-3">
            <Store className="w-10 h-10 text-zinc-400 mx-auto" />
            <h3 className="text-sm font-extrabold text-zinc-800 dark:text-zinc-100">
              {t('noMarketDataTitle')}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {t('noMarketDataDesc')}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="px-4 py-2 rounded-xl bg-forest text-white text-xs font-bold shadow-sm"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}

        {/* Market Rate Cards List */}
        {!isLoading && items.length > 0 && (
          <div className="space-y-3">
            {items.map((item, idx) => {
              const displayName = language === 'kn' ? item.commodityKannada : item.commodity;
              const displayDistrict = language === 'kn' ? item.districtKannada : item.district;

              return (
                <motion.div
                  key={item.id}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.03 * idx }}
                  onClick={() => setSelectedCrop(item.commodity)}
                  className="p-4 rounded-3xl bg-white dark:bg-zinc-800/95 border border-zinc-100 dark:border-zinc-700/60 shadow-card flex flex-col justify-between cursor-pointer hover:border-forest/50 transition active:scale-[0.99]"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-extrabold text-[#0D2B18] dark:text-zinc-100">
                          {displayName}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-forest dark:text-emerald-400 text-[10px] font-bold">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
                        {item.variety} •{' '}
                        <span className="text-forest dark:text-emerald-400 font-bold">{item.market}</span>{' '}
                        ({displayDistrict})
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-base sm:text-lg font-black text-[#0D2B18] dark:text-zinc-100">
                        ₹{item.modalPrice.toLocaleString('en-IN')}
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-normal"> /qtl</span>
                      </div>
                      <div className="text-[10px] text-zinc-500 dark:text-zinc-400 flex items-center justify-end gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-zinc-400" />
                        <span>{item.arrivalDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Range visual bar: Min to Max */}
                  <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-700/50 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                    <span>Min: ₹{item.minPrice.toLocaleString('en-IN')}</span>
                    <div className="flex-1 mx-3 bg-zinc-100 dark:bg-zinc-700 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-forest h-1.5 rounded-full"
                        style={{
                          width: `${Math.max(
                            10,
                            Math.min(
                              100,
                              item.maxPrice > item.minPrice
                                ? Math.round(
                                    ((item.modalPrice - item.minPrice) / (item.maxPrice - item.minPrice)) * 100
                                  )
                                : 50
                            )
                          )}%`,
                        }}
                      />
                    </div>
                    <span>Max: ₹{item.maxPrice.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[10px] text-forest dark:text-emerald-400 font-bold">
                    <span className="text-zinc-400 font-normal truncate max-w-[200px]">
                      Source: {item.source.replace(' (Official Baseline Snapshot)', '')}
                    </span>
                    <span className="inline-flex items-center gap-1 hover:underline">
                      <BarChart3 className="w-3 h-3" />
                      {t('viewDetailsCta')}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Pagination Navigation */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 disabled:opacity-40"
            >
              Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* INDIVIDUAL CROP PRICE DETAILS, COMPARISON & CHARTS MODAL */}
        {/* ======================================================== */}
        <AnimatePresence>
          {selectedCrop && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
            >
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="w-full max-w-[520px] max-h-[90vh] bg-white dark:bg-zinc-800 rounded-t-3xl sm:rounded-3xl shadow-xl flex flex-col overflow-hidden"
              >
                {/* Modal Header */}
                <div className="p-4 border-b border-zinc-100 dark:border-zinc-700 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/50">
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-zinc-900 dark:text-cream flex items-center gap-2">
                      <span>{language === 'kn' && cropDetails?.nameKannada ? cropDetails.nameKannada : selectedCrop}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-forest text-[11px] font-bold">
                        {cropDetails?.category || 'Commodity'}
                      </span>
                    </h2>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Karnataka APMC Cross-Market Comparison & Price History
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedCrop(null)}
                    aria-label="Close modal"
                    className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 flex items-center justify-center hover:bg-zinc-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-4 space-y-4 overflow-y-auto flex-1">
                  {isLoadingDetails && (
                    <div className="py-12 text-center text-xs text-zinc-500 animate-pulse">
                      Loading market comparison data...
                    </div>
                  )}

                  {!isLoadingDetails && cropDetails && (
                    <>
                      {/* Price Benchmarks Card */}
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-700/40 border border-zinc-100 dark:border-zinc-700">
                          <div className="text-[10px] text-zinc-500 font-bold uppercase">Lowest Reported</div>
                          <div className="text-sm sm:text-base font-black text-emerald-700 dark:text-emerald-400">
                            ₹{cropDetails.summary.minPrice.toLocaleString('en-IN')}
                          </div>
                        </div>

                        <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900">
                          <div className="text-[10px] text-forest dark:text-emerald-300 font-bold uppercase">Average Modal</div>
                          <div className="text-base sm:text-lg font-black text-forest dark:text-emerald-200">
                            ₹{cropDetails.summary.avgModalPrice.toLocaleString('en-IN')}
                          </div>
                        </div>

                        <div className="p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-700/40 border border-zinc-100 dark:border-zinc-700">
                          <div className="text-[10px] text-zinc-500 font-bold uppercase">Highest Reported</div>
                          <div className="text-sm sm:text-base font-black text-zinc-900 dark:text-zinc-100">
                            ₹{cropDetails.summary.maxPrice.toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>

                      {/* Timeframe selector & Recharts Chart */}
                      <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-700/30 p-3 border border-zinc-100 dark:border-zinc-700">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-800 dark:text-zinc-200">
                            <BarChart3 className="w-4 h-4 text-forest" />
                            <span>{t('priceTrendsTitle')}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            {(['7d', '15d', '30d', '3m', '6m'] as const).map((tf) => (
                              <button
                                key={tf}
                                type="button"
                                onClick={() => setSelectedTimeframe(tf)}
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                                  selectedTimeframe === tf
                                    ? 'bg-forest text-white'
                                    : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
                                }`}
                              >
                                {tf.toUpperCase()}
                              </button>
                            ))}
                          </div>
                        </div>

                        {cropHistory && cropHistory.history.length > 0 ? (
                          <div className="h-44 w-full mt-3">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={cropHistory.history} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                <XAxis dataKey="date" tick={{ fontSize: 9 }} tickFormatter={(d) => d.slice(5)} />
                                <YAxis tick={{ fontSize: 9 }} tickFormatter={(val) => `₹${val}`} />
                                <Tooltip
                                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Price']}
                                  labelFormatter={(label) => `Arrival Date: ${label}`}
                                />
                                <Legend wrapperStyle={{ fontSize: '10px' }} />
                                <Line
                                  type="monotone"
                                  dataKey="modalPrice"
                                  name="Modal Price"
                                  stroke="#176B3A"
                                  strokeWidth={2.5}
                                  dot={{ r: 3 }}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="minPrice"
                                  name="Min Price"
                                  stroke="#D97706"
                                  strokeWidth={1.5}
                                  strokeDasharray="4 4"
                                  dot={false}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="maxPrice"
                                  name="Max Price"
                                  stroke="#2563EB"
                                  strokeWidth={1.5}
                                  strokeDasharray="4 4"
                                  dot={false}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        ) : (
                          <div className="py-8 text-center text-xs text-zinc-400">
                            Historical trend records are accumulating from daily synchronizations.
                          </div>
                        )}
                      </div>

                      {/* APMC Market Comparison Table */}
                      <div>
                        <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-forest" />
                          <span>{t('compareMarketsTitle')}</span>
                        </h4>

                        <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-700">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-zinc-50 dark:bg-zinc-700/60 text-[11px] font-bold text-zinc-600 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-700">
                              <tr>
                                <th className="p-2.5">APMC Market</th>
                                <th className="p-2.5">Variety</th>
                                <th className="p-2.5 text-right">Modal Rate</th>
                                <th className="p-2.5 text-right">Min - Max</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700">
                              {cropDetails.comparison.map((c, i) => (
                                <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/30">
                                  <td className="p-2.5 font-bold text-zinc-900 dark:text-zinc-100">
                                    <div>{c.market}</div>
                                    <div className="text-[10px] text-zinc-500 font-normal">{c.district}</div>
                                  </td>
                                  <td className="p-2.5 text-zinc-600 dark:text-zinc-300 text-[11px]">{c.variety}</td>
                                  <td className="p-2.5 text-right font-black text-forest dark:text-emerald-400">
                                    ₹{c.modalPrice.toLocaleString('en-IN')}
                                  </td>
                                  <td className="p-2.5 text-right text-zinc-500 dark:text-zinc-400 text-[10px]">
                                    ₹{c.minPrice} - ₹{c.maxPrice}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ======================================================== */}
        {/* ADMIN SYNC & SOURCE DIAGNOSTICS MODAL */}
        {/* ======================================================== */}
        <AnimatePresence>
          {showSyncModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
            >
              <div className="w-full max-w-[460px] bg-white dark:bg-zinc-800 rounded-3xl p-5 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-700 pb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-forest" />
                    <h3 className="text-sm font-black text-zinc-900 dark:text-cream">
                      Government Mandi Data Status
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSyncModal(false)}
                    className="p-1 text-zinc-400 hover:text-zinc-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-700/40 border border-zinc-100 dark:border-zinc-700 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Official Source:</span>
                      <strong className="text-zinc-800 dark:text-zinc-100">data.gov.in (AGMARKNET)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Sync Status:</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        {summary?.lastSync?.status?.toUpperCase() || 'ACTIVE'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Last Synchronized:</span>
                      <span className="text-zinc-800 dark:text-zinc-200 font-mono text-[11px]">
                        {summary?.lastSync?.startedAt ? new Date(summary.lastSync.startedAt).toLocaleString() : 'Recent'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Active Records:</span>
                      <strong className="text-forest">{summary?.totalRecords}</strong>
                    </div>
                  </div>

                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    Automatic synchronization polls data.gov.in every 6 hours. When <code className="bg-zinc-100 dark:bg-zinc-700 px-1 py-0.5 rounded">DATA_GOV_IN_API_KEY</code> is set in server/.env, daily live records are fetched automatically.
                  </p>

                  <button
                    type="button"
                    onClick={handleManualSync}
                    disabled={isSyncing}
                    className="w-full py-2.5 rounded-xl bg-forest hover:bg-forest-dark text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Synchronizing with data.gov.in...' : 'Trigger Manual Sync Now'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MarketPricesPage;
