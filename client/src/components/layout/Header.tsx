import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sprout, Bell, Globe, ChevronDown, Check, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { Modal } from '../ui/Modal';
import { UserAvatar } from '../ui/UserAvatar';
import { LanguageCode } from '../../i18n';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { language, setLanguage, languages, t } = useTranslation();
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const currentLangLabel = languages.find((l) => l.code === language)?.label || 'English';

  const handleHeaderLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      <header className="sticky top-0 z-30 w-full bg-[#FFFCF5]/95 backdrop-blur-md border-b border-[#E8EDE8] px-2.5 sm:px-4 pt-[max(0.5rem,env(safe-area-inset-top,0px))] pb-2 sm:pb-3 pl-[max(0.5rem,env(safe-area-inset-left,0px))] pr-[max(0.5rem,env(safe-area-inset-right,0px))] transition-colors">
        <div className="max-w-xl md:max-w-5xl mx-auto flex items-center justify-between gap-1.5 sm:gap-2">
          {/* Brand Logo & Name */}
          <Link to="/home" className="flex items-center gap-2 sm:gap-2.5 text-left group shrink-0 min-h-[44px]">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white border border-[#E8EDE8] flex items-center justify-center shadow-xs overflow-hidden p-1 shrink-0">
              <picture className="w-full h-full flex items-center justify-center">
                <source srcSet="/krushi-sathi-logo.webp" type="image/webp" />
                <img
                  src="/krushi-sathi-logo.png"
                  alt="Krushi Sathi Logo"
                  width="36"
                  height="36"
                  className="w-full h-full max-w-full max-h-full object-contain"
                />
              </picture>
            </div>
            <div className="min-w-0">
              <span className="font-extrabold text-[#18352B] text-sm sm:text-base leading-tight block tracking-tight truncate">
                Krushi Sathi
              </span>
              <span className="text-[10px] sm:text-xs text-[#60717A] font-medium leading-tight hidden xs:block truncate">
                Your Farming Companion
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              to="/home"
              className="px-3 py-2 rounded-full text-xs font-bold text-gray-700 hover:text-[#105C32] hover:bg-[#105C32]/5 transition min-h-[44px] inline-flex items-center"
            >
              Home
            </Link>
            <Link
              to="/soil"
              className="px-3 py-2 rounded-full text-xs font-bold text-gray-700 hover:text-[#105C32] hover:bg-[#105C32]/5 transition min-h-[44px] inline-flex items-center"
            >
              Soil Test
            </Link>
            <Link
              to="/crop-library"
              className="px-3 py-2 rounded-full text-xs font-extrabold text-[#105C32] bg-[#E8F5E9] hover:bg-[#C8E6C9] transition flex items-center gap-1.5 min-h-[44px]"
            >
              <Sprout className="w-3.5 h-3.5 text-[#105C32]" />
              <span>Crop Library (A-Z)</span>
            </Link>
            <Link
              to="/crops"
              className="px-3 py-2 rounded-full text-xs font-bold text-gray-700 hover:text-[#105C32] hover:bg-[#105C32]/5 transition min-h-[44px] inline-flex items-center"
            >
              Recommend
            </Link>
            <Link
              to="/diseases"
              className="px-3 py-2 rounded-full text-xs font-bold text-gray-700 hover:text-[#105C32] hover:bg-[#105C32]/5 transition min-h-[44px] inline-flex items-center"
            >
              Diseases
            </Link>
            <Link
              to="/chat"
              className="px-3 py-2 rounded-full text-xs font-bold text-gray-700 hover:text-[#105C32] hover:bg-[#105C32]/5 transition min-h-[44px] inline-flex items-center"
            >
              AI Chat
            </Link>
          </nav>

          {/* Right Controls: Language Selector, Notification Bell, User Avatar, Logout */}
          {/* Right Controls: Language Selector, Notification Bell, User Avatar, Logout */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Rounded Language Selector Pill */}
            <button
              onClick={() => setIsLangModalOpen(true)}
              className="flex items-center gap-1 py-1.5 px-2 sm:px-3 rounded-full bg-white border border-[#E8EDE8] text-xs font-semibold text-[#18352B] shadow-xs hover:border-[#176B3A]/40 transition-colors active:scale-95 min-h-[40px] sm:min-h-[44px] touch-target"
              aria-label="Change language"
            >
              <Globe className="w-3.5 h-3.5 text-[#176B3A] shrink-0" />
              <span className="max-w-[65px] xs:max-w-[85px] sm:max-w-none truncate">{currentLangLabel}</span>
              <ChevronDown className="w-3 h-3 text-[#60717A] shrink-0" />
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => setIsNotifOpen(true)}
              className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-[#E8EDE8] text-[#18352B] shadow-xs flex items-center justify-center hover:border-[#176B3A]/40 transition-colors active:scale-95 touch-target shrink-0"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 text-[#18352B]" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#E53935] border border-white" />
            </button>

            {/* User Avatar (Desktop & Tablet) */}
            <button
              onClick={() => navigate('/profile')}
              className="hidden sm:flex w-10 h-10 rounded-full hover:scale-105 transition-transform focus:outline-none shrink-0 touch-target items-center justify-center"
              aria-label="View Profile"
            >
              <div className="w-10 h-10 rounded-full bg-[#105C32] text-white flex items-center justify-center font-bold text-xs shadow-xs border border-white">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name || 'User'}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : user?.name ? (
                  user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()
                ) : (
                  'AU'
                )}
              </div>
            </button>

            {/* Quick Logout Button (Desktop & Tablet) */}
            <button
              onClick={handleHeaderLogout}
              className="hidden sm:flex w-10 h-10 rounded-full bg-white border border-red-100 text-red-600 shadow-xs items-center justify-center hover:bg-red-50 hover:border-red-200 transition-colors active:scale-95 shrink-0 touch-target"
              title="Sign Out"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Language Selection Modal */}
      <Modal
        isOpen={isLangModalOpen}
        onClose={() => setIsLangModalOpen(false)}
        title={t('chooseLanguage')}
      >
        <p className="text-sm text-[#60717A] mb-4">{t('selectLanguageComfortable')}</p>
        <div className="grid grid-cols-2 gap-3">
          {languages.map((lang) => {
            const isSelected = language === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code as LanguageCode);
                  if (user) {
                    api.auth.updateProfile({ language: lang.code }).catch(() => {});
                  }
                  setIsLangModalOpen(false);
                }}
                className={`relative p-4 rounded-2xl border-2 text-left flex flex-col justify-between transition-all ${
                  isSelected
                    ? 'border-[#176B3A] bg-[#E6F4E8]/50 text-[#176B3A] shadow-sm'
                    : 'border-[#E8EDE8] bg-white hover:border-[#176B3A]/30 text-[#18352B]'
                }`}
              >
                <div>
                  <span className="text-xl font-bold block mb-1">{lang.nativeLabel}</span>
                  <span className="text-xs text-[#60717A]">{lang.label}</span>
                </div>
                {isSelected && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#176B3A] text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </Modal>

      {/* Notification Modal */}
      <Modal
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        title={t('notifications')}
      >
        <div className="space-y-3">
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs">
            <span className="font-bold text-amber-900 block mb-0.5">🌧️ Monsoon Advisory</span>
            <p className="text-amber-800">
              Rain is expected across your district this week. Inspect field drainage to prevent waterlogging.
            </p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs">
            <span className="font-bold text-emerald-900 block mb-0.5">🌾 Crop Schedule Reminder</span>
            <p className="text-emerald-800">
              Check your active crops in Krishi Sathi to review upcoming weed and nutrient management tasks.
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
};
