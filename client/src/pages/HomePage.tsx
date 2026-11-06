import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion, Variants } from 'framer-motion';
import {
  Sparkles,
  MessageCircle,
  Sprout,
  ArrowRight,
  CheckCircle2,
  Circle,
  ShieldAlert,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Layers,
  Check,
  Lightbulb,
  RefreshCw,
  Bell,
  TrendingUp,
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
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/Progress';
import { Button } from '../components/ui/Button';

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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [weatherRefreshKey, setWeatherRefreshKey] = useState(0);

  // Pull-to-refresh touch tracking
  const [pullY, setPullY] = useState(0);
  const touchStartY = useRef(0);

  // Avoid re-animating on re-renders
  const isInitialMount = useRef(true);
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
  const loadDashboardData = useCallback(async (isPull = false) => {
    if (isPull) setIsRefreshing(true);
    try {
      const [plansRes, diseasesRes, assessmentsRes] = await Promise.all([
        api.lifecycle.getPlans().catch(() => []),
        api.diseases.getAll().catch(() => []),
        api.soil.getAssessments().catch(() => []),
      ]);

      // Process plans
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

      if (assessmentsRes && assessmentsRes.length > 0) {
        const sorted = [...assessmentsRes].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setLatestAssessment(sorted[0]);
      }

      if (isPull) {
        setWeatherRefreshKey((k) => k + 1);
        showToast('Dashboard refreshed', 'success');
      }
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setTimeout(() => {
        isInitialMount.current = false;
      }, 500);
    }
  }, [showToast]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Pull to refresh gesture listeners
  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      touchStartY.current = e.touches[0].clientY;
    } else {
      touchStartY.current = 0;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current > 0 && window.scrollY === 0) {
      const diff = e.touches[0].clientY - touchStartY.current;
      if (diff > 0) {
        setPullY(Math.min(diff * 0.4, 70));
      }
    }
  };

  const handleTouchEnd = () => {
    if (pullY > 45 && !isRefreshing) {
      loadDashboardData(true);
    }
    setPullY(0);
    touchStartY.current = 0;
  };

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

  // 2x2 Bento Grid Quick Actions
  const bentoActions = [
    {
      id: 'soil',
      title: t('checkMySoil') || 'Soil Check',
      subtitle: 'Nutrients & pH test',
      icon: Layers,
      bg: 'bg-white dark:bg-dark-surface hover:border-brand-500/40',
      iconBg: 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400',
      action: () => navigate('/soil'),
    },
    {
      id: 'crops',
      title: t('recommendCrop') || 'Crop Advice',
      subtitle: 'Seasonal recommendations',
      icon: Sprout,
      bg: 'bg-white dark:bg-dark-surface hover:border-brand-500/40',
      iconBg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      action: () => navigate('/crops'),
    },
    {
      id: 'disease',
      title: t('diseaseTips') || 'Disease Help',
      subtitle: 'Protection & cures',
      icon: ShieldAlert,
      bg: 'bg-white dark:bg-dark-surface hover:border-brand-500/40',
      iconBg: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      action: () => navigate('/diseases'),
    },
    {
      id: 'chat',
      title: t('askAiAssistant') || 'Ask AI',
      subtitle: 'Voice & text companion',
      icon: MessageCircle,
      bg: 'bg-white dark:bg-dark-surface hover:border-brand-500/40',
      iconBg: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      action: () => navigate('/chat'),
    },
  ];

  // Dynamic ranking of Crop Health Alerts
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

      const isHumiditySensitive =
        /fungal|blight|mildew|rot|leaf spot|blast/i.test(d.name) ||
        /humid|wet|moist/i.test(d.conditions || '');
      if (humidity > 70 && isHumiditySensitive) {
        score += 30;
        primaryReason = t('reasonHumidity');
      }

      if (isRaining && isHumiditySensitive) {
        score += 25;
        primaryReason = t('reasonRain');
      }

      const isHeatSensitive =
        /wilt|mite|borer|thrip|aphid|heat/i.test(d.name) ||
        /dry|warm|hot|temp/i.test(d.conditions || '');
      if (temp > 33 && isHeatSensitive) {
        score += 20;
        primaryReason = t('reasonTemperature');
      }

      if (currentStage && d.conditions && d.conditions.toLowerCase().includes(currentStage)) {
        score += 25;
        primaryReason = t('reasonLifecycleStage');
      }

      if (score >= 65) riskLevel = 'high';
      else if (score >= 35) riskLevel = 'medium';
      else riskLevel = 'low';

      return { disease: d, score, riskLevel, primaryReason };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 3);
  }, [diseases, plans, currentPlan, weatherData, t]);

  // Dynamic Today's Tip
  const todayTip = useMemo(() => {
    const humidity = weatherData?.humidity ?? 65;
    const temp = weatherData?.temperature ?? 28;
    const rainProb = weatherData?.rainfallProbability ?? 0;

    if (rainProb > 50) {
      return {
        title: 'Rain Protection & Drainage',
        desc: 'Clear farm channels to avoid root waterlogging. Hold off on nitrogen spraying until leaves dry.',
        tag: 'Weather Advisory',
      };
    }
    if (temp > 32) {
      return {
        title: 'Midday Heat Management',
        desc: 'Irrigate fields early morning or after 5 PM to minimize evaporation loss and preserve soil moisture.',
        tag: 'Moisture Care',
      };
    }
    if (humidity > 75) {
      return {
        title: 'Fungal Monitoring',
        desc: 'High ambient humidity creates spore-friendly conditions. Inspect lower leaf undersides for early spots.',
        tag: 'Crop Health',
      };
    }
    return {
      title: 'Optimal Sowing Window',
      desc: 'Soil temperature and moisture balance are ideal for pulse sowing and seed germination this week.',
      tag: 'Field Best Practice',
    };
  }, [weatherData]);

  // Motion variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: shouldReduceMotion ? 0 : 0.05 },
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
    return (
      <div className="py-12">
        <LoadingState message="Loading your farm companion..." />
      </div>
    );
  }

  const locationDisplay = user?.district
    ? `${user?.village ? user.village + ', ' : ''}${user.district}${user.state ? ', ' + user.state : ''}`
    : 'Mysuru, Karnataka';

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      {/* Pull-to-refresh indicator */}
      {pullY > 0 && (
        <div
          style={{ height: pullY }}
          className="flex items-center justify-center overflow-hidden transition-all text-xs font-semibold text-brand-700 dark:text-brand-400 gap-1.5"
        >
          <RefreshCw className={`w-4 h-4 ${pullY > 45 ? 'animate-spin' : ''}`} />
          <span>{pullY > 45 ? 'Release to refresh' : 'Pull down to refresh'}</span>
        </div>
      )}

      <motion.div
        variants={containerVariants}
        initial={isInitialMount.current ? 'hidden' : 'visible'}
        animate="visible"
        className="space-y-6 max-w-xl mx-auto"
      >
        {/* =========================================================================
            HEADER GREETING (Clean display type + 1-line subtitle, no emoji, no location pill)
            ========================================================================= */}
        <motion.section variants={itemVariants} className="pt-1">
          <div>
            <h1 className="text-display font-extrabold text-gray-900 dark:text-gray-100 tracking-tight leading-tight">
              {t('helloFarmer', { name: user?.name ? user.name.split(' ')[0] : 'Farmer' })}
            </h1>
            <p className="text-[15px] text-gray-600 dark:text-gray-300 font-medium mt-1">
              {t('goodDayFarming')}
            </p>
          </div>
        </motion.section>

        {/* =========================================================================
            HERO WEATHER CARD
            ========================================================================= */}
        <motion.section variants={itemVariants}>
          <WeatherWidget
            key={`weather-${weatherRefreshKey}-${user?.district || 'Mysuru'}`}
            initialDistrict={user?.district || 'Mysuru'}
            onWeatherDataLoaded={setWeatherData}
          />
        </motion.section>

        {/* =========================================================================
            2x2 GRID OF QUICK ACTIONS (Equal-height tiles, circle icons, robust text wrapping)
            ========================================================================= */}
        <motion.section variants={itemVariants}>
          <div className="flex items-center justify-between mb-3 px-0.5">
            <h2 className="text-[13px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              {t('quickActionsTitle') || 'Quick Actions'}
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 items-stretch">
            {bentoActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  type="button"
                  onClick={action.action}
                  className="p-4 rounded-3xl border border-gray-100 dark:border-dark-border text-left flex flex-col justify-between gap-3 shadow-card transition-all duration-150 active:scale-[0.98] min-h-[128px] h-full bg-white dark:bg-dark-surface hover:border-brand-500/30"
                >
                  <div className={`w-11 h-11 rounded-full ${action.iconBg} flex items-center justify-center shrink-0`}>
                    <Icon className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[15px] font-bold block text-gray-900 dark:text-gray-100 leading-snug break-words">
                      {action.title}
                    </span>
                    <span className="text-[12px] text-gray-500 dark:text-gray-400 block mt-1 leading-snug line-clamp-1">
                      {action.subtitle}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.section>

        {/* =========================================================================
            TODAY'S CARD: ACTIVE CROP OR PLAN FIRST CROP
            ========================================================================= */}
        <motion.section variants={itemVariants}>
          <div className="flex items-center justify-between mb-3 px-0.5">
            <h2 className="text-[16px] font-bold text-gray-900 dark:text-gray-100 tracking-tight">
              {t('todayCardTitle') || 'Current Crop Lifecycle'}
            </h2>
            {currentPlan && (
              <button
                onClick={() => navigate(`/crops/lifecycle/${currentPlan.id}`)}
                className="text-xs text-brand-700 dark:text-brand-400 font-bold hover:underline inline-flex items-center gap-1"
              >
                <span>{t('viewFullGuide') || 'View Guide'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {currentPlan ? (
            <Card variant="flat" className="p-5 space-y-4">
              {/* Multiple Plans Switcher */}
              {plans.length > 1 && (
                <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-gray-50 dark:bg-dark-elevated border border-gray-100 dark:border-dark-border min-w-0 w-full">
                  <button
                    type="button"
                    onClick={() =>
                      handleSelectPlan(
                        activePlanIndex > 0 ? activePlanIndex - 1 : plans.length - 1
                      )
                    }
                    className="w-8 h-8 shrink-0 rounded-xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-brand-600 transition"
                    aria-label="Previous plan"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex-1 min-w-0 flex items-center gap-1.5 overflow-x-auto py-0.5 chips-scroll">
                    {plans.map((p, idx) => (
                      <button
                        key={p.id}
                        ref={(el) => { planButtonRefs.current[idx] = el; }}
                        type="button"
                        onClick={() => handleSelectPlan(idx)}
                        className={[
                          'px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 whitespace-nowrap',
                          idx === activePlanIndex
                            ? 'bg-brand-700 text-white shadow-xs'
                            : 'bg-white dark:bg-dark-surface text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-dark-border hover:border-brand-400',
                        ].join(' ')}
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
                    className="w-8 h-8 shrink-0 rounded-xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-brand-600 transition"
                    aria-label="Next plan"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Plan Header */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden bg-brand-50 shrink-0 border border-brand-100">
                    <CropImage
                      src={currentPlan.crop?.imageUrl}
                      alt={currentPlan.cropName}
                      cropName={currentPlan.cropName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-[16px] leading-tight truncate">
                      {currentPlan.cropName}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        {currentPlan.fieldName || 'Main Field'}
                      </span>
                      {currentPlan.currentStage && (
                        <Badge variant="brand">
                          {currentPlan.currentStage}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <Badge variant="brand" className="text-xs font-bold tabular">
                  <AnimatedCounter value={currentPlan.progressPercentage} suffix="%" />
                </Badge>
              </div>

              {/* Progress bar */}
              <ProgressBar value={currentPlan.progressPercentage} color="brand" size="sm" />

              {/* Tasks List */}
              <div className="space-y-2 pt-1">
                <span className="text-[12px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
                  {t('upcomingTasks') || 'Upcoming Tasks'}
                </span>

                {currentPlan.tasks && currentPlan.tasks.length > 0 ? (
                  currentPlan.tasks.slice(0, 3).map((task) => (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => handleToggleTask(task.id, task.isCompleted)}
                      className={[
                        'w-full text-left flex items-start gap-3 p-3 rounded-2xl border transition-colors',
                        task.isCompleted
                          ? 'bg-gray-50 dark:bg-dark-elevated border-gray-100 dark:border-dark-border'
                          : 'bg-white dark:bg-dark-surface border-gray-200 dark:border-dark-border hover:border-brand-400',
                      ].join(' ')}
                    >
                      <span className="mt-0.5 text-brand-700 dark:text-brand-400 shrink-0">
                        {task.isCompleted ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-400" />
                        )}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span
                          className={[
                            'text-[13px] font-semibold block leading-snug',
                            task.isCompleted
                              ? 'line-through text-gray-400 dark:text-gray-500'
                              : 'text-gray-900 dark:text-gray-100',
                          ].join(' ')}
                        >
                          {language === 'kn'
                            ? task.titleKn || task.title
                            : language === 'ta'
                            ? task.titleTa || task.title
                            : language === 'te'
                            ? task.titleTe || task.title
                            : task.title}
                        </span>
                        <span className="text-[11px] text-gray-400 dark:text-gray-500 block mt-0.5">
                          {task.dayRange} • {task.stage}
                        </span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-3.5 rounded-2xl bg-brand-50 dark:bg-brand-900/20 text-xs text-brand-700 dark:text-brand-300 font-bold flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>{t('allTasksCompleted') || 'All current tasks completed!'}</span>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <Card variant="flat" className="p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-3xl bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 flex items-center justify-center mx-auto">
                <Sprout className="w-6 h-6" strokeWidth={1.75} />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="text-[16px] font-bold text-gray-900 dark:text-gray-100">
                  {t('planFirstCrop') || 'Plan Your First Crop'}
                </h3>
                <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed">
                  {t('planFirstCropSubtitle') || 'Get personalized advice tailored to your soil, water and climate.'}
                </p>
              </div>

              {latestAssessment ? (
                <div className="space-y-2 max-w-xs mx-auto">
                  <Button
                    fullWidth
                    variant="primary"
                    onClick={() =>
                      navigate('/crops/recommend', {
                        state: { assessment: latestAssessment },
                      })
                    }
                    leftIcon={<Sparkles className="w-4 h-4" />}
                  >
                    Start with Saved Soil Test
                  </Button>
                  <button
                    type="button"
                    onClick={() => navigate('/soil')}
                    className="text-xs text-brand-700 dark:text-brand-400 font-bold hover:underline block mx-auto py-1"
                  >
                    {t('startNewSoilTest') || 'Take a new soil test'} →
                  </button>
                </div>
              ) : (
                <Button
                  variant="primary"
                  onClick={() => navigate('/soil')}
                  leftIcon={<Sprout className="w-4 h-4" />}
                >
                  {t('planFirstCrop') || 'Start Soil Check'}
                </Button>
              )}
            </Card>
          )}
        </motion.section>

        {/* =========================================================================
            ALERTS & REMINDERS ROW
            ========================================================================= */}
        <motion.section variants={itemVariants}>
          <div className="flex items-center justify-between mb-3 px-0.5">
            <div className="flex items-center gap-2">
              <h2 className="text-[16px] font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                {t('cropHealthAlertsTitle') || 'Crop Health Alerts'}
              </h2>
              <Badge variant="danger" dot>
                Live Advisory
              </Badge>
            </div>
            <button
              type="button"
              onClick={() => navigate('/diseases')}
              className="text-xs text-brand-700 dark:text-brand-400 font-bold hover:underline inline-flex items-center gap-1"
            >
              <span>{t('viewFullGuide') || 'All Diseases'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {rankedHealthAlerts.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none chips-scroll">
              {rankedHealthAlerts.map(({ disease: d, riskLevel, primaryReason }) => {
                const diseaseName =
                  language === 'kn'
                    ? d.nameKannada || d.name
                    : language === 'ta'
                    ? d.nameTamil || d.name
                    : language === 'te'
                    ? d.nameTelugu || d.name
                    : d.name;

                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => navigate('/diseases', { state: { selectedProblemId: d.id } })}
                    className="w-[260px] shrink-0 p-4 rounded-4xl bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border shadow-card text-left flex flex-col justify-between min-h-[160px] transition-all active:scale-[0.98] hover:border-brand-400"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <Badge variant={riskLevel === 'high' ? 'danger' : riskLevel === 'medium' ? 'warning' : 'success'}>
                          {riskLevel === 'high' ? 'High Risk' : riskLevel === 'medium' ? 'Moderate' : 'Low Risk'}
                        </Badge>
                        <span className="text-[11px] font-medium text-gray-400 truncate max-w-[120px]">
                          {primaryReason}
                        </span>
                      </div>
                      <h3 className="text-[14px] font-bold text-gray-900 dark:text-gray-100 leading-snug line-clamp-1">
                        {diseaseName}
                      </h3>
                      <p className="text-[12px] text-gray-500 dark:text-gray-400 line-clamp-2 mt-1 leading-relaxed">
                        {d.symptoms}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-gray-100 dark:border-dark-border flex items-center justify-between mt-2 text-[12px] font-bold text-brand-700 dark:text-brand-400">
                      <span>{t('viewSolution') || 'View treatment'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <Card variant="flat" className="p-4 text-center text-xs text-gray-500">
              {t('noAlertsForNow') || 'No critical disease risks for your region right now.'}
            </Card>
          )}
        </motion.section>

        {/* =========================================================================
            TODAY'S TIP CARD
            ========================================================================= */}
        <motion.section variants={itemVariants}>
          <Card variant="tinted" className="p-4 sm:p-5 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Lightbulb className="w-5 h-5" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700 dark:text-brand-400">
                  {todayTip.tag}
                </span>
              </div>
              <h3 className="text-[14px] font-bold text-gray-900 dark:text-gray-100 leading-tight">
                {todayTip.title}
              </h3>
              <p className="text-[13px] text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                {todayTip.desc}
              </p>
            </div>
          </Card>
        </motion.section>
      </motion.div>

      {/* Location Edit Modal */}
      <LocationEditModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onLocationUpdated={(_st, _dist, _lat, _lon) => {
          setWeatherRefreshKey((k) => k + 1);
        }}
      />
    </div>
  );
};

export default HomePage;
