/**
 * Form primitives: Input, Textarea, Select
 *
 * All share the same visual treatment:
 * - Top label (not floating — simpler + more accessible)
 * - Hairline border, brand ring on focus
 * - Error state: red border + error message below
 * - 48px min-height for touch
 */
import React, { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

/* ── Shared styles ───────────────────────────────────────── */
const baseFieldClasses = [
  'w-full rounded-2xl bg-white px-4 text-[15px] text-gray-900',
  'border border-gray-200 outline-none transition-all duration-150',
  'placeholder:text-gray-400',
  // Focus ring
  'focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20',
  // Dark mode
  'dark:bg-dark-surface dark:text-gray-100 dark:border-dark-border',
  'dark:placeholder:text-gray-600 dark:focus:border-brand-500 dark:focus:ring-brand-500/20',
].join(' ');

const errorFieldClasses = 'border-danger focus:border-danger focus:ring-danger/20 dark:border-danger';

const labelClasses =
  'block text-[13px] font-semibold text-gray-700 mb-1.5 dark:text-gray-300';

const errorMsgClasses =
  'flex items-center gap-1 mt-1.5 text-[12px] text-danger font-medium';

/* ── Shared Label + Error helpers ───────────────────────── */
interface LabelProps { label?: string; htmlFor?: string; required?: boolean; }
const Label: React.FC<LabelProps> = ({ label, htmlFor, required }) => {
  if (!label) return null;
  return (
    <label className={labelClasses} htmlFor={htmlFor}>
      {label}
      {required && <span className="text-danger ml-0.5" aria-hidden="true">*</span>}
    </label>
  );
};

interface ErrorProps { error?: string; id?: string; }
const ErrorMessage: React.FC<ErrorProps> = ({ error, id }) => {
  if (!error) return null;
  return (
    <p id={id} className={errorMsgClasses} role="alert">
      <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      {error}
    </p>
  );
};

/* ── Input ──────────────────────────────────────────────── */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, hint, leftIcon, rightElement, id, required, wrapperClassName = '', className = '', ...rest },
    ref
  ) => {
    const errorId = error ? `${id}-error` : undefined;
    return (
      <div className={wrapperClassName}>
        <Label label={label} htmlFor={id} required={required} />
        <div className="relative">
          {leftIcon && (
            <span
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-600 pointer-events-none"
              aria-hidden="true"
            >
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={id}
            required={required}
            aria-invalid={!!error}
            aria-describedby={errorId}
            className={[
              baseFieldClasses,
              error ? errorFieldClasses : '',
              leftIcon ? 'pl-10' : '',
              rightElement ? 'pr-12' : '',
              'h-12',
              className,
            ]
              .filter(Boolean)
              .join(' ')}
            {...rest}
          />
          {rightElement && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              {rightElement}
            </span>
          )}
        </div>
        {hint && !error && (
          <p className="mt-1.5 text-[12px] text-gray-500 dark:text-gray-500">{hint}</p>
        )}
        <ErrorMessage error={error} id={errorId} />
      </div>
    );
  }
);
Input.displayName = 'Input';

/* ── Textarea ───────────────────────────────────────────── */
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  wrapperClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, id, required, wrapperClassName = '', className = '', ...rest }, ref) => {
    const errorId = error ? `${id}-error` : undefined;
    return (
      <div className={wrapperClassName}>
        <Label label={label} htmlFor={id} required={required} />
        <textarea
          ref={ref}
          id={id}
          required={required}
          aria-invalid={!!error}
          aria-describedby={errorId}
          className={[
            baseFieldClasses,
            error ? errorFieldClasses : '',
            'py-3 resize-none min-h-[96px]',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...rest}
        />
        {hint && !error && (
          <p className="mt-1.5 text-[12px] text-gray-500">{hint}</p>
        )}
        <ErrorMessage error={error} id={errorId} />
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

/* ── Select ─────────────────────────────────────────────── */
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  wrapperClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, id, required, wrapperClassName = '', className = '', children, ...rest }, ref) => {
    const errorId = error ? `${id}-error` : undefined;
    return (
      <div className={wrapperClassName}>
        <Label label={label} htmlFor={id} required={required} />
        <select
          ref={ref}
          id={id}
          required={required}
          aria-invalid={!!error}
          aria-describedby={errorId}
          className={[
            baseFieldClasses,
            error ? errorFieldClasses : '',
            'h-12 appearance-none cursor-pointer',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...rest}
        >
          {children}
        </select>
        {hint && !error && (
          <p className="mt-1.5 text-[12px] text-gray-500">{hint}</p>
        )}
        <ErrorMessage error={error} id={errorId} />
      </div>
    );
  }
);
Select.displayName = 'Select';

export default Input;

