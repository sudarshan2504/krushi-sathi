import React from 'react';

interface WhitePillProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  active?: boolean;
}

export const WhitePill: React.FC<WhitePillProps> = ({
  children,
  className = '',
  onClick,
  active = false,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold select-none transition-all duration-150 ${
        active
          ? 'bg-[#144D29] text-white shadow-xs'
          : 'bg-white/95 dark:bg-zinc-800/95 text-zinc-800 dark:text-zinc-100 border border-zinc-200/70 dark:border-zinc-700/60 shadow-xs hover:bg-zinc-50'
      } ${onClick ? 'cursor-pointer active:scale-95' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

