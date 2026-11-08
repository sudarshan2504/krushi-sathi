import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';
import { LanguageCode } from '../../i18n';

interface LanguagePillProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export const LanguagePill: React.FC<LanguagePillProps> = ({
  variant = 'compact',
  className = '',
}) => {
  const { language, setLanguage, languages, currentLanguageOption } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const pillRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pillRef.current && !pillRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (code: LanguageCode) => {
    setLanguage(code);
    setIsOpen(false);
  };

  const displayText =
    variant === 'compact'
      ? currentLanguageOption.code.toUpperCase()
      : currentLanguageOption.nativeLabel;

  return (
    <div className={`relative inline-block ${className}`} ref={pillRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Change language, currently ${currentLanguageOption.label}`}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 dark:bg-zinc-800/95 text-zinc-800 dark:text-zinc-100 border border-zinc-200/70 dark:border-zinc-700/60 shadow-xs hover:bg-zinc-50 active:scale-95 transition cursor-pointer select-none"
      >
        <Globe className="w-4 h-4 text-forest dark:text-emerald-400 shrink-0" />
        <span className="text-xs font-bold tracking-wide">{displayText}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute right-0 mt-2 w-48 py-1.5 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800 z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="px-3 py-1 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            Select Language
          </div>
          {languages.map((opt) => {
            const isSelected = opt.code === language;
            return (
              <button
                key={opt.code}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(opt.code as LanguageCode)}
                className={`w-full flex items-center justify-between px-3.5 py-2 text-left text-xs transition cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-50 dark:bg-zinc-800 text-forest font-bold'
                    : 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
                }`}
              >
                <div className="flex flex-col">
                  <span className="font-semibold">{opt.nativeLabel}</span>
                  <span className="text-[10px] text-zinc-400">{opt.label}</span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-forest shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
