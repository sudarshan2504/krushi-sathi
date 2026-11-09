import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Phone,
  MapPin,
  Camera,
  Edit2,
  Sprout,
  Settings,
  Globe,
  Bell,
  ShieldCheck,
  Moon,
  Sun,
  LogOut,
  Map,
  Check,
  AlertCircle,
  X,
  Save,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { LanguagePill } from '../components/ui/LanguagePill';
import { IconTile } from '../components/ui/IconTile';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';

export const ProfilePage: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const { currentLanguageOption, t } = useTranslation();
  const { showToast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [isEditing, setIsEditing] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Edit form state
  const [name, setName] = useState(user?.name || 'Ramesh Kumar');
  const [state, setState] = useState(user?.state || 'Karnataka');
  const [district, setDistrict] = useState(user?.district || 'Mandya');
  const [taluk, setTaluk] = useState(user?.taluk || 'Maddur');
  const [village, setVillage] = useState(user?.village || 'Koppa');
  const [farmSize, setFarmSize] = useState<number | string>(user?.farmSize || 2.5);
  const [farmUnit, setFarmUnit] = useState(user?.farmUnit || 'Acres');

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // User Initials for circular avatar
  const getInitials = (fullName?: string) => {
    if (!fullName) return 'RK';
    const parts = fullName.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      showToast('Please select a valid image (JPEG, PNG, or WebP)', 'error');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast('Image size exceeds 2MB limit', 'error');
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          const updatedUser = await api.auth.uploadAvatar(base64Data);
          updateUser(updatedUser);
          showToast('Profile photo updated successfully!', 'success');
        } catch (err: any) {
          showToast(err.message || 'Failed to upload photo', 'error');
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setIsUploading(false);
      showToast('Failed to read image file', 'error');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const updated = await api.auth.updateProfile({
        name,
        state,
        district,
        taluk,
        village,
        farmSize: typeof farmSize === 'string' ? parseFloat(farmSize) : farmSize,
        farmUnit,
      });
      updateUser(updated);
      setIsEditing(false);
      showToast(t('toastSaved'), 'success');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const farmerName = user?.name || 'Ramesh Kumar';
  const farmerPhone = user?.phone || '9876543210';
  const locationLabel = `${user?.village || 'Koppa'}, ${user?.taluk || 'Maddur'}, ${user?.district || 'Mandya'}, ${user?.state || 'Karnataka'}`;
  const landSize = user?.farmSize ?? 2.5;

  return (
    <div className="min-h-screen min-h-dvh w-full bg-[#FAF8F2] dark:bg-[#1E2320] flex justify-center pb-32 safe-bottom selection:bg-emerald-100 selection:text-forest-dark overflow-x-hidden">
      <div className="w-full max-w-[430px] min-h-screen min-h-dvh flex flex-col px-4 pt-3 space-y-4">
        {/* 1. TOP BAR: Back Button + "Profile" + Language Pill */}
        <header className="flex items-center justify-between py-1.5 z-20">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="w-9 h-9 rounded-full bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200/70 dark:border-zinc-700 flex items-center justify-center shadow-xs hover:bg-zinc-50 active:scale-95 transition cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 text-zinc-700 dark:text-zinc-200" />
          </button>

          <h1 className="text-base sm:text-lg font-extrabold text-[#0D2B18] dark:text-cream tracking-tight">
            Profile
          </h1>

          <LanguagePill variant="compact" />
        </header>

        {/* 2. HERO CARD: Sunrise Landscape Banner + Farmer RK Avatar + Location + Edit Button */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-3xl bg-white dark:bg-zinc-800/95 border border-zinc-200/60 dark:border-zinc-700/60 shadow-card overflow-hidden text-center relative"
        >
          {/* Top Landscape Strip Banner */}
          <div className="w-full h-20 sm:h-24 overflow-hidden relative select-none">
            <img
              src="/design/sunrise-landscape-strip.webp"
              alt=""
              className="w-full h-full object-cover object-bottom"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-white dark:to-zinc-850 pointer-events-none" />
          </div>

          {/* Large Circular Avatar with Camera Badge Button */}
          <div className="relative -mt-11 mb-2 inline-block mx-auto">
            <div className="w-20 h-20 rounded-full bg-[#144D29] text-white flex items-center justify-center font-extrabold text-2xl shadow-md border-4 border-white dark:border-zinc-800 overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt={farmerName} className="w-full h-full object-cover" />
              ) : (
                <span>{getInitials(farmerName)}</span>
              )}
            </div>

            {/* Camera Badge Button for Photo Upload */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Upload profile photo"
              disabled={isUploading}
              className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#84CC16] hover:bg-[#A3E635] text-white flex items-center justify-center shadow-xs border-2 border-white dark:border-zinc-800 cursor-pointer active:scale-95 transition"
            >
              <Camera className="w-3.5 h-3.5 text-[#0A2E16]" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
            />
          </div>

          {/* Farmer Name with Sprout Motif */}
          <div className="px-4 pb-4">
            <h2 className="text-xl font-extrabold text-[#0D2B18] dark:text-cream inline-flex items-center gap-1.5 justify-center">
              <span>{farmerName}</span>
              <Sprout className="w-4 h-4 text-[#228B22] dark:text-emerald-400 rotate-12 inline-block shrink-0 -mt-1" />
            </h2>

            {/* Phone Number */}
            <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-1">
              <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span>{farmerPhone}</span>
            </div>

            {/* Registered Region */}
            <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="truncate max-w-[280px]">{locationLabel}</span>
            </div>

            {/* "Edit Profile" Pill Button */}
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-forest/30 hover:border-forest text-forest dark:text-emerald-400 text-xs font-bold tracking-wide mt-3 active:scale-95 transition cursor-pointer select-none bg-emerald-50/50 dark:bg-zinc-700/40"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>{t('editProfileBtn')}</span>
            </button>
          </div>
        </motion.div>

        {/* 3. FARM PROFILE & LANDHOLDINGS CARD (2 Columns + Farmhouse Landscape) */}
        <div className="rounded-3xl bg-white dark:bg-zinc-800/95 border border-zinc-200/60 dark:border-zinc-700/60 shadow-card overflow-hidden">
          {/* Card Header: Sprout icon + Title */}
          <div className="p-4 pb-2 flex items-center gap-2">
            <Sprout className="w-4 h-4 text-[#228B22] shrink-0" />
            <h3 className="text-sm font-bold text-[#0D2B18] dark:text-cream tracking-tight">
              {t('farmProfileLandholdings')}
            </h3>
          </div>

          {/* 2-Column Split Details */}
          <div className="px-4 py-2 grid grid-cols-2 gap-3">
            {/* Left Column: Total Land Size */}
            <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/25 border border-emerald-100/80 dark:border-emerald-800/40 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">
                  {t('totalLandSize')}
                </span>
                <span className="text-xl font-extrabold text-[#0D2B18] dark:text-zinc-100 block leading-tight">
                  {landSize} Acres
                </span>
              </div>
              <div className="mt-2 text-[10px] font-bold text-forest dark:text-emerald-300">
                ≈ {Math.round(Number(landSize) * 40)} Guntas ({Math.round(Number(landSize) * 43560).toLocaleString()} sq ft)
              </div>
            </div>

            {/* Right Column: Registered Location */}
            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-700/60 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">
                  {t('registeredLocation')}
                </span>
                <span className="text-base font-extrabold text-[#0D2B18] dark:text-zinc-100 block leading-tight">
                  {user?.district || 'Mandya'},<br />{user?.state || 'Karnataka'}
                </span>
              </div>
              <div className="mt-2 text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                Region: {user?.village || 'Koppa'}, {user?.taluk || 'Maddur'} Hobli
              </div>
            </div>
          </div>

          {/* Bottom Farmhouse Pastoral Illustration */}
          <div className="w-full h-16 sm:h-20 overflow-hidden select-none mt-2">
            <img
              src="/design/farmhouse-field-footer.webp"
              alt=""
              className="w-full h-full object-cover object-center"
              loading="lazy"
            />
          </div>
        </div>

        {/* 4. PREFERENCES & INFORMATION CARD (Language, Notifications, Security, Theme, Logout) */}
        <div className="rounded-3xl bg-white dark:bg-zinc-800/95 border border-zinc-200/60 dark:border-zinc-700/60 shadow-card p-4 space-y-3">
          <div className="flex items-center gap-2 pb-1 border-b border-zinc-100 dark:border-zinc-700/50">
            <Settings className="w-4 h-4 text-forest dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-[#0D2B18] dark:text-cream">
              {t('preferencesInformation')}
            </h3>
          </div>

          {/* Row 1: Choose Your Language */}
          <button
            type="button"
            onClick={() => navigate('/language')}
            className="w-full flex items-center justify-between p-2 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-700/30 transition cursor-pointer text-left"
          >
            <div className="flex items-center gap-3">
              <IconTile variant="mint" size="sm">
                <Globe className="w-4 h-4" />
              </IconTile>
              <div>
                <span className="text-xs font-bold text-[#0D2B18] dark:text-zinc-100 block">
                  {t('chooseLanguage')}
                </span>
                <span className="text-[11px] text-zinc-400">
                  {currentLanguageOption.nativeLabel} ({currentLanguageOption.label})
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-400" />
          </button>

          {/* Row 2: Notifications */}
          <div className="flex items-center justify-between p-2 rounded-2xl">
            <div className="flex items-center gap-3">
              <IconTile variant="mint" size="sm">
                <Bell className="w-4 h-4" />
              </IconTile>
              <div>
                <span className="text-xs font-bold text-[#0D2B18] dark:text-zinc-100 block">
                  {t('notificationsTitle')}
                </span>
                <span className="text-[11px] text-zinc-400">
                  {t('weatherCropAlertsMore')}
                </span>
              </div>
            </div>
            {/* Active Green Switch Toggle */}
            <button
              type="button"
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              aria-label="Toggle notifications"
              className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer ${
                notificationsEnabled ? 'bg-[#228B22]' : 'bg-zinc-300 dark:bg-zinc-600'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                  notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Row 3: Account & Security */}
          <button
            type="button"
            onClick={() => showToast('Account secured with OTP authentication', 'info')}
            className="w-full flex items-center justify-between p-2 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-700/30 transition cursor-pointer text-left"
          >
            <div className="flex items-center gap-3">
              <IconTile variant="mint" size="sm">
                <ShieldCheck className="w-4 h-4" />
              </IconTile>
              <div>
                <span className="text-xs font-bold text-[#0D2B18] dark:text-zinc-100 block">
                  {t('accountSecurity')}
                </span>
                <span className="text-[11px] text-zinc-400">
                  {t('manageAccountSecurity')}
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-400" />
          </button>

          {/* Row 4: Dark Mode Toggle */}
          <div className="flex items-center justify-between p-2 rounded-2xl">
            <div className="flex items-center gap-3">
              <IconTile variant="mint" size="sm">
                {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </IconTile>
              <div>
                <span className="text-xs font-bold text-[#0D2B18] dark:text-zinc-100 block">
                  Dark Mode
                </span>
                <span className="text-[11px] text-zinc-400">
                  {theme === 'dark' ? 'Soft Charcoal active' : 'Warm Light active'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer ${
                theme === 'dark' ? 'bg-[#228B22]' : 'bg-zinc-300 dark:bg-zinc-600'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                  theme === 'dark' ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Row 5: Sign Out */}
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center justify-between p-2 rounded-2xl hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 transition cursor-pointer text-left"
          >
            <div className="flex items-center gap-3">
              <IconTile variant="peach" size="sm">
                <LogOut className="w-4 h-4 text-red-600" />
              </IconTile>
              <div>
                <span className="text-xs font-bold block">{t('logout')}</span>
                <span className="text-[11px] text-zinc-400">Sign out of this session</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-400" />
          </button>
        </div>

        {/* Edit Profile Modal */}
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-white dark:bg-zinc-850 rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-zinc-100 dark:border-zinc-700 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-700">
                <h3 className="font-extrabold text-base text-[#0D2B18] dark:text-cream">
                  Edit Profile
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-3 pt-3">
                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Farmer Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-forest"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                      District
                    </label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-forest"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                      Taluk / Hobli
                    </label>
                    <input
                      type="text"
                      value={taluk}
                      onChange={(e) => setTaluk(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-forest"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                      Land Size
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={farmSize}
                      onChange={(e) => setFarmSize(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-forest"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                      Unit
                    </label>
                    <select
                      value={farmUnit}
                      onChange={(e) => setFarmUnit(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-forest"
                    >
                      <option value="Acres">Acres</option>
                      <option value="Guntas">Guntas</option>
                      <option value="Hectares">Hectares</option>
                    </select>
                  </div>
                </div>

                {errorMessage && (
                  <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg">
                    {errorMessage}
                  </p>
                )}

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-full border border-zinc-200 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 rounded-full bg-forest text-white text-xs font-bold shadow-sm"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Logout Confirmation Modal */}
        <Modal
          isOpen={showLogoutConfirm}
          onClose={() => setShowLogoutConfirm(false)}
          title={t('logoutConfirmTitle')}
        >
          <div className="space-y-4 pt-1">
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300">
              {t('logoutConfirmMessage')}
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowLogoutConfirm(false)}>
                {t('navCancel')}
              </Button>
              <Button variant="danger" size="sm" onClick={handleLogout}>
                {t('logout')}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default ProfilePage;
