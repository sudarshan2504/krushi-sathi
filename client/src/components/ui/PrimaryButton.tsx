import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface PrimaryButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  className?: string;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  icon,
  iconRight,
  fullWidth = false,
  size = 'md',
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  const sizeStyles = {
    sm: 'px-4 py-2 text-xs min-h-[38px]',
    md: 'px-6 py-3.5 text-sm min-h-[48px]',
    lg: 'px-8 py-4 text-base min-h-[54px]',
  };

  return (
    <motion.button
      whileHover={disabled || loading ? {} : { scale: 1.01, filter: 'brightness(1.05)' }}
      whileTap={disabled || loading ? {} : { scale: 0.97 }}
      disabled={disabled || loading}
      className={`relative inline-flex items-center justify-center gap-2 rounded-full font-bold text-white transition-all duration-200 select-none shadow-md ${
        disabled
          ? 'bg-zinc-400 cursor-not-allowed opacity-60'
          : 'bg-gradient-to-b from-[#7CB342] via-[#2E7D32] to-[#144D29] hover:from-[#84CC16] hover:to-[#0D2B18] shadow-[0_4px_14px_rgba(20,77,41,0.35)]'
      } ${fullWidth ? 'w-full' : ''} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
      ) : (
        <>
          {icon && <span className="shrink-0">{icon}</span>}
          <span>{children}</span>
          {iconRight && <span className="shrink-0">{iconRight}</span>}
        </>
      )}
    </motion.button>
  );
};

