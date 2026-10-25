import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, HelpCircle, Sparkles } from 'lucide-react';
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
  icon: string;
  bestCrops: string;
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
    icon: '🧱',
    bestCrops: 'Ragi, Groundnut, Tomato, Mango',
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
    icon: '🌑',
    bestCrops: 'Cotton, Jowar, Red Gram, Chickpea',
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
    icon: '🌱',
    bestCrops: 'Vegetables, Maize, Banana, Papaya',
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
    icon: '🏺',
    bestCrops: 'Paddy (Rice), Wheat, Sugarcane',
  },
  {
    id: 'sandy',
    name: 'Sandy Soil',
    nameKn: 'ಮರಳು ಮಣ್ಣು',
    nameTa: 'மணல் மண்',
    nameTe: 'ఇసుక నేలలు',
    desc: 'Gritty, fast drainage, warm soil',
    descKn: 'ತರಿಯಾದ, ಬೇಗ ನೀರು ಇಂಗುವ ಹಗುರ ಮಣ್ಣು',
    colorSwatch: 'bg-amber-300',
    icon: '🏖️',
    bestCrops: 'Watermelon, Bajra, Groundnut',
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
    icon: '🌊',
    bestCrops: 'Sugarcane, Paddy, Banana, Wheat',
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
    icon: '⛰️',
    bestCrops: 'Arecanut, Coffee, Pepper, Rubber',
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
      <div className="flex items-center justify-between bg-gradient-to-r from-mint/30 to-leaf/20 p-3 rounded-2xl border border-leaf/30">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-forest" />
          <span className="text-xs font-bold text-dark-text">
            {language === 'kn' ? 'ಮಣ್ಣಿನ ವಿಧ ತಿಳಿದಿಲ್ಲವೇ?' : 'Not sure which soil you have?'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            if (onOpenHelp) onOpenHelp();
            else setIsHelpOpen(true);
          }}
          className="text-xs font-bold text-white bg-forest hover:bg-forest-dark px-3 py-1.5 rounded-xl transition flex items-center gap-1 shadow-sm"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{language === 'kn' ? 'ಗುರುತಿಸಲು ಸಹಾಯ' : 'Help Me Identify'}</span>
        </button>
      </div>

      {/* Grid of Soil Types */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {SOIL_TYPE_OPTIONS.map((opt) => {
          const isSelected = currentSelected.toLowerCase() === opt.id.toLowerCase();
          const localizedName =
            language === 'kn' ? opt.nameKn : language === 'ta' ? opt.nameTa : language === 'te' ? opt.nameTe : opt.name;
          const localizedDesc = language === 'kn' ? opt.descKn : opt.desc;

          return (
            <motion.button
              key={opt.id}
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelectSoil(opt.id)}
              className={`p-3.5 rounded-2xl border-2 text-left transition flex items-start justify-between gap-3 relative ${
                isSelected
                  ? 'bg-forest/5 border-forest shadow-md'
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl mt-0.5">{opt.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-dark-text">
                      {localizedName}
                    </span>
                  </div>
                  <p className="text-xs text-dark-muted mt-0.5 leading-snug">
                    {localizedDesc}
                  </p>
                  <p className="text-[10px] text-harvest font-semibold mt-1">
                    Best: {opt.bestCrops}
                  </p>
                </div>
              </div>

              {/* Selection radio/check */}
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition ${
                  isSelected
                    ? 'border-forest bg-forest text-white'
                    : 'border-gray-300 bg-white'
                }`}
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
