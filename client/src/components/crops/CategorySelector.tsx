import React from 'react';
import { motion } from 'framer-motion';
import {
  Wheat,
  CircleDot,
  Carrot,
  Apple,
  Flower2,
  Trees,
  Flame,
  Droplets,
  Sprout,
  Grid,
} from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';

export interface CategoryItem {
  id: string;
  name: string;
  nameKn: string;
  nameTa: string;
  nameTe: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  badge?: string;
}

export const CROP_CATEGORIES: CategoryItem[] = [
  {
    id: 'all',
    name: 'All Categories',
    nameKn: 'ಎಲ್ಲಾ ವರ್ಗಗಳು',
    nameTa: 'அனைத்து வகைகள்',
    nameTe: 'అన్ని వర్గాలు',
    description: 'Browse all available crop options',
    icon: Grid,
    color: 'emerald',
  },
  {
    id: 'cereal_millet',
    name: 'Cereals & Millets',
    nameKn: 'ಧಾನ್ಯಗಳು & ಸಿರಿಧಾನ್ಯಗಳು',
    nameTa: 'தானியங்கள் & தினை',
    nameTe: 'ధాన్యాలు & చిరుధాన్యాలు',
    description: 'Ragi, Jowar, Bajra, Rice, Wheat',
    icon: Wheat,
    color: 'amber',
  },
  {
    id: 'pulse',
    name: 'Pulses & Legumes',
    nameKn: 'ಬೇಳೆಕಾಳುಗಳು',
    nameTa: 'பருப்பு வகைகள்',
    nameTe: 'పప్పుదినుసులు',
    description: 'Gram, Tur, Moong, Urad, Cowpea',
    icon: CircleDot,
    color: 'yellow',
  },
  {
    id: 'vegetable',
    name: 'Vegetables',
    nameKn: 'ತರಕಾರಿಗಳು',
    nameTa: 'காய்கறிகள்',
    nameTe: 'కూరగాయలు',
    description: 'Tomato, Onion, Chilli, Brinjal, Bhendi',
    icon: Carrot,
    color: 'red',
  },
  {
    id: 'fruit',
    name: 'Fruits (Seasonal)',
    nameKn: 'ಹಣ್ಣುಗಳು (ಋತುಮಾನ)',
    nameTa: 'பழங்கள் (பருவகால)',
    nameTe: 'పండ్లు (కాలానుగుణ)',
    description: 'Mango, Guava, Pomegranate, Banana, Watermelon',
    icon: Apple,
    color: 'orange',
    badge: 'Seasonal',
  },
  {
    id: 'flower',
    name: 'Commercial Flowers',
    nameKn: 'ವಾಣಿಜ್ಯ ಹೂವುಗಳು',
    nameTa: 'வணிக மலர்கள்',
    nameTe: 'వాణిజ్య పూలు',
    description: 'Marigold, Jasmine, Rose, Chrysanthemum',
    icon: Flower2,
    color: 'pink',
    badge: 'High Value',
  },
  {
    id: 'plantation',
    name: 'Plantation & Long-Term',
    nameKn: 'ತೋಟಗಾರಿಕೆ & ದೀರ್ಘಾವಧಿ',
    nameTa: 'தோட்டப்பயிர்கள் & நீண்டகாலம்',
    nameTe: 'తోటపంటలు & దీర్ಘకాలిక',
    description: 'Arecanut, Coconut, Coffee, Rubber, Sandalwood, Teak',
    icon: Trees,
    color: 'teal',
    badge: 'Wealth Assets',
  },
  {
    id: 'spice',
    name: 'Spices & Condiments',
    nameKn: 'ಮಸಾಲೆ ಬೆಳೆಗಳು',
    nameTa: 'மசாலா பயிர்கள்',
    nameTe: 'సుగంధ ద్రవ్యాలు',
    description: 'Turmeric, Ginger, Black Pepper, Cardamom',
    icon: Flame,
    color: 'rose',
    badge: 'High Return',
  },
  {
    id: 'oilseed',
    name: 'Oilseeds',
    nameKn: 'ಎಣ್ಣೆಕಾಳುಗಳು',
    nameTa: 'எண்ணெய் வித்துக்கள்',
    nameTe: 'నూనెగింజలు',
    description: 'Groundnut, Sunflower, Mustard, Soybean',
    icon: Droplets,
    color: 'amber',
  },
  {
    id: 'fodder',
    name: 'Fodder & Forage',
    nameKn: 'ಮೇವಿನ ಬೆಳೆಗಳು',
    nameTa: 'தீவனப் பயிர்கள்',
    nameTe: 'మేత పంటలు',
    description: 'Super Napier CO-5, Sorghum Fodder, Cowpea',
    icon: Sprout,
    color: 'emerald',
    badge: 'Dairy Feed',
  },
];

interface CategorySelectorProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  cropCounts?: Record<string, number>;
  compact?: boolean;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory,
  onSelectCategory,
  cropCounts = {},
  compact = false,
}) => {
  const { language } = useTranslation();

  const getLabel = (cat: CategoryItem) => {
    switch (language) {
      case 'kn':
        return cat.nameKn;
      case 'ta':
        return cat.nameTa;
      case 'te':
        return cat.nameTe;
      default:
        return cat.name;
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none flex-nowrap touch-pan-x">
        {CROP_CATEGORIES.map((cat) => {
          const isSelected =
            selectedCategory === cat.id ||
            (selectedCategory === '' && cat.id === 'all') ||
            (selectedCategory === 'cereal' && cat.id === 'cereal_millet');
          const Icon = cat.icon;
          const count = cat.id === 'all' ? undefined : cropCounts[cat.id];

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id === 'all' ? '' : cat.id)}
              className={`min-h-[44px] flex-shrink-0 relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-1 cursor-pointer ${
                isSelected
                  ? 'bg-forest text-white border border-forest shadow-sm'
                  : 'bg-white text-gray-900 dark:text-gray-100 border border-gray-200 hover:border-forest/40'
              }`}
            >
              <span className="relative z-10 flex items-center gap-2">
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-forest'}`} />
                <span>{getLabel(cat)}</span>
                {count !== undefined && count > 0 && (
                  <span
                    className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected ? 'bg-forest-dark text-white' : 'bg-gray-100 text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-earth-800 tracking-wide uppercase">
            {language === 'kn'
              ? 'ಬೆಳೆ ವರ್ಗಗಳು'
              : language === 'ta'
              ? 'பயிர் வகைகள்'
              : language === 'te'
              ? 'పంట వర్గాలు'
              : 'Crop Categories'}
          </h3>
          <p className="text-xs text-earth-600">
            {language === 'kn'
              ? 'ನಿಮ್ಮ ಆಸಕ್ತಿಯ ಬೆಳೆ ಪ್ರಕಾರವನ್ನು ಆರಿಸಿ'
              : language === 'ta'
              ? 'உங்கள் ஆர்வமுள்ள பயிர் வகையைத் தேர்ந்தெடுக்கவும்'
              : language === 'te'
              ? 'మీ ఆసక్తి ఉన్న పంట రకాన్ని ఎంచుకోండి'
              : 'Select a category to view specific crop recommendations'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
        {CROP_CATEGORIES.map((cat) => {
          const isSelected =
            selectedCategory === cat.id ||
            (selectedCategory === '' && cat.id === 'all') ||
            (selectedCategory === 'cereal' && cat.id === 'cereal_millet');
          const Icon = cat.icon;
          const count = cat.id === 'all' ? undefined : cropCounts[cat.id];

          return (
            <motion.button
              key={cat.id}
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelectCategory(cat.id === 'all' ? '' : cat.id)}
              className={`min-h-[44px] relative flex flex-col items-start p-3 rounded-2xl text-left transition-all border focus:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-1 cursor-pointer ${
                isSelected
                  ? 'bg-forest text-white border-forest shadow-md'
                  : 'bg-white hover:bg-forest-50/40 text-gray-900 dark:text-gray-100 border-gray-200 hover:border-forest/40 shadow-xs'
              }`}
            >
              {cat.badge && (
                <span
                  className={`absolute top-2 right-2 text-[11px] font-bold px-1.5 py-0.5 rounded-full z-10 ${
                    isSelected
                      ? 'bg-white/20 text-white border border-white/30'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {cat.badge}
                </span>
              )}

              <div
                className={`relative z-10 w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-forest-50 text-forest'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              <div className="relative z-10 w-full">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-bold leading-snug line-clamp-1">{getLabel(cat)}</span>
                  {count !== undefined && count > 0 && (
                    <span
                      className={`text-[11px] font-semibold px-1.5 py-0.2 rounded-full ${
                        isSelected ? 'bg-forest-dark text-white' : 'bg-gray-100 text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </div>
                <p
                  className={`text-[11px] mt-0.5 line-clamp-1 ${
                    isSelected ? 'text-white/95' : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {cat.description}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
