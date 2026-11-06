/**
 * StatTile — a compact metric tile showing a number + label.
 *
 * Used in weather card (temperature, humidity, wind, etc.)
 * and crop details (duration, water need, season).
 */
import React from 'react';

interface StatTileProps {
  icon?: React.ReactNode;
  label: string;
  value: string | number;
  unit?: string;
  /** Highlight the value in brand color */
  highlight?: boolean;
  className?: string;
}

export const StatTile: React.FC<StatTileProps> = ({
  icon,
  label,
  value,
  unit,
  highlight = false,
  className = '',
}) => (
  <div
    className={[
      'flex flex-col items-center text-center gap-0.5 min-w-0',
      className,
    ].join(' ')}
  >
    {icon && (
      <span className="text-gray-400 dark:text-gray-500 mb-0.5" aria-hidden="true">
        {icon}
      </span>
    )}
    <span
      className={[
        'text-lg font-bold tabular leading-none',
        highlight
          ? 'text-brand-700 dark:text-brand-400'
          : 'text-gray-900 dark:text-gray-100',
      ].join(' ')}
    >
      {value}
      {unit && <span className="text-[11px] font-medium ml-0.5 text-gray-500 dark:text-gray-400">{unit}</span>}
    </span>
    <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium leading-tight">
      {label}
    </span>
  </div>
);

/**
 * ListItem — a single row in a settings / info list.
 *
 * left:   icon or avatar
 * center: title + optional subtitle
 * right:  optional badge, value text, or chevron
 */
interface ListItemProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  divider?: boolean;
  className?: string;
}

export const ListItem: React.FC<ListItemProps> = ({
  icon,
  title,
  subtitle,
  right,
  onPress,
  divider = true,
  className = '',
}) => {
  const Tag = onPress ? 'button' : 'div';

  return (
    <Tag
      onClick={onPress}
      className={[
        'flex items-center gap-3 px-4 py-3.5 w-full text-left',
        'transition-colors duration-150',
        onPress
          ? 'hover:bg-gray-50 dark:hover:bg-dark-elevated active:bg-gray-100 dark:active:bg-dark-border cursor-pointer'
          : '',
        divider ? 'border-b border-gray-100 dark:border-dark-border last:border-0' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {icon && (
        <span
          className="w-9 h-9 flex items-center justify-center rounded-2xl bg-gray-100 dark:bg-dark-elevated text-gray-600 dark:text-gray-400 shrink-0"
          aria-hidden="true"
        >
          {icon}
        </span>
      )}
      <div className="flex-1 min-w-0">
        <span className="block text-[15px] font-semibold text-gray-900 dark:text-gray-100 truncate">
          {title}
        </span>
        {subtitle && (
          <span className="block text-[13px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
            {subtitle}
          </span>
        )}
      </div>
      {right && (
        <span className="shrink-0 text-gray-400 dark:text-gray-500">
          {right}
        </span>
      )}
    </Tag>
  );
};

export default StatTile;

