import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from './Button';

interface LoadingStateProps {
  loadingText?: string;
  timeoutMs?: number;
  onRetry?: () => void;
  onBack?: () => void;
  type?: 'card' | 'list' | 'details';
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  loadingText = 'Loading details...',
  timeoutMs = 12000,
  onRetry,
  onBack,
  type = 'card',
}) => {
  const [hasTimedOut, setHasTimedOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasTimedOut(true);
    }, timeoutMs);
    return () => clearTimeout(timer);
  }, [timeoutMs]);

  if (hasTimedOut) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-6 rounded-3xl bg-white border border-amber-200 shadow-card text-center space-y-4 max-w-md mx-auto my-6"
      >
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-extrabold text-dark-text">Taking longer than usual</h3>
          <p className="text-xs text-dark-muted mt-1 leading-relaxed">
            The data request timed out or network connectivity is slow. Please try again or navigate back.
          </p>
        </div>
        <div className="flex gap-2 justify-center pt-2">
          {onBack && (
            <button
              onClick={onBack}
              className="py-2 px-4 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
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
              size="sm"
              className="flex items-center gap-1.5 shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Now</span>
            </Button>
          )}
        </div>
      </motion.div>
    );
  }

  if (type === 'list') {
    return (
      <div className="space-y-3.5 max-w-xl mx-auto py-2">
        <div className="text-center py-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-mint/50 border border-forest/20 text-forest text-xs font-bold animate-pulse">
            <span className="w-2 h-2 rounded-full bg-forest animate-ping" />
            <span>{loadingText}</span>
          </div>
        </div>

        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-5 rounded-3xl bg-white border border-gray-100 shadow-card animate-pulse space-y-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gray-200 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded-md w-2/3" />
                <div className="h-3 bg-gray-100 rounded-md w-1/3" />
              </div>
              <div className="w-12 h-12 rounded-full bg-gray-100" />
            </div>
            <div className="h-2 bg-gray-100 rounded-full w-full" />
            <div className="flex justify-between items-center pt-2 border-t border-gray-50">
              <div className="h-3 bg-gray-100 rounded w-1/4" />
              <div className="h-8 bg-gray-200 rounded-xl w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Type: 'details' or 'card'
  return (
    <div className="p-6 max-w-xl mx-auto space-y-4 py-4 animate-pulse">
      <div className="h-48 sm:h-56 w-full rounded-3xl bg-gray-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
      </div>
      <div className="p-4 bg-white rounded-3xl border border-gray-100 shadow-card space-y-3 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest/10 text-forest text-xs font-bold">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>{loadingText}</span>
        </div>
        <div className="h-6 bg-gray-200 rounded-xl w-1/2 mx-auto" />
        <div className="h-3 bg-gray-100 rounded w-2/3 mx-auto" />
        <div className="grid grid-cols-2 gap-3 pt-3">
          <div className="h-16 bg-gray-100 rounded-2xl" />
          <div className="h-16 bg-gray-100 rounded-2xl" />
        </div>
      </div>
    </div>
  );
};
