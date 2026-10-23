import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layers, Sparkles, Bot, Sprout, ArrowRight, CheckCircle2, Circle, AlertTriangle, ShieldAlert } from 'lucide-react';
import { WeatherWidget } from '../components/weather/WeatherWidget';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import { api } from '../services/api';
import { CropPlan, Disease } from '../types';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, language } = useTranslation();

  const [activePlan, setActivePlan] = useState<CropPlan | null>(null);
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [plansRes, diseasesRes] = await Promise.all([
          api.lifecycle.getPlans().catch(() => []),
          api.diseases.getAll().catch(() => []),
        ]);

        if (plansRes && plansRes.length > 0) {
          // Load full details for the first active plan
          const fullPlan = await api.lifecycle.getPlan(plansRes[0].id).catch(() => null);
          setActivePlan(fullPlan || plansRes[0]);
        }
        setDiseases(diseasesRes ? diseasesRes.slice(0, 3) : []);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const handleToggleTask = async (taskId: string, currentStatus: boolean) => {
    try {
      const res = await api.lifecycle.toggleTask(taskId, !currentStatus);
      if (res && res.plan) {
        setActivePlan(res.plan);
      }
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  const quickActions = [
    {
      title: t('checkMySoil'),
      icon: Layers,
      bg: 'bg-emerald-50 text-forest border-emerald-200/80',
      action: () => navigate('/soil'),
    },
    {
      title: t('recommendCrop'),
      icon: Sparkles,
      bg: 'bg-amber-50 text-earth-dark border-amber-200/80',
      action: () => navigate('/crops/recommend'),
    },
    {
      title: t('askAiAssistant'),
      icon: Bot,
      bg: 'bg-blue-50 text-blue-700 border-blue-200/80',
      action: () => navigate('/chat'),
    },
    {
      title: t('myCrops'),
      icon: Sprout,
      bg: 'bg-mint text-forest border-forest/20',
      action: () => navigate('/crops'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Farmer Greeting Banner with Verified Phone */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-forest/15 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-gradient-to-r from-white via-cream to-mint-light">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-dark-text tracking-tight">
            Namaste, {user?.name || 'Farmer'} 🙏
          </h1>
          <p className="text-xs text-dark-muted font-medium flex items-center gap-1.5 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span>
              Signed in with:{' '}
              <strong className="text-forest font-bold">
                {user?.phone ? (user.phone.startsWith('+') ? user.phone : `+91 ${user.phone}`) : 'Verified Mobile'}
              </strong>
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-forest">
          <span className="px-3 py-1 rounded-full bg-forest/10 border border-forest/20 flex items-center gap-1">
            <span className="text-[10px]">🔒</span>
            <span>Firebase Auth Active</span>
          </span>
        </div>
      </div>

      {/* 1. Weather Widget (Matches Reference Image) */}
      <section>
        <WeatherWidget initialDistrict={user?.district || 'Mandya'} />
      </section>

      {/* 2. Four Prominent Quick Action Cards (Matches Reference Image) */}
      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-base font-extrabold text-dark-text tracking-tight">
            Quick Actions
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={idx}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.97 }}
                onClick={action.action}
                className={`p-4 rounded-3xl border text-center flex flex-col items-center justify-center gap-2.5 shadow-sm hover:shadow-card transition-all ${action.bg}`}
              >
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                  <Icon className="w-6 h-6 stroke-[2.2]" />
                </div>
                <span className="text-xs font-bold leading-tight line-clamp-2">
                  {action.title}
                </span>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* 3. Active Crop Progress & Timeline */}
      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-base font-extrabold text-dark-text">
            {t('activeCrops')}
          </h2>
          {activePlan && (
            <button
              onClick={() => navigate(`/crops/lifecycle/${activePlan.id}`)}
              className="text-xs text-forest font-bold hover:underline flex items-center gap-1"
            >
              <span>{t('viewFullGuide')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {activePlan ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl bg-white border border-gray-100 shadow-card p-5"
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl overflow-hidden bg-mint flex-shrink-0">
                  <img
                    src={activePlan.crop?.imageUrl || 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?w=200&auto=format&fit=crop&q=80'}
                    alt={activePlan.cropName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-extrabold text-dark-text text-base">
                    {activePlan.cropName}
                  </h3>
                  <span className="text-xs text-dark-muted font-medium">
                    {activePlan.fieldName || 'Main Field'} • {activePlan.areaAcre || 1.5} {t('acres')}
                  </span>
                </div>
              </div>

              <span className="py-1 px-3 rounded-full bg-mint text-forest text-xs font-bold border border-forest/20">
                {activePlan.progressPercentage}% {t('progress')}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2.5 rounded-full bg-gray-100 overflow-hidden mb-4">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${activePlan.progressPercentage}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-forest to-leaf rounded-full"
              />
            </div>

            {/* Next stage & tasks preview */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-dark-muted uppercase tracking-wider block">
                {t('upcomingTasks')}:
              </span>

              {activePlan.tasks?.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleToggleTask(task.id, task.isCompleted)}
                  className={`flex items-start gap-2.5 p-3 rounded-2xl border cursor-pointer transition-colors ${
                    task.isCompleted
                      ? 'bg-gray-50/80 border-gray-100 text-dark-muted line-through'
                      : 'bg-cream-light/60 border-forest/15 hover:border-forest/40 text-dark-text'
                  }`}
                >
                  <button className="mt-0.5 text-forest flex-shrink-0">
                    {task.isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-forest" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold block leading-tight">
                      {language === 'kn' ? (task.titleKn || task.title) :
                       language === 'ta' ? (task.titleTa || task.title) :
                       language === 'te' ? (task.titleTe || task.title) : task.title}
                    </span>
                    <span className="text-[10px] text-dark-muted block">
                      {task.dayRange} • {task.stage}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-card text-center">
            <Sprout className="w-10 h-10 text-forest/40 mx-auto mb-2" />
            <p className="text-xs text-dark-muted mb-4 max-w-xs mx-auto">
              {t('noActiveCrops')}
            </p>
            <button
              onClick={() => navigate('/soil')}
              className="py-2.5 px-5 rounded-2xl bg-forest text-white text-xs font-bold shadow-md hover:bg-forest-dark transition-colors"
            >
              🌾 {t('checkMySoil')}
            </button>
          </div>
        )}
      </section>

      {/* 4. Pest & Disease Alerts Carousel */}
      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-base font-extrabold text-dark-text">
            {t('diseaseTips')}
          </h2>
          <button
            onClick={() => navigate('/diseases')}
            className="text-xs text-forest font-bold hover:underline"
          >
            {t('viewFullGuide')}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {diseases.map((d) => (
            <motion.div
              key={d.id}
              whileHover={{ y: -2 }}
              onClick={() => navigate(`/diseases/${d.id}`)}
              className="p-4 rounded-3xl bg-white border border-gray-100 shadow-card cursor-pointer hover:border-forest/30 transition-all flex flex-col justify-between"
            >
              <div className="flex items-start gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-dark-text leading-tight">
                    {language === 'kn' ? d.nameKannada :
                     language === 'ta' ? d.nameTamil :
                     language === 'te' ? d.nameTelugu : d.name}
                  </h4>
                  <span className="text-[10px] text-dark-muted">
                    {d.affectedCrops.join(', ')}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-dark-text/80 line-clamp-2 leading-relaxed mb-2">
                {language === 'kn' ? (d.symptomsKn || d.symptoms) : d.symptoms}
              </p>

              <span className="text-[11px] text-forest font-bold flex items-center gap-1">
                <span>View Solution</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};
