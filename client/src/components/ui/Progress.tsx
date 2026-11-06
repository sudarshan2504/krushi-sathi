/**
 * ProgressBar & ProgressRing
 *
 * ProgressBar — horizontal track with animated fill.
 * ProgressRing — SVG circle ring, used for crop match %.
 *
 * Both animate only transform/opacity/stroke (GPU layers).
 * Both support reduced motion.
 */
import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/* ── ProgressBar ─────────────────────────────────────────── */
interface ProgressBarProps {
  /** 0–100 */
  value: number;
  /** Visual variant */
  color?: 'brand' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md';
  label?: string;
  showValue?: boolean;
  className?: string;
}

const barColor: Record<string, string> = {
  brand:   'bg-brand-600',
  success: 'bg-success',
  warning: 'bg-warning',
  danger:  'bg-danger',
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  color = 'brand',
  size = 'md',
  label,
  showValue = false,
  className = '',
}) => {
  const clamped = Math.max(0, Math.min(100, value));
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-[13px] font-medium text-gray-700 dark:text-gray-300">{label}</span>}
          {showValue && <span className="text-[13px] font-bold tabular text-gray-900 dark:text-gray-100">{clamped}%</span>}
        </div>
      )}
      <div
        className={[
          'w-full overflow-hidden rounded-full bg-gray-100 dark:bg-dark-elevated',
          size === 'sm' ? 'h-1.5' : 'h-2',
        ].join(' ')}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? `Progress: ${clamped}%`}
      >
        <motion.div
          className={['h-full rounded-full', barColor[color]].join(' ')}
          initial={shouldReduceMotion ? false : { width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};

/* ── ProgressRing ────────────────────────────────────────── */
interface ProgressRingProps {
  /** 0–100 */
  value: number;
  /** Diameter in px */
  size?: number;
  strokeWidth?: number;
  /** Show the percentage number in the center */
  showValue?: boolean;
  color?: 'brand' | 'success' | 'warning' | 'danger' | 'accent';
  className?: string;
  children?: React.ReactNode;
}

const ringColor: Record<string, string> = {
  brand:   '#166534',
  success: '#16A34A',
  warning: '#D97706',
  danger:  '#DC2626',
  accent:  '#65A30D',
};

export const ProgressRing: React.FC<ProgressRingProps> = ({
  value,
  size = 64,
  strokeWidth = 6,
  showValue = true,
  color = 'brand',
  className = '',
  children,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const clamped = Math.max(0, Math.min(100, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div
      className={['relative inline-flex items-center justify-center', className].join(' ')}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${clamped}%`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden="true"
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#F3F4F6"
          strokeWidth={strokeWidth}
          className="dark:stroke-dark-elevated"
        />
        {/* Progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={ringColor[color]}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={shouldReduceMotion ? false : { strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.7, ease: 'easeOut' }}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showValue && !children && (
          <span className="text-[13px] font-bold tabular" style={{ color: ringColor[color] }}>
            {clamped}%
          </span>
        )}
        {children}
      </div>
    </div>
  );
};

export default ProgressBar;

