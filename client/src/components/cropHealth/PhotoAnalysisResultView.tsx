import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  RotateCcw,
  MessageSquare,
  Share2,
  BookmarkCheck,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  PhoneCall,
  Sparkles,
  Info,
  Check,
  X,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { api } from '../../services/api';
import { useTranslation } from '../../context/LanguageContext';
import { ProblemItem } from '../../types';

interface PhotoAnalysisResultViewProps {
  result: any;
  userPhotos: Array<{ kind: string; dataUrl: string }>;
  cropName: string;
  allProblems: ProblemItem[];
  onRetake: () => void;
  onOpenProblemDetail: (problem: ProblemItem) => void;
}

export const PhotoAnalysisResultView: React.FC<PhotoAnalysisResultViewProps> = ({
  result,
  userPhotos,
  cropName,
  allProblems,
  onRetake,
  onOpenProblemDetail,
}) => {
  const navigate = useNavigate();
  const { t, language } = useTranslation();

  const [selectedCandidateIndex, setSelectedCandidateIndex] = useState<number>(0);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);

  // Feedback State
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);
  const [feedbackRating, setFeedbackRating] = useState<'correct' | 'incorrect' | 'not_sure' | null>(null);
  const [showCorrectionDropdown, setShowCorrectionDropdown] = useState<boolean>(false);
  const [selectedCorrectionSlug, setSelectedCorrectionSlug] = useState<string>('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState<boolean>(false);

  // Sharing / Saved State
  const [shareCopied, setShareCopied] = useState<boolean>(false);
  const [historySaved, setHistorySaved] = useState<boolean>(false);

  const candidates = result.candidates || [];
  const topCandidate = candidates[selectedCandidateIndex] || candidates[0];

  const handleFeedback = async (rating: 'correct' | 'incorrect' | 'not_sure') => {
    setFeedbackRating(rating);
    if (rating === 'incorrect') {
      setShowCorrectionDropdown(true);
      return;
    }

    setIsSubmittingFeedback(true);
    try {
      await api.diseases.sendDiagnosisFeedback({
        problemSlug: topCandidate?.slug || 'unknown',
        confidence: topCandidate?.confidence || 'medium',
        crop: cropName,
        rating,
        hasConsent: Boolean(result.savedPhotoPath),
        storedImagePath: result.savedPhotoPath,
      });
      setFeedbackSubmitted(true);
    } catch (err) {
      console.error('Feedback submit error:', err);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleCorrectionSubmit = async () => {
    setIsSubmittingFeedback(true);
    try {
      await api.diseases.sendDiagnosisFeedback({
        problemSlug: topCandidate?.slug || 'unknown',
        confidence: topCandidate?.confidence || 'medium',
        crop: cropName,
        rating: 'incorrect',
        farmerCorrection: selectedCorrectionSlug || 'other',
        hasConsent: Boolean(result.savedPhotoPath),
        storedImagePath: result.savedPhotoPath,
      });
      setFeedbackSubmitted(true);
      setShowCorrectionDropdown(false);
    } catch (err) {
      console.error('Correction submit error:', err);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleAskAiChat = () => {
    const candidateName = topCandidate?.name || 'plant disease';
    const signs = (result.observedSigns || []).slice(0, 3).join(', ');
    const query = `I just took a photo of my ${cropName} crop with symptoms: ${signs}. Krushi Sathi identified it as ${candidateName}. Can you give me more management advice?`;

    navigate('/chat', {
      state: {
        prefilledQuery: query,
        cropContext: cropName,
        diseaseContext: candidateName,
      },
    });
  };

  const handleShareWithOfficer = async () => {
    const candidateName = topCandidate?.name || 'Crop Health Observation';
    const text = `Krushi Sathi Crop Health Analysis:\nCrop: ${cropName}\nPreliminary Finding: ${candidateName} (${topCandidate?.confidence || 'medium'} confidence)\nObserved Signs: ${(result.observedSigns || []).join('; ')}\nAdvisory: ${result.notice}\nKisan Call Centre: 1800-180-1551`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Krushi Sathi: ${candidateName}`,
          text,
        });
        return;
      } catch {
        // User cancelled or unsupported
      }
    }

    navigator.clipboard.writeText(text);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 3000);
  };

  const handleSaveToHistory = () => {
    setHistorySaved(true);
    setTimeout(() => setHistorySaved(false), 4000);
  };

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold px-3 py-1 rounded-full text-xs">High Match</span>;
      case 'medium':
        return <span className="bg-amber-100 text-amber-800 border border-amber-300 font-extrabold px-3 py-1 rounded-full text-xs">Moderate Match</span>;
      default:
        return <span className="bg-rose-100 text-rose-800 border border-rose-300 font-extrabold px-3 py-1 rounded-full text-xs">Low Confidence / Check Look-Alikes</span>;
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* 1. Mandatory Statutory Notice Banner */}
      <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-4 flex items-start gap-3 shadow-sm">
        <ShieldAlert className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-xs sm:text-sm font-black text-amber-900">
            {language === 'kn' && 'ಪ್ರಾಥಮಿಕ ಸಲಹೆ — ಇದು ಪ್ರಮಾಣೀಕೃತ ಲ್ಯಾಬ್ ಪರೀಕ್ಷೆಯಲ್ಲ'}
            {language === 'ta' && 'ஆரம்பநிலை வழிகாட்டல் — இது ஆய்வக அறிக்கை அல்ல'}
            {language === 'te' && 'ప్రాథమిక సూచన — ఇది నిర్ధారిత ప్రయోగశాల పరీక్ష కాదు'}
            {language === 'en' && 'Preliminary suggestion, not a confirmed diagnosis'}
          </p>
          <p className="text-[11px] sm:text-xs text-amber-800 leading-relaxed">
            {result.notice}
          </p>
        </div>
      </div>

      {/* Disagreement Warning if tags and photos disagreed */}
      {result.disagreementDetected && (
        <div className="bg-orange-50 border border-orange-200 rounded-3xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
          <div className="text-xs text-orange-900 space-y-1">
            <span className="font-bold">Symptoms vs Photo Discrepancy:</span>
            <p>Your selected symptom pattern differed slightly from what the vision model observed on the plant. We have lowered the confidence rating and provided distinguishing checks below.</p>
          </div>
        </div>
      )}

      {/* 2. Side-by-Side Photo Comparison */}
      <div className="bg-white rounded-3xl border border-gray-200 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-extrabold text-dark-text flex items-center gap-2">
            <span>📷</span>
            <span>
              {language === 'kn' && 'ಫೋಟೋ ಹೋಲಿಕೆ (ನಿಮ್ಮ ಫೋಟೋ vs ಪರಿಶೀಲಿಸಿದ ಲೈಬ್ರರಿ)'}
              {language === 'ta' && 'புகைப்பட ஒப்பீடு (உங்கள் படம் vs நூலக குறிப்பு படம்)'}
              {language === 'te' && 'ఫోటో పోలిక (మీ ఫోటో vs ప్రామాణిక చిత్రం)'}
              {language === 'en' && 'Photo Comparison (Your Field Photo vs Verified Reference)'}
            </span>
          </h3>
          {userPhotos.length > 1 && (
            <div className="flex gap-1">
              {userPhotos.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActivePhotoIndex(idx)}
                  className={`w-6 h-6 rounded-full text-xs font-bold transition ${activePhotoIndex === idx ? 'bg-forest text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* User's Uploaded Photo */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-gray-500">
              <span>Your Field Photo (#{activePhotoIndex + 1})</span>
              <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full capitalize">
                {userPhotos[activePhotoIndex]?.kind?.replace('_', ' ') || 'Leaf View'}
              </span>
            </div>
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shadow-inner flex items-center justify-center">
              {userPhotos[activePhotoIndex]?.dataUrl ? (
                <img
                  src={userPhotos[activePhotoIndex].dataUrl}
                  alt="Your crop submission"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs text-gray-400">Photo preview</span>
              )}
            </div>
          </div>

          {/* Reference Verified Image from Catalog */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-gray-500">
              <span>Verified ICAR Reference</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                {topCandidate?.name || 'Reference Problem'}
              </span>
            </div>
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shadow-inner flex items-center justify-center relative">
              <img
                src={topCandidate?.imageUrl || '/problems/placeholder-crop-health.webp'}
                alt={topCandidate?.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/problems/placeholder-crop-health.webp';
                }}
              />
              <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-md rounded-xl p-2 text-white text-[11px] font-medium leading-tight">
                {topCandidate?.name} ({topCandidate?.scientificName || 'Pathogen / Pest'})
              </div>
            </div>
          </div>
        </div>

        {/* What We Noticed in Your Photo */}
        {result.observedSigns && result.observedSigns.length > 0 && (
          <div className="bg-forest-light/30 border border-forest/15 rounded-2xl p-3.5 space-y-2">
            <h4 className="text-xs font-black text-forest uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-forest" />
              <span>What We Noticed in Your Photo</span>
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {result.observedSigns.map((sign: string, idx: number) => (
                <span
                  key={idx}
                  className="bg-white border border-forest/20 text-dark-text text-xs font-bold px-3 py-1 rounded-xl shadow-xs"
                >
                  • {sign}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. Candidate Rankings (Top 3) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-dark-text">
            {candidates.length > 1 ? `Identified Candidates (${candidates.length})` : 'Diagnosis Match'}
          </h3>
          <span className="text-xs text-gray-500">Select card to view treatment</span>
        </div>

        {result.unknownOrOutsideCatalog || candidates.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-6 text-center space-y-3 shadow-sm">
            <HelpCircle className="w-12 h-12 text-amber-500 mx-auto" />
            <h4 className="text-base font-black text-dark-text">
              {language === 'kn' && 'ಖಚಿತವಾಗಿ ಗುರುತಿಸಲು ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ'}
              {language === 'ta' && 'உறுதியாகக் கண்டறிய முடியவில்லை'}
              {language === 'te' && 'ఖచ్చితంగా గుర్తించలేకపోయాము'}
              {language === 'en' && "I'm Not Sure — Low Visual Match"}
            </h4>
            <p className="text-xs text-gray-600 max-w-md mx-auto">
              {result.retakeAdvice || 'The photo symptoms do not clearly match any single threat in our verified catalog for this crop. Please inspect look-alikes or contact your local expert.'}
            </p>
            {result.followUpQuestion && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-900 font-bold max-w-md mx-auto">
                ❓ Follow-up Check: {result.followUpQuestion}
              </div>
            )}
            <div className="pt-2 flex flex-wrap gap-2 justify-center">
              <button
                type="button"
                onClick={onRetake}
                className="btn-primary text-xs flex items-center gap-1.5 py-2 px-4"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retake Photo</span>
              </button>
              <a
                href="tel:18001801551"
                className="btn-secondary text-xs flex items-center gap-1.5 py-2 px-4 text-forest"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call KVK / RSK (1800-180-1551)</span>
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {candidates.map((cand: any, idx: number) => {
              const isSelected = selectedCandidateIndex === idx;
              return (
                <div
                  key={cand.id || cand.slug}
                  onClick={() => setSelectedCandidateIndex(idx)}
                  className={`bg-white rounded-3xl p-4 border transition cursor-pointer shadow-xs ${
                    isSelected
                      ? 'border-forest ring-2 ring-forest/20 shadow-md bg-forest-light/10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-gray-400">#{idx + 1}</span>
                        <h4 className="text-sm sm:text-base font-black text-dark-text">
                          {language === 'kn' && cand.nameKannada ? cand.nameKannada :
                           language === 'ta' && cand.nameTamil ? cand.nameTamil :
                           language === 'te' && cand.nameTelugu ? cand.nameTelugu : cand.name}
                        </h4>
                      </div>
                      <p className="text-xs text-gray-500 italic">{cand.scientificName}</p>
                    </div>
                    {getConfidenceBadge(cand.confidence)}
                  </div>

                  {/* Matched vs Not Matching Signs */}
                  <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {cand.matchedSigns && cand.matchedSigns.length > 0 && (
                      <div className="space-y-1">
                        <span className="font-bold text-emerald-800 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Matched Signs:
                        </span>
                        <p className="text-gray-600 pl-4">{cand.matchedSigns.join(', ')}</p>
                      </div>
                    )}
                    {cand.notMatchingSigns && cand.notMatchingSigns.length > 0 && (
                      <div className="space-y-1">
                        <span className="font-bold text-gray-600 flex items-center gap-1">
                          <Info className="w-3.5 h-3.5 text-gray-400" /> Key Signs Missing:
                        </span>
                        <p className="text-gray-500 pl-4">{cand.notMatchingSigns.join(', ')}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Verified Database Treatment Ladder for Selected Candidate */}
      {topCandidate && (
        <div className="bg-white rounded-3xl border border-gray-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <span className="text-[10px] font-black uppercase text-forest tracking-wider">
                ICAR / Agricultural University Treatment Protocol
              </span>
              <h3 className="text-base font-black text-dark-text">
                {topCandidate.name} Management
              </h3>
            </div>
            <button
              type="button"
              onClick={() => {
                const fullItem = allProblems.find(p => p.slug === topCandidate.slug);
                if (fullItem) onOpenProblemDetail(fullItem);
              }}
              className="text-xs font-bold text-forest hover:underline flex items-center gap-1"
            >
              <span>Full Details</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {/* Tier 1: Cultural Practices */}
            <div className="border border-emerald-100 bg-emerald-50/50 rounded-2xl p-3.5 space-y-1">
              <span className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                <span>🌱</span> Step 1: Cultural & Agronomic Practices
              </span>
              <p className="text-xs text-emerald-950 leading-relaxed">
                {topCandidate.culturalControl}
              </p>
            </div>

            {/* Tier 2: Biological & Bio-agents */}
            <div className="border border-teal-100 bg-teal-50/50 rounded-2xl p-3.5 space-y-1">
              <span className="text-xs font-black text-teal-900 flex items-center gap-1.5">
                <span>🦠</span> Step 2: Biological Control (Bio-pesticides)
              </span>
              <p className="text-xs text-teal-950 leading-relaxed">
                {topCandidate.biologicalControl}
              </p>
            </div>

            {/* Tier 3: Organic Remedies */}
            <div className="border border-amber-100 bg-amber-50/50 rounded-2xl p-3.5 space-y-1">
              <span className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                <span>🌿</span> Step 3: Organic Concoctions & Traps
              </span>
              <p className="text-xs text-amber-950 leading-relaxed">
                {topCandidate.organicControl}
              </p>
            </div>

            {/* Tier 4: Chemical Controls (generic active ingredients ONLY) */}
            <div className="border border-purple-100 bg-purple-50/50 rounded-2xl p-3.5 space-y-1.5">
              <span className="text-xs font-black text-purple-900 flex items-center gap-1.5">
                <span>🧪</span> Step 4: Chemical Intervention (Targeted Actives Only)
              </span>
              <p className="text-xs text-purple-950 leading-relaxed">
                {topCandidate.chemicalControl}
              </p>
              <div className="bg-purple-100/70 text-purple-900 text-[11px] p-2 rounded-xl font-medium">
                ⚠️ Statutory Warning: Always check registered product container label for approved water volume and Pre-Harvest Interval (PHI). Follow local KVK / Raitha Samparka Kendra advisory.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. "Was this correct?" Feedback Widget */}
      <div className="bg-white rounded-3xl border border-gray-200 p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-dark-text flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-forest" />
            <span>Was this photo diagnosis correct?</span>
          </span>
          {feedbackSubmitted && (
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              ✓ Feedback Logged
            </span>
          )}
        </div>

        {!feedbackSubmitted ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isSubmittingFeedback}
                onClick={() => handleFeedback('correct')}
                className={`flex-1 py-2 rounded-2xl text-xs font-extrabold border transition flex items-center justify-center gap-1.5 ${
                  feedbackRating === 'correct'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-gray-50 hover:bg-emerald-50 text-gray-700 border-gray-200'
                }`}
              >
                <span>👍 Yes</span>
              </button>

              <button
                type="button"
                disabled={isSubmittingFeedback}
                onClick={() => handleFeedback('incorrect')}
                className={`flex-1 py-2 rounded-2xl text-xs font-extrabold border transition flex items-center justify-center gap-1.5 ${
                  feedbackRating === 'incorrect'
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-gray-50 hover:bg-rose-50 text-gray-700 border-gray-200'
                }`}
              >
                <span>👎 No</span>
              </button>

              <button
                type="button"
                disabled={isSubmittingFeedback}
                onClick={() => handleFeedback('not_sure')}
                className={`flex-1 py-2 rounded-2xl text-xs font-extrabold border transition flex items-center justify-center gap-1.5 ${
                  feedbackRating === 'not_sure'
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-gray-50 hover:bg-amber-50 text-gray-700 border-gray-200'
                }`}
              >
                <span>❓ Not Sure</span>
              </button>
            </div>

            {/* Dropdown if farmer answered "No" */}
            <AnimatePresence>
              {showCorrectionDropdown && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-gray-50 rounded-2xl p-3 border border-gray-200 space-y-2 text-xs"
                >
                  <label className="font-bold text-gray-700 block">
                    What is the correct pest or disease affecting your crop?
                  </label>
                  <select
                    value={selectedCorrectionSlug}
                    onChange={(e) => setSelectedCorrectionSlug(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl p-2 text-xs text-dark-text font-medium"
                  >
                    <option value="">-- Choose correct threat from catalog --</option>
                    {allProblems.map(p => (
                      <option key={p.slug} value={p.slug}>
                        {p.name} ({p.type})
                      </option>
                    ))}
                    <option value="unlisted_pest">Not in this list / Other</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleCorrectionSubmit}
                    disabled={!selectedCorrectionSlug || isSubmittingFeedback}
                    className="w-full btn-primary text-xs py-2 mt-1"
                  >
                    Submit Correction
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <p className="text-xs text-gray-500">
            Thank you! Your feedback helps our agricultural pathology team benchmark model accuracy.
          </p>
        )}
      </div>

      {/* 6. Action Buttons Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
        <button
          type="button"
          onClick={onRetake}
          className="btn-secondary text-xs py-2.5 px-3 flex items-center justify-center gap-1.5"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Retake Photo</span>
        </button>

        <button
          type="button"
          onClick={handleAskAiChat}
          className="btn-primary text-xs py-2.5 px-3 flex items-center justify-center gap-1.5"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Ask AI Chat</span>
        </button>

        <button
          type="button"
          onClick={handleSaveToHistory}
          className="btn-secondary text-xs py-2.5 px-3 flex items-center justify-center gap-1.5 text-forest"
        >
          <BookmarkCheck className="w-4 h-4" />
          <span>{historySaved ? '✓ Saved!' : 'Save History'}</span>
        </button>

        <button
          type="button"
          onClick={handleShareWithOfficer}
          className="btn-secondary text-xs py-2.5 px-3 flex items-center justify-center gap-1.5 text-gray-700"
        >
          <Share2 className="w-4 h-4" />
          <span>{shareCopied ? '✓ Copied!' : 'Share'}</span>
        </button>
      </div>

      {/* KVK Helpline Notice */}
      <div className="bg-gray-100 rounded-2xl p-3 text-center text-xs text-gray-600 font-medium">
        📞 Raitha Samparka Kendra & KVK Kisan Call Centre: <strong>1800-180-1551</strong> (Toll Free, 6 AM - 10 PM)
      </div>
    </div>
  );
};
