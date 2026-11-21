import React, { Suspense, lazy, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { PageTransition } from './components/ui/PageTransition';
import { hardResetApp } from './utils/serviceWorkerKillSwitch';

/**
 * Resilient lazy loader: handles chunk loading failures (e.g. after fresh deployments)
 * by retrying the import and safely falling back.
 */
function lazyWithRetry<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T } | any>
) {
  return lazy(async () => {
    try {
      const mod = await factory();
      return mod.default ? mod : { default: mod };
    } catch (error) {
      console.warn('[ChunkLoader] Failed to load route chunk, retrying in 1s...', error);
      try {
        await new Promise((res) => setTimeout(res, 1000));
        const mod = await factory();
        return mod.default ? mod : { default: mod };
      } catch (retryError) {
        console.error('[ChunkLoader] Chunk load failed after retry:', retryError);
        throw retryError;
      }
    }
  });
}

// Code-split pages for high performance and reduced initial bundle footprint
const SplashPage = lazyWithRetry(() => import('./pages/SplashPage').then(m => ({ default: m.SplashPage })));
const LanguageSelectPage = lazyWithRetry(() => import('./pages/LanguageSelectPage').then(m => ({ default: m.LanguageSelectPage })));
const LoginPage = lazyWithRetry(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage || m.default })));
const RegisterPage = lazyWithRetry(() => import('./pages/RegisterPage').then(m => ({ default: m.RegisterPage || m.default })));
const HomePage = lazyWithRetry(() => import('./pages/HomePage').then(m => ({ default: m.HomePage || m.default })));
const SoilAssessmentPage = lazyWithRetry(() => import('./pages/SoilAssessmentPage').then(m => ({ default: m.SoilAssessmentPage })));
const CropRecommendationsPage = lazyWithRetry(() => import('./pages/CropRecommendationsPage').then(m => ({ default: m.CropRecommendationsPage })));
const CropDetailsPage = lazyWithRetry(() => import('./pages/CropDetailsPage').then(m => ({ default: m.CropDetailsPage })));
const CropLifecyclePage = lazyWithRetry(() => import('./pages/CropLifecyclePage').then(m => ({ default: m.CropLifecyclePage })));
const StageDetailPage = lazyWithRetry(() => import('./pages/StageDetailPage').then(m => ({ default: m.StageDetailPage })));
const DiseasesPage = lazyWithRetry(() => import('./pages/DiseasesPage').then(m => ({ default: m.DiseasesPage || m.default })));
const ChatPage = lazyWithRetry(() => import('./pages/ChatPage').then(m => ({ default: m.ChatPage })));
const ProfilePage = lazyWithRetry(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const CropLibraryPage = lazyWithRetry(() => import('./pages/CropLibraryPage').then(m => ({ default: m.CropLibraryPage })));
const ImageCreditsPage = lazyWithRetry(() => import('./pages/ImageCreditsPage').then(m => ({ default: m.ImageCreditsPage })));
const MarketPricesPage = lazyWithRetry(() => import('./pages/MarketPricesPage').then(m => ({ default: m.MarketPricesPage })));
const DevCropGalleryPage = import.meta.env.DEV
  ? lazyWithRetry(() => import('./pages/DevCropGalleryPage').then(m => ({ default: m.DevCropGalleryPage })))
  : null;

// Realistic layout skeleton fallback with timeout warning and retry button
const PageFallback: React.FC = () => {
  const [showTimeout, setShowTimeout] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTimeout(true);
    }, 6000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-4" role="status" aria-busy="true">
      {showTimeout && (
        <div className="p-4 rounded-3xl bg-amber-50/90 border border-amber-200/80 text-amber-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-sm">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">Loading is taking longer than expected.</span>{' '}
              <span className="text-amber-800">Slow connection or cached asset mismatch.</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-3 py-1.5 rounded-xl bg-forest hover:bg-forest-dark text-white font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
            <button
              type="button"
              onClick={() => hardResetApp()}
              className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 font-semibold transition cursor-pointer"
            >
              Reset Cache
            </button>
          </div>
        </div>
      )}
      <div className="rounded-3xl bg-white p-5 border border-forest/15 shadow-sm flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 w-44 rounded-xl skeleton-shimmer" />
          <div className="h-3.5 w-28 rounded-md skeleton-shimmer" />
        </div>
        <div className="h-8 w-20 rounded-full skeleton-shimmer" />
      </div>
      <div className="rounded-3xl bg-white border border-forest/10 p-5 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl skeleton-shimmer shrink-0" />
            <div className="space-y-2">
              <div className="h-6 w-24 rounded-lg skeleton-shimmer" />
              <div className="h-3 w-32 rounded-md skeleton-shimmer" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="h-10 rounded-xl skeleton-shimmer" />
          <div className="h-10 rounded-xl skeleton-shimmer" />
          <div className="h-10 rounded-xl skeleton-shimmer" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 rounded-3xl bg-white border border-gray-100 shadow-sm flex flex-col items-center gap-2.5">
            <div className="w-12 h-12 rounded-2xl skeleton-shimmer" />
            <div className="h-3 w-16 rounded-md skeleton-shimmer" />
          </div>
        ))}
      </div>
    </div>
  );
};

const AppRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        {/* Standalone onboarding / auth pages */}
        <Route path="/" element={<PageTransition><SplashPage /></PageTransition>} />
        <Route path="/language" element={<PageTransition><LanguageSelectPage /></PageTransition>} />
        <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
        <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
        {/* Dev only crop review gallery */}
        {import.meta.env.DEV && DevCropGalleryPage ? (
          <>
            <Route path="/dev/crop-gallery" element={<PageTransition><DevCropGalleryPage /></PageTransition>} />
            <Route path="/dev/crop-images" element={<Navigate to="/dev/crop-gallery" replace />} />
          </>
        ) : (
          <Route
            path="/dev/*"
            element={
              <div className="min-h-screen flex items-center justify-center p-6 text-center bg-bg">
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold text-text">404 — Not Found</h1>
                  <p className="text-sm text-text-muted">Developer review routes are disabled in production.</p>
                </div>
              </div>
            }
          />
        )}

        {/* Main Application Routes inside Layout (Protected by Firebase Auth) */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/home" element={<PageTransition><HomePage /></PageTransition>} />
          <Route path="/soil" element={<PageTransition><SoilAssessmentPage /></PageTransition>} />
          
          {/* Crop Recommendation & Lifecycle Routes */}
          <Route path="/crops" element={<PageTransition><CropRecommendationsPage /></PageTransition>} />
          <Route path="/crop-library" element={<PageTransition><CropLibraryPage /></PageTransition>} />
          <Route path="/crop-library/:cropId" element={<PageTransition><CropDetailsPage /></PageTransition>} />
          <Route path="/credits" element={<PageTransition><ImageCreditsPage /></PageTransition>} />
          <Route path="/crops/recommend" element={<PageTransition><CropRecommendationsPage /></PageTransition>} />
          <Route path="/crops/lifecycle" element={<PageTransition><CropLifecyclePage /></PageTransition>} />
          <Route path="/crops/lifecycle/:planId" element={<PageTransition><CropLifecyclePage /></PageTransition>} />
          <Route path="/crops/:cropId/lifecycle" element={<PageTransition><CropLifecyclePage /></PageTransition>} />
          <Route path="/crops/stage/:planId/:stageName" element={<PageTransition><StageDetailPage /></PageTransition>} />
          <Route path="/crops/:cropId/stages/:stageId" element={<PageTransition><StageDetailPage /></PageTransition>} />
          <Route path="/crops/:cropId" element={<PageTransition><CropDetailsPage /></PageTransition>} />

          <Route path="/diseases" element={<PageTransition><DiseasesPage /></PageTransition>} />
          <Route path="/crop-health" element={<Navigate to="/diseases" replace />} />
          <Route path="/market-prices" element={<PageTransition><MarketPricesPage /></PageTransition>} />
          <Route path="/chat" element={<PageTransition><ChatPage /></PageTransition>} />
          <Route path="/profile" element={<PageTransition><ProfilePage /></PageTransition>} />
        </Route>

        {/* Fallback redirect */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <LanguageProvider>
          <AuthProvider>
            <ToastProvider>
              <Suspense fallback={<PageFallback />}>
                <AppRoutes />
              </Suspense>
            </ToastProvider>
          </AuthProvider>
        </LanguageProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;