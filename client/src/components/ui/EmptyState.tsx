/**
 * EmptyState — friendly empty/error/offline placeholder.
 *
 * Variants: empty | error | offline | search
 */
import React from 'react';
import { Inbox, AlertTriangle, WifiOff, Search, RefreshCw } from 'lucide-react';
import { Button } from './Button';

type EmptyVariant = 'empty' | 'error' | 'offline' | 'search';

const presets: Record<EmptyVariant, { icon: React.ElementType; defaultTitle: string; defaultDesc: string }> = {
  empty:   { icon: Inbox,         defaultTitle: 'Nothing here yet',       defaultDesc: 'Content you add will appear here.' },
  error:   { icon: AlertTriangle, defaultTitle: 'Something went wrong',   defaultDesc: 'We ran into an issue. Please try again.' },
  offline: { icon: WifiOff,       defaultTitle: 'You\'re offline',        defaultDesc: 'Check your connection and try again.' },
  search:  { icon: Search,        defaultTitle: 'No results found',       defaultDesc: 'Try adjusting your search or filters.' },
};

interface EmptyStateProps {
  variant?: EmptyVariant;
  title?: string;
  description?: string;
  /** Primary action label */
  actionLabel?: string;
  onAction?: () => void;
  /** Whether the action is loading */
  actionLoading?: boolean;
  /** Custom icon to override the default */
  icon?: React.ElementType;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  variant = 'empty',
  title,
  description,
  actionLabel,
  onAction,
  actionLoading = false,
  icon: CustomIcon,
  className = '',
}) => {
  const preset = presets[variant];
  const Icon = CustomIcon ?? preset.icon;
  const displayTitle = title ?? preset.defaultTitle;
  const displayDesc = description ?? preset.defaultDesc;

  const iconBgClass =
    variant === 'error'   ? 'bg-danger-light text-danger' :
    variant === 'offline' ? 'bg-info-light text-info' :
    variant === 'search'  ? 'bg-gray-100 text-gray-500' :
    'bg-brand-50 text-brand-600';

  return (
    <div
      className={[
        'flex flex-col items-center justify-center text-center py-12 px-6',
        className,
      ].join(' ')}
      role="status"
    >
      <div className={['w-16 h-16 rounded-3xl flex items-center justify-center mb-4', iconBgClass].join(' ')}>
        <Icon className="w-7 h-7" strokeWidth={1.75} aria-hidden="true" />
      </div>

      <h3 className="text-[17px] font-bold text-gray-900 dark:text-gray-100 mb-1.5">
        {displayTitle}
      </h3>
      <p className="text-[14px] text-gray-500 dark:text-gray-400 max-w-[260px] leading-relaxed">
        {displayDesc}
      </p>

      {actionLabel && onAction && (
        <Button
          variant={variant === 'error' || variant === 'offline' ? 'secondary' : 'primary'}
          size="sm"
          className="mt-5"
          loading={actionLoading}
          onClick={onAction}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;

