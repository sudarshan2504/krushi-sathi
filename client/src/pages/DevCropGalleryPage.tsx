import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  RefreshCw,
  Upload,
  Sprout,
  ExternalLink,
  Search,
  ArrowLeft,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  Camera,
  AlertCircle
} from 'lucide-react';
import { CropImage } from '../components/ui/CropImage';

interface CropRecord {
  cropId: string;
  name: string;
  scientificName: string;
  nameKannada: string;
  nameTamil: string;
  nameTelugu: string;
  category: string;
  filePath: string;
  source: string;
  sourceUrl: string;
  photographer: string;
  license: string;
  status: 'pending-review' | 'approved' | 'use-fallback';
  updatedAt: string;
}

export const DevCropGalleryPage: React.FC = () => {
  const navigate = useNavigate();

  // If in production, navigate away immediately
  useEffect(() => {
    if (!import.meta.env.DEV) {
      navigate('/home');
    }
  }, [navigate]);

  const [crops, setCrops] = useState<CropRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'fallback'>('all');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Hidden file input for uploading custom image
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedCropForUpload, setSelectedCropForUpload] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadCrops = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dev/crops');
      if (res.ok) {
        const json = await res.json();
        setCrops(json.data || []);
      } else {
        // Fallback to static client copy if API is warming up
        const staticRes = await fetch('/crops/crops-images.json');
        if (staticRes.ok) {
          const list = await staticRes.json();
          setCrops(list);
        }
      }
    } catch (err: any) {
      console.error('Failed to load crop image records:', err);
      // Attempt fallback to static file
      try {
        const staticRes = await fetch('/crops/crops-images.json');
        if (staticRes.ok) {
          const list = await staticRes.json();
          setCrops(list);
        }
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCrops();
  }, []);

  // Filter crops
  const filteredCrops = useMemo(() => {
    return crops.filter(c => {
      // Status filter
      if (statusFilter === 'pending' && c.status !== 'pending-review') return false;
      if (statusFilter === 'approved' && c.status !== 'approved') return false;
      if (statusFilter === 'fallback' && c.status !== 'use-fallback') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesSci = (c.scientificName || '').toLowerCase().includes(q);
        const matchesId = c.cropId.toLowerCase().includes(q);
        const matchesKn = (c.nameKannada || '').toLowerCase().includes(q);
        const matchesTa = (c.nameTamil || '').toLowerCase().includes(q);
        const matchesTe = (c.nameTelugu || '').toLowerCase().includes(q);
        return matchesName || matchesSci || matchesId || matchesKn || matchesTa || matchesTe;
      }

      return true;
    });
  }, [crops, statusFilter, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: crops.length,
      approved: crops.filter(c => c.status === 'approved').length,
      pending: crops.filter(c => c.status === 'pending-review').length,
      fallback: crops.filter(c => c.status === 'use-fallback').length,
    };
  }, [crops]);

  // Handle Approve
  const handleApprove = async (cropId: string) => {
    try {
      setActionInProgress(cropId);
      const res = await fetch(`/api/dev/crops/${cropId}/approve`, { method: 'POST' });
      if (res.ok) {
        setCrops(prev =>
          prev.map(c => (c.cropId === cropId ? { ...c, status: 'approved', updatedAt: new Date().toISOString() } : c))
        );
        showToast(`Approved photo for ${cropId}`);
      }
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    } finally {
      setActionInProgress(null);
    }
  };

  // Handle Batch Approve All Visible
  const handleApproveAllPending = async () => {
    const pendingList = filteredCrops.filter(c => c.status === 'pending-review');
    if (pendingList.length === 0) return;

    if (!window.confirm(`Approve all ${pendingList.length} pending crops?`)) return;

    setActionInProgress('batch-approve');
    for (const crop of pendingList) {
      try {
        await fetch(`/api/dev/crops/${crop.cropId}/approve`, { method: 'POST' });
      } catch {}
    }
    await loadCrops();
    setActionInProgress(null);
    showToast(`Approved ${pendingList.length} crops!`);
  };

  // Handle Use Fallback
  const handleUseFallback = async (cropId: string) => {
    try {
      setActionInProgress(cropId);
      const res = await fetch(`/api/dev/crops/${cropId}/fallback`, { method: 'POST' });
      if (res.ok) {
        setCrops(prev =>
          prev.map(c =>
            c.cropId === cropId
              ? {
                  ...c,
                  status: 'use-fallback',
                  source: 'Fallback Illustration',
                  photographer: 'Krushi Sathi Botanical System',
                  license: 'CC0',
                  updatedAt: new Date().toISOString(),
                }
              : c
          )
        );
        showToast(`Set fallback illustration for ${cropId}`);
      }
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    } finally {
      setActionInProgress(null);
    }
  };

  // Handle Re-fetch
  const handleRefetch = async (cropId: string) => {
    try {
      setActionInProgress(cropId);
      showToast(`Re-fetching botanical photo for ${cropId}...`);
      const res = await fetch(`/api/dev/crops/${cropId}/refetch`, { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setCrops(prev => prev.map(c => (c.cropId === cropId ? json.data : c)));
          showToast(`Re-fetched photo from ${json.data.source}!`);
        }
      }
    } catch (err: any) {
      showToast(`Re-fetch failed: ${err.message}`);
    } finally {
      setActionInProgress(null);
    }
  };

  // Trigger file upload dialog
  const handleUploadClick = (cropId: string) => {
    setSelectedCropForUpload(cropId);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // Handle file chosen from disk
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedCropForUpload) return;

    const cropId = selectedCropForUpload;
    const reader = new FileReader();

    reader.onload = async event => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;

      try {
        setActionInProgress(cropId);
        showToast(`Compressing and uploading image for ${cropId}...`);
        const res = await fetch(`/api/dev/crops/${cropId}/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dataUrl,
            photographer: 'Local Developer / Field Upload',
            license: 'Direct Field Photograph',
          }),
        });

        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            setCrops(prev => prev.map(c => (c.cropId === cropId ? json.data : c)));
            showToast(`Custom photo uploaded & approved for ${cropId}!`);
          }
        }
      } catch (err: any) {
        showToast(`Upload failed: ${err.message}`);
      } finally {
        setActionInProgress(null);
        setSelectedCropForUpload(null);
      }
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#0D2B18] pb-24 font-sans">
      {/* Hidden File Input for Custom Image Uploads */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-forest text-white px-5 py-3 rounded-2xl shadow-xl border border-white/20 text-sm font-bold flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/home')}
              className="w-10 h-10 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-200 flex items-center justify-center text-forest transition"
              title="Return to Home"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-mint text-forest text-[10px] font-black tracking-wide uppercase">
                  Dev Only
                </span>
                <h1 className="text-xl font-black text-forest">Crop Image Gallery & Verification</h1>
              </div>
              <p className="text-xs text-gray-500 font-medium">
                Verify authentic botanical photographs, inspect licenses & photographer credits
              </p>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-200/80 text-xs font-bold">
            <span className="px-2.5 py-1 rounded-xl bg-white text-forest shadow-xs">
              Total: {stats.total}
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 flex items-center gap-1">
              <Check className="w-3.5 h-3.5 stroke-[3]" /> {stats.approved} Approved
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-amber-100 text-amber-800 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 stroke-[2.5]" /> {stats.pending} Pending
            </span>
            {stats.fallback > 0 && (
              <span className="px-2.5 py-1 rounded-xl bg-gray-200 text-gray-700">
                {stats.fallback} Fallback
              </span>
            )}
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-3 pt-1 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by crop, scientific name, or id..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-forest/30 focus:bg-white transition"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                statusFilter === 'all'
                  ? 'bg-forest text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All ({crops.length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
                statusFilter === 'pending'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Pending Review ({stats.pending})
            </button>
            <button
              onClick={() => setStatusFilter('approved')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
                statusFilter === 'approved'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              Approved ({stats.approved})
            </button>
            <button
              onClick={() => setStatusFilter('fallback')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                statusFilter === 'fallback'
                  ? 'bg-gray-700 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Fallback ({stats.fallback})
            </button>

            {/* Batch Approve Button */}
            {stats.pending > 0 && (
              <button
                onClick={handleApproveAllPending}
                disabled={actionInProgress === 'batch-approve'}
                className="ml-auto px-4 py-1.5 rounded-xl bg-forest text-white text-xs font-black shadow-sm hover:bg-forest/90 active:scale-95 transition flex items-center gap-1 shrink-0"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Approve All Pending
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <RefreshCw className="w-8 h-8 text-forest animate-spin mb-3" />
            <h3 className="text-base font-bold text-forest">Loading Crop Knowledge Registry...</h3>
            <p className="text-xs text-gray-400 mt-1">Reading botanical image records and CC licenses</p>
          </div>
        ) : filteredCrops.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-gray-100 p-8 shadow-xs">
            <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-700">No crops found matching current filters</h3>
            <p className="text-xs text-gray-400 mt-1">Try clearing search terms or selecting "All"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredCrops.map(crop => {
              const isPending = crop.status === 'pending-review';
              const isApproved = crop.status === 'approved';
              const isFallback = crop.status === 'use-fallback';
              const isBusy = actionInProgress === crop.cropId;

              return (
                <div
                  key={crop.cropId}
                  className={`bg-white rounded-3xl border transition-all duration-200 overflow-hidden flex flex-col justify-between shadow-card hover:shadow-lg ${
                    isPending
                      ? 'border-amber-300 ring-2 ring-amber-100'
                      : isApproved
                      ? 'border-gray-100'
                      : 'border-dashed border-gray-300 bg-gray-50/50'
                  }`}
                >
                  <div>
                    {/* Image Stage */}
                    <div className="relative h-48 w-full bg-mint/30 overflow-hidden group">
                      {isFallback ? (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-mint/50 text-forest p-4 text-center">
                          <Sprout className="w-10 h-10 mb-1 opacity-70 stroke-[2]" />
                          <span className="text-xs font-bold">Botanical Illustration Active</span>
                          <span className="text-[10px] text-gray-500 mt-0.5">Placeholder fallback</span>
                        </div>
                      ) : (
                        <CropImage
                          cropId={crop.cropId}
                          alt={crop.name}
                          cropName={crop.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}

                      {/* Status Overlay Badge */}
                      <div className="absolute top-3 left-3 z-20">
                        {isApproved && (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wide flex items-center gap-1 shadow-sm">
                            <Check className="w-3 h-3 stroke-[3]" /> Approved
                          </span>
                        )}
                        {isPending && (
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/95 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wide flex items-center gap-1 shadow-sm animate-pulse">
                            <Clock className="w-3 h-3 stroke-[2.5]" /> Review Needed
                          </span>
                        )}
                        {isFallback && (
                          <span className="px-2.5 py-1 rounded-full bg-gray-600/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wide shadow-sm">
                            Fallback
                          </span>
                        )}
                      </div>

                      {/* Source Badge Overlay */}
                      <div className="absolute top-3 right-3 z-20">
                        <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[9px] font-bold">
                          {crop.source || 'Local'}
                        </span>
                      </div>
                    </div>

                    {/* Metadata Details */}
                    <div className="p-4 space-y-2.5">
                      {/* Crop Titles */}
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <h3 className="font-extrabold text-sm text-[#0D2B18] leading-tight line-clamp-1">
                            {crop.name}
                          </h3>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 uppercase tracking-wider shrink-0">
                            {crop.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-800 font-semibold italic truncate">
                          {crop.scientificName || 'Botanical name not specified'}
                        </p>
                      </div>

                      {/* Vernacular Names */}
                      <div className="flex flex-wrap gap-1 text-[10px] font-medium text-gray-600">
                        {crop.nameKannada && (
                          <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-900 font-bold border border-emerald-100">
                            ಕ: {crop.nameKannada.split('(')[0].trim()}
                          </span>
                        )}
                        {crop.nameTamil && (
                          <span className="px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-100">
                            த: {crop.nameTamil.split('(')[0].trim()}
                          </span>
                        )}
                        {crop.nameTelugu && (
                          <span className="px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-900 border border-blue-100">
                            తె: {crop.nameTelugu.split('(')[0].trim()}
                          </span>
                        )}
                      </div>

                      {/* License & Photographer Information */}
                      <div className="pt-1 border-t border-gray-100 text-[10px] text-gray-500 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-700">License:</span>
                          <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                            {crop.license || 'Public Domain'}
                          </span>
                        </div>
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-gray-700 shrink-0">Credit:</span>
                          <span className="text-gray-500 truncate text-right font-medium" title={crop.photographer}>
                            {crop.photographer || 'Wikimedia / Field Contributor'}
                          </span>
                        </div>
                        {crop.sourceUrl && (
                          <div className="pt-0.5 text-right">
                            <a
                              href={crop.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[9px] font-bold text-forest hover:underline inline-flex items-center gap-0.5"
                            >
                              <span>View Source Observation</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons Row */}
                  <div className="p-3 bg-gray-50/80 border-t border-gray-100 grid grid-cols-4 gap-1.5">
                    {/* 1. Approve */}
                    <button
                      onClick={() => handleApprove(crop.cropId)}
                      disabled={isBusy || isApproved}
                      title="Approve this image"
                      className={`flex flex-col items-center justify-center p-2 rounded-2xl text-[9px] font-bold transition active:scale-95 ${
                        isApproved
                          ? 'bg-emerald-100 text-emerald-700 cursor-default opacity-80'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                      }`}
                    >
                      <Check className="w-4 h-4 stroke-[3] mb-0.5" />
                      <span>{isApproved ? 'Approved' : 'Approve'}</span>
                    </button>

                    {/* 2. Re-fetch */}
                    <button
                      onClick={() => handleRefetch(crop.cropId)}
                      disabled={isBusy}
                      title="Re-query iNaturalist/Wikipedia/Pexels"
                      className="flex flex-col items-center justify-center p-2 rounded-2xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-forest text-[9px] font-bold transition active:scale-95 shadow-xs"
                    >
                      <RefreshCw className={`w-4 h-4 mb-0.5 ${isBusy ? 'animate-spin text-forest' : ''}`} />
                      <span>Re-fetch</span>
                    </button>

                    {/* 3. Upload Custom Image */}
                    <button
                      onClick={() => handleUploadClick(crop.cropId)}
                      disabled={isBusy}
                      title="Upload custom photograph"
                      className="flex flex-col items-center justify-center p-2 rounded-2xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-emerald-700 text-[9px] font-bold transition active:scale-95 shadow-xs"
                    >
                      <Upload className="w-4 h-4 mb-0.5" />
                      <span>Upload</span>
                    </button>

                    {/* 4. Use Fallback */}
                    <button
                      onClick={() => handleUseFallback(crop.cropId)}
                      disabled={isBusy || isFallback}
                      title="Use green leaf botanical icon"
                      className={`flex flex-col items-center justify-center p-2 rounded-2xl text-[9px] font-bold transition active:scale-95 ${
                        isFallback
                          ? 'bg-gray-200 text-gray-500 cursor-default'
                          : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 shadow-xs'
                      }`}
                    >
                      <Sprout className="w-4 h-4 mb-0.5" />
                      <span>Fallback</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default DevCropGalleryPage;

