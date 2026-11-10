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
import { SceneBackground } from '../components/ui/SceneBackground';

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
      icon: <Layers className="w-5 h-5 text-[#144D29]" strokeWidth={2.2} />,
      tileBg: 'bg-[#DCFCE7] text-[#144D29]',
      buttonBg: 'bg-[#DCFCE7] text-[#144D29]',
      action: () => navigate('/soil'),
    },
    {
      id: 'crops',
      title: t('recommendACrop'),
      subtitle: t('seasonalSuggestions'),
      icon: <Sprout className="w-5 h-5 text-[#16A34A]" strokeWidth={2.2} />,
      tileBg: 'bg-[#E8F8EE] text-[#16A34A]',
      buttonBg: 'bg-[#E8F8EE] text-[#16A34A]',
      action: () => navigate('/crops'),
    },
    {
      id: 'pests',
      title: t('detectPests'),
      subtitle: t('identifyGetRemedy'),
      icon: <Bug className="w-5 h-5 text-[#DC2626]" strokeWidth={2.2} />,
      tileBg: 'bg-[#FEE2E2] text-[#DC2626]',
      buttonBg: 'bg-[#FEE2E2] text-[#DC2626]',
      action: () => navigate('/diseases'),
    },
    {
      id: 'market',
      title: t('marketPrices'),
      subtitle: t('liveCropPrices'),
      icon: <TrendingUp className="w-5 h-5 text-[#0284C7]" strokeWidth={2.2} />,
      tileBg: 'bg-[#E0F2FE] text-[#0284C7]',
      buttonBg: 'bg-[#E0F2FE] text-[#0284C7]',
      action: () => navigate('/market-prices'),
    },
  ];

  // User first name for personalized greeting
  const farmerName = user?.name ? user.name.split(' ')[0] : 'Ramesh';

  return (
    <SceneBackground variant="hero" className="px-4 pt-3 space-y-3 pb-36 safe-bottom">
      {/* 1. TOP BAR (3-7% screen height): Logo + Language Pill + Bell with unread dot */}
        <header className="flex items-center justify-between py-1.5 relative z-20">
          <div className="flex items-center gap-2">
            <BrandLogo size="sm" variant="emblem" />
            <div className="flex flex-col">
              <span className="font-extrabold text-sm sm:text-base text-forest-dark dark:text-cream leading-tight">
                Krushi Sathi
              </span>
              <span className="text-[10px] font-semibold text-zinc-600 dark:text-zinc-400">
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

        {/* 2. GREETING: placed over the sky area on the left */}
        <div className="pt-3 sm:pt-4 pb-0.5 relative z-20 max-w-[62%]">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0D2B18] dark:text-cream inline-flex items-center gap-1.5 leading-tight">
            <span>{t('helloGreeting', { name: farmerName })}</span>
            <Sprout className="w-5 h-5 text-[#228B22] dark:text-emerald-400 rotate-12 inline-block shrink-0 -mt-1" />
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-medium mt-1">
            {t('goodDayForFarming')}
          </p>
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
                className="p-3.5 sm:p-4 rounded-3xl bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700/60 shadow-card flex items-center justify-between text-left transition select-none cursor-pointer hover:shadow-md"
              >
                <div className="flex flex-col min-w-0 pr-1">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-2 shrink-0 ${item.tileBg}`}>
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[13px] sm:text-sm font-bold text-[#0D2B18] dark:text-zinc-100 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 font-medium mt-0.5 line-clamp-1">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 self-center ml-1.5 ${item.buttonBg}`}>
                  <ChevronRight className="w-4 h-4 stroke-[2.5]" />
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
    </SceneBackground>
  );
};

export default HomePage;
