import React from 'react';
import { useLocation } from 'react-router-dom';
import { useVirtualKeyboard } from '../../hooks/useVirtualKeyboard';

interface StickyBottomBarProps {
  children: React.ReactNode;
  className?: string;
  /** Explicitly control whether to offset for the mobile BottomNav. Defaults to auto-detecting route */
  hasBottomNav?: boolean;
}

/**
 * StickyBottomBar ensures critical primary actions (such as "Next Step", "Analyze Photo",
 * "Generate Recommendations", "Select Crop", and chat form) always stay visible above
 * mobile bottom navigation, safe-area insets, and the virtual keyboard.
 */
export const StickyBottomBar: React.FC<StickyBottomBarProps> = ({
  children,
  className = '',
  hasBottomNav,
}) => {
  const location = useLocation();
  const { isKeyboardOpen } = useVirtualKeyboard();

  // Routes where BottomNav is never rendered
  const noNavRoutes = ['/', '/language', '/login', '/register'];
  const routeHasNav = hasBottomNav ?? !noNavRoutes.includes(location.pathname);

  // When keyboard is open on mobile, bottom nav hides, so sticky bar sits at bottom: 0 + pb-safe.
  // When keyboard is closed and bottom nav is active, sticky bar sits above the bottom nav (~64px + safe area).
  const isOffsetForNav = routeHasNav && !isKeyboardOpen;

  return (
    <div
      role="region"
      aria-label="Action bar"
      className={`fixed left-0 right-0 z-30 transition-all duration-200 pointer-events-none ${
        isOffsetForNav
          ? 'bottom-[calc(60px+env(safe-area-inset-bottom,0px))] md:bottom-0'
          : 'bottom-0 pb-safe'
      } ${className}`}
    >
      <div className="max-w-xl md:max-w-5xl mx-auto px-4 py-2.5 sm:py-3 pointer-events-auto">
        <div className="bg-white/95 backdrop-blur-md border border-[#E8EDE8] rounded-2xl sm:rounded-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-4 py-3 flex items-center justify-between gap-3">
          {children}
        </div>
      </div>
    </div>
  );
};

export default StickyBottomBar;
