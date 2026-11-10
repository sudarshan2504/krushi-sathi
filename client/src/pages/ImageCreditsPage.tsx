import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  ShieldCheck,
  ExternalLink,
  BookOpen,
  Filter,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { api } from '../services/api';
import { ImageCreditItem } from '../types';
import { CropImage } from '../components/ui/CropImage';

export const ImageCreditsPage: React.FC = () => {
  const navigate = useNavigate();
  const [credits, setCredits] = useState<ImageCreditItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLicense, setSelectedLicense] = useState('all');

  useEffect(() => {
    api.crops
      .getImageCredits()
      .then((res) => {
        if (res && res.credits) {
          setCredits(res.credits);
        }
      })
      .catch((err) => {
        console.error('Failed to load image credits:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const licenses = Array.from(new Set(credits.map((c) => c.license))).filter(Boolean);

  const filteredCredits = credits.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.cropName.toLowerCase().includes(q) ||
      item.scientificName.toLowerCase().includes(q) ||
      item.author.toLowerCase().includes(q) ||
      item.imageType.toLowerCase().includes(q);

    const matchesLicense = selectedLicense === 'all' || item.license === selectedLicense;

    return matchesSearch && matchesLicense;
  });

  return (
    <div className="min-h-screen py-4 px-2 sm:px-4 max-w-6xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-900 hover:bg-gray-50 transition"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <span className="text-xs font-extrabold text-forest uppercase tracking-wider">
          Compliance & Attribution
        </span>

        {import.meta.env.DEV ? (
          <button
            type="button"
            onClick={() => navigate('/dev/crop-gallery')}
            className="text-xs font-bold text-forest hover:underline flex items-center gap-1"
          >
            <span>Visual Review Dashboard</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="w-11" />
        )}
      </div>

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-card space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Open Knowledge & Creative Commons Attribution</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
          Image Credits & Copyright Licensing
        </h1>

        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-3xl">
          In strict compliance with academic and open licensing standards, all botanical photographs in Krushi Sathi
          are retrieved from Wikimedia Commons and open botanical repositories under valid Creative Commons licenses
          (CC BY-SA 4.0, CC BY 3.0, CC0 Public Domain). All crop disease imagery is strictly sourced from verified
          datasets (such as the PlantVillage open dataset under CC BY 4.0). All images are compressed and stored locally
          to ensure 100% offline educational usability on farmers' devices.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
            <span className="text-gray-500 block">Total Cataloged Photos</span>
            <span className="text-lg font-extrabold text-gray-900">{credits.length} Verified Photos</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
            <span className="text-gray-500 block">Primary Image Source</span>
            <span className="text-lg font-extrabold text-gray-900">Wikimedia Commons</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
            <span className="text-gray-500 block">Storage Architecture</span>
            <span className="text-lg font-extrabold text-gray-900">Local WebP (No Live Query)</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by crop, scientific name, or photographer..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-forest"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={selectedLicense}
            onChange={(e) => setSelectedLicense(e.target.value)}
            className="text-xs font-semibold py-2 px-3 bg-white border border-gray-200 rounded-xl focus:ring-1 focus:ring-forest"
          >
            <option value="all">All Licenses ({licenses.length})</option>
            {licenses.map((lic) => (
              <option key={lic} value={lic}>
                {lic}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Credits Table / List */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-card overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-gray-500 font-bold">
            Loading verified image credits...
          </div>
        ) : filteredCredits.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <p className="text-sm font-bold text-gray-900">No image records found matching your search</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedLicense('all');
              }}
              className="text-xs text-forest font-bold underline"
            >
              Reset filter
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredCredits.map((item, idx) => (
              <div
                key={`${item.cropId}-${item.imagePath}-${idx}`}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/60 transition"
              >
                <div className="flex items-start gap-4">
                  {/* Thumbnail */}
                  <CropImage
                    cropId={item.cropId}
                    src={item.imagePath}
                    alt={item.cropName}
                    cropName={item.cropName}
                    showFallbackLabel={false}
                    containerClassName="w-16 h-16 rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 shrink-0 shadow-xs relative"
                    className="w-full h-full object-cover"
                  />

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-forest px-2 py-0.5 rounded-md bg-forest/10">
                        {item.imageType}
                      </span>
                      <span className="text-xs text-gray-500 font-mono">{item.imagePath}</span>
                    </div>

                    <h4 className="text-sm font-extrabold text-gray-900">{item.cropName}</h4>
                    <p className="text-xs font-medium text-forest italic">{item.scientificName}</p>

                    <p className="text-xs text-gray-600">
                      <span className="font-semibold text-gray-700">Author / Contributor:</span>{' '}
                      {item.author}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:self-center shrink-0">
                  <div className="text-right">
                    <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-100">
                      {item.license}
                    </span>
                    <span className="block text-[10px] text-gray-400 mt-0.5">{item.source}</span>
                  </div>

                  {item.attributionUrl && (
                    <a
                      href={item.attributionUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:text-forest hover:bg-gray-100 transition"
                      title="View original file page on Wikimedia Commons"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
