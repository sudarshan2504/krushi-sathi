/**
 * Skeleton — shimmer loading placeholder.
 *
 * Usage:
 *  <Skeleton className="h-6 w-32" />          — text line
 *  <Skeleton variant="circle" className="w-12 h-12" />
 *  <Skeleton variant="card" className="h-32" />
 */
import React from 'react';

type SkeletonVariant = 'default' | 'circle' | 'card' | 'text';

interface SkeletonProps {
  variant?: SkeletonVariant;
  className?: string;
  lines?: number;   // For variant="text", how many lines
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'default',
  className = '',
  lines = 1,
}) => {
  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={[
              'skeleton-shimmer',
              'h-4 rounded-lg',
              i === lines - 1 ? 'w-3/4' : 'w-full',
            ].join(' ')}
          />
        ))}
      </div>
    );
  }

  const shapeClass =
    variant === 'circle' ? 'rounded-full' :
    variant === 'card'   ? 'rounded-4xl' :
    'rounded-lg';

  return (
    <div
      className={[
        'skeleton-shimmer',
        shapeClass,
        className,
      ].join(' ')}
      aria-hidden="true"
    />
  );
};

/** Pre-built card skeleton */
export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={['p-4 rounded-4xl bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border space-y-3', className].join(' ')}>
    <div className="flex items-center gap-3">
      <Skeleton variant="circle" className="w-10 h-10 shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
    <Skeleton className="h-16 w-full" variant="card" />
    <div className="flex gap-2">
      <Skeleton className="h-7 flex-1 rounded-full" />
      <Skeleton className="h-7 flex-1 rounded-full" />
    </div>
  </div>
);

/** Pre-built list item skeleton */
export const ListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="space-y-2">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-3xl bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border">
        <Skeleton variant="circle" className="w-9 h-9 shrink-0" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </div>
    ))}
  </div>
);

export default Skeleton;

