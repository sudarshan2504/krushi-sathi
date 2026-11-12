import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, HelpCircle, Sparkles, Layers, Sprout, Droplets, Mountain, Waves, Sun, Box } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';
import { SoilHelpModal } from './SoilHelpModal';

export interface SoilTypeOption {
  id: string;
  name: string;
  nameKn: string;
  nameTa: string;
  nameTe: string;
  desc: string;
  descKn: string;
  colorSwatch: string;
  bestCrops: string;
  iconComponent: React.ElementType;
}

export const SOIL_TYPE_OPTIONS: SoilTypeOption[] = [
  {
    id: 'red',
    name: 'Red Soil',
    nameKn: 'ಕೆಂಪು ಮಣ್ಣು',
    nameTa: 'செம்மண்',
    nameTe: 'ఎర్ర నేలలు',
    desc: 'Porous, well-drained, iron-rich',
    descKn: 'ಸಡಿಲವಾದ, ನೀರು ಬಸಿಯುವ, ಕಬ್ಬಿಣ ಸಮೃದ್ಧ ಮಣ್ಣು',
    colorSwatch: 'bg-red-600',
    bestCrops: 'Ragi, Groundnut, Tomato, Mango',
    iconComponent: Box,
  },
  {
    id: 'black',
    name: 'Black Cotton Soil',
    nameKn: 'ಕಪ್ಪು ಹತ್ತಿ ಮಣ್ಣು',
    nameTa: 'கரிசல் மண்',
    nameTe: 'నల్లరేగడి నేలలు',
    desc: 'High clay, moisture-dense, cracks in summer',
    descKn: 'ತೇವಾಂಶ ಹಿಡಿದಿಡುವ, ಬೇಸಿಗೆಯಲ್ಲಿ ಬಿರುಕು ಬಿಡುವ ಮಣ್ಣು',
    colorSwatch: 'bg-stone-800',
    bestCrops: 'Cotton, Jowar, Red Gram, Chickpea',
    iconComponent: Layers,
  },
  {
    id: 'loamy',
    name: 'Loamy Soil',
    nameKn: 'ಗೋಡು ಮಣ್ಣು',
    nameTa: 'வண்டல் மண்',
    nameTe: 'ఒండ్రు నేలలు',
    desc: 'Balanced sand, silt & clay; super fertile',
    descKn: 'ಮರಳು ಮತ್ತು ಜೇಡಿಯ ಸಮತೋಲನ; ಅತಿ ಫಲವತ್ತಾದ ಮಣ್ಣು',
    colorSwatch: 'bg-amber-800',
    bestCrops: 'Vegetables, Maize, Banana, Papaya',
    iconComponent: Sprout,
  },
  {
    id: 'clay',
    name: 'Clay Soil',
    nameKn: 'ಜೇಡಿ ಮಣ್ಣು',
    nameTa: 'களிமண்',
    nameTe: 'బంకమట్టి నేలలు',
    desc: 'Dense, sticky, holds standing water',
    descKn: 'ಅಂಟಂಟಾದ, ನೀರು ಇಂಗದೆ ನಿಲ್ಲುವ ಗದ್ದೆ ಮಣ್ಣು',
    colorSwatch: 'bg-yellow-900',
    bestCrops: 'Paddy (Rice), Wheat, Sugarcane',
    iconComponent: Droplets,
  },
  {
    id: 'sandy',
    name: 'Sandy Soil',
    nameKn: 'ಮರಳು ಮಣ್ಣು',
    nameTa: 'மணல் மண்',
    nameTe: 'ఇసుక నేలలు',
    desc: 'Gritty, fast drainage, warm soil',
    descKn: 'ತರಿಯಾದ, ಬೇಗ ನೀರು ಇಂಗುವ ಹಗುರ ಮಣ್ಣು',
    colorSwatch: 'bg-amber-400',
    bestCrops: 'Watermelon, Bajra, Groundnut',
    iconComponent: Sun,
  },
  {
    id: 'alluvial',
    name: 'Alluvial Soil',
    nameKn: 'ಮೆಕ್ಕಲು / ನದಿ ಗೋಡು',
    nameTa: 'ஆற்று வண்டல் மண்',
    nameTe: 'డెల్టా ఒండ్రు నేలలు',
    desc: 'River silt deposit, extremely fertile',
    descKn: 'ನದಿ ಮತ್ತು ಕಾಲುವೆ ಪಾತ್ರದ ರೇಷ್ಮೆಯಂತಹ ಫಲವತ್ತಾದ ಮಣ್ಣು',
    colorSwatch: 'bg-stone-500',
    bestCrops: 'Sugarcane, Paddy, Banana, Wheat',
    iconComponent: Waves,
  },
  {
    id: 'laterite',
    name: 'Laterite Soil',
    nameKn: 'ಲ್ಯಾಟರೈಟ್ / ಮುರಕಲ್ಲು',
    nameTa: 'செம்பொறை மண்',
    nameTe: 'లేటరైట్ నేలలు',
    desc: 'Western Ghats porous acidic hill soil',
    descKn: 'ಮಲೆನಾಡು-ಕರಾವಳಿಯ ಮುರಕಲ್ಲು ಮಿಶ್ರಿತ ಆಮ್ಲೀಯ ಮಣ್ಣು',
    colorSwatch: 'bg-orange-700',
    bestCrops: 'Arecanut, Coffee, Pepper, Rubber',
    iconComponent: Mountain,
  },
];

export interface SoilTypeSelectorProps {
  selectedSoilId?: string;
  selectedType?: string;
  onSelect?: (soilId: string, textureId?: string) => void;
  onSelectType?: (soilId: string) => void;
  onOpenHelp?: () => void;
}

export const SoilTypeSelector: React.FC<SoilTypeSelectorProps> = ({
  selectedSoilId,
  selectedType,
  onSelect,
  onSelectType,
  onOpenHelp,
}) => {
  const { language } = useTranslation();
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const currentSelected = selectedSoilId || selectedType || '';

  const handleSelectSoil = (soilId: string) => {
    if (onSelect) onSelect(soilId);
    if (onSelectType) onSelectType(soilId);
  };

  return (
    <div className="space-y-3">
      {/* Help Banner */}
      <div className="flex items-center justify-between bg-brand-50 dark:bg-brand-900/20 p-3.5 rounded-3xl border border-brand-100 dark:border-brand-900/30">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-600" />
          <span className="text-[13px] font-semibold text-gray-800 dark:text-gray-200">
            {language === 'kn' ? 'ಮಣ್ಣಿನ ವಿಧ ತಿಳಿದಿಲ್ಲವೇ?' : 'Not sure which soil you have?'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            if (onOpenHelp) onOpenHelp();
            else setIsHelpOpen(true);
          }}
          className="min-h-[44px] text-xs font-bold text-white bg-brand-700 hover:bg-brand-800 px-3 py-1.5 rounded-xl transition flex items-center gap-1 shadow-xs"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{language === 'kn' ? 'ಗುರುತಿಸಲು ಸಹಾಯ' : 'Help Me Identify'}</span>
        </button>
      </div>

      {/* Grid of Soil Types */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SOIL_TYPE_OPTIONS.map((opt) => {
          const isSelected = currentSelected.toLowerCase() === opt.id.toLowerCase();
          const Icon = opt.iconComponent;
          const localizedName =
            language === 'kn' ? opt.nameKn : language === 'ta' ? opt.nameTa : language === 'te' ? opt.nameTe : opt.name;
          const localizedDesc = language === 'kn' ? opt.descKn : opt.desc;

          return (
            <motion.button
              key={opt.id}
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelectSoil(opt.id)}
              className={[
                'p-4 rounded-4xl border-2 text-left transition flex items-start justify-between gap-3 relative shadow-xs',
                isSelected
                  ? 'bg-brand-50/70 border-brand-700 dark:bg-brand-900/30 dark:border-brand-500 shadow-sm'
                  : 'bg-white dark:bg-dark-surface border-gray-200 dark:border-dark-border hover:border-brand-400',
              ].join(' ')}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-dark-elevated flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-gray-700 dark:text-gray-300" strokeWidth={1.75} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${opt.colorSwatch} shrink-0`} />
                    <span className="font-bold text-[15px] text-gray-900 dark:text-gray-100 leading-tight">
                      {localizedName}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-snug">
                    {localizedDesc}
                  </p>
                  <p className="text-[11px] text-brand-700 dark:text-brand-400 font-semibold mt-1.5">
                    Best: {opt.bestCrops}
                  </p>
                </div>
              </div>

              {/* Selection radio */}
              <div
                className={[
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition',
                  isSelected
                    ? 'border-brand-700 bg-brand-700 text-white dark:border-brand-500 dark:bg-brand-500'
                    : 'border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface',
                ].join(' ')}
              >
                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Modal */}
      <SoilHelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        onSelectSoilType={(id) => handleSelectSoil(id)}
      />
    </div>
  );
};
