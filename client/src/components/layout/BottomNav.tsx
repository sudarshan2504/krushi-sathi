import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Sprout, Bot, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '../../context/LanguageContext';

export const BottomNav: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const navItems = [
    { to: '/home', label: 'Home', icon: Home },
    { to: '/crops', label: 'Crops', icon: Sprout },
    { to: '/chat', label: 'AI Chat', icon: Bot },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  // Don't show bottom nav on splash, language select, login, register
  const hiddenRoutes = ['/', '/language', '/login', '/register'];
  if (hiddenRoutes.includes(location.pathname)) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E8EDE8] shadow-lg pb-safe md:hidden">
      <div className="max-w-md mx-auto grid grid-cols-4 px-3 py-2 items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.to);

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all duration-200 select-none ${
                isActive ? 'text-[#176B3A]' : 'text-[#60717A] hover:text-[#18352B]'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute inset-0 bg-[#E6F4E8] rounded-2xl -z-10"
                  transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                />
              )}

              <Icon
                className={`w-5 h-5 transition-transform ${
                  isActive ? 'text-[#176B3A] stroke-[2.3] scale-105' : 'text-[#60717A] stroke-[1.8]'
                }`}
              />

              <span
                className={`text-[11px] mt-0.5 font-bold transition-colors ${
                  isActive ? 'text-[#176B3A]' : 'text-[#60717A]'
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
