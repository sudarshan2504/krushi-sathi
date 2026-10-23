import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'info' | 'earth' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'success',
  size = 'md',
  className = '',
}) => {
  const variants = {
    success: 'bg-mint text-forest border border-forest/20',
    warning: 'bg-harvest/20 text-earth-dark border border-harvest/30 font-semibold',
    info: 'bg-blue-50 text-blue-700 border border-blue-200',
    earth: 'bg-amber-100 text-earth border border-earth/20',
    neutral: 'bg-gray-100 text-gray-700 border border-gray-200',
  };

  const sizes = {
    sm: 'text-xs py-0.5 px-2.5 rounded-full',
    md: 'text-sm py-1 px-3 rounded-full font-medium',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
};
