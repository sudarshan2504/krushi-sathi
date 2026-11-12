import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Search, Check, Layers, AlertCircle, RefreshCw, Sprout } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';
import { api } from '../../services/api';

export interface LocationSelectPayload {
  state: string;
  district: string;
  taluk?: string;
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
}

declare global {
  interface Window {
    google?: any;
    initGoogleMapPicker?: () => void;
  }
}

export const GoogleMapPicker: React.FC<GoogleMapPickerProps> = ({
  initialLat = 12.5244,
  initialLon = 76.8969,
  initialDistrict,
  onLocationSelect,
  onLocationSelected,
  onSwitchToManual,
}) => {
  const { language } = useTranslation();
  const mapRef = useRef<HTMLDivElement>(null);
  const [lat, setLat] = useState(initialLat);
  const [lon, setLon] = useState(initialLon);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [currentDetails, setCurrentDetails] = useState<LocationSelectPayload | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  const emitLocation = (payload: LocationSelectPayload) => {
    if (onLocationSelect) onLocationSelect(payload);
    if (onLocationSelected) onLocationSelected(payload);
  };

  // Reverse geocode and fetch regional conditions from server
  const fetchConditionsForCoords = async (latitude: number, longitude: number) => {
    setIsLoadingDetails(true);
    try {
      const res = await api.weather.getLocationConditions({
        lat: latitude,
        lon: longitude,
        district: initialDistrict,
      });

      if (res && res.location) {
        const payload: LocationSelectPayload = {
          state: res.location.state,
          district: res.location.district,
          taluk: res.location.taluk,
          latitude,
          longitude,
          agroZone: res.location.agroZone,
          agroZoneDescription: res.location.agroZoneDescription,
          typicalSoils: res.location.typicalSoils,
        };
        setCurrentDetails(payload);
        emitLocation(payload);
      }
    } catch (err) {
      // Fallback payload
      const fallback: LocationSelectPayload = {
        state: 'Karnataka',
        district: initialDistrict || 'Mandya',
        taluk: 'Mandya',
        latitude,
        longitude,
        agroZone: 'Southern Dry Zone',
        agroZoneDescription: 'Canal-irrigated Cauvery basin with high paddy and sugarcane productivity.',
        typicalSoils: ['red', 'loamy', 'alluvial'],
      };
      setCurrentDetails(fallback);
      emitLocation(fallback);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Initial fetch for starting coordinates
  useEffect(() => {
    fetchConditionsForCoords(initialLat, initialLon);
  }, []);

  // Initialize Google Maps if API key is present
  useEffect(() => {
    if (!apiKey) return;

    let marker: any = null;
    let mapInstance: any = null;

    function initMap() {
      if (!mapRef.current || !window.google) return;

      mapInstance = new window.google.maps.Map(mapRef.current, {
        center: { lat, lng: lon },
        zoom: 12,
        mapTypeId: 'terrain',
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      marker = new window.google.maps.Marker({
        position: { lat, lng: lon },
        map: mapInstance,
        draggable: true,
        animation: window.google.maps.Animation.DROP,
        title: 'Farm Location',
      });

      marker.addListener('dragend', (e: any) => {
        const newLat = e.latLng.lat();
        const newLon = e.latLng.lng();
        setLat(newLat);
        setLon(newLon);
        fetchConditionsForCoords(newLat, newLon);
      });

      mapInstance.addListener('click', (e: any) => {
        const newLat = e.latLng.lat();
        const newLon = e.latLng.lng();
        marker.setPosition(e.latLng);
        setLat(newLat);
        setLon(newLon);
        fetchConditionsForCoords(newLat, newLon);
      });

      setMapLoaded(true);
    }

    if (window.google && window.google.maps) {
      initMap();
    } else {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);
    }
  }, [apiKey]);

  // Handle GPS location request
  const handleUseGps = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLat = pos.coords.latitude;
        const newLon = pos.coords.longitude;
        setLat(newLat);
        setLon(newLon);
        setIsLocating(false);
        fetchConditionsForCoords(newLat, newLon);
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation error:', err.message);
        // Fallback default
        fetchConditionsForCoords(lat, lon);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Search by place name
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const q = searchQuery.toLowerCase();
    // Known district coordinates mapping
    const quickCoords: Record<string, [number, number]> = {
      mandya: [12.5244, 76.8969],
      mysuru: [12.2958, 76.6394],
      mysore: [12.2958, 76.6394],
      shivamogga: [13.9299, 75.5681],
      shimoga: [13.9299, 75.5681],
      thirthahalli: [13.6934, 75.2449],
      kalaburagi: [17.3297, 76.8343],
      gulbarga: [17.3297, 76.8343],
      dharwad: [15.4589, 75.0078],
      hubballi: [15.3647, 75.124],
      hubli: [15.3647, 75.124],
      haveri: [14.7954, 75.3991],
      byadgi: [14.6787, 75.4854],
      chikkamagaluru: [13.3161, 75.772],
      mangaluru: [12.8703, 74.8806],
      coimbatore: [11.0168, 76.9558],
      thanjavur: [10.787, 79.1378],
      guntur: [16.3067, 80.4365],
      warangal: [17.9689, 79.5941],
    };

    const matchKey = Object.keys(quickCoords).find((k) => q.includes(k));
    if (matchKey) {
      const [newLat, newLon] = quickCoords[matchKey];
      setLat(newLat);
      setLon(newLon);
      fetchConditionsForCoords(newLat, newLon);
    } else {
      // Default to coordinates update
      fetchConditionsForCoords(lat, lon);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-4 border border-gray-200 shadow-sm space-y-3">
      {/* Search Bar & GPS Button */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3.5 text-gray-600 dark:text-gray-400" />
          <input
            type="text"
            aria-label="Search farm location"
            placeholder={
              language === 'kn'
                ? 'ಗ್ರಾಮ, ತಾಲೂಕು ಅಥವಾ ಜಿಲ್ಲೆ ಹುಡುಕಿ (ಉದಾ: ಮಂಡ್ಯ, ತೀರ್ಥಹಳ್ಳಿ)...'
                : 'Search village, taluk or district (e.g. Mandya, Thirthahalli)...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full min-h-[44px] pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest bg-gray-50/50"
          />
        </div>

        <button
          type="button"
          onClick={handleUseGps}
          disabled={isLocating}
          className="min-h-[44px] px-3 bg-mint/20 hover:bg-forest hover:text-white text-forest text-xs font-bold rounded-xl transition flex items-center gap-1.5 shrink-0"
        >
          <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
          <span>{isLocating ? 'Locating...' : 'GPS'}</span>
        </button>
      </form>

      {/* Map Display */}
      {apiKey ? (
        <div
          ref={mapRef}
          className="w-full h-64 rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 relative"
        />
      ) : (
        /* Visual Satellite Simulation Map when no API key configured */
        <div className="w-full h-56 rounded-2xl overflow-hidden border border-leaf/30 bg-gradient-to-br from-forest/10 via-earth/10 to-harvest/10 relative flex flex-col items-center justify-center p-4 text-center">
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#2d5a27_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* Interactive pin */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-forest text-white shadow-xl flex items-center justify-center animate-bounce">
              <MapPin className="w-6 h-6" />
            </div>
            <div className="mt-2 bg-white/95 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-md border border-gray-200 text-xs font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
              <span>{currentDetails?.taluk || 'Mandya'},</span>
              <span className="text-forest">{currentDetails?.district || 'Mandya'}</span>
            </div>
            <span className="text-[11px] text-gray-600 dark:text-gray-400 mt-1 font-mono">
              {lat.toFixed(4)}° N, {lon.toFixed(4)}° E
            </span>
          </div>

          <div className="absolute bottom-2 right-2 z-10">
            {onSwitchToManual && (
              <button
                type="button"
                onClick={onSwitchToManual}
                className="min-h-[44px] text-[11px] font-bold text-forest bg-white px-3 py-1 rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50"
              >
                Use Dropdowns instead
              </button>
            )}
          </div>
        </div>
      )}

      {/* Live Conditions Card for Selected Location */}
      {currentDetails && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-mint/20 via-cream/40 to-leaf/10 border border-leaf/30 space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-forest text-white flex items-center justify-center text-xs font-bold">
                <Sprout className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                  <span>{currentDetails.taluk ? `${currentDetails.taluk}, ` : ''}{currentDetails.district}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-forest text-white font-medium">
                    {currentDetails.state}
                  </span>
                </h4>
                <p className="text-[11px] font-bold text-forest mt-0.5">
                  {currentDetails.agroZone}
                </p>
              </div>
            </div>

            {isLoadingDetails && (
              <RefreshCw className="w-4 h-4 text-forest animate-spin" />
            )}
          </div>

          <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
            {currentDetails.agroZoneDescription}
          </p>

          {currentDetails.typicalSoils && currentDetails.typicalSoils.length > 0 && (
            <div className="flex items-center gap-1.5 pt-1 text-[11px]">
              <span className="font-semibold text-gray-900 dark:text-gray-100">Common Soils:</span>
              <div className="flex flex-wrap gap-1">
                {currentDetails.typicalSoils.map((s) => (
                  <span
                    key={s}
                    className="capitalize px-2 py-0.5 rounded-md bg-white border border-gray-200 text-gray-900 dark:text-gray-100 text-[11px] font-medium"
                  >
                    {s} soil
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
