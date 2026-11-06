import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  Phone,
  MapPin,
  Globe,
  LogOut,
  Sprout,
  Camera,
  Trash2,
  Check,
  AlertCircle,
  Save,
  ArrowRight,
  Edit2,
  Navigation,
  Loader2,
  Moon,
  Sun,
  Monitor,
  HelpCircle,
  Shield,
  Ruler,
  PhoneCall,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { UserAvatar } from '../components/ui/UserAvatar';
import { ListItem } from '../components/ui/StatTile';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { api } from '../services/api';
import {
  INDIAN_STATES,
  IndianState,
  matchState,
  matchDistrict,
} from '../data/indianLocations';
import {
  LAND_UNIT_OPTIONS,
  getLandConversionSummary,
  getLocalizedUnitLabel,
} from '../utils/landUnits';

export const ProfilePage: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const { currentLanguageOption, language, t } = useTranslation();
  const { showToast } = useToast();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [state, setState] = useState(user?.state || 'Karnataka');
  const [village, setVillage] = useState(user?.village || '');
  const [district, setDistrict] = useState(user?.district || '');
  const [farmSize, setFarmSize] = useState<number | string>(user?.farmSize || 2.0);
  const [farmUnit, setFarmUnit] = useState(user?.farmUnit || 'Acres');
  const [latitude, setLatitude] = useState<number | null>(user?.latitude || null);
  const [longitude, setLongitude] = useState<number | null>(user?.longitude || null);
  const [locationSource, setLocationSource] = useState<string>(user?.locationSource || 'manual');
  const [isDetectingLoc, setIsDetectingLoc] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedStateObj = INDIAN_STATES.find(s => s.name === state) || INDIAN_STATES[0];

  const detectLocation = () => {
    if (!navigator.geolocation) {
      showToast(t('locationUnavailable'), 'error');
      return;
    }
    setIsDetectingLoc(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const acc = pos.coords.accuracy;
          const geo = await api.location.reverseGeocode(lat, lon, acc);
          const matchedState = matchState(geo.state || '') || INDIAN_STATES[0];
          const distResult = matchDistrict(geo.district || geo.town || '', matchedState);

          setState(matchedState.name);
          setDistrict(distResult ? distResult.district : '');
          if (geo.village) setVillage(geo.village);
          setLatitude(lat);
          setLongitude(lon);
          setLocationSource('gps');
          showToast(t('locationDetectedChip', { location: geo.village || distResult?.district || matchedState.name }), 'success');
        } catch {
          showToast(t('locationUnavailable'), 'error');
        } finally {
          setIsDetectingLoc(false);
        }
      },
      () => {
        setIsDetectingLoc(false);
        showToast(t('locationPermissionDenied'), 'error');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrorMessage('Please select a valid image file (JPEG, PNG, or WebP).');
      return;
    }

    // Validate size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage('Image size exceeds 2MB limit. Please choose a smaller photo.');
      return;
    }

    setErrorMessage(null);
    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          const updatedUser = await api.auth.uploadAvatar(base64Data);
          updateUser(updatedUser);
          showToast('Profile photo updated successfully!');
        } catch (err: any) {
          setErrorMessage(err.message || 'Failed to upload photo');
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setIsUploading(false);
      setErrorMessage('Failed to read image file');
    }
  };

  const handleRemoveAvatar = async () => {
    if (!window.confirm('Are you sure you want to remove your profile photo?')) return;
    setIsUploading(true);
    setErrorMessage(null);
    try {
      const updatedUser = await api.auth.removeAvatar();
      updateUser(updatedUser);
      showToast('Profile photo removed. Initial avatar restored.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to remove photo');
    } finally {
      setIsUploading(false);
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
        village,
        district,
        farmSize: typeof farmSize === 'string' ? parseFloat(farmSize) : farmSize,
        farmUnit,
        latitude,
        longitude,
        locationSource,
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

  const conversionHint = getLandConversionSummary(farmSize, farmUnit, language);

  return (
    <div className="max-w-2xl mx-auto space-y-4 py-2">

      {/* Error Message */}
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span>{errorMessage}</span>
        </motion.div>
      )}

      {/* Profile Header Card */}
      <div className="bg-white dark:bg-dark-surface rounded-3xl p-6 border border-gray-100 dark:border-dark-border shadow-card flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
        {/* Avatar with Upload Action */}
        <div className="relative group">
          <UserAvatar user={user} size="2xl" className="shadow-md" />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            aria-label="Change photo"
            className="absolute bottom-0 right-0 p-2 rounded-full bg-brand-600 hover:bg-brand-700 text-white shadow-md border-2 border-white dark:border-dark-surface transition-transform active:scale-95 disabled:opacity-50"
            title="Upload photo"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="text-xl font-black text-gray-900 dark:text-gray-50">{user?.name || 'Farmer'}</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center sm:justify-start gap-1 mt-0.5">
                <Phone className="w-3.5 h-3.5" />
                <span>{user?.phone || 'No phone registered'}</span>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center sm:justify-start gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>
                  {user?.district
                    ? `${user.village ? user.village + ', ' : ''}${user.district}, ${user.state || 'Karnataka'}`
                    : 'Karnataka, India'}
                </span>
              </p>
            </div>

            <div className="flex items-center justify-center sm:justify-end gap-2 mt-2 sm:mt-0">
              <button
                type="button"
                onClick={() => {
                  setName(user?.name || '');
                  setState(user?.state || 'Karnataka');
                  setVillage(user?.village || '');
                  setDistrict(user?.district || '');
                  setFarmSize(user?.farmSize || 2.0);
                  setFarmUnit(user?.farmUnit || 'Acres');
                  setLatitude(user?.latitude || null);
                  setLongitude(user?.longitude || null);
                  setLocationSource(user?.locationSource || 'manual');
                  setIsEditing(!isEditing);
                }}
                className="py-1.5 px-3.5 rounded-xl border border-gray-200 dark:border-dark-border text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-elevated flex items-center gap-1.5 transition"
              >
                <Edit2 className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
              </button>

              {user?.avatar && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  disabled={isUploading}
                  className="py-1.5 px-2.5 rounded-xl border border-red-200 dark:border-red-900/40 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-1 transition disabled:opacity-50"
                  title="Remove photo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Remove</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form Modal/Card */}
      {isEditing && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          onSubmit={handleSaveProfile}
          className="bg-white dark:bg-dark-surface rounded-3xl p-5 border border-brand-500/30 dark:border-brand-500/20 shadow-card space-y-4"
        >
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-dark-border pb-2">
            <div>
              <h2 className="text-sm font-extrabold text-brand-700 dark:text-brand-400">Edit Farmer Information</h2>
              <span className="text-[11px] text-gray-500 dark:text-gray-400">Saved to your personal account</span>
            </div>

            {/* GPS Location Refresh button */}
            <button
              type="button"
              onClick={detectLocation}
              disabled={isDetectingLoc}
              className="px-2.5 py-1.5 rounded-xl bg-brand-50 dark:bg-dark-elevated hover:bg-brand-600 hover:text-white text-brand-700 dark:text-brand-400 text-xs font-bold transition flex items-center gap-1.5 min-h-[32px] cursor-pointer disabled:opacity-50"
            >
              {isDetectingLoc ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Detecting...</span>
                </>
              ) : (
                <>
                  <Navigation className="w-3 h-3" />
                  <span>Detect Location</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-gray-900 dark:text-gray-100 text-xs font-semibold focus:border-brand-600 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Village / Town</label>
              <input
                type="text"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                placeholder="e.g. Koppa"
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-gray-900 dark:text-gray-100 text-xs font-semibold focus:border-brand-600 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">State</label>
              <select
                value={state}
                onChange={(e) => {
                  const newState = e.target.value;
                  setState(newState);
                  const st = INDIAN_STATES.find(s => s.name === newState);
                  if (st && !st.districts.includes(district)) {
                    setDistrict(st.districts[0] || '');
                  }
                  setLocationSource('manual');
                }}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-gray-900 dark:text-gray-100 text-xs font-semibold focus:border-brand-600 outline-none"
              >
                {INDIAN_STATES.map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">District</label>
              <select
                value={district}
                onChange={(e) => {
                  setDistrict(e.target.value);
                  setLocationSource('manual');
                }}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-gray-900 dark:text-gray-100 text-xs font-semibold focus:border-brand-600 outline-none"
              >
                <option value="">Select District</option>
                {selectedStateObj.districts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Land Size & Indian Measurement Unit
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={farmSize}
                  onChange={(e) => setFarmSize(e.target.value)}
                  className="w-24 px-3 py-2 rounded-xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-gray-900 dark:text-gray-100 text-xs font-bold focus:border-brand-600 outline-none"
                />
                <select
                  value={farmUnit}
                  onChange={(e) => setFarmUnit(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-gray-900 dark:text-gray-100 text-xs font-semibold focus:border-brand-600 outline-none"
                >
                  {LAND_UNIT_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {language === 'kn' ? opt.labelKn : language === 'ta' ? opt.labelTa : language === 'te' ? opt.labelTe : opt.labelEn}
                    </option>
                  ))}
                </select>
              </div>
              {conversionHint && (
                <p className="text-[10px] text-brand-600 dark:text-brand-400 font-semibold mt-1 flex items-center gap-1">
                  <Ruler className="w-3 h-3" />
                  <span>{conversionHint}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="py-2 px-4 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="py-2 px-5 rounded-xl bg-forest hover:bg-forest-dark text-white text-xs font-bold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </motion.form>
      )}

      {/* Farm Details Card */}
      <div className="bg-white dark:bg-dark-surface rounded-3xl p-5 border border-gray-100 dark:border-dark-border shadow-card space-y-3">
        <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Sprout className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <span>Farm Profile & Landholdings</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-gray-50 dark:bg-dark-elevated p-3.5 rounded-2xl border border-gray-100 dark:border-dark-border">
            <span className="text-gray-500 dark:text-gray-400 block mb-0.5">Total Land Size</span>
            <div className="flex items-baseline gap-2">
              <span className="font-extrabold text-gray-900 dark:text-gray-100 text-base">
                {user?.farmSize ? `${user.farmSize} ${getLocalizedUnitLabel(user.farmUnit || 'Acres', language)}` : '2 Acres'}
              </span>
            </div>
            {conversionHint && (
              <span className="text-[10px] text-brand-700 dark:text-brand-400 font-bold flex items-center gap-1 mt-0.5">
                <Ruler className="w-3 h-3" />
                <span>{conversionHint}</span>
              </span>
            )}
          </div>
          <div className="bg-gray-50 dark:bg-dark-elevated p-3.5 rounded-2xl border border-gray-100 dark:border-dark-border">
            <span className="text-gray-500 dark:text-gray-400 block mb-0.5">Registered Location</span>
            <span className="font-extrabold text-gray-900 dark:text-gray-100 text-base capitalize block">
              {user?.district ? `${user.district}, ${user.state || 'Karnataka'}` : 'Karnataka'}
            </span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400 block mt-0.5">
              Region: {user?.village ? `${user.village} Hobli` : 'South Karnataka Agro-Climatic Zone'}
            </span>
          </div>
        </div>
      </div>

      {/* App Preferences & Settings Group */}
      <div className="bg-white dark:bg-dark-surface rounded-3xl border border-gray-100 dark:border-dark-border shadow-card overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 dark:border-dark-border">
          <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Preferences & Information
          </h3>
        </div>

        <div>
          {/* Language Item */}
          <ListItem
            icon={<Globe className="w-4 h-4 text-brand-600 dark:text-brand-400" />}
            title={t('chooseLanguage')}
            subtitle={`${currentLanguageOption.nativeLabel} (${currentLanguageOption.label})`}
            right={<ChevronRight className="w-4 h-4 text-gray-400" />}
            onPress={() => navigate('/language')}
          />

          {/* Theme Mode Selector Row */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 dark:border-dark-border">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 flex items-center justify-center rounded-2xl bg-gray-100 dark:bg-dark-elevated text-gray-600 dark:text-gray-400 shrink-0">
                {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </span>
              <div>
                <span className="block text-[15px] font-semibold text-gray-900 dark:text-gray-100">
                  Theme Appearance
                </span>
                <span className="block text-[13px] text-gray-500 dark:text-gray-400 mt-0.5 capitalize">
                  {theme} mode
                </span>
              </div>
            </div>

            <div className="flex bg-gray-100 dark:bg-dark-elevated p-1 rounded-xl gap-1">
              {[
                { id: 'light', label: 'Light', icon: Sun },
                { id: 'dark', label: 'Dark', icon: Moon },
              ].map((opt) => {
                const Icon = opt.icon;
                const isSelected = theme === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setTheme(opt.id as 'light' | 'dark')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                      isSelected
                        ? 'bg-white dark:bg-dark-surface text-brand-700 dark:text-brand-400 shadow-xs'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Agricultural Helpline / Support */}
          <ListItem
            icon={<PhoneCall className="w-4 h-4 text-emerald-600" />}
            title="Kisan Call Center (KCC)"
            subtitle="Toll Free: 1800-180-1551 (6 AM - 10 PM)"
            right={<span className="text-xs font-bold text-brand-600 dark:text-brand-400">Call Now</span>}
            onPress={() => window.open('tel:18001801551')}
          />

          {/* About Krushi Sathi */}
          <ListItem
            icon={<Shield className="w-4 h-4 text-blue-600" />}
            title="Krushi Sathi"
            subtitle="Version 2.0 • ICAR Agricultural Advisor"
            divider={false}
          />
        </div>
      </div>

      {/* Logout Action */}
      <div className="pt-2">
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full flex items-center justify-center gap-2 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50 text-red-700 dark:text-red-400 font-bold py-3.5 px-4 rounded-2xl transition border border-red-200 dark:border-red-900/40 cursor-pointer min-h-[48px]"
        >
          <LogOut className="w-4 h-4" />
          <span>{t('logout')}</span>
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        title="Log out of Krushi Sathi?"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            You can log back in at any time with your registered mobile number. Your field assessments and crop plans will remain safely saved.
          </p>
          <div className="flex gap-2 justify-end pt-2">
            <Button
              variant="secondary"
              onClick={() => setShowLogoutConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleLogout}
            >
              Log Out
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};