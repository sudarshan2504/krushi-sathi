/**
 * Card — flat, elevated, or tinted surface.
 *
 * Variants:
 *  flat     — white surface, hairline border (no shadow)
 *  elevated — white surface + soft layered shadow
 *  tinted   — brand-tinted background (mint green) for highlights
 *  ghost    — transparent, no border, no shadow
 *
 * Usage:
 *  <Card variant="elevated" className="p-5">…</Card>
 *  <Card as="button" variant="flat" onClick={…}>…</Card>
 */
import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export type CardVariant = 'flat' | 'elevated' | 'tinted' | 'ghost';

const variantClasses: Record<CardVariant, string> = {
  flat:
    'bg-white border border-gray-100 ' +
    'dark:bg-dark-surface dark:border-dark-border',
  elevated:
    'bg-white shadow-card ' +
    'dark:bg-dark-surface dark:shadow-card-dark',
  tinted:
    'bg-brand-50 border border-brand-100 ' +
    'dark:bg-dark-elevated dark:border-brand-900/30',
  ghost:
    'bg-transparent',
};

interface CardProps {
  variant?: CardVariant;
  /** Render as a different element, e.g. "button" for tappable cards */
  as?: 'div' | 'section' | 'article' | 'button' | 'a';
  /** Adds press animation. Use only for tappable cards */
  pressable?: boolean;
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

export const Card: React.FC<CardProps> = ({
  variant = 'flat',
  as: Tag = 'div',
  pressable = false,
  className = '',
  children,
  ...rest
}) => {
  const shouldReduceMotion = useReducedMotion();

  const baseClasses = [
    'rounded-4xl overflow-hidden',
    variantClasses[variant],
    pressable ? 'cursor-pointer select-none transition-shadow duration-150 hover:shadow-card-hover' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (pressable) {
    return (
      <motion.div
        whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
        transition={{ duration: 0.12 }}
        className={baseClasses}
        {...rest}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <Tag className={baseClasses} {...rest}>
      {children}
    </Tag>
  );
};

export default Card;
