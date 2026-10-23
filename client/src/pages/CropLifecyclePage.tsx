import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Circle, ArrowRight, Sprout, Calendar, Check } from 'lucide-react';
import { api } from '../services/api';
import { CropPlan } from '../types';
import { useTranslation } from '../context/LanguageContext';
import { LoadingState } from '../components/ui/LoadingState';

export const CropLifecyclePage: React.FC = () => {
  const navigate = useNavigate();
  const { planId, cropId } = useParams<{ planId?: string; cropId?: string }>();
  const { t, language } = useTranslation();

  const [plan, setPlan] = useState<CropPlan | null>(null);
  const [allPlans, setAllPlans] = useState<CropPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const plans = await api.lifecycle.getPlans();
      setAllPlans(plans);

      const targetId = planId || cropId || plans[0]?.id;
      if (targetId) {
        const planDetails = await api.lifecycle.getPlan(targetId);
        setPlan(planDetails);
      }
    } catch (err: any) {
      console.error('Error loading crop plan:', err);
      setError(err.message || 'Failed to load crop plan');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [planId, cropId]);

  const handleToggleTask = async (taskId: string, currentStatus: boolean) => {
    if (!plan) return;
    try {
      const res = await api.lifecycle.toggleTask(taskId, !currentStatus);
      if (res && res.plan) {
        setPlan(res.plan);
      }
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto py-8">
        <LoadingState
          loadingText="Loading crop lifecycle calendar..."
          type="list"
          timeoutMs={10000}
          onRetry={loadData}
          onBack={() => navigate('/crops')}
        />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="max-w-md mx-auto text-center p-8 bg-white rounded-3xl border border-gray-100 shadow-card">
        <Sprout className="w-12 h-12 text-forest/40 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-dark-text mb-1">No Active Crop Plan Found</h2>
        <p className="text-xs text-dark-muted mb-4">
          Complete a soil assessment or select a crop from our recommendations catalog to start your step-by-step farming plan.
        </p>
        <button
          onClick={() => navigate('/soil')}
          className="py-3 px-6 rounded-2xl bg-forest text-white text-xs font-bold shadow-md hover:bg-forest-dark"
        >
          Check My Soil & Recommend Crop
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-4 py-2">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-1">
        <button
          onClick={() => navigate('/home')}
          className="p-2 rounded-full bg-white border border-gray-200 text-dark-text hover:bg-gray-50"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="text-center">
          <h1 className="text-base font-extrabold text-dark-text leading-tight">
            {plan.cropName} — Timeline
          </h1>
          <span className="text-xs text-dark-muted font-medium">
            {t('stepByStepGuide')}
          </span>
        </div>

        <div className="w-8" />
      </div>

      {/* Crop Progress Banner */}
      <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-card flex items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-dark-muted block">Overall Completion</span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-2xl font-black text-forest">{plan.progressPercentage}%</span>
            <span className="text-xs text-dark-muted">
              ({plan.completedTasks} of {plan.totalTasks} tasks done)
            </span>
          </div>
        </div>

        <div className="w-14 h-14 rounded-full bg-mint flex items-center justify-center text-forest font-bold border-2 border-forest/20 shadow-sm">
          {plan.progressPercentage === 100 ? (
            <Check className="w-7 h-7 stroke-[3]" />
          ) : (
            <Sprout className="w-7 h-7" />
          )}
        </div>
      </div>

      {/* Vertical Timeline Tree (Matches Screen 7/8) */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-4 before:bottom-4 before:w-0.5 before:bg-forest/25">
        {plan.stages?.map((stageGroup, sIdx) => {
          const isAllCompleted = stageGroup.tasks.every(t => t.isCompleted);
          const hasSomeCompleted = stageGroup.tasks.some(t => t.isCompleted);

          return (
            <motion.div
              key={stageGroup.stage}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: sIdx * 0.08 }}
              className="relative"
            >
              {/* Timeline Node Dot */}
              <div
                className={`absolute -left-6 top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shadow-sm ${
                  isAllCompleted
                    ? 'bg-forest border-forest text-white'
                    : hasSomeCompleted
                    ? 'bg-mint border-forest text-forest'
                    : 'bg-white border-gray-300 text-transparent'
                }`}
              >
                {isAllCompleted ? (
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-current" />
                )}
              </div>

              {/* Stage Card */}
              <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-card hover:border-forest/30 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="py-0.5 px-3 rounded-full bg-cream text-earth text-xs font-bold border border-harvest/30">
                    {stageGroup.dayRange}
                  </span>

                  <button
                    onClick={() => navigate(`/crops/stage/${plan.id}/${encodeURIComponent(stageGroup.stage)}`)}
                    className="text-xs font-bold text-forest hover:underline flex items-center gap-1"
                  >
                    <span>Detailed Guide</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="text-base font-extrabold text-dark-text mb-3">
                  {stageGroup.stage}
                </h3>

                {/* Tasks Checklist */}
                <div className="space-y-2">
                  {stageGroup.tasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => handleToggleTask(task.id, task.isCompleted)}
                      className={`flex items-start gap-2.5 p-3 rounded-2xl border cursor-pointer select-none transition-colors ${
                        task.isCompleted
                          ? 'bg-gray-50 border-gray-100 text-dark-muted line-through'
                          : 'bg-cream-light/40 border-gray-100 hover:border-forest/30 text-dark-text'
                      }`}
                    >
                      <button className="mt-0.5 text-forest flex-shrink-0">
                        {task.isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-forest" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                      <div className="flex-1">
                        <span className="text-xs font-bold block leading-tight">
                          {language === 'kn' ? (task.titleKn || task.title) :
                           language === 'ta' ? (task.titleTa || task.title) :
                           language === 'te' ? (task.titleTe || task.title) : task.title}
                        </span>
                        <span className="text-[11px] text-dark-muted leading-tight mt-0.5 block">
                          {task.description}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Important Tip Callout */}
                {stageGroup.importantTip && (
                  <div className="mt-3 p-3 rounded-2xl bg-cream border border-harvest/30 flex items-start gap-2">
                    <span className="text-base">💡</span>
                    <span className="text-xs text-dark-text/90 font-medium leading-relaxed">
                      {language === 'kn' ? (stageGroup.importantTipKn || stageGroup.importantTip) : stageGroup.importantTip}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
