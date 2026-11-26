import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MapPin,
  Navigation,
  Search,
  Check,
  Layers,
  AlertCircle,
  RefreshCw,
  Sprout,
  Plus,
  Minus,
  Compass,
  Crosshair,
  Satellite,
  Mountain,
  Map as MapIcon,
  Globe,
} from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';
import { api } from '../../services/api';

export type GoogleMapMode = 'roadmap' | 'satellite' | 'hybrid' | 'terrain';

export interface LocationSelectPayload {
  state: string;
  district: string;
  taluk?: string;
  village?: string;
  latitude: number;
  longitude: number;
  agroZone?: string;
  agroZoneDescription?: string;
  typicalSoils?: string[];
}

interface GoogleMapPickerProps {
  initialLat?: number;
  initialLon?: number;
  initialDistrict?: string;
  onLocationSelect?: (loc: LocationSelectPayload) => void;
  onLocationSelected?: (loc: LocationSelectPayload) => void;
  onSwitchToManual?: () => void;
  heightClass?: string;
}

declare global {
  interface Window {
    google?: any;
    initGoogleMapPicker?: () => void;
  }
}

// Quick coordinates index for major Karnataka districts and towns
const KARNATAKA_QUICK_COORDS: Record<string, [number, number]> = {
  mandya: [12.5244, 76.8969],
  maddur: [12.5844, 77.0456],
  koppa: [12.6375, 77.0125],
  malavalli: [12.3872, 77.0583],
  pandavapura: [12.4984, 76.6669],
  nagamangala: [12.8208, 76.7578],
  srirangapatna: [12.4239, 76.6947],
  mysuru: [12.2958, 76.6394],
  mysore: [12.2958, 76.6394],
  bengaluru: [12.9716, 77.5946],
  bangalore: [12.9716, 77.5946],
  kolar: [13.1367, 78.1292],
  chikkaballapur: [13.4325, 77.7275],
  tumakuru: [13.3379, 77.1173],
  tumkur: [13.3379, 77.1173],
  hassan: [13.0072, 76.096],
  shivamogga: [13.9299, 75.5681],
  shimoga: [13.9299, 75.5681],
  thirthahalli: [13.6934, 75.2449],
  sagar: [14.1670, 75.0333],
  bhadravathi: [13.8400, 75.7000],
  chikkamagaluru: [13.3161, 75.772],
  chikmagalur: [13.3161, 75.772],
  chitradurga: [14.2251, 76.398],
  davanagere: [14.4644, 75.9218],
  haveri: [14.7954, 75.3991],
  byadgi: [14.6787, 75.4854],
  ranebennur: [14.6234, 75.6218],
  dharwad: [15.4589, 75.0078],
  hubballi: [15.3647, 75.124],
  hubli: [15.3647, 75.124],
  gadag: [15.4298, 75.6318],
  belagavi: [15.8497, 74.4977],
  belgaum: [15.8497, 74.4977],
  bagalkot: [16.1856, 75.6989],
  vijayapura: [16.8302, 75.71],
  bijapur: [16.8302, 75.71],
  kalaburagi: [17.3297, 76.8343],
  gulbarga: [17.3297, 76.8343],
  bidar: [17.9104, 77.5199],
  yadgir: [16.7628, 77.1378],
  raichur: [16.2076, 77.3463],
  koppal: [15.3489, 76.155],
  ballari: [15.1394, 76.9214],
  bellary: [15.1394, 76.9214],
  hospet: [15.2689, 76.3909],
  vijayanagara: [15.2689, 76.3909],
  mangaluru: [12.8703, 74.8806],
  mangalore: [12.8703, 74.8806],
  udupi: [13.3409, 74.7421],
  karwar: [14.8185, 74.1352],
  uttara_kannada: [14.8185, 74.1352],
  madikeri: [12.4244, 75.7382],
  kodagu: [12.4244, 75.7382],
  coorg: [12.4244, 75.7382],
  chamarajanagar: [11.9261, 76.9437],
  ramanagara: [12.715, 77.281],
};

export const GoogleMapPicker: React.FC<GoogleMapPickerProps> = ({
  initialLat = 12.5244,
  initialLon = 76.8969,
  initialDistrict,
  onLocationSelect,
  onLocationSelected,
  onSwitchToManual,
  heightClass = 'h-72 sm:h-80',
}) => {
  const { t, language } = useTranslation();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const [lat, setLat] = useState(initialLat);
  const [lon, setLon] = useState(initialLon);
  const [zoom, setZoom] = useState(13);
  const [activeMapMode, setActiveMapMode] = useState<GoogleMapMode>('hybrid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [googleMapsReady, setGoogleMapsReady] = useState(false);
  const [currentDetails, setCurrentDetails] = useState<LocationSelectPayload | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [pinDropKey, setPinDropKey] = useState(0);

  const apiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || '';

  const emitLocation = useCallback(
    (payload: LocationSelectPayload) => {
      if (onLocationSelect) onLocationSelect(payload);
      if (onLocationSelected) onLocationSelected(payload);
    },
    [onLocationSelect, onLocationSelected]
  );

  // Reverse geocode and fetch regional agricultural conditions
  const fetchConditionsForCoords = useCallback(
    async (latitude: number, longitude: number) => {
      setIsLoadingDetails(true);
      try {
        const res = await api.weather.getLocationConditions({
          lat: latitude,
          lon: longitude,
          district: initialDistrict,
        });

        if (res && res.location) {
          const payload: LocationSelectPayload = {
            state: res.location.state || 'Karnataka',
            district: res.location.district || initialDistrict || 'Mandya',
            taluk: res.location.taluk || res.location.village || 'Mandya',
            village: res.location.village || res.location.taluk || undefined,
            latitude,
            longitude,
            agroZone: res.location.agroZone || 'Southern Dry Zone',
            agroZoneDescription:
              res.location.agroZoneDescription ||
              'Canal-irrigated Cauvery basin with high paddy and sugarcane productivity.',
            typicalSoils: res.location.typicalSoils || ['red', 'loamy', 'alluvial'],
          };
          setCurrentDetails(payload);
          emitLocation(payload);
        }
      } catch (err) {
        // Fallback default regional context
        const fallback: LocationSelectPayload = {
          state: 'Karnataka',
          district: initialDistrict || 'Mandya',
          taluk: 'Mandya',
          latitude,
          longitude,
          agroZone: 'Southern Dry Zone',
          agroZoneDescription:
            'Canal-irrigated Cauvery basin with high paddy and sugarcane productivity.',
          typicalSoils: ['red', 'loamy', 'alluvial'],
        };
        setCurrentDetails(fallback);
        emitLocation(fallback);
      } finally {
        setIsLoadingDetails(false);
      }
    },
    [initialDistrict, emitLocation]
  );

  // Initial reverse geocode on mount
  useEffect(() => {
    fetchConditionsForCoords(initialLat, initialLon);
  }, []);

  // Update center and pin position helper
  const updatePinCoordinates = useCallback(
    (newLat: number, newLon: number, shouldPan = true) => {
      setLat(newLat);
      setLon(newLon);
      setPinDropKey((k) => k + 1);

      if (mapInstanceRef.current && window.google?.maps) {
        const pos = new window.google.maps.LatLng(newLat, newLon);
        if (markerRef.current) {
          markerRef.current.setPosition(pos);
        }
        if (shouldPan) {
          mapInstanceRef.current.panTo(pos);
        }
      }

      fetchConditionsForCoords(newLat, newLon);
    },
    [fetchConditionsForCoords]
  );

  // Initialize Google Maps instance
  useEffect(() => {
    let isCancelled = false;

    function mountGoogleMap() {
      if (isCancelled || !mapContainerRef.current || !window.google?.maps) return;

      try {
        const map = new window.google.maps.Map(mapContainerRef.current, {
          center: { lat, lng: lon },
          zoom,
          mapTypeId: activeMapMode,
          disableDefaultUI: true,
          zoomControl: false,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          gestureHandling: 'greedy',
          rotateControl: true,
        });

        // Draggable Agricultural Pin
        const marker = new window.google.maps.Marker({
          position: { lat, lng: lon },
          map,
          draggable: true,
          animation: window.google.maps.Animation.DROP,
          title: 'Farm Location Pin',
        });

        marker.addListener('dragend', (e: any) => {
          const nLat = e.latLng.lat();
          const nLon = e.latLng.lng();
          updatePinCoordinates(nLat, nLon, false);
        });

        map.addListener('click', (e: any) => {
          const nLat = e.latLng.lat();
          const nLon = e.latLng.lng();
          updatePinCoordinates(nLat, nLon, true);
        });

        map.addListener('zoom_changed', () => {
          const z = map.getZoom();
          if (typeof z === 'number') setZoom(z);
        });

        mapInstanceRef.current = map;
        markerRef.current = marker;
        setGoogleMapsReady(true);
      } catch (e) {
        console.warn('Google Maps initialization fallback:', e);
      }
    }

    if (window.google && window.google.maps) {
      mountGoogleMap();
    } else {
      const scriptId = 'google-maps-js-sdk';
      let existingScript = document.getElementById(scriptId) as HTMLScriptElement | null;

      if (!existingScript) {
        existingScript = document.createElement('script');
        existingScript.id = scriptId;
        existingScript.src = `https://maps.googleapis.com/maps/api/js?${apiKey ? `key=${apiKey}&` : ''}libraries=places,geometry&v=weekly`;
        existingScript.async = true;
        existingScript.defer = true;
        document.head.appendChild(existingScript);
      }

      const prevOnload = existingScript.onload;
      existingScript.onload = (ev) => {
        if (typeof prevOnload === 'function') prevOnload.call(existingScript, ev);
        mountGoogleMap();
      };
    }

    return () => {
      isCancelled = true;
    };
  }, []);

  // Update map mode (roadmap, satellite, hybrid, terrain)
  const handleMapModeChange = (mode: GoogleMapMode) => {
    setActiveMapMode(mode);
    if (mapInstanceRef.current && window.google?.maps) {
      mapInstanceRef.current.setMapTypeId(mode);
    }
  };

  // Zoom In / Zoom Out
  const handleZoom = (delta: number) => {
    const nextZoom = Math.min(20, Math.max(5, zoom + delta));
    setZoom(nextZoom);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoom(nextZoom);
    }
  };

  // Use device GPS
  const handleUseGps = () => {
    if (!navigator.geolocation) {
      alert(t('locationUnavailable') || 'Geolocation is not supported by your device.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nLat = pos.coords.latitude;
        const nLon = pos.coords.longitude;
        setIsLocating(false);
        updatePinCoordinates(nLat, nLon, true);
      },
      (err) => {
        setIsLocating(false);
        console.warn('GPS Geolocation error:', err.message);
        updatePinCoordinates(lat, lon, true);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Search by location name
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const q = searchQuery.toLowerCase().trim();
    const matchKey = Object.keys(KARNATAKA_QUICK_COORDS).find((k) => q.includes(k) || k.includes(q));

    if (matchKey) {
      const [nLat, nLon] = KARNATAKA_QUICK_COORDS[matchKey];
      updatePinCoordinates(nLat, nLon, true);
      setSearchQuery('');
    } else if (window.google?.maps?.Geocoder) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: `${searchQuery}, Karnataka, India` }, (results: any, status: any) => {
        if (status === 'OK' && results && results[0]?.geometry?.location) {
          const loc = results[0].geometry.location;
          updatePinCoordinates(loc.lat(), loc.lng(), true);
          setSearchQuery('');
        } else {
          updatePinCoordinates(lat, lon, true);
        }
      });
    } else {
      updatePinCoordinates(lat, lon, true);
    }
  };

  // Map Modes metadata with localized labels and icons
  const MAP_MODES: {
    id: GoogleMapMode;
    labelKey: string;
    english: string;
    kannada: string;
    icon: React.ReactNode;
    hint: string;
  }[] = [
    {
      id: 'hybrid',
      labelKey: 'mapModeHybrid',
      english: 'Hybrid',
      kannada: 'ಹೈಬ್ರಿಡ್',
      icon: <Globe className="w-3.5 h-3.5" />,
      hint: 'Satellite photo + roads & village names',
    },
    {
      id: 'satellite',
      labelKey: 'mapModeSatellite',
      english: 'Satellite',
      kannada: 'ಉಪಗ್ರಹ',
      icon: <Satellite className="w-3.5 h-3.5" />,
      hint: 'Pure high-res aerial satellite imagery',
    },
    {
      id: 'terrain',
      labelKey: 'mapModeTerrain',
      english: 'Terrain',
      kannada: 'ಭೂಪ್ರದೇಶ',
      icon: <Mountain className="w-3.5 h-3.5" />,
      hint: 'Topographic contour elevation relief',
    },
    {
      id: 'roadmap',
      labelKey: 'mapModeRoadmap',
      english: 'Roadmap',
      kannada: 'ರಸ್ತೆ ನಕ್ಷೆ',
      icon: <MapIcon className="w-3.5 h-3.5" />,
      hint: 'Clean 2D street and boundary map',
    },
  ];

  return (
    <div className="bg-white rounded-3xl p-4 border border-forest/15 shadow-sm space-y-3">
      {/* 1. TOP HEADER & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row gap-2">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-forest/70" />
          <input
            type="text"
            aria-label="Search farm location"
            placeholder={
              language === 'kn'
                ? 'ಗ್ರಾಮ, ತಾಲೂಕು ಅಥವಾ ಜಿಲ್ಲೆ ಹುಡುಕಿ (ಉದಾ: ಮಂಡ್ಯ, ಕೊಪ್ಪ, ಮದ್ದೂರು)...'
                : 'Search village, taluk or district (e.g. Mandya, Koppa, Maddur)...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full min-h-[44px] pl-10 pr-3 py-2 text-xs border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-forest bg-gray-50/70 font-medium"
          />
        </form>

        <button
          type="button"
          onClick={handleUseGps}
          disabled={isLocating}
          className="min-h-[44px] px-3.5 py-2 bg-emerald-50 hover:bg-forest hover:text-white text-forest text-xs font-bold rounded-2xl transition flex items-center justify-center gap-1.5 shrink-0 border border-emerald-200 active:scale-95 cursor-pointer disabled:opacity-50"
          title={t('detectMyLocation')}
        >
          <Crosshair className={`w-4 h-4 ${isLocating ? 'animate-spin text-forest' : ''}`} />
          <span>{isLocating ? t('detectingLocation') : t('detectMyLocation')}</span>
        </button>
      </div>

      {/* 2. MAP MODES SWITCHER BAR */}
      <div className="flex items-center justify-between gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-1 text-[11px] font-bold text-gray-500 shrink-0 mr-1">
          <Layers className="w-3.5 h-3.5 text-forest" />
          <span className="hidden xs:inline">Mode:</span>
        </div>

        <div className="flex items-center gap-1.5 flex-1 min-w-max">
          {MAP_MODES.map((m) => {
            const isActive = activeMapMode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => handleMapModeChange(m.id)}
                className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer border ${
                  isActive
                    ? 'bg-forest text-white border-forest shadow-sm shadow-forest/20 scale-[1.02]'
                    : 'bg-gray-100 hover:bg-gray-200/80 text-gray-700 border-gray-200'
                }`}
                title={m.hint}
              >
                {m.icon}
                <span>{language === 'kn' ? m.kannada : t(m.labelKey as any) || m.english}</span>
                {isActive && <Check className="w-3 h-3 text-white ml-0.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. GOOGLE MAP CANVAS & INTERACTIVE OVERLAY */}
      <div className={`relative w-full ${heightClass} rounded-2xl overflow-hidden border border-forest/20 shadow-inner bg-slate-100`}>
        {/* Google Maps Div */}
        <div
          ref={mapContainerRef}
          className="w-full h-full"
          tabIndex={0}
          aria-label="Google Map with Location Pinpoint"
        />

        {/* Fallback Tile Layer & Interactive Pin when Google Maps is initializing or offline */}
        {!googleMapsReady && (
          <div
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const xPercent = (e.clientX - rect.left) / rect.width - 0.5;
              const yPercent = (e.clientY - rect.top) / rect.height - 0.5;
              // Approximate delta degrees per screen fraction
              const dLat = -yPercent * 0.05;
              const dLon = xPercent * 0.05;
              updatePinCoordinates(lat + dLat, lon + dLon, false);
            }}
            className="absolute inset-0 cursor-crosshair flex flex-col items-center justify-center overflow-hidden"
            style={{
              backgroundImage:
                activeMapMode === 'satellite' || activeMapMode === 'hybrid'
                  ? 'radial-gradient(circle at center, #1b3a24 0%, #0d1f14 100%)'
                  : activeMapMode === 'terrain'
                  ? 'radial-gradient(circle at center, #e8ede3 0%, #c4d4b8 100%)'
                  : 'radial-gradient(circle at center, #f4f6f0 0%, #e5e9de 100%)',
            }}
          >
            {/* Subtle topographic / grid texture */}
            <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#15803d_1px,transparent_1px)] [background-size:20px_20px]" />

            {/* Draggable animated pin */}
            <div
              key={pinDropKey}
              className="relative z-10 flex flex-col items-center select-none animate-bounce"
            >
              <div className="w-12 h-12 rounded-full bg-forest text-white shadow-xl flex items-center justify-center border-2 border-white ring-4 ring-forest/20">
                <MapPin className="w-6 h-6 fill-white text-forest" />
              </div>
              <div className="mt-2 bg-white/95 backdrop-blur-md px-3.5 py-1 rounded-full shadow-lg border border-forest/20 text-xs font-black text-forest flex items-center gap-1.5">
                <span>📍 {currentDetails?.taluk || 'Mandya'},</span>
                <span className="text-gray-900">{currentDetails?.district || 'Mandya'}</span>
              </div>
            </div>

            <div className="absolute bottom-2 left-2 z-10 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-gray-200 text-[11px] font-bold text-gray-700">
              <span>{t('dragPinToFarm')}</span>
            </div>
          </div>
        )}

        {/* Floating Controls: Zoom Buttons */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => handleZoom(1)}
            className="w-9 h-9 rounded-xl bg-white/95 hover:bg-white text-gray-800 shadow-md border border-gray-200 flex items-center justify-center active:scale-95 transition cursor-pointer"
            aria-label={t('mapZoomIn')}
            title={t('mapZoomIn')}
          >
            <Plus className="w-4 h-4 font-black" />
          </button>
          <button
            type="button"
            onClick={() => handleZoom(-1)}
            className="w-9 h-9 rounded-xl bg-white/95 hover:bg-white text-gray-800 shadow-md border border-gray-200 flex items-center justify-center active:scale-95 transition cursor-pointer"
            aria-label={t('mapZoomOut')}
            title={t('mapZoomOut')}
          >
            <Minus className="w-4 h-4 font-black" />
          </button>
        </div>

        {/* Floating Controls: Mode Badge Overlay */}
        <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-xl shadow-md border border-forest/20 text-[11px] font-extrabold text-forest flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-forest" />
          <span className="capitalize">{activeMapMode}</span>
          <span className="text-gray-400 font-normal">|</span>
          <span className="font-mono text-gray-700">{lat.toFixed(4)}°, {lon.toFixed(4)}°</span>
        </div>

        {/* Switch to manual dropdowns option */}
        {onSwitchToManual && (
          <div className="absolute bottom-3 right-3 z-10">
            <button
              type="button"
              onClick={onSwitchToManual}
              className="min-h-[38px] text-[11px] font-extrabold text-forest bg-white/95 hover:bg-white px-3 py-1.5 rounded-xl border border-forest/20 shadow-md cursor-pointer transition active:scale-95"
            >
              {t('selectFromListTab')}
            </button>
          </div>
        )}
      </div>

      {/* 4. PINPOINTED LOCATION SUMMARY & AGRICULTURAL CONTEXT CARD */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-mint/25 via-cream/40 to-leaf/15 border border-forest/20 space-y-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-forest text-white flex items-center justify-center text-xs font-bold shadow-xs">
              <Sprout className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-black text-gray-900">
                  {currentDetails?.taluk ? `${currentDetails.taluk}, ` : ''}{currentDetails?.district || 'Mandya'}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-forest text-white font-bold">
                  {currentDetails?.state || 'Karnataka'}
                </span>
                <span className="text-[11px] text-gray-500 font-mono font-semibold">
                  ({lat.toFixed(4)}° N, {lon.toFixed(4)}° E)
                </span>
              </div>
              <p className="text-[11px] font-bold text-forest mt-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-forest" />
                <span>{currentDetails?.agroZone || 'Southern Dry Zone'}</span>
              </p>
            </div>
          </div>

          {isLoadingDetails && (
            <RefreshCw className="w-4 h-4 text-forest animate-spin shrink-0" />
          )}
        </div>

        {currentDetails?.agroZoneDescription && (
          <p className="text-[11px] text-gray-600 leading-relaxed bg-white/60 p-2 rounded-xl border border-forest/10">
            {currentDetails.agroZoneDescription}
          </p>
        )}

        {currentDetails?.typicalSoils && currentDetails.typicalSoils.length > 0 && (
          <div className="flex items-center gap-1.5 pt-0.5 text-[11px]">
            <span className="font-bold text-gray-800">Common Soils:</span>
            <div className="flex flex-wrap gap-1">
              {currentDetails.typicalSoils.map((s) => (
                <span
                  key={s}
                  className="capitalize px-2 py-0.5 rounded-md bg-white border border-gray-200 text-gray-800 text-[11px] font-semibold shadow-2xs"
                >
                  {s} soil
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
