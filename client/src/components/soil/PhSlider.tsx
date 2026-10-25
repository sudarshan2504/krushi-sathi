import React, { useState } from 'react';
import { HelpCircle, Check, Info } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';

export interface PhSliderProps {
  value: string | number;
  onChange: (val: string | number) => void;
  isUnknown?: boolean;
  onToggleUnknown?: (unk: boolean) => void;
}

export const PhSlider: React.FC<PhSliderProps> = ({
  value,
  onChange,
  isUnknown: controlledUnknown,
  onToggleUnknown,
}) => {
  const { language } = useTranslation();
  const [internalDontKnow, setInternalDontKnow] = useState(value === '' || value === null || value === undefined);
  const dontKnow = controlledUnknown !== undefined ? controlledUnknown : internalDontKnow;

  const numVal = typeof value === 'number' ? value : value ? parseFloat(value as string) : 6.8;

  const handleToggleDontKnow = () => {
    const nextState = !dontKnow;
    setInternalDontKnow(nextState);
    if (onToggleUnknown) onToggleUnknown(nextState);
    if (nextState) {
      onChange('');
    } else {
      onChange(6.8);
    }
  };

  const getPhStatus = (ph: number) => {
    if (ph < 5.5) {
      return {
        label: language === 'kn' ? 'ತೀವ್ರ ಆಮ್ಲೀಯ ಮಣ್ಣು (ಸುಣ್ಣ ಸೇರಿಸಿ)' : 'Strongly Acidic (Apply Ag Lime)',
        color: 'text-amber-700 bg-amber-50 border-amber-200',
        barColor: 'from-red-500 to-amber-500',
      };
    } else if (ph <= 6.5) {
      return {
        label: language === 'kn' ? 'ಸ್ವಲ್ಪ ಆಮ್ಲೀಯ (ತೋಟದ ಬೆಳೆಗಳಿಗೆ ಸೂಕ್ತ)' : 'Slightly Acidic (Great for Spices/Paddy)',
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        barColor: 'from-amber-400 to-emerald-400',
      };
    } else if (ph <= 7.5) {
      return {
        label: language === 'kn' ? 'ಆದರ್ಶ ತಟಸ್ಥ ಮಣ್ಣು (ಅತ್ಯುತ್ತಮ ಫಲವತ್ತತೆ)' : 'Optimal Neutral Soil (Best for All Crops)',
        color: 'text-forest bg-mint/20 border-leaf/30',
        barColor: 'from-emerald-400 to-teal-500',
      };
    } else if (ph <= 8.5) {
      return {
        label: language === 'kn' ? 'ಮಧ್ಯಮ ಕ್ಷಾರೀಯ (ಜಿಪ್ಸಮ್ ಶಿಫಾರಸು)' : 'Moderately Alkaline (Gypsum Recommended)',
        color: 'text-blue-700 bg-blue-50 border-blue-200',
        barColor: 'from-teal-500 to-blue-500',
      };
    } else {
      return {
        label: language === 'kn' ? 'ತೀವ್ರ ಕ್ಷಾರೀಯ (ಉಪ್ಪು ಮಣ್ಣು)' : 'Strongly Alkaline (Saline / Sodic)',
        color: 'text-purple-700 bg-purple-50 border-purple-200',
        barColor: 'from-blue-500 to-purple-600',
      };
    }
  };

  const status = getPhStatus(numVal);

  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-bold text-dark-text flex items-center gap-1.5">
            <span>{language === 'kn' ? 'ಮಣ್ಣಿನ pH ಮೌಲ್ಯ' : 'Soil pH Value (Acidity / Alkalinity)'}</span>
            <span className="text-[10px] text-dark-muted font-normal">
              ({language === 'kn' ? 'ಐಚ್ಛಿಕ' : 'Optional'})
            </span>
          </label>
          <p className="text-[11px] text-dark-muted">
            {language === 'kn'
              ? 'ಪ್ರಯೋಗಾಲಯ ಅಥವಾ pH ಪೇಪರ್ ಪರೀಕ್ಷೆಯ ಫಲಿತಾಂಶ'
              : 'From lab soil health card or indicator paper'}
          </p>
        </div>

        {/* Don't know toggle */}
        <button
          type="button"
          onClick={handleToggleDontKnow}
          className={`text-xs px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
            dontKnow
              ? 'bg-forest text-white shadow-sm'
              : 'bg-gray-100 text-dark-muted hover:text-dark-text hover:bg-gray-200'
          }`}
        >
          {dontKnow && <Check className="w-3.5 h-3.5" />}
          <span>{language === 'kn' ? 'ತಿಳಿದಿಲ್ಲ' : "I Don't Know"}</span>
        </button>
      </div>

      {!dontKnow ? (
        <div className="space-y-3 pt-1">
          {/* Numerical display and status badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-forest">
                {numVal.toFixed(1)}
              </span>
              <span className="text-xs font-semibold text-dark-muted">pH</span>
            </div>

            <div className={`text-xs px-3 py-1 rounded-xl font-bold border ${status.color}`}>
              {status.label}
            </div>
          </div>

          {/* Slider input */}
          <div className="relative pt-2">
            <input
              type="range"
              min="4.0"
              max="9.0"
              step="0.1"
              value={numVal}
              onChange={(e) => onChange(parseFloat(e.target.value))}
              className="w-full h-3 bg-gradient-to-r from-red-500 via-emerald-400 via-teal-400 to-purple-600 rounded-lg appearance-none cursor-pointer accent-forest focus:outline-none"
            />

            {/* Scale markers */}
            <div className="flex justify-between text-[10px] font-semibold text-dark-muted mt-1 px-1">
              <span>4.0 (Acidic)</span>
              <span>6.0</span>
              <span className="font-bold text-forest">7.0 (Neutral)</span>
              <span>8.0</span>
              <span>9.0 (Alkaline)</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-cream/40 rounded-xl p-3 text-xs text-dark-muted flex items-start gap-2 border border-earth/20">
          <Info className="w-4 h-4 text-forest shrink-0 mt-0.5" />
          <span>
            {language === 'kn'
              ? 'ಪರವಾಗಿಲ್ಲ! ನಮ್ಮ ಶಿಫಾರಸು ಎಂಜಿನ್ ನಿಮ್ಮ ಪ್ರದೇಶದ ಸರಾಸರಿ ಮಣ್ಣಿನ ಗುಣಲಕ್ಷಣಗಳನ್ನು ಆಧರಿಸಿ ಸೂಕ್ತ ಬೆಳೆಗಳನ್ನು ಸೂಚಿಸುತ್ತದೆ.'
              : 'No problem! Our recommendation engine will use standard regional agronomy benchmarks for your soil type.'}
          </span>
        </div>
      )}
    </div>
  );
};
