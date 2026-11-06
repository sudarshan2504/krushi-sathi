/**
 * Toast — lightweight, accessible notification system.
 *
 * Replaces the existing ToastContext display layer.
 * Toasts auto-dismiss after 4s. Max 3 visible at once.
 *
 * Types: success | error | warning | info
 */
import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastCtx = createContext<ToastContextValue>({ showToast: () => {} });

const icons: Record<ToastType, React.ElementType> = {
  success: CheckCircle2,
  error:   XCircle,
  warning: AlertTriangle,
  info:    Info,
};

const toastClasses: Record<ToastType, string> = {
  success: 'bg-white border-success text-gray-900 dark:bg-dark-surface dark:text-gray-100',
  error:   'bg-white border-danger text-gray-900 dark:bg-dark-surface dark:text-gray-100',
  warning: 'bg-white border-warning text-gray-900 dark:bg-dark-surface dark:text-gray-100',
  info:    'bg-white border-info text-gray-900 dark:bg-dark-surface dark:text-gray-100',
};

const iconClasses: Record<ToastType, string> = {
  success: 'text-success',
  error:   'text-danger',
  warning: 'text-warning',
  info:    'text-info',
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const dismiss = useCallback((id: string) => {
    setToasts((t) => t.filter((toast) => toast.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration = 4000) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setToasts((prev) => [...prev.slice(-2), { id, type, message, duration }]);
      timers.current[id] = setTimeout(() => dismiss(id), duration);
    },
    [dismiss]
  );

  return (
    <ToastCtx.Provider value={{ showToast }}>
      {children}
      {createPortal(
        <div
          aria-live="polite"
          aria-atomic="false"
          className="fixed bottom-24 left-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none max-w-sm mx-auto"
        >
          <AnimatePresence mode="popLayout">
            {toasts.map((toast) => {
              const Icon = icons[toast.type];
              return (
                <motion.div
                  key={toast.id}
                  layout
                  initial={{ opacity: 0, y: 12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, y: 8 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  role="alert"
                  className={[
                    'flex items-start gap-3 px-4 py-3',
                    'rounded-3xl border-l-4 shadow-card',
                    'pointer-events-auto',
                    toastClasses[toast.type],
                  ].join(' ')}
                >
                  <Icon
                    className={['w-5 h-5 mt-0.5 shrink-0', iconClasses[toast.type]].join(' ')}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  <p className="flex-1 text-[14px] font-medium leading-snug">{toast.message}</p>
                  <button
                    onClick={() => dismiss(toast.id)}
                    className="shrink-0 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    aria-label="Dismiss"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>,
        document.getElementById('root') ?? document.body
      )}
    </ToastCtx.Provider>
  );
};

export const useToastNew = () => useContext(ToastCtx);

/** Drop-in replacement — wraps the existing ToastContext.showToast API */
export const useShowToast = () => {
  const { showToast } = useContext(ToastCtx);
  return {
    showToast: (msg: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') =>
      showToast(msg, type),
  };
};

export default ToastProvider;

