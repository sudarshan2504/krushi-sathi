import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { LeafCorners } from './LeafCorners';

export type SceneBackgroundVariant =
  | 'hero'
  | 'splash'
  | 'login'
  | 'language'
  | 'profile'
  | 'sky-cream'
  | 'clean-cream';

export interface FarmerCutoutProps {
  position?: 'left' | 'right';
  facing?: 'inward' | 'left' | 'right';
  className?: string;
  fadeBottom?: boolean;
}

export const FarmerCutout: React.FC<FarmerCutoutProps> = ({
  position = 'right',
  facing = 'inward',
  className = '',
  fadeBottom = true,
}) => {
  // If position is right and facing inward -> looks left -> flipped
  // If position is left and facing inward -> looks right -> normal
  const isFlipped =
    facing === 'inward' ? position === 'right' : facing === 'left';

  const src = isFlipped
    ? '/design/farmer-cutout-flipped.webp'
    : '/design/farmer-cutout.webp';

  return (
    <div
      className={`pointer-events-none select-none z-10 ${className}`}
      style={
        fadeBottom
          ? {
              maskImage: 'linear-gradient(to bottom, black 72%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 72%, transparent 100%)',
            }
          : undefined
      }
    >
      <img
        src={src}
        alt="Farmer gazing over field"
        className="w-full h-auto object-contain"
        loading="eager"
        style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.18))' }}
      />
    </div>
  );
};

export interface SceneStripProps {
  heightClass?: string;
  showFarmer?: boolean;
  farmerPosition?: 'left' | 'right';
  className?: string;
}

export const SceneStrip: React.FC<SceneStripProps> = ({
  heightClass = 'h-24 sm:h-28',
  showFarmer = false,
  farmerPosition = 'left',
  className = '',
}) => {
  return (
    <div className={`relative w-full select-none ${showFarmer ? 'pt-7' : ''} ${className}`}>
      {/* Landscape horizon bar */}
      <div className={`relative w-full overflow-hidden ${heightClass}`}>
        <img
          src="/design/sunrise-landscape-full.webp"
          alt="Sunrise over farm field"
          className="w-full h-full object-cover object-bottom"
          loading="eager"
        />
        {/* Soft top blend for horizon */}
        <div
          className="absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-[#FAF8F2] dark:from-[#1E2320] to-transparent pointer-events-none"
          aria-hidden="true"
        />
        {/* Soft bottom cream fade */}
        <div
          className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#FAF8F2] dark:from-[#1E2320] to-transparent pointer-events-none"
          aria-hidden="true"
        />
      </div>

      {/* Farmer stands slightly taller than the strip so turban is never cropped */}
      {showFarmer && (
        <div
          className={`absolute bottom-0 ${
            farmerPosition === 'left' ? 'left-3 w-[108px] sm:w-[116px]' : 'right-3 w-[108px] sm:w-[116px]'
          } z-10 pointer-events-none`}
        >
          <FarmerCutout
            position={farmerPosition}
            facing="inward"
            fadeBottom
          />
        </div>
      )}
    </div>
  );
};

interface SceneBackgroundProps {
  children: React.ReactNode;
  variant?: SceneBackgroundVariant;
  className?: string;
  showLeafCorners?: boolean;
  showLeftLeaf?: boolean;
  showRightLeaf?: boolean;
  farmerPosition?: 'left' | 'right' | 'none';
  farmerFacing?: 'inward' | 'left' | 'right';
  farmerClassName?: string;
}

export const SceneBackground: React.FC<SceneBackgroundProps> = ({
  children,
  variant = 'sky-cream',
  className = '',
  showLeafCorners,
  showLeftLeaf,
  showRightLeaf,
  farmerPosition,
  farmerFacing = 'inward',
  farmerClassName = '',
}) => {
  const shouldReduceMotion = useReducedMotion();

  // Resolve leaf corner visibility based on variant defaults or props
  const resolvedShowLeaves =
    showLeafCorners !== undefined
      ? showLeafCorners
      : variant === 'hero' ||
        variant === 'login' ||
        variant === 'language' ||
        variant === 'splash' ||
        variant === 'profile';

  const resolvedShowLeftLeaf =
    showLeftLeaf !== undefined
      ? showLeftLeaf
      : true;

  const resolvedShowRightLeaf =
    showRightLeaf !== undefined
      ? showRightLeaf
      : variant !== 'splash';

  // Resolve farmer position based on variant defaults
  const resolvedFarmerPos: 'left' | 'right' | 'none' =
    farmerPosition !== undefined
      ? farmerPosition
      : variant === 'hero'
      ? 'right'
      : variant === 'splash'
      ? 'left'
      : 'none';

  return (
    <div
      className="min-h-screen min-h-dvh w-full flex justify-center selection:bg-emerald-100 selection:text-forest-dark overflow-x-hidden relative"
      style={{
        background:
          variant === 'clean-cream'
            ? '#FAF8F2'
            : 'linear-gradient(180deg, #E6F0F8 0%, #F5F9F6 18%, #FAF8F2 38%, #FAF8F2 100%)',
      }}
    >
      {/* 1. Full-Bleed Hero Background for 'hero' (Home) */}
      {variant === 'hero' && (
        <div
          className="absolute top-0 inset-x-0 h-[46vh] min-h-[360px] max-h-[420px] pointer-events-none overflow-hidden select-none z-0"
          style={{
            maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
          }}
        >
          <img
            src="/design/sunrise-landscape-full.webp"
            alt=""
            className="w-full h-full object-cover"
            style={{ objectPosition: '30% center' }}
            loading="eager"
          />
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/60 via-white/15 to-transparent pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-sky-100/40 to-transparent pointer-events-none" />
        </div>
      )}

      {/* 2. Top Landscape Header Background for 'profile' */}
      {variant === 'profile' && (
        <div
          className="absolute top-0 inset-x-0 h-[195px] pointer-events-none overflow-hidden select-none z-0"
          style={{
            maskImage: 'linear-gradient(to bottom, black 72%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 72%, transparent 100%)',
          }}
        >
          <img
            src="/design/sunrise-landscape-full.webp"
            alt=""
            className="w-full h-full object-cover object-[center_55%]"
            loading="eager"
          />
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/50 to-transparent pointer-events-none" />
        </div>
      )}

      {/* 3. Full-Bleed Background for 'splash' with Ken Burns subtle animation */}
      {variant === 'splash' && (
        <motion.div
          animate={
            shouldReduceMotion
              ? {}
              : {
                  scale: [1, 1.04, 1],
                  transition: { duration: 20, repeat: Infinity, ease: 'linear' },
                }
          }
          className="absolute inset-0 w-full h-full pointer-events-none select-none z-0 overflow-hidden"
        >
          <img
            src="/design/sunrise-landscape-full.webp"
            alt=""
            className="w-full h-full object-cover object-bottom"
            loading="eager"
          />
          <div
            className="absolute inset-x-0 top-0 h-[52%] bg-gradient-to-b from-white/75 via-white/30 to-transparent pointer-events-none z-1"
            aria-hidden="true"
          />
        </motion.div>
      )}

      {/* 4. Shared 430px Container Constraint */}
      <div
        className={`w-full max-w-[430px] min-h-screen min-h-dvh relative flex flex-col justify-between overflow-x-hidden z-10 ${className}`}
      >
        {/* Farmer Cutout positioned inside the 430px mobile column */}
        {resolvedFarmerPos === 'right' && (
          <div
            className={`absolute top-[62px] sm:top-[68px] right-0 w-[42%] max-w-[185px] z-10 ${farmerClassName}`}
          >
            <FarmerCutout position="right" facing={farmerFacing} fadeBottom />
          </div>
        )}
        {resolvedFarmerPos === 'left' && variant === 'splash' && (
          <div
            className={`absolute bottom-[13%] left-1 w-[40%] max-w-[172px] z-10 ${farmerClassName}`}
          >
            <FarmerCutout position="left" facing={farmerFacing} fadeBottom={false} />
          </div>
        )}
        {resolvedFarmerPos === 'left' && variant !== 'splash' && (
          <div
            className={`absolute top-[62px] left-0 w-[38%] max-w-[170px] z-10 ${farmerClassName}`}
          >
            <FarmerCutout position="left" facing={farmerFacing} fadeBottom />
          </div>
        )}

        {/* Leaf Corners hanging in top corners */}
        {resolvedShowLeaves && (
          <LeafCorners
            showLeft={resolvedShowLeftLeaf}
            showRight={resolvedShowRightLeaf}
            className="z-20"
          />
        )}

        {children}
      </div>
    </div>
  );
};
