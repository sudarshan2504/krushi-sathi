/**
 * LoadingState — full-page or inline loading indicator.
 * Uses modern skeleton / typing shimmer instead of generic spinners.
 */
import React from 'react';
import { Skeleton } from './Skeleton';
import { RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from './Button';

export interface LoadingStateProps {
  message?: string;
  loadingText?: string;
  type?: string;
  timeoutMs?: number;
  onRetry?: () => void;
  onBack?: () => void;
  /** If true, shows a compact inline skeleton row instead of full-page */
  inline?: boolean;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message,
  loadingText,
  type,
  timeoutMs,
  onRetry,
  onBack,
  inline = false,
  className = '',
}) => {
  const displayText = message || loadingText;

  if (inline) {
    return (
      <div className={['flex items-center gap-3 py-3', className].join(' ')}>
        <Skeleton variant="circle" className="w-8 h-8 shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={['flex flex-col items-center justify-center py-16 px-6 gap-4 min-h-[220px]', className].join(' ')}
      role="status"
      aria-live="polite"
    >
      <div className="flex gap-1.5" aria-hidden="true">
        <span className="w-2.5 h-2.5 rounded-full bg-brand-600 typing-dot" />
        <span className="w-2.5 h-2.5 rounded-full bg-brand-600 typing-dot" />
        <span className="w-2.5 h-2.5 rounded-full bg-brand-600 typing-dot" />
      </div>

      {displayText && (
        <p className="text-[14px] font-medium text-gray-600 dark:text-gray-300 text-center max-w-[280px] leading-relaxed">
          {displayText}
        </p>
      )}

      {(onRetry || onBack) && (
        <div className="flex items-center gap-2 mt-2">
          {onBack && (
            <Button variant="secondary" size="sm" onClick={onBack} leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
              Back
            </Button>
          )}
          {onRetry && (
            <Button variant="primary" size="sm" onClick={onRetry} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
              Retry
            </Button>
          )}
        </div>
      )}

      <span className="sr-only">{displayText ?? 'Loading…'}</span>
    </div>
  );
};

export default LoadingState;
