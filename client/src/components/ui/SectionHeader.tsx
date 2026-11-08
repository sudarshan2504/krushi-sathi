import React from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  icon,
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-between mb-3 px-0.5 ${className}`}>
      <div className="flex items-center gap-2">
        {icon && <span className="text-forest dark:text-emerald-400 shrink-0">{icon}</span>}
        <div>
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-forest-dark dark:text-cream">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="text-xs font-bold text-forest dark:text-emerald-400 hover:text-forest-dark hover:underline flex items-center gap-0.5 cursor-pointer"
        >
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
};
