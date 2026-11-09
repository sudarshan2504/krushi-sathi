import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface OutlineButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  theme?: 'white' | 'forest';
  className?: string;
}

export const OutlineButton: React.FC<OutlineButtonProps> = ({
  children,
  icon,
  fullWidth = false,
  size = 'md',
  theme = 'white',
  className = '',
  disabled,
  ...props
}) => {
  const sizeStyles = {
    sm: 'px-4 py-2 text-xs min-h-[38px]',
    md: 'px-6 py-3.5 text-sm min-h-[48px]',
    lg: 'px-8 py-4 text-base min-h-[54px]',
  };

  const themeStyles = {
    white:
      'border-[1.5px] border-white/80 text-white hover:bg-white/10 active:bg-white/20',
    forest:
      'border-[1.5px] border-[#144D29] text-[#144D29] dark:border-emerald-400 dark:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-zinc-800',
  };

  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.01 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      disabled={disabled}
      className={`relative inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-150 select-none backdrop-blur-xs ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${themeStyles[theme]} ${fullWidth ? 'w-full' : ''} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </motion.button>
  );
};

