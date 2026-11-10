/**
 * Button — primary design system button.
 *
 * Variants: primary | secondary | ghost | danger | outline (alias for secondary)
 * Sizes:    sm | md | lg
 * States:   loading / isLoading, disabled, fullWidth
 */
import React from 'react';
import { Loader2 } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

const variantClasses: Record<string, string> = {
  primary:
    'bg-brand text-white shadow-sm ' +
    'hover:bg-brand-800 active:bg-brand-900 ' +
    'dark:bg-brand-600 dark:hover:bg-brand-700 ' +
    'focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
  secondary:
    'bg-white text-brand border border-brand/30 shadow-xs ' +
    'hover:bg-brand-50 hover:border-brand/50 active:bg-brand-100 ' +
    'dark:bg-dark-surface dark:text-brand-400 dark:border-dark-border dark:hover:bg-dark-elevated ' +
    'focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
  outline:
    'bg-white text-brand border border-brand/30 shadow-xs ' +
    'hover:bg-brand-50 hover:border-brand/50 active:bg-brand-100 ' +
    'dark:bg-dark-surface dark:text-brand-400 dark:border-dark-border dark:hover:bg-dark-elevated ' +
    'focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
  ghost:
    'bg-transparent text-gray-700 ' +
    'hover:bg-gray-100 active:bg-gray-200 ' +
    'dark:text-gray-300 dark:hover:bg-dark-elevated ' +
    'focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2',
  danger:
    'bg-danger text-white shadow-xs ' +
    'hover:bg-red-700 active:bg-red-800 ' +
    'focus-visible:ring-2 focus-visible:ring-danger focus-visible:ring-offset-2',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-10 px-4 text-[13px] font-semibold rounded-2xl gap-1.5',
  md: 'h-12 px-5 text-[15px] font-semibold rounded-2xl gap-2',
  lg: 'h-[52px] px-6 text-base font-bold rounded-2xl gap-2',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading,
  isLoading,
  fullWidth = false,
  leftIcon,
  rightIcon,
  disabled,
  children,
  className = '',
  ...rest
}) => {
  const shouldReduceMotion = useReducedMotion();
  const isCurrentlyLoading = Boolean(loading || isLoading);
  const isDisabled = disabled || isCurrentlyLoading;

  return (
    <motion.button
      whileTap={shouldReduceMotion || isDisabled ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.12 }}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={isCurrentlyLoading}
      className={[
        'inline-flex items-center justify-center select-none cursor-pointer',
        'transition-colors duration-150',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
        variantClasses[variant] || variantClasses.primary,
        sizeClasses[size] || sizeClasses.md,
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...(rest as any)}
    >
      {isCurrentlyLoading && (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
      )}
      {!isCurrentlyLoading && leftIcon && (
        <span className="shrink-0" aria-hidden="true">{leftIcon}</span>
      )}
      {children && (
        <span className={isCurrentlyLoading ? 'sr-only' : 'inline-flex items-center justify-center gap-2'}>
          {children}
        </span>
      )}
      {!isCurrentlyLoading && rightIcon && (
        <span className="shrink-0" aria-hidden="true">{rightIcon}</span>
      )}
    </motion.button>
  );
};

export default Button;
