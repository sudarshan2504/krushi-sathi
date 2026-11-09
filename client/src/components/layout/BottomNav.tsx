/**
 * BottomNav — Redesigned floating navigation bar matching Krushi Sathi dashboard mockup.
 *
 * 1. LAYOUT: 4 equal-width tabs (CSS grid, grid-cols-4, each 1fr).
 *    Vertical stacking: 22px icon on top, 11px label below. Never side-by-side.
 * 2. ACTIVE STATE: Filled forest-green rounded pill (rounded-2xl) filling only its own grid cell.
 *    White icon & white label. Active and inactive have identical dimensions to prevent layout shifts.
 *    Framer Motion layoutId sliding transition with prefers-reduced-motion support.
 * 3. POSITION: Fixed bottom, horizontally centered inside 430px column, 12px horizontal margin,
 *    12px bottom margin + safe-area-inset-bottom, height 68px, solid white background, rounded-3xl,
 *    soft shadow, thin light border. Touch targets > 44px.
 * 4. BOTTOM FADE: Smooth cream gradient starting ~24px above the nav and solid cream below it,
 *    preventing any card or text from peeking through or below the bar.
 * 5. INDIC SCRIPTS: Noto Sans Kannada/Tamil/Telugu font stack with line-height >= 1.4 to prevent
 *    glyph clipping on subscript vowels and halants.
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
    <>
      {/* Bottom fade: smooth cream gradient starting ~24px above floating nav bar, solid cream below */}
      <div
        data-testid="bottom-fade"
        className="fixed inset-x-0 bottom-0 pointer-events-none z-30 max-w-[430px] mx-auto overflow-hidden"
        style={{ height: 'calc(104px + env(safe-area-inset-bottom, 0px))' }}
        aria-hidden="true"
      >
        <div className="w-full h-full bg-gradient-to-t from-[#FAF8F2] from-[78px] via-[#FAF8F2]/90 to-transparent dark:from-[#1E2320] dark:from-[78px] dark:via-[#1E2320]/90 dark:to-transparent" />
      </div>

      <nav
        aria-label="Main navigation"
        className={[
          'fixed bottom-0 inset-x-0 z-40',
          'max-w-[430px] mx-auto px-3',
          'pb-[calc(12px+env(safe-area-inset-bottom,0px))]',
          // Keyboard auto-hide
          isKeyboardOpen ? 'translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100',
          'transition-all duration-200 pointer-events-none',
        ].join(' ')}
      >
        <div className="pointer-events-auto relative w-full h-[68px] bg-white dark:bg-[#272E2A] rounded-3xl border border-zinc-200/90 dark:border-zinc-700/70 shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] p-1.5 grid grid-cols-4 items-center">
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
                className="relative flex flex-col items-center justify-center h-full w-full rounded-2xl select-none group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
              >
                {/* Active forest-green pill background filling ONLY this cell */}
                {isActive && (
                  <motion.div
                    data-testid="active-nav-pill"
                    layoutId="active-bottom-nav-pill"
                    className="absolute inset-0 bg-[#154D29] dark:bg-[#165B32] rounded-2xl shadow-sm z-0"
                    transition={
                      shouldReduceMotion
                        ? { duration: 0 }
                        : { type: 'spring', stiffness: 500, damping: 35 }
                    }
                  />
                )}

                {/* 22px Icon vertically above label */}
                <Icon
                  className={`relative z-10 w-[22px] h-[22px] shrink-0 mb-1 transition-colors ${
                    isActive
                      ? 'text-white stroke-[2.2]'
                      : 'text-[#5B7362] dark:text-[#9BB1A1] stroke-[1.8] group-hover:text-zinc-800 dark:group-hover:text-zinc-200'
                  }`}
                  aria-hidden="true"
                />

                {/* Label: 11px, font-medium, one line, centered, truncate with ellipsis, leading >= 1.4 */}
                <span
                  className={`relative z-10 text-[11px] font-medium leading-[1.4] text-center w-full px-1 truncate transition-colors font-['Plus_Jakarta_Sans','Noto_Sans_Kannada','Noto_Sans_Tamil','Noto_Sans_Telugu',sans-serif] ${
                    isActive
                      ? 'text-white'
                      : 'text-[#5B7362] dark:text-[#9BB1A1] group-hover:text-zinc-800 dark:group-hover:text-zinc-200'
                  }`}
                >
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default BottomNav;
