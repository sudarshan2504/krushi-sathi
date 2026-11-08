import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'frosted' | 'solid' | 'tinted' | 'darkForest';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  variant = 'frosted',
  ...props
}) => {
  const variantStyles = {
    frosted:
      'bg-white/85 dark:bg-zinc-900/85 backdrop-blur-md border border-white/60 dark:border-zinc-700/50 shadow-card',
    solid:
      'bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-card',
    tinted:
      'bg-emerald-50/70 dark:bg-zinc-800/80 backdrop-blur-md border border-emerald-200/50 dark:border-emerald-800/40 shadow-card',
    darkForest:
      'bg-gradient-to-b from-[#165B32] to-[#104022] text-white border border-[#84CC16]/30 shadow-lg',
  };

  return (
    <div
      className={`rounded-3xl p-4 sm:p-5 transition-all duration-200 ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
