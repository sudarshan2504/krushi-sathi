import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'harvest';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-200 select-none focus:outline-none focus:ring-2 focus:ring-forest/30 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none';

  const variants = {
    primary: 'bg-forest hover:bg-forest-dark text-white shadow-md shadow-forest/20',
    secondary: 'bg-mint text-forest hover:bg-mint-dark border border-forest/10',
    outline: 'border-2 border-forest text-forest hover:bg-forest/5',
    ghost: 'text-forest hover:bg-forest/5',
    harvest: 'bg-harvest hover:bg-harvest-dark text-dark-text shadow-md shadow-harvest/20 font-bold',
  };

  const sizes = {
    sm: 'text-sm py-2 px-3.5 gap-1.5',
    md: 'text-base py-3 px-5 gap-2',
    lg: 'text-lg py-3.5 px-6 gap-2.5 rounded-3xl min-h-[52px]',
  };

  return (
    <motion.button
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Loading...</span>
        </>
      ) : (
        <>
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </motion.button>
  );
};
