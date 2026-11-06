/**
 * BottomNav — floating rounded bottom navigation bar.
 *
 * 4 items: Home, Crops, AI Chat, Profile.
 * Active indicator: brand-filled pill animates with framer-motion layoutId.
 * Hides when virtual keyboard is open.
 * Safe-area aware for iPhone/Android gesture bars.
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
    { to: '/home',    label: t('navHome'),    icon: Home,          exact: true },
    { to: '/crops',   label: t('navCrops'),   icon: Sprout,        exact: false },
    { to: '/chat',    label: t('navAiChat'),  icon: MessageCircle, exact: true },
    { to: '/profile', label: t('navProfile'), icon: User,          exact: true },
  ];

  if (HIDDEN_ROUTES.includes(location.pathname)) return null;

  return (
    <nav
      aria-label="Main navigation"
      className={[
        'fixed bottom-0 left-0 right-0 z-40',
        // Solid surface — 100% opaque, no see-through content behind it
        'bg-white dark:bg-dark-surface border-t border-gray-200 dark:border-dark-border shadow-card',
        // Visibility during keyboard
        isKeyboardOpen ? 'translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100',
        'transition-all duration-200',
        // Safe area padding
        'pt-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom,0px))]',
        'px-2 sm:px-4',
        // Desktop centering
        'sm:max-w-[440px] sm:mx-auto sm:left-1/2 sm:-translate-x-1/2 sm:border-x',
      ].join(' ')}
    >
      <div className="grid grid-cols-4 gap-1 max-w-full">
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
              className="relative flex flex-col items-center justify-center min-h-[52px] py-1 px-1 rounded-2xl gap-1 select-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1"
            >
              {/* Animated active background pill */}
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-pill"
                  className="absolute inset-0 bg-brand-50 dark:bg-brand-900/35 rounded-2xl"
                  transition={
                    shouldReduceMotion
                      ? { duration: 0 }
                      : { type: 'spring', stiffness: 400, damping: 35 }
                  }
                />
              )}

              <Icon
                className={[
                  'relative z-10 w-5 h-5 transition-colors',
                  isActive
                    ? 'text-brand-700 dark:text-brand-400 stroke-[2.25]'
                    : 'text-gray-500 dark:text-gray-400 stroke-[1.75]',
                ].join(' ')}
                aria-hidden="true"
              />
              <span
                className={[
                  'relative z-10 text-[12px] leading-none transition-colors whitespace-nowrap',
                  isActive
                    ? 'font-bold text-brand-700 dark:text-brand-400'
                    : 'font-semibold text-gray-500 dark:text-gray-400',
                ].join(' ')}
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

export default BottomNav;
