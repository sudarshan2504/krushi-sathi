import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Sprout, Bot, User } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from '../../context/LanguageContext';
import { useVirtualKeyboard } from '../../hooks/useVirtualKeyboard';

export const BottomNav: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();
  const { isKeyboardOpen } = useVirtualKeyboard();

  const navItems = [
    { to: '/home', label: t('navHome'), icon: Home },
    { to: '/crops', label: t('navCrops'), icon: Sprout },
    { to: '/chat', label: t('navAiChat'), icon: Bot },
    { to: '/profile', label: t('navProfile'), icon: User },
  ];

  // Don't show bottom nav on splash, language select, login, register
  const hiddenRoutes = ['/', '/language', '/login', '/register'];
  if (hiddenRoutes.includes(location.pathname)) {
    return null;
  }

  return (
    <nav
      aria-label="Bottom Navigation"
      className={`fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E8EDE8] shadow-nav transition-all duration-200 md:hidden ${
        isKeyboardOpen
          ? 'translate-y-full opacity-0 pointer-events-none'
          : 'translate-y-0 opacity-100'
      } pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] pl-[max(0.5rem,env(safe-area-inset-left,0px))] pr-[max(0.5rem,env(safe-area-inset-right,0px))]`}
    >
      <div className="max-w-md mx-auto grid grid-cols-4 px-1 py-1 items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.to);

          return (
            <NavLink
              key={item.to}
              to={item.to}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex flex-col items-center justify-center min-h-[48px] min-w-[48px] py-1 px-1 rounded-2xl transition-all duration-200 select-none active:scale-95 focus-visible:ring-2 focus-visible:ring-forest ${
                isActive ? 'text-forest font-black' : 'text-dark-muted hover:text-dark-text font-bold'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute inset-0 bg-mint rounded-2xl -z-10 shadow-sm border border-forest/15"
                  transition={
                    shouldReduceMotion
                      ? { duration: 0 }
                      : { type: 'spring', damping: 28, stiffness: 380 }
                  }
                />
              )}

              <Icon
                className={`w-6 h-6 transition-transform ${
                  isActive ? 'text-forest stroke-[2.4] scale-105' : 'text-dark-muted stroke-[2]'
                }`}
              />

              <span
                className={`text-[11px] sm:text-xs leading-tight mt-0.5 truncate max-w-[85px] text-center ${
                  isActive ? 'text-forest font-black' : 'text-dark-muted'
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

export default BottomNav;

