import React from 'react';

interface IconTileProps {
  icon?: React.ReactNode;
  children?: React.ReactNode;
  variant?: 'mint' | 'green' | 'peach' | 'blue' | 'forest' | 'white';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
}

export const IconTile: React.FC<IconTileProps> = ({
  icon,
  children,
  variant = 'mint',
  size = 'md',
  className = '',
  onClick,
}) => {
  const sizeStyles = {
    sm: 'w-8 h-8 rounded-xl text-xs',
    md: 'w-11 h-11 rounded-2xl text-base',
    lg: 'w-14 h-14 rounded-2xl text-xl',
    xl: 'w-16 h-16 rounded-3xl text-2xl',
  };

  const variantStyles = {
    mint: 'bg-[#DCFCE7] dark:bg-emerald-950/70 text-[#144D29] dark:text-emerald-300',
    green: 'bg-[#E8F5E9] dark:bg-zinc-800 text-[#2E7D32] dark:text-emerald-400',
    peach: 'bg-[#FEF3C7] dark:bg-amber-950/50 text-[#D97706] dark:text-amber-300',
    blue: 'bg-[#E0F2FE] dark:bg-sky-950/50 text-[#0284C7] dark:text-sky-300',
    forest: 'bg-[#144D29] text-white shadow-xs',
    white: 'bg-white dark:bg-zinc-800 text-[#144D29] dark:text-zinc-100 shadow-xs border border-zinc-100 dark:border-zinc-700/60',
  };

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center justify-center shrink-0 font-bold select-none ${
        sizeStyles[size]
      } ${variantStyles[variant]} ${onClick ? 'cursor-pointer active:scale-95' : ''} ${className}`}
    >
      {icon || children}
    </div>
  );
};

