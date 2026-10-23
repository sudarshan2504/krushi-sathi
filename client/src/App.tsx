import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { PageTransition } from './components/ui/PageTransition';

// Code-split pages for high performance and reduced initial bundle footprint
const SplashPage = lazy(() => import('./pages/SplashPage').then(m => ({ default: m.SplashPage })));
const LanguageSelectPage = lazy(() => import('./pages/LanguageSelectPage').then(m => ({ default: m.LanguageSelectPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const SoilAssessmentPage = lazy(() => import('./pages/SoilAssessmentPage').then(m => ({ default: m.SoilAssessmentPage })));
const CropRecommendationsPage = lazy(() => import('./pages/CropRecommendationsPage').then(m => ({ default: m.CropRecommendationsPage })));
const CropDetailsPage = lazy(() => import('./pages/CropDetailsPage').then(m => ({ default: m.CropDetailsPage })));
const CropLifecyclePage = lazy(() => import('./pages/CropLifecyclePage').then(m => ({ default: m.CropLifecyclePage })));
const StageDetailPage = lazy(() => import('./pages/StageDetailPage').then(m => ({ default: m.StageDetailPage })));
const DiseasePreventionPage = lazy(() => import('./pages/DiseasePreventionPage').then(m => ({ default: m.DiseasePreventionPage })));
const ChatPage = lazy(() => import('./pages/ChatPage').then(m => ({ default: m.ChatPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));

// Realistic layout skeleton fallback replacing full-page spinner
const PageFallback: React.FC = () => (
  <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-4" role="status" aria-busy="true">
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
          <Route path="/crops/recommend" element={<PageTransition><CropRecommendationsPage /></PageTransition>} />
          <Route path="/crops/lifecycle" element={<PageTransition><CropLifecyclePage /></PageTransition>} />
          <Route path="/crops/lifecycle/:planId" element={<PageTransition><CropLifecyclePage /></PageTransition>} />
          <Route path="/crops/:cropId/lifecycle" element={<PageTransition><CropLifecyclePage /></PageTransition>} />
          <Route path="/crops/stage/:planId/:stageName" element={<PageTransition><StageDetailPage /></PageTransition>} />
          <Route path="/crops/:cropId/stages/:stageId" element={<PageTransition><StageDetailPage /></PageTransition>} />
          <Route path="/crops/:cropId" element={<PageTransition><CropDetailsPage /></PageTransition>} />

          <Route path="/diseases" element={<PageTransition><DiseasePreventionPage /></PageTransition>} />
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