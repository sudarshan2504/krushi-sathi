export interface WeatherDay {
  date: string;
  dayName: string;
  weatherCode: number;
  condition: string;
  icon: string;
  tempMax: number;
  tempMin: number;
  rainChance: number;
  precipitationMm: number;
}

export interface WeatherData {
  location: string;
  state: string;
  district: string;
  latitude: number;
  longitude: number;
  temperature: number;
  condition: string;
  weatherCode: number;
  icon: string;
  humidity: number;
  windSpeedKmH: number;
  rainfallProbability: number;
  expectedPrecipitationMm: number;
  weekRange: string;
  nextWeekRange: string;
  nextWeekSummary: string;
  forecast7Days: WeatherDay[];
  forecast8To14Days: WeatherDay[];
  fiveDayRainProbability?: number[];
  farmingAlert: string;
  farmingAlertKn: string;
  farmingAlertTa: string;
  farmingAlertTe: string;
  lastUpdated: string;
  isDemoFallback: boolean;
  dataSource: string;
  agroZone?: string;
  agroZoneCode?: string;
  agroZoneDescription?: string;
  typicalSoils?: string[];
  taluk?: string;
  seasonInfo?: any;
  isStale?: boolean;
}

// Map WMO codes to human labels and friendly icons
function interpretWmoCode(code: number): { condition: string; icon: string } {
  if (code === 0) return { condition: 'Clear Sky', icon: 'sun' };
  if (code === 1 || code === 2) return { condition: 'Partly Cloudy', icon: 'cloud-sun' };
  if (code === 3) return { condition: 'Overcast', icon: 'cloud' };
  if (code === 45 || code === 48) return { condition: 'Foggy / Dew', icon: 'cloud-fog' };
  if (code >= 51 && code <= 55) return { condition: 'Light Drizzle', icon: 'cloud-drizzle' };
  if (code >= 61 && code <= 65) return { condition: 'Rain Showers', icon: 'cloud-rain' };
  if (code >= 80 && code <= 82) return { condition: 'Heavy Rain', icon: 'cloud-lightning-rain' };
  if (code >= 95) return { condition: 'Thunderstorm', icon: 'cloud-lightning' };
  return { condition: 'Partly Cloudy', icon: 'cloud-sun' };
}

export const DISTRICT_COORDINATES: Record<string, { lat: number; lon: number; state: string }> = {
  'Mandya': { lat: 12.524, lon: 76.896, state: 'Karnataka' },
  'Bengaluru': { lat: 12.971, lon: 77.594, state: 'Karnataka' },
  'Dharwad': { lat: 15.458, lon: 75.007, state: 'Karnataka' },
  'Belagavi': { lat: 15.849, lon: 74.497, state: 'Karnataka' },
  'Shivamogga': { lat: 13.929, lon: 75.568, state: 'Karnataka' },
  'Mysuru': { lat: 12.295, lon: 76.639, state: 'Karnataka' },
  'Hassan': { lat: 13.007, lon: 76.096, state: 'Karnataka' },
  'Coimbatore': { lat: 11.016, lon: 76.955, state: 'Tamil Nadu' },
  'Thanjavur': { lat: 10.786, lon: 79.137, state: 'Tamil Nadu' },
  'Madurai': { lat: 9.925, lon: 78.119, state: 'Tamil Nadu' },
  'Guntur': { lat: 16.306, lon: 80.436, state: 'Andhra Pradesh' },
  'Kurnool': { lat: 15.828, lon: 78.037, state: 'Andhra Pradesh' },
  'Warangal': { lat: 17.968, lon: 79.594, state: 'Telangana' },
  'Pune': { lat: 18.520, lon: 73.856, state: 'Maharashtra' },
};

import { getLocationConditions } from './seasonService';
import { findLocationByName } from '../data/indiaLocations';

export interface ReverseGeocodeResult {
  location: string;
  villageOrTown?: string;
  district?: string;
  state?: string;
  country?: string;
  lat: number;
  lon: number;
}

const REVERSE_GEOCODE_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const reverseGeocodeCache = new Map<string, { data: ReverseGeocodeResult; timestamp: number }>();
const forwardGeocodeCache = new Map<string, { data: ReverseGeocodeResult; timestamp: number }>();

let lastNominatimTimestamp = 0;
const NOMINATIM_MIN_INTERVAL_MS = 1100; // 1.1s spacing to respect Nominatim 1 req/sec policy

async function throttleNominatim(): Promise<void> {
  const elapsed = Date.now() - lastNominatimTimestamp;
  if (elapsed < NOMINATIM_MIN_INTERVAL_MS) {
    await new Promise((resolve) => setTimeout(resolve, NOMINATIM_MIN_INTERVAL_MS - elapsed));
  }
  lastNominatimTimestamp = Date.now();
}

function cleanAreaName(name: string): string {
  if (!name) return '';
  return name
    .replace(/\s+(District|taluk|Taluk|Urban|urban|Rural|rural)$/i, '')
    .trim();
}

function dedupJoin(primary?: string, secondary?: string): string {
  const p = (primary || '').trim();
  const s = (secondary || '').trim();
  if (p && s) {
    if (p.toLowerCase() === s.toLowerCase()) return p;
    return `${p}, ${s}`;
  }
  return p || s || '';
}

export function formatReverseGeocodeLocation(addr: any, fallback: string): {
  location: string;
  villageOrTown?: string;
  district?: string;
  state?: string;
  country?: string;
} {
  const village = addr.village || addr.hamlet || '';
  const taluk = addr.county || addr.subdistrict || '';
  const townOrCity = addr.town || addr.city || addr.municipality || addr.suburb || '';
  const rawDistrict = addr.state_district || addr.district || '';
  const state = (addr.state || addr.region || addr.province || '').trim();
  const country = (addr.country || '').trim();

  const cleanDistrict = cleanAreaName(rawDistrict);
  const cleanTaluk = cleanAreaName(taluk);
  const cleanTown = cleanAreaName(townOrCity);
  const cleanVillage = cleanAreaName(village);

  let formattedLocation = '';

  // 1. If village is present -> "Village, District" (or "Village, State" if same/absent)
  if (cleanVillage) {
    const districtOrTaluk = cleanDistrict || cleanTaluk;
    if (districtOrTaluk && districtOrTaluk.toLowerCase() !== cleanVillage.toLowerCase()) {
      formattedLocation = `${cleanVillage}, ${districtOrTaluk}`;
    } else if (state) {
      formattedLocation = dedupJoin(cleanVillage, state);
    } else {
      formattedLocation = cleanVillage;
    }
  } else {
    // 2. Otherwise -> "<place>, <state>" (e.g. "Mysuru, Karnataka"), never repeating identical names
    const place = cleanTown || cleanDistrict || cleanTaluk;
    if (place) {
      formattedLocation = state ? dedupJoin(place, state) : country ? dedupJoin(place, country) : place;
    } else if (state) {
      formattedLocation = country ? dedupJoin(state, country) : state;
    } else if (addr.name) {
      const cleanAddrName = cleanAreaName(addr.name);
      formattedLocation = dedupJoin(cleanAddrName, state || country);
    } else {
      formattedLocation = fallback;
    }
  }

  return {
    location: formattedLocation || fallback,
    villageOrTown: village || townOrCity || undefined,
    district: cleanDistrict || cleanTaluk || cleanTown || undefined,
    state: state || undefined,
    country: country || undefined,
  };
}

/**
 * Reverse geocodes coordinates to a human-readable location label
 * format: "<place>, <state>" (e.g. "Mysuru, Karnataka") or "Village, District"
 * If reverse geocode fails, returns "Your location (lat, lon)" instead of a wrong district name.
 */
export async function reverseGeocodeCoords(lat: number, lon: number): Promise<ReverseGeocodeResult> {
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    const err: any = new Error('Coordinates out of geographical bounds');
    err.status = 400;
    throw err;
  }

  const roundedLat = Math.round(lat * 1000) / 1000;
  const roundedLon = Math.round(lon * 1000) / 1000;
  const cacheKey = `${roundedLat.toFixed(3)},${roundedLon.toFixed(3)}`;

  const cached = reverseGeocodeCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < REVERSE_GEOCODE_CACHE_TTL_MS) {
    return cached.data;
  }

  const coordFallback = `Your location (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`;

  try {
    await throttleNominatim();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000); // 6s timeout

    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=14&addressdetails=1`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'KrushiSathiApp/2.0 (contact: support@krushisathi.in; agricultural advisory)',
        'Accept': 'application/json',
        'Accept-Language': 'en',
      },
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = (await res.json()) as any;
      const addr = data?.address || {};
      const hasAddressFields = Object.keys(addr).length > 0;
      if (hasAddressFields) {
        const formatted = formatReverseGeocodeLocation(addr, coordFallback);

        const result: ReverseGeocodeResult = {
          location: formatted.location,
          villageOrTown: formatted.villageOrTown,
          district: formatted.district,
          state: formatted.state,
          country: formatted.country,
          lat,
          lon,
        };

        if (formatted.location !== coordFallback) {
          reverseGeocodeCache.set(cacheKey, { data: result, timestamp: Date.now() });
        }
        return result;
      }
    }
  } catch (err) {
    console.warn(`[WeatherService] Reverse geocode lookup failed for (${lat}, ${lon}):`, (err as any)?.message || err);
  }

  // Never substitute Mandya or another city if reverse-geocoding fails
  return {
    location: coordFallback,
    lat,
    lon,
  };
}

/**
 * Forward geocodes an arbitrary Indian place/district via Nominatim with 24h cache.
 * Returns null if unreachable or unknown (never substitutes Mandya/Karnataka).
 */
async function forwardGeocodePlace(queryName: string): Promise<ReverseGeocodeResult | null> {
  const key = queryName.trim().toLowerCase();
  if (!key) return null;

  const cached = forwardGeocodeCache.get(key);
  if (cached && Date.now() - cached.timestamp < REVERSE_GEOCODE_CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    await throttleNominatim();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(queryName)}&countrycodes=in&format=jsonv2&limit=1&addressdetails=1`;

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'KrushiSathiApp/2.0 (contact: support@krushisathi.in; agricultural advisory)',
        'Accept': 'application/json',
        'Accept-Language': 'en',
      },
    });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const items = (await res.json()) as any[];
    if (!Array.isArray(items) || items.length === 0) return null;

    const best = items[0];
    const lat = parseFloat(best.lat);
    const lon = parseFloat(best.lon);
    if (isNaN(lat) || isNaN(lon)) return null;

    const addr = best.address || {};
    const formatted = formatReverseGeocodeLocation(
      { ...addr, name: addr.name || best.name || queryName },
      queryName.trim()
    );

    const result: ReverseGeocodeResult = {
      location: formatted.location,
      villageOrTown: formatted.villageOrTown,
      district: formatted.district || queryName.trim(),
      state: formatted.state || '',
      country: formatted.country || 'India',
      lat,
      lon,
    };
    forwardGeocodeCache.set(key, { data: result, timestamp: Date.now() });
    return result;
  } catch (err) {
    console.warn(`[WeatherService] Forward geocode lookup failed for "${queryName}":`, (err as any)?.message || err);
    return null;
  }
}

interface WeatherCacheEntry {
  data: WeatherData;
  timestamp: number;
}

const WEATHER_CACHE_TTL_MS = 20 * 60 * 1000; // 20 minutes
const MAX_WEATHER_CACHE_SIZE = 100;
const weatherMemoryCache = new Map<string, WeatherCacheEntry>();
const inFlightWeatherRequests = new Map<string, Promise<WeatherData>>();

export async function fetchWeatherData(
  districtName?: string,
  customLat?: number,
  customLon?: number,
  allowDemoFallback = false
): Promise<WeatherData> {
  let lat = customLat;
  let lon = customLon;
  let state = '';
  let district = (districtName || '').trim();
  let locationLabel = '';

  if (lat !== undefined && lon !== undefined) {
    // When lat/lon are given, use them directly and never substitute Mandya or default to Karnataka!
    const geocoded = await reverseGeocodeCoords(lat, lon);
    locationLabel = geocoded.location;
    district = geocoded.district || geocoded.villageOrTown || '';
    state = geocoded.state || '';
  } else {
    // Fall back to district name lookup
    if (!district) {
      const err: any = new Error('Farm location is missing. Please set your farm location (district or GPS) to load weather.');
      err.status = 400;
      throw err;
    }

    const locByName = findLocationByName(undefined, district);
    const matchedCoordKey = Object.keys(DISTRICT_COORDINATES).find(
      (k) => k.toLowerCase() === district.toLowerCase()
    );

    if (locByName) {
      lat = locByName.latitude;
      lon = locByName.longitude;
      state = locByName.state;
      district = locByName.district;
      locationLabel = dedupJoin(district, state);
    } else if (matchedCoordKey) {
      const coord = DISTRICT_COORDINATES[matchedCoordKey];
      lat = coord.lat;
      lon = coord.lon;
      state = coord.state;
      district = matchedCoordKey;
      locationLabel = dedupJoin(district, state);
    } else {
      // Unknown district not in built-in table -> try forward geocoding without Karnataka/Mandya substitution
      const geocodedPlace = await forwardGeocodePlace(district);
      if (geocodedPlace) {
        lat = geocodedPlace.lat;
        lon = geocodedPlace.lon;
        state = geocodedPlace.state || '';
        district = geocodedPlace.district || district;
        locationLabel = geocodedPlace.location;
      } else {
        const err: any = new Error(
          `Unable to resolve location "${district}". Please select a district from the list or use device location.`
        );
        err.status = 404;
        throw err;
      }
    }
  }

  const finalLat = lat;
  const finalLon = lon;
  const effectiveLocation =
    locationLabel ||
    (district ? dedupJoin(district, state) : `Your location (${finalLat.toFixed(2)}°, ${finalLon.toFixed(2)}°)`);

  const roundedLat = Math.round(finalLat * 100) / 100;
  const roundedLon = Math.round(finalLon * 100) / 100;
  const cacheKey = `${roundedLat.toFixed(2)},${roundedLon.toFixed(2)}`;

  const cached = weatherMemoryCache.get(cacheKey);
  const now = Date.now();
  if (cached && now - cached.timestamp < WEATHER_CACHE_TTL_MS) {
    return {
      ...cached.data,
      location: effectiveLocation,
      state: state || cached.data.state,
      district: district || cached.data.district,
      latitude: finalLat,
      longitude: finalLon,
    };
  }

  // Deduplicate in-flight requests
  const existingInFlight = inFlightWeatherRequests.get(cacheKey);
  if (existingInFlight) {
    return existingInFlight;
  }

  const fetchPromise = (async () => {
    try {
      const { location, season } = getLocationConditions(finalLat, finalLon, state || undefined, district || undefined);
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${finalLat}&longitude=${finalLon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum&timezone=auto&forecast_days=14`;

      // 8s timeout with 1 retry
      let data: any = null;
      let lastFetchErr: any = null;

      for (let attempt = 0; attempt <= 1; attempt++) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        try {
          const res = await fetch(url, { signal: controller.signal });
          clearTimeout(timeout);
          if (!res.ok) {
            throw new Error(`Open-Meteo HTTP ${res.status}`);
          }
          data = await res.json();
          break; // Succeeded!
        } catch (fetchErr) {
          clearTimeout(timeout);
          lastFetchErr = fetchErr;
          if (attempt === 0) {
            await new Promise((r) => setTimeout(r, 600)); // Delay 600ms before retry
          }
        }
      }

      if (!data) {
        throw lastFetchErr || new Error('Weather API request failed after retry');
      }

      const current = data.current;
      const daily = data.daily;

      const { condition, icon } = interpretWmoCode(current.weather_code);
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

      const allDays: WeatherDay[] = daily.time.map((t: string, idx: number) => {
        const d = new Date(t);
        const code = daily.weather_code[idx] || 0;
        const { condition: dayCond, icon: dayIcon } = interpretWmoCode(code);
        return {
          date: t,
          dayName: idx === 0 ? 'Today' : dayNames[d.getDay()],
          weatherCode: code,
          condition: dayCond,
          icon: dayIcon,
          tempMax: Math.round(daily.temperature_2m_max[idx] || 30),
          tempMin: Math.round(daily.temperature_2m_min[idx] || 22),
          rainChance: Math.round(daily.precipitation_probability_max[idx] || 0),
          precipitationMm: parseFloat((daily.precipitation_sum[idx] || 0).toFixed(1)),
        };
      });

      const forecast7Days = allDays.slice(0, 7);
      const forecast8To14Days = allDays.slice(7, 14);

      const minT = Math.min(...forecast7Days.map((d) => d.tempMin));
      const maxT = Math.max(...forecast7Days.map((d) => d.tempMax));
      const nextMinT = Math.min(...forecast8To14Days.map((d) => d.tempMin));
      const nextMaxT = Math.max(...forecast8To14Days.map((d) => d.tempMax));

      // Determine upcoming rain advisory
      const rainyDay = forecast7Days.find((d) => d.rainChance >= 45);
      let farmingAlert = 'Weather is favorable for standard field operations and weeding.';
      let farmingAlertKn = 'ಸಾಮಾನ್ಯ ಕೃಷಿ ಕೆಲಸಗಳಿಗೆ ಮತ್ತು ಕಳೆ ತೆಗೆಯಲು ಹವಾಮಾನ ಅನುಕೂಲಕರವಾಗಿದೆ.';
      let farmingAlertTa = 'நில உழவு மற்றும் களை எடுப்பதற்கு வானிலை சாதகமாக உள்ளது.';
      let farmingAlertTe = 'పొలం పనులకు మరియు కలుపు తీతకు వాతావరణం అనుకూలంగా ఉంది.';

      if (rainyDay) {
        farmingAlert = `Rain expected on ${rainyDay.dayName} (${rainyDay.rainChance}% chance). Consider completing field spraying before rain.`;
        farmingAlertKn = `${rainyDay.dayName} ರಂದು ಮಳೆ ನಿರೀಕ್ಷಿಸಲಾಗಿದೆ (${rainyDay.rainChance}% ಸಂಭವ). ಮಳೆ ಬರುವ ಮುನ್ನ ಸಿಂಪಡಣೆ ಕಾರ್ಯ ಮುಗಿಸಿ.`;
        farmingAlertTa = `${rainyDay.dayName} அன்று மழை பெய்ய வாய்ப்புள்ளது (${rainyDay.rainChance}%). மழைக்கு முன் தெளிப்பு பணிகளை முடிக்கவும்.`;
        farmingAlertTe = `${rainyDay.dayName} నాడు వర్షం పడే అవకాశం ఉంది (${rainyDay.rainChance}%). వర్షానికి ముందే మందుల పిచಿಕారీ పూర్తి చేయండి.`;
      }

      const liveResult: WeatherData = {
        location: effectiveLocation,
        state: state || (location?.state || ''),
        district: district || (location?.district || ''),
        latitude: finalLat,
        longitude: finalLon,
        temperature: Math.round(current.temperature_2m),
        condition,
        weatherCode: current.weather_code,
        icon,
        humidity: Math.round(current.relative_humidity_2m),
        windSpeedKmH: Math.round(current.wind_speed_10m),
        rainfallProbability: forecast7Days[0]?.rainChance || 0,
        expectedPrecipitationMm: forecast7Days[0]?.precipitationMm || 0,
        weekRange: `${minT}° - ${maxT}°`,
        nextWeekRange: `${nextMinT}° - ${nextMaxT}°`,
        nextWeekSummary: forecast8To14Days.some((d) => d.rainChance > 40) ? 'Light Rain' : 'Partly Cloudy',
        forecast7Days,
        forecast8To14Days,
        fiveDayRainProbability: forecast7Days.slice(0, 5).map((d) => d.rainChance),
        farmingAlert,
        farmingAlertKn,
        farmingAlertTa,
        farmingAlertTe,
        lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isDemoFallback: false,
        dataSource: 'Live Open-Meteo API',
        agroZone: location?.agroZone,
        agroZoneCode: location?.agroZoneCode,
        agroZoneDescription: location?.agroZoneDescription,
        typicalSoils: location?.typicalSoils,
        taluk: location?.taluk,
        seasonInfo: season || undefined,
      };

      // Cache live result
      weatherMemoryCache.set(cacheKey, { data: liveResult, timestamp: Date.now() });
      if (weatherMemoryCache.size > MAX_WEATHER_CACHE_SIZE) {
        const oldestKey = weatherMemoryCache.keys().next().value;
        if (oldestKey) weatherMemoryCache.delete(oldestKey);
      }

      return liveResult;
    } catch (err: any) {
      // If live call fails or times out:
      // 1. Return the last cached real result (with isStale: true)
      const staleCached = weatherMemoryCache.get(cacheKey);
      if (staleCached) {
        return {
          ...staleCached.data,
          isStale: true,
          dataSource: `${staleCached.data.dataSource} (Cached, Offline)`,
        };
      }

      // 2. If allowDemoFallback is explicitly enabled
      if (allowDemoFallback) {
        return getDemoFallbackWeather(
          district || 'Your Location',
          state || '',
          finalLat,
          finalLon,
          locationLabel
        );
      }

      // 3. Otherwise throw so client can display clear error and retry button
      throw new Error(
        err?.message ? `Weather unavailable: ${err.message}` : 'Weather service temporarily unavailable. Please retry.'
      );
    } finally {
      inFlightWeatherRequests.delete(cacheKey);
    }
  })();

  inFlightWeatherRequests.set(cacheKey, fetchPromise);
  return fetchPromise;
}

export function getDemoFallbackWeather(
  district: string,
  state: string,
  lat: number,
  lon: number,
  customLocationLabel?: string
): WeatherData {
  const today = new Date();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const sampleDays: WeatherDay[] = Array.from({ length: 7 }, (_, idx) => {
    const d = new Date(today);
    d.setDate(today.getDate() + idx);
    const dateStr = d.toISOString().split('T')[0];
    const isToday = idx === 0;
    const dayName = isToday ? 'Today' : dayNames[d.getDay()];

    const sampleWeather = [
      { code: 2, condition: 'Partly Cloudy', icon: 'cloud-sun', max: 28, min: 21, rain: 35, mm: 0.5 },
      { code: 1, condition: 'Mainly Sunny', icon: 'sun', max: 29, min: 20, rain: 15, mm: 0.0 },
      { code: 2, condition: 'Partly Cloudy', icon: 'cloud-sun', max: 28, min: 21, rain: 25, mm: 0.2 },
      { code: 3, condition: 'Overcast', icon: 'cloud', max: 27, min: 22, rain: 40, mm: 1.2 },
      { code: 61, condition: 'Light Rain', icon: 'cloud-rain', max: 26, min: 21, rain: 65, mm: 8.4 },
      { code: 95, condition: 'Thunderstorm', icon: 'cloud-lightning', max: 25, min: 20, rain: 70, mm: 14.2 },
      { code: 2, condition: 'Clearing Sky', icon: 'cloud-sun', max: 28, min: 21, rain: 20, mm: 0.1 },
    ][idx % 7];

    return {
      date: dateStr,
      dayName,
      weatherCode: sampleWeather.code,
      condition: sampleWeather.condition,
      icon: sampleWeather.icon,
      tempMax: sampleWeather.max,
      tempMin: sampleWeather.min,
      rainChance: sampleWeather.rain,
      precipitationMm: sampleWeather.mm,
    };
  });

  const sampleNextWeek: WeatherDay[] = Array.from({ length: 7 }, (_, idx) => {
    const d = new Date(today);
    d.setDate(today.getDate() + 7 + idx);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = dayNames[d.getDay()];

    return {
      date: dateStr,
      dayName,
      weatherCode: 1,
      condition: 'Mainly Sunny',
      icon: 'sun',
      tempMax: 30,
      tempMin: 22,
      rainChance: 15,
      precipitationMm: 0.0,
    };
  });

  const locationTitle =
    customLocationLabel ||
    (district ? dedupJoin(district, state) : `Your location (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`);

  const rainySampleDay = sampleDays.find((d) => d.rainChance >= 45) || sampleDays[4];
  const rainyLabel = rainySampleDay?.dayName || 'this week';

  return {
    location: locationTitle,
    state,
    district,
    latitude: lat,
    longitude: lon,
    temperature: 28,
    condition: 'Partly Cloudy',
    weatherCode: 2,
    icon: 'cloud-sun',
    humidity: 68,
    windSpeedKmH: 14,
    rainfallProbability: 40,
    expectedPrecipitationMm: 1.5,
    weekRange: '25° - 31°',
    nextWeekRange: '22° - 30°',
    nextWeekSummary: 'Light Rain',
    forecast7Days: sampleDays,
    forecast8To14Days: sampleNextWeek,
    fiveDayRainProbability: sampleDays.slice(0, 5).map((d) => d.rainChance),
    farmingAlert: `Rain expected on ${rainyLabel} (${rainySampleDay?.rainChance ?? 65}% chance). Consider completing field spraying and harvesting before rain.`,
    farmingAlertKn: `${rainyLabel} ರಂದು ಮಳೆ ನಿರೀಕ್ಷಿಸಲಾಗಿದೆ (${rainySampleDay?.rainChance ?? 65}% ಸಂಭವ). ಮಳೆ ಬರುವ ಮುನ್ನ ಸಿಂಪಡಣೆ ಕಾರ್ಯ ಪೂರ್ಣಗೊಳಿಸಿ.`,
    farmingAlertTa: `${rainyLabel} அன்று மழை வாய்ப்பு (${rainySampleDay?.rainChance ?? 65}%). மழைக்கு முன் தெளிப்பு பணிகளை முடிக்கவும்.`,
    farmingAlertTe: `${rainyLabel} నాడు వర్ష సూచన (${rainySampleDay?.rainChance ?? 65}%). వర్షానికి ముందే పిచికారీ పనులు పూర్తి చేయండి.`,
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isDemoFallback: true,
    dataSource: 'Sample Data (Offline Simulation)',
    agroZone: 'Local Agricultural Zone',
    agroZoneCode: 'LOCAL',
    agroZoneDescription: 'Offline weather sample simulation matching your selected coordinates.',
    typicalSoils: ['red', 'loamy', 'black'],
    taluk: '',
  };
}
