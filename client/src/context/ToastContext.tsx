import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const shouldReduceMotion = useReducedMotion();

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast Notification Container */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed top-4 right-4 left-4 sm:left-auto sm:w-96 z-50 pointer-events-none flex flex-col gap-2.5 items-center sm:items-end"
      >
        <AnimatePresence>
          {toasts.map((toast) => {
            const isSuccess = toast.type === 'success';
            const isError = toast.type === 'error';

            return (
              <motion.div
                key={toast.id}
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className={`pointer-events-auto w-full max-w-sm rounded-2xl p-3.5 shadow-xl border flex items-center justify-between gap-3 text-sm font-semibold select-none ${
                  isSuccess
                    ? 'bg-white text-forest border-mint-dark shadow-forest/10'
                    : isError
                    ? 'bg-white text-red-700 border-red-200 shadow-red-900/10'
                    : 'bg-white text-gray-900 dark:text-gray-100 border-gray-200 shadow-gray-900/10'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {isSuccess && <CheckCircle2 className="w-5 h-5 text-forest shrink-0" />}
                  {isError && <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />}
                  {!isSuccess && !isError && <Info className="w-5 h-5 text-blue-600 shrink-0" />}
                  <span className="truncate">{toast.message}</span>
                </div>

                <button
                  type="button"
                  onClick={() => dismissToast(toast.id)}
                  aria-label="Close notification"
                  className="p-1 rounded-full text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition hover:bg-gray-100 min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastProvider;
