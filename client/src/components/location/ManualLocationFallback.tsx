import React, { useState, useEffect } from 'react';
import { MapPin, Check } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';
import { api } from '../../services/api';

export interface ManualLocationData {
  state: string;
  district: string;
  taluk?: string;
  latitude: number;
  longitude: number;
  agroZone?: string;
  typicalSoils?: string[];
}

export interface ManualLocationFallbackProps {
  initialState?: string;
  initialDistrict?: string;
  initialTaluk?: string;
  selectedState?: string;
  selectedDistrict?: string;
  selectedTaluk?: string;
  onSelect?: (loc: ManualLocationData) => void;
  onLocationChange?: (loc: ManualLocationData) => void;
}

export const ManualLocationFallback: React.FC<ManualLocationFallbackProps> = ({
  initialState = 'Karnataka',
  initialDistrict = 'Mandya',
  initialTaluk = 'Mandya',
  selectedState: controlledState,
  selectedDistrict: controlledDistrict,
  selectedTaluk: controlledTaluk,
  onSelect,
  onLocationChange,
}) => {
  const { language } = useTranslation();
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedState, setSelectedState] = useState(controlledState || initialState);
  const [selectedDistrict, setSelectedDistrict] = useState(controlledDistrict || initialDistrict);
  const [selectedTaluk, setSelectedTaluk] = useState(controlledTaluk || initialTaluk);

  // Fetch structured India locations
  useEffect(() => {
    let isMounted = true;
    async function loadLocations() {
      try {
        const res = await api.weather.getLocations();
        if (isMounted && res && res.length > 0) {
          setLocations(res);
        }
      } catch (err) {
        console.warn('Could not load locations list');
      }
    }
    loadLocations();
    return () => {
      isMounted = false;
    };
  }, []);

  const currentStateObj = locations.find(
    (s) => s.state.toLowerCase() === selectedState.toLowerCase()
  ) || locations[0];

  const districtsList = currentStateObj?.districts || [];
  const currentDistrictObj = districtsList.find(
    (d: any) => d.name.toLowerCase() === selectedDistrict.toLowerCase()
  ) || districtsList[0];

  const taluksList = currentDistrictObj?.taluks || [];

  // Notify parent on change
  useEffect(() => {
    if (!currentDistrictObj) return;

    const currentTalukObj = taluksList.find(
      (t: any) => t.name.toLowerCase() === selectedTaluk.toLowerCase()
    ) || taluksList[0];

    const payload: ManualLocationData = {
      state: selectedState,
      district: currentDistrictObj.name,
      taluk: currentTalukObj?.name || selectedTaluk,
      latitude: currentTalukObj?.latitude || currentDistrictObj.latitude || 12.5244,
      longitude: currentTalukObj?.longitude || currentDistrictObj.longitude || 76.8969,
      agroZone: currentDistrictObj.agroZone,
      typicalSoils: currentTalukObj?.typicalSoils || currentDistrictObj.typicalSoils,
    };
    if (onSelect) onSelect(payload);
    if (onLocationChange) onLocationChange(payload);
  }, [selectedState, selectedDistrict, selectedTaluk, locations]);

  const handleStateChange = (st: string) => {
    setSelectedState(st);
    const newStObj = locations.find((s) => s.state === st);
    if (newStObj && newStObj.districts.length > 0) {
      setSelectedDistrict(newStObj.districts[0].name);
      if (newStObj.districts[0].taluks.length > 0) {
        setSelectedTaluk(newStObj.districts[0].taluks[0].name);
      }
    }
  };

  const handleDistrictChange = (dist: string) => {
    setSelectedDistrict(dist);
    const newDistObj = districtsList.find((d: any) => d.name === dist);
    if (newDistObj && newDistObj.taluks.length > 0) {
      setSelectedTaluk(newDistObj.taluks[0].name);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-3">
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-forest" />
        <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100">
          {language === 'kn' ? 'ಸ್ಥಳ ಆಯ್ಕೆಮಾಡಿ (ರಾಜ್ಯ / ಜಿಲ್ಲೆ / ತಾಲೂಕು)' : 'Select Your Farm Location (Dropdowns)'}
        </h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* State */}
        <div>
          <label htmlFor="manual-loc-state" className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 block mb-1">
            {language === 'kn' ? 'ರಾಜ್ಯ' : 'State'}
          </label>
          <select
            id="manual-loc-state"
            value={selectedState}
            onChange={(e) => handleStateChange(e.target.value)}
            className="w-full min-h-[44px] px-3 py-2 text-xs font-medium border border-gray-200 rounded-xl focus:ring-2 focus:ring-forest bg-gray-50/50"
          >
            {locations.length > 0 ? (
              locations.map((s) => (
                <option key={s.state} value={s.state}>
                  {s.state}
                </option>
              ))
            ) : (
              <>
                <option value="Karnataka">Karnataka</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Telangana">Telangana</option>
              </>
            )}
          </select>
        </div>

        {/* District */}
        <div>
          <label htmlFor="manual-loc-district" className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 block mb-1">
            {language === 'kn' ? 'ಜಿಲ್ಲೆ' : 'District'}
          </label>
          <select
            id="manual-loc-district"
            value={selectedDistrict}
            onChange={(e) => handleDistrictChange(e.target.value)}
            className="w-full min-h-[44px] px-3 py-2 text-xs font-medium border border-gray-200 rounded-xl focus:ring-2 focus:ring-forest bg-gray-50/50"
          >
            {districtsList.map((d: any) => (
              <option key={d.name} value={d.name}>
                {language === 'kn' && d.nameKannada ? `${d.nameKannada} (${d.name})` : d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Taluk */}
        <div>
          <label htmlFor="manual-loc-taluk" className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 block mb-1">
            {language === 'kn' ? 'ತಾಲೂಕು' : 'Taluk'}
          </label>
          <select
            id="manual-loc-taluk"
            value={selectedTaluk}
            onChange={(e) => setSelectedTaluk(e.target.value)}
            className="w-full min-h-[44px] px-3 py-2 text-xs font-medium border border-gray-200 rounded-xl focus:ring-2 focus:ring-forest bg-gray-50/50"
          >
            {taluksList.map((t: any) => (
              <option key={t.name} value={t.name}>
                {language === 'kn' && t.nameKannada ? `${t.nameKannada} (${t.name})` : t.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
