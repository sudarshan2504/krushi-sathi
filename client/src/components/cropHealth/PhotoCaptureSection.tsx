import React, { useState, useRef } from 'react';
import { Camera, Upload, X, AlertTriangle, CheckCircle2, RotateCcw, Info, Sparkles, Image as ImageIcon, Search, Sprout, Eye } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';
import { checkAndCompressPlantPhoto, QualityCheckResult } from '../../utils/photoQualityChecker';

export type PhotoKind = 'closeup_leaf' | 'whole_plant' | 'underside_stem';

export interface CapturedPhoto {
  kind: PhotoKind;
  dataUrl: string;
  qualityWarning?: string;
}

interface PhotoCaptureSectionProps {
  photos: CapturedPhoto[];
  onChange: (photos: CapturedPhoto[]) => void;
  consentToStore: boolean;
  onConsentChange: (consent: boolean) => void;
}

interface PhotoSlotGuide {
  kind: PhotoKind;
  titleEn: string;
  titleKn: string;
  titleTa: string;
  titleTe: string;
  descEn: string;
  descKn: string;
  descTa: string;
  descTe: string;
  icon: React.ReactNode;
  badgeEn: string;
  badgeKn: string;
  badgeTa: string;
  badgeTe: string;
  sampleSvg: string;
}

const PHOTO_SLOTS: PhotoSlotGuide[] = [
  {
    kind: 'closeup_leaf',
    titleEn: '1. Close-up of Damaged Leaf',
    titleKn: '೧. ಹಾನಿಗೊಳಗಾದ ಎಲೆಯ ಹತ್ತಿರದ ಚಿತ್ರ',
    titleTa: '1. பாதிக்கப்பட்ட இலையின் நெருக்கமான படம்',
    titleTe: '1. దెబ్బతిన్న ఆకు క్లోజ్-అప్ ఫోటో',
    descEn: 'Hold camera 15-20 cm away. Keep spots, powdery layer, or borer holes in sharp focus.',
    descKn: 'ಕ್ಯಾಮೆರಾವನ್ನು ೧೫-೨೦ ಸೆಂ.ಮೀ ದೂರದಲ್ಲಿಡಿ. ಚುಕ್ಕೆಗಳು, ಬೂದಿ ಅಥವಾ ರಂಧ್ರಗಳು ಸ್ಪಷ್ಟವಾಗಿರಲಿ.',
    descTa: 'கேமராவை 15-20 செ.மீ தூரத்தில் பிடிக்கவும். புள்ளிகள் அல்லது பூஞ்சணம் தெளிவாக தெரிய வேண்டும்.',
    descTe: 'కెమెరాను 15-20 సెం.మీ దూరంలో ఉంచండి. మచ్చలు లేదా బూడిద స్పష్టంగా కనిపించాలి.',
    icon: <Search className="w-4 h-4 text-brand-600" />,
    badgeEn: 'Recommended Angle 1',
    badgeKn: 'ಶಿಫಾರಸು ಮಾಡಿದ ಕೋನ ೧',
    badgeTa: 'பரிந்துரைக்கப்பட்ட கோணம் 1',
    badgeTe: 'సిఫార్సు చేయబడిన కోణం 1',
    sampleSvg: 'leaf-closeup',
  },
  {
    kind: 'whole_plant',
    titleEn: '2. Whole Plant View',
    titleKn: '೨. ಸಂಪೂರ್ಣ ಸಸ್ಯದ ನೋಟ',
    titleTa: '2. முழு செடியின் தோற்றம்',
    titleTe: '2. మొత్తం మొక్క దృశ్యం',
    descEn: 'Step back to capture the entire plant to check overall wilting, stunting, or canopy yellowing.',
    descKn: 'ಇಡೀ ಗಿಡದ ಬಾಡುವಿಕೆ, ಬೆಳವಣಿಗೆ ಕುಂಠಿತ ಅಥವಾ ಹಳದಿ ಬಣ್ಣವನ್ನು ನೋಡಲು ಹಿಂತಿರುಗಿ ಪೂರ್ಣ ಗಿಡದ ಫೋಟೋ ತೆಗೆಯಿರಿ.',
    descTa: 'செடியின் வளர்ச்சி குன்றுதல் அல்லது வாடலைச் சரிபார்க்க முழு செடியையும் படம் பிடிக்கவும்.',
    descTe: 'మొక్క పెరుగుదల లోపం లేదా వాడిపోవడాన్ని గుర్తించడానికి మొత్తం మొక్క ఫోటో తీయండి.',
    icon: <Sprout className="w-4 h-4 text-emerald-600" />,
    badgeEn: 'Recommended Angle 2',
    badgeKn: 'ಶಿಫಾರಸು ಮಾಡಿದ ಕೋನ ೨',
    badgeTa: 'பரிந்துரைக்கப்பட்ட கோணம் 2',
    badgeTe: 'సిఫార్సు చేయబడిన కోణం 2',
    sampleSvg: 'whole-plant',
  },
  {
    kind: 'underside_stem',
    titleEn: '3. Underside of Leaf or Stem',
    titleKn: '೩. ಎಲೆಯ ಹಿಂಭಾಗ ಅಥವಾ ಕಾಂಡ',
    titleTa: '3. இலையின் கீழ்ப்பகுதி அல்லது தண்டு',
    titleTe: '3. ఆకు అడుగు భాగం లేదా కాండం',
    descEn: 'Turn leaf upside-down to reveal sucking insects, nymphs, rust pustules, or stem borers.',
    descKn: 'ರಸ ಹೀರುವ ಕೀಟಗಳು, ಮರಿಗಳು, ತುಕ್ಕು ಅಥವಾ ಕಾಂಡ ಕೊರೆಯುವ ಹುಳುಗಳನ್ನು ಪರೀಕ್ಷಿಸಲು ಎಲೆ ತಿರುಗಿಸಿ.',
    descTa: 'சாறு உறிஞ்சும் பூச்சிகள், முட்டைகள் அல்லது தண்டு புழுக்களைக் காண இலையை திருப்பிப் பிடிக்கவும்.',
    descTe: 'రసం పీల్చే పురుగులు, కాండం తొలిచే పురుగులను గుర్తించడానికి ఆకు వెనుక లేదా కాండం తీయండి.',
    icon: <Eye className="w-4 h-4 text-teal-600" />,
    badgeEn: 'Recommended Angle 3',
    badgeKn: 'ಶಿಫಾರಸು ಮಾಡಿದ ಕೋನ ೩',
    badgeTa: 'பரிந்துரைக்கப்பட்ட கோணம் 3',
    badgeTe: 'సిಫార్సు చేయబడిన కోణం 3',
    sampleSvg: 'underside-stem',
  },
];

export const PhotoCaptureSection: React.FC<PhotoCaptureSectionProps> = ({
  photos,
  onChange,
  consentToStore,
  onConsentChange,
}) => {
  const { language } = useTranslation();

  const [activeSlot, setActiveSlot] = useState<PhotoKind | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [qualityWarningModal, setQualityWarningModal] = useState<{
    kind: PhotoKind;
    result: QualityCheckResult;
  } | null>(null);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getSlotGuide = (kind: PhotoKind) => PHOTO_SLOTS.find((s) => s.kind === kind)!;

  const getLocalized = (slot: PhotoSlotGuide, field: 'title' | 'desc' | 'badge') => {
    if (field === 'title') {
      if (language === 'kn') return slot.titleKn;
      if (language === 'ta') return slot.titleTa;
      if (language === 'te') return slot.titleTe;
      return slot.titleEn;
    }
    if (field === 'desc') {
      if (language === 'kn') return slot.descKn;
      if (language === 'ta') return slot.descTa;
      if (language === 'te') return slot.descTe;
      return slot.descEn;
    }
    if (language === 'kn') return slot.badgeKn;
    if (language === 'ta') return slot.badgeTa;
    if (language === 'te') return slot.badgeTe;
    return slot.badgeEn;
  };

  const handleTriggerInput = (kind: PhotoKind, isCamera: boolean) => {
    setActiveSlot(kind);
    if (isCamera && cameraInputRef.current) {
      cameraInputRef.current.click();
    } else if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeSlot) return;

    // Reset input
    e.target.value = '';

    // Validate type
    const validMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validMimes.includes(file.type.toLowerCase())) {
      alert('Please select a JPG, PNG, or WebP photo.');
      return;
    }

    setIsProcessing(true);
    try {
      const checkResult = await checkAndCompressPlantPhoto(file, 1280);

      if (!checkResult.passed) {
        // Show quality warning modal, but allow "use anyway"
        setQualityWarningModal({
          kind: activeSlot,
          result: checkResult,
        });
      } else {
        // Save directly
        savePhotoToSlot(activeSlot, checkResult.compressedDataUrl);
      }
    } catch (err: any) {
      console.error('Image compression error:', err);
      alert('Unable to process photo. Please choose a different image.');
    } finally {
      setIsProcessing(false);
    }
  };

  const savePhotoToSlot = (kind: PhotoKind, dataUrl: string, warningMessage?: string) => {
    const updated = photos.filter((p) => p.kind !== kind);
    updated.push({
      kind,
      dataUrl,
      qualityWarning: warningMessage,
    });
    onChange(updated);
    setQualityWarningModal(null);
  };

  const handleRemovePhoto = (kind: PhotoKind) => {
    onChange(photos.filter((p) => p.kind !== kind));
  };

  const getWarningMessage = (result: QualityCheckResult) => {
    if (language === 'kn') return result.messageKn;
    if (language === 'ta') return result.messageTa;
    if (language === 'te') return result.messageTe;
    return result.messageEn;
  };

  return (
    <div className="space-y-4">
      {/* Hidden inputs for camera capture & file upload */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Header notice */}
      <div className="flex items-start gap-2.5 p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 text-xs text-forest">
        <Sparkles className="w-4 h-4 text-forest flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="block font-bold">
            {language === 'kn'
              ? 'ಸ್ಪಷ್ಟವಾದ ಫೋಟೋಗಳು ಹೆಚ್ಚು ನಿಖರವಾದ ರೋಗನಿರ್ಣಯವನ್ನು ನೀಡುತ್ತವೆ'
              : language === 'ta'
              ? 'தெளிவான புகைப்படங்கள் துல்லியமான நோயறிதலை வழங்குகின்றன'
              : language === 'te'
              ? 'స్పష్టమైన ఫోటోలు మరింత ఖచ్చితమైన నిర్ధారణను అందిస్తాయి'
              : 'Up to 3 Photos from Different Angles for Best Accuracy'}
          </strong>
          <span className="text-[11px] text-gray-600 dark:text-gray-400 block mt-0.5">
            {language === 'kn'
              ? 'ಹತ್ತಿರದ ಎಲೆ, ಸಂಪೂರ್ಣ ಸಸ್ಯ ಮತ್ತು ಎಲೆಯ ಹಿಂಭಾಗದ ಚಿತ್ರಗಳನ್ನು ಸೇರಿಸಿ. ಫೋಟೋಗಳು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಸಂಕುಚಿತಗೊಳ್ಳುತ್ತವೆ.'
              : language === 'ta'
              ? 'இலையின் நெருக்கமான படம், முழு செடி மற்றும் இலையின் கீழ்ப்பகுதியைச் சேர்க்கவும்.'
              : language === 'te'
              ? 'ఆకు క్లోజ్-అప్, మొత్తం మొక్క మరియు ఆకు వెనుక భాగం ఫోటోలను జోడించండి.'
              : 'Capture a close-up of damage, the whole plant, and underside of leaf/stem. GPS and camera metadata are stripped automatically.'}
          </span>
        </div>
      </div>

      {/* 3 Photo Slots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {PHOTO_SLOTS.map((slot) => {
          const captured = photos.find((p) => p.kind === slot.kind);

          return (
            <div
              key={slot.kind}
              className={`rounded-2xl border p-3 flex flex-col justify-between transition relative ${
                captured
                  ? 'bg-white border-forest/40 shadow-sm'
                  : 'bg-cream-light/30 border-gray-200 border-dashed hover:border-forest/40'
              }`}
            >
              {/* Badge & Slot Title */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-forest bg-forest/10 px-2 py-0.5 rounded-full">
                    {getLocalized(slot, 'badge')}
                  </span>
                  <span className="text-base">{slot.icon}</span>
                </div>

                <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {getLocalized(slot, 'title')}
                </h4>
                <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-snug mb-3">
                  {getLocalized(slot, 'desc')}
                </p>
              </div>

              {/* Slot Content: Preview or Capture Buttons */}
              {captured ? (
                <div className="space-y-2 mt-auto">
                  <div className="w-full h-36 rounded-xl overflow-hidden border border-forest/30 relative bg-black/5 group">
                    <img
                      src={captured.dataUrl}
                      alt={slot.titleEn}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(slot.kind)}
                      className="absolute top-0.5 right-0.5 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
                      title="Remove photo"
                      aria-label="Remove photo"
                    >
                      <span className="p-1.5 rounded-full bg-red-600 text-white shadow-md hover:bg-red-700 transition">
                        <X className="w-3.5 h-3.5" />
                      </span>
                    </button>
                    {captured.qualityWarning && (
                      <div className="absolute bottom-1 left-1 right-1 bg-amber-950/80 backdrop-blur-sm px-2 py-1 rounded text-[11px] text-amber-200 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-400 flex-shrink-0" />
                        <span className="truncate">{captured.qualityWarning}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-forest font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {language === 'kn' ? 'ಫೋಟೋ ಸಿದ್ಧವಾಗಿದೆ' : 'Ready'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleTriggerInput(slot.kind, true)}
                      className="min-h-[44px] inline-flex items-center px-2 text-gray-600 dark:text-gray-400 hover:text-forest text-[11px] font-semibold underline gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      {language === 'kn' ? 'ಮರುತೆಗೆಯಿರಿ' : 'Retake'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 mt-auto pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleTriggerInput(slot.kind, true)}
                      disabled={isProcessing}
                      className="flex-1 py-2 px-2.5 rounded-xl bg-forest text-white text-[11px] font-bold hover:bg-forest-dark transition flex items-center justify-center gap-1.5 min-h-[44px] shadow-sm disabled:opacity-50 cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{language === 'kn' ? 'ಕ್ಯಾಮೆರಾ' : language === 'ta' ? 'கேமரா' : language === 'te' ? 'కెమెరా' : 'Camera'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTriggerInput(slot.kind, false)}
                      disabled={isProcessing}
                      className="flex-1 py-2 px-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 dark:text-gray-100 text-[11px] font-bold hover:bg-gray-50 transition flex items-center justify-center gap-1.5 min-h-[44px] shadow-xs disabled:opacity-50 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-gray-500" />
                      <span>{language === 'kn' ? 'ಅಪ್‌ಲೋಡ್' : language === 'ta' ? 'பதிவேற்று' : language === 'te' ? 'అప్‌లోడ్' : 'Upload'}</span>
                    </button>
                  </div>
                  <span className="text-[11px] text-gray-600 text-center block">
                    JPG, PNG, WebP &lt; 5MB
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Privacy Consent Checkbox */}
      <div className="p-3 bg-gray-50/80 rounded-2xl border border-gray-200 text-xs space-y-1">
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={consentToStore}
            onChange={(e) => onConsentChange(e.target.checked)}
            className="mt-0.5 rounded border-gray-300 text-forest focus:ring-forest cursor-pointer"
          />
          <div className="text-[11px] text-gray-800 dark:text-gray-100 leading-snug">
            <span className="font-bold block">
              {language === 'kn'
                ? 'ಕೃಷಿ ಸಾಥಿ ಸುಧಾರಣೆಗೆ ಈ ಫೋಟೋವನ್ನು ಉಳಿಸಲು ಅನುಮತಿಸಿ (ಐಚ್ಛಿಕ)'
                : language === 'ta'
                ? 'கிருஷி சாதியை மேம்படுத்த இந்த புகைப்படத்தை சேமிக்க அனுமதிக்கவும் (விருப்பத்தேர்வு)'
                : language === 'te'
                ? 'కృషి సాథిని మెరుగుపరచడానికి ఈ ఫోటోను సేవ్ చేయడానికి అనుమతించండి (ఐచ్ఛికం)'
                : 'Allow saving this photo to improve Krushi Sathi agricultural models (Optional)'}
            </span>
            <span className="text-gray-600 dark:text-gray-400 block mt-0.5">
              {language === 'kn'
                ? 'ಗುರುತು ರಹಿತ ರೋಗಶಾಸ್ತ್ರ ಸಂಶೋಧನೆಗಾಗಿ ಮಾತ್ರ ಬಳಸಲಾಗುತ್ತದೆ. ಯಾವುದೇ ಜಿಪಿಎಸ್ ಅಥವಾ ವೈಯಕ್ತಿಕ ವಿವರಗಳನ್ನು ಸಂಗ್ರಹಿಸಲಾಗುವುದಿಲ್ಲ.'
                : 'Used strictly for anonymous plant pathology accuracy benchmarking. No GPS, device info, or personal data is ever stored.'}
            </span>
          </div>
        </label>
      </div>

      {/* Quality Check Warning Modal */}
      {qualityWarningModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full border border-amber-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-gray-100">
                {language === 'kn'
                  ? 'ಫೋಟೋ ಗುಣಮಟ್ಟದ ಎಚ್ಚರಿಕೆ'
                  : language === 'ta'
                  ? 'புகைப்பட தர எச்சரிக்கை'
                  : language === 'te'
                  ? 'ఫోటో నాణ్యత హెచ్చరిక'
                  : 'Photo Quality Advisory'}
              </h3>
              <p className="text-xs text-amber-900 bg-amber-50 p-3 rounded-2xl border border-amber-200 leading-relaxed">
                {getWarningMessage(qualityWarningModal.result)}
              </p>
              <p className="text-[11px] text-gray-600 dark:text-gray-400">
                {language === 'kn'
                  ? 'ಮಸುಕಾದ ಅಥವಾ ಗಾಢವಾದ ಫೋಟೋಗಳು ತಪ್ಪು ರೋಗನಿರ್ಣಯಕ್ಕೆ ಕಾರಣವಾಗಬಹುದು. ಉತ್ತಮ ಫಲಿತಾಂಶಕ್ಕಾಗಿ ಮರುತೆಗೆಯಿರಿ.'
                  : 'Blurry, dark, or overexposed photos reduce AI confidence. We recommend retaking in bright natural daylight.'}
              </p>
            </div>

            {/* Preview of problematic photo */}
            <div className="w-28 h-28 mx-auto rounded-xl overflow-hidden border border-amber-300">
              <img
                src={qualityWarningModal.result.compressedDataUrl}
                alt="Captured sample"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  const targetSlot = qualityWarningModal.kind;
                  setQualityWarningModal(null);
                  handleTriggerInput(targetSlot, true);
                }}
                className="flex-1 min-h-[44px] py-2.5 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest-dark transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>
                  {language === 'kn'
                    ? 'ಮರುತೆಗೆಯಿರಿ (ಶಿಫಾರಸು)'
                    : language === 'ta'
                    ? 'மீண்டும் எடுக்கவும்'
                    : language === 'te'
                    ? 'మళ్లీ తీయండి'
                    : 'Retake Photo'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  savePhotoToSlot(
                    qualityWarningModal.kind,
                    qualityWarningModal.result.compressedDataUrl,
                    getWarningMessage(qualityWarningModal.result)
                  );
                }}
                className="min-h-[44px] py-2.5 px-3 rounded-xl bg-gray-100 text-gray-700 text-xs font-bold hover:bg-gray-200 transition cursor-pointer"
              >
                {language === 'kn' ? 'ಹಾಗೆಯೇ ಬಳಸಿ' : 'Use Anyway'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
