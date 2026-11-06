/**
 * Badge — small status or count indicator.
 *
 * Variants: neutral | success | warning | danger | info | brand
 */
import React from 'react';

export type BadgeVariant = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'brand';

const variantClasses: Record<BadgeVariant, string> = {
  neutral: 'bg-gray-100 text-gray-700 dark:bg-dark-elevated dark:text-gray-300',
  success: 'bg-success-light text-success-dark dark:bg-green-900/30 dark:text-green-400',
  warning: 'bg-warning-light text-warning-dark dark:bg-amber-900/30 dark:text-amber-400',
  danger:  'bg-danger-light text-danger-dark dark:bg-red-900/30 dark:text-red-400',
  info:    'bg-info-light text-info-dark dark:bg-blue-900/30 dark:text-blue-400',
  brand:   'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400',
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  children,
  dot = false,
  className = '',
}) => (
  <span
    className={[
      'inline-flex items-center gap-1.5 px-2 py-0.5',
      'rounded-full text-[11px] font-semibold leading-none',
      variantClasses[variant],
      className,
    ]
      .filter(Boolean)
      .join(' ')}
  >
    {dot && (
      <span
        className={[
          'w-1.5 h-1.5 rounded-full shrink-0',
          variant === 'neutral' ? 'bg-gray-500' : '',
          variant === 'success' ? 'bg-success' : '',
          variant === 'warning' ? 'bg-warning' : '',
          variant === 'danger'  ? 'bg-danger'  : '',
          variant === 'info'    ? 'bg-info'    : '',
          variant === 'brand'   ? 'bg-brand'   : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-hidden="true"
      />
    )}
    {children}
  </span>
);

export default Badge;
