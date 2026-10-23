import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface CardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  variant?: 'white' | 'cream' | 'mint';
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'white',
  interactive = false,
  className = '',
  ...props
}) => {
  const variants = {
    white: 'bg-white border border-gray-100 shadow-card',
    cream: 'bg-cream border border-harvest/20 shadow-card',
    mint: 'bg-mint-light border border-mint-dark/40 shadow-card',
  };

  return (
    <motion.div
      whileHover={interactive ? { y: -2, transition: { duration: 0.2 } } : undefined}
      whileTap={interactive ? { scale: 0.99 } : undefined}
      className={`rounded-3xl p-5 ${variants[variant]} ${interactive ? 'cursor-pointer hover:shadow-card-hover' : ''} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};
