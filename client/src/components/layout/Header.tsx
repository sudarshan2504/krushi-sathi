/**
 * Header — slim app header.
 *
 * On the home page: logo left, language + notification right.
 * On inner pages: back button left, page title center, optional right action.
 *
 * Scrolling behavior: slight shadow appears when scrolled.
 * No heavy background — transparent that becomes white/dark on scroll.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Globe, Bell, Check, LogOut, ChevronLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { Modal } from '../ui/Modal';
import { LanguageCode } from '../../i18n';
import { IconButton } from '../ui/IconButton';

const PAGE_TITLES: Record<string, string> = {
  '/home':      '',          // Home shows brand logo
  '/soil':      'Soil Check',
  '/crops':     'Crop Advice',
  '/crop-library': 'Crop Library',
  '/diseases':  'Disease Guide',
  '/chat':      'AI Assistant',
  '/profile':   'Profile',
};

const LANG_SHORT_CODES: Record<LanguageCode, string> = {
  en: 'EN',
  kn: 'ಕನ್ನಡ',
  ta: 'தமிழ்',
  te: 'తెలుగు',
};

function useScrolled(threshold = 4) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const el = document.querySelector('main') ?? window;
    const handler = () => {
      const y = el instanceof Window ? window.scrollY : (el as Element).scrollTop;
      setScrolled(y > threshold);
    };
    el.addEventListener('scroll', handler, { passive: true });
    return () => el.removeEventListener('scroll', handler);
  }, []);
  return scrolled;
}

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { language, setLanguage, languages, t } = useTranslation();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const scrolled = useScrolled();

  const isHome = location.pathname === '/home';
  const pageTitle = PAGE_TITLES[location.pathname] ?? '';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const currentLang = languages.find((l) => l.code === language);

  return (
    <>
      <header
        className={[
          'sticky top-0 z-30 w-full',
          'pt-[max(0.75rem,env(safe-area-inset-top,0px))]',
          'pb-2.5',
          'px-4 sm:px-5',
          'flex items-center gap-2',
          'transition-all duration-200',
          scrolled
            ? 'bg-white/95 dark:bg-dark-surface/95 backdrop-blur-md border-b border-gray-100 dark:border-dark-border shadow-xs'
            : 'bg-bg dark:bg-dark-bg',
        ].join(' ')}
      >
        {/* Left — back button or logo */}
        {isHome ? (
          <Link
            to="/home"
            className="flex items-center gap-2 shrink-0 group min-h-[44px]"
            aria-label="Krushi Sathi home"
          >
            {/* Logo mark */}
            <picture className="w-8 h-8 flex items-center justify-center shrink-0">
              <source srcSet="/krushi-sathi-icon.webp" type="image/webp" />
              <img
                src="/krushi-sathi-icon.png"
                alt="Krushi Sathi"
                width="32"
                height="32"
                className="w-full h-full object-contain"
              />
            </picture>
            <span className="font-extrabold text-[16px] text-gray-900 dark:text-gray-100 leading-tight tracking-tight whitespace-nowrap">
              Krushi Sathi
            </span>
          </Link>
        ) : (
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-10 h-10 rounded-2xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-elevated transition-colors shrink-0 focus-visible:ring-2 focus-visible:ring-brand"
            aria-label={t('navBack')}
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
          </button>
        )}

        {/* Center — page title (inner pages only) */}
        {!isHome && pageTitle && (
          <h1 className="flex-1 text-[16px] font-bold text-gray-900 dark:text-gray-100 text-center truncate">
            {pageTitle}
          </h1>
        )}
        {/* Spacer so right controls align on home */}
        {isHome && <div className="flex-1" />}
        {!isHome && !pageTitle && <div className="flex-1" />}

        {/* Right controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Language selector */}
          <button
            onClick={() => setIsLangOpen(true)}
            className="flex items-center gap-1.5 h-9 px-2.5 rounded-full border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface text-[13px] font-semibold text-gray-800 dark:text-gray-200 hover:border-brand-400 dark:hover:border-brand-600 transition-colors shadow-xs focus-visible:ring-2 focus-visible:ring-brand shrink-0 whitespace-nowrap"
            aria-label={t('chooseLanguage')}
          >
            <Globe className="w-3.5 h-3.5 text-brand-700 dark:text-brand-400 shrink-0" aria-hidden="true" />
            <span className="leading-none">{LANG_SHORT_CODES[language] || 'EN'}</span>
          </button>

          {/* Notification bell */}
          {isHome && (
            <div className="relative shrink-0">
              <IconButton
                variant="default"
                size="md"
                aria-label={t('notifications')}
                onClick={() => setIsNotifOpen(true)}
              >
                <Bell className="w-4 h-4" strokeWidth={1.75} />
              </IconButton>
              {/* Unread dot */}
              <span
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger border-2 border-white dark:border-dark-surface"
                aria-hidden="true"
              />
            </div>
          )}
        </div>
      </header>

      {/* Language Modal */}
      <Modal isOpen={isLangOpen} onClose={() => setIsLangOpen(false)} title={t('chooseLanguage')}>
        <p className="text-[14px] text-gray-500 dark:text-gray-400 mb-4">
          {t('selectLanguageComfortable')}
        </p>
        <div className="grid grid-cols-2 gap-2.5">
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
                  setIsLangOpen(false);
                }}
                className={[
                  'relative p-4 rounded-3xl border-2 text-left flex flex-col gap-1 transition-all',
                  'focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
                  isSelected
                    ? 'border-brand-700 bg-brand-50 dark:bg-brand-900/20 dark:border-brand-600'
                    : 'border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface hover:border-brand-300 dark:hover:border-brand-700',
                ].join(' ')}
              >
                <span className={['text-lg font-bold', isSelected ? 'text-brand-700 dark:text-brand-400' : 'text-gray-900 dark:text-gray-100'].join(' ')}>
                  {lang.nativeLabel}
                </span>
                <span className="text-[12px] text-gray-500 dark:text-gray-400">{lang.label}</span>
                {isSelected && (
                  <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-brand-700 dark:bg-brand-600 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} aria-hidden="true" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </Modal>

      {/* Notification Modal */}
      <Modal isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} title={t('notifications')}>
        <div className="space-y-3">
          <div className="flex gap-3 p-4 rounded-3xl bg-warning-light dark:bg-amber-900/20 border border-warning/20">
            <Bell className="w-4 h-4 text-warning mt-0.5 shrink-0" strokeWidth={2} aria-hidden="true" />
            <div>
              <p className="text-[14px] font-bold text-gray-900 dark:text-gray-100 mb-0.5">Monsoon Advisory</p>
              <p className="text-[13px] text-gray-600 dark:text-gray-400">
                Rain expected this week. Inspect field drainage to prevent waterlogging.
              </p>
            </div>
          </div>
          <div className="flex gap-3 p-4 rounded-3xl bg-brand-50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-900/30">
            <Bell className="w-4 h-4 text-brand-600 mt-0.5 shrink-0" strokeWidth={2} aria-hidden="true" />
            <div>
              <p className="text-[14px] font-bold text-gray-900 dark:text-gray-100 mb-0.5">Crop Schedule Reminder</p>
              <p className="text-[13px] text-gray-600 dark:text-gray-400">
                Check active crops for upcoming weed and nutrient management tasks.
              </p>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};
