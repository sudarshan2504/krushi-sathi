/**
 * IconButton — square/circular button with a single Lucide icon.
 *
 * Variants: default | ghost | filled | danger
 * Sizes:    sm (32px) | md (40px) | lg (48px)
 *
 * Always requires an aria-label for accessibility.
 */
import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export type IconButtonVariant = 'default' | 'ghost' | 'filled' | 'danger';
export type IconButtonSize = 'sm' | 'md' | 'lg';

const variantClasses: Record<IconButtonVariant, string> = {
  default:
    'bg-white border border-gray-200 text-gray-700 shadow-xs ' +
    'hover:border-gray-300 hover:bg-gray-50 active:bg-gray-100 ' +
    'dark:bg-dark-surface dark:border-dark-border dark:text-gray-300 dark:hover:bg-dark-elevated ' +
    'focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
  ghost:
    'bg-transparent text-gray-600 ' +
    'hover:bg-gray-100 active:bg-gray-200 ' +
    'dark:text-gray-400 dark:hover:bg-dark-elevated ' +
    'focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2',
  filled:
    'bg-brand text-white shadow-xs ' +
    'hover:bg-brand-800 active:bg-brand-900 ' +
    'dark:bg-brand-700 dark:hover:bg-brand-600 ' +
    'focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
  danger:
    'bg-danger-light text-danger border border-danger/20 ' +
    'hover:bg-red-100 active:bg-red-200 ' +
    'focus-visible:ring-2 focus-visible:ring-danger focus-visible:ring-offset-2',
};

const sizeClasses: Record<IconButtonSize, string> = {
  sm: 'w-8 h-8 rounded-xl',
  md: 'w-10 h-10 rounded-2xl',
  lg: 'w-12 h-12 rounded-2xl',
};

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  /** Required: screen reader label for the action */
  'aria-label': string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  variant = 'default',
  size = 'md',
  disabled,
  children,
  className = '',
  ...rest
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.button
      whileTap={shouldReduceMotion || disabled ? undefined : { scale: 0.92 }}
      transition={{ duration: 0.1 }}
      disabled={disabled}
      className={[
        'inline-flex items-center justify-center shrink-0',
        'transition-colors duration-150',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
        variantClasses[variant],
        sizeClasses[size],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...(rest as any)}
    >
      {children}
    </motion.button>
  );
};

export default IconButton;

