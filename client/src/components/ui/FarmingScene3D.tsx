import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export const FarmingScene3D: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (shouldReduceMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 20; // -10 to +10 deg
      const y = (e.clientY / innerHeight - 0.5) * -20; // -10 to +10 deg
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [shouldReduceMotion]);

  return (
    <div
      className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center select-none"
      style={{ perspective: 1200 }}
      role="img"
      aria-label="3D Farm scene showing sprouting seedling, fertile soil, and morning sunrise"
    >
      {/* Outer 3D Rotator Canvas */}
      <motion.div
        animate={
          shouldReduceMotion
            ? { rotateX: 10, rotateY: 0 }
            : {
                rotateX: mousePos.y + 12,
                rotateY: mousePos.x,
              }
        }
        transition={{ type: 'spring', damping: 25, stiffness: 80 }}
        style={{ transformStyle: 'preserve-3d' }}
        className="relative w-full h-full flex items-center justify-center"
      >
        {/* Layer 0: Ambient Backdrop / Horizon Ring */}
        <div
          className="absolute inset-2 rounded-full bg-gradient-to-tr from-amber-100 via-mint-light to-emerald-50 border-4 border-white shadow-2xl shadow-forest/20 overflow-hidden"
          style={{ transform: 'translateZ(-80px)' }}
        >
          {/* Morning Sunrise Disk */}
          <motion.div
            animate={
              shouldReduceMotion
                ? {}
                : {
                    scale: [1, 1.08, 1],
                    opacity: [0.85, 1, 0.85],
                  }
            }
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-6 left-1/2 -translate-x-1/2 w-36 h-36 rounded-full bg-gradient-to-b from-amber-300 via-harvest to-amber-500/20 blur-sm flex items-center justify-center"
          >
            {/* Inner Sun Glow */}
            <div className="w-20 h-20 rounded-full bg-amber-100/90 shadow-inner" />
          </motion.div>

          {/* Gentle Sun Rays */}
          <svg
            className="absolute inset-0 w-full h-full opacity-35"
            viewBox="0 0 200 200"
            fill="none"
          >
            <circle cx="100" cy="50" r="80" stroke="url(#sunRays)" strokeWidth="1" strokeDasharray="4 8" />
            <circle cx="100" cy="50" r="110" stroke="url(#sunRays)" strokeWidth="0.7" strokeDasharray="3 10" />
            <defs>
              <linearGradient id="sunRays" x1="100" y1="0" x2="100" y2="150" gradientUnits="userSpaceOnUse">
                <stop stopColor="#f59e0b" />
                <stop offset="1" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>

          {/* Distant Hills / Farmland Silhouette */}
          <svg
            className="absolute bottom-0 w-full h-24"
            viewBox="0 0 200 80"
            preserveAspectRatio="none"
            fill="none"
          >
            <path
              d="M0 60 Q 50 35, 100 50 T 200 40 L 200 80 L 0 80 Z"
              fill="#86efac"
              fillOpacity="0.35"
            />
            <path
              d="M0 68 Q 60 48, 120 58 T 200 52 L 200 80 L 0 80 Z"
              fill="#22c55e"
              fillOpacity="0.25"
            />
          </svg>
        </div>

        {/* Layer 1: Soil Mound Base (Low-poly 3D feel) */}
        <div
          className="absolute bottom-6 w-48 h-24 flex items-center justify-center"
          style={{ transform: 'translateZ(-15px) rotateX(15deg)' }}
        >
          {/* Deep Soil Base Shadow */}
          <div className="absolute w-44 h-14 rounded-full bg-earth-dark/40 blur-md translate-y-4" />

          {/* Tier 1 Soil Mound */}
          <div className="absolute w-44 h-14 rounded-[50%] bg-gradient-to-t from-earth-dark via-[#634832] to-[#7f5539] shadow-inner border border-amber-950/20 flex items-center justify-center">
            {/* Soil texture pebbles */}
            <div className="w-2 h-1.5 rounded-full bg-[#4a3525] -translate-x-8 -translate-y-1 opacity-70" />
            <div className="w-1.5 h-1 rounded-full bg-[#8b5a2b] translate-x-10 translate-y-1 opacity-80" />
            <div className="w-2.5 h-1.5 rounded-full bg-[#3d2b1f] translate-x-4 -translate-y-2 opacity-60" />
          </div>

          {/* Tier 2 Enriched Topsoil Crust */}
          <div className="absolute w-36 h-10 rounded-[50%] bg-gradient-to-t from-[#6a4c35] to-[#8d5b38] shadow-sm translate-y-[-4px]">
            {/* Moisture sheen */}
            <div className="w-16 h-2 rounded-full bg-amber-100/20 mx-auto mt-1 blur-xs" />
          </div>
        </div>

        {/* Layer 2: Sprouting Plant / Seedling (Pops into 3D foreground) */}
        <motion.div
          animate={
            shouldReduceMotion
              ? {}
              : {
                  rotateZ: [-1.5, 1.5, -1.5],
                  y: [0, -2, 0],
                }
          }
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-14 flex flex-col items-center"
          style={{ transform: 'translateZ(35px)' }}
        >
          {/* Main Stem */}
          <div className="relative w-2.5 h-20 bg-gradient-to-t from-forest to-leaf rounded-full shadow-md flex items-center justify-center">
            {/* Stem highlight */}
            <div className="w-0.5 h-full bg-mint/50 rounded-full ml-[-2px]" />

            {/* Left Leaf (Low-Poly faceted look) */}
            <motion.div
              animate={
                shouldReduceMotion
                  ? {}
                  : {
                      rotate: [-28, -24, -28],
                      scale: [1, 1.03, 1],
                    }
              }
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{ transformOrigin: 'bottom right' }}
              className="absolute -top-4 -left-12 w-14 h-9 bg-gradient-to-tr from-forest via-emerald-500 to-mint rounded-[40px_10px_40px_10px] shadow-lg shadow-forest/20 border-t border-l border-mint/60 flex items-center justify-center"
            >
              {/* Leaf Vein */}
              <div className="w-10 h-0.5 bg-mint/40 rounded-full rotate-12" />
              {/* Morning Dew Drop */}
              <div className="absolute top-2 right-4 w-1.5 h-1.5 rounded-full bg-white/80 shadow-xs" />
            </motion.div>

            {/* Right Leaf */}
            <motion.div
              animate={
                shouldReduceMotion
                  ? {}
                  : {
                      rotate: [32, 28, 32],
                      scale: [1, 1.04, 1],
                    }
              }
              transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
              style={{ transformOrigin: 'bottom left' }}
              className="absolute -top-6 -right-12 w-14 h-9 bg-gradient-to-tl from-forest via-emerald-500 to-mint rounded-[10px_40px_10px_40px] shadow-lg shadow-forest/20 border-t border-r border-mint/60 flex items-center justify-center"
            >
              {/* Leaf Vein */}
              <div className="w-10 h-0.5 bg-mint/40 rounded-full -rotate-12" />
              {/* Morning Dew Drop */}
              <div className="absolute top-2 left-4 w-2 h-2 rounded-full bg-white/90 shadow-xs" />
            </motion.div>

            {/* Center Fresh Sprout / Bud */}
            <motion.div
              animate={
                shouldReduceMotion
                  ? {}
                  : {
                      scale: [1, 1.08, 1],
                    }
              }
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-8 w-4 h-6 bg-gradient-to-t from-emerald-500 to-mint-light rounded-[50%] shadow-md border border-white/50"
            />
          </div>
        </motion.div>

        {/* Layer 3: Floating Leaves in 3D Space */}
        {!shouldReduceMotion && (
          <>
            <motion.div
              animate={{
                y: [-8, 8, -8],
                x: [-6, 6, -6],
                rotateZ: [0, 25, 0],
              }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-12 left-6 text-xl pointer-events-none drop-shadow-md"
              style={{ transform: 'translateZ(55px)' }}
            >
              🍃
            </motion.div>

            <motion.div
              animate={{
                y: [6, -10, 6],
                x: [4, -4, 4],
                rotateZ: [10, -15, 10],
              }}
              transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute top-16 right-8 text-lg pointer-events-none drop-shadow-md"
              style={{ transform: 'translateZ(65px)' }}
            >
              🌿
            </motion.div>

            <motion.div
              animate={{
                y: [4, -6, 4],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute bottom-20 left-10 w-2 h-2 rounded-full bg-amber-300 blur-[0.5px] pointer-events-none"
              style={{ transform: 'translateZ(40px)' }}
            />
          </>
        )}
      </motion.div>
    </div>
  );
};
