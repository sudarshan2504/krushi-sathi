import React, { useState, useEffect } from 'react';
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

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  initialDistrict = 'Mandya',
  onDistrictChange,
  onWeatherDataLoaded,
  onChangeLocationClick,
}) => {
  const { t, language } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const [district, setDistrict] = useState(initialDistrict);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadWeather = async (targetDistrict: string, force = false) => {
    const cached = clientWeatherCache.get(targetDistrict);
    const now = Date.now();
    if (!force && cached && now - cached.timestamp < CLIENT_CACHE_TTL_MS) {
      setWeather(cached.data);
      setIsLoading(false);
      if (onWeatherDataLoaded) onWeatherDataLoaded(cached.data);
      return;
    }

    setIsLoading(true);
    try {
      const data = await api.weather.get(targetDistrict);
      clientWeatherCache.set(targetDistrict, { data, timestamp: Date.now() });
      setWeather(data);
      if (onWeatherDataLoaded) onWeatherDataLoaded(data);
    } catch (err) {
      console.error('Weather load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setDistrict(initialDistrict);
  }, [initialDistrict]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadWeather(district);
    }, 250);
    return () => clearTimeout(timer);
  }, [district]);

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

  // Fallback 5-day forecast data if not populated
  const forecastDays = weather?.forecast7Days?.slice(0, 5) || [
    { dayName: 'Today', icon: 'cloud-rain', tempMax: 30, tempMin: 20, rainChance: 60 },
    { dayName: 'Mon', icon: 'sun', tempMax: 29, tempMin: 21, rainChance: 25 },
    { dayName: 'Tue', icon: 'cloud-lightning', tempMax: 30, tempMin: 22, rainChance: 10 },
    { dayName: 'Wed', icon: 'cloud-sun', tempMax: 30, tempMin: 21, rainChance: 6 },
    { dayName: 'Thu', icon: 'sun', tempMax: 30, tempMin: 22, rainChance: 2 },
  ];

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

          {/* Location row with Map Pin + "Mandya, Karnataka" + "Change" pill + Refresh */}
          <div className="flex items-center justify-between pb-3 relative z-10">
            <div className="flex items-center gap-2 min-w-0">
              <MapPin className="w-4 h-4 text-emerald-300 shrink-0" strokeWidth={2.2} />
              <span className="font-bold text-sm tracking-tight truncate">
                {weather?.location || `${district}, Karnataka`}
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
              onClick={() => loadWeather(district, true)}
              aria-label="Refresh weather data"
              className="w-7 h-7 rounded-full flex items-center justify-center text-emerald-200 hover:text-white transition active:scale-95"
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
        <div className="px-3 sm:px-4 pb-4 pt-0 bg-white dark:bg-zinc-800 space-y-3 relative z-10">
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
                Rain expected today (60% chance).
              </p>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-300 font-medium leading-tight mt-0.5">
                Consider completing field spraying or harvesting early.
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-500 shrink-0" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};
