import React from 'react';

interface BrandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'emblem' | 'wordmark';
  showSubtitle?: boolean;
  subtitleText?: string;
  className?: string;
  onClick?: () => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  variant = 'full',
  showSubtitle = false,
  subtitleText = 'AI Farming Companion',
  className = '',
  onClick,
}) => {
  // Dimension tokens
  const sizeMap = {
    xs: { emblemSize: 24, fontSize: 'text-xs', subtitleSize: 'text-[9px]' },
    sm: { emblemSize: 32, fontSize: 'text-sm font-bold', subtitleSize: 'text-[10px]' },
    md: { emblemSize: 44, fontSize: 'text-lg font-bold', subtitleSize: 'text-xs' },
    lg: { emblemSize: 58, fontSize: 'text-2xl font-extrabold', subtitleSize: 'text-xs' },
    xl: { emblemSize: 76, fontSize: 'text-3xl font-extrabold', subtitleSize: 'text-sm' },
  };

  const currentSize = sizeMap[size];

  // Crisp SVG Emblem replicating the official Krushi Sathi brand mark:
  // Ring boundary, two sprouting leaves from center stalk, and curved furrow fields beneath.
  const EmblemSvg = ({ dimension }: { dimension: number }) => (
    <svg
      width={dimension}
      height={dimension}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 select-none drop-shadow-xs"
      aria-hidden="true"
    >
      {/* Outer partial green ring */}
      <path
        d="M 28 72 A 38 38 0 1 1 74 65"
        stroke="#2E7D32"
        strokeWidth="6"
        strokeLinecap="round"
      />
      
      {/* Central Sprout Stem */}
      <path
        d="M 22 76 C 30 74, 44 65, 48 48 C 50 40, 50 35, 50 35"
        stroke="#1E5E28"
        strokeWidth="7"
        strokeLinecap="round"
      />

      {/* Primary Leaf (Right) */}
      <path
        d="M 48 46 C 48 46, 52 26, 75 22 C 77 34, 75 48, 56 52 C 51 53, 49 50, 48 46 Z"
        fill="#388E3C"
      />
      {/* Primary Leaf inner spine highlight */}
      <path
        d="M 50 46 Q 60 36 71 25"
        stroke="#A5D6A7"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Secondary Leaf (Left) */}
      <path
        d="M 45 42 C 45 42, 38 28, 26 31 C 24 40, 31 49, 44 47 Z"
        fill="#4CAF50"
      />

      {/* Soil Furrow Layer 1 (Upper Curve) */}
      <path
        d="M 36 75 C 44 68, 62 67, 78 72 C 67 71, 52 72, 40 78 Z"
        fill="#2E7D32"
      />

      {/* Soil Furrow Layer 2 (Lower Arc) */}
      <path
        d="M 46 80 C 53 74, 66 73, 76 77 C 67 78, 56 81, 48 83 Z"
        fill="#43A047"
      />
    </svg>
  );

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {variant !== 'wordmark' && (
        <EmblemSvg dimension={currentSize.emblemSize} />
      )}

      {variant !== 'emblem' && (
        <div className="flex flex-col leading-tight">
          <div className="relative inline-block">
            <span
              className={`tracking-tight text-forest-dark dark:text-cream ${currentSize.fontSize} font-sans`}
              style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
            >
              Krushi Sathi
            </span>
            {/* Green underline swoosh */}
            <svg
              className="absolute -bottom-1.5 left-0 w-full h-1.5 overflow-visible"
              viewBox="0 0 100 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M 0 4 Q 50 7 100 2"
                stroke="#4CAF50"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          {showSubtitle && (
            <span className={`text-muted-dark dark:text-zinc-400 mt-1 font-medium ${currentSize.subtitleSize}`}>
              {subtitleText}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

