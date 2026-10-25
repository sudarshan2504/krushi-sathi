import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  User,
  MapPin,
  Globe,
  Navigation,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Shield,
  Sparkles,
  ChevronDown,
  Info,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import { LanguageCode } from '../i18n';
import { api } from '../services/api';
import {
  INDIAN_STATES,
  IndianState,
  matchState,
  matchDistrict,
} from '../data/indianLocations';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuth();
  const { language, setLanguage, languages, t } = useTranslation();

  const prefilledPhone = (location.state as any)?.phone || '';

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: prefilledPhone || '',
    language: language || 'en',
    state: 'Karnataka',
    district: '',
    village: '',
    taluk: '',
    farmSize: 2.0,
    farmUnit: 'Acres',
    latitude: null as number | null,
    longitude: null as number | null,
    locationAccuracy: null as number | null,
    locationSource: 'manual' as 'gps' | 'ip' | 'manual',
  });

  // Location Detection State
  const [isDetecting, setIsDetecting] = useState(false);
  const [locationStatus, setLocationStatus] = useState<
    'idle' | 'detecting' | 'gps_success' | 'ip_success' | 'permission_denied' | 'fallback_ip' | 'insecure_context' | 'failed'
  >('idle');
  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  const [detectedChip, setDetectedChip] = useState<string | null>(null);
  const [districtWarning, setDistrictWarning] = useState<string | null>(null);

  // Language Suggestion State
  const [languageSuggestion, setLanguageSuggestion] = useState<{
    stateName: string;
    langCode: LanguageCode;
    langName: string;
  } | null>(null);

  // Form submission state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Target ref for editing location
  const stateSelectRef = useRef<HTMLSelectElement>(null);

  // Current selected state object from dataset
  const currentStateObj: IndianState =
    INDIAN_STATES.find((s) => s.name === formData.state) || INDIAN_STATES[0];

  // Language prompt check helper
  const checkLanguageSuggestion = (detectedState: IndianState) => {
    if (
      detectedState.defaultLanguage &&
      detectedState.defaultLanguage !== formData.language &&
      detectedState.defaultLanguage !== 'en'
    ) {
      const targetLang = languages.find((l) => l.code === detectedState.defaultLanguage);
      if (targetLang) {
        setLanguageSuggestion({
          stateName: detectedState.name,
          langCode: detectedState.defaultLanguage,
          langName: `${targetLang.nativeLabel} (${targetLang.label})`,
        });
      }
    }
  };

  // IP fallback helper
  const tryIpFallback = async () => {
    try {
      const ipLoc = await api.location.getIpLocation();
      if (ipLoc && (ipLoc.state || ipLoc.district)) {
        const matchedState = matchState(ipLoc.state || '') || currentStateObj;
        const matchedDist = matchDistrict(ipLoc.district || ipLoc.town || '', matchedState);

        setFormData((prev) => ({
          ...prev,
          state: matchedState.name,
          district: matchedDist?.district || prev.district,
          village: prev.village || ipLoc.village || '',
          latitude: ipLoc.latitude,
          longitude: ipLoc.longitude,
          locationSource: 'ip',
        }));

        setDetectedChip(
          ipLoc.village
            ? `${ipLoc.village}, ${matchedDist?.district || matchedState.name}`
            : `${matchedDist?.district || matchedState.name}, ${matchedState.name}`
        );
        setLocationStatus('ip_success');
        checkLanguageSuggestion(matchedState);
        return true;
      }
    } catch {
      // IP fallback also failed
    }
    return false;
  };

  // Main location detection function
  const detectLocation = async () => {
    setError(null);
    setDistrictWarning(null);
    setIsDetecting(true);
    setLocationStatus('detecting');
    setLocationMessage(null);

    // 1. Check for Secure Context (HTTPS or localhost)
    const isSecure =
      window.isSecureContext ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';

    if (!isSecure) {
      setLocationStatus('insecure_context');
      setLocationMessage(t('locationInsecureContext'));
      await tryIpFallback();
      setIsDetecting(false);
      return;
    }

    // 2. Check if browser supports Geolocation API
    if (!navigator.geolocation) {
      setLocationStatus('failed');
      setLocationMessage(t('locationUnavailable'));
      await tryIpFallback();
      setIsDetecting(false);
      return;
    }

    // 3. Request high accuracy GPS with 10s timeout
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const accuracy = pos.coords.accuracy;

          const geo = await api.location.reverseGeocode(lat, lon, accuracy);

          // Check if outside India
          if (
            geo.country &&
            !geo.country.toLowerCase().includes('india') &&
            geo.country !== 'IN' &&
            !geo.state
          ) {
            setLocationStatus('failed');
            setLocationMessage(t('locationOutsideIndia'));
            setIsDetecting(false);
            return;
          }

          // Match state to Indian states dataset
          const matchedState = matchState(geo.state || '') || currentStateObj;

          // Match district within state
          const distResult = matchDistrict(geo.district || geo.town || '', matchedState);

          setFormData((prev) => ({
            ...prev,
            state: matchedState.name,
            district: distResult ? distResult.district : prev.district,
            village: geo.village || geo.town || prev.village,
            taluk: geo.taluk || prev.taluk,
            latitude: lat,
            longitude: lon,
            locationAccuracy: accuracy,
            locationSource: 'gps',
          }));

          if (!distResult) {
            setDistrictWarning(t('locationNoDistrictMatch'));
          }

          const chipText = geo.village
            ? `${geo.village}, ${distResult?.district || matchedState.name}`
            : `${distResult?.district || matchedState.name}, ${matchedState.name}`;

          setDetectedChip(chipText);
          setLocationStatus('gps_success');

          // Language suggestion prompt
          checkLanguageSuggestion(matchedState);
        } catch {
          // If reverse geocode fails, try IP fallback
          const ipOk = await tryIpFallback();
          if (!ipOk) {
            setLocationStatus('failed');
            setLocationMessage(t('locationUnavailable'));
          }
        } finally {
          setIsDetecting(false);
        }
      },
      async (err) => {
        if (err.code === 1) {
          // PERMISSION_DENIED
          setLocationStatus('permission_denied');
          setLocationMessage(t('locationPermissionDenied'));
        } else {
          // POSITION_UNAVAILABLE or TIMEOUT
          setLocationStatus('fallback_ip');
          setLocationMessage(t('locationUnavailable'));
        }

        // Automatic fallback to approximate IP location
        const ipSuccess = await tryIpFallback();
        if (!ipSuccess && err.code !== 1) {
          setLocationStatus('failed');
        }
        setIsDetecting(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  // Auto-detect on page load (non-blocking)
  useEffect(() => {
    detectLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle manual state change
  const handleStateChange = (newState: string) => {
    const stateObj = INDIAN_STATES.find((s) => s.name === newState);
    setFormData((prev) => ({
      ...prev,
      state: newState,
      // Reset district if not part of new state
      district: stateObj && stateObj.districts.includes(prev.district) ? prev.district : '',
      locationSource: 'manual',
    }));
    setDistrictWarning(null);
  };

  // Accept language suggestion
  const acceptLanguageSuggestion = () => {
    if (languageSuggestion) {
      setLanguage(languageSuggestion.langCode);
      setFormData((prev) => ({ ...prev, language: languageSuggestion.langCode }));
      setLanguageSuggestion(null);
    }
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.state || !formData.district) {
      setError(t('locationNoDistrictMatch'));
      return;
    }

    setIsLoading(true);

    try {
      await register({
        name: formData.name,
        phone: formData.phone,
        language: formData.language,
        state: formData.state,
        district: formData.district,
        village: formData.village || undefined,
        taluk: formData.taluk || undefined,
        farmSize: formData.farmSize,
        farmUnit: formData.farmUnit,
        latitude: formData.latitude,
        longitude: formData.longitude,
        locationAccuracy: formData.locationAccuracy,
        locationSource: formData.locationSource,
      });

      setLanguage(formData.language as LanguageCode);
      navigate('/home');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream via-white to-mint-light flex flex-col justify-between p-4 sm:p-6 max-w-lg mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-2 text-center"
      >
        <Link to="/" className="inline-block group focus:outline-none mb-1">
          <img
            src="/krushi-sathi-logo.png"
            alt="Krushi Sathi Logo"
            className="h-16 sm:h-20 w-auto object-contain mx-auto drop-shadow-sm transition-transform group-hover:scale-105"
          />
        </Link>
        <h1 className="text-2xl font-extrabold text-dark-text">{t('createAccount')}</h1>
        <p className="text-xs text-dark-muted font-medium">
          {t('joinKrishiSathi')} — No password or Gmail needed
        </p>
      </motion.div>

      {/* Main Form Card */}
      <motion.form
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        className="space-y-3.5 my-auto py-3"
      >
        {/* Error Banner */}
        {error && (
          <div
            role="alert"
            aria-live="assertive"
            className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-700 font-medium flex items-start gap-2 shadow-sm"
          >
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. LOCATION DETECTION & PRIVACY INTRO CARD */}
        <div className="p-3.5 rounded-2xl bg-white border border-forest/15 shadow-sm space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2">
              <span className="p-1.5 rounded-xl bg-mint-light text-forest mt-0.5">
                <Navigation className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-xs font-bold text-dark-text leading-tight">
                  {t('location')}
                </h3>
                <p className="text-[11px] text-dark-muted leading-snug mt-0.5">
                  {t('locationWhyNeeded')}
                </p>
              </div>
            </div>

            {/* Detect my location button */}
            <button
              type="button"
              onClick={detectLocation}
              disabled={isDetecting}
              className="shrink-0 px-3 py-1.5 rounded-xl bg-forest/10 hover:bg-forest hover:text-white text-forest text-xs font-bold transition-all flex items-center gap-1.5 min-h-[36px] active:scale-95 disabled:opacity-50 cursor-pointer"
              title={t('detectMyLocation')}
            >
              {isDetecting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span className="hidden sm:inline">{t('detectingLocation')}</span>
                </>
              ) : (
                <>
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{t('detectMyLocation')}</span>
                </>
              )}
            </button>
          </div>

          {/* Detecting Progress Indicator */}
          {isDetecting && (
            <div className="flex items-center gap-2 p-2 rounded-xl bg-mint-light/60 text-xs font-semibold text-forest">
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              <span>{t('detectingLocation')}</span>
            </div>
          )}

          {/* Location Success Confirmation Chip */}
          <AnimatePresence>
            {detectedChip && !isDetecting && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-gradient-to-r from-mint-light/80 to-cream border border-forest/20 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <CheckCircle2 className="w-4 h-4 text-forest shrink-0" />
                  <div className="truncate">
                    <span className="font-semibold text-dark-text">
                      {t('locationDetectedChip', { location: detectedChip })}
                    </span>
                    <span
                      className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                        locationStatus === 'gps_success'
                          ? 'bg-forest/15 text-forest'
                          : 'bg-harvest/30 text-dark-text'
                      }`}
                    >
                      {locationStatus === 'gps_success'
                        ? t('locationGpsBadge')
                        : t('locationApproximateBadge')}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => stateSelectRef.current?.focus()}
                  className="text-xs font-bold text-forest underline shrink-0 hover:text-forest-dark"
                >
                  {t('locationEditBtn')}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Fallback / Permission Denied Message Banner */}
          {locationMessage && !isDetecting && (
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-start gap-1.5 leading-snug">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{locationMessage}</span>
            </div>
          )}

          {/* Privacy Note */}
          <div className="flex items-center gap-1.5 pt-1 text-[10px] text-dark-muted">
            <Shield className="w-3.5 h-3.5 text-forest shrink-0" />
            <span>{t('locationPrivacyNote')}</span>
          </div>
        </div>

        {/* 2. LANGUAGE SUGGESTION BANNER */}
        <AnimatePresence>
          {languageSuggestion && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 rounded-2xl bg-gradient-to-r from-cream via-white to-mint-light border border-forest/30 shadow-sm space-y-2"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-forest" />
                <h4 className="text-xs font-bold text-dark-text">
                  {t('languageSuggestionTitle')}
                </h4>
              </div>
              <p className="text-xs text-dark-text">
                {t('languageSuggestionPrompt', {
                  state: languageSuggestion.stateName,
                  langName: languageSuggestion.langName,
                })}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={acceptLanguageSuggestion}
                  className="px-3 py-1.5 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest-dark shadow-xs min-h-[36px]"
                >
                  {t('languageSuggestionSwitch', { langName: languageSuggestion.langName })}
                </button>
                <button
                  type="button"
                  onClick={() => setLanguageSuggestion(null)}
                  className="px-3 py-1.5 rounded-xl bg-gray-100 text-dark-muted text-xs font-bold hover:bg-gray-200 min-h-[36px]"
                >
                  {t('languageSuggestionKeep', {
                    currentLang: languages.find((l) => l.code === formData.language)?.nativeLabel || 'English',
                  })}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Full Name */}
        <div>
          <label className="block text-sm font-bold text-dark-text mb-1">
            {t('fullName')} *
          </label>
          <div className="relative flex items-center">
            <User className="absolute left-3.5 w-4 h-4 text-forest" />
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t('namePlaceholder')}
              className="w-full pl-10 pr-4 py-3 min-h-[48px] rounded-2xl bg-white border border-gray-200 focus:border-forest outline-none text-sm font-semibold"
            />
          </div>
        </div>

        {/* Mobile Number */}
        <div>
          <label className="block text-sm font-bold text-dark-text mb-1">
            {t('phoneNumber')} *
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3 flex items-center gap-1 text-sm font-bold text-dark-muted border-r border-gray-200 pr-2">
              <Phone className="w-3.5 h-3.5 text-forest" />
              <span>+91</span>
            </div>
            <input
              type="tel"
              required
              maxLength={10}
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })
              }
              placeholder="98765 43210"
              className="w-full pl-20 pr-4 py-3 min-h-[48px] rounded-2xl bg-white border border-gray-200 focus:border-forest outline-none text-sm font-bold tracking-wide"
            />
          </div>
        </div>

        {/* Preferred Language */}
        <div>
          <label className="block text-sm font-bold text-dark-text mb-1">
            {t('chooseLanguage')}
          </label>
          <div className="relative flex items-center">
            <Globe className="absolute left-3.5 w-4 h-4 text-forest pointer-events-none" />
            <select
              value={formData.language}
              onChange={(e) =>
                setFormData({ ...formData, language: e.target.value as LanguageCode })
              }
              className="w-full pl-10 pr-8 py-3 min-h-[48px] rounded-2xl bg-white border border-gray-200 focus:border-forest outline-none text-sm font-semibold appearance-none"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.nativeLabel} ({l.label})
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3.5 w-4 h-4 text-dark-muted pointer-events-none" />
          </div>
        </div>

        {/* State & District Dropdowns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* State Dropdown */}
          <div>
            <label className="block text-sm font-bold text-dark-text mb-1">
              {t('state')} *
            </label>
            <div className="relative flex items-center">
              <select
                ref={stateSelectRef}
                required
                value={formData.state}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full pl-3.5 pr-8 py-2.5 min-h-[48px] rounded-2xl bg-white border border-gray-200 focus:border-forest outline-none text-sm font-semibold appearance-none"
              >
                {INDIAN_STATES.map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 w-4 h-4 text-dark-muted pointer-events-none" />
            </div>
          </div>

          {/* District Dropdown (depends on selected State) */}
          <div>
            <label className="block text-sm font-bold text-dark-text mb-1">
              {t('district')} *
            </label>
            <div className="relative flex items-center">
              <select
                required
                value={formData.district}
                onChange={(e) => {
                  setFormData({ ...formData, district: e.target.value, locationSource: 'manual' });
                  setDistrictWarning(null);
                }}
                className={`w-full pl-3.5 pr-8 py-2.5 min-h-[48px] rounded-2xl bg-white border outline-none text-sm font-semibold appearance-none ${
                  districtWarning
                    ? 'border-amber-400 focus:border-amber-500 bg-amber-50/30'
                    : 'border-gray-200 focus:border-forest'
                }`}
              >
                <option value="">{t('selectDistrictPlaceholder')}</option>
                {currentStateObj.districts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 w-4 h-4 text-dark-muted pointer-events-none" />
            </div>
          </div>
        </div>

        {/* District Warning if name didn't match cleanly */}
        {districtWarning && (
          <p className="text-xs text-amber-700 font-medium px-1 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>{districtWarning}</span>
          </p>
        )}

        {/* Village / Town (Optional) */}
        <div>
          <label className="block text-sm font-bold text-dark-text mb-1">
            {t('village')} <span className="text-dark-muted font-normal">(Optional)</span>
          </label>
          <div className="relative flex items-center">
            <MapPin className="absolute left-3 w-4 h-4 text-forest" />
            <input
              type="text"
              value={formData.village}
              onChange={(e) => setFormData({ ...formData, village: e.target.value })}
              placeholder="e.g. Koppa (Hobli)"
              className="w-full pl-9 pr-3 py-2.5 min-h-[48px] rounded-2xl bg-white border border-gray-200 focus:border-forest outline-none text-sm font-semibold"
            />
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          size="lg"
          fullWidth
          isLoading={isLoading}
          className="shadow-xl shadow-forest/20 mt-3"
        >
          <span>{t('createAccount')}</span>
        </Button>
      </motion.form>

      {/* Footer Navigation to Login */}
      <div className="text-center pb-4 text-sm">
        <span className="text-dark-muted">{t('alreadyHaveAccount')} </span>
        <Link
          to="/login"
          className="text-forest font-bold underline ml-1 min-h-[48px] inline-flex items-center px-1"
        >
          {t('welcomeBack')}
        </Link>
      </div>
    </div>
  );
};

export default RegisterPage;
