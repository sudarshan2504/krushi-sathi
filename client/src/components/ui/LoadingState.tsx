import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';
import { useTranslation } from '../../context/LanguageContext';

export interface LoadingStateProps {
  loadingText?: string;
  timeoutMs?: number;
  onRetry?: () => void;
  onBack?: () => void;
  type?: 'dashboard' | 'weather' | 'list' | 'details' | 'card';
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  loadingText,
  timeoutMs = 12000,
  onRetry,
  onBack,
  type = 'card',
}) => {
  const { t } = useTranslation();
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const resolvedText = loadingText || t('loadingData');

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasTimedOut(true);
    }, timeoutMs);
    return () => clearTimeout(timer);
  }, [timeoutMs]);

  if (hasTimedOut) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        role="alert"
        aria-live="assertive"
        className="p-6 rounded-3xl bg-white border border-amber-200 shadow-card text-center space-y-4 max-w-md mx-auto my-6"
      >
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-extrabold text-dark-text">Taking longer than usual</h3>
          <p className="text-sm text-dark-muted mt-1 leading-relaxed">
            The data request timed out or network connectivity is slow. Please try again or navigate back.
          </p>
        </div>
        <div className="flex gap-2 justify-center pt-2">
          {onBack && (
            <button
              onClick={onBack}
              className="min-h-[48px] py-2 px-4 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 transition"
            >
              Go Back
            </button>
          )}
          {onRetry && (
            <Button
              onClick={() => {
                setHasTimedOut(false);
                onRetry();
              }}
              size="md"
              className="flex items-center gap-1.5 shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{t('retryAction')}</span>
            </Button>
          )}
        </div>
      </motion.div>
    );
  }

  // SKELETON 1: Weather Widget Layout
  if (type === 'weather') {
    return (
      <div className="w-full space-y-3" role="status" aria-busy="true" aria-label={resolvedText}>
        <div className="flex justify-between items-center px-1">
          <div className="h-4 w-36 rounded-md skeleton-shimmer" />
          <div className="h-4 w-20 rounded-md skeleton-shimmer" />
        </div>
        <div className="rounded-3xl bg-white border border-forest/10 p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl skeleton-shimmer shrink-0" />
              <div className="space-y-2">
                <div className="h-7 w-20 rounded-lg skeleton-shimmer" />
                <div className="h-3 w-28 rounded-md skeleton-shimmer" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 w-16 rounded skeleton-shimmer ml-auto" />
              <div className="h-3 w-20 rounded skeleton-shimmer ml-auto" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-cream-light/60">
            <div className="h-8 rounded-xl skeleton-shimmer" />
            <div className="h-8 rounded-xl skeleton-shimmer" />
            <div className="h-8 rounded-xl skeleton-shimmer" />
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="flex-1 h-14 rounded-xl skeleton-shimmer" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // SKELETON 2: Full Dashboard Layout
  if (type === 'dashboard') {
    return (
      <div className="space-y-6 w-full max-w-5xl mx-auto" role="status" aria-busy="true" aria-label={resolvedText}>
        {/* Greeting Banner Skeleton */}
        <div className="rounded-3xl bg-white p-5 border border-forest/15 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-6 w-48 rounded-xl skeleton-shimmer" />
            <div className="h-3.5 w-32 rounded-md skeleton-shimmer" />
          </div>
          <div className="h-8 w-24 rounded-full skeleton-shimmer" />
        </div>

        {/* Weather Skeleton */}
        <div className="rounded-3xl bg-white border border-forest/10 p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl skeleton-shimmer" />
              <div className="space-y-2">
                <div className="h-6 w-24 rounded-lg skeleton-shimmer" />
                <div className="h-3 w-32 rounded-md skeleton-shimmer" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3.5 w-16 rounded skeleton-shimmer ml-auto" />
              <div className="h-3.5 w-20 rounded skeleton-shimmer ml-auto" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="h-10 rounded-xl skeleton-shimmer" />
            <div className="h-10 rounded-xl skeleton-shimmer" />
            <div className="h-10 rounded-xl skeleton-shimmer" />
          </div>
        </div>

        {/* Quick Actions 4 Grid Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 rounded-3xl bg-white border border-gray-100 shadow-sm flex flex-col items-center gap-2.5">
              <div className="w-12 h-12 rounded-2xl skeleton-shimmer" />
              <div className="h-3.5 w-20 rounded-md skeleton-shimmer" />
            </div>
          ))}
        </div>

        {/* Active Crop Card Skeleton */}
        <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl skeleton-shimmer" />
              <div className="space-y-2">
                <div className="h-4 w-32 rounded-md skeleton-shimmer" />
                <div className="h-3 w-24 rounded-md skeleton-shimmer" />
              </div>
            </div>
            <div className="h-6 w-16 rounded-full skeleton-shimmer" />
          </div>
          <div className="h-2.5 rounded-full skeleton-shimmer w-full" />
        </div>
      </div>
    );
  }

  // SKELETON 3: Crop List / Recommendation Cards
  if (type === 'list') {
    return (
      <div className="space-y-4 max-w-xl mx-auto py-2" role="status" aria-busy="true" aria-label={resolvedText}>
        <div className="flex justify-center py-1">
          <div className="h-6 w-40 rounded-full skeleton-shimmer" />
        </div>

        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-5 rounded-3xl bg-white border border-gray-100 shadow-card space-y-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl skeleton-shimmer shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 skeleton-shimmer rounded-md w-2/3" />
                <div className="h-3 skeleton-shimmer rounded-md w-1/3" />
              </div>
              <div className="w-12 h-12 rounded-full skeleton-shimmer" />
            </div>
            <div className="h-2 skeleton-shimmer rounded-full w-full" />
            <div className="flex justify-between items-center pt-2 border-t border-gray-50">
              <div className="h-3.5 skeleton-shimmer rounded w-1/4" />
              <div className="h-9 skeleton-shimmer rounded-xl w-28" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // SKELETON 4: Details Page Skeleton
  if (type === 'details') {
    return (
      <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-4" role="status" aria-busy="true" aria-label={resolvedText}>
        <div className="h-48 sm:h-56 w-full rounded-3xl skeleton-shimmer" />
        <div className="p-5 bg-white rounded-3xl border border-gray-100 shadow-card space-y-4">
          <div className="h-6 skeleton-shimmer rounded-xl w-1/2 mx-auto" />
          <div className="h-3 skeleton-shimmer rounded w-2/3 mx-auto" />
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="h-16 skeleton-shimmer rounded-2xl" />
            <div className="h-16 skeleton-shimmer rounded-2xl" />
          </div>
          <div className="h-12 skeleton-shimmer rounded-2xl w-full" />
        </div>
      </div>
    );
  }

  // SKELETON 5: Generic Card Skeleton
  return (
    <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-card space-y-3 max-w-md mx-auto" role="status" aria-busy="true" aria-label={resolvedText}>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl skeleton-shimmer shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 rounded-md skeleton-shimmer w-3/4" />
          <div className="h-3 rounded-md skeleton-shimmer w-1/2" />
        </div>
      </div>
      <div className="h-3 rounded-md skeleton-shimmer w-full" />
      <div className="h-3 rounded-md skeleton-shimmer w-5/6" />
      <div className="h-10 rounded-2xl skeleton-shimmer w-full mt-2" />
    </div>
  );
};

export default LoadingState;
