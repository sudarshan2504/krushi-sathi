/**
 * Layout — main application shell.
 *
 * Desktop: 440px centered column with ambient background.
 * Mobile: full width.
 * Inner pages: Header with back button.
 * All protected routes: floating bottom nav, offline banner.
 */
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { OfflineBanner } from '../ui/OfflineBanner';
import { PwaInstallPrompt } from '../ui/PwaInstallPrompt';

// Routes where the shell (header + bottom nav) is hidden (fullscreen pages)
const FULLSCREEN_ROUTES = ['/', '/language', '/login', '/register'];

// Routes that manage their own mockup-exact integrated top bar
const HIDE_HEADER_ROUTES = ['/home', '/profile', '/market-prices'];

// Routes that use full width (chat and home page manage their own edge-to-edge layout)
const FULL_WIDTH_ROUTES = ['/chat', '/home'];

export const Layout: React.FC = () => {
  const location = useLocation();
  const isFullscreen = FULLSCREEN_ROUTES.includes(location.pathname);
  const isFullWidth = FULL_WIDTH_ROUTES.includes(location.pathname);
  const showHeader = !HIDE_HEADER_ROUTES.includes(location.pathname);

  if (isFullscreen) {
    return (
      <div className="min-h-dvh bg-bg dark:bg-dark-bg flex flex-col">
        <OfflineBanner />
        <Outlet />
      </div>
    );
  }

  return (
    // Desktop: ambient background, app column centered
    <div className="min-h-dvh w-full desktop-shell bg-bg dark:bg-dark-bg flex flex-col">
      <OfflineBanner />

      {/* App column — max 440px on desktop, full width on mobile */}
      <div className="flex-1 w-full sm:max-w-[440px] sm:mx-auto flex flex-col relative">
        {showHeader && <Header />}

        <main
          className={[
            'flex-1 w-full',
            isFullWidth
              ? 'p-0 pb-[calc(5rem+env(safe-area-inset-bottom,16px))]'
              : 'px-4 sm:px-5 py-4 pb-[calc(6rem+env(safe-area-inset-bottom,16px))] space-y-0',
            'safe-bottom',
          ].join(' ')}
        >
          <Outlet />
        </main>

        <BottomNav />
      </div>

      <PwaInstallPrompt />
    </div>
  );
};
