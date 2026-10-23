import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useTranslation } from '../../context/LanguageContext';

export const OfflineBanner: React.FC = () => {
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [justReconnected, setJustReconnected] = useState(false);

  useEffect(() => {
    const handleOffline = () => {
      setIsOffline(true);
      setJustReconnected(false);
    };

    const handleOnline = () => {
      setIsOffline(false);
      setJustReconnected(true);
      const timer = setTimeout(() => {
        setJustReconnected(false);
      }, 4000);
      return () => clearTimeout(timer);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          key="offline-banner"
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          role="status"
          aria-live="polite"
          className="sticky top-0 z-50 w-full bg-amber-500 text-dark-text py-2 px-4 shadow-md flex items-center justify-center gap-2.5 text-xs sm:text-sm font-bold border-b border-amber-600/30"
        >
          <WifiOff className="w-4 h-4 shrink-0 text-dark-text animate-pulse" />
          <span>
            {t('offlineBannerTitle')}: {t('offlineBannerMessage')}
          </span>
        </motion.div>
      )}

      {justReconnected && (
        <motion.div
          key="reconnected-banner"
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          role="status"
          aria-live="polite"
          className="sticky top-0 z-50 w-full bg-forest text-white py-2 px-4 shadow-md flex items-center justify-center gap-2 text-xs sm:text-sm font-bold border-b border-forest-dark"
        >
          <Wifi className="w-4 h-4 shrink-0 text-mint" />
          <span>{t('onlineRestored')}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineBanner;
