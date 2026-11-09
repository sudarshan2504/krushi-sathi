import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';
import { LanguageCode } from '../../i18n';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface LanguagePillProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export const LanguagePill: React.FC<LanguagePillProps> = ({
  variant = 'compact',
  className = '',
}) => {
  const { language, setLanguage, languages, currentLanguageOption } = useTranslation();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownCoords, setDropdownCoords] = useState<{ top: number; right: number }>({ top: 0, right: 0 });

  const updatePosition = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      // Align dropdown's right edge with button's right edge, clamped with padding
      const right = Math.max(12, window.innerWidth - rect.right);
      const top = rect.bottom + 8;
      setDropdownCoords({ top, right });
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      const handleClickOutside = (e: MouseEvent | TouchEvent) => {
        const target = e.target as Node;
        if (
          buttonRef.current &&
          !buttonRef.current.contains(target) &&
          dropdownRef.current &&
          !dropdownRef.current.contains(target)
        ) {
          setIsOpen(false);
        }
      };

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside, { passive: true });
      document.addEventListener('keydown', handleKeyDown);
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('touchstart', handleClickOutside);
        document.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition, true);
      };
    }
  }, [isOpen, updatePosition]);

  const handleSelect = (code: LanguageCode) => {
    setLanguage(code);
    if (user) {
      api.auth.updateProfile({ language: code }).catch(() => {});
    }
    setIsOpen(false);
  };

  const displayText =
    variant === 'compact'
      ? currentLanguageOption.code.toUpperCase()
      : currentLanguageOption.nativeLabel;

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          if (!isOpen) updatePosition();
          setIsOpen((prev) => !prev);
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Change language, currently ${currentLanguageOption.label}`}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 border border-zinc-200/80 dark:border-zinc-700/80 shadow-xs hover:bg-zinc-50 dark:hover:bg-zinc-750 active:scale-95 transition cursor-pointer select-none"
      >
        <Globe className="w-4 h-4 text-forest dark:text-emerald-400 shrink-0" />
        <span className="text-xs font-bold tracking-wide">{displayText}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            role="listbox"
            aria-label="Select language"
            style={{
              top: `${dropdownCoords.top}px`,
              right: `${dropdownCoords.right}px`,
            }}
            className="fixed z-[9999] w-52 py-2 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200/90 dark:border-zinc-700 max-h-[calc(100vh-100px)] overflow-y-auto animate-in fade-in zoom-in-95 duration-150 select-none opacity-100"
          >
            <div className="px-3.5 py-1 text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Select Language
            </div>
            <div className="mt-1 space-y-0.5 px-1.5">
              {languages.map((opt) => {
                const isSelected = opt.code === language;
                return (
                  <button
                    key={opt.code}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(opt.code as LanguageCode)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs transition cursor-pointer select-none ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-[#144D29] dark:text-emerald-300 font-bold'
                        : 'text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-[13px] leading-tight">{opt.nativeLabel}</span>
                      <span className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">{opt.label}</span>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-forest dark:text-emerald-400 shrink-0 stroke-[2.5]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default LanguagePill;
