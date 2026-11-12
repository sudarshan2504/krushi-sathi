import React, { useState, useEffect } from 'react';
import { Download, X, Share, RefreshCw, CheckCircle2, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showAndroidPrompt, setShowAndroidPrompt] = useState(false);
  const [showIosPrompt, setShowIosPrompt] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 1. Detect if already running as installed standalone PWA
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // 2. Check dismissal cooldown (7 days)
    const dismissedUntil = localStorage.getItem('ks_pwa_dismissed_until');
    if (dismissedUntil && Number(dismissedUntil) > Date.now()) {
      return;
    }

    // 3. Android / Chromium beforeinstallprompt listener
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowAndroidPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // 4. iOS Safari detection
    const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    const isSafari =
      /safari/.test(window.navigator.userAgent.toLowerCase()) &&
      !/chrome|crios|firefox|fxios/.test(window.navigator.userAgent.toLowerCase());

    if (isIos && isSafari && !isStandalone) {
      // Delay showing on iOS so it doesn't disturb immediate landing
      const timer = setTimeout(() => {
        setShowIosPrompt(true);
      }, 3500);
      return () => clearTimeout(timer);
    }

    // 5. Service Worker Update Detection
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setIsUpdateAvailable(true);
              }
            });
          }
        });
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowAndroidPrompt(false);
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowAndroidPrompt(false);
    setShowIosPrompt(false);
    // Dismiss for 7 days
    localStorage.setItem('ks_pwa_dismissed_until', String(Date.now() + 7 * 24 * 60 * 60 * 1000));
  };

  const handleUpdate = () => {
    window.location.reload();
  };

  return (
    <>
      {/* 1. New Version / App Update Banner */}
      <AnimatePresence>
        {isUpdateAvailable && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-20 left-4 right-4 max-w-md mx-auto z-50 bg-[#18352B] text-white p-3.5 rounded-2xl shadow-xl border border-white/20 flex items-center justify-between gap-3"
            role="alert"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-forest flex items-center justify-center shrink-0">
                <RefreshCw className="w-4 h-4 text-mint animate-spin" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold truncate">New Update Available</p>
                <p className="text-[11px] text-gray-300">Tap to refresh with latest features</p>
              </div>
            </div>
            <button
              onClick={handleUpdate}
              className="bg-harvest hover:bg-harvest-dark text-[#0D2B18] font-bold text-xs px-3.5 py-2 rounded-xl shrink-0 min-h-[44px] transition-all"
            >
              Update
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Android / Chromium Install Banner */}
      <AnimatePresence>
        {showAndroidPrompt && !isInstalled && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-20 left-3 right-3 max-w-md mx-auto z-40 bg-white/95 backdrop-blur-md p-3.5 rounded-3xl shadow-xl border border-forest/20 flex items-center justify-between gap-2.5"
            role="dialog"
            aria-label="Install app prompt"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-forest flex items-center justify-center text-white shrink-0 shadow-sm">
                <Smartphone className="w-5 h-5 text-mint" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-extrabold text-[#18352B] truncate">
                  Install Krushi Sathi
                </p>
                <p className="text-[11px] text-gray-600 dark:text-gray-400 truncate">
                  Works offline • Instant phone access
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleInstallClick}
                className="bg-forest hover:bg-forest-light text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 min-h-[44px] shadow-sm active:scale-95 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install</span>
              </button>
              <button
                onClick={handleDismiss}
                className="w-9 h-9 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 min-h-[44px] min-w-[44px]"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. iOS Safari Install Banner */}
      <AnimatePresence>
        {showIosPrompt && !isInstalled && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-20 left-3 right-3 max-w-md mx-auto z-40 bg-white/95 backdrop-blur-md p-3.5 rounded-3xl shadow-xl border border-forest/20 flex items-center justify-between gap-2.5"
            role="dialog"
            aria-label="Install iOS app prompt"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-forest flex items-center justify-center text-white shrink-0 shadow-sm">
                <Smartphone className="w-5 h-5 text-mint" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-extrabold text-[#18352B] truncate">
                  Install on iPhone
                </p>
                <p className="text-[11px] text-gray-600 dark:text-gray-400 truncate">
                  Add to home screen for full app experience
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setShowIosGuide(true)}
                className="bg-forest hover:bg-forest-light text-white font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1 min-h-[44px] shadow-sm active:scale-95 transition-all"
              >
                <span>How to Install</span>
              </button>
              <button
                onClick={handleDismiss}
                className="w-9 h-9 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 min-h-[44px] min-w-[44px]"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. iOS Safari Install Instructions Modal */}
      <AnimatePresence>
        {showIosGuide && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-gray-100 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-[#18352B]">
                  Install on your Home Screen
                </h3>
                <button
                  onClick={() => setShowIosGuide(false)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-gray-900 dark:text-gray-100">
                <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-cream-light border border-forest/10">
                  <span className="w-6 h-6 rounded-full bg-forest text-white font-bold text-xs flex items-center justify-center shrink-0">
                    1
                  </span>
                  <div>
                    <p className="font-bold">Tap the Share button</p>
                    <p className="text-gray-600 dark:text-gray-400 text-[11px] mt-0.5 flex items-center gap-1">
                      Located at the bottom of your Safari toolbar (<Share className="w-3.5 h-3.5 inline text-blue-500" />)
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-cream-light border border-forest/10">
                  <span className="w-6 h-6 rounded-full bg-forest text-white font-bold text-xs flex items-center justify-center shrink-0">
                    2
                  </span>
                  <div>
                    <p className="font-bold">Scroll down and tap &ldquo;Add to Home Screen&rdquo;</p>
                    <p className="text-gray-600 dark:text-gray-400 text-[11px] mt-0.5">
                      Looks like a square with a plus icon (+).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-cream-light border border-forest/10">
                  <span className="w-6 h-6 rounded-full bg-forest text-white font-bold text-xs flex items-center justify-center shrink-0">
                    3
                  </span>
                  <div>
                    <p className="font-bold">Tap &ldquo;Add&rdquo; in the top-right corner</p>
                    <p className="text-gray-600 dark:text-gray-400 text-[11px] mt-0.5">
                      Krushi Sathi will appear as an app on your home screen!
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowIosGuide(false);
                  setShowIosPrompt(false);
                }}
                className="w-full py-3 bg-forest text-white rounded-2xl font-bold text-xs shadow-md min-h-[44px] active:scale-95 transition-all"
              >
                Got it
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
