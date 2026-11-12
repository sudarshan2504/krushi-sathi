import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sprout,
  Camera,
  Upload,
  Mic,
  MicOff,
  Check,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  AlertTriangle,
  HelpCircle,
  PhoneCall,
  Activity,
  Layers,
  Eye,
  CheckCircle2,
  Sparkles,
  Info,
  X,
  Clock,
  RefreshCw,
  Leaf,
  Trees,
  Flower2,
  Wheat,
  CircleDot,
  Milestone,
  AlignJustify,
  Sun,
  Flame,
  TrendingDown,
  Circle,
  Cloud,
  Droplets,
  Bug,
} from 'lucide-react';
import { api } from '../../services/api';
import { useTranslation } from '../../context/LanguageContext';
import { speechService } from '../../services/speechService';
import { CropOption } from './CropSelector';
import { ProblemItem } from '../../types';
import { PhotoCaptureSection, CapturedPhoto } from './PhotoCaptureSection';
import { PhotoAnalysisResultView } from './PhotoAnalysisResultView';
import { StickyBottomBar } from '../ui/StickyBottomBar';

interface SymptomCheckerWizardProps {
  crops: CropOption[];
  selectedCropSlug: string;
  onSelectCropSlug: (slug: string) => void;
  onOpenProblemDetail: (problem: ProblemItem) => void;
  allProblems?: ProblemItem[];
}

interface PlantPartOption {
  key: string;
  labelEn: string;
  labelKn: string;
  labelTa: string;
  labelTe: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PLANT_PARTS: PlantPartOption[] = [
  { key: 'leaf', labelEn: 'Leaves', labelKn: 'ಎಲೆಗಳು', labelTa: 'இலைகள்', labelTe: 'ఆకులు', icon: Leaf },
  { key: 'stem', labelEn: 'Stem / Shoot', labelKn: 'ಕಾಂಡ / ಚಿಗುರು', labelTa: 'தண்டு / குருத்து', labelTe: 'కాండం / కొమ్మ', icon: Milestone },
  { key: 'root', labelEn: 'Roots / Collar', labelKn: 'ಬೇರು / ಬುಡ', labelTa: 'வேர் / தரைமட்டம்', labelTe: 'వేర్లు / మొదలు', icon: Sprout },
  { key: 'fruit_grain', labelEn: 'Fruit / Grain / Pod', labelKn: 'ಕಾಯಿ / ಕಾಳು / ತೆನೆ', labelTa: 'காய் / தானியம்', labelTe: 'కాయ / గింజ / కంకి', icon: Wheat },
  { key: 'flower', labelEn: 'Flower / Bud', labelKn: 'ಹೂವು / ಮೊಗ್ಗು', labelTa: 'பூ / மொட்டு', labelTe: 'పువ్వు / మొగ్గ', icon: Flower2 },
  { key: 'whole_plant', labelEn: 'Whole Plant', labelKn: 'ಸಂಪೂರ್ಣ ಸಸ್ಯ', labelTa: 'முழு செடி', labelTe: 'మొత్తం మొక్క', icon: Trees },
];

interface PatternOption {
  key: string;
  labelEn: string;
  labelKn: string;
  labelTa: string;
  labelTe: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PATTERNS: PatternOption[] = [
  { key: 'spots', labelEn: 'Spots / Lesions', labelKn: 'ಚುಕ್ಕೆಗಳು / ಕಲೆಗಳು', labelTa: 'புள்ளிகள்', labelTe: 'మచ్చలు', icon: CircleDot },
  { key: 'streaks', labelEn: 'Streaks / Stripes', labelKn: 'ಗೆರೆಗಳು / ಪಟ್ಟಿಗಳು', labelTa: 'வரிகள்', labelTe: 'గీతలు', icon: AlignJustify },
  { key: 'yellowing', labelEn: 'Yellowing / Chlorosis', labelKn: 'ಹಳದಿ ಬಣ್ಣಕ್ಕೆ ತಿರುಗುವುದು', labelTa: 'மஞ்சள் நிறமாதல்', labelTe: 'పసుపు పచ్చగా మారడం', icon: Sun },
  { key: 'browning', labelEn: 'Browning / Scorching', labelKn: 'ಕಂದು ಬಣ್ಣ / ಸುಟ್ಟಂತೆ', labelTa: 'பழுப்பு / கருகல்', labelTe: 'ఎండిపోయినట్లు / గోధుమ', icon: Flame },
  { key: 'wilting', labelEn: 'Wilting / Drooping', labelKn: 'ಬಾಡುವಿಕೆ / ಒಣಗುವುದು', labelTa: 'வாடல்', labelTe: 'వాడిపోవడం', icon: TrendingDown },
  { key: 'holes', labelEn: 'Holes / Borer tunnels', labelKn: 'ರಂಧ್ರಗಳು / ಕೊರೆದಂತೆ', labelTa: 'துளைகள்', labelTe: 'రంధ్రాలు / తొలుచుట', icon: Circle },
  { key: 'rolling_curling', labelEn: 'Curling / Wrinkling', labelKn: 'ಎಲೆ ಮುದುಡು / ಸುರುಳಿ', labelTa: 'இலை சுருட்டு', labelTe: 'ఆకు ముడుచుకోవడం', icon: RefreshCw },
  { key: 'powdery_mould', labelEn: 'White / Grey Powder', labelKn: 'ಬೂದಿ ಅಥವಾ ಶಿಲೀಂಧ್ರ', labelTa: 'சாம்பல் பூஞ்சணம்', labelTe: 'బూడిద తెగులు', icon: Cloud },
  { key: 'rot', labelEn: 'Rotting / Wet decay', labelKn: 'ಕೊಳೆಯುವುದು / ದುರ್ವಾಸನೆ', labelTa: 'அழுகல்', labelTe: 'కుళ్లు తెగులు', icon: Droplets },
  { key: 'dead_heart', labelEn: 'Dead Heart / Shoot drying', labelKn: 'ಸುಳಿ ಒಣಗುವಿಕೆ (ಡೆಡ್ ಹಾರ್ಟ್)', labelTa: 'குருத்து காய்வு', labelTe: 'ఎండిన మొవ్వు', icon: AlertTriangle },
  { key: 'stunting', labelEn: 'Stunted Growth', labelKn: 'ಬೆಳವಣಿಗೆ ಕುಂಠಿತ', labelTa: 'வளர்ச்சி குன்றுதல்', labelTe: 'ఎదుగుదల లోపం', icon: TrendingDown },
  { key: 'insects_visible', labelEn: 'Insects / Worms visible', labelKn: 'ಹುಳುಗಳು / ಕೀಟಗಳು ಕಾಣಿಸುತ್ತಿವೆ', labelTa: 'பூச்சிகள் / புழுக்கள்', labelTe: 'పురుగులు కనిపిస్తున్నాయి', icon: Bug },
];

const COLOURS = [
  { key: 'yellow', labelEn: 'Yellow', labelKn: 'ಹಳದಿ', labelTa: 'மஞ்சள்', labelTe: 'పసుపు', colorClass: 'bg-yellow-400' },
  { key: 'brown', labelEn: 'Brown', labelKn: 'ಕಂದು', labelTa: 'பழுப்பு', labelTe: 'గోధుమ', colorClass: 'bg-amber-800' },
  { key: 'black', labelEn: 'Black', labelKn: 'ಕಪ್ಪು', labelTa: 'கருப்பு', labelTe: 'నలుపు', colorClass: 'bg-black' },
  { key: 'white', labelEn: 'White', labelKn: 'ಬಿಳಿ', labelTa: 'வெள்ளை', labelTe: 'తెలుపు', colorClass: 'bg-white border-2 border-gray-300' },
  { key: 'grey', labelEn: 'Grey', labelKn: 'ಬೂದು', labelTa: 'சாம்பல்', labelTe: 'బూడిద', colorClass: 'bg-gray-400' },
  { key: 'red_purple', labelEn: 'Red / Purple', labelKn: 'ಕೆಂಪು / ನೇರಳೆ', labelTa: 'சிவப்பு / ஊதா', labelTe: 'ఎరుపు / ఊదా', colorClass: 'bg-rose-600' },
  { key: 'light_green', labelEn: 'Light / Pale Green', labelKn: 'ತಿಳಿ ಹಸಿರು', labelTa: 'வெளிர் பச்சை', labelTe: 'లేత ఆకుపచ్చ', colorClass: 'bg-lime-400' },
];

const SPREADS = [
  { key: 'few_plants', labelEn: 'Isolated (Few Plants)', labelKn: 'ಕೆಲವೇ ಗಿಡಗಳಲ್ಲಿ', labelTa: 'சில செடிகளில்', labelTe: 'కొద్ది మొక్కలలో' },
  { key: 'patches', labelEn: 'Scattered Patches', labelKn: 'ಗುಂಪು ಗುಂಪಾಗಿ (ಪ್ಯಾಚ್)', labelTa: 'திட்டு திட்டாக', labelTe: 'గుంపులు గుంపులుగా' },
  { key: 'whole_field', labelEn: 'Widespread Across Field', labelKn: 'ಇಡೀ ಹೊಲದಲ್ಲಿ ವ್ಯಾಪಕ', labelTa: 'வயல் முழுவதும்', labelTe: 'పొలమంతా వ్యాపించింది' },
];

const ONSETS = [
  { key: '2_3_days', labelEn: 'Just started (2-3 days ago)', labelKn: 'ಇತ್ತೀಚೆಗೆ (೨-೩ ದಿನಗಳು)', labelTa: '2-3 நாட்களுக்கு முன்', labelTe: '2-3 రోజుల క్రితం' },
  { key: '1_week', labelEn: 'About 1 week ago', labelKn: 'ಸುಮಾರು ೧ ವಾರದ ಹಿಂದೆ', labelTa: '1 வாரத்திற்கு முன்', labelTe: 'సుమారు 1 వారం క్రితం' },
  { key: '2_plus_weeks', labelEn: 'More than 2 weeks', labelKn: '೨ ವಾರಗಳಿಗಿಂತ ಹೆಚ್ಚು', labelTa: '2 வாரங்களுக்கு மேல்', labelTe: '2 వారాలకు పైగా' },
];

export const SymptomCheckerWizard: React.FC<SymptomCheckerWizardProps> = ({
  crops,
  selectedCropSlug,
  onSelectCropSlug,
  onOpenProblemDetail,
  allProblems = [],
}) => {
  const { t: translateRaw, language } = useTranslation();
  const t = (k: string): string => (translateRaw as any)(k) || '';

  // Top diagnosis mode: 'photo_mode' (Direct Photo Analysis) vs 'guided_mode' (Step-by-Step Questionnaire)
  const [activeCheckMode, setActiveCheckMode] = useState<'photo_mode' | 'guided_mode'>('photo_mode');

  // Wizard Step for guided mode (1: Crop & Part, 2: Pattern & Color, 3: Spread & Onset, 4: Note & Photo, 5: Results)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [plantPart, setPlantPart] = useState<string>('leaf');
  const [pattern, setPattern] = useState<string>('spots');
  const [colour, setColour] = useState<string>('brown');
  const [spread, setSpread] = useState<string>('few_plants');
  const [onset, setOnset] = useState<string>('2_3_days');
  const [note, setNote] = useState<string>('');

  // Multi-Photo State (up to 3 photos)
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);
  const [consentToStore, setConsentToStore] = useState<boolean>(false);

  // Speech Recognition state
  const [isListening, setIsListening] = useState<boolean>(false);

  // Diagnosis Execution State
  const [isDiagnosing, setIsDiagnosing] = useState<boolean>(false);
  const [diagnosisProgressStep, setDiagnosisProgressStep] = useState<number>(1);
  const [diagnosisErrorNotice, setDiagnosisErrorNotice] = useState<string | null>(null);

  // Results State
  const [photoAnalysisResult, setPhotoAnalysisResult] = useState<any>(null);
  const [guidedDiagnosisResult, setGuidedDiagnosisResult] = useState<any>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutIdRef = useRef<any>(null);

  const selectedCrop =
    crops.find(
      (c) =>
        c.name.toLowerCase().includes(selectedCropSlug.toLowerCase()) ||
        c.id === selectedCropSlug
    ) || crops[0];

  const getLocalizedLabel = (item: any, fallbackKey = 'labelEn') => {
    if (language === 'kn' && item.labelKn) return item.labelKn;
    if (language === 'ta' && item.labelTa) return item.labelTa;
    if (language === 'te' && item.labelTe) return item.labelTe;
    return item[fallbackKey] || item.labelEn;
  };

  const getSeason = () => {
    const month = new Date().getMonth() + 1;
    if (month >= 6 && month <= 10) return 'Kharif';
    if (month >= 11 || month <= 2) return 'Rabi';
    return 'Summer';
  };

  const getUserLocation = () => {
    try {
      const raw = localStorage.getItem('krishi_sathi_user');
      if (raw) {
        const u = JSON.parse(raw);
        return {
          state: u.state || 'Karnataka',
          district: u.district || u.taluk || 'Mandya',
        };
      }
    } catch (e) {}
    return { state: 'Karnataka', district: 'Mandya' };
  };

  // Toggle Voice Input
  const toggleSpeechRecognition = () => {
    if (isListening) {
      speechService.stopRecognition();
      setIsListening(false);
      return;
    }

    speechService.startRecognition(language as any, {
      onStart: () => setIsListening(true),
      onFinalResult: (transcript: string) => {
        setNote((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      },
      onError: () => setIsListening(false),
    });
  };

  // Handle Cancel Diagnosis
  const handleCancelDiagnosis = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
    setIsDiagnosing(false);
  };

  // Run Diagnosis (Routes to Photo Analysis if photos are present, else Guided Diagnosis)
  const handleRunDiagnosis = async () => {
    setIsDiagnosing(true);
    setDiagnosisProgressStep(1);
    setDiagnosisErrorNotice(null);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Timeout after 30 seconds
    timeoutIdRef.current = setTimeout(() => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
        setIsDiagnosing(false);
        setDiagnosisErrorNotice(
          language === 'kn'
            ? 'ವಿಶ್ಲೇಷಣೆಗೆ ನಿರೀಕ್ಷೆಗಿಂತ ಹೆಚ್ಚು ಸಮಯ ತೆಗೆದುಕೊಂಡಿತು. ದಯವಿಟ್ಟು ನೇರ ಲಕ್ಷಣಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.'
            : 'Diagnosis request timed out. We have fallen back to our verified symptom catalog.'
        );
      }
    }, 30000);

    try {
      // Step progress animation
      const p1 = setTimeout(() => setDiagnosisProgressStep(2), 1200);
      const p2 = setTimeout(() => setDiagnosisProgressStep(3), 3200);

      if (capturedPhotos.length > 0) {
        // --- REAL PHOTO ANALYSIS PATH ---
        const photoPayload = {
          photos: capturedPhotos.map((p) => ({
            kind: p.kind,
            dataUrl: p.dataUrl,
          })),
          crop: selectedCrop?.name || selectedCropSlug,
          cropSlug: selectedCropSlug,
          location: getUserLocation(),
          season: getSeason(),
          weather: {
            temperature: 28,
            humidity: 74,
            condition: 'Intermittent rainfall / High humidity',
          },
          guidedTags: {
            plantPart,
            pattern,
            colour,
            spread,
            onset,
            note,
          },
          consentToStore,
          language,
        };

        const res = await api.diseases.analyzePhoto(photoPayload);

        clearTimeout(p1);
        clearTimeout(p2);
        if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);

        setPhotoAnalysisResult(res);
        setGuidedDiagnosisResult(null);
        setCurrentStep(5); // Show results
      } else {
        // --- GUIDED TEXT / SYMPTOM PATH ---
        const payload = {
          crop: selectedCrop?.name || selectedCropSlug,
          cropSlug: selectedCropSlug,
          plantPart,
          pattern,
          colour,
          spread,
          onset,
          note,
          hasImage: false,
          consentToStoreImage: consentToStore,
        };

        const res = await api.diseases.diagnose(payload);

        clearTimeout(p1);
        clearTimeout(p2);
        if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);

        setGuidedDiagnosisResult(res);
        setPhotoAnalysisResult(null);
        setCurrentStep(5);
      }
    } catch (err: any) {
      console.error('Diagnosis error:', err);
      // Fallback: If photo analysis fails, run symptom checker so farmer is never blocked
      setDiagnosisErrorNotice(
        err?.message ||
          'Photo vision analysis is currently unavailable. Displaying database symptoms matching your crop.'
      );

      try {
        const fallbackRes = await api.diseases.diagnose({
          crop: selectedCrop?.name || selectedCropSlug,
          cropSlug: selectedCropSlug,
          plantPart,
          pattern,
          colour,
          spread,
          onset,
          note,
          hasImage: false,
        });
        setGuidedDiagnosisResult(fallbackRes);
        setPhotoAnalysisResult(null);
        setCurrentStep(5);
      } catch (fallbackErr) {
        console.error('Fallback error:', fallbackErr);
      }
    } finally {
      setIsDiagnosing(false);
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setPlantPart('leaf');
    setPattern('spots');
    setColour('brown');
    setSpread('few_plants');
    setOnset('2_3_days');
    setNote('');
    setCapturedPhotos([]);
    setPhotoAnalysisResult(null);
    setGuidedDiagnosisResult(null);
    setDiagnosisErrorNotice(null);
  };

  return (
    <div className="space-y-4">
      {/* CROP SELECTOR BAR */}
      <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sprout className="w-5 h-5 text-forest flex-shrink-0" />
          <div>
            <span className="text-[11px] font-bold text-gray-600 dark:text-gray-400 block uppercase tracking-wider">
              {language === 'kn' ? 'ಆಯ್ದ ಬೆಳೆ' : language === 'ta' ? 'தேர்ந்தெடுக்கப்பட்ட பயிர்' : language === 'te' ? 'ఎంచుకున్న పంట' : 'Active Crop'}:
            </span>
            <span className="text-sm font-black text-gray-900 dark:text-gray-100">
              {selectedCrop?.name || selectedCropSlug}
            </span>
          </div>
        </div>

        {/* Change Crop Dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="symptom-crop-select" className="text-xs text-gray-600 dark:text-gray-400 font-bold whitespace-nowrap">
            {language === 'kn' ? 'ಬೆಳೆ ಬದಲಾಯಿಸಿ:' : 'Change Crop:'}
          </label>
          <select
            id="symptom-crop-select"
            value={selectedCropSlug}
            onChange={(e) => onSelectCropSlug(e.target.value)}
            className="min-h-[44px] px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold text-gray-900 dark:text-gray-100 focus:border-forest outline-none cursor-pointer"
          >
            {crops.map((c) => (
              <option key={c.id} value={c.name.toLowerCase().replace(/\s+/g, '-')}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TOP TAB SWITCHER: DIRECT PHOTO VS GUIDED CHECKER */}
      {currentStep < 5 && !isDiagnosing && (
        <div className="grid grid-cols-2 gap-2 bg-gray-100/80 p-1.5 rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setActiveCheckMode('photo_mode');
              setCurrentStep(1);
            }}
            className={`min-h-[44px] py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
              activeCheckMode === 'photo_mode'
                ? 'bg-white text-forest shadow-sm'
                : 'text-gray-600 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <Camera className="w-4 h-4 text-forest" />
            <span>
              {language === 'kn'
                ? 'ಫೋಟೋ ರೋಗನಿರ್ಣಯ (AI ವಿಷನ್)'
                : language === 'ta'
                ? 'புகைப்பட பரிசோதனை (AI)'
                : language === 'te'
                ? 'ఫోటో నిర్ధారణ (AI విజన్)'
                : 'Photo Diagnosis (AI Vision)'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveCheckMode('guided_mode');
              setCurrentStep(1);
            }}
            className={`min-h-[44px] py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
              activeCheckMode === 'guided_mode'
                ? 'bg-white text-forest shadow-sm'
                : 'text-gray-600 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <Layers className="w-4 h-4 text-forest" />
            <span>
              {language === 'kn'
                ? 'ಮಾರ್ಗದರ್ಶಿ ಲಕ್ಷಣ ಪರೀಕ್ಷಕ'
                : language === 'ta'
                ? 'வழிகாட்டப்பட்ட அறிகுறி சோதனையாளர்'
                : language === 'te'
                ? 'గైడెడ్ లక్షణాల తనిఖీ'
                : 'Guided Symptom Checker'}
            </span>
          </button>
        </div>
      )}

      {/* DIAGNOSIS LOADING PROGRESS SKELETON */}
      {isDiagnosing && (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-card text-center space-y-5 animate-pulse">
          <div className="w-16 h-16 rounded-3xl bg-forest/10 text-forest flex items-center justify-center mx-auto shadow-inner">
            <RefreshCw className="w-8 h-8 animate-spin" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-gray-100">
              {capturedPhotos.length > 0
                ? (language === 'kn' ? 'ಸಸ್ಯದ ಫೋಟೋವನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...' : 'Analyzing Plant Photos with Gemini Vision...')
                : (language === 'kn' ? 'ಕ್ಷೇತ್ರ ಲಕ್ಷಣಗಳನ್ನು ಹೊಂದಿಸಲಾಗುತ್ತಿದೆ...' : 'Matching Crop Symptoms Against Catalog...')}
            </h3>

            {/* Stepper text */}
            <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
              <div className={`flex items-center justify-center gap-2 ${diagnosisProgressStep >= 1 ? 'text-forest font-bold' : 'text-gray-600'}`}>
                <CheckCircle2 className="w-4 h-4" />
                <span>1. {language === 'kn' ? 'ಫೋಟೋ ಸ್ಪಷ್ಟತೆ ಮತ್ತು ಮೆಟಾಡೇಟಾ ಪರಿಶೀಲನೆ' : 'In-browser quality verification & EXIF stripping'}</span>
              </div>
              <div className={`flex items-center justify-center gap-2 ${diagnosisProgressStep >= 2 ? 'text-forest font-bold' : 'text-gray-600'}`}>
                <CheckCircle2 className="w-4 h-4" />
                <span>2. {language === 'kn' ? 'ಪ್ರಮಾಣೀಕೃತ ಬೆಳೆ ರೋಗ ಡೇಟಾಬೇಸ್ ಹುಡುಕಾಟ' : 'Querying verified crop pathology catalog'}</span>
              </div>
              <div className={`flex items-center justify-center gap-2 ${diagnosisProgressStep >= 3 ? 'text-forest font-bold' : 'text-gray-600'}`}>
                <CheckCircle2 className="w-4 h-4" />
                <span>3. {language === 'kn' ? 'ದೃಶ್ಯ ಚಿಹ್ನೆಗಳ ನಿಖರ ಮೌಲ್ಯಮಾಪನ' : 'Evaluating visual lesions & signs with Gemini'}</span>
              </div>
            </div>

            <p className="text-[11px] text-gray-600 pt-1">
              {language === 'kn'
                ? 'ದಯವಿಟ್ಟು ನಿರೀಕ್ಷಿಸಿ, ಇದಕ್ಕೆ ಸುಮಾರು ೧೦-೨೦ ಸೆಕೆಂಡುಗಳು ಬೇಕಾಗಬಹುದು.'
                : 'Please wait, multimodal vision analysis takes about 10-20 seconds.'}
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleCancelDiagnosis}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 transition cursor-pointer"
            >
              {language === 'kn' ? 'ರದ್ದುಮಾಡಿ' : 'Cancel Analysis'}
            </button>
          </div>
        </div>
      )}

      {/* ERROR / FALLBACK NOTICE BANNER */}
      {diagnosisErrorNotice && (
        <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="block font-bold">Notice:</strong>
            <span>{diagnosisErrorNotice}</span>
          </div>
        </div>
      )}

      {/* MODE A: DIRECT PHOTO DIAGNOSIS VIEW */}
      {activeCheckMode === 'photo_mode' && currentStep < 5 && !isDiagnosing && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-5 border border-gray-100 shadow-card space-y-5"
        >
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-gray-100 mb-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-forest" />
              {language === 'kn'
                ? 'ಸಸ್ಯದ ೩ ಕೋನದ ಫೋಟೋಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ'
                : language === 'ta'
                ? 'பயிரின் 3 கோண புகைப்படங்களை பதிவேற்றவும்'
                : language === 'te'
                ? 'మొక్క 3 కోణాల ఫోటోలను అప్‌లోడ్ చేయండి'
                : 'Capture Up to 3 Plant Photos'}
            </h2>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {language === 'kn'
                ? 'ಕ್ಯಾಮೆರಾ ಬಳಸಿ ಹಾನಿಗೊಳಗಾದ ಎಲೆ, ಸಂಪೂರ್ಣ ಸಸ್ಯ ಮತ್ತು ಎಲೆಯ ಹಿಂಭಾಗದ ಚಿತ್ರಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳಿ.'
                : 'Provide photos from multiple angles for high confidence. Our in-browser checks inspect focus and lighting before upload.'}
            </p>
          </div>

          {/* Photo Capture Section with Quality Checks */}
          <PhotoCaptureSection
            photos={capturedPhotos}
            onChange={setCapturedPhotos}
            consentToStore={consentToStore}
            onConsentChange={setConsentToStore}
          />

          {/* Optional Voice / Text observation */}
          <div className="space-y-1.5 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <label htmlFor="symptom-photo-note" className="text-xs font-bold text-gray-900 dark:text-gray-100">
                {language === 'kn' ? 'ಹೆಚ್ಚುವರಿ ವಿವರಗಳು (ಐಚ್ಛಿಕ):' : 'Additional Notes (Optional):'}
              </label>
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={`min-h-[44px] px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-forest/10 text-forest hover:bg-forest/20'
                }`}
              >
                {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                <span>{isListening ? 'Listening...' : (language === 'kn' ? 'ಧ್ವನಿ ಮೂಲಕ ಮಾತನಾಡಿ' : 'Speak note')}</span>
              </button>
            </div>

            <textarea
              id="symptom-photo-note"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={
                language === 'kn'
                  ? 'ಉದಾ. ಕೆಳಭಾಗದ ಎಲೆಗಳು ಹಳದಿಯಾಗುತ್ತಿವೆ, ಕಾಂಡ ಒಣಗುತ್ತಿದೆ...'
                  : 'e.g., Yellow rings on leaves, bottom leaves drying up, insects seen on stem...'
              }
              className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-gray-200 text-xs font-medium focus:border-forest outline-none resize-none"
            />
          </div>

          {/* Action CTAs inside StickyBottomBar */}
          <StickyBottomBar>
            <button
              type="button"
              onClick={() => {
                setActiveCheckMode('guided_mode');
                setCurrentStep(1);
              }}
              className="text-xs sm:text-sm font-bold text-gray-700 hover:text-forest transition flex items-center gap-1 min-h-[44px] py-1 px-2 touch-target"
            >
              <span>{language === 'kn' ? 'ಅಥವಾ ಪ್ರಶ್ನೆಗಳಿಗೆ ಉತ್ತರಿಸಿ' : 'Or step questions'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleRunDiagnosis}
              disabled={capturedPhotos.length === 0}
              className="px-5 sm:px-6 py-2.5 rounded-2xl bg-forest text-white text-xs sm:text-sm font-bold hover:bg-forest-dark transition flex items-center justify-center gap-2 min-h-[44px] touch-target cursor-pointer shadow-md disabled:opacity-40 active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span>
                {language === 'kn'
                  ? 'ಫೋಟೋ ರೋಗನಿರ್ಣಯ'
                  : language === 'ta'
                  ? 'பரிசோதனை செய்'
                  : language === 'te'
                  ? 'నిర్ధారణ చేయండి'
                  : 'Analyze Photo'}
              </span>
            </button>
          </StickyBottomBar>
        </motion.div>
      )}

      {/* MODE B: GUIDED SYMPTOM CHECKER STEPPER */}
      {activeCheckMode === 'guided_mode' && currentStep < 5 && !isDiagnosing && (
        <div className="space-y-4">
          {/* Stepper Header */}
          <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-gray-500">
              <span>
                {t('step')} {currentStep} of 4:
                <strong className="text-forest ml-1">
                  {currentStep === 1 && (t('affectedPlantPart') || 'Plant Part')}
                  {currentStep === 2 && (t('visualPattern') || 'Pattern & Colour')}
                  {currentStep === 3 && (t('spreadAndOnset') || 'Spread & Timing')}
                  {currentStep === 4 && (t('optionalDetails') || 'Notes & Photos')}
                </strong>
              </span>
              <span className="text-gray-600 dark:text-gray-400 font-bold">{Math.round((currentStep / 4) * 100)}%</span>
            </div>

            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-forest rounded-full"
                initial={{ width: '25%' }}
                animate={{ width: `${(currentStep / 4) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* STEP 1: Plant Part */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="bg-white rounded-3xl p-5 border border-gray-100 shadow-card space-y-5"
            >
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-gray-100 mb-1 flex items-center gap-2">
                  <Sprout className="w-4 h-4 text-forest" />
                  {t('selectPlantPart') || 'Where are symptoms appearing?'}
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Choose the primary part of the crop showing damage:
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {PLANT_PARTS.map((part) => {
                  const isSelected = plantPart === part.key;
                  const PartIcon = part.icon;
                  return (
                    <button
                      key={part.key}
                      type="button"
                      onClick={() => setPlantPart(part.key)}
                      className={`p-3.5 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 cursor-pointer min-h-[72px] ${
                        isSelected
                          ? 'bg-emerald-50 border-forest text-forest font-bold ring-2 ring-forest/20 shadow-sm'
                          : 'bg-white border-gray-200 text-gray-900 dark:text-gray-100 hover:border-gray-300'
                      }`}
                    >
                      <span className="w-8 h-8 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center">
                        <PartIcon className="w-4 h-4" />
                      </span>
                      <span className="text-xs font-semibold leading-tight">{getLocalizedLabel(part)}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-end pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-5 py-2.5 rounded-2xl bg-forest text-white text-xs sm:text-sm font-bold hover:bg-forest-dark transition flex items-center gap-2 min-h-[44px] cursor-pointer"
                >
                  <span>{t('nextStep') || 'Next: Symptoms & Pattern'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Pattern & Colour */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="bg-white rounded-3xl p-5 border border-gray-100 shadow-card space-y-5"
            >
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-gray-100 mb-1 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-forest" />
                  {t('selectVisualPattern') || 'What do the damage marks look like?'}
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Choose the closest visual appearance of the affected area:
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PATTERNS.map((pat) => {
                  const isSelected = pattern === pat.key;
                  const PatIcon = pat.icon;
                  return (
                    <button
                      key={pat.key}
                      type="button"
                      onClick={() => setPattern(pat.key)}
                      className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1 cursor-pointer min-h-[64px] ${
                        isSelected
                          ? 'bg-emerald-50 border-forest text-forest font-bold ring-2 ring-forest/20 shadow-sm'
                          : 'bg-white border-gray-200 text-gray-900 dark:text-gray-100 hover:border-gray-300'
                      }`}
                    >
                      <span className="w-7 h-7 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center">
                        <PatIcon className="w-4 h-4" />
                      </span>
                      <span className="text-xs font-semibold leading-tight line-clamp-2">
                        {getLocalizedLabel(pat)}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Colour Chips */}
              <div>
                <h3 className="text-xs font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {t('dominantColour') || 'Dominant color of the spots / signs:'}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {COLOURS.map((col) => {
                    const isSelected = colour === col.key;
                    return (
                      <button
                        key={col.key}
                        type="button"
                        onClick={() => setColour(col.key)}
                        className={`min-h-[44px] px-3 py-2 rounded-xl border transition flex items-center gap-2 cursor-pointer ${
                          isSelected
                            ? 'bg-gray-100 border-forest font-bold ring-2 ring-forest/20'
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded-full flex-shrink-0 ${col.colorClass}`} />
                        <span className="text-xs text-gray-900 dark:text-gray-100 font-medium truncate">
                          {getLocalizedLabel(col)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition flex items-center gap-1 min-h-[44px] cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-5 py-2.5 rounded-2xl bg-forest text-white text-xs sm:text-sm font-bold hover:bg-forest-dark transition flex items-center gap-2 min-h-[44px] cursor-pointer"
                >
                  <span>{t('nextStep') || 'Next: Spread & Timing'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Spread Pattern & Onset Timing */}
          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="bg-white rounded-3xl p-5 border border-gray-100 shadow-card space-y-5"
            >
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-gray-100 mb-1 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-forest" />
                  {t('spreadAndOnset') || 'How is it spreading in the field?'}
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Helps identify whether the cause is soil-borne, airborne fungus, or insect infestation:
                </p>
              </div>

              {/* Spread in field */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-900 dark:text-gray-100 block">
                  Field Distribution:
                </span>
                {SPREADS.map((sp) => {
                  const isSelected = spread === sp.key;
                  return (
                    <button
                      key={sp.key}
                      type="button"
                      onClick={() => setSpread(sp.key)}
                      className={`w-full p-3.5 rounded-2xl border text-left transition flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50 border-forest text-forest font-bold ring-2 ring-forest/20'
                          : 'bg-white border-gray-200 text-gray-900 dark:text-gray-100 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-xs sm:text-sm">{getLocalizedLabel(sp)}</span>
                      {isSelected && <Check className="w-4 h-4 text-forest stroke-[3]" />}
                    </button>
                  );
                })}
              </div>

              {/* Onset Timing */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <span className="text-xs font-bold text-gray-900 dark:text-gray-100 block">
                  When did you first notice the symptoms?
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {ONSETS.map((on) => {
                    const isSelected = onset === on.key;
                    return (
                      <button
                        key={on.key}
                        type="button"
                        onClick={() => setOnset(on.key)}
                        className={`min-h-[44px] p-3 rounded-2xl border text-center transition cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 border-forest text-forest font-bold ring-2 ring-forest/20'
                            : 'bg-white border-gray-200 text-gray-900 dark:text-gray-100 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-xs block">{getLocalizedLabel(on)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition flex items-center gap-1 min-h-[44px] cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="px-5 py-2.5 rounded-2xl bg-forest text-white text-xs sm:text-sm font-bold hover:bg-forest-dark transition flex items-center gap-2 min-h-[44px] cursor-pointer"
                >
                  <span>Next: Notes & Photo</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Voice/Text Note & Photo Upload */}
          {currentStep === 4 && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="bg-white rounded-3xl p-5 border border-gray-100 shadow-card space-y-5"
            >
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-gray-100 mb-1 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-forest" />
                  {t('optionalDetails') || 'Additional Notes & Field Photos'}
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Add photos for vision verification or speak your observations in your language:
                </p>
              </div>

              {/* Multi-Photo Component */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-900 dark:text-gray-100 block">
                  Field Photos (Optional - Up to 3 angles):
                </span>
                <PhotoCaptureSection
                  photos={capturedPhotos}
                  onChange={setCapturedPhotos}
                  consentToStore={consentToStore}
                  onConsentChange={setConsentToStore}
                />
              </div>

              {/* Voice & Text Note */}
              <div className="space-y-1.5 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <label htmlFor="symptom-guided-note" className="text-xs font-bold text-gray-900 dark:text-gray-100">
                    Your observation (Optional):
                  </label>
                  <button
                    type="button"
                    onClick={toggleSpeechRecognition}
                    className={`min-h-[44px] px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                      isListening
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'bg-forest/10 text-forest hover:bg-forest/20'
                    }`}
                  >
                    {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                    <span>{isListening ? 'Listening...' : 'Speak in your language'}</span>
                  </button>
                </div>

                <textarea
                  id="symptom-guided-note"
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Bottom leaves turning yellow with brown spots, central shoot withering..."
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-gray-200 text-xs font-medium focus:border-forest outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition flex items-center gap-1 min-h-[44px] cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={handleRunDiagnosis}
                  className="px-6 py-2.5 rounded-2xl bg-forest text-white text-xs sm:text-sm font-bold hover:bg-forest-dark transition flex items-center gap-2 min-h-[44px] cursor-pointer shadow-md"
                >
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                  <span>Run Crop Diagnosis</span>
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* STEP 5: RESULTS VIEW */}
      {currentStep === 5 && (
        <div className="space-y-4">
          {/* If Photo Analysis Result is present, render the dedicated PhotoAnalysisResultView */}
          {photoAnalysisResult ? (
            <PhotoAnalysisResultView
              result={photoAnalysisResult}
              userPhotos={capturedPhotos.map((p) => ({ kind: p.kind, dataUrl: p.dataUrl }))}
              cropName={selectedCrop?.name || selectedCropSlug}
              allProblems={allProblems}
              onRetake={handleReset}
              onOpenProblemDetail={onOpenProblemDetail}
            />
          ) : guidedDiagnosisResult ? (
            /* Guided Text Result View */
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Header Banner */}
              <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-card space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-forest uppercase tracking-wider">
                    Preliminary Diagnosis Result
                  </span>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="min-h-[44px] px-3 py-1 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 flex items-center gap-1 transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>New Check</span>
                  </button>
                </div>

                <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-gray-100">
                  {guidedDiagnosisResult.mode === 'uncertain'
                    ? 'Inconclusive Diagnosis — More Verification Needed'
                    : `Top Ranked Matches for ${selectedCrop?.name}`}
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  {guidedDiagnosisResult.message}
                </p>
              </div>

              {/* UNCERTAIN MODE FALLBACK CARD */}
              {guidedDiagnosisResult.mode === 'uncertain' && (
                <div className="bg-amber-50 rounded-3xl p-5 border border-amber-200 space-y-3">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                    <HelpCircle className="w-5 h-5 text-amber-700 flex-shrink-0" />
                    <span>Next Recommended Steps Before Spraying Chemicals</span>
                  </div>
                  <ul className="space-y-1.5 pl-1">
                    {guidedDiagnosisResult.suggestedFollowUpChecks?.map((chk: string, idx: number) => (
                      <li key={idx} className="text-xs text-amber-950 flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 flex-shrink-0 mt-0.5" />
                        <span>{chk}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="p-3 bg-white rounded-2xl border border-amber-300 text-xs text-amber-900">
                    <strong>Statutory Notice: </strong>
                    {guidedDiagnosisResult.kvkAdvisory}
                  </div>
                </div>
              )}

              {/* TOP 3 RANKED CARDS */}
              {guidedDiagnosisResult.candidates && guidedDiagnosisResult.candidates.length > 0 && (
                <div className="space-y-3">
                  {guidedDiagnosisResult.candidates.map((cand: any, idx: number) => {
                    const confColor =
                      cand.confidence === 'high'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : cand.confidence === 'medium'
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-gray-100 text-gray-800 border-gray-300';

                    return (
                      <div
                        key={cand.id || idx}
                        className="p-5 rounded-3xl bg-white border border-gray-100 shadow-card hover:border-forest/30 transition space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-3">
                            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
                              <img
                                src={cand.imageUrl || '/problems/placeholder-crop-health.webp'}
                                alt={cand.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    '/problems/placeholder-crop-health.webp';
                                }}
                              />
                            </div>

                            <div>
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="text-[11px] font-bold bg-forest text-white px-2 py-0.5 rounded-full">
                                  Rank #{idx + 1}
                                </span>
                                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${confColor}`}>
                                  {cand.confidence?.toUpperCase()} CONFIDENCE
                                </span>
                              </div>

                              <h3 className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-gray-100">
                                {language === 'kn'
                                  ? cand.nameKannada || cand.name
                                  : language === 'ta'
                                  ? cand.nameTamil || cand.name
                                  : language === 'te'
                                  ? cand.nameTelugu || cand.name
                                  : cand.name}
                              </h3>

                              {cand.scientificName && (
                                <span className="text-[11px] text-forest italic block">
                                  {cand.scientificName}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Why this matched */}
                        {cand.whyMatched && cand.whyMatched.length > 0 && (
                          <div className="bg-cream-light/40 rounded-2xl p-3 border border-cream-dark/20 text-xs space-y-1">
                            <span className="font-bold text-forest text-[11px] uppercase tracking-wider block">
                              Why this matched your field report:
                            </span>
                            <ul className="space-y-0.5">
                              {cand.whyMatched.map((w: string, wIdx: number) => (
                                <li key={wIdx} className="text-gray-800 dark:text-gray-100 text-xs flex items-center gap-1.5">
                                  <Check className="w-3.5 h-3.5 text-forest flex-shrink-0" />
                                  <span>{w}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* View Full Treatment CTA */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <span className="text-[11px] text-gray-500 italic">
                            Preliminary suggestion, not a confirmed diagnosis.
                          </span>

                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                const full = await api.diseases.getById(cand.slug);
                                onOpenProblemDetail(full);
                              } catch {
                                onOpenProblemDetail(cand);
                              }
                            }}
                            className="min-h-[44px] px-4 py-2 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest-dark transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                          >
                            <span>View Treatment Ladder</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* National Kisan Call Center Footer */}
              <div className="rounded-3xl p-4 bg-forest text-white flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2.5">
                  <PhoneCall className="w-5 h-5 text-emerald-300" />
                  <div>
                    <span className="text-xs font-bold block">Need In-Person Agronomist Help?</span>
                    <span className="text-[11px] text-emerald-200">Call Kisan Call Center (Toll-Free)</span>
                  </div>
                </div>
                <a
                  href="tel:18001801551"
                  className="min-h-[44px] inline-flex items-center px-3.5 py-1.5 rounded-xl bg-white text-forest text-xs font-extrabold hover:bg-gray-100 transition"
                >
                  1800-180-1551
                </a>
              </div>
            </motion.div>
          ) : (
            <div className="p-8 text-center text-gray-600 dark:text-gray-400">
              <p>No diagnosis results to display.</p>
              <button
                type="button"
                onClick={handleReset}
                className="min-h-[44px] mt-3 px-4 py-2 bg-forest text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
