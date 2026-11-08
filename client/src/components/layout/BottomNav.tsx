/**
 * BottomNav — Floating white pill navigation bar matching Krushi Sathi redesign mockups.
 * 4 tabs: Home, Crops, AI Chat, Profile.
 * Active tab: Solid Forest-Green rounded pill with white icon and bold white text.
 */
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Sprout, MessageCircle, User } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from '../../context/LanguageContext';
import { useVirtualKeyboard } from '../../hooks/useVirtualKeyboard';

const HIDDEN_ROUTES = ['/', '/language', '/login', '/register'];

export const BottomNav: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();
  const { isKeyboardOpen } = useVirtualKeyboard();

  const navItems = [
    { to: '/home', label: t('navHome'), icon: Home, exact: true },
    { to: '/crops', label: t('navCrops'), icon: Sprout, exact: false },
    { to: '/chat', label: t('navAiChat'), icon: MessageCircle, exact: true },
    { to: '/profile', label: t('navProfile'), icon: User, exact: true },
  ];

  if (HIDDEN_ROUTES.includes(location.pathname)) return null;

  return (
    <nav
      aria-label="Main navigation"
      className={[
        'fixed bottom-0 inset-x-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] pt-1',
        // Keyboard auto-hide
        isKeyboardOpen ? 'translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100',
        'transition-all duration-200 pointer-events-none',
        // Max mobile width centering
        'max-w-[430px] mx-auto',
      ].join(' ')}
    >
      <div className="pointer-events-auto rounded-full bg-white/95 dark:bg-[#272E2A]/95 backdrop-blur-md border border-zinc-200/70 dark:border-zinc-700/60 shadow-[0_10px_30px_rgba(0,0,0,0.14)] p-1.5 flex items-center justify-around gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? location.pathname === item.to
            : location.pathname.startsWith(item.to);

          return (
            <NavLink
              key={item.to}
              to={item.to}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex items-center justify-center gap-1.5 px-3 py-2 rounded-full min-h-[44px] transition-all duration-150 select-none flex-1 ${
                isActive
                  ? 'text-white'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              {/* Active pill background */}
              {isActive && (
                <motion.div
                  layoutId="active-floating-nav-pill"
                  className="absolute inset-0 bg-[#144D29] dark:bg-[#165B32] rounded-full shadow-sm"
                  transition={
                    shouldReduceMotion
                      ? { duration: 0 }
                      : { type: 'spring', stiffness: 450, damping: 35 }
                  }
                />
              )}

              <Icon
                className={`relative z-10 w-4 h-4 transition-transform shrink-0 ${
                  isActive ? 'text-white stroke-[2.2]' : 'stroke-[1.8]'
                }`}
                aria-hidden="true"
              />
              <span
                className={`relative z-10 text-[11px] sm:text-xs tracking-tight transition-colors whitespace-nowrap ${
                  isActive ? 'font-bold text-white' : 'font-medium'
                }`}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
