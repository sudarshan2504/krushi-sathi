import React, { useState, useEffect } from 'react';
import { CloudSun, Sun, CloudRain, CloudLightning, MapPin, RefreshCw, AlertCircle, Droplets, Wind } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../../services/api';
import { WeatherData } from '../../types';
import { useTranslation } from '../../context/LanguageContext';
import { Modal } from '../ui/Modal';

export interface WeatherWidgetProps {
  initialDistrict?: string;
  onDistrictChange?: (district: string) => void;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  initialDistrict = 'Mandya',
  onDistrictChange,
}) => {
  const { t, language } = useTranslation();
  const [district, setDistrict] = useState(initialDistrict);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [districts, setDistricts] = useState<{ name: string; state: string }[]>([]);

  const loadWeather = async (targetDistrict: string) => {
    setIsLoading(true);
    try {
      const data = await api.weather.get(targetDistrict);
      setWeather(data);
    } catch (err) {
      console.error('Weather load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWeather(district);
    api.weather.getDistricts().then(setDistricts).catch(() => {});
  }, [district]);

  const handleSelectDistrict = (dName: string) => {
    setDistrict(dName);
    setIsLocationModalOpen(false);
    if (onDistrictChange) onDistrictChange(dName);
  };

  const getWeatherIcon = (iconName: string) => {
    switch (iconName) {
      case 'sun':
        return <Sun className="w-5 h-5 text-harvest" />;
      case 'cloud-rain':
      case 'cloud-drizzle':
        return <CloudRain className="w-5 h-5 text-blue-500" />;
      case 'cloud-lightning':
      case 'cloud-lightning-rain':
        return <CloudLightning className="w-5 h-5 text-amber-500" />;
      case 'cloud-sun':
      default:
        return <CloudSun className="w-5 h-5 text-harvest" />;
    }
  };

  const getAlertText = () => {
    if (!weather) return '';
    if (language === 'kn') return weather.farmingAlertKn || weather.farmingAlert;
    if (language === 'ta') return weather.farmingAlertTa || weather.farmingAlert;
    if (language === 'te') return weather.farmingAlertTe || weather.farmingAlert;
    return weather.farmingAlert;
  };

  return (
    <div className="w-full">
      {/* Top Location Bar */}
      <div className="flex items-center justify-between mb-2 px-1">
        <button
          onClick={() => setIsLocationModalOpen(true)}
          className="flex items-center gap-1.5 text-xs font-semibold text-dark-text hover:text-forest transition-colors group"
        >
          <MapPin className="w-3.5 h-3.5 text-forest group-hover:scale-110 transition-transform" />
          <span>{weather ? weather.location : `${district}, Karnataka`}</span>
          <span className="text-[10px] text-forest underline ml-1">Change</span>
        </button>

        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-dark-muted">
            {weather?.lastUpdated || t('updatedJustNow')}
          </span>
          <button
            onClick={() => loadWeather(district)}
            className="p-1 rounded-full text-dark-muted hover:text-forest transition-transform active:rotate-180"
            title="Refresh weather"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-forest' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Weather Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-mint-light via-white to-cream border border-forest/15 shadow-card p-5"
      >
        {/* Subtle background nature glow */}
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 rounded-full bg-harvest/20 blur-2xl pointer-events-none" />

        {/* Current Temp and Conditions */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-forest/10 flex items-center justify-center">
              <CloudSun className="w-9 h-9 text-harvest" />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-dark-text">
                  {weather ? `${weather.temperature}°C` : '28°C'}
                </span>
              </div>
              <span className="text-xs font-semibold text-dark-muted block">
                {weather?.condition || t('partlyCloudy')}
              </span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="text-right space-y-1">
            <div className="flex items-center justify-end gap-1 text-xs text-dark-muted font-medium">
              <Droplets className="w-3.5 h-3.5 text-blue-500" />
              <span>{weather ? `${weather.humidity}%` : '68%'} Humidity</span>
            </div>
            <div className="flex items-center justify-end gap-1 text-xs text-dark-muted font-medium">
              <Wind className="w-3.5 h-3.5 text-forest" />
              <span>{weather ? `${weather.windSpeedKmH} km/h` : '14 km/h'}</span>
            </div>
          </div>
        </div>

        {/* Week Summary Pills */}
        <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-2xl bg-white/70 border border-forest/10 mb-4 text-center">
          <div>
            <span className="text-[10px] text-dark-muted block font-medium">{t('thisWeek')}</span>
            <span className="text-xs font-bold text-dark-text">{weather?.weekRange || '25° - 31°'}</span>
          </div>
          <div className="border-x border-gray-100">
            <span className="text-[10px] text-dark-muted block font-medium">{t('rainChance')}</span>
            <span className="text-xs font-bold text-blue-600">{weather?.rainfallProbability || 40}%</span>
          </div>
          <div>
            <span className="text-[10px] text-dark-muted block font-medium">{t('nextWeek')}</span>
            <span className="text-xs font-bold text-dark-text">{weather?.nextWeekRange || '22° - 30°'}</span>
          </div>
        </div>

        {/* 7-Day Forecast Pills */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 mb-3 scrollbar-none">
          {weather?.forecast7Days.map((day, idx) => (
            <div
              key={idx}
              className={`flex-1 min-w-[42px] p-2 rounded-xl flex flex-col items-center justify-center text-center transition-colors ${
                idx === 0 ? 'bg-forest/10 border border-forest/30 font-bold' : 'bg-white/60 border border-gray-100'
              }`}
            >
              <span className="text-[11px] text-dark-muted font-semibold mb-1">{day.dayName}</span>
              <div className="my-0.5">{getWeatherIcon(day.icon)}</div>
              <span className="text-xs font-bold text-dark-text mt-1">{day.tempMax}°</span>
            </div>
          ))}
        </div>

        {/* Weather Alert Banner */}
        {weather?.farmingAlert && (
          <div className="p-3 rounded-2xl bg-amber-50/90 border border-amber-200/80 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-900 leading-snug font-medium">
              {getAlertText()}
            </p>
          </div>
        )}

        {/* Demo Indicator Notice */}
        <div className="mt-2 text-right">
          <span className="text-[10px] text-gray-400">
            {weather?.isDemoFallback ? t('demoWeatherData') : t('liveWeatherData')}
          </span>
        </div>
      </motion.div>

      {/* Select District Modal */}
      <Modal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        title={t('changeLocation')}
      >
        <p className="text-xs text-dark-muted mb-3">
          Select your agricultural district for localized weather and crop forecasts:
        </p>
        <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
          {districts.map((d) => (
            <button
              key={d.name}
              onClick={() => handleSelectDistrict(d.name)}
              className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-colors ${
                district === d.name
                  ? 'border-forest bg-mint text-forest font-bold'
                  : 'border-gray-100 hover:border-forest/30 bg-white text-dark-text'
              }`}
            >
              <div>
                <span className="text-sm block">{d.name}</span>
                <span className="text-[10px] text-dark-muted">{d.state}</span>
              </div>
              {district === d.name && <span className="w-2 h-2 rounded-full bg-forest" />}
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
};
