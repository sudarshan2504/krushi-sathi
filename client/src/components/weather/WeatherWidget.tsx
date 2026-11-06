import React, { useState, useEffect } from 'react';
import { CloudSun, Sun, CloudRain, CloudLightning, MapPin, RefreshCw, AlertCircle, Droplets, Wind, Sparkles } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { api } from '../../services/api';
import { WeatherData } from '../../types';
import { useTranslation } from '../../context/LanguageContext';
import { Modal } from '../ui/Modal';
import { AnimatedCounter } from '../ui/AnimatedCounter';
import { LoadingState } from '../ui/LoadingState';

export interface WeatherWidgetProps {
  initialDistrict?: string;
  onDistrictChange?: (district: string) => void;
  onWeatherDataLoaded?: (data: WeatherData) => void;
}

const clientWeatherCache = new Map<string, { data: WeatherData; timestamp: number }>();
const CLIENT_CACHE_TTL_MS = 20 * 60 * 1000;

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  initialDistrict = 'Mandya',
  onDistrictChange,
  onWeatherDataLoaded,
}) => {
  const { t, language } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const [district, setDistrict] = useState(initialDistrict);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [districts, setDistricts] = useState<{ name: string; state: string }[]>([]);

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
    api.weather.getDistricts().then(setDistricts).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadWeather(district);
    }, 250);
    return () => clearTimeout(timer);
  }, [district]);

  const handleSelectDistrict = (dName: string) => {
    setDistrict(dName);
    setIsLocationModalOpen(false);
    if (onDistrictChange) onDistrictChange(dName);
  };

  const getWeatherIcon = (iconName: string) => {
    switch (iconName) {
      case 'sun':
        return <Sun className="w-5 h-5 text-amber-500" strokeWidth={2} />;
      case 'cloud-rain':
      case 'cloud-drizzle':
        return <CloudRain className="w-5 h-5 text-blue-500" strokeWidth={2} />;
      case 'cloud-lightning':
      case 'cloud-lightning-rain':
        return <CloudLightning className="w-5 h-5 text-amber-600" strokeWidth={2} />;
      case 'cloud-sun':
      default:
        return <CloudSun className="w-5 h-5 text-amber-500" strokeWidth={2} />;
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
      <div className="rounded-4xl bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border p-5 shadow-xs">
        <LoadingState message="Fetching local farm weather..." />
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Main Weather Card — One card, no nested boxes */}
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="relative overflow-hidden rounded-4xl bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border shadow-card p-5 space-y-3.5"
      >
        {/* 1. Location row */}
        <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 dark:border-dark-border/60">
          <div className="flex items-center gap-1.5 min-w-0">
            <MapPin className="w-4 h-4 text-brand-700 dark:text-brand-400 shrink-0" strokeWidth={2} />
            <span className="font-bold text-[14px] text-gray-900 dark:text-gray-100 whitespace-nowrap">
              {weather ? weather.location : `${district}, Karnataka`}
            </span>
            <button
              type="button"
              onClick={() => setIsLocationModalOpen(true)}
              className="text-[12px] text-brand-700 dark:text-brand-400 font-bold hover:underline ml-1 shrink-0"
              aria-label="Change location"
            >
              Change
            </button>
          </div>

          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => loadWeather(district, true)}
              className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-brand-700 dark:hover:text-brand-400 transition-colors active:scale-95"
              title="Refresh weather"
              aria-label="Refresh live weather"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-brand-700' : ''}`} />
            </button>
          </div>
        </div>

        {/* 2. Big temperature + condition & 3. Humidity and wind as two small inline stats */}
        <div className="flex items-center justify-between pt-0.5">
          <div className="flex items-center gap-3">
            <CloudSun className="w-10 h-10 text-amber-500 shrink-0" strokeWidth={1.75} />
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-gray-100 tabular tracking-tight">
                  <AnimatedCounter value={weather?.temperature ?? 28} suffix="°C" />
                </span>
              </div>
              <span className="text-[13px] font-semibold text-gray-600 dark:text-gray-300 block">
                {weather?.condition || t('partlyCloudy')}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5 text-xs text-gray-600 dark:text-gray-300 font-medium tabular">
            <div className="inline-flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-blue-500 shrink-0" strokeWidth={2} />
              <span>
                <AnimatedCounter value={weather?.humidity ?? 68} suffix="%" /> Humidity
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5">
              <Wind className="w-3.5 h-3.5 text-brand-700 dark:text-brand-400 shrink-0" strokeWidth={2} />
              <span>
                <AnimatedCounter value={weather?.windSpeedKmH ?? 14} suffix=" km/h" /> Wind
              </span>
            </div>
          </div>
        </div>

        {/* 4. Horizontal 7-Day Forecast Strip — no individual outlined tiles, Today highlighted with soft pill, right-edge fade */}
        <div className="relative pt-1">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none chips-scroll pr-8">
            {weather?.forecast7Days.map((day, idx) => {
              const isToday = idx === 0;
              return (
                <div
                  key={idx}
                  className={[
                    'flex-1 min-w-[50px] py-2 px-1.5 rounded-2xl flex flex-col items-center justify-center text-center transition-colors shrink-0',
                    isToday
                      ? 'bg-brand-50 dark:bg-brand-900/30'
                      : 'bg-transparent',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'text-[11px] mb-1 font-medium',
                      isToday
                        ? 'text-brand-800 dark:text-brand-300 font-bold'
                        : 'text-gray-500 dark:text-gray-400',
                    ].join(' ')}
                  >
                    {isToday ? 'Today' : day.dayName}
                  </span>
                  <div className="my-0.5">{getWeatherIcon(day.icon)}</div>
                  <span className="text-xs font-bold text-gray-900 dark:text-gray-100 tabular">
                    {day.tempMax}°
                  </span>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold tabular mt-0.5">
                    {day.rainChance}%
                  </span>
                </div>
              );
            })}
          </div>
          {/* Right-edge fade */}
          <div
            className="pointer-events-none absolute right-0 top-0 bottom-1 w-8 bg-gradient-to-l from-white dark:from-dark-surface to-transparent"
            aria-hidden="true"
          />
        </div>

        {/* 5. Rain advice: slim tinted row with icon and 1-2 lines */}
        {weather?.farmingAlert && (
          <div className="py-2.5 px-3 rounded-2xl bg-amber-500/10 dark:bg-amber-400/10 text-amber-950 dark:text-amber-200 flex items-center gap-2.5 text-xs font-medium leading-relaxed">
            <AlertCircle className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" strokeWidth={2} />
            <p className="flex-1 line-clamp-2">
              {getAlertText()}
            </p>
          </div>
        )}
      </motion.div>

      {/* Select District Modal */}
      <Modal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        title={t('changeLocation')}
      >
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          Select your agricultural district for localized weather and crop forecasts:
        </p>
        <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
          {districts.map((d) => (
            <button
              key={d.name}
              onClick={() => handleSelectDistrict(d.name)}
              className={[
                'p-3 rounded-2xl border text-left flex items-center justify-between transition-colors',
                district === d.name
                  ? 'border-brand-700 bg-brand-50 text-brand-800 dark:bg-brand-900/30 dark:border-brand-600 dark:text-brand-300 font-bold'
                  : 'border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-800 dark:text-gray-200 hover:border-brand-300',
              ].join(' ')}
            >
              <div>
                <span className="text-sm block">{d.name}</span>
                <span className="text-[10px] text-gray-400">{d.state}</span>
              </div>
              {district === d.name && <span className="w-2 h-2 rounded-full bg-brand-600" />}
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
};
