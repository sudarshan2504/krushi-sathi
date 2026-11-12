import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Circle, Wrench, Lightbulb, ArrowRight, ChevronLeft, ChevronRight, Sprout } from 'lucide-react';
import { api } from '../services/api';
import { CropPlan, CropStageGroup } from '../types';
import { useTranslation } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { LoadingState } from '../components/ui/LoadingState';
import { CropImage } from '../components/ui/CropImage';

export const StageDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { planId, stageName } = useParams();
  const { t, language } = useTranslation();
  const { showToast } = useToast();

  const [plan, setPlan] = useState<CropPlan | null>(null);
  const [currentStage, setCurrentStage] = useState<CropStageGroup | null>(null);
  const [currentStageIdx, setCurrentStageIdx] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!planId) return;
      try {
        const planDetails = await api.lifecycle.getPlan(planId);
        setPlan(planDetails);

        if (planDetails.stages && planDetails.stages.length > 0) {
          const decodedStage = decodeURIComponent(stageName || '');
          const idx = planDetails.stages.findIndex((s: any) => s.stage === decodedStage);
          const foundIdx = idx >= 0 ? idx : 0;
          setCurrentStageIdx(foundIdx);
          setCurrentStage(planDetails.stages[foundIdx]);
        }
      } catch (err) {
        console.error('Error loading stage details:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [planId, stageName]);

  const handleToggleTask = async (taskId: string, currentStatus: boolean) => {
    try {
      const nextStatus = !currentStatus;
      const res = await api.lifecycle.toggleTask(taskId, nextStatus);
      if (res && res.plan) {
        setPlan(res.plan);
        if (res.plan.stages && res.plan.stages[currentStageIdx]) {
          setCurrentStage(res.plan.stages[currentStageIdx]);
        }
      }
      if (nextStatus) {
        showToast(t('toastSuccess'), 'success');
      }
    } catch (err) {
      console.error('Toggle task error:', err);
    }
  };

  const goToStage = (newIdx: number) => {
    if (plan && plan.stages && newIdx >= 0 && newIdx < plan.stages.length) {
      setCurrentStageIdx(newIdx);
      setCurrentStage(plan.stages[newIdx]);
      navigate(`/crops/stage/${plan.id}/${encodeURIComponent(plan.stages[newIdx].stage)}`, { replace: true });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto py-8">
        <LoadingState
          loadingText="Loading crop growth stage details..."
          type="details"
          timeoutMs={10000}
          onRetry={() => {
            setIsLoading(true);
            if (planId) {
              api.lifecycle.getPlan(planId).then(setPlan).finally(() => setIsLoading(false));
            }
          }}
          onBack={() => navigate(`/crops/lifecycle/${planId || ''}`)}
        />
      </div>
    );
  }

  if (!currentStage) {
    return (
      <div className="max-w-md mx-auto my-8 p-6 bg-white rounded-3xl border border-gray-100 shadow-card text-center space-y-3">
        <h3 className="text-sm font-extrabold text-gray-900 dark:text-gray-100">Growth Stage Not Found</h3>
        <p className="text-xs text-gray-600 dark:text-gray-400">The requested growth stage is not available in this crop plan.</p>
        <button
          onClick={() => navigate(`/crops/lifecycle/${planId || ''}`)}
          className="min-h-[44px] py-2 px-4 rounded-xl bg-forest text-white text-xs font-bold shadow-sm"
        >
          Back to Timeline
        </button>
      </div>
    );
  }

  const hasPrev = currentStageIdx > 0;
  const hasNext = plan && plan.stages && currentStageIdx < plan.stages.length - 1;
  const cropImageSrc = plan?.crop?.imageUrl;

  return (
    <div className="max-w-xl mx-auto space-y-4 py-2">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <button
          onClick={() => navigate(`/crops/lifecycle/${planId}`)}
          className="min-w-[44px] min-h-[44px] shrink-0 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-900 dark:text-gray-100 hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-forest transition"
          aria-label="Back to crop plan"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center min-w-0 flex-1 px-1">
          <span className="text-xs font-bold text-forest uppercase tracking-wider block">
            {currentStage.dayRange}
          </span>
          <h1 className="text-base font-extrabold text-gray-900 dark:text-gray-100 leading-tight truncate">
            {currentStage.stage}
          </h1>
        </div>

        <div className="w-11 shrink-0" />
      </div>

      {/* Stage Visual Card */}
      <div className="rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-card">
        {/* Stage Hero Image */}
        <div className="h-44 sm:h-52 w-full relative bg-mint/40 overflow-hidden">
          <CropImage
            cropId={plan?.cropId}
            src={cropImageSrc}
            alt={currentStage.stage}
            cropName={plan?.cropName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D2B18]/80 via-[#0D2B18]/20 to-transparent pointer-events-none" />
          <div className="absolute bottom-3.5 left-4 right-4 text-white">
            <span className="py-0.5 px-3 rounded-full bg-forest text-white text-[11px] font-bold">
              Stage {currentStage.stageOrder} of {plan?.stages?.length || 7}
            </span>
            <h2 className="text-lg font-black mt-1 leading-snug break-words">
              {currentStage.stage}
            </h2>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* 1. Tasks to do */}
          <div>
            <h3 className="text-xs font-extrabold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2.5">
              {t('tasksToDo')}
            </h3>

            <div className="space-y-2">
              {currentStage.tasks.map((task) => (
                <button
                  type="button"
                  key={task.id}
                  aria-pressed={task.isCompleted}
                  onClick={() => handleToggleTask(task.id, task.isCompleted)}
                  className={`w-full text-left flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer select-none transition-colors min-h-[48px] ${
                    task.isCompleted
                      ? 'bg-gray-50 border-gray-100 text-gray-600 dark:text-gray-400 line-through'
                      : 'bg-cream-light/60 border-forest/15 hover:border-forest/40 text-gray-900 dark:text-gray-100'
                  }`}
                >
                  <span className="mt-0.5 text-forest flex-shrink-0" aria-hidden="true">
                    {task.isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-forest" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-500" />
                    )}
                  </span>
                  <div className="flex-1">
                    <span className="text-xs font-bold block leading-snug">
                      {language === 'kn' ? (task.titleKn || task.title) :
                       language === 'ta' ? (task.titleTa || task.title) :
                       language === 'te' ? (task.titleTe || task.title) : task.title}
                    </span>
                    <span className="text-[11px] text-gray-600 dark:text-gray-400 mt-0.5 block leading-normal">
                      {task.description}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Materials & Tools Needed */}
          <div>
            <h3 className="text-xs font-extrabold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
              {t('materialsTools')}
            </h3>

            <div className="flex flex-wrap gap-2">
              {currentStage.materialsNeeded && currentStage.materialsNeeded.length > 0 ? (
                currentStage.materialsNeeded.map((mat, mIdx) => (
                  <span
                    key={mIdx}
                    className="py-1.5 px-3 rounded-full bg-mint text-forest text-xs font-semibold border border-forest/20 flex items-center gap-1.5"
                  >
                    <Wrench className="w-3.5 h-3.5 text-forest" />
                    <span>{mat}</span>
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-600 dark:text-gray-400">Standard agricultural implements</span>
              )}
            </div>
          </div>

          {/* 3. Important Tip Box (Warm Yellow/Cream) */}
          {currentStage.importantTip && (
            <div className="p-4 rounded-2xl bg-cream border border-harvest/30">
              <div className="flex items-center gap-2 text-earth font-bold text-xs mb-1">
                <Lightbulb className="w-4 h-4 text-harvest-dark" />
                <span>{t('importantTip')}</span>
              </div>
              <p className="text-xs text-gray-800 dark:text-gray-100 font-medium leading-relaxed">
                {language === 'kn' ? (currentStage.importantTipKn || currentStage.importantTip) :
                 language === 'ta' ? (currentStage.importantTipTa || currentStage.importantTip) :
                 language === 'te' ? (currentStage.importantTipTe || currentStage.importantTip) :
                 currentStage.importantTip}
              </p>
            </div>
          )}
        </div>

        {/* Stage Prev / Next Navigation Buttons */}
        <div className="flex items-center justify-between p-4 bg-gray-50 border-t border-gray-100">
          <button
            onClick={() => goToStage(currentStageIdx - 1)}
            disabled={!hasPrev}
            className={`min-h-[48px] py-2.5 px-4 rounded-2xl text-xs font-bold flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-forest transition-colors ${
              hasPrev ? 'bg-white border border-gray-200 text-gray-900 dark:text-gray-100 hover:bg-gray-100' : 'opacity-40 cursor-not-allowed text-gray-400'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            onClick={() => goToStage(currentStageIdx + 1)}
            disabled={!hasNext}
            className={`min-h-[48px] py-2.5 px-5 rounded-2xl text-xs font-bold flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-forest transition-colors ${
              hasNext ? 'bg-forest text-white hover:bg-forest-dark shadow-sm' : 'opacity-40 cursor-not-allowed bg-gray-200 text-gray-400'
            }`}
          >
            <span>Next Stage</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
