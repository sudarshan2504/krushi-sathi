import React, { useState } from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { Sparkles, FileText, Check } from 'lucide-react';

export interface NpkSelectorProps {
  nitrogenLevel?: string;
  phosphorusLevel?: string;
  potassiumLevel?: string;
  onChangeN?: (level: string) => void;
  onChangeP?: (level: string) => void;
  onChangeK?: (level: string) => void;
  onNitrogenChange?: (level: any, exact?: string | number) => void;
  onPhosphorusChange?: (level: any, exact?: string | number) => void;
  onPotassiumChange?: (level: any, exact?: string | number) => void;
  exactN?: string | number;
  exactP?: string | number;
  exactK?: string | number;
  nitrogenExact?: string | number;
  phosphorusExact?: string | number;
  potassiumExact?: string | number;
  onChangeExactN?: (v: string | number) => void;
  onChangeExactP?: (v: string | number) => void;
  onChangeExactK?: (v: string | number) => void;
}

export const NpkSelector: React.FC<NpkSelectorProps> = ({
  nitrogenLevel = 'medium',
  phosphorusLevel = 'medium',
  potassiumLevel = 'medium',
  onChangeN,
  onChangeP,
  onChangeK,
  onNitrogenChange,
  onPhosphorusChange,
  onPotassiumChange,
  exactN = '',
  exactP = '',
  exactK = '',
  nitrogenExact,
  phosphorusExact,
  potassiumExact,
  onChangeExactN,
  onChangeExactP,
  onChangeExactK,
}) => {
  const { language } = useTranslation();
  const effExactN = nitrogenExact !== undefined ? nitrogenExact : exactN;
  const effExactP = phosphorusExact !== undefined ? phosphorusExact : exactP;
  const effExactK = potassiumExact !== undefined ? potassiumExact : exactK;

  const [showExactValues, setShowExactValues] = useState(Boolean(effExactN || effExactP || effExactK));

  const handleLevelN = (lvl: string) => {
    if (onChangeN) onChangeN(lvl);
    if (onNitrogenChange) onNitrogenChange(lvl.toLowerCase(), effExactN);
  };
  const handleLevelP = (lvl: string) => {
    if (onChangeP) onChangeP(lvl);
    if (onPhosphorusChange) onPhosphorusChange(lvl.toLowerCase(), effExactP);
  };
  const handleLevelK = (lvl: string) => {
    if (onChangeK) onChangeK(lvl);
    if (onPotassiumChange) onPotassiumChange(lvl.toLowerCase(), effExactK);
  };

  const handleExactN = (val: string | number) => {
    if (onChangeExactN) onChangeExactN(val);
    if (onNitrogenChange) onNitrogenChange(nitrogenLevel, val);
  };
  const handleExactP = (val: string | number) => {
    if (onChangeExactP) onChangeExactP(val);
    if (onPhosphorusChange) onPhosphorusChange(phosphorusLevel, val);
  };
  const handleExactK = (val: string | number) => {
    if (onChangeExactK) onChangeExactK(val);
    if (onPotassiumChange) onPotassiumChange(potassiumLevel, val);
  };

  const nutrientList = [
    {
      key: 'N',
      title: 'Nitrogen (N) / ಸಾರಜನಕ',
      desc: language === 'kn' ? 'ಸಸ್ಯದ ಹಸಿರು ಬೆಳವಣಿಗೆ & ಕವಲುಗಳಿಗೆ' : 'For leafy green growth & tillers',
      level: nitrogenLevel,
      onChangeLevel: handleLevelN,
      exactValue: effExactN,
      onChangeExact: handleExactN,
      color: 'bg-emerald-50 border-emerald-300 text-emerald-800',
    },
    {
      key: 'P',
      title: 'Phosphorus (P) / ರಂಜಕ',
      desc: language === 'kn' ? 'ಬೇರಿನ ಆಳವಾದ ಬೆಳವಣಿಗೆ & ಹೂವಿಗೆ' : 'For root development & early flowering',
      level: phosphorusLevel,
      onChangeLevel: handleLevelP,
      exactValue: effExactP,
      onChangeExact: handleExactP,
      color: 'bg-amber-50 border-amber-300 text-amber-800',
    },
    {
      key: 'K',
      title: 'Potassium (K) / ಪೊಟ್ಯಾಷ್',
      desc: language === 'kn' ? 'ರೋಗ ನಿರೋಧಕತೆ & ಕಾಳು/ಹಣ್ಣಿನ ತೂಕಕ್ಕೆ' : 'For disease defense & plump fruit size',
      level: potassiumLevel,
      onChangeLevel: handleLevelK,
      exactValue: effExactK,
      onChangeExact: handleExactK,
      color: 'bg-blue-50 border-blue-300 text-blue-800',
    },
  ];

  const levels = [
    { id: 'Low', label: language === 'kn' ? 'ಕಡಿಮೆ' : 'Low', desc: '< 280 kg/ha' },
    { id: 'Medium', label: language === 'kn' ? 'ಮಧ್ಯಮ' : 'Medium', desc: '280-560 kg/ha' },
    { id: 'High', label: language === 'kn' ? 'ಹೆಚ್ಚು' : 'High', desc: '> 560 kg/ha' },
  ];

  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
            <span>{language === 'kn' ? 'N-P-K ಮಣ್ಣಿನ ಫಲವತ್ತತೆ ಮಟ್ಟ' : 'N-P-K Soil Fertility Levels'}</span>
            <span className="text-[11px] text-gray-600 dark:text-gray-400 font-normal">
              ({language === 'kn' ? 'ಐಚ್ಛಿಕ' : 'Optional'})
            </span>
          </h3>
          <p className="text-[11px] text-gray-600 dark:text-gray-400">
            {language === 'kn'
              ? 'ಮಣ್ಣು ಆರೋಗ್ಯ ಕಾರ್ಡ್ (Soil Health Card) ಪ್ರಕಾರ ಸರಳ ಆಯ್ಕೆ'
              : 'Choose simple rating from your Soil Health Card'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowExactValues(!showExactValues)}
          className="min-h-[44px] px-2 text-xs text-forest hover:text-forest-dark font-bold underline flex items-center gap-1"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>{showExactValues ? 'Simple Mode' : 'Exact kg/ha'}</span>
        </button>
      </div>

      <div className="space-y-3">
        {nutrientList.map((nutrient) => (
          <div key={nutrient.key} className="p-3 rounded-xl bg-gray-50/70 border border-gray-100">
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="text-xs font-bold text-gray-900 dark:text-gray-100">{nutrient.title}</span>
                <p className="text-[11px] text-gray-600 dark:text-gray-400">{nutrient.desc}</p>
              </div>
            </div>

            {!showExactValues ? (
              <div className="grid grid-cols-3 gap-2">
                {levels.map((lvl) => {
                  const isSelected = nutrient.level === lvl.id;
                  return (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => nutrient.onChangeLevel(lvl.id)}
                      className={`min-h-[44px] py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                        isSelected
                          ? 'bg-forest text-white border-forest shadow-sm'
                          : 'bg-white text-gray-900 dark:text-gray-100 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                      <span>{lvl.label}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  aria-label={`${nutrient.title} in kg/ha`}
                  placeholder="e.g. 250"
                  value={nutrient.exactValue}
                  onChange={(e) => nutrient.onChangeExact && nutrient.onChangeExact(e.target.value)}
                  className="flex-1 min-h-[44px] px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest"
                />
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">kg/ha</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
