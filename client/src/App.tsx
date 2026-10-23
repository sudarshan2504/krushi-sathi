import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

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

const PageFallback: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center" role="status">
    <div className="w-12 h-12 rounded-full border-4 border-mint border-t-forest animate-spin mb-4" />
    <p className="text-dark-muted font-medium text-sm">Loading page...</p>
  </div>
);

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <LanguageProvider>
          <AuthProvider>
            <Suspense fallback={<PageFallback />}>
              <Routes>
                {/* Standalone onboarding / auth pages */}
                <Route path="/" element={<SplashPage />} />
                <Route path="/language" element={<LanguageSelectPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Main Application Routes inside Layout (Protected by Firebase Auth) */}
                <Route
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/home" element={<HomePage />} />
                  <Route path="/soil" element={<SoilAssessmentPage />} />
                  
                  {/* Crop Recommendation & Lifecycle Routes (Specific static segments MUST precede wildcard :cropId) */}
                  <Route path="/crops" element={<CropRecommendationsPage />} />
                  <Route path="/crops/recommend" element={<CropRecommendationsPage />} />
                  <Route path="/crops/lifecycle" element={<CropLifecyclePage />} />
                  <Route path="/crops/lifecycle/:planId" element={<CropLifecyclePage />} />
                  <Route path="/crops/:cropId/lifecycle" element={<CropLifecyclePage />} />
                  <Route path="/crops/stage/:planId/:stageName" element={<StageDetailPage />} />
                  <Route path="/crops/:cropId/stages/:stageId" element={<StageDetailPage />} />
                  <Route path="/crops/:cropId" element={<CropDetailsPage />} />

                  <Route path="/diseases" element={<DiseasePreventionPage />} />
                  <Route path="/chat" element={<ChatPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                </Route>

                {/* Fallback redirect */}
                <Route path="*" element={<Navigate to="/home" replace />} />
              </Routes>
            </Suspense>
          </AuthProvider>
        </LanguageProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;