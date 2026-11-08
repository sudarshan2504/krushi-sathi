import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Layers,
  Sprout,
  Bug,
  TrendingUp,
  ChevronRight,
  Bell,
  ArrowRight,
  CheckCircle2,
  Circle,
  ShieldAlert,
} from 'lucide-react';
import { WeatherWidget } from '../components/weather/WeatherWidget';
import { LocationEditModal } from '../components/location/LocationEditModal';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { CropPlan, Disease, WeatherData } from '../types';
import { BrandLogo } from '../components/ui/BrandLogo';
import { LanguagePill } from '../components/ui/LanguagePill';
import { IconTile } from '../components/ui/IconTile';
import { SectionHeader } from '../components/ui/SectionHeader';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const shouldReduceMotion = useReducedMotion();

  // State
  const [plans, setPlans] = useState<CropPlan[]>([]);
  const [activePlanIndex, setActivePlanIndex] = useState(0);
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    try {
      const [plansRes, diseasesRes] = await Promise.all([
        api.lifecycle.getPlans().catch(() => []),
        api.diseases.getAll().catch(() => []),
      ]);

      if (plansRes && plansRes.length > 0) {
        const firstPlanFull = await api.lifecycle
          .getPlan(plansRes[0].id)
          .catch(() => plansRes[0]);
        const populatedPlans = [...plansRes];
        populatedPlans[0] = firstPlanFull;
        setPlans(populatedPlans);
      } else {
        setPlans([]);
      }

      setDiseases(diseasesRes || []);
    } catch (err) {
      console.error('Dashboard load error:', err);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const currentPlan = plans[activePlanIndex] || null;

  // 2x2 Equal-Height Quick Action Tiles (matching mockup)
  const quickActionItems = [
    {
      id: 'soil',
      title: t('checkMySoil'),
      subtitle: t('nutrientsPhTest'),
      icon: <Layers className="w-5 h-5 text-[#144D29]" />,
      variant: 'mint' as const,
      buttonBg: 'bg-emerald-100 text-[#144D29]',
      action: () => navigate('/soil'),
    },
    {
      id: 'crops',
      title: t('recommendACrop'),
      subtitle: t('seasonalSuggestions'),
      icon: <Sprout className="w-5 h-5 text-[#228B22]" />,
      variant: 'green' as const,
      buttonBg: 'bg-emerald-100 text-[#228B22]',
      action: () => navigate('/crops'),
    },
    {
      id: 'pests',
      title: t('detectPests'),
      subtitle: t('identifyGetRemedy'),
      icon: <Bug className="w-5 h-5 text-[#D97706]" />,
      variant: 'peach' as const,
      buttonBg: 'bg-amber-100 text-[#D97706]',
      action: () => navigate('/diseases'),
    },
    {
      id: 'market',
      title: t('marketPrices'),
      subtitle: t('liveCropPrices'),
      icon: <TrendingUp className="w-5 h-5 text-[#0284C7]" />,
      variant: 'blue' as const,
      buttonBg: 'bg-sky-100 text-[#0284C7]',
      action: () => navigate('/market-prices'),
    },
  ];

  // User first name for personalized greeting
  const farmerName = user?.name ? user.name.split(' ')[0] : 'Ramesh';

  return (
    <div className="min-h-screen min-h-dvh w-full bg-[#FAF8F2] dark:bg-[#1E2320] flex justify-center pb-28 selection:bg-emerald-100 selection:text-forest-dark overflow-x-hidden">
      <div className="w-full max-w-[430px] min-h-screen min-h-dvh flex flex-col px-4 pt-3 space-y-4">
        {/* 1. TOP BAR (3-7% screen height): Logo + Language Pill + Bell with unread dot */}
        <header className="flex items-center justify-between py-1.5 z-20">
          <div className="flex items-center gap-2">
            <BrandLogo size="sm" variant="emblem" />
            <div className="flex flex-col">
              <span className="font-extrabold text-sm sm:text-base text-forest-dark dark:text-cream leading-tight">
                Krushi Sathi
              </span>
              <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">
                AI Farming Companion
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Pill */}
            <LanguagePill variant="compact" />

            {/* Notification Bell with red unread badge dot */}
            <button
              type="button"
              onClick={() => {
                setHasUnreadNotifications(false);
                showToast('You have 2 weather & crop advisories for Mandya', 'info');
              }}
              aria-label="View notifications"
              className="relative w-9 h-9 rounded-full bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200/70 dark:border-zinc-700 flex items-center justify-center shadow-xs hover:bg-zinc-50 active:scale-95 transition cursor-pointer"
            >
              <Bell className="w-4 h-4 text-zinc-700 dark:text-zinc-200" />
              {hasUnreadNotifications && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-zinc-800 animate-pulse" />
              )}
            </button>
          </div>
        </header>

        {/* 2. GREETING & SUNRISE FARMER SCENE STRIP */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#FAF8F2] via-[#FAF8F2]/90 to-transparent pt-3 pb-2 flex items-center justify-between">
          <div className="z-10 max-w-[65%]">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0D2B18] dark:text-cream inline-flex items-center gap-1.5">
              <span>{t('helloGreeting', { name: farmerName })}</span>
              <Sprout className="w-5 h-5 text-[#228B22] dark:text-emerald-400 rotate-12 inline-block shrink-0 -mt-1" />
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
              {t('goodDayForFarming')}
            </p>
          </div>

          {/* Farmer Looking toward Sunrise (Flipped to right side matching mockup) */}
          <div className="w-28 sm:w-32 h-20 overflow-hidden select-none shrink-0 rounded-2xl">
            <img
              src="/design/farmer-home-strip.webp"
              alt="Farmer looking over field"
              className="w-full h-full object-cover object-right"
              loading="eager"
            />
          </div>
        </div>

        {/* 3. WEATHER CARD (Curved Forest Green Header + 5-Day Strip + Peach Alert) */}
        <WeatherWidget
          initialDistrict={user?.district || 'Mandya'}
          onWeatherDataLoaded={setWeatherData}
          onChangeLocationClick={() => setIsLocationModalOpen(true)}
        />

        {/* 4. QUICK ACTIONS (2x2 Grid of Equal-Height Rounded-3xl Tiles) */}
        <div className="pt-2">
          <SectionHeader
            title={t('quickActions')}
            actionText={t('viewAll')}
            onAction={() => navigate('/crops')}
          />

          <div className="grid grid-cols-2 gap-3">
            {quickActionItems.map((item) => (
              <motion.button
                key={item.id}
                type="button"
                whileHover={shouldReduceMotion ? {} : { scale: 1.01 }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
                onClick={item.action}
                className="p-4 rounded-3xl bg-white dark:bg-zinc-800/95 border border-zinc-100 dark:border-zinc-700/60 shadow-card flex flex-col justify-between min-h-[120px] text-left transition select-none cursor-pointer"
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <IconTile variant={item.variant} size="md">
                    {item.icon}
                  </IconTile>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center ${item.buttonBg}`}>
                    <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#0D2B18] dark:text-zinc-100 leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium mt-0.5 line-clamp-1">
                    {item.subtitle}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* 5. ACTIVE CROP PLAN PROGRESS (Preserves crop lifecycle tracking if active) */}
        {currentPlan && (
          <div className="pt-2">
            <SectionHeader
              title="Active Crop Progress"
              actionText="View Lifecycle >"
              onAction={() => navigate(`/crops/lifecycle/${currentPlan.id}`)}
            />
            <div className="rounded-3xl bg-white dark:bg-zinc-800 p-4 border border-zinc-100 dark:border-zinc-700/60 shadow-card">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sprout className="w-4 h-4 text-forest" />
                  <span className="font-bold text-sm text-[#0D2B18] dark:text-cream">
                    {currentPlan.cropName}
                  </span>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-forest">
                  Stage: {currentPlan.currentStage || 'Growing'}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
                Planted on {new Date(currentPlan.startDate).toLocaleDateString()} • {currentPlan.areaAcre ? `${currentPlan.areaAcre} Acres` : 'Active Plan'}
              </p>
              <div className="w-full bg-zinc-100 rounded-full h-2">
                <div
                  className="bg-forest h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(15, currentPlan.progressPercentage || 35))}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Location Modal */}
        <LocationEditModal
          isOpen={isLocationModalOpen}
          onClose={() => setIsLocationModalOpen(false)}
          onLocationUpdated={(newState, newDistrict) => {
            showToast(`Location updated to ${newDistrict}, ${newState}`, 'success');
          }}
        />
      </div>
    </div>
  );
};

export default HomePage;
