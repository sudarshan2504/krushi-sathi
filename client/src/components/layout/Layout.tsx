import React from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { OfflineBanner } from '../ui/OfflineBanner';
import { PwaInstallPrompt } from '../ui/PwaInstallPrompt';
import { Home, Sprout, Bot, User } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';

export const Layout: React.FC = () => {
  const location = useLocation();
  const { t } = useTranslation();

  const isFullscreenRoute = ['/', '/language', '/login', '/register'].includes(location.pathname);

  if (isFullscreenRoute) {
    return (
      <main className="min-h-dvh bg-cream-light text-dark-text flex flex-col pl-[max(0.5rem,env(safe-area-inset-left,0px))] pr-[max(0.5rem,env(safe-area-inset-right,0px))]">
        <OfflineBanner />
        <Outlet />
      </main>
    );
  }

  return (
    <div className="min-h-dvh w-full max-w-full overflow-x-hidden bg-cream-light text-dark-text flex flex-col selection:bg-mint selection:text-forest">
      <OfflineBanner />
      <Header />

      {/* Desktop Navigation Bar */}
      <div className="hidden md:block bg-white border-b border-gray-100 py-2.5 px-4 shadow-sm sticky top-[65px] z-20">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Link
              to="/home"
              className={`flex items-center gap-2 py-2 px-4 rounded-xl text-sm font-semibold transition-colors ${
                location.pathname === '/home' ? 'bg-mint text-forest' : 'text-dark-muted hover:bg-gray-50'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>{t('navHome')}</span>
            </Link>

            <Link
              to="/crops"
              className={`flex items-center gap-2 py-2 px-4 rounded-xl text-sm font-semibold transition-colors ${
                location.pathname.startsWith('/crops') ? 'bg-mint text-forest' : 'text-dark-muted hover:bg-gray-50'
              }`}
            >
              <Sprout className="w-4 h-4" />
              <span>{t('navCrops')}</span>
            </Link>

            <Link
              to="/diseases"
              className={`flex items-center gap-2 py-2 px-4 rounded-xl text-sm font-semibold transition-colors ${
                location.pathname.startsWith('/diseases') ? 'bg-mint text-forest' : 'text-dark-muted hover:bg-gray-50'
              }`}
            >
              <span>🐛</span>
              <span>{t('pestAndDiseases')}</span>
            </Link>

            <Link
              to="/chat"
              className={`flex items-center gap-2 py-2 px-4 rounded-xl text-sm font-semibold transition-colors ${
                location.pathname === '/chat' ? 'bg-mint text-forest' : 'text-dark-muted hover:bg-gray-50'
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>{t('navAiChat')}</span>
            </Link>

            <Link
              to="/profile"
              className={`flex items-center gap-2 py-2 px-4 rounded-xl text-sm font-semibold transition-colors ${
                location.pathname === '/profile' ? 'bg-mint text-forest' : 'text-dark-muted hover:bg-gray-50'
              }`}
            >
              <User className="w-4 h-4" />
              <span>{t('navProfile')}</span>
            </Link>
          </div>

          <Link
            to="/soil"
            className="flex items-center gap-1.5 py-2 px-4 rounded-full bg-forest text-white text-xs font-bold hover:bg-forest-dark shadow-sm transition-transform active:scale-95 min-h-[44px]"
          >
            <span>🌾</span>
            <span>{t('checkMySoil')}</span>
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <main
        className={`flex-1 w-full mx-auto ${
          location.pathname === '/chat'
            ? 'max-w-xl md:max-w-3xl p-0 pb-28 md:pb-12 bg-[#FFFCF5]'
            : 'max-w-5xl px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 pb-28 sm:pb-32 md:pb-12'
        }`}
      >
        <Outlet />
      </main>

      {/* PWA Install & Update Prompts */}
      <PwaInstallPrompt />

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
};
