import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Navigation, Loader2, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import {
  INDIAN_STATES,
  IndianState,
  matchState,
  matchDistrict,
} from '../../data/indianLocations';

interface LocationEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationUpdated?: (state: string, district: string, lat?: number, lon?: number) => void;
}

export const LocationEditModal: React.FC<LocationEditModalProps> = ({
  isOpen,
  onClose,
  onLocationUpdated,
}) => {
  const { user, updateUser } = useAuth();
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [state, setState] = useState(user?.state || 'Karnataka');
  const [district, setDistrict] = useState(user?.district || '');
  const [village, setVillage] = useState(user?.village || '');
  const [latitude, setLatitude] = useState<number | null>(user?.latitude || null);
  const [longitude, setLongitude] = useState<number | null>(user?.longitude || null);
  const [locationSource, setLocationSource] = useState<string>(user?.locationSource || 'manual');

  const [isDetecting, setIsDetecting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setState(user?.state || 'Karnataka');
      setDistrict(user?.district || '');
      setVillage(user?.village || '');
      setLatitude(user?.latitude || null);
      setLongitude(user?.longitude || null);
      setLocationSource(user?.locationSource || 'manual');
      setError(null);
    }
  }, [isOpen, user]);

  const selectedStateObj: IndianState =
    INDIAN_STATES.find((s) => s.name === state) || INDIAN_STATES[0];

  const handleDetectGPS = () => {
    if (!window.isSecureContext && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      setError('GPS requires a secure HTTPS connection. Please select your state and district manually.');
      return;
    }

    if (!navigator.geolocation) {
      setError(t('locationUnavailable') || 'Geolocation is not supported on this device. Please select manually.');
      return;
    }

    setIsDetecting(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const acc = pos.coords.accuracy;

          const geo = await api.location.reverseGeocode(lat, lon, acc);
          const matchedSt = matchState(geo.state || '') || selectedStateObj;
          const matchedDist = matchDistrict(geo.district || geo.town || '', matchedSt);

          setState(matchedSt.name);
          setDistrict(matchedDist ? matchedDist.district : '');
          if (geo.village || geo.town) {
            setVillage(geo.village || geo.town || '');
          }
          setLatitude(lat);
          setLongitude(lon);
          setLocationSource('gps');
          showToast(
            t('locationDetectedChip', {
              location: geo.village || matchedDist?.district || matchedSt.name,
            }),
            'success'
          );
        } catch {
          setError(t('locationUnavailable') || 'Unable to resolve address from GPS. Please select your district manually.');
        } finally {
          setIsDetecting(false);
        }
      },
      (geoErr) => {
        setIsDetecting(false);
        if (geoErr.code === 1) {
          setError(t('locationPermissionDenied') || 'Location permission denied. Please allow location access in your browser settings or select manually.');
        } else if (geoErr.code === 2) {
          setError('GPS location unavailable. Please ensure device location is switched on.');
        } else {
          setError('Location request timed out. Please try again or select manually.');
        }
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!district) {
      setError(t('selectDistrictPlaceholder'));
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const updated = await api.auth.updateProfile({
        state,
        district,
        village: village || undefined,
        latitude: latitude || undefined,
        longitude: longitude || undefined,
        locationSource,
      });

      updateUser(updated);
      if (onLocationUpdated) {
        onLocationUpdated(state, district, latitude || undefined, longitude || undefined);
      } else {
        showToast(t('toastSaved'), 'success');
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to update location');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-md bg-white rounded-3xl p-6 shadow-xl border border-forest/20 space-y-4 relative"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-mint-light text-forest flex items-center justify-center shadow-xs">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-gray-900">
                  {t('editLocationTitle') || 'Change Farm Location'}
                </h3>
                <p className="text-xs text-gray-600 font-medium">
                  {t('locationWhyNeeded')}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* GPS Quick Action */}
          <button
            type="button"
            onClick={handleDetectGPS}
            disabled={isDetecting}
            className="w-full py-2.5 px-3.5 rounded-2xl bg-mint-light hover:bg-forest hover:text-white text-forest text-xs font-bold transition flex items-center justify-center gap-2 border border-forest/20 min-h-[44px] cursor-pointer disabled:opacity-60"
          >
            {isDetecting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t('detectingLocation')}</span>
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4" />
                <span>{t('detectMyLocation')}</span>
              </>
            )}
          </button>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-3 pt-1">
            {/* State Select */}
            <div>
              <label htmlFor="location-edit-state" className="block text-xs font-bold text-gray-800 mb-1">
                {t('state')} *
              </label>
              <select
                id="location-edit-state"
                value={state}
                onChange={(e) => {
                  const newSt = e.target.value;
                  setState(newSt);
                  const stObj = INDIAN_STATES.find((s) => s.name === newSt);
                  if (stObj && !stObj.districts.includes(district)) {
                    setDistrict(stObj.districts[0] || '');
                  }
                  setLatitude(null);
                  setLongitude(null);
                  setLocationSource('manual');
                }}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-900 focus:border-forest outline-none bg-white min-h-[46px]"
              >
                {INDIAN_STATES.map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* District Select */}
            <div>
              <label htmlFor="location-edit-district" className="block text-xs font-bold text-gray-800 mb-1">
                {t('district')} *
              </label>
              <select
                id="location-edit-district"
                required
                value={district}
                onChange={(e) => {
                  setDistrict(e.target.value);
                  setLatitude(null);
                  setLongitude(null);
                  setLocationSource('manual');
                }}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-900 focus:border-forest outline-none bg-white min-h-[46px]"
              >
                <option value="">{t('selectDistrictPlaceholder')}</option>
                {selectedStateObj.districts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Village (Optional) */}
            <div>
              <label htmlFor="location-edit-village" className="block text-xs font-bold text-gray-800 mb-1">
                {t('village')} (Optional)
              </label>
              <input
                id="location-edit-village"
                type="text"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                placeholder="e.g. Koppa"
                className="w-full px-3.5 py-2.5 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-900 focus:border-forest outline-none bg-white min-h-[46px]"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs transition min-h-[48px] cursor-pointer"
              >
                {t('navCancel')}
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 py-3 px-4 rounded-2xl bg-forest hover:bg-forest-dark text-white font-bold text-xs transition shadow-md shadow-forest/20 flex items-center justify-center gap-1.5 min-h-[48px] cursor-pointer disabled:opacity-60"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{t('saveLocation') || 'Update Location'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
};
