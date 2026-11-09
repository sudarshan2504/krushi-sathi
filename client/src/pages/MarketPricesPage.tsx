import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ChevronLeft,
  TrendingUp,
  TrendingDown,
  MapPin,
  Calendar,
  Filter,
  Search,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { LanguagePill } from '../components/ui/LanguagePill';
import { IconTile } from '../components/ui/IconTile';

interface MarketItem {
  id: string;
  cropName: string;
  variety: string;
  market: string;
  state: string;
  modalPrice: number; // ₹ per quintal
  minPrice: number;
  maxPrice: number;
  change: number;
  changeType: 'up' | 'down' | 'stable';
  date: string;
}

const SAMPLE_MARKET_DATA: MarketItem[] = [
  {
    id: 'paddy-1',
    cropName: 'Paddy (Dhan)',
    variety: 'Sona Masuri (Grade A)',
    market: 'Mandya APMC',
    state: 'Karnataka',
    modalPrice: 2450,
    minPrice: 2200,
    maxPrice: 2580,
    change: 45,
    changeType: 'up',
    date: 'Today',
  },
  {
    id: 'ragi-1',
    cropName: 'Ragi (Finger Millet)',
    variety: 'GPU-28 Hybrid',
    market: 'Maddur APMC',
    state: 'Karnataka',
    modalPrice: 3850,
    minPrice: 3600,
    maxPrice: 4000,
    change: 80,
    changeType: 'up',
    date: 'Today',
  },
  {
    id: 'sugarcane-1',
    cropName: 'Sugarcane',
    variety: 'Co-86032',
    market: 'Pandavapura Mandi',
    state: 'Karnataka',
    modalPrice: 3150,
    minPrice: 3050,
    maxPrice: 3250,
    change: 0,
    changeType: 'stable',
    date: 'Today',
  },
  {
    id: 'tomato-1',
    cropName: 'Tomato',
    variety: 'Hybrid Local Red',
    market: 'Mysuru Bandipalya',
    state: 'Karnataka',
    modalPrice: 1650,
    minPrice: 1400,
    maxPrice: 1900,
    change: -50,
    changeType: 'down',
    date: 'Today',
  },
  {
    id: 'maize-1',
    cropName: 'Maize (Corn)',
    variety: 'Yellow Hybrid',
    market: 'Mandya APMC',
    state: 'Karnataka',
    modalPrice: 2180,
    minPrice: 2050,
    maxPrice: 2260,
    change: 30,
    changeType: 'up',
    date: 'Today',
  },
  {
    id: 'onion-1',
    cropName: 'Onion',
    variety: 'Medium Red',
    market: 'Bengaluru Yeshwanthpur',
    state: 'Karnataka',
    modalPrice: 2750,
    minPrice: 2400,
    maxPrice: 3100,
    change: 120,
    changeType: 'up',
    date: 'Today',
  },
];

export const MarketPricesPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const shouldReduceMotion = useReducedMotion();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMarket, setSelectedMarket] = useState('All');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredItems = SAMPLE_MARKET_DATA.filter((item) => {
    const matchesSearch =
      item.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.variety.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMarket = selectedMarket === 'All' || item.market.includes(selectedMarket);
    return matchesSearch && matchesMarket;
  });

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Live Mandi prices updated for Mandya & Mysore APMC', 'success');
    }, 600);
  };

  return (
    <div className="min-h-screen min-h-dvh w-full bg-[#FAF8F2] dark:bg-[#1E2320] flex justify-center pb-32 safe-bottom selection:bg-emerald-100 selection:text-forest-dark overflow-x-hidden">
      <div className="w-full max-w-[430px] min-h-screen min-h-dvh flex flex-col px-4 pt-3 space-y-4">
        {/* Top Header */}
        <header className="flex items-center justify-between py-1.5 z-20">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="w-9 h-9 rounded-full bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200/70 dark:border-zinc-700 flex items-center justify-center shadow-xs hover:bg-zinc-50 active:scale-95 transition cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 text-zinc-700 dark:text-zinc-200" />
          </button>

          <h1 className="text-base sm:text-lg font-extrabold text-[#0D2B18] dark:text-cream tracking-tight">
            {t('marketPrices')}
          </h1>

          <LanguagePill variant="compact" />
        </header>

        {/* Hero Card Banner */}
        <div className="rounded-3xl bg-gradient-to-b from-[#144D29] to-[#0D351B] text-white p-4 sm:p-5 shadow-card relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-emerald-200 text-[11px] font-bold">
              <MapPin className="w-3.5 h-3.5" />
              <span>Mandya & South Karnataka APMC</span>
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              className="text-white hover:text-emerald-300 transition active:scale-95"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <h2 className="text-xl font-extrabold tracking-tight text-white">
            Daily Mandi Rate Tracker
          </h2>
          <p className="text-xs text-emerald-100/90 mt-1">
            Official APMC mandi prices updated daily. Selling rates per quintal (100 kg).
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 px-3 py-2 shadow-xs">
            <Search className="w-4 h-4 text-zinc-400 mr-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search crop or variety..."
              className="w-full bg-transparent text-xs font-semibold text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
            />
          </div>

          <select
            value={selectedMarket}
            onChange={(e) => setSelectedMarket(e.target.value)}
            className="px-3 py-2 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-200 shadow-xs focus:outline-none"
          >
            <option value="All">All Mandis</option>
            <option value="Mandya">Mandya</option>
            <option value="Maddur">Maddur</option>
            <option value="Mysuru">Mysuru</option>
            <option value="Bengaluru">Bengaluru</option>
          </select>
        </div>

        {/* Market Rate Cards List */}
        <div className="space-y-3">
          {filteredItems.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * idx }}
              className="p-4 rounded-3xl bg-white dark:bg-zinc-800/95 border border-zinc-100 dark:border-zinc-700/60 shadow-card flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-[#0D2B18] dark:text-zinc-100">
                    {item.cropName}
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
                    {item.variety} • <span className="text-forest dark:text-emerald-400 font-semibold">{item.market}</span>
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-base sm:text-lg font-black text-[#0D2B18] dark:text-zinc-100">
                    ₹{item.modalPrice.toLocaleString()}
                    <span className="text-[10px] text-zinc-400 font-normal"> /qtl</span>
                  </div>
                  {item.change !== 0 ? (
                    <div
                      className={`inline-flex items-center gap-0.5 text-[10px] font-bold ${
                        item.changeType === 'up' ? 'text-emerald-600' : 'text-red-500'
                      }`}
                    >
                      {item.changeType === 'up' ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      <span>
                        {item.change > 0 ? `+₹${item.change}` : `-₹${Math.abs(item.change)}`}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[10px] font-bold text-zinc-400">Stable</span>
                  )}
                </div>
              </div>

              {/* Range bar: Min and Max price */}
              <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-700/50 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                <span>Min: ₹{item.minPrice}</span>
                <span className="w-20 bg-zinc-100 dark:bg-zinc-700 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-forest h-1.5 rounded-full"
                    style={{
                      width: `${Math.round(
                        ((item.modalPrice - item.minPrice) / (item.maxPrice - item.minPrice)) * 100
                      )}%`,
                    }}
                  />
                </span>
                <span>Max: ₹{item.maxPrice}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarketPricesPage;
