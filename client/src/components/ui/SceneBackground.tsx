import React from 'react';

interface SceneBackgroundProps {
  children: React.ReactNode;
  variant?: 'sky-cream' | 'sunrise-landscape' | 'clean-cream';
  className?: string;
  showLeafCorners?: boolean;
}

export const SceneBackground: React.FC<SceneBackgroundProps> = ({
  children,
  variant = 'sky-cream',
  className = '',
  showLeafCorners = false,
}) => {
  return (
    <div className="min-h-screen min-h-dvh w-full bg-[#FAF8F2] dark:bg-[#1E2320] flex justify-center selection:bg-emerald-100 selection:text-forest-dark overflow-x-hidden">
      {/* 430px standard mobile container constraint on larger viewports */}
      <div
        className={`w-full max-w-[430px] min-h-screen min-h-dvh relative flex flex-col justify-between overflow-x-hidden ${className}`}
        style={{
          background:
            variant === 'sky-cream'
              ? 'linear-gradient(180deg, #EAF2F8 0%, #F5F9F6 28%, #FAF8F2 65%, #FFFDF9 100%)'
              : variant === 'clean-cream'
              ? '#FAF8F2'
              : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
};

