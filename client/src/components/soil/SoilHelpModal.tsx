import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Sparkles, HelpCircle, HandMetal, Sun, Waves } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';

export interface SoilHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSoilType?: (soilId: string, textureId?: string) => void;
  onSelectSoil?: (soilId: string, textureId?: string) => void;
}

export const SoilHelpModal: React.FC<SoilHelpModalProps> = ({
  isOpen,
  onClose,
  onSelectSoilType,
  onSelectSoil,
}) => {
  const { t, language } = useTranslation();

  const handleSelect = (soilId: string, textureId?: string) => {
    if (onSelectSoilType) onSelectSoilType(soilId, textureId);
    if (onSelectSoil) onSelectSoil(soilId, textureId);
    onClose();
  };

  if (!isOpen) return null;

  const soilTestOptions = [
    {
      id: 'black',
      texture: 'fine_clayey',
      title: 'Black Soil (ಕಪ್ಪು ಮಣ್ಣು / கரிசல் மண்)',
      badge: 'Cracks in Summer',
      cues: [
        'Forms wide, deep vertical cracks in hot summer sun',
        'Becomes extremely sticky and heavy like grease when wet',
        'Deep black to dark greyish-brown colour',
        'Retains water for days without drying'
      ],
      cuesKn: [
        'ಬೇಸಿಗೆ ಬಿಸಿಲಿನಲ್ಲಿ ಆಳವಾದ ಬಿರುಕುಗಳು ಬಿಡುತ್ತವೆ',
        'ನೀರು ಬಿದ್ದಾಗ ಬೆಣ್ಣೆಯಂತೆ ಜಾರುತ್ತದೆ ಮತ್ತು ಅಂಟಿಕೊಳ್ಳುತ್ತದೆ',
        'ದಟ್ಟ ಕಪ್ಪು ಅಥವಾ ಬೂದು ಬಣ್ಣ',
        'ತೇವಾಂಶವನ್ನು ಬಹಳ ದಿನಗಳವರೆಗೆ ಹಿಡಿದಿಟ್ಟುಕೊಳ್ಳುತ್ತದೆ'
      ],
      suitable: 'Cotton, Jowar, Chickpea, Chilli, Red Gram'
    },
    {
      id: 'red',
      texture: 'medium_loamy',
      title: 'Red Soil (ಕೆಂಪು ಮಣ್ಣು / செம்மண்)',
      badge: 'Porous & Friable',
      color: 'bg-red-600',
      cues: [
        'Rich reddish-brown or brick-red colour from iron oxides',
        'Drains rainwater easily without water stagnation',
        'Forms a loose crumbly ball when moist, easy to plough',
        'Doesn’t crack or form sticky clods'
      ],
      cuesKn: [
        'ಕಬ್ಬಿಣದ ಅಂಶವಿರುವ ಇಟ್ಟಿಗೆಯಂತಹ ಕೆಂಪು ಬಣ್ಣ',
        'ಮಳೆ ನೀರು ಸುಲಭವಾಗಿ ಇಂಗುತ್ತದೆ, ನೀರು ನಿಲ್ಲುವುದಿಲ್ಲ',
        'ಉಳುಮೆ ಮಾಡಲು ಹಗುರ ಮತ್ತು ಮೃದುವಾಗಿರುತ್ತದೆ',
        'ಬೇಸಿಗೆಯಲ್ಲಿ ಬಿರುಕು ಬಿಡುವುದಿಲ್ಲ'
      ],
      suitable: 'Ragi, Groundnut, Tomato, Mango, Turmeric'
    },
    {
      id: 'loamy',
      texture: 'medium_loamy',
      title: 'Loamy Soil (ಗೋಡು ಮಣ್ಣು / வண்டல் மண்)',
      badge: 'Best All-Rounder',
      color: 'bg-amber-800',
      cues: [
        'Forms a soft, spongy ball when wet that crumbles easily when thumb-pressed',
        'Equal balanced feel of sand and clay, dark rich colour',
        'Smells fresh and earthy with rich compost smell',
        'Top performer for nearly all vegetables and fruits'
      ],
      cuesKn: [
        'ಕೈಯಲ್ಲಿ ಹಿಡಿದು ಒತ್ತಿದಾಗ ಉಂಡೆಯಾಗಿ ಹೆಬ್ಬೆರಳಿಗೆ ಮೃದುವಾಗಿ ಪುಡಿಯಾಗುತ್ತದೆ',
        'ಮರಳು ಮತ್ತು ಜೇಡಿಯ ಸಮತೋಲನ ಮಿಶ್ರಣ',
        'ಸಾವಯವ ಸಮೃದ್ಧ ತಾಜಾ ಮಣ್ಣಿನ ಪರಿಮಳ',
        'ಎಲ್ಲಾ ತರಕಾರಿ ಮತ್ತು ತೋಟದ ಬೆಳೆಗಳಿಗೆ ಅತ್ಯುತ್ತಮ'
      ],
      suitable: 'Vegetables, Maize, Banana, Papaya, Sugarcane'
    },
    {
      id: 'clay',
      texture: 'fine_clayey',
      title: 'Clay Soil (ಜೇಡಿ ಮಣ್ಣು / களிமண்)',
      badge: 'Pottery Sticky',
      color: 'bg-yellow-900',
      cues: [
        'Forms a firm, shiny, dense ribbon when rolled between palms',
        'Holds puddles of water for weeks (slow percolation)',
        'Very hard to plough when dry; rock-hard dried lumps',
        'Premier soil for lowland paddy rice'
      ],
      cuesKn: [
        'ಅಂಗೈಯಲ್ಲಿ ಉಜ್ಜಿದಾಗ ಹೊಳೆಯುವ ನುಣ್ಣನೆಯ ದಾರವಾಗುತ್ತದೆ',
        'ನೀರು ಇಂಗದೆ ಗದ್ದೆಯಲ್ಲಿ ನಿಲ್ಲುತ್ತದೆ (ಕೆಸರು ಗದ್ದೆಗೆ ಸೂಕ್ತ)',
        'ಒಣಗಿದಾಗ ಗಟ್ಟಿಯಾದ ಕಲ್ಲು ಮುದ್ದೆಯಾಗುತ್ತದೆ',
        'ಭತ್ತದ ಕೃಷಿಗೆ ಅತಿ ಸೂಕ್ತ'
      ],
      suitable: 'Paddy (Rice), Wheat, Sugarcane'
    },
    {
      id: 'sandy',
      texture: 'coarse_sandy',
      title: 'Sandy Soil (ಮರಳು ಮಣ್ಣು / மணல் மண்)',
      badge: 'Gritty & Quick Draining',
      color: 'bg-amber-400',
      cues: [
        'Feels rough and gritty like sugar grains between fingers',
        'Falls apart immediately; impossible to form a ball',
        'Water disappears instantly into the ground',
        'Warms up fast in sun; needs frequent light watering'
      ],
      cuesKn: [
        'ಬೆರಳುಗಳ ನಡುವೆ ಉಜ್ಜಿದಾಗ ಸಕ್ಕರೆಯಂತೆ ತರಿಯಾಗಿರುತ್ತದೆ',
        'ಉಂಡೆ ಕಟ್ಟಲು ಬರುವುದಿಲ್ಲ, ಸಡಿಲವಾಗಿ ಜಾರುತ್ತದೆ',
        'ಹಾಕಿದ ನೀರು ತಕ್ಷಣವೇ ಆಳಕ್ಕೆ ಇಳಿದುಹೋಗುತ್ತದೆ',
        'ಬೇಗನೆ ಕಾಯುತ್ತದೆ, ಪದೇಪದೇ ಹಗುರ ನೀರು ಬೇಕು'
      ],
      suitable: 'Watermelon, Bajra, Groundnut, Coconut'
    },
    {
      id: 'alluvial',
      texture: 'silty',
      title: 'Alluvial Soil (ಮೆಕ್ಕಲು / ನದಿ ಗೋಡು / ஆற்று வண்டல்)',
      badge: 'River Delta Silt',
      color: 'bg-stone-500',
      cues: [
        'Found near river basins (Cauvery, Krishna, Tungabhadra)',
        'Very silky smooth silt deposited by flowing water',
        'Extremely fertile with high natural mineral content',
        'Light grey to yellowish ash colour'
      ],
      cuesKn: [
        'ಕಾವೇರಿ, ಕೃಷ್ಣಾ, ತುಂಗಭದ್ರಾ ನದಿ ಅಥವಾ ಕಾಲುವೆ ಪಾತ್ರದಲ್ಲಿ ಕಂಡುಬರುತ್ತದೆ',
        'ನಯವಾದ ರೇಷ್ಮೆಯಂತಹ ನದಿ ಮಣ್ಣು',
        'ನೈಸರ್ಗಿಕ ಖನಿಜಗಳಿಂದ ಕೂಡಿದ ಅತಿ ಫಲವತ್ತಾದ ಭೂಮಿ',
        'ಬೂದಿ ಅಥವಾ ಹಳದಿ ಮಿಶ್ರಿತ ಬಣ್ಣ'
      ],
      suitable: 'Sugarcane, Paddy, Banana, Wheat, Vegetables'
    },
    {
      id: 'laterite',
      texture: 'coarse_sandy',
      title: 'Laterite Soil (ಲ್ಯಾಟರೈಟ್ / ಮುರಕಲ್ಲು ಮಣ್ಣು / செம்பொறை மண்)',
      badge: 'Western Ghats Hills',
      color: 'bg-orange-700',
      cues: [
        'Common in Malnad, Western Ghats & Coastal Karnataka',
        'Rusty yellowish-red with hard pea-sized iron gravel pebbles',
        'Porous and acidic (pH 5.0 - 6.2)',
        'Champion soil for Arecanut, Black Pepper, Coffee, Rubber'
      ],
      cuesKn: [
        'ಮಲೆನಾಡು, ಪಶ್ಚಿಮ ಘಟ್ಟ ಮತ್ತು ಕರಾವಳಿ ಬೆಟ್ಟಗಳಲ್ಲಿ ಕಂಡುಬರುತ್ತದೆ',
        'ಸಣ್ಣ ಮುರಕಲ್ಲು ಮತ್ತು ಜಲ್ಲಿ ಮಿಶ್ರಿತ ಕೆಂಪು-ಹಳದಿ ಮಣ್ಣು',
        'ಆಮ್ಲೀಯ ಸ್ವಭಾವ (pH 5.0 - 6.2)',
        'ಅಡಿಕೆ, ಕಾಳುಮೆಣಸು, ಕಾಫಿ, ರಬ್ಬರ್ ಮತ್ತು ಗೋಡಂಬಿಗೆ ಪ್ರಸಿದ್ಧ'
      ],
      suitable: 'Arecanut, Coffee, Black Pepper, Rubber, Cashew'
    }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden my-6 border border-gray-100 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-forest to-leaf p-5 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold">
                  {language === 'kn' ? 'ನಿಮ್ಮ ಮಣ್ಣನ್ನು ಸುಲಭವಾಗಿ ಗುರುತಿಸಿ' : language === 'ta' ? 'உங்கள் மண்ணை எளிதாக அடையாளம் காணுங்கள்' : language === 'te' ? 'మీ నేలను సులభంగా గుర్తించండి' : 'Help Me Identify My Soil'}
                </h2>
                <p className="text-xs text-mint/90">
                  {language === 'kn' ? 'ಸರಳ ಕೈ ಪರೀಕ್ಷೆ ಮತ್ತು ಲಕ್ಷಣಗಳನ್ನು ನೋಡಿ ಆಯ್ಕೆಮಾಡಿ' : 'Tap the card that matches your field soil'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Squeeze Test Quick Guide */}
          <div className="bg-cream/60 p-4 border-b border-earth/20 flex items-start gap-3">
            <HandMetal className="w-5 h-5 text-forest shrink-0 mt-0.5" />
            <div className="text-xs text-dark-text leading-relaxed">
              <span className="font-bold text-forest">
                {language === 'kn' ? '30 ಸೆಕೆಂಡಿನ ಕೈ ಪರೀಕ್ಷೆ: ' : 'Quick 30-Second Palm Test: '}
              </span>
              {language === 'kn'
                ? '6 ಇಂಚು ಆಳದಿಂದ ತೇವಾಂಶವಿರುವ ಮಣ್ಣನ್ನು ತೆಗೆದುಕೊಂಡು ಅಂಗೈಯಲ್ಲಿ ಉಂಡೆ ಮಾಡಿ ಬೆರಳುಗಳಿಂದ ಒತ್ತಿ ನೋಡಿ.'
                : 'Take a moist handful from 6 inches depth, squeeze into a ball in your palm, and match below.'}
            </div>
          </div>

          {/* Cards List */}
          <div className="p-4 space-y-3 overflow-y-auto flex-1">
            {soilTestOptions.map((opt) => (
              <motion.div
                key={opt.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleSelect(opt.id, opt.texture)}
                className="p-4 rounded-2xl border-2 border-gray-100 hover:border-forest/50 hover:bg-forest/5 cursor-pointer transition shadow-sm bg-white"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-3.5 h-3.5 rounded-full ${(opt as any).color || 'bg-stone-800'} shrink-0`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-dark-text text-sm">
                          {opt.title}
                        </h3>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-leaf/15 text-forest">
                          {opt.badge}
                        </span>
                      </div>
                      <span className="text-[11px] text-harvest font-medium">
                        Best crops: {opt.suitable}
                      </span>
                    </div>
                  </div>
                  <button className="text-xs font-bold text-forest bg-mint/20 hover:bg-forest hover:text-white px-3 py-1.5 rounded-xl transition shrink-0">
                    Select
                  </button>
                </div>

                <ul className="mt-2.5 space-y-1 pl-7 list-disc text-xs text-dark-muted">
                  {(language === 'kn' ? opt.cuesKn : opt.cues).map((cue, idx) => (
                    <li key={idx}>{cue}</li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 text-xs font-bold text-dark-muted hover:text-dark-text rounded-xl"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
