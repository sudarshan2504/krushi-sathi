import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children, className = '' }) => {
  const shouldReduceMotion = useReducedMotion();

  // Short fade + 8px slide, under 250ms (180ms)
  const variants = {
    initial: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 },
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      transition={{
        duration: shouldReduceMotion ? 0.08 : 0.18,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={`w-full ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
