import React, { useState } from 'react';
import { User as UserIcon } from 'lucide-react';
import { User } from '../../types';

interface UserAvatarProps {
  user?: User | null;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

export const getInitials = (name?: string | null): string => {
  if (!name || !name.trim()) return 'RM';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
};

// Generates consistent, earthy agricultural avatar background colors based on user name or ID
const getAvatarGradient = (seed?: string | null): string => {
  const gradients = [
    'from-emerald-700 to-forest text-white',
    'from-teal-700 to-emerald-900 text-white',
    'from-amber-700 to-stone-800 text-amber-100',
    'from-lime-800 to-forest text-lime-100',
    'from-forest to-emerald-950 text-white',
  ];
  if (!seed) return gradients[0];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % gradients.length;
  return gradients[idx];
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = 'md',
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-xs',
    lg: 'w-12 h-12 text-sm',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
  };

  const initials = getInitials(user?.name);
  const gradientClass = getAvatarGradient(user?.id || user?.name);

  // If user has an uploaded avatar and it hasn't errored
  const hasValidAvatar = Boolean(user?.avatar && !imageError);

  return (
    <div
      className={`relative rounded-full overflow-hidden flex items-center justify-center font-extrabold select-none shadow-sm flex-shrink-0 ${
        sizeClasses[size]
      } ${
        hasValidAvatar ? 'bg-mint border-2 border-forest/20' : `bg-gradient-to-br ${gradientClass} border-2 border-white/60`
      } ${className}`}
    >
      {hasValidAvatar ? (
        <img
          src={user!.avatar!}
          alt={user?.name || 'Farmer Avatar'}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span className="tracking-wider leading-none font-black flex items-center justify-center">
          {initials}
        </span>
      )}
    </div>
  );
};
