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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import { UserAvatar } from '../components/ui/UserAvatar';
import { api } from '../services/api';
import {
  LAND_UNIT_OPTIONS,
  getLandConversionSummary,
  getLocalizedUnitLabel,
} from '../utils/landUnits';

export const ProfilePage: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const { currentLanguageOption, language, t } = useTranslation();
  const navigate = useNavigate();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [village, setVillage] = useState(user?.village || '');
  const [district, setDistrict] = useState(user?.district || '');
  const [farmSize, setFarmSize] = useState<number | string>(user?.farmSize || 2.0);
  const [farmUnit, setFarmUnit] = useState(user?.farmUnit || 'Acres');

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
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
        village,
        district,
        farmSize: typeof farmSize === 'string' ? parseFloat(farmSize) : farmSize,
        farmUnit,
      });
      updateUser(updated);
      setIsEditing(false);
      showToast('Profile details updated successfully!');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const conversionHint = getLandConversionSummary(farmSize, farmUnit, language);

  return (
    <div className="max-w-2xl mx-auto space-y-4 py-2">
      {/* Toast Notification */}
      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="p-3 rounded-2xl bg-forest text-white text-xs font-bold flex items-center gap-2 shadow-lg"
        >
          <Check className="w-4 h-4 text-mint flex-shrink-0" />
          <span>{toastMessage}</span>
        </motion.div>
      )}

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
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-card flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
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
            className="absolute bottom-0 right-0 p-2 rounded-full bg-forest hover:bg-forest-dark text-white shadow-md border-2 border-white transition-transform active:scale-95 disabled:opacity-50"
            title="Upload photo"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="text-xl font-black text-dark-text">{user?.name || 'Farmer'}</h1>
              <p className="text-xs text-dark-muted flex items-center justify-center sm:justify-start gap-1 mt-0.5">
                <Phone className="w-3.5 h-3.5" />
                <span>{user?.phone || 'No phone registered'}</span>
              </p>
              <p className="text-xs text-dark-muted flex items-center justify-center sm:justify-start gap-1 mt-0.5">
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
                  setVillage(user?.village || '');
                  setDistrict(user?.district || '');
                  setFarmSize(user?.farmSize || 2.0);
                  setFarmUnit(user?.farmUnit || 'Acres');
                  setIsEditing(!isEditing);
                }}
                className="py-1.5 px-3.5 rounded-xl border border-gray-200 text-xs font-bold text-dark-text hover:bg-gray-50 flex items-center gap-1.5 transition"
              >
                <Edit2 className="w-3.5 h-3.5 text-forest" />
                <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
              </button>

              {user?.avatar && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  disabled={isUploading}
                  className="py-1.5 px-2.5 rounded-xl border border-red-200 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-1 transition disabled:opacity-50"
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
          className="bg-white rounded-3xl p-5 border border-forest/30 shadow-card space-y-4"
        >
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h2 className="text-sm font-extrabold text-forest">Edit Farmer Information</h2>
            <span className="text-[11px] text-dark-muted">Saved to your personal account</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-dark-text mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold focus:border-forest outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-dark-text mb-1">Village / Town</label>
              <input
                type="text"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                placeholder="e.g. Koppa"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold focus:border-forest outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-dark-text mb-1">District</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="e.g. Mandya"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold focus:border-forest outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-dark-text mb-1">
                Land Size & Indian Measurement Unit
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={farmSize}
                  onChange={(e) => setFarmSize(e.target.value)}
                  className="w-24 px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold focus:border-forest outline-none"
                />
                <select
                  value={farmUnit}
                  onChange={(e) => setFarmUnit(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold focus:border-forest outline-none bg-white"
                >
                  {LAND_UNIT_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {language === 'kn' ? opt.labelKn : language === 'ta' ? opt.labelTa : language === 'te' ? opt.labelTe : opt.labelEn}
                    </option>
                  ))}
                </select>
              </div>
              {conversionHint && (
                <p className="text-[10px] text-forest font-semibold mt-1">
                  📐 {conversionHint}
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
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-card space-y-3">
        <h2 className="text-sm font-bold text-dark-text flex items-center gap-2">
          <Sprout className="w-4 h-4 text-forest" />
          <span>Farm Profile & Landholdings</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-cream-light p-3.5 rounded-2xl border border-gray-100">
            <span className="text-dark-muted block mb-0.5">Total Land Size</span>
            <div className="flex items-baseline gap-2">
              <span className="font-extrabold text-dark-text text-base">
                {user?.farmSize ? `${user.farmSize} ${getLocalizedUnitLabel(user.farmUnit || 'Acres', language)}` : '2 Acres'}
              </span>
            </div>
            {conversionHint && (
              <span className="text-[10px] text-forest font-bold block mt-0.5">
                {conversionHint}
              </span>
            )}
          </div>
          <div className="bg-cream-light p-3.5 rounded-2xl border border-gray-100">
            <span className="text-dark-muted block mb-0.5">Registered Location</span>
            <span className="font-extrabold text-dark-text text-base capitalize block">
              {user?.district ? `${user.district}, ${user.state || 'Karnataka'}` : 'Karnataka'}
            </span>
            <span className="text-[10px] text-dark-muted block mt-0.5">
              Region: {user?.village ? `${user.village} Hobli` : 'South Karnataka Agro-Climatic Zone'}
            </span>
          </div>
        </div>
      </div>

      {/* Language Setting */}
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-card flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-mint flex items-center justify-center text-forest">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-dark-text">{t('chooseLanguage')}</h3>
            <p className="text-xs text-dark-muted">
              {currentLanguageOption.nativeLabel} ({currentLanguageOption.label})
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/language')}
          className="text-xs font-bold text-forest bg-mint hover:bg-forest hover:text-white px-3.5 py-2 rounded-xl transition"
        >
          Change
        </button>
      </div>

      {/* Logout Button */}
      <div className="pt-2">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold py-3.5 px-4 rounded-2xl transition border border-red-200"
        >
          <LogOut className="w-4 h-4" />
          <span>{t('logout')}</span>
        </button>
      </div>
    </div>
  );
};