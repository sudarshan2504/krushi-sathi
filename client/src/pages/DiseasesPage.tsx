import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  Camera,
  Upload,
  X,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  FileDown,
  Share2,
  PhoneCall,
  RotateCcw,
  ShieldCheck,
  Leaf,
  Layers,
  ChevronDown,
  ChevronUp,
  Trash2,
  Clock,
  Info,
  Bug,
  HelpCircle,
} from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { LanguagePill } from '../components/ui/LanguagePill';
import { LeafCorners } from '../components/ui/LeafCorners';
import { GlassCard } from '../components/ui/GlassCard';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { IconTile } from '../components/ui/IconTile';
import { api } from '../services/api';
import { CropHealthReport, FindingItem } from '../types';

export const DiseasesPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const { showToast } = useToast();

  // Navigation tab: 'diagnose' or 'reports'
  const [activeTab, setActiveTab] = useState<'diagnose' | 'reports'>('diagnose');

  // Diagnosis input state
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [cropsCatalog, setCropsCatalog] = useState<any[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<string>('unsure');
  const [userNote, setUserNote] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Active Report View (null = form view)
  const [activeReport, setActiveReport] = useState<CropHealthReport | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);
  const [expandedFindingIndex, setExpandedFindingIndex] = useState<number>(0);
  const [showRetakeAdvice, setShowRetakeAdvice] = useState<boolean>(false);

  // Past reports list
  const [pastReports, setPastReports] = useState<any[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState<boolean>(false);
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(!navigator.onLine);
  const [reportToDelete, setReportToDelete] = useState<string | null>(null);

  // File input refs
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOfflineMode(false);
    const handleOffline = () => setIsOfflineMode(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch crops catalog & past reports on mount
  useEffect(() => {
    async function loadInitialData() {
      try {
        const crops = await api.diseases.getCropsCatalog().catch(() => []);
        if (Array.isArray(crops)) {
          setCropsCatalog(crops);
        }
      } catch (err) {
        console.warn('Failed to load crop catalog:', err);
      }
    }
    loadInitialData();
  }, []);

  // Fetch past reports when switching to reports tab
  useEffect(() => {
    if (activeTab === 'reports') {
      loadPastReports();
    }
  }, [activeTab]);

  async function loadPastReports() {
    setIsLoadingReports(true);
    try {
      const reports = await api.diseases.getReports();
      if (Array.isArray(reports)) {
        setPastReports(reports);
        // Persist last 5 reports for offline access
        try {
          localStorage.setItem('ks_offline_disease_reports', JSON.stringify(reports.slice(0, 5)));
        } catch {}
      }
    } catch (err) {
      console.warn('Network error loading reports, attempting offline cache:', err);
      const cached = localStorage.getItem('ks_offline_disease_reports');
      if (cached) {
        try {
          setPastReports(JSON.parse(cached));
          setIsOfflineMode(true);
        } catch {}
      }
    } finally {
      setIsLoadingReports(false);
    }
  }

  // Handle Photo Selection
  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setAnalysisError(null);
    const newFiles = Array.from(files);

    // Limit to max 3 photos total
    const combined = [...selectedPhotos, ...newFiles].slice(0, 3);
    setSelectedPhotos(combined);

    // Generate previews
    const newPreviews = combined.map(file => URL.createObjectURL(file));
    setPreviewUrls(newPreviews);
  };

  const removePhoto = (indexToRemove: number) => {
    const updatedPhotos = selectedPhotos.filter((_, i) => i !== indexToRemove);
    setSelectedPhotos(updatedPhotos);

    // Revoke old object URL
    URL.revokeObjectURL(previewUrls[indexToRemove]);
    const updatedPreviews = previewUrls.filter((_, i) => i !== indexToRemove);
    setPreviewUrls(updatedPreviews);
  };

  // Submit Photo Diagnosis
  const handleDiagnose = async () => {
    if (selectedPhotos.length === 0) {
      setAnalysisError('Please take or upload at least 1 plant photo.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    const formData = new FormData();
    selectedPhotos.forEach(file => {
      formData.append('images', file);
    });

    if (selectedCrop && selectedCrop !== 'unsure') {
      formData.append('cropId', selectedCrop);
    } else {
      formData.append('cropId', 'unsure');
    }

    if (userNote.trim()) {
      formData.append('userNote', userNote.trim());
    }

    formData.append('language', language);

    try {
      const report = await api.diseases.diagnoseImage(formData);
      setActiveReport(report);
      showToast(t('savedToMyReports') || 'Report saved successfully!', 'success');

      // Update offline cache with latest report
      try {
        const existingOffline = JSON.parse(localStorage.getItem('ks_offline_disease_reports') || '[]');
        const updatedOffline = [report, ...existingOffline.filter((r: any) => r.id !== report.id)].slice(0, 5);
        localStorage.setItem('ks_offline_disease_reports', JSON.stringify(updatedOffline));
      } catch {}
    } catch (err: any) {
      console.error('Diagnosis failed:', err);
      setAnalysisError(
        err.message || 'Diagnosis service is temporarily unavailable. Photos have been kept safe; please retry.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Download PDF
  const handleDownloadPdf = async () => {
    if (!activeReport?.id) return;
    setIsDownloadingPdf(true);
    try {
      const blob = await api.diseases.downloadReportPdf(activeReport.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `krushi-sathi-report-${activeReport.crop.name.toLowerCase()}-${activeReport.id.slice(0, 6)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      showToast('PDF downloaded successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to download PDF.', 'error');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Share via WhatsApp
  const handleShareWhatsApp = () => {
    if (!activeReport) return;
    const cropName = activeReport.crop.name;
    const top = activeReport.topFindings?.[0];
    const diseaseName = top?.name || 'Observation';
    const text = `🌾 *Krushi Sathi Crop Health Report*\n*Crop:* ${cropName}\n*Diagnosis:* ${diseaseName} (${top?.confidence || 0}% confidence)\n*Status:* ${activeReport.status.toUpperCase()}\n*Immediate Action:* ${activeReport.treatment?.immediateSteps?.[0] || 'Consult extension officer'}\n*Helpline:* 1800-180-1551 (Kisan Call Centre)`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Delete a report
  const handleDeleteReport = async (id: string) => {
    try {
      await api.diseases.deleteReport(id);
      setPastReports(prev => prev.filter(r => r.id !== id));
      if (activeReport?.id === id) {
        setActiveReport(null);
      }
      setReportToDelete(null);
      showToast('Report deleted.', 'info');
    } catch (err: any) {
      showToast('Failed to delete report.', 'error');
    }
  };

  // Color helper for diagnosis status
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'healthy':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-950/60',
          text: 'text-emerald-700 dark:text-emerald-300',
          border: 'border-emerald-300 dark:border-emerald-800',
          dot: 'bg-emerald-500',
        };
      case 'disease':
      case 'pest':
        return {
          bg: 'bg-rose-50 dark:bg-rose-950/60',
          text: 'text-rose-700 dark:text-rose-300',
          border: 'border-rose-300 dark:border-rose-800',
          dot: 'bg-rose-500',
        };
      case 'nutrient_deficiency':
      case 'environmental_stress':
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/60',
          text: 'text-amber-700 dark:text-amber-300',
          border: 'border-amber-300 dark:border-amber-800',
          dot: 'bg-amber-500',
        };
      default:
        return {
          bg: 'bg-zinc-50 dark:bg-zinc-800',
          text: 'text-zinc-700 dark:text-zinc-300',
          border: 'border-zinc-300 dark:border-zinc-700',
          dot: 'bg-zinc-500',
        };
    }
  };

  return (
    <div className="min-h-screen min-h-dvh w-full bg-[#FAF8F2] dark:bg-[#1E2320] flex justify-center pb-32 safe-bottom selection:bg-emerald-100 selection:text-forest-dark overflow-x-hidden relative">
      <LeafCorners showLeft={true} showRight={true} />

      {/* Hidden file inputs for Camera and Gallery */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        className="hidden"
        onChange={e => handleFilesSelected(e.target.files)}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={e => handleFilesSelected(e.target.files)}
      />

      <div className="w-full max-w-[540px] flex flex-col px-4 pt-3 space-y-4 z-10">
        {/* Top Header */}
        <header className="flex items-center justify-between py-1.5">
          <button
            type="button"
            onClick={() => {
              if (activeReport) {
                setActiveReport(null);
              } else {
                navigate(-1);
              }
            }}
            aria-label="Go back"
            className="w-11 h-11 rounded-full bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200/70 dark:border-zinc-700 flex items-center justify-center shadow-xs hover:bg-zinc-50 active:scale-95 transition cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-center px-2">
            <h1 className="text-base sm:text-lg font-extrabold text-[#0D2B18] dark:text-cream tracking-tight">
              {t('photoDiagnosisTitle')}
            </h1>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">
              ICAR Grounded • AI Crop Health
            </p>
          </div>

          <LanguagePill variant="compact" />
        </header>

        {/* Offline indicator if active */}
        {isOfflineMode && (
          <div className="p-2.5 rounded-2xl bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-800 flex items-center gap-2 text-xs font-semibold text-amber-900 dark:text-amber-200">
            <Info className="w-4 h-4 shrink-0 text-amber-700 dark:text-amber-400" />
            <span>{t('offlineNotice')}</span>
          </div>
        )}

        {/* Tab Switcher (Visible when not actively viewing a full report) */}
        {!activeReport && (
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-zinc-200/70 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
            <button
              type="button"
              onClick={() => setActiveTab('diagnose')}
              className={`min-h-[44px] flex items-center justify-center gap-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'diagnose'
                  ? 'bg-white dark:bg-zinc-900 text-[#144D29] dark:text-emerald-400 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>{t('tabDiagnoseNow')}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('reports')}
              className={`min-h-[44px] flex items-center justify-center gap-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'reports'
                  ? 'bg-white dark:bg-zinc-900 text-[#144D29] dark:text-emerald-400 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{t('tabMyReports')}</span>
              {pastReports.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-black">
                  {pastReports.length}
                </span>
              )}
            </button>
          </div>
        )}

        {/* ==================================================================== */}
        {/* VIEW 1: ACTIVE REPORT PRESENTATION VIEW                               */}
        {/* ==================================================================== */}
        {activeReport ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Report Header Card */}
            {(() => {
              const styles = getStatusStyles(activeReport.status);
              const top = activeReport.topFindings?.[0];
              const localizedFindingName =
                top?.localNames?.[language as keyof typeof top.localNames] || top?.name || 'Problem Detected';

              return (
                <GlassCard variant="solid" className="p-4 sm:p-5 relative overflow-hidden">
                  {activeReport.isSample && (
                    <div className="inline-block px-2 py-0.5 mb-2 rounded-md bg-amber-400 text-zinc-900 text-[10px] font-black uppercase tracking-wider">
                      {t('sampleReportBadge')}
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                        {activeReport.crop.name} {activeReport.crop.scientificName && `(${activeReport.crop.scientificName})`}
                      </span>
                      <h2 className="text-xl font-extrabold text-zinc-900 dark:text-cream leading-tight mt-0.5">
                        {localizedFindingName}
                      </h2>
                    </div>

                    <div className={`px-3 py-1.5 rounded-2xl border ${styles.bg} ${styles.border} flex items-center gap-1.5 shrink-0`}>
                      <span className={`w-2 h-2 rounded-full ${styles.dot}`} />
                      <span className={`text-xs font-bold uppercase ${styles.text}`}>
                        {activeReport.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Badges: Source verification and Confidence */}
                  <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {activeReport.verifiedSource === 'verified entry'
                        ? t('verifiedEntryBadge')
                        : t('aiGeneratedBadge')}
                    </span>

                    <span className="px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold">
                      Confidence: {top?.confidence ?? activeReport.crop.confidence}%
                    </span>

                    <span className="text-zinc-400 dark:text-zinc-500 text-[11px]">
                      {new Date(activeReport.generatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </GlassCard>
              );
            })()}

            {/* Retake Advice Card (If quality fair/poor or confidence low) */}
            {(activeReport.imageQuality !== 'good' || activeReport.retakeTip) && (
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-xs">
                <div
                  onClick={() => setShowRetakeAdvice(!showRetakeAdvice)}
                  className="flex items-center justify-between cursor-pointer font-bold text-amber-900 dark:text-amber-200"
                >
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>{t('retakeHelperAdvice')}</span>
                  </div>
                  {showRetakeAdvice ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>

                {showRetakeAdvice && (
                  <p className="mt-2 text-amber-800 dark:text-amber-300 leading-relaxed">
                    {activeReport.retakeTip || t('retakeTip1')}
                  </p>
                )}
              </div>
            )}

            {/* Findings Section */}
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase text-zinc-500 tracking-wider">
                {t('resultsTitle')}
              </h3>

              {activeReport.topFindings?.map((finding, idx) => {
                const isExpanded = expandedFindingIndex === idx;
                const localName =
                  finding.localNames?.[language as keyof typeof finding.localNames] || finding.name;

                return (
                  <GlassCard key={idx} variant="solid" className="p-3.5 sm:p-4">
                    <div
                      onClick={() => setExpandedFindingIndex(isExpanded ? -1 : idx)}
                      className="flex items-center justify-between cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-2">
                        <IconTile variant={idx === 0 ? 'forest' : 'mint'} size="sm">
                          {idx + 1}
                        </IconTile>
                        <div>
                          <div className="text-sm font-extrabold text-zinc-900 dark:text-cream">
                            {localName}
                          </div>
                          <div className="text-[11px] text-zinc-500 font-semibold">
                            Severity: <span className="font-bold text-zinc-700 dark:text-zinc-300 uppercase">{finding.severity}</span> • Risk: <span className="font-bold">{finding.spreadRisk}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-emerald-700 dark:text-emerald-400">
                          {finding.confidence}%
                        </span>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                      </div>
                    </div>

                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2 text-xs"
                      >
                        {finding.observedSymptoms?.length > 0 && (
                          <div>
                            <span className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                              {t('observedSymptomsInPhoto')}:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {finding.observedSymptoms.map((symp, sIdx) => (
                                <span
                                  key={sIdx}
                                  className="px-2 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px] font-medium"
                                >
                                  {symp}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {finding.likelyCauses?.length > 0 && (
                          <div className="text-zinc-600 dark:text-zinc-400">
                            <span className="font-bold text-zinc-700 dark:text-zinc-300">
                              {t('likelyCauses')}:{' '}
                            </span>
                            {finding.likelyCauses.join(', ')}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </GlassCard>
                );
              })}
            </div>

            {/* Treatment Section */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase text-zinc-500 tracking-wider">
                {t('treatmentLadder')}
              </h3>

              {/* 1. Immediate Actions */}
              <GlassCard variant="solid" className="p-4 border-l-4 border-l-emerald-600">
                <h4 className="text-sm font-extrabold text-[#144D29] dark:text-emerald-400 mb-2">
                  {t('immediateActions')}
                </h4>
                <ol className="list-decimal list-inside space-y-1.5 text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                  {activeReport.treatment?.immediateSteps?.map((step, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {step}
                    </li>
                  ))}
                </ol>
              </GlassCard>

              {/* 2. Cultural & Organic Solutions */}
              <GlassCard variant="solid" className="p-4 border-l-4 border-l-lime-600">
                <h4 className="text-sm font-extrabold text-lime-800 dark:text-lime-400 mb-2">
                  {t('culturalOrganicTitle')}
                </h4>
                <ul className="list-disc list-inside space-y-1.5 text-xs text-zinc-700 dark:text-zinc-300">
                  {activeReport.treatment?.culturalAndOrganic?.map((item, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              </GlassCard>

              {/* 3. Chemical Treatments (if present) */}
              {activeReport.treatment?.chemical && activeReport.treatment.chemical.length > 0 && (
                <GlassCard variant="solid" className="p-4 border-l-4 border-l-rose-600 space-y-2">
                  <h4 className="text-sm font-extrabold text-rose-800 dark:text-rose-400">
                    {t('chemicalOptionsTitle')}
                  </h4>
                  <div className="space-y-2">
                    {activeReport.treatment.chemical.map((chem, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs"
                      >
                        <div className="font-extrabold text-zinc-900 dark:text-cream">
                          {chem.activeIngredient}
                        </div>
                        <div className="text-[11px] text-zinc-500 font-semibold">
                          Class: {chem.class} • Target: {chem.purpose}
                        </div>
                        <div className="mt-1 text-[11px] text-zinc-600 dark:text-zinc-300">
                          {chem.applicationNotes}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-[10px] text-rose-700 dark:text-rose-300 font-bold bg-rose-50 dark:bg-rose-950/50 p-2 rounded-lg">
                    ⚠️ {t('chemicalLabelWarning')}
                  </div>
                </GlassCard>
              )}

              {/* 4. Highlighted Safety Box */}
              <div className="p-4 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-400/80 dark:border-amber-700/80 shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-extrabold text-xs uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>{t('mandatorySafetyNotice')}</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-xs text-amber-900 dark:text-amber-300">
                  {activeReport.treatment?.safetyPrecautions?.map((p, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {p}
                    </li>
                  ))}
                </ul>
              </div>

              {/* 5. Prevention & Field Monitoring */}
              <GlassCard variant="solid" className="p-4 space-y-1.5 text-xs text-zinc-700 dark:text-zinc-300">
                <h4 className="text-sm font-extrabold text-[#144D29] dark:text-emerald-400">
                  {t('preventionAndMonitoring')}
                </h4>
                <div className="font-bold text-emerald-800 dark:text-emerald-300">
                  {t('recheckInDaysText').replace('{days}', String(activeReport.treatment?.recheckInDays || 5))}
                </div>
                <ul className="list-disc list-inside space-y-1">
                  {activeReport.treatment?.preventionTips?.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </GlassCard>

              {/* 6. When to See an Expert Card */}
              <GlassCard variant="solid" className="p-4 space-y-3 bg-gradient-to-b from-white to-emerald-50/50 dark:from-zinc-900 dark:to-emerald-950/20">
                <div className="flex items-center gap-2 text-[#144D29] dark:text-emerald-400 font-extrabold text-sm">
                  <PhoneCall className="w-4 h-4 shrink-0" />
                  <span>{t('whenToSeeExpertTitle')}</span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-300">
                  {activeReport.treatment?.whenToSeeExpert || t('findNearestKvk')}
                </p>

                <a
                  href={`tel:${activeReport.helpline || '18001801551'}`}
                  className="w-full min-h-[46px] rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-98 transition"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>{t('callKisanHelpline')}</span>
                </a>
              </GlassCard>
            </div>

            {/* Actions Bar */}
            <div className="pt-2 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isDownloadingPdf}
                  className="min-h-[48px] rounded-2xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition active:scale-95 disabled:opacity-50"
                >
                  <FileDown className="w-4 h-4" />
                  <span>{isDownloadingPdf ? 'Generating...' : t('downloadPdf')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="min-h-[48px] rounded-2xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition active:scale-95"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{t('shareWhatsApp')}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveReport(null);
                  setSelectedPhotos([]);
                  setPreviewUrls([]);
                }}
                className="w-full min-h-[44px] rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-bold text-xs text-zinc-700 dark:text-zinc-200 flex items-center justify-center gap-2 hover:bg-zinc-50 active:scale-95 transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{t('diagnoseAnother')}</span>
              </button>
            </div>
          </motion.div>
        ) : activeTab === 'diagnose' ? (
          /* ==================================================================== */
          /* VIEW 2: PHOTO UPLOAD & DIAGNOSTIC FORM                               */
          /* ==================================================================== */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {/* Hero / Instruction Banner */}
            <div className="rounded-3xl bg-gradient-to-b from-[#144D29] to-[#0D351B] text-white p-4 sm:p-5 shadow-card relative overflow-hidden">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 text-emerald-200 text-[11px] font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-lime-400" />
                <span>Computer Vision & ICAR Protocols</span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
                {t('photoDiagnosisTitle')}
              </h2>
              <p className="text-xs text-emerald-100/90 mt-1 leading-relaxed">
                {t('photoDiagnosisSubtitle')}
              </p>
            </div>

            {/* Error Message Box */}
            {analysisError && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-200">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                <span>{analysisError}</span>
              </div>
            )}

            {/* Big Drop / Tap Photo Uploader Area */}
            <div
              className={`rounded-3xl border-2 border-dashed p-4 sm:p-5 text-center transition-all ${
                selectedPhotos.length > 0
                  ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20'
                  : 'border-zinc-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-900/70 hover:border-emerald-400'
              }`}
            >
              {/* Photo Preview Grid (if any selected) */}
              {previewUrls.length > 0 ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2.5">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border border-zinc-200 shadow-xs group">
                        <img
                          src={url}
                          alt={`Uploaded preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          aria-label={`${t('removePhoto')} ${index + 1}`}
                          className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-rose-600 transition cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    {t('photoCountTip').replace('{count}', String(selectedPhotos.length))}
                  </div>
                </div>
              ) : (
                <div className="py-4 space-y-2">
                  <div className="w-14 h-14 mx-auto rounded-3xl bg-emerald-100 dark:bg-emerald-950/70 text-[#144D29] dark:text-emerald-400 flex items-center justify-center shadow-xs">
                    <Camera className="w-7 h-7" />
                  </div>
                  <div className="font-extrabold text-sm text-zinc-900 dark:text-cream">
                    {t('photoUploadArea')}
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    {t('photoUploadSub')}
                  </div>
                </div>
              )}

              {/* Upload Action Buttons (Camera & Gallery) */}
              {selectedPhotos.length < 3 && (
                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-zinc-200/80 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    aria-label={t('takePhotoCamera')}
                    className="min-h-[46px] rounded-2xl bg-[#144D29] hover:bg-[#0D351B] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition"
                  >
                    <Camera className="w-4 h-4" />
                    <span>{t('takePhotoCamera')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    aria-label={t('uploadFromGallery')}
                    className="min-h-[46px] rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs hover:bg-zinc-50 active:scale-95 transition cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{t('uploadFromGallery')}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Retake & Photography Tips Expandable Card */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-xs shadow-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-[#144D29] dark:text-emerald-400">
                <HelpCircle className="w-4 h-4" />
                <span>{t('retakeTipsTitle')}</span>
              </div>
              <ul className="space-y-1 text-zinc-600 dark:text-zinc-400 list-disc list-inside text-[11px] leading-relaxed">
                <li>{t('retakeTip1')}</li>
                <li>{t('retakeTip2')}</li>
                <li>{t('retakeTip3')}</li>
              </ul>
            </div>

            {/* Form Fields: Crop Selector & User Note */}
            <GlassCard variant="solid" className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  {t('crops')}
                </label>
                <select
                  value={selectedCrop}
                  onChange={e => setSelectedCrop(e.target.value)}
                  className="w-full min-h-[46px] px-3 py-2 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="unsure">{t('cropUnsureOption')}</option>
                  {cropsCatalog.map(c => (
                    <option key={c.id} value={c.name}>
                      {language === 'kn' ? c.nameKannada || c.name : c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  {t('optionalDetails')}
                </label>
                <textarea
                  value={userNote}
                  onChange={e => setUserNote(e.target.value)}
                  placeholder={t('userNotePlaceholder')}
                  rows={2}
                  className="w-full p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>
            </GlassCard>

            {/* Primary Action Button */}
            <div aria-live="polite">
              <PrimaryButton
                fullWidth
                size="lg"
                loading={isAnalyzing}
                disabled={selectedPhotos.length === 0 || isAnalyzing}
                onClick={handleDiagnose}
                icon={<Sparkles className="w-5 h-5 text-lime-300" />}
                className="w-full"
              >
                {isAnalyzing ? t('analyzingPlant') : t('btnDiagnoseNow')}
              </PrimaryButton>
            </div>
          </motion.div>
        ) : (
          /* ==================================================================== */
          /* VIEW 3: PAST REPORTS TAB / DRAWER                                    */
          /* ==================================================================== */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase text-zinc-500 tracking-wider">
                {t('myPastReportsTitle')}
              </h2>
              <span className="text-xs text-zinc-400 font-semibold">
                {pastReports.length} {pastReports.length === 1 ? 'report' : 'reports'}
              </span>
            </div>

            {isLoadingReports ? (
              <div className="py-12 text-center text-xs text-zinc-500">
                Loading saved reports...
              </div>
            ) : pastReports.length === 0 ? (
              <GlassCard variant="solid" className="p-8 text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-[#144D29] dark:text-emerald-400 flex items-center justify-center">
                  <Leaf className="w-6 h-6" />
                </div>
                <div className="text-sm font-extrabold text-zinc-800 dark:text-cream">
                  {t('noReportsYet')}
                </div>
                <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                  {t('noReportsSub')}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('diagnose')}
                  className="px-4 py-2 rounded-full bg-[#144D29] text-white text-xs font-bold shadow-xs hover:bg-[#0D351B] transition cursor-pointer"
                >
                  {t('tabDiagnoseNow')}
                </button>
              </GlassCard>
            ) : (
              <div className="space-y-2">
                {pastReports.map(report => {
                  const styles = getStatusStyles(report.status);
                  const top = report.topFindings?.[0];
                  const localName =
                    top?.localNames?.[language as keyof typeof top.localNames] ||
                    top?.name ||
                    'Health Report';

                  return (
                    <GlassCard
                      key={report.id}
                      variant="solid"
                      className="p-3.5 hover:shadow-md transition cursor-pointer"
                      onClick={async () => {
                        // Open full report
                        try {
                          const full = await api.diseases.getReportById(report.id);
                          setActiveReport(full);
                        } catch {
                          // Fallback to item
                          setActiveReport(report);
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        {report.thumbnailPath ? (
                          <img
                            src={report.thumbnailPath}
                            alt="Crop thumbnail"
                            className="w-14 h-14 rounded-2xl object-cover shrink-0 border border-zinc-200 dark:border-zinc-700"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                            <Leaf className="w-6 h-6" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <span className="text-[10px] font-bold uppercase text-zinc-400 truncate">
                              {report.crop?.name || 'Crop'}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${styles.bg} ${styles.border} ${styles.text}`}>
                              {report.status}
                            </span>
                          </div>

                          <div className="text-xs font-extrabold text-zinc-900 dark:text-cream truncate">
                            {localName}
                          </div>

                          <div className="text-[10px] text-zinc-400 font-semibold mt-0.5">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setReportToDelete(report.id);
                          }}
                          aria-label={t('deleteReport')}
                          className="w-8 h-8 rounded-full text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 flex items-center justify-center transition cursor-pointer shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {reportToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-xs rounded-3xl bg-white dark:bg-zinc-900 p-5 space-y-3 shadow-xl">
            <h3 className="text-sm font-extrabold text-zinc-900 dark:text-cream">
              {t('deleteReport')}
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-300">
              {t('deleteConfirm')}
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReportToDelete(null)}
                className="min-h-[44px] rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteReport(reportToDelete)}
                className="min-h-[44px] rounded-2xl bg-rose-600 text-xs font-bold text-white shadow-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiseasesPage;
