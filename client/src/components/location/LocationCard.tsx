import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, CloudRain, Sun, Droplets, Wind, Sparkles, Compass, Sprout } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';
import { WeatherData } from '../../types';

interface LocationCardProps {
  weatherData?: WeatherData | null;
  onEditLocation?: () => void;
}

export const LocationCard: React.FC<LocationCardProps> = ({
  weatherData,
  onEditLocation,
}) => {
  const { language } = useTranslation();

  if (!weatherData) return null;

  const season = weatherData.seasonInfo;
  const agroZone = weatherData.agroZone || 'Southern Dry Zone';
  const soils = weatherData.typicalSoils || ['red', 'loamy'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-5 border border-leaf/30 shadow-card hover:shadow-card-hover transition relative overflow-hidden"
    >
      {/* Background soft ambient blur */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-mint/15 rounded-full blur-2xl pointer-events-none" />

      {/* Header with Location & Change button */}
      <div className="flex items-center justify-between mb-3.5 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-forest to-leaf text-white flex items-center justify-center shadow-md">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-forest text-white">
                {weatherData.state || 'Karnataka'}
              </span>
              {weatherData.taluk && (
                <span className="text-xs font-bold text-gray-900 dark:text-gray-100">
                  {weatherData.taluk},
                </span>
              )}
              <span className="text-xs font-bold text-gray-900 dark:text-gray-100">
                {weatherData.district}
              </span>
            </div>
            <p className="text-[11px] font-bold text-forest mt-0.5 flex items-center gap-1">
              <Sprout className="w-3.5 h-3.5 text-forest" />
              <span>{agroZone}</span>
            </p>
          </div>
        </div>

        {onEditLocation && (
          <button
            type="button"
            onClick={onEditLocation}
            className="min-h-[44px] text-xs font-bold text-forest bg-mint/20 hover:bg-forest hover:text-white px-3 py-1.5 rounded-xl transition shadow-sm"
          >
            {language === 'kn' ? 'ಸ್ಥಳ ಬದಲಾಯಿಸಿ' : 'Change Location'}
          </button>
        )}
      </div>

      {/* Agro-Zone Description */}
      {weatherData.agroZoneDescription && (
        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-3.5 bg-cream/30 p-2.5 rounded-xl border border-earth/10">
          {weatherData.agroZoneDescription}
        </p>
      )}

      {/* 2-Column Live Status Grid: Current Season & Typical Soils */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3.5">
        {/* Season card */}
        <div className="p-3 rounded-2xl bg-gradient-to-br from-mint/20 to-leaf/10 border border-leaf/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-forest">
              {language === 'kn' ? 'ಪ್ರಸ್ತುತ ಹಂಗಾಮು' : 'Current Season'}
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-forest text-white">
              {season?.season || 'Kharif'}
            </span>
          </div>
          <div className="mt-1.5">
            <h4 className="text-xs font-extrabold text-gray-900 dark:text-gray-100">
              {language === 'kn' ? season?.nameKannada : season?.name || 'Kharif (Monsoon Season)'}
            </h4>
            <p className="text-[11px] text-amber-800 font-semibold mt-0.5">
              {language === 'kn' ? season?.currentPhaseKn : season?.currentPhase || 'Active Field Growth'}
            </p>
          </div>
        </div>

        {/* Typical Soils Card */}
        <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
            {language === 'kn' ? 'ಪ್ರದೇಶದ ಮುಖ್ಯ ಮಣ್ಣು' : 'Typical Regional Soils'}
          </span>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {soils.map((s) => (
              <span
                key={s}
                className="capitalize px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-xs font-bold text-gray-900 dark:text-gray-100 shadow-2xs"
              >
                {s} soil
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Live Weather Strip */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-forest/5 border border-forest/15">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
            <Sun className="w-5 h-5 text-amber-500" strokeWidth={2} />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-forest">
                {weatherData.temperature}°C
              </span>
              <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                {weatherData.condition}
              </span>
            </div>
            <span className="text-[11px] text-gray-600 dark:text-gray-400">
              Humidity: {weatherData.humidity}% • Rain chance: {weatherData.rainfallProbability}%
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[11px] font-bold text-forest bg-mint/30 px-2 py-0.5 rounded-md">
            Live Open-Meteo
          </span>
        </div>
      </div>
    </motion.div>
  );
};
