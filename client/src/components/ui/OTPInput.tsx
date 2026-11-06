/**
 * OTPInput — 6 separate boxes, auto-advance, paste support.
 *
 * Accessibility:
 * - Single role="group" with a descriptive label
 * - Each box has aria-label with position
 * - Error announced via aria-live
 */
import React, { useRef, useCallback, KeyboardEvent, ClipboardEvent } from 'react';

const LENGTH = 6;

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  label?: string;
  autoFocus?: boolean;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  value,
  onChange,
  error,
  disabled = false,
  label = 'Verification code',
  autoFocus = false,
}) => {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const digits = Array.from({ length: LENGTH }, (_, i) => value[i] || '');

  const focus = (index: number) => {
    inputsRef.current[index]?.focus();
  };

  const handleChange = useCallback(
    (index: number, char: string) => {
      const cleaned = char.replace(/\D/g, '').slice(0, 1);
      const arr = [...digits];
      arr[index] = cleaned;
      const newValue = arr.join('');
      onChange(newValue);
      if (cleaned && index < LENGTH - 1) {
        focus(index + 1);
      }
    },
    [digits, onChange]
  );

  const handleKeyDown = useCallback(
    (index: number, e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace') {
        e.preventDefault();
        if (digits[index]) {
          const arr = [...digits];
          arr[index] = '';
          onChange(arr.join(''));
        } else if (index > 0) {
          const arr = [...digits];
          arr[index - 1] = '';
          onChange(arr.join(''));
          focus(index - 1);
        }
      } else if (e.key === 'ArrowLeft' && index > 0) {
        e.preventDefault();
        focus(index - 1);
      } else if (e.key === 'ArrowRight' && index < LENGTH - 1) {
        e.preventDefault();
        focus(index + 1);
      }
    },
    [digits, onChange]
  );

  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, LENGTH);
      onChange(text.padEnd(value.length > text.length ? value.length : text.length, '').slice(0, LENGTH));
      onChange(text);
      const nextFocus = Math.min(text.length, LENGTH - 1);
      focus(nextFocus);
    },
    [onChange, value.length]
  );

  return (
    <div>
      {label && (
        <p className="text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-3">
          {label}
        </p>
      )}
      <div
        role="group"
        aria-label={label}
        className="flex items-center gap-2 justify-center"
      >
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputsRef.current[i] = el; }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            disabled={disabled}
            autoFocus={autoFocus && i === 0}
            aria-label={`Digit ${i + 1} of ${LENGTH}`}
            aria-invalid={!!error}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            className={[
              'w-11 h-14 text-center text-xl font-bold rounded-2xl',
              'border-2 outline-none transition-all duration-150',
              'bg-white dark:bg-dark-surface',
              digit
                ? 'border-brand-600 text-brand-700 dark:border-brand-500 dark:text-brand-400'
                : 'border-gray-200 text-gray-900 dark:border-dark-border dark:text-gray-100',
              error
                ? 'border-danger dark:border-danger'
                : '',
              'focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 dark:focus:border-brand-500',
              disabled ? 'opacity-50 cursor-not-allowed' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          />
        ))}
      </div>
      {error && (
        <p
          className="mt-2 text-[12px] text-danger font-medium text-center"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default OTPInput;

