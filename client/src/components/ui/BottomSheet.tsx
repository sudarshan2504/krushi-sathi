/**
 * BottomSheet — accessible modal sheet from the bottom.
 *
 * - Renders in a portal on #root
 * - Closes on backdrop click or Escape
 * - Traps focus while open
 * - Spring animation via framer-motion
 * - Drag handle at the top
 */
import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** Maximum height of the sheet content area */
  maxHeight?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxHeight = '80dvh',
}) => {
  const shouldReduceMotion = useReducedMotion();
  const sheetRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Focus trap — focus first focusable element on open
  useEffect(() => {
    if (!isOpen || !sheetRef.current) return;
    const focusable = sheetRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusable[0]?.focus();
  }, [isOpen]);

  const spring = shouldReduceMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 320, damping: 30 };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="sheet-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
            className="fixed inset-0 z-50 sheet-backdrop"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Sheet */}
          <motion.div
            key="sheet-panel"
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={spring}
            className={[
              'fixed bottom-0 left-0 right-0 z-50',
              'bg-white dark:bg-dark-surface',
              'rounded-t-[28px] shadow-sheet',
              'flex flex-col',
              'max-w-lg mx-auto',
              'pb-[max(1.5rem,env(safe-area-inset-bottom,0px))]',
            ].join(' ')}
            style={{ maxHeight }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0" aria-hidden="true">
              <div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-dark-border" />
            </div>

            {/* Header */}
            {title && (
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-dark-border shrink-0">
                <h2 className="text-[17px] font-bold text-gray-900 dark:text-gray-100">
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-elevated transition-colors focus-visible:ring-2 focus-visible:ring-brand"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.getElementById('root') ?? document.body
  );
};

export default BottomSheet;

