import React from 'react';
import { useLocation } from 'react-router-dom';
import { useVirtualKeyboard } from '../../hooks/useVirtualKeyboard';

interface StickyBottomBarProps {
  children: React.ReactNode;
  className?: string;
  hasBottomNav?: boolean;
}

export const StickyBottomBar: React.FC<StickyBottomBarProps> = ({
  children,
  className = '',
  hasBottomNav,
}) => {
  const location = useLocation();
  const { isKeyboardOpen } = useVirtualKeyboard();

  const noNavRoutes = ['/', '/language', '/login', '/register'];
  const routeHasNav = hasBottomNav ?? !noNavRoutes.includes(location.pathname);
  const isOffsetForNav = routeHasNav && !isKeyboardOpen;

  return (
    <div
      role="region"
      aria-label="Action bar"
      className={[
        'fixed left-0 right-0 z-30 transition-all duration-200 pointer-events-none',
        'sm:max-w-[440px] sm:mx-auto',
        isOffsetForNav
          ? 'bottom-[calc(86px+env(safe-area-inset-bottom,0px))]'
          : 'bottom-0 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]',
        className,
      ].join(' ')}
    >
      <div className="w-full px-4 py-2 pointer-events-auto">
        <div className="bg-white/95 dark:bg-dark-surface/95 backdrop-blur-md border border-gray-100 dark:border-dark-border rounded-[24px] shadow-card px-4 py-2.5 flex items-center justify-between gap-3">
          {children}
        </div>
      </div>
    </div>
  );
};

export default StickyBottomBar;
