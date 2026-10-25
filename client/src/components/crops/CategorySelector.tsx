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
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
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
              onClick={() => onSelectCategory(cat.id === 'all' ? '' : cat.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm ${
                isSelected
                  ? 'bg-forest-600 text-white shadow-forest-600/20 shadow-md ring-2 ring-forest-500/30'
                  : 'bg-white text-earth-700 hover:bg-earth-50 border border-earth-200/80 hover:border-earth-300'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-mint-300' : 'text-forest-600'}`} />
              <span>{getLabel(cat)}</span>
              {count !== undefined && count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-forest-700 text-mint-200' : 'bg-earth-100 text-earth-600'
                  }`}
                >
                  {count}
                </span>
              )}
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
          <p className="text-xs text-earth-500">
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
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelectCategory(cat.id === 'all' ? '' : cat.id)}
              className={`relative flex flex-col items-start p-3 rounded-2xl text-left transition-all border ${
                isSelected
                  ? 'bg-gradient-to-br from-forest-600 to-forest-700 text-white border-forest-500 shadow-md ring-2 ring-forest-400/40'
                  : 'bg-white hover:bg-forest-50/40 text-earth-800 border-earth-200/80 hover:border-forest-300 shadow-xs'
              }`}
            >
              {cat.badge && (
                <span
                  className={`absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                    isSelected
                      ? 'bg-mint-400/20 text-mint-200 border border-mint-300/30'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {cat.badge}
                </span>
              )}

              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${
                  isSelected ? 'bg-white/15 text-mint-300' : 'bg-forest-100/70 text-forest-700'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              <div className="w-full">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-bold leading-snug line-clamp-1">{getLabel(cat)}</span>
                  {count !== undefined && count > 0 && (
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full ${
                        isSelected ? 'bg-forest-800 text-mint-200' : 'bg-earth-100 text-earth-600'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </div>
                <p
                  className={`text-[10px] mt-0.5 line-clamp-1 ${
                    isSelected ? 'text-forest-100/80' : 'text-earth-400'
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
