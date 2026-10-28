import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion, Variants } from 'framer-motion';
import {
  Sparkles,
  Bot,
  Sprout,
  ArrowRight,
  CheckCircle2,
  Circle,
  ShieldAlert,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Layers,
  AlertTriangle,
  Check,
} from 'lucide-react';
import { WeatherWidget } from '../components/weather/WeatherWidget';
import { LocationEditModal } from '../components/location/LocationEditModal';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { CropPlan, Disease, WeatherData } from '../types';
import { LoadingState } from '../components/ui/LoadingState';
import { AnimatedCounter } from '../components/ui/AnimatedCounter';
import { CropImage } from '../components/ui/CropImage';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, language } = useTranslation();
  const { showToast } = useToast();
  const shouldReduceMotion = useReducedMotion();

  // State
  const [plans, setPlans] = useState<CropPlan[]>([]);
  const [activePlanIndex, setActivePlanIndex] = useState(0);
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [latestAssessment, setLatestAssessment] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [weatherRefreshKey, setWeatherRefreshKey] = useState(0);

  // Avoid re-animating on re-renders
  const isInitialMount = useRef(true);

  // Active chip scroll into view ref
  const planButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (planButtonRefs.current[activePlanIndex]) {
      planButtonRefs.current[activePlanIndex]?.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [activePlanIndex]);

  // Load dashboard data
  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      try {
        const [plansRes, diseasesRes, assessmentsRes] = await Promise.all([
          api.lifecycle.getPlans().catch(() => []),
          api.diseases.getAll().catch(() => []),
          api.soil.getAssessments().catch(() => []),
        ]);

        if (!isMounted) return;

        // Process plans
        if (plansRes && plansRes.length > 0) {
          // Fetch full plan with tasks for the first plan
          const firstPlanFull = await api.lifecycle
            .getPlan(plansRes[0].id)
            .catch(() => plansRes[0]);
          const populatedPlans = [...plansRes];
          populatedPlans[0] = firstPlanFull;
          setPlans(populatedPlans);
        } else {
          setPlans([]);
        }

        // Process diseases
        setDiseases(diseasesRes || []);

        // Process latest soil assessment if any
        if (assessmentsRes && assessmentsRes.length > 0) {
          // Sort descending by date
          const sorted = [...assessmentsRes].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setLatestAssessment(sorted[0]);
        }
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setTimeout(() => {
            isInitialMount.current = false;
          }, 500);
        }
      }
    }

    loadDashboardData();
    return () => {
      isMounted = false;
    };
  }, []);

  // When switching plans, fetch full plan if tasks aren't loaded yet
  const handleSelectPlan = async (index: number) => {
    setActivePlanIndex(index);
    const targetPlan = plans[index];
    if (targetPlan && (!targetPlan.tasks || targetPlan.tasks.length === 0)) {
      try {
        const full = await api.lifecycle.getPlan(targetPlan.id);
        if (full) {
          setPlans((prev) => {
            const updated = [...prev];
            updated[index] = full;
            return updated;
          });
        }
      } catch (err) {
        console.error('Failed to load full plan:', err);
      }
    }
  };

  const currentPlan = plans[activePlanIndex] || null;

  // Toggle task completion
  const handleToggleTask = async (taskId: string, currentStatus: boolean) => {
    try {
      const res = await api.lifecycle.toggleTask(taskId, !currentStatus);
      if (res && res.plan) {
        setPlans((prev) => {
          const updated = [...prev];
          updated[activePlanIndex] = res.plan;
          return updated;
        });
        showToast(
          currentStatus ? t('taskPendingToast') : t('taskCompletedToast'),
          'success'
        );
      }
    } catch (err) {
      console.error('Failed to toggle task:', err);
      showToast('Could not update task. Please try again.', 'error');
    }
  };

  // Quick Actions: strictly 3 streamlined cards (merged soil/recommend, crop library, AI chat)
  const quickActions = [
    {
      title: t('findRightCrop'),
      subtitle: t('findRightCropSub'),
      icon: Sparkles,
      bg: 'bg-emerald-50 text-forest border-emerald-200/80 hover:bg-emerald-100/70',
      iconBg: 'bg-emerald-600 text-white',
      action: () => navigate('/soil'),
    },
    {
      title: t('cropLibraryAction'),
      subtitle: t('cropLibraryActionSub'),
      icon: Sprout,
      bg: 'bg-amber-50 text-earth-dark border-amber-200/80 hover:bg-amber-100/70',
      iconBg: 'bg-amber-600 text-white',
      action: () => navigate('/crop-library'),
    },
    {
      title: t('askAiAssistantAction'),
      subtitle: t('askAiAssistantActionSub'),
      icon: Bot,
      bg: 'bg-blue-50 text-blue-800 border-blue-200/80 hover:bg-blue-100/70',
      iconBg: 'bg-blue-600 text-white',
      action: () => navigate('/chat'),
    },
  ];

  // Dynamic ranking of Crop Health Alerts based on:
  // 1. Farmer's active crop(s)
  // 2. Crop lifecycle stage
  // 3. Current weather risk (humidity, temperature, rain from live Open-Meteo)
  // 4. Current season
  const rankedHealthAlerts = useMemo(() => {
    if (!diseases || diseases.length === 0) return [];

    const activeCropNames = plans.map((p) => (p.cropName || '').toLowerCase());
    const currentStage = (currentPlan?.currentStage || '').toLowerCase();
    const humidity = weatherData?.humidity ?? 65;
    const temp = weatherData?.temperature ?? 28;
    const rainProb = weatherData?.rainfallProbability ?? 0;
    const isRaining = rainProb > 40 || (weatherData?.expectedPrecipitationMm ?? 0) > 2;

    const scored = diseases.map((d) => {
      let score = 10;
      let primaryReason = t('reasonGeneralSeason');
      let riskLevel: 'low' | 'medium' | 'high' = 'low';

      const affected = (d.affectedCrops || []).map((c) => c.toLowerCase());
      const hasCropMatch = activeCropNames.some((ac) =>
        affected.some((c) => c.includes(ac) || ac.includes(c))
      );

      if (hasCropMatch) {
        score += 50;
        primaryReason = `${currentPlan?.cropName || 'Your crop'} susceptible`;
      }

      // High humidity risk
      const isHumiditySensitive =
        /fungal|blight|mildew|rot|leaf spot|blast/i.test(d.name) ||
        /humid|wet|moist/i.test(d.conditions || '');
      if (humidity > 70 && isHumiditySensitive) {
        score += 30;
        primaryReason = t('reasonHumidity');
      }

      // Rain / wet risk
      if (isRaining && isHumiditySensitive) {
        score += 25;
        primaryReason = t('reasonRain');
      }

      // High temperature / drought pest risk
      const isHeatSensitive =
        /wilt|mite|borer|thrip|aphid|heat/i.test(d.name) ||
        /dry|warm|hot|temp/i.test(d.conditions || '');
      if (temp > 33 && isHeatSensitive) {
        score += 20;
        primaryReason = t('reasonTemperature');
      }

      // Lifecycle stage vulnerability
      if (currentStage && d.conditions && d.conditions.toLowerCase().includes(currentStage)) {
        score += 25;
        primaryReason = t('reasonLifecycleStage');
      }

      // Assign badge tier
      if (score >= 65) {
        riskLevel = 'high';
      } else if (score >= 35) {
        riskLevel = 'medium';
      } else {
        riskLevel = 'low';
      }

      return {
        disease: d,
        score,
        riskLevel,
        primaryReason,
      };
    });

    // Sort descending by calculated score and take top 3
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 3);
  }, [diseases, plans, currentPlan, weatherData, t]);

  // Motion variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.04,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduceMotion ? 0 : 0.22, ease: 'easeOut' },
    },
  };

  if (isLoading) {
    return <LoadingState type="dashboard" />;
  }

  // Location display text
  const locationDisplay = user?.district
    ? `${user?.village ? user.village + ', ' : ''}${user.district}${user.state ? ', ' + user.state : ''}`
    : 'Mysuru, Karnataka';

  return (
    <motion.div
      variants={containerVariants}
      initial={isInitialMount.current ? 'hidden' : 'visible'}
      animate="visible"
      className="space-y-5 pb-[calc(3rem+env(safe-area-inset-bottom,0px))] max-w-4xl mx-auto"
    >
      {/* =========================================================================
          SECTION 1: GREETING + LOCATION CHIP + WEATHER WIDGET
          ========================================================================= */}
      <motion.section variants={itemVariants} className="space-y-3">
        {/* Farmer Greeting & Location Chip Bar */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-forest/15 shadow-xs bg-gradient-to-r from-white via-cream-light/40 to-mint-light/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-dark-text tracking-tight flex items-center gap-2">
              <span>{t('greetingNamaste', { name: user?.name || 'Farmer' })}</span>
            </h1>
            <p className="text-xs text-dark-muted font-medium mt-0.5">
              {t('goodDayFarming')}
            </p>
          </div>

          {/* Interactive Location Chip (opens LocationEditModal) */}
          <button
            type="button"
            onClick={() => setIsLocationModalOpen(true)}
            className="inline-flex items-center gap-2 self-start sm:self-center px-3.5 py-2.5 rounded-2xl bg-forest/10 hover:bg-forest/15 active:scale-95 text-forest border border-forest/20 text-xs font-bold transition shadow-2xs group cursor-pointer min-h-[44px] touch-target"
            title={t('editLocationTitle')}
          >
            <MapPin className="w-4 h-4 text-forest shrink-0 group-hover:scale-110 transition-transform" />
            <span className="truncate max-w-[200px] sm:max-w-[260px]">
              {locationDisplay}
            </span>
            <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded-md bg-forest/20 text-forest ml-0.5">
              {t('locationEditBtn')}
            </span>
          </button>
        </div>

        {/* Live Weather Widget */}
        <WeatherWidget
          key={`weather-${weatherRefreshKey}-${user?.district || 'Mysuru'}`}
          initialDistrict={user?.district || 'Mysuru'}
          onWeatherDataLoaded={setWeatherData}
        />
      </motion.section>

      {/* =========================================================================
          SECTION 2: STREAMLINED QUICK ACTIONS (MAX 3)
          Merged: "Find the right crop", "Crop library", "Ask AI"
          ========================================================================= */}
      <motion.section variants={itemVariants}>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <h2 className="text-sm font-extrabold text-dark-muted uppercase tracking-wider">
            {t('quickActionsTitle')}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={idx}
                whileHover={shouldReduceMotion ? {} : { y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={action.action}
                className={`p-4 rounded-3xl border text-left flex items-center sm:flex-col sm:items-start justify-start gap-3.5 shadow-2xs transition-all cursor-pointer ${action.bg}`}
              >
                <div
                  className={`w-11 h-11 rounded-2xl ${action.iconBg} flex items-center justify-center shrink-0 shadow-xs`}
                >
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-extrabold block text-dark-text leading-tight">
                    {action.title}
                  </span>
                  <span className="text-xs text-dark-muted block mt-0.5 line-clamp-1">
                    {action.subtitle}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-dark-muted shrink-0 sm:hidden" />
              </motion.button>
            );
          })}
        </div>
      </motion.section>

      {/* =========================================================================
          SECTION 3: SMART "TODAY" CARD
          - If active plan: shows progress, next 1-3 tasks, and multiple plans switcher
          - If none: ONE CTA "Plan your first crop" reusing saved soil test if exists
          ========================================================================= */}
      <motion.section variants={itemVariants}>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <h2 className="text-base font-black text-dark-text tracking-tight flex items-center gap-2">
            <span>{t('todayCardTitle')}</span>
          </h2>
          {currentPlan && (
            <button
              onClick={() => navigate(`/crops/lifecycle/${currentPlan.id}`)}
              className="text-xs text-forest font-bold hover:underline flex items-center gap-1 min-h-[44px] py-1 px-2 touch-target"
            >
              <span>{t('viewFullGuide')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {currentPlan ? (
          <div className="rounded-3xl bg-white border border-forest/15 shadow-sm p-5 space-y-4">
            {/* Multiple Plans Switcher (if farmer has > 1 active plan) */}
            {plans.length > 1 && (
              <div className="flex items-center justify-between gap-2 p-2 rounded-2xl bg-cream-light/60 border border-forest/10">
                <button
                  type="button"
                  onClick={() =>
                    handleSelectPlan(
                      activePlanIndex > 0 ? activePlanIndex - 1 : plans.length - 1
                    )
                  }
                  className="min-w-[44px] min-h-[44px] rounded-xl bg-white border border-forest/15 flex items-center justify-center text-forest hover:bg-forest/10 active:scale-95 transition cursor-pointer touch-target"
                  title="Previous plan"
                  aria-label="Previous plan"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
                  {plans.map((p, idx) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectPlan(idx)}
                      className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer touch-target ${
                        idx === activePlanIndex
                          ? 'bg-forest text-white shadow-xs'
                          : 'bg-white text-dark-text border border-forest/15 hover:bg-forest/5'
                      }`}
                    >
                      {p.cropName}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleSelectPlan(
                      activePlanIndex < plans.length - 1 ? activePlanIndex + 1 : 0
                    )
                  }
                  className="min-w-[44px] min-h-[44px] rounded-xl bg-white border border-forest/15 flex items-center justify-center text-forest hover:bg-forest/10 active:scale-95 transition cursor-pointer touch-target"
                  title="Next plan"
                  aria-label="Next plan"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Plan Header: Crop Name, Stage, Progress */}
            <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2.5 sm:gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl overflow-hidden bg-mint shrink-0 border border-forest/15 shadow-2xs">
                  <img
                    src={
                      currentPlan.crop?.imageUrl ||
                      'https://images.unsplash.com/photo-1536657464919-892534f60d6e?w=200&auto=format&fit=crop&q=80'
                    }
                    alt={currentPlan.cropName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-black text-dark-text text-base sm:text-lg leading-snug truncate">
                    {currentPlan.cropName}
                  </h3>
                  <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                    <span className="text-xs text-dark-muted font-medium">
                      {currentPlan.fieldName || 'Main Field'} • {currentPlan.areaAcre || 1.5}{' '}
                      {t('acres')}
                    </span>
                    {currentPlan.currentStage && (
                      <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-forest/10 text-forest border border-forest/20 whitespace-nowrap">
                        {t('stageLabel')}: {currentPlan.currentStage}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <span className="py-1 px-3 rounded-full bg-mint text-forest text-xs font-black border border-forest/20 shrink-0 self-start xs:self-center whitespace-nowrap">
                <AnimatedCounter value={currentPlan.progressPercentage} suffix="%" />{' '}
                {t('progress')}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 rounded-full bg-gray-100 overflow-hidden">
              <motion.div
                initial={
                  shouldReduceMotion
                    ? { width: `${currentPlan.progressPercentage}%` }
                    : { width: 0 }
                }
                animate={{ width: `${currentPlan.progressPercentage}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-forest to-leaf rounded-full"
              />
            </div>

            {/* Next 1 to 3 Tasks */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-extrabold text-dark-muted uppercase tracking-wider block">
                {t('upcomingTasksTitle')}:
              </span>

              {currentPlan.tasks && currentPlan.tasks.length > 0 ? (
                currentPlan.tasks.slice(0, 3).map((task) => (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => handleToggleTask(task.id, task.isCompleted)}
                    className={`w-full text-left min-h-[44px] flex items-start gap-2.5 p-3 rounded-2xl border cursor-pointer transition-colors ${
                      task.isCompleted
                        ? 'bg-gray-50/80 border-gray-100 text-dark-muted line-through'
                        : 'bg-cream-light/40 border-forest/15 hover:border-forest/40 text-dark-text'
                    }`}
                  >
                    <span className="mt-0.5 text-forest shrink-0">
                      {task.isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-forest" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-400" />
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs sm:text-sm font-bold block leading-tight">
                        {language === 'kn'
                          ? task.titleKn || task.title
                          : language === 'ta'
                          ? task.titleTa || task.title
                          : language === 'te'
                          ? task.titleTe || task.title
                          : task.title}
                      </span>
                      <span className="text-[11px] text-dark-muted block mt-0.5">
                        {task.dayRange} • {task.stage}
                      </span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-3.5 rounded-2xl bg-mint-light/40 border border-forest/15 text-xs text-forest font-bold flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>{t('allTasksCompleted')}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Empty State: ONE call to action "Plan your first crop", reuses saved soil test if exists */
          <div className="p-6 rounded-3xl bg-white border border-forest/15 shadow-sm text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-mint flex items-center justify-center mx-auto text-forest shadow-xs">
              <Sprout className="w-7 h-7" />
            </div>

            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-base sm:text-lg font-black text-dark-text">
                {t('planFirstCrop')}
              </h3>
              <p className="text-xs sm:text-sm text-dark-muted leading-relaxed">
                {t('planFirstCropSubtitle')}
              </p>
            </div>

            {latestAssessment ? (
              <div className="space-y-2.5 max-w-sm mx-auto">
                <button
                  type="button"
                  onClick={() =>
                    navigate('/crops/recommend', {
                      state: { assessment: latestAssessment },
                    })
                  }
                  className="w-full min-h-[46px] py-2.5 px-5 rounded-2xl bg-forest text-white text-xs sm:text-sm font-extrabold shadow-md hover:bg-forest-dark transition-all inline-flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-goldenrod" />
                  <span>
                    {t('startWithSavedSoil', {
                      date: new Date(latestAssessment.createdAt).toLocaleDateString(),
                    })}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/soil')}
                  className="text-xs text-forest font-bold hover:underline py-1 block mx-auto cursor-pointer"
                >
                  {t('startNewSoilTest')} →
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/soil')}
                className="min-h-[46px] py-2.5 px-6 rounded-2xl bg-forest text-white text-xs sm:text-sm font-extrabold shadow-md hover:bg-forest-dark transition-all inline-flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <span>🌾</span>
                <span>{t('planFirstCrop')}</span>
              </button>
            )}
          </div>
        )}
      </motion.section>

      {/* =========================================================================
          SECTION 4: CROP HEALTH ALERTS ROW (MAX 3, HORIZONTALLY SCROLLABLE)
          Ranked dynamically by active crop, lifecycle stage, and live weather risk
          ========================================================================= */}
      <motion.section variants={itemVariants}>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black text-dark-text tracking-tight">
              {t('cropHealthAlertsTitle')}
            </h2>
            <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
              Live Advisory
            </span>
          </div>

          <button
            onClick={() => navigate('/diseases')}
            className="text-xs text-forest font-bold hover:underline min-h-[36px] flex items-center gap-1 cursor-pointer"
          >
            <span>{t('viewFullGuide')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {rankedHealthAlerts.length > 0 ? (
          <div className="flex gap-3 overflow-x-auto pb-3 -mx-1 px-1 scrollbar-none snap-x touch-pan-x">
            {rankedHealthAlerts.map(({ disease: d, riskLevel, primaryReason }) => {
              const badgeStyle =
                riskLevel === 'high'
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : riskLevel === 'medium'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200';

              const badgeLabel =
                riskLevel === 'high'
                  ? t('riskHigh')
                  : riskLevel === 'medium'
                  ? t('riskModerate')
                  : t('riskLow');

              return (
                <motion.div
                  key={d.id}
                  whileHover={shouldReduceMotion ? {} : { y: -2 }}
                  onClick={() => navigate('/diseases', { state: { selectedProblemId: d.id } })}
                  className="w-[260px] xs:w-[280px] sm:w-[320px] shrink-0 p-4 rounded-3xl bg-white border border-forest/15 shadow-xs cursor-pointer hover:border-forest/40 transition-all flex flex-col justify-between min-h-[175px] snap-start"
                >
                  <div>
                    {/* Badges: Risk level + Primary trigger reason */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span
                        className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full border flex items-center gap-1 ${badgeStyle}`}
                      >
                        <ShieldAlert className="w-3 h-3" />
                        <span>{badgeLabel}</span>
                      </span>

                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cream-light text-dark-muted border border-forest/10 truncate max-w-[150px]">
                        {primaryReason}
                      </span>
                    </div>

                    {/* Problem Name & Affected Crops */}
                    <h3 className="text-sm font-black text-dark-text leading-tight line-clamp-1">
                      {language === 'kn'
                        ? d.nameKannada || d.name
                        : language === 'ta'
                        ? d.nameTamil || d.name
                        : language === 'te'
                        ? d.nameTelugu || d.name
                        : d.name}
                    </h3>
                    <p className="text-[11px] text-dark-muted font-medium mt-0.5 truncate">
                      {d.affectedCrops?.join(', ') || 'Field crops'}
                    </p>

                    {/* Symptoms preview */}
                    <p className="text-xs text-dark-text/80 line-clamp-2 leading-relaxed mt-2">
                      {language === 'kn'
                        ? d.symptomsKn || d.symptoms
                        : language === 'ta'
                        ? d.symptomsTa || d.symptoms
                        : language === 'te'
                        ? d.symptomsTe || d.symptoms
                        : d.symptoms}
                    </p>
                  </div>

                  {/* CTA link */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between mt-auto">
                    <span className="text-xs text-forest font-black flex items-center gap-1">
                      <span>{t('viewSolution')}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-[11px] text-dark-muted">Advisory</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 rounded-3xl bg-white border border-forest/15 shadow-xs text-center text-xs text-dark-muted font-medium">
            {t('noAlertsForNow')}
          </div>
        )}
      </motion.section>

      {/* =========================================================================
          LOCATION EDIT MODAL
          ========================================================================= */}
      <LocationEditModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onLocationUpdated={(_st, _dist, _lat, _lon) => {
          setWeatherRefreshKey((k) => k + 1);
        }}
      />
    </motion.div>
  );
};

export default HomePage;
