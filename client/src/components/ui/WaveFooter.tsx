import React from 'react';

interface WaveFooterProps {
  children?: React.ReactNode;
  className?: string;
  heightClass?: string;
}

export const WaveFooter: React.FC<WaveFooterProps> = ({
  children,
  className = '',
  heightClass = 'min-h-[160px]',
}) => {
  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      {/* Decorative Wave SVG Top Edge with Lime Highlight */}
      <div className="w-full overflow-hidden leading-none -mb-[1px]">
        <svg
          viewBox="0 0 500 65"
          preserveAspectRatio="none"
          className="w-full h-12 sm:h-16 block"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Lime highlight edge glow */}
          <path
            d="M 0 52 C 120 18, 280 62, 500 24 L 500 28 C 280 66, 120 22, 0 56 Z"
            fill="#84CC16"
            opacity="0.8"
          />
          {/* Deep Forest Green Base Curve */}
          <path
            d="M 0 55 C 130 22, 280 65, 500 26 L 500 65 L 0 65 Z"
            fill="#104422"
          />
        </svg>
      </div>

      {/* Solid Dark Forest Green Body */}
      <div
        className={`w-full bg-gradient-to-b from-[#104422] to-[#0A2E16] text-white px-5 pt-3 pb-8 relative z-10 flex flex-col items-center justify-center gap-3 ${heightClass}`}
      >
        {/* Subtle decorative leaf silhouette watermark at bottom right */}
        <div
          className="absolute -right-4 -bottom-6 w-36 h-36 opacity-10 pointer-events-none select-none"
          aria-hidden="true"
        >
          <svg viewBox="0 0 100 100" fill="currentColor">
            <path d="M 10 90 C 20 60, 45 40, 80 20 C 85 45, 75 75, 45 90 C 30 95, 18 92, 10 90 Z" />
          </svg>
        </div>

        {/* Content slot */}
        <div className="w-full max-w-sm mx-auto flex flex-col items-center gap-3 relative z-20">
          {children}
        </div>
      </div>
    </div>
  );
};

