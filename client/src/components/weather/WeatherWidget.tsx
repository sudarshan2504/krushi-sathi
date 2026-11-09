import React, { useState, useEffect, useCallback } from 'react';
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

export interface WeatherWidgetProps {
  initialDistrict?: string;
  onDistrictChange?: (district: string) => void;
  onWeatherDataLoaded?: (data: WeatherData) => void;
  onChangeLocationClick?: () => void;
}

const clientWeatherCache = new Map<string, { data: WeatherData; timestamp: number }>();
const CLIENT_CACHE_TTL_MS = 20 * 60 * 1000;

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
  initialDistrict = 'Mandya',
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
  const [isUsingFallbackLocation, setIsUsingFallbackLocation] = useState(false);
  const [insecureLanNotice, setInsecureLanNotice] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<'gps' | 'district'>('gps');
  const [selectedDistrict, setSelectedDistrict] = useState(initialDistrict);

  // Load weather using GPS coordinates
  const loadWeatherByCoords = useCallback(
    async (lat: number, lon: number, force = false) => {
      const cacheKey = `gps_${lat.toFixed(2)}_${lon.toFixed(2)}`;
      const cached = clientWeatherCache.get(cacheKey);
      const now = Date.now();

      if (!force && cached && now - cached.timestamp < CLIENT_CACHE_TTL_MS) {
        setWeather(cached.data);
        setIsLoading(false);
        setError(null);
        if (onWeatherDataLoaded) onWeatherDataLoaded(cached.data);
        return cached.data;
      }

      setIsLoading(true);
      setError(null);
      try {
        const data = await api.weather.get(undefined, lat, lon);
        clientWeatherCache.set(cacheKey, { data, timestamp: Date.now() });
        setWeather(data);
        setIsUsingFallbackLocation(false);
        setActiveMode('gps');
        if (onWeatherDataLoaded) onWeatherDataLoaded(data);
        return data;
      } catch (err: any) {
        console.error('[WeatherWidget] Error loading weather by coords:', err);
        if (cached) {
          setWeather({ ...cached.data, isStale: true });
        } else {
          setError(err?.message || 'Unable to load weather for current location.');
        }
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [onWeatherDataLoaded]
  );

  // Load weather using district name
  const loadWeatherByDistrict = useCallback(
    async (targetDistrict: string, force = false) => {
      const cacheKey = `dist_${targetDistrict.toLowerCase()}`;
      const cached = clientWeatherCache.get(cacheKey);
      const now = Date.now();

      if (!force && cached && now - cached.timestamp < CLIENT_CACHE_TTL_MS) {
        setWeather(cached.data);
        setIsLoading(false);
        setError(null);
        if (onWeatherDataLoaded) onWeatherDataLoaded(cached.data);
        return cached.data;
      }

      setIsLoading(true);
      setError(null);
      try {
        const data = await api.weather.get(targetDistrict);
        clientWeatherCache.set(cacheKey, { data, timestamp: Date.now() });
        setWeather(data);
        if (onWeatherDataLoaded) onWeatherDataLoaded(data);
        return data;
      } catch (err: any) {
        console.error('[WeatherWidget] Error loading weather by district:', err);
        if (cached) {
          setWeather({ ...cached.data, isStale: true });
        } else {
          setError(err?.message || `Unable to load weather for ${targetDistrict}.`);
        }
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [onWeatherDataLoaded]
  );

  // Fallback to profile district or localStorage
  const fallbackToRegistered = useCallback(
    (_reason: string) => {
      setIsUsingFallbackLocation(true);
      setActiveMode('district');

      // Check profile district, then localStorage
      const savedDistrict = localStorage.getItem('krushi_sathi_last_weather_district');
      const targetDistrict = initialDistrict || savedDistrict || 'Mandya';
      setSelectedDistrict(targetDistrict);
      loadWeatherByDistrict(targetDistrict).catch(() => {});
    },
    [initialDistrict, loadWeatherByDistrict]
  );

  // Request user location via navigator.geolocation
  const requestLocation = useCallback(
    (isRetry = false) => {
      setIsLoading(true);
      setError(null);

      // Check HTTPS or localhost
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
          setCurrentCoords({ lat, lon });
          setIsUsingFallbackLocation(false);
          setActiveMode('gps');

          try {
            localStorage.setItem(
              'krushi_sathi_last_weather_coords',
              JSON.stringify({ lat, lon, timestamp: Date.now() })
            );
          } catch {
            // ignore localStorage quota errors
          }

          loadWeatherByCoords(lat, lon, isRetry).catch(() => {});
        },
        (geoError) => {
          console.warn('[WeatherWidget] Geolocation denied/unavailable:', geoError.message);
          fallbackToRegistered(geoError.message);
        },
        {
          enableHighAccuracy: false,
          timeout: 8000,
          maximumAge: 60000,
        }
      );
    },
    [fallbackToRegistered, loadWeatherByCoords]
  );

  // Initial load: ask for location with navigator.geolocation
  useEffect(() => {
    requestLocation(false);
  }, [requestLocation]);

  // If initialDistrict changes from external selection
  useEffect(() => {
    if (initialDistrict && initialDistrict !== selectedDistrict) {
      setSelectedDistrict(initialDistrict);
      setActiveMode('district');
      setIsUsingFallbackLocation(false);
      loadWeatherByDistrict(initialDistrict, true).catch(() => {});
    }
  }, [initialDistrict, loadWeatherByDistrict, selectedDistrict]);

  // Foreground re-fetch & 5km location change detection
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        if (activeMode === 'gps' && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const newLat = pos.coords.latitude;
              const newLon = pos.coords.longitude;
              if (currentCoords) {
                const dist = getDistanceFromLatLonInKm(currentCoords.lat, currentCoords.lon, newLat, newLon);
                if (dist > 5) {
                  setCurrentCoords({ lat: newLat, lon: newLon });
                  loadWeatherByCoords(newLat, newLon, true).catch(() => {});
                  return;
                }
              }
              // Refresh without forcing cache bust if within 5 km
              loadWeatherByCoords(newLat, newLon, false).catch(() => {});
            },
            () => {
              if (currentCoords) {
                loadWeatherByCoords(currentCoords.lat, currentCoords.lon, false).catch(() => {});
              }
            },
            { enableHighAccuracy: false, timeout: 6000, maximumAge: 60000 }
          );
        } else if (activeMode === 'district') {
          loadWeatherByDistrict(selectedDistrict, false).catch(() => {});
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [activeMode, currentCoords, selectedDistrict, loadWeatherByCoords, loadWeatherByDistrict]);

  // Watch position for > 5 km movement while active
  useEffect(() => {
    if (!navigator.geolocation || isUsingFallbackLocation || activeMode !== 'gps') return;
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
            loadWeatherByCoords(newLat, newLon, true).catch(() => {});
          }
        }
      },
      () => {},
      { enableHighAccuracy: false, maximumAge: 180000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [currentCoords, isUsingFallbackLocation, activeMode, loadWeatherByCoords]);

  const handleManualRefresh = () => {
    if (activeMode === 'gps' && currentCoords) {
      loadWeatherByCoords(currentCoords.lat, currentCoords.lon, true).catch(() => {});
    } else if (activeMode === 'gps') {
      requestLocation(true);
    } else {
      loadWeatherByDistrict(selectedDistrict, true).catch(() => {});
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
      <div className="rounded-3xl bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700/60 p-5 shadow-card">
        <LoadingState message="Fetching local farm weather..." />
      </div>
    );
  }

  if (error && !weather) {
    return (
      <div className="rounded-3xl bg-white dark:bg-zinc-800 border border-red-200/80 dark:border-red-850 p-5 shadow-card text-center space-y-3">
        <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">Weather Unavailable</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto">{error}</p>
        </div>
        <div className="pt-1 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => requestLocation(true)}
            className="px-4 py-1.5 rounded-full bg-forest text-white text-xs font-bold hover:bg-forest-light active:scale-95 transition"
          >
            Retry Location
          </button>
          <button
            type="button"
            onClick={() => fallbackToRegistered('Manual fallback')}
            className="px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-semibold hover:bg-zinc-200 active:scale-95 transition"
          >
            Use Registered Location
          </button>
        </div>
      </div>
    );
  }

  // 5-day forecast data
  const forecastDays = weather?.forecast7Days?.slice(0, 5) || [
    { dayName: 'Today', icon: 'cloud-rain', tempMax: 30, tempMin: 20, rainChance: 60 },
    { dayName: 'Mon', icon: 'sun', tempMax: 29, tempMin: 21, rainChance: 25 },
    { dayName: 'Tue', icon: 'cloud-lightning', tempMax: 30, tempMin: 22, rainChance: 10 },
    { dayName: 'Wed', icon: 'cloud-sun', tempMax: 30, tempMin: 21, rainChance: 6 },
    { dayName: 'Thu', icon: 'sun', tempMax: 30, tempMin: 22, rainChance: 2 },
  ];

  const fullAlert = getAlertText() || 'Rain expected today (60% chance). Consider completing field spraying or harvesting early.';
  const alertParts = fullAlert.split('. ');
  const alertHeader = alertParts[0] ? (alertParts[0].endsWith('.') ? alertParts[0] : `${alertParts[0]}.`) : 'Weather advisory';
  const alertSub = alertParts.slice(1).join('. ') || (alertParts.length === 1 ? '' : 'Favorable conditions for farming activities.');

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
              <span className="font-bold text-sm tracking-tight truncate" title={weather?.location}>
                {weather?.location || `${selectedDistrict}, Karnataka`}
              </span>
              <button
                type="button"
                onClick={onChangeLocationClick}
                className="px-2.5 py-0.5 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 text-white text-[11px] font-bold tracking-wide transition cursor-pointer select-none shrink-0"
              >
                Change
              </button>
            </div>

            <button
              type="button"
              onClick={handleManualRefresh}
              aria-label="Refresh weather data"
              className="w-7 h-7 rounded-full flex items-center justify-center text-emerald-200 hover:text-white transition active:scale-95 shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Temperature + Condition & Inline Stats */}
          <div className="flex items-center justify-between pt-1 pb-2 relative z-10">
            <div className="flex items-center gap-3">
              <CloudSun className="w-12 h-12 text-amber-400 shrink-0" strokeWidth={1.8} />
              <div>
                <div className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-none">
                  <AnimatedCounter value={weather?.temperature ?? 22} suffix="°C" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-emerald-100 block mt-1">
                  {weather?.condition || 'Overcast'}
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
        <div className="px-3 sm:px-4 pb-3.5 pt-0 bg-white dark:bg-zinc-800 space-y-3 relative z-10">
          {/* Overlapping White Forecast Tray (negative top margin overlaps green section) */}
          <div className="-mt-5 rounded-2xl bg-white dark:bg-zinc-850 p-2 sm:p-2.5 shadow-md border border-zinc-100 dark:border-zinc-700/70">
            <div className="grid grid-cols-5 divide-x divide-zinc-100 dark:divide-zinc-700/60">
              {forecastDays.map((day, idx) => {
                const isToday = idx === 0;
                return (
                  <div
                    key={idx}
                    className={`py-1.5 px-0.5 flex flex-col items-center justify-center text-center transition-colors ${
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
                    <span className="text-[10px] sm:text-[11px] font-bold text-zinc-800 dark:text-zinc-100 tabular-nums whitespace-nowrap tracking-tight">
                      {day.tempMax}° / {day.tempMin || Math.round(day.tempMax * 0.7)}°
                    </span>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold tabular-nums mt-0.5">
                      {day.rainChance ?? 0}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Soft Peach Alert Banner (#FDEBD3) */}
          <div className="rounded-2xl bg-[#FDEBD3] dark:bg-[#382818] border border-[#FAD6A5]/80 dark:border-[#5C3D1E] p-3 flex items-center gap-3 text-left shadow-xs">
            <div className="w-8 h-8 rounded-full bg-[#F6C68F] dark:bg-[#5C3D1E] flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-[#C05621] dark:text-[#F6AD55]" strokeWidth={2.2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[#0D2B18] dark:text-zinc-100 font-bold leading-tight">
                {alertHeader}
              </p>
              {alertSub && (
                <p className="text-[11px] text-zinc-600 dark:text-zinc-300 font-medium leading-tight mt-0.5">
                  {alertSub}
                </p>
              )}
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-500 shrink-0" />
          </div>

          {/* 4. Metadata: Last updated time and data source under the card */}
          {weather && (
            <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 px-1 pt-0.5">
              <span className="truncate pr-2">
                Updated {weather.lastUpdated} • {weather.dataSource}
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                {weather.isDemoFallback && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
                    Sample data
                  </span>
                )}
                {weather.isStale && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">
                    Cached
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* 5. Non-silent Fallback notice: "Using your registered location" + "Use my current location" */}
      {isUsingFallbackLocation && (
        <div className="mt-2.5 px-3.5 py-2 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/50 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200 shadow-xs">
          <div className="flex items-center gap-1.5 min-w-0 pr-2">
            <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="truncate">
              Using your registered location ({selectedDistrict || initialDistrict})
            </span>
          </div>
          <button
            type="button"
            onClick={() => requestLocation(true)}
            className="font-bold underline text-amber-900 dark:text-amber-100 hover:text-amber-700 text-[11px] shrink-0 cursor-pointer select-none"
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
