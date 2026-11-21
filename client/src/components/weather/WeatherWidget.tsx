import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  CloudSun,
  Sun,
  CloudRain,
  CloudLightning,
  MapPin,
  RefreshCw,
  AlertTriangle,
  Droplets,
  Wind,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { api } from '../../services/api';
import { WeatherData } from '../../types';
import { useTranslation } from '../../context/LanguageContext';
import { AnimatedCounter } from '../ui/AnimatedCounter';
import { LoadingState } from '../ui/LoadingState';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

export interface ManualWeatherLocation {
  state?: string;
  district?: string;
  lat?: number;
  lon?: number;
  updatedAt: number;
}

export interface WeatherWidgetProps {
  initialDistrict?: string;
  manualLocation?: ManualWeatherLocation | null;
  onDistrictChange?: (district: string) => void;
  onWeatherDataLoaded?: (data: WeatherData) => void;
  onChangeLocationClick?: () => void;
}

const SAVED_COORDS_KEY = 'krushi_sathi_last_weather_coords';
const SAVED_DISTRICT_KEY = 'krushi_sathi_last_weather_district';

const clientWeatherCache = new Map<string, { data: WeatherData; timestamp: number }>();
const CLIENT_CACHE_TTL_MS = 20 * 60 * 1000;

export function clearWeatherWidgetCache(): void {
  clientWeatherCache.clear();
}

function getDefaultForecastDays() {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  return Array.from({ length: 5 }, (_, idx) => {
    const d = new Date(today);
    d.setDate(today.getDate() + idx);
    return {
      dayName: idx === 0 ? 'Today' : dayNames[d.getDay()],
      icon: 'cloud-sun',
      tempMax: 28,
      tempMin: 20,
      rainChance: 20,
    };
  });
}

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  initialDistrict,
  manualLocation,
  onDistrictChange,
  onWeatherDataLoaded,
  onChangeLocationClick,
}) => {
  const { language } = useTranslation();
  const shouldReduceMotion = useReducedMotion();

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [fallbackHint, setFallbackHint] = useState<'registered' | 'saved' | null>(null);
  const [needsLocationSetup, setNeedsLocationSetup] = useState(false);
  const [insecureLanNotice, setInsecureLanNotice] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<'gps' | 'district'>('gps');
  const [selectedDistrict, setSelectedDistrict] = useState((initialDistrict || '').trim());

  const hasLiveGpsRef = useRef(false);
  const lastManualUpdateRef = useRef<number | null>(null);
  const initialDistrictRef = useRef((initialDistrict || '').trim());
  const prevInitialDistrictRef = useRef((initialDistrict || '').trim());

  useEffect(() => {
    initialDistrictRef.current = (initialDistrict || '').trim();
  }, [initialDistrict]);

  const persistCoords = useCallback((lat: number, lon: number, district?: string) => {
    try {
      localStorage.setItem(SAVED_COORDS_KEY, JSON.stringify({ lat, lon, timestamp: Date.now() }));
      if (district) {
        localStorage.setItem(SAVED_DISTRICT_KEY, district);
      }
    } catch {
      // ignore localStorage quota errors
    }
  }, []);

  const persistDistrict = useCallback((district: string) => {
    if (!district) return;
    try {
      localStorage.setItem(SAVED_DISTRICT_KEY, district);
    } catch {
      // ignore localStorage quota errors
    }
  }, []);

  // Load weather using GPS coordinates
  const loadWeatherByCoords = useCallback(
    async (lat: number, lon: number, force = false, clearFallback = false) => {
      const cacheKey = `gps_${lat.toFixed(2)}_${lon.toFixed(2)}`;
      const cached = clientWeatherCache.get(cacheKey);
      const now = Date.now();

      if (!force && cached && now - cached.timestamp < CLIENT_CACHE_TTL_MS) {
        setWeather(cached.data);
        setIsLoading(false);
        setNeedsLocationSetup(false);
        setError(null);
        if (clearFallback) setFallbackHint(null);
        if (onWeatherDataLoaded) onWeatherDataLoaded(cached.data);
        return cached.data;
      }

      setIsLoading(true);
      setError(null);
      try {
        const data = await api.weather.get(undefined, lat, lon);
        if (!data.isDemoFallback && !data.isStale) {
          clientWeatherCache.set(cacheKey, { data, timestamp: Date.now() });
        }
        persistCoords(lat, lon, data.district);
        setWeather(data);
        setNeedsLocationSetup(false);
        if (clearFallback) setFallbackHint(null);
        setActiveMode('gps');
        if (onWeatherDataLoaded) onWeatherDataLoaded(data);
        return data;
      } catch (err: any) {
        console.error('[WeatherWidget] Error loading weather by coords:', err);
        if (cached) {
          setWeather({ ...cached.data, isStale: true });
          setNeedsLocationSetup(false);
        } else {
          setError(err?.message || 'Unable to load weather for current location.');
        }
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [onWeatherDataLoaded, persistCoords]
  );

  // Load weather using district name
  const loadWeatherByDistrict = useCallback(
    async (targetDistrict: string, force = false, clearFallback = false) => {
      const cleanedDistrict = targetDistrict.trim();
      if (!cleanedDistrict) {
        setNeedsLocationSetup(true);
        setIsLoading(false);
        return null;
      }

      const cacheKey = `dist_${cleanedDistrict.toLowerCase()}`;
      const cached = clientWeatherCache.get(cacheKey);
      const now = Date.now();

      if (!force && cached && now - cached.timestamp < CLIENT_CACHE_TTL_MS) {
        setWeather(cached.data);
        setIsLoading(false);
        setNeedsLocationSetup(false);
        setError(null);
        if (clearFallback) setFallbackHint(null);
        if (onWeatherDataLoaded) onWeatherDataLoaded(cached.data);
        return cached.data;
      }

      setIsLoading(true);
      setError(null);
      try {
        const data = await api.weather.get(cleanedDistrict);
        if (!data.isDemoFallback && !data.isStale) {
          clientWeatherCache.set(cacheKey, { data, timestamp: Date.now() });
        }
        persistDistrict(cleanedDistrict);
        setWeather(data);
        setNeedsLocationSetup(false);
        if (clearFallback) setFallbackHint(null);
        setActiveMode('district');
        if (onDistrictChange) onDistrictChange(cleanedDistrict);
        if (onWeatherDataLoaded) onWeatherDataLoaded(data);
        return data;
      } catch (err: any) {
        console.error('[WeatherWidget] Error loading weather by district:', err);
        if (cached) {
          setWeather({ ...cached.data, isStale: true });
          setNeedsLocationSetup(false);
        } else {
          setError(err?.message || `Unable to load weather for ${cleanedDistrict}.`);
        }
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [onDistrictChange, onWeatherDataLoaded, persistDistrict]
  );

  // Fallback priority:
  // 1) Profile registered district -> hint "registered"
  // 2) Last saved coords / district in localStorage -> hint "saved"
  // 3) Never fabricate Mandya; prompt user to grant GPS or pick location
  const fallbackToRegistered = useCallback(
    (_reason: string) => {
      hasLiveGpsRef.current = false;

      const profileDistrict = (initialDistrictRef.current || '').trim();
      if (profileDistrict) {
        setFallbackHint('registered');
        setNeedsLocationSetup(false);
        setActiveMode('district');
        setSelectedDistrict(profileDistrict);
        loadWeatherByDistrict(profileDistrict).catch(() => {});
        return;
      }

      let savedCoords: { lat: number; lon: number } | null = null;
      try {
        const rawCoords = localStorage.getItem(SAVED_COORDS_KEY);
        if (rawCoords) {
          const parsed = JSON.parse(rawCoords);
          if (
            typeof parsed?.lat === 'number' &&
            typeof parsed?.lon === 'number' &&
            isFinite(parsed.lat) &&
            isFinite(parsed.lon)
          ) {
            savedCoords = { lat: parsed.lat, lon: parsed.lon };
          }
        }
      } catch {
        // ignore invalid localStorage entry
      }

      if (savedCoords) {
        setFallbackHint('saved');
        setNeedsLocationSetup(false);
        setActiveMode('gps');
        setCurrentCoords(savedCoords);
        loadWeatherByCoords(savedCoords.lat, savedCoords.lon).catch(() => {});
        return;
      }

      const savedDistrict = (localStorage.getItem(SAVED_DISTRICT_KEY) || '').trim();
      if (savedDistrict) {
        setFallbackHint('saved');
        setNeedsLocationSetup(false);
        setActiveMode('district');
        setSelectedDistrict(savedDistrict);
        loadWeatherByDistrict(savedDistrict).catch(() => {});
        return;
      }

      setFallbackHint(null);
      setNeedsLocationSetup(true);
      setWeather(null);
      setError(null);
      setIsLoading(false);
    },
    [loadWeatherByCoords, loadWeatherByDistrict]
  );

  // Request user location via Capacitor Geolocation on native or navigator.geolocation on web
  const requestLocation = useCallback(
    (isRetry = false) => {
      setIsLoading(true);
      setError(null);
      setNeedsLocationSetup(false);

      if (Capacitor.isNativePlatform()) {
        (async () => {
          try {
            const status = await Geolocation.checkPermissions();
            if (status.location !== 'granted' && status.coarseLocation !== 'granted') {
              const req = await Geolocation.requestPermissions();
              if (req.location !== 'granted' && req.coarseLocation !== 'granted') {
                fallbackToRegistered('Location permission denied on device');
                return;
              }
            }
            const position = await Geolocation.getCurrentPosition({
              enableHighAccuracy: false,
              timeout: 8000,
              maximumAge: 60000,
            });
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            hasLiveGpsRef.current = true;
            setCurrentCoords({ lat, lon });
            setFallbackHint(null);
            setNeedsLocationSetup(false);
            setActiveMode('gps');
            persistCoords(lat, lon);
            loadWeatherByCoords(lat, lon, isRetry, true).catch(() => {});
          } catch (err: any) {
            console.warn('[WeatherWidget] Capacitor Geolocation error, falling back:', err);
            hasLiveGpsRef.current = false;
            fallbackToRegistered(err?.message || 'Capacitor Geolocation error');
          }
        })();
        return;
      }

      const isLocalhost =
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname === '0.0.0.0';

      if (!window.isSecureContext && !isLocalhost) {
        setInsecureLanNotice('Geolocation requires HTTPS when accessed over local network (LAN).');
        fallbackToRegistered('Insecure HTTP on local network');
        return;
      }

      setInsecureLanNotice(null);

      if (!navigator.geolocation) {
        fallbackToRegistered('Geolocation not supported by this browser');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          hasLiveGpsRef.current = true;
          setCurrentCoords({ lat, lon });
          setFallbackHint(null);
          setNeedsLocationSetup(false);
          setActiveMode('gps');
          persistCoords(lat, lon);
          loadWeatherByCoords(lat, lon, isRetry, true).catch(() => {});
        },
        (geoError) => {
          console.warn('[WeatherWidget] Geolocation denied/unavailable:', geoError.message);
          hasLiveGpsRef.current = false;
          fallbackToRegistered(geoError.message);
        },
        {
          enableHighAccuracy: false,
          timeout: 8000,
          maximumAge: 60000,
        }
      );
    },
    [fallbackToRegistered, loadWeatherByCoords, persistCoords]
  );

  // Initial load: ask for location once on mount with navigator.geolocation
  const requestLocationRef = useRef(requestLocation);
  useEffect(() => {
    requestLocationRef.current = requestLocation;
  }, [requestLocation]);

  useEffect(() => {
    requestLocationRef.current(false);
  }, []);

  // If profile district arrives asynchronously (and live GPS / manual location isn't active), apply it cleanly
  useEffect(() => {
    const cleaned = (initialDistrict || '').trim();
    if (cleaned === prevInitialDistrictRef.current) return;
    prevInitialDistrictRef.current = cleaned;

    if (!cleaned || hasLiveGpsRef.current || lastManualUpdateRef.current !== null) return;

    if (needsLocationSetup || fallbackHint !== null) {
      setFallbackHint('registered');
      setNeedsLocationSetup(false);
      setSelectedDistrict(cleaned);
      setActiveMode('district');
      loadWeatherByDistrict(cleaned).catch(() => {});
    }
  }, [initialDistrict, fallbackHint, needsLocationSetup, loadWeatherByDistrict]);

  // Apply explicit location update from the "Change" modal immediately
  useEffect(() => {
    if (!manualLocation || manualLocation.updatedAt === lastManualUpdateRef.current) return;
    lastManualUpdateRef.current = manualLocation.updatedAt;
    hasLiveGpsRef.current = false;
    setFallbackHint(null);
    setNeedsLocationSetup(false);

    if (manualLocation.lat !== undefined && manualLocation.lon !== undefined) {
      persistCoords(manualLocation.lat, manualLocation.lon, manualLocation.district);
      if (manualLocation.district) setSelectedDistrict(manualLocation.district);
      setCurrentCoords({ lat: manualLocation.lat, lon: manualLocation.lon });
      setActiveMode('gps');
      loadWeatherByCoords(manualLocation.lat, manualLocation.lon, true, true).catch(() => {});
    } else if (manualLocation.district) {
      const cleaned = manualLocation.district.trim();
      setSelectedDistrict(cleaned);
      setCurrentCoords(null);
      setActiveMode('district');
      try {
        localStorage.removeItem(SAVED_COORDS_KEY);
      } catch {
        // ignore storage errors
      }
      persistDistrict(cleaned);
      loadWeatherByDistrict(cleaned, true, true).catch(() => {});
    }
  }, [manualLocation, loadWeatherByCoords, loadWeatherByDistrict, persistCoords, persistDistrict]);

  // Foreground re-fetch & >5 km location change detection
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        if (activeMode === 'gps' && hasLiveGpsRef.current && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const newLat = pos.coords.latitude;
              const newLon = pos.coords.longitude;
              if (currentCoords) {
                const dist = getDistanceFromLatLonInKm(currentCoords.lat, currentCoords.lon, newLat, newLon);
                if (dist > 5) {
                  setCurrentCoords({ lat: newLat, lon: newLon });
                  persistCoords(newLat, newLon);
                  loadWeatherByCoords(newLat, newLon, true, true).catch(() => {});
                  return;
                }
              }
              loadWeatherByCoords(newLat, newLon, false, true).catch(() => {});
            },
            () => {
              if (currentCoords) {
                loadWeatherByCoords(currentCoords.lat, currentCoords.lon, false).catch(() => {});
              }
            },
            { enableHighAccuracy: false, timeout: 6000, maximumAge: 60000 }
          );
        } else if (activeMode === 'gps' && currentCoords) {
          loadWeatherByCoords(currentCoords.lat, currentCoords.lon, false).catch(() => {});
        } else if (activeMode === 'district' && selectedDistrict) {
          loadWeatherByDistrict(selectedDistrict, false).catch(() => {});
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [activeMode, currentCoords, selectedDistrict, loadWeatherByCoords, loadWeatherByDistrict, persistCoords]);

  // Watch position for > 5 km movement while active live GPS is enabled
  useEffect(() => {
    if (
      !navigator.geolocation ||
      typeof navigator.geolocation.watchPosition !== 'function' ||
      !hasLiveGpsRef.current ||
      fallbackHint !== null ||
      activeMode !== 'gps'
    ) {
      return;
    }
    const isLocalhost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';
    if (!window.isSecureContext && !isLocalhost) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const newLat = pos.coords.latitude;
        const newLon = pos.coords.longitude;
        if (currentCoords) {
          const dist = getDistanceFromLatLonInKm(currentCoords.lat, currentCoords.lon, newLat, newLon);
          if (dist > 5) {
            setCurrentCoords({ lat: newLat, lon: newLon });
            persistCoords(newLat, newLon);
            loadWeatherByCoords(newLat, newLon, true, true).catch(() => {});
          }
        }
      },
      () => {},
      { enableHighAccuracy: false, maximumAge: 180000 }
    );

    return () => {
      if (typeof navigator.geolocation?.clearWatch === 'function') {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [currentCoords, fallbackHint, activeMode, loadWeatherByCoords, persistCoords]);

  const handleManualRefresh = () => {
    if (activeMode === 'gps' && currentCoords) {
      loadWeatherByCoords(currentCoords.lat, currentCoords.lon, true).catch(() => {});
    } else if (activeMode === 'district' && selectedDistrict) {
      loadWeatherByDistrict(selectedDistrict, true).catch(() => {});
    } else {
      requestLocation(true);
    }
  };

  const getWeatherIcon = (iconName: string, className = 'w-5 h-5') => {
    switch (iconName) {
      case 'sun':
        return <Sun className={`${className} text-amber-500`} strokeWidth={2} />;
      case 'cloud-rain':
      case 'cloud-drizzle':
        return <CloudRain className={`${className} text-blue-500`} strokeWidth={2} />;
      case 'cloud-lightning':
      case 'cloud-lightning-rain':
        return <CloudLightning className={`${className} text-amber-600`} strokeWidth={2} />;
      case 'cloud-sun':
      default:
        return <CloudSun className={`${className} text-amber-400`} strokeWidth={2} />;
    }
  };

  const getAlertText = () => {
    if (!weather) return '';
    if (language === 'kn') return weather.farmingAlertKn || weather.farmingAlert;
    if (language === 'ta') return weather.farmingAlertTa || weather.farmingAlert;
    if (language === 'te') return weather.farmingAlertTe || weather.farmingAlert;
    return weather.farmingAlert;
  };

  if (isLoading && !weather) {
    return (
      <div className="w-full relative z-20 rounded-3xl bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700/60 p-5 shadow-card">
        <LoadingState message="Fetching local farm weather..." />
      </div>
    );
  }

  if (needsLocationSetup && !weather) {
    return (
      <div className="w-full relative z-20 rounded-3xl bg-white dark:bg-zinc-800 border border-emerald-200/80 dark:border-zinc-700 p-5 shadow-card text-center space-y-3">
        <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-forest dark:text-emerald-400 flex items-center justify-center mx-auto">
          <MapPin className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">Location Needed</h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 max-w-xs mx-auto">
            Allow device location or select your farm district to load local weather and advisories.
          </p>
        </div>
        <div className="pt-1 flex items-center justify-center flex-wrap gap-2">
          <button
            type="button"
            onClick={() => requestLocation(true)}
            className="px-4 py-2 min-h-[44px] rounded-full bg-forest text-white text-xs font-bold hover:bg-forest-light active:scale-95 transition cursor-pointer"
          >
            Use my current location
          </button>
          {onChangeLocationClick && (
            <button
              type="button"
              onClick={onChangeLocationClick}
              className="px-4 py-2 min-h-[44px] rounded-full bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-semibold hover:bg-zinc-200 active:scale-95 transition cursor-pointer"
            >
              Set Location
            </button>
          )}
        </div>
      </div>
    );
  }

  if (error && !weather) {
    return (
      <div className="w-full relative z-20 rounded-3xl bg-white dark:bg-zinc-800 border border-red-200/80 dark:border-red-850 p-5 shadow-card text-center space-y-3">
        <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">Weather Unavailable</h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 max-w-xs mx-auto">{error}</p>
        </div>
        <div className="pt-1 flex items-center justify-center flex-wrap gap-2">
          <button
            type="button"
            onClick={handleManualRefresh}
            className="px-4 py-2 min-h-[44px] rounded-full bg-forest text-white text-xs font-bold hover:bg-forest-light active:scale-95 transition cursor-pointer"
          >
            Retry
          </button>
          {initialDistrict && activeMode !== 'district' ? (
            <button
              type="button"
              onClick={() => fallbackToRegistered('Manual fallback')}
              className="px-3.5 py-2 min-h-[44px] rounded-full bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-semibold hover:bg-zinc-200 active:scale-95 transition cursor-pointer"
            >
              Use Registered Location
            </button>
          ) : !hasLiveGpsRef.current ? (
            <button
              type="button"
              onClick={() => requestLocation(true)}
              className="px-3.5 py-2 min-h-[44px] rounded-full bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-semibold hover:bg-zinc-200 active:scale-95 transition cursor-pointer"
            >
              Use my current location
            </button>
          ) : onChangeLocationClick ? (
            <button
              type="button"
              onClick={onChangeLocationClick}
              className="px-3.5 py-2 min-h-[44px] rounded-full bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-semibold hover:bg-zinc-200 active:scale-95 transition cursor-pointer"
            >
              Change Location
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  // 5-day forecast data (dynamic fallback dates/days if truncated)
  const forecastDays =
    weather?.forecast7Days && weather.forecast7Days.length >= 5
      ? weather.forecast7Days.slice(0, 5)
      : getDefaultForecastDays();

  const fullAlert =
    getAlertText() || 'Weather is favorable for standard field operations and crop monitoring.';
  const alertParts = fullAlert.split('. ');
  const alertHeader = alertParts[0]
    ? alertParts[0].endsWith('.')
      ? alertParts[0]
      : `${alertParts[0]}.`
    : 'Weather advisory';
  const alertSub = alertParts.slice(1).join('. ');

  const displayLocation =
    weather?.location ||
    selectedDistrict ||
    (currentCoords ? `Your location (${currentCoords.lat.toFixed(2)}°, ${currentCoords.lon.toFixed(2)}°)` : 'Your location');

  return (
    <div className="w-full select-none relative z-20">
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="rounded-3xl overflow-hidden shadow-card border border-zinc-200/60 dark:border-zinc-700/60 bg-white dark:bg-zinc-800"
      >
        {/* 1. UPPER SECTION: Deep Forest Green Container with Curved Waves */}
        <div className="bg-gradient-to-b from-[#144D29] to-[#0D351B] text-white p-4 sm:p-5 pb-8 relative overflow-hidden">
          {/* Subtle curved background overlay */}
          <div
            className="absolute -right-6 -bottom-10 w-44 h-44 opacity-10 pointer-events-none"
            aria-hidden="true"
          >
            <svg viewBox="0 0 100 100" fill="currentColor">
              <path d="M 10 90 C 20 60, 45 40, 80 20 C 85 45, 75 75, 45 90 C 30 95, 18 92, 10 90 Z" />
            </svg>
          </div>

          {/* Location row with Map Pin + Real Location Name + "Change" pill + Refresh */}
          <div className="flex items-center justify-between pb-3 relative z-10">
            <div className="flex items-center gap-2 min-w-0 pr-2">
              <MapPin className="w-4 h-4 text-emerald-300 shrink-0" strokeWidth={2.2} />
              <span
                data-testid="weather-location-label"
                className="font-bold text-sm tracking-tight truncate whitespace-nowrap max-w-[185px] sm:max-w-[240px] block"
                title={displayLocation}
              >
                {displayLocation}
              </span>
              {onChangeLocationClick && (
                <button
                  type="button"
                  onClick={onChangeLocationClick}
                  className="min-h-[44px] min-w-[44px] -my-2 px-1 inline-flex items-center justify-center active:scale-95 transition cursor-pointer select-none shrink-0"
                >
                  <span className="px-2.5 py-0.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold tracking-wide">
                    Change
                  </span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleManualRefresh}
              aria-label="Refresh weather data"
              className="min-w-[44px] min-h-[44px] -my-2 -mr-2 rounded-full flex items-center justify-center text-emerald-200 hover:text-white transition active:scale-95 shrink-0 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Temperature + Condition & Inline Stats */}
          <div className="flex items-center justify-between pt-1 pb-2 relative z-10">
            <div className="flex items-center gap-3">
              {getWeatherIcon(weather?.icon || 'cloud-sun', 'w-12 h-12')}
              <div>
                <div className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-none">
                  <AnimatedCounter value={weather?.temperature ?? 22} suffix="°C" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-emerald-100 block mt-1">
                  {weather?.condition || 'Partly Cloudy'}
                </span>
              </div>
            </div>

            {/* Subtle Vertical Divider */}
            <div className="h-10 w-px bg-white/20 mx-2 shrink-0" />

            {/* Right Stats: Humidity & Wind */}
            <div className="flex flex-col items-start gap-1 text-xs text-emerald-100/90 font-medium tabular-nums">
              <div className="inline-flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-sky-300 shrink-0" strokeWidth={2} />
                <span>
                  <AnimatedCounter value={weather?.humidity ?? 59} suffix="%" /> Humidity
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5">
                <Wind className="w-3.5 h-3.5 text-emerald-300 shrink-0" strokeWidth={2} />
                <span>
                  <AnimatedCounter value={weather?.windSpeedKmH ?? 8} suffix=" km/h" /> Wind
                </span>
              </div>
            </div>
          </div>

          {/* Hill-shaped wave bottom edge with lighter green highlight curves */}
          <div className="absolute inset-x-0 bottom-0 pointer-events-none select-none z-0">
            <svg viewBox="0 0 400 36" fill="none" preserveAspectRatio="none" className="w-full h-8">
              <path
                d="M 0 36 Q 100 12 200 24 T 400 16 L 400 36 L 0 36 Z"
                fill="rgba(34, 139, 34, 0.35)"
              />
              <path
                d="M 0 36 Q 120 20 240 10 T 400 26 L 400 36 L 0 36 Z"
                fill="rgba(132, 204, 22, 0.22)"
              />
            </svg>
          </div>
        </div>

        {/* 2. LOWER SECTION: Overlapping White Forecast Tray + Peach Alert */}
        <div className="px-2.5 sm:px-4 pb-3.5 pt-0 bg-white dark:bg-zinc-800 space-y-3 relative z-10">
          {/* Overlapping White Forecast Tray (negative top margin overlaps green section) */}
          <div className="-mt-5 rounded-2xl bg-white dark:bg-zinc-800 p-1.5 sm:p-2.5 shadow-md border border-zinc-100 dark:border-zinc-700/70">
            <div className="grid grid-cols-5 divide-x divide-zinc-100 dark:divide-zinc-700/60">
              {forecastDays.map((day, idx) => {
                const isToday = idx === 0;
                return (
                  <div
                    key={idx}
                    className={`py-1.5 px-0.5 flex flex-col items-center justify-center text-center min-w-0 transition-colors ${
                      isToday
                        ? 'rounded-xl bg-[#DCFCE7] dark:bg-emerald-950/60 text-[#144D29] dark:text-emerald-300 font-bold shadow-xs'
                        : 'bg-transparent text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    <span className="text-[11px] mb-1 font-semibold block leading-tight">
                      {isToday ? 'Today' : day.dayName}
                    </span>
                    <div className="my-0.5">
                      {getWeatherIcon(day.icon, 'w-4 h-4 sm:w-5 sm:h-5')}
                    </div>
                    <span
                      data-testid={`forecast-temp-${idx}`}
                      className="text-[11px] font-bold text-zinc-800 dark:text-zinc-100 tabular-nums whitespace-nowrap tracking-tight"
                    >
                      {day.tempMax}° / {day.tempMin || Math.round(day.tempMax * 0.7)}°
                    </span>
                    <span className="text-[11px] text-blue-700 dark:text-blue-400 font-semibold tabular-nums mt-0.5 whitespace-nowrap">
                      {day.rainChance ?? 0}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Soft Peach Alert Banner (#FDEBD3) */}
          <div
            data-testid="weather-peach-alert"
            className="rounded-2xl bg-[#FDEBD3] dark:bg-[#382818] border border-[#FAD6A5]/80 dark:border-[#5C3D1E] p-3 flex items-center gap-3 text-left shadow-xs"
          >
            <div className="w-8 h-8 rounded-full bg-[#F6C68F] dark:bg-[#5C3D1E] flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-[#C05621] dark:text-[#F6AD55]" strokeWidth={2.2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[#0D2B18] dark:text-zinc-100 font-bold leading-tight">
                {alertHeader}
              </p>
              {alertSub && (
                <p className="text-[11px] text-zinc-700 dark:text-zinc-300 font-medium leading-tight mt-0.5">
                  {alertSub}
                </p>
              )}
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-500 shrink-0" />
          </div>

          {/* 4. Metadata: Last updated time and data source under the card */}
          {weather && (
            <div className="flex items-center justify-between text-[11px] text-zinc-600 dark:text-zinc-400 px-1 pt-0.5">
              <span className="truncate pr-2">
                Updated {weather.lastUpdated} • {weather.dataSource}
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                {weather.isDemoFallback && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-900/50 dark:text-amber-200">
                    Sample data
                  </span>
                )}
                {weather.isStale && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200">
                    Cached
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* 5. Non-silent Fallback notice: profile district or saved location + "Use my current location" */}
      {fallbackHint !== null && (
        <div
          data-testid="weather-fallback-hint"
          className="mt-2.5 px-3.5 py-2 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/50 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-amber-900 dark:text-amber-200 shadow-xs"
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="leading-snug">
              {fallbackHint === 'registered'
                ? `Using your registered location (${selectedDistrict || initialDistrict})`
                : `Using your last saved location${selectedDistrict ? ` (${selectedDistrict})` : ''}`}
            </span>
          </div>
          <button
            type="button"
            onClick={() => requestLocation(true)}
            className="font-bold underline text-amber-900 dark:text-amber-100 hover:text-amber-700 text-xs shrink-0 cursor-pointer select-none min-h-[44px] -my-2 inline-flex items-center ml-auto"
          >
            Use my current location
          </button>
        </div>
      )}

      {/* 6. Plain HTTP on LAN notice */}
      {insecureLanNotice && (
        <div className="mt-2 px-3.5 py-2 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/50 flex items-center gap-2 text-xs text-blue-900 dark:text-blue-200 shadow-xs">
          <AlertCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
          <span>{insecureLanNotice}</span>
        </div>
      )}
    </div>
  );
};

export default WeatherWidget;
