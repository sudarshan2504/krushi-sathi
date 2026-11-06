/**
 * Chip — filter/tag pill with solid selection state.
 *
 * Selected: brand green background + white text (NEVER blank)
 * Unselected: white background + border + gray text
 *
 * Both states have visible focus rings and proper contrast.
 */
import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';

interface ChipProps {
  label: string;
  selected: boolean;
  onSelect: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected,
  onSelect,
  icon,
  disabled = false,
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={selected}
      whileTap={shouldReduceMotion || disabled ? undefined : { scale: 0.95 }}
      transition={{ duration: 0.1 }}
      className={[
        // Base layout
        'inline-flex items-center gap-1.5 px-3.5 py-2',
        'rounded-full text-[13px] font-semibold leading-none',
        'whitespace-nowrap select-none transition-colors duration-150',
        'min-h-[36px] focus-visible:outline-none',
        // Selected state — brand background, white text
        selected
          ? 'bg-brand-700 text-white border border-brand-700 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2'
          : 'bg-white text-gray-700 border border-gray-200 hover:border-brand-300 hover:text-brand-700 dark:bg-dark-surface dark:text-gray-300 dark:border-dark-border dark:hover:border-brand-700 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
        disabled ? 'opacity-40 pointer-events-none' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {selected && !icon && (
        <Check className="w-3 h-3 shrink-0" aria-hidden="true" strokeWidth={2.5} />
      )}
      {icon && <span className="shrink-0 w-4 h-4 flex items-center justify-center" aria-hidden="true">{icon}</span>}
      <span>{label}</span>
    </motion.button>
  );
};

/**
 * SegmentedControl — tab-style selection (like iOS segment).
 *
 * Full-width. One option selected at a time.
 * The active tab has a filled brand background pill that animates with layoutId.
 */
interface SegmentOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface SegmentedControlProps {
  options: SegmentOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  value,
  onChange,
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      role="tablist"
      className={[
        'inline-flex items-stretch bg-gray-100 rounded-2xl p-1 gap-0.5',
        'dark:bg-dark-elevated',
        className,
      ].join(' ')}
    >
      {options.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            type="button"
            aria-selected={isSelected}
            onClick={() => onChange(opt.value)}
            className={[
              'relative flex-1 flex items-center justify-center gap-1.5',
              'px-3 py-2 rounded-xl text-[13px] font-semibold transition-colors duration-150',
              'focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
              isSelected
                ? 'text-white'
                : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {isSelected && (
              <motion.div
                layoutId="segment-pill"
                className="absolute inset-0 bg-brand-700 rounded-xl shadow-xs"
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 400, damping: 35 }
                }
              />
            )}
            {opt.icon && (
              <span className="relative z-10 shrink-0 w-4 h-4" aria-hidden="true">
                {opt.icon}
              </span>
            )}
            <span className="relative z-10">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default Chip;

