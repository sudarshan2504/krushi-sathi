import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, ShieldAlert, AlertTriangle, ArrowRight, Camera, Upload, Check, Info } from 'lucide-react';
import { api } from '../services/api';
import { Disease } from '../types';
import { useTranslation } from '../context/LanguageContext';
import { Modal } from '../components/ui/Modal';

export const DiseasePreventionPage: React.FC = () => {
  const navigate = useNavigate();
  const { diseaseId } = useParams();
  const { t, language } = useTranslation();

  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [activeTab, setActiveTab] = useState<'common' | 'prevention' | 'checker'>('common');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDisease, setSelectedDisease] = useState<Disease | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Photo / Symptom checker state
  const [selectedCrop, setSelectedCrop] = useState('Paddy (Rice)');
  const [symptomText, setSymptomText] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [diagnosisResult, setDiagnosisResult] = useState<any>(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);

  useEffect(() => {
    api.diseases.getAll()
      .then((data) => {
        setDiseases(data);
        if (diseaseId) {
          const found = data.find((d: any) => d.id === diseaseId);
          if (found) setSelectedDisease(found);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [diseaseId]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDiagnose = async () => {
    setIsDiagnosing(true);
    try {
      const res = await api.diseases.diagnose({
        cropName: selectedCrop,
        symptomsDescription: symptomText,
        hasImage: !!previewImage,
      });
      setDiagnosisResult(res);
    } catch (err) {
      console.error('Diagnosis error:', err);
    } finally {
      setIsDiagnosing(false);
    }
  };

  const filteredDiseases = diseases.filter((d) => {
    const q = searchQuery.toLowerCase();
    return (
      d.name.toLowerCase().includes(q) ||
      d.nameKannada.includes(q) ||
      d.nameTamil.includes(q) ||
      d.nameTelugu.includes(q) ||
      d.symptoms.toLowerCase().includes(q) ||
      d.affectedCrops.some((c) => c.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-xl mx-auto space-y-4 py-2">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => navigate('/home')}
          className="p-2 rounded-full bg-white border border-gray-200 text-dark-text hover:bg-gray-50"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <h1 className="text-base font-extrabold text-dark-text">
          {t('pestAndDiseases')}
        </h1>

        <div className="w-8" />
      </div>

      {/* Tabs */}
      <div className="flex rounded-2xl bg-white p-1 border border-gray-100 shadow-sm text-xs font-bold">
        <button
          onClick={() => setActiveTab('common')}
          className={`flex-1 py-2.5 rounded-xl transition-all ${
            activeTab === 'common' ? 'bg-forest text-white shadow-sm' : 'text-dark-muted hover:text-dark-text'
          }`}
        >
          {t('commonProblems')}
        </button>
        <button
          onClick={() => setActiveTab('prevention')}
          className={`flex-1 py-2.5 rounded-xl transition-all ${
            activeTab === 'prevention' ? 'bg-forest text-white shadow-sm' : 'text-dark-muted hover:text-dark-text'
          }`}
        >
          {t('prevention')}
        </button>
        <button
          onClick={() => setActiveTab('checker')}
          className={`flex-1 py-2.5 rounded-xl transition-all ${
            activeTab === 'checker' ? 'bg-forest text-white shadow-sm' : 'text-dark-muted hover:text-dark-text'
          }`}
        >
          {t('diagnoseLeaf')}
        </button>
      </div>

      {/* TAB 1 & 2: Disease Catalog List */}
      {(activeTab === 'common' || activeTab === 'prevention') && (
        <div className="space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-forest" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pest by name or symptom..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-gray-200 text-xs font-semibold focus:border-forest outline-none shadow-sm"
            />
          </div>

          {/* Cards List (Matching Screen 9) */}
          <div className="space-y-3">
            {filteredDiseases.map((d) => (
              <motion.div
                key={d.id}
                whileHover={{ y: -2 }}
                className="p-4 rounded-3xl bg-white border border-gray-100 shadow-card hover:border-forest/30 transition-all"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-mint flex-shrink-0 border border-forest/15">
                    <img
                      src={d.imageUrl || 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=200&auto=format&fit=crop&q=80'}
                      alt={d.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <h3 className="text-sm font-extrabold text-dark-text truncate">
                        {d.name}
                      </h3>
                      <span className="py-0.5 px-2 rounded-full bg-red-100 text-red-700 text-[10px] font-bold uppercase">
                        {d.severity}
                      </span>
                    </div>

                    <span className="text-[11px] text-forest font-semibold block mb-2">
                      {language === 'kn' ? d.nameKannada :
                       language === 'ta' ? d.nameTamil :
                       language === 'te' ? d.nameTelugu : d.affectedCrops.join(', ')}
                    </span>

                    {/* Symptoms Bullet */}
                    <div className="text-xs text-dark-text/90 mb-1.5 leading-relaxed">
                      <span className="font-bold text-dark-muted">Symptoms: </span>
                      <span>{language === 'kn' ? (d.symptomsKn || d.symptoms) : d.symptoms}</span>
                    </div>

                    {/* Prevention Bullet */}
                    <div className="text-xs text-dark-text/90 mb-3 leading-relaxed">
                      <span className="font-bold text-forest">Prevention: </span>
                      <span>{language === 'kn' ? (d.preventionKn || d.prevention) : d.prevention}</span>
                    </div>

                    <button
                      onClick={() => setSelectedDisease(d)}
                      className="py-1.5 px-3.5 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest-dark transition-colors inline-flex items-center gap-1.5 shadow-sm"
                    >
                      <span>View Solution</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Symptom Checker & Field Photo Upload */}
      {activeTab === 'checker' && (
        <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-card space-y-4">
          <div>
            <h2 className="text-sm font-extrabold text-dark-text mb-1">
              {t('diagnoseLeaf')}
            </h2>
            <p className="text-xs text-dark-muted">
              Select your crop and describe visual symptoms or upload a photo of the affected plant:
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-dark-text mb-1">
              Affected Crop
            </label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-gray-200 text-xs font-semibold focus:border-forest outline-none"
            >
              <option value="Paddy (Rice)">Paddy (Rice)</option>
              <option value="Maize (Corn)">Maize (Corn)</option>
              <option value="Cotton">Cotton</option>
              <option value="Tomato">Tomato</option>
              <option value="Groundnut">Groundnut</option>
              <option value="Ragi">Ragi (Finger Millet)</option>
            </select>
          </div>

          {/* Photo Upload Zone */}
          <div>
            <label className="block text-xs font-bold text-dark-text mb-1">
              {t('uploadPhoto')} (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-200 rounded-3xl p-4 text-center hover:border-forest/40 transition-colors bg-cream-light/40">
              {previewImage ? (
                <div className="space-y-2">
                  <div className="w-32 h-32 rounded-2xl overflow-hidden mx-auto border-2 border-forest shadow-md">
                    <img src={previewImage} alt="Crop sample" className="w-full h-full object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreviewImage(null)}
                    className="text-xs text-red-600 font-bold hover:underline"
                  >
                    Remove Photo
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center justify-center gap-1.5 py-3">
                  <Camera className="w-8 h-8 text-forest" />
                  <span className="text-xs font-bold text-forest">Tap to upload leaf photo</span>
                  <span className="text-[10px] text-dark-muted">Supports JPG, PNG up to 5MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <span className="text-[10px] text-dark-muted mt-1 block italic">
              {t('photoNotice')}
            </span>
          </div>

          {/* Symptom Description Text */}
          <div>
            <label className="block text-xs font-bold text-dark-text mb-1">
              Describe Symptoms (Leaves, stem, colors)
            </label>
            <textarea
              rows={3}
              value={symptomText}
              onChange={(e) => setSymptomText(e.target.value)}
              placeholder="e.g. Yellowing of bottom leaves, holes in stem, brown spots with ash center..."
              className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-gray-200 text-xs font-medium focus:border-forest outline-none resize-none"
            />
          </div>

          <button
            onClick={handleDiagnose}
            disabled={isDiagnosing}
            className="w-full py-3 px-4 rounded-2xl bg-forest text-white text-xs font-bold shadow-md hover:bg-forest-dark transition-colors flex items-center justify-center gap-2"
          >
            {isDiagnosing ? 'Analyzing Symptoms...' : 'Analyze Symptoms & Match Disease'}
          </button>

          {/* Diagnosis Results */}
          {diagnosisResult && (
            <div className="pt-3 border-t border-gray-100 space-y-3">
              <div className="p-3 rounded-2xl bg-mint border border-forest/20 text-xs text-dark-text">
                <span className="font-bold text-forest block mb-1">
                  {diagnosisResult.mode === 'image_unavailable' ? 'Offline Guidance Mode' : 'Symptom Match Analysis'}
                </span>
                <p className="text-[11px] leading-relaxed">
                  {diagnosisResult.message || diagnosisResult.note}
                </p>
              </div>

              {(diagnosisResult.matches || diagnosisResult.candidates)?.map((item: Disease) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedDisease(item)}
                  className="p-3 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-between cursor-pointer hover:border-forest"
                >
                  <div>
                    <span className="text-xs font-bold text-dark-text block">{item.name}</span>
                    <span className="text-[10px] text-forest">{item.affectedCrops.join(', ')}</span>
                  </div>
                  <span className="text-xs font-bold text-forest">View Solution →</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Disease Detail Solution Modal */}
      <Modal
        isOpen={!!selectedDisease}
        onClose={() => setSelectedDisease(null)}
        title={selectedDisease?.name}
      >
        {selectedDisease && (
          <div className="space-y-4 text-xs">
            {/* Visual thumbnail */}
            <div className="h-40 rounded-2xl overflow-hidden bg-mint border border-forest/10">
              <img
                src={selectedDisease.imageUrl || 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=600&auto=format&fit=crop&q=80'}
                alt={selectedDisease.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <span className="text-[11px] font-bold text-forest block">
                {language === 'kn' ? selectedDisease.nameKannada :
                 language === 'ta' ? selectedDisease.nameTamil :
                 language === 'te' ? selectedDisease.nameTelugu : selectedDisease.name}
              </span>
              <span className="text-[10px] text-dark-muted">
                Affects: {selectedDisease.affectedCrops.join(', ')}
              </span>
            </div>

            {/* Symptoms */}
            <div className="p-3 rounded-2xl bg-red-50 border border-red-200">
              <span className="font-extrabold text-red-900 block mb-0.5">
                {t('symptoms')}:
              </span>
              <p className="text-red-800 leading-relaxed text-[11px]">
                {language === 'kn' ? (selectedDisease.symptomsKn || selectedDisease.symptoms) :
                 language === 'ta' ? (selectedDisease.symptomsTa || selectedDisease.symptoms) :
                 language === 'te' ? (selectedDisease.symptomsTe || selectedDisease.symptoms) :
                 selectedDisease.symptoms}
              </p>
            </div>

            {/* Integrated Pest Management (IPM) Steps */}
            <div>
              <span className="font-extrabold text-dark-text block mb-1.5 uppercase tracking-wide">
                {t('ipmSolutions')}:
              </span>
              <div className="space-y-1.5 pl-1">
                {(language === 'kn' && selectedDisease.ipmStepsKn
                  ? selectedDisease.ipmStepsKn
                  : language === 'ta' && selectedDisease.ipmStepsTa
                  ? selectedDisease.ipmStepsTa
                  : language === 'te' && selectedDisease.ipmStepsTe
                  ? selectedDisease.ipmStepsTe
                  : selectedDisease.ipmSteps
                ).map((step: string, sIdx: number) => (
                  <div key={sIdx} className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-forest text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {sIdx + 1}
                    </span>
                    <span className="text-[11px] text-dark-text leading-snug">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Expert Advisory Note */}
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200">
              <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-0.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                <span>{t('expertAdvisory')}</span>
              </div>
              <p className="text-[11px] text-amber-900/90 leading-relaxed">
                {selectedDisease.expertAdvice}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
