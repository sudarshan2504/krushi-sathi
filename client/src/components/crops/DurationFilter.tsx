import React from 'react';
import { Clock, Zap, Calendar, History, Trees } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';

export interface DurationOption {
  id: string;
  label: string;
  labelKn: string;
  labelTa: string;
  labelTe: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const DURATION_OPTIONS: DurationOption[] = [
  {
    id: 'all',
    label: 'All Durations',
    labelKn: 'ಎಲ್ಲಾ ಅವಧಿ',
    labelTa: 'அனைத்து கால அளவுகள்',
    labelTe: 'అన్ని కాలపరిమితులు',
    description: 'Any duration',
    icon: Clock,
  },
  {
    id: 'short',
    label: 'Short (<90 days)',
    labelKn: 'ಅಲ್ಪಾವಧಿ (<೯೦ ದಿನ)',
    labelTa: 'குறுகிய காலம் (<90 நாட்கள்)',
    labelTe: 'స్వల్పకాలిక (<90 రోజులు)',
    description: 'Fast cashflow (Pulses, Greens, Fodder)',
    icon: Zap,
  },
  {
    id: 'medium',
    label: 'Medium (90-180 days)',
    labelKn: 'ಮಧ್ಯಮಾವಧಿ (೯೦-೧೮೦ ದಿನ)',
    labelTa: 'நடுத்தர காலம் (90-180 நாட்கள்)',
    labelTe: 'మధ్యస్థ కాలం (90-180 రోజులు)',
    description: 'Seasonal grain & oilseeds (Ragi, Groundnut)',
    icon: Calendar,
  },
  {
    id: 'long',
    label: 'Long (180-365 days)',
    labelKn: 'ದೀರ್ಘಾವಧಿ (೧೮೦-೩೬೫ ದಿನ)',
    labelTa: 'நீண்ட காலம் (180-365 நாட்கள்)',
    labelTe: 'దీర్ಘకాలిక (180-365 రోజులు)',
    description: 'Annuals (Sugarcane, Turmeric, Ginger)',
    icon: History,
  },
  {
    id: 'perennial',
    label: 'Perennial (>1 Year)',
    labelKn: 'ಬಹುವಾರ್ಷಿಕ (>೧ ವರ್ಷ)',
    labelTa: 'பல்லாண்டு (>1 வருடம்)',
    labelTe: 'బహువార్షిక (>1 సంవత్సరం)',
    description: 'Plantation & Forestry (Areca, Coconut, Teak)',
    icon: Trees,
  },
];

interface DurationFilterProps {
  selectedDuration: string;
  onSelectDuration: (duration: string) => void;
}

export const DurationFilter: React.FC<DurationFilterProps> = ({
  selectedDuration,
  onSelectDuration,
}) => {
  const { language } = useTranslation();

  const getLabel = (opt: DurationOption) => {
    switch (language) {
      case 'kn':
        return opt.labelKn;
      case 'ta':
        return opt.labelTa;
      case 'te':
        return opt.labelTe;
      default:
        return opt.label;
    }
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
      {DURATION_OPTIONS.map((opt) => {
        const isSelected =
          selectedDuration === opt.id || (selectedDuration === '' && opt.id === 'all');
        const Icon = opt.icon;

        return (
          <button
            key={opt.id}
            onClick={() => onSelectDuration(opt.id === 'all' ? '' : opt.id)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
              isSelected
                ? 'bg-forest-600 text-white border-forest-600 shadow-sm'
                : 'bg-white text-earth-700 hover:bg-earth-50 border-earth-200'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-mint-300' : 'text-earth-500'}`} />
            <span>{getLabel(opt)}</span>
          </button>
        );
      })}
    </div>
  );
};
