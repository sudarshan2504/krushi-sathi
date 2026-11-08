import React from 'react';
import { motion, useReducedMotion, TargetAndTransition } from 'framer-motion';

interface LeafCornersProps {
  showLeft?: boolean;
  showRight?: boolean;
  className?: string;
}

export const LeafCorners: React.FC<LeafCornersProps> = ({
  showLeft = true,
  showRight = true,
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();

  // Subtle natural wind sway animation
  const swayLeft: TargetAndTransition = shouldReduceMotion
    ? {}
    : {
        rotate: [0, 1.5, -1, 0],
        transition: {
          duration: 7,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      };

  const swayRight: TargetAndTransition = shouldReduceMotion
    ? {}
    : {
        rotate: [0, -1.8, 1.2, 0],
        transition: {
          duration: 8.5,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      };

  return (
    <div
      className={`pointer-events-none absolute inset-x-0 top-0 h-44 overflow-hidden z-20 ${className}`}
      aria-hidden="true"
    >
      {showLeft && (
        <motion.div
          animate={swayLeft}
          style={{ originX: 0, originY: 0 }}
          className="absolute -top-3 -left-3 w-40 sm:w-48 opacity-90 select-none drop-shadow-xs"
        >
          <img
            src="/design/leaf-branch-left.webp"
            alt=""
            loading="eager"
            className="w-full h-auto object-contain"
          />
        </motion.div>
      )}

      {showRight && (
        <motion.div
          animate={swayRight}
          style={{ originX: 1, originY: 0 }}
          className="absolute -top-3 -right-3 w-36 sm:w-44 opacity-85 select-none drop-shadow-xs"
        >
          <img
            src="/design/leaf-branch-right.webp"
            alt=""
            loading="eager"
            className="w-full h-auto object-contain"
          />
        </motion.div>
      )}
    </div>
  );
};
