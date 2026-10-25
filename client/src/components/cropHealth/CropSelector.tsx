import React from 'react';
import { motion } from 'framer-motion';
import { Check, Sprout } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';

export interface CropOption {
  id: string;
  name: string;
  scientificName?: string;
  nameKannada?: string;
  nameTamil?: string;
  nameTelugu?: string;
  category: string;
  imageUrl?: string;
  problemCount: number;
}

interface CropSelectorProps {
  crops: CropOption[];
  selectedCropId: string;
  onSelectCrop: (crop: CropOption) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const CATEGORIES = [
  { key: 'all', labelKey: 'catAll' },
  { key: 'cereal', labelKey: 'catCereals' },
  { key: 'millet', labelKey: 'catMillets' },
  { key: 'pulse', labelKey: 'catPulses' },
  { key: 'oilseed', labelKey: 'catOilseeds' },
  { key: 'vegetable', labelKey: 'catVegetables' },
  { key: 'fruit', labelKey: 'catFruits' },
  { key: 'flower', labelKey: 'catFlowers' },
  { key: 'plantation', labelKey: 'catPlantation' },
  { key: 'spices', labelKey: 'catSpices' },
  { key: 'commercial', labelKey: 'catCommercial' },
  { key: 'medicinal', labelKey: 'catMedicinal' },
];

export const CropSelector: React.FC<CropSelectorProps> = ({
  crops,
  selectedCropId,
  onSelectCrop,
  selectedCategory,
  onSelectCategory,
}) => {
  const { t, language } = useTranslation();

  const getCropLocalizedName = (crop: CropOption) => {
    if (language === 'kn' && crop.nameKannada) return crop.nameKannada;
    if (language === 'ta' && crop.nameTamil) return crop.nameTamil;
    if (language === 'te' && crop.nameTelugu) return crop.nameTelugu;
    return crop.name;
  };

  const filteredCrops = selectedCategory === 'all'
    ? crops
    : crops.filter(c => c.category?.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="space-y-4">
      {/* Category Horizontal Scrolling Chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x">
        {CATEGORIES.map(cat => {
          const isSelected = selectedCategory === cat.key;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => onSelectCategory(cat.key)}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap snap-start transition-all cursor-pointer min-h-[44px] flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-forest text-white shadow-sm ring-2 ring-forest/30 scale-102'
                  : 'bg-white text-dark-text border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              {t(cat.labelKey as any) || cat.key}
            </button>
          );
        })}
      </div>

      {/* Crop Cards Horizontal Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
        {filteredCrops.map(crop => {
          const isSelected = crop.id === selectedCropId;
          const localizedName = getCropLocalizedName(crop);

          return (
            <motion.div
              key={crop.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelectCrop(crop)}
              className={`relative rounded-2xl p-2.5 transition-all cursor-pointer border flex flex-col items-center text-center ${
                isSelected
                  ? 'bg-emerald-50/80 border-forest shadow-md ring-2 ring-forest/20'
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              {/* Selected Badge */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-forest text-white rounded-full flex items-center justify-center shadow-sm">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}

              {/* Crop Photo / Thumbnail */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden mb-2 bg-gray-100 flex items-center justify-center border border-gray-100 shadow-inner">
                {crop.imageUrl ? (
                  <img
                    src={crop.imageUrl}
                    alt={crop.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <Sprout className="w-8 h-8 text-forest/40" />
                )}
              </div>

              {/* Localized Name */}
              <div className="text-xs sm:text-sm font-bold text-dark-text line-clamp-1 w-full">
                {localizedName}
              </div>

              {/* English secondary name if not in English */}
              {language !== 'en' && (
                <div className="text-[10px] text-gray-500 line-clamp-1 w-full">
                  {crop.name.split('(')[0]}
                </div>
              )}

              {/* Problem Count Badge */}
              <div className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600">
                {crop.problemCount} {t('pestAndDiseases') ? 'problems' : 'issues'}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
