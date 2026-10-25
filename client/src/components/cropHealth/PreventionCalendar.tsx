import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Shield,
  CheckCircle,
  Sprout,
  Flower2,
  Wheat,
  RotateCcw,
  AlertCircle,
  Info,
} from 'lucide-react';
import { ProblemItem } from '../../types';
import { useTranslation } from '../../context/LanguageContext';

interface PreventionCalendarProps {
  cropName: string;
  cropSlug: string;
  problems: ProblemItem[];
  onSelectProblem?: (problem: ProblemItem) => void;
}

interface CalendarStep {
  stageId: 'seed' | 'vegetative' | 'flowering' | 'fruiting' | 'harvest';
  stageNameEn: string;
  stageNameKn: string;
  stageNameTa: string;
  stageNameTe: string;
  icon: any;
  timingEn: string;
  timingKn: string;
  timingTa: string;
  timingTe: string;
  actionEn: string;
  actionKn: string;
  actionTa: string;
  actionTe: string;
  targetProblems: string[];
}

export const PreventionCalendar: React.FC<PreventionCalendarProps> = ({
  cropName,
  cropSlug,
  problems,
  onSelectProblem,
}) => {
  const { t, language } = useTranslation();
  const [activeStage, setActiveStage] = useState<string>('all');

  // Derive stage prevention items for the selected crop
  const getCalendarSteps = (): CalendarStep[] => {
    return [
      {
        stageId: 'seed',
        stageNameEn: '1. Seed & Sowing / Nursery',
        stageNameKn: '1. ಬೀಜೋಪಚಾರ ಮತ್ತು ಬಿತ್ತನೆ ಹಂತ',
        stageNameTa: '1. விதை மற்றும் விதைப்பு நிலை',
        stageNameTe: '1. విత్తన మరియు నాట్లు దశ',
        icon: Sprout,
        timingEn: '0 to 20 days after sowing',
        timingKn: 'ಬಿತ್ತನೆಯಿಂದ 0-20 ದಿನಗಳು',
        timingTa: 'விதைத்த 0-20 நாட்கள்',
        timingTe: 'విత్తిన 0-20 రోజులు',
        actionEn:
          'Use certified pathogen-free seeds. Treat seeds with Trichoderma viride (4g/kg) or Pseudomonas fluorescens (10g/kg). Ensure deep summer ploughing to expose resting pupae and fungal sclerotia to solar heat.',
        actionKn:
          'ರೋಗಮುಕ್ತ ಪ್ರಮಾಣೀಕೃತ ಬೀಜಗಳನ್ನು ಬಳಸಿ. ಟ್ರೈಕೋಡರ್ಮಾ ವಿರಿಡೆ (೪ ಗ್ರಾಂ/ಕೆಜಿ) ಯೊಂದಿಗೆ ಬೀಜೋಪಚಾರ ಮಾಡಿ. ಆಳವಾದ ಬೇಸಿಗೆ ಉಳುಮೆ ಮಾಡಿ ಶಿಲೀಂಧ್ರಗಳನ್ನು ನಾಶಪಡಿಸಿ.',
        actionTa:
          'சான்றளிக்கப்பட்ட விதைகளைப் பயன்படுத்தவும். ட்ரைகோடெர்மா விரிடி கொண்டு விதை நேர்த்தி செய்யவும். கோடை உழவு செய்யவும்.',
        actionTe:
          'ధృవీకరించబడిన విత్తనాలను వాడండి. ట్రైకోడెర్మాతో విత్తన శుద్ధి చేయండి. లోతైన వేసవి దుక్కి చేయండి.',
        targetProblems: problems
          .filter(p =>
            p.type === 'fungal' ||
            p.type === 'nematode' ||
            p.symptoms?.toLowerCase().includes('seedling') ||
            p.symptoms?.toLowerCase().includes('damping') ||
            p.symptoms?.toLowerCase().includes('root rot')
          )
          .map(p => p.name)
          .slice(0, 4),
      },
      {
        stageId: 'vegetative',
        stageNameEn: '2. Vegetative & Tillering',
        stageNameKn: '2. ಸಸ್ಯ ಬೆಳವಣಿಗೆ ಹಂತ',
        stageNameTa: '2. வளர்ச்சி நிலை',
        stageNameTe: '2. శాఖీయ పెరుగుదల దశ',
        icon: Wheat,
        timingEn: '21 to 50 days after sowing',
        timingKn: 'ಬಿತ್ತನೆಯಿಂದ 21-50 ದಿನಗಳು',
        timingTa: 'விதைத்த 21-50 நாட்கள்',
        timingTe: 'విత్తిన 21-50 రోజులు',
        actionEn:
          'Install yellow sticky traps (10/acre) for sucking pests (aphids, whiteflies, thrips) and pheromone traps (4-5/acre). Maintain optimum field drainage to prevent waterlogging. Avoid excessive nitrogen fertilizer.',
        actionKn:
          'ಎಕರೆಗೆ 10 ಹಳದಿ ಜಿಗುಟು ಬಲೆಗಳನ್ನು ಮತ್ತು 4-5 ಮೋಹಕ ಬಲೆಗಳನ್ನು ಅಳವಡಿಸಿ. ಅತಿಯಾದ ಸಾರಜನಕ ಗೊಬ್ಬರ ತಪ್ಪಿಸಿ, ಸರಿಯಾದ ಒಳಚರಂಡಿ ಇರಿಸಿ.',
        actionTa:
          'மஞ்சள் ஒட்டும் பொறிகள் மற்றும் இனக்கவர்ச்சி பொறிகளை அமைக்கவும். அதிகப்படியான தழைச்சத்தை தவிர்க்கவும்.',
        actionTe:
          'పసుపు రంగు జిగురు బుట్టలు మరియు లింగాకర్షక బుట్టలు ఏర్పాటు చేయండి. అధిక నత్రజని వాడకం తగ్గించండి.',
        targetProblems: problems
          .filter(p =>
            p.type === 'insect_pest' ||
            p.type === 'viral' ||
            p.symptoms?.toLowerCase().includes('borer') ||
            p.symptoms?.toLowerCase().includes('sucking') ||
            p.symptoms?.toLowerCase().includes('leaf')
          )
          .map(p => p.name)
          .slice(0, 4),
      },
      {
        stageId: 'flowering',
        stageNameEn: '3. Flowering & Panicle Stage',
        stageNameKn: '3. ಹೂವು ಮತ್ತು ತೆನೆ ಹಂತ',
        stageNameTa: '3. பூக்கும் நிலை',
        stageNameTe: '3. పూత మరియు కంకి దశ',
        icon: Flower2,
        timingEn: '51 to 80 days after sowing',
        timingKn: 'ಬಿತ್ತನೆಯಿಂದ 51-80 ದಿನಗಳು',
        timingTa: 'விதைத்த 51-80 நாட்கள்',
        timingTe: 'విత్తిన 51-80 రోజులు',
        actionEn:
          'Regular scouting twice weekly. Remove rogue weeds and alternate host plants. Avoid overhead sprinkler irrigation during pollination hours. If fungal leaf spots appear, spray botanical extracts (Neem oil 3000ppm) or biocontrol agents in evening.',
        actionKn:
          'ವಾರಕ್ಕೆ ಎರಡು ಬಾರಿ ಬೆಳೆ ಪರಿಶೀಲಿಸಿ. ಕಳೆಗಳನ್ನು ಕಿತ್ತುಹಾಕಿ. ಹೂಬಿಡುವ ಸಮಯದಲ್ಲಿ ಸಂಜೆ ವೇಳೆ ಬೇವು ಆಧಾರಿತ ಔಷಧ ಸಿಂಪಡಿಸಿ.',
        actionTa:
          'வாரத்திற்கு இரண்டு முறை ஆய்வு செய்யவும். மாலையில் வேப்ப எண்ணெய் தெளிக்கவும்.',
        actionTe:
          'వారానికి రెండుసార్లు పంటను పరిశీలించండి. సాయంత్రం వేళల్లో వేప నూనె పిచికారీ చేయండి.',
        targetProblems: problems
          .filter(p =>
            p.type === 'fungal' ||
            p.type === 'bacterial' ||
            p.symptoms?.toLowerCase().includes('blast') ||
            p.symptoms?.toLowerCase().includes('blight') ||
            p.symptoms?.toLowerCase().includes('mildew') ||
            p.symptoms?.toLowerCase().includes('spot')
          )
          .map(p => p.name)
          .slice(0, 4),
      },
      {
        stageId: 'fruiting',
        stageNameEn: '4. Grain / Fruit Formation & Maturity',
        stageNameKn: '4. ಕಾಳು / ಕಾಯಿ ತುಂಬುವ ಹಂತ',
        stageNameTa: '4. காய் / தானிய வளர்ச்சி நிலை',
        stageNameTe: '4. గింజ / కాయ ఏర్పడే దశ',
        icon: Wheat,
        timingEn: '81 to 110 days after sowing',
        timingKn: 'ಬಿತ್ತನೆಯಿಂದ 81-110 ದಿನಗಳು',
        timingTa: 'விதைத்த 81-110 நாட்கள்',
        timingTe: 'విత్తిన 81-110 రోజులు',
        actionEn:
          'Monitor grain heads and pods for internal caterpillars and stink bugs. Observe strict Pre-Harvest Intervals (PHI) for any approved plant protection measures. Stop irrigation 10-14 days before harvest.',
        actionKn:
          'ಕಾಯಿ ಕೊರೆಯುವ ಹುಳುಗಳಿಗಾಗಿ ಪರಿಶೀಲಿಸಿ. ಕೊಯ್ಲಿಗೆ 10-14 ದಿನಗಳ ಮೊದಲು ನೀರುಣಿಸುವುದನ್ನು ನಿಲ್ಲಿಸಿ. ಕಡ್ಡಾಯ ಕಾಯುವಿಕೆ ಅವಧಿ (PHI) ಪಾಲಿಸಿ.',
        actionTa:
          'காய் துளைப்பான்களை கண்காணிக்கவும். அறுவடைக்கு 10-14 நாட்களுக்கு முன் பாசனத்தை நிறுத்தவும்.',
        actionTe:
          'కాయ తొలుచు పురుగులను గమనించండి. కోతకు 10-14 రోజుల ముందు నీటి తడులను నిలిపివేయండి.',
        targetProblems: problems
          .filter(p =>
            p.symptoms?.toLowerCase().includes('pod') ||
            p.symptoms?.toLowerCase().includes('grain') ||
            p.symptoms?.toLowerCase().includes('fruit') ||
            p.symptoms?.toLowerCase().includes('smut')
          )
          .map(p => p.name)
          .slice(0, 4),
      },
      {
        stageId: 'harvest',
        stageNameEn: '5. Harvest & Post-Harvest Field Sanitation',
        stageNameKn: '5. ಕೊಯ್ಲು ಮತ್ತು ನಂತರದ ನೈರ್ಮಲ್ಯ',
        stageNameTa: '5. அறுவடை மற்றும் வயல் சுகாதாரம்',
        stageNameTe: '5. కోత మరియు పంట అనంతర పారిశుద్ధ్యం',
        icon: RotateCcw,
        timingEn: 'Post harvest & land preparation',
        timingKn: 'ಕೊಯ್ಲಿನ ನಂತರ',
        timingTa: 'அறுவடைக்கு பின்',
        timingTe: 'కోత తర్వాత',
        actionEn:
          'Collect and compost or burn infected crop debris to eliminate overwintering spores and pupae. Dry grains to below 12% moisture before storage. Clean seed storage bins and apply neem leaf dusting.',
        actionKn:
          'ರೋಗಪೀಡಿತ ಬೆಳೆ ತ್ಯಾಜ್ಯಗಳನ್ನು ಸಂಗ್ರಹಿಸಿ ಸಂಸ್ಕರಿಸಿ. ಧಾನ್ಯಗಳನ್ನು ಶೇಕಡಾ 12ಕ್ಕಿಂತ ಕಡಿಮೆ ತೇವಾಂಶಕ್ಕೆ ಒಣಗಿಸಿ ದಾಸ್ತಾನು ಮಾಡಿ.',
        actionTa:
          'பாதிக்கப்பட்ட பயிர் கழிவுகளை அகற்றவும். தானியங்களை 12% ஈரப்பதத்திற்கு கீழ் உலர்த்தி சேமிக்கவும்.',
        actionTe:
          'తెగులు సోకిన పంట వ్యర్థాలను నాశనం చేయండి. ధాన్యాన్ని 12% కంటే తక్కువ తేమ ఉండేలా ఆరబెట్టి నిల్వ చేయండి.',
        targetProblems: problems
          .filter(p => p.type === 'fungal' || p.type === 'bacterial')
          .map(p => p.name)
          .slice(0, 4),
      },
    ];
  };

  const steps = getCalendarSteps();
  const filteredSteps = activeStage === 'all'
    ? steps
    : steps.filter(s => s.stageId === activeStage);

  const getStageTitle = (step: CalendarStep) => {
    if (language === 'kn') return step.stageNameKn;
    if (language === 'ta') return step.stageNameTa;
    if (language === 'te') return step.stageNameTe;
    return step.stageNameEn;
  };

  const getStageTiming = (step: CalendarStep) => {
    if (language === 'kn') return step.timingKn;
    if (language === 'ta') return step.timingTa;
    if (language === 'te') return step.timingTe;
    return step.timingEn;
  };

  const getStageAction = (step: CalendarStep) => {
    if (language === 'kn') return step.actionKn;
    if (language === 'ta') return step.actionTa;
    if (language === 'te') return step.actionTe;
    return step.actionEn;
  };

  return (
    <div className="space-y-4">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-forest/10 via-emerald-50 to-mint/30 rounded-3xl p-4 sm:p-5 border border-forest/20">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-forest text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-dark-text">
              {t('preventionCalendar') || 'Crop Health Prevention Calendar'}: <span className="text-forest">{cropName}</span>
            </h2>
            <p className="text-xs text-dark-muted mt-0.5 leading-relaxed">
              Timely proactive cultural & biological steps aligned with your crop's lifecycle stages. Preventing problems before they strike saves cost and protects yields.
            </p>
          </div>
        </div>
      </div>

      {/* Stage Selector Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveStage('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap min-h-[40px] cursor-pointer ${
            activeStage === 'all'
              ? 'bg-forest text-white shadow-sm'
              : 'bg-white text-dark-text border border-gray-200 hover:bg-gray-50'
          }`}
        >
          All Stages ({steps.length})
        </button>
        {steps.map((st) => (
          <button
            key={st.stageId}
            type="button"
            onClick={() => setActiveStage(st.stageId)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap min-h-[40px] cursor-pointer ${
              activeStage === st.stageId
                ? 'bg-forest text-white shadow-sm'
                : 'bg-white text-dark-text border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {getStageTitle(st).split('.')[1]?.trim() || st.stageNameEn}
          </button>
        ))}
      </div>

      {/* Timeline Steps Cards */}
      <div className="space-y-3.5">
        {filteredSteps.map((step, idx) => {
          const StepIcon = step.icon;
          return (
            <motion.div
              key={step.stageId}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-3xl p-5 border border-gray-100 shadow-card space-y-3"
            >
              <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-forest/10 text-forest flex items-center justify-center flex-shrink-0">
                    <StepIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-dark-text">
                      {getStageTitle(step)}
                    </h3>
                    <span className="text-[11px] font-bold text-forest block">
                      {getStageTiming(step)}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  Step {idx + 1}
                </span>
              </div>

              {/* Action Details */}
              <div className="text-xs sm:text-sm text-dark-text/90 leading-relaxed font-medium">
                {getStageAction(step)}
              </div>

              {/* Specific Problems Prevented */}
              {step.targetProblems.length > 0 && (
                <div className="bg-cream-light/50 rounded-2xl p-3 border border-cream-dark/20 text-xs">
                  <span className="font-bold text-dark-text block mb-1.5 text-[11px] uppercase tracking-wider text-forest">
                    {t('prevention') || 'Problems Prevented at this Stage'}:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {step.targetProblems.map((probName, pIdx) => {
                      const matched = problems.find(p => p.name === probName);
                      return (
                        <button
                          key={pIdx}
                          type="button"
                          onClick={() => matched && onSelectProblem?.(matched)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                            matched
                              ? 'bg-white border border-forest/20 text-forest hover:bg-forest hover:text-white cursor-pointer shadow-2xs'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {probName}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
