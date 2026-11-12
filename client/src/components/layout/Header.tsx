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
import { Bell, ChevronLeft } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';
import { Modal } from '../ui/Modal';
import { IconButton } from '../ui/IconButton';
import { BrandLogo } from '../ui/BrandLogo';
import { LanguagePill } from '../ui/LanguagePill';

const PAGE_TITLES: Record<string, string> = {
  '/home':      '',          // Home shows brand logo
  '/soil':      'Soil Check',
  '/crops':     'Crop Advice',
  '/crop-library': 'Crop Library',
  '/diseases':  'Disease Guide',
  '/chat':      'AI Assistant',
  '/profile':   'Profile',
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
  const { t } = useTranslation();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const scrolled = useScrolled();

  const isHome = location.pathname === '/home';
  const pageTitle = PAGE_TITLES[location.pathname] ?? '';

  return (
    <>
      <header
        className={[
          'sticky top-0 z-40 w-full',
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
            <BrandLogo size="sm" variant="emblem" />
            <span className="font-extrabold text-[16px] text-gray-900 dark:text-gray-100 leading-tight tracking-tight whitespace-nowrap">
              Krushi Sathi
            </span>
          </Link>
        ) : (
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-11 h-11 rounded-2xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-elevated transition-colors shrink-0 focus-visible:ring-2 focus-visible:ring-brand cursor-pointer"
            aria-label={t('navBack')}
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
          </button>
        )}

        {/* Center — page title (inner pages only) */}
        {!isHome && pageTitle && (
          <span className="flex-1 text-[16px] font-bold text-gray-900 dark:text-gray-100 text-center truncate">
            {pageTitle}
          </span>
        )}
        {/* Spacer so right controls align on home */}
        {isHome && <div className="flex-1" />}
        {!isHome && !pageTitle && <div className="flex-1" />}

        {/* Right controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Language portal dropdown */}
          <LanguagePill variant="compact" />

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
