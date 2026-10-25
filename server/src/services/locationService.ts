import { config } from '../config';

export interface GeocodedLocation {
  village?: string;
  town?: string;
  taluk?: string;
  district?: string;
  state?: string;
  country?: string;
  formattedAddress?: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  source: 'gps' | 'ip' | 'manual';
  isApproximate?: boolean;
}

// In-memory cache by rounded coordinates (~100m precision) with 24h TTL
interface CacheEntry {
  data: GeocodedLocation;
  timestamp: number;
}
const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

function getCacheKey(lat: number, lon: number): string {
  return `${lat.toFixed(3)},${lon.toFixed(3)}`;
}

/**
 * Reverse geocode using Google Geocoding API
 */
async function geocodeWithGoogle(lat: number, lon: number): Promise<GeocodedLocation | null> {
  const apiKey = process.env.GOOGLE_GEOCODING_API_KEY || process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
    return null;
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${apiKey}&language=en`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const json = await res.json();
    if (json.status !== 'OK' || !json.results || json.results.length === 0) {
      return null;
    }

    let village = '';
    let town = '';
    let taluk = '';
    let district = '';
    let state = '';
    let country = '';

    for (const result of json.results) {
      for (const comp of result.address_components) {
        const types: string[] = comp.types;
        if (!village && (types.includes('sublocality_level_1') || types.includes('sublocality') || types.includes('neighborhood'))) {
          village = comp.long_name;
        }
        if (!town && (types.includes('locality') || types.includes('postal_town'))) {
          town = comp.long_name;
        }
        if (!taluk && (types.includes('administrative_area_level_3') || types.includes('sublocality_level_2'))) {
          taluk = comp.long_name;
        }
        if (!district && types.includes('administrative_area_level_2')) {
          district = comp.long_name;
        }
        if (!state && types.includes('administrative_area_level_1')) {
          state = comp.long_name;
        }
        if (!country && types.includes('country')) {
          country = comp.long_name;
        }
      }
    }

    return {
      village: village || town,
      town,
      taluk: taluk || town,
      district,
      state,
      country,
      formattedAddress: json.results[0].formatted_address,
      latitude: lat,
      longitude: lon,
      source: 'gps',
      isApproximate: false,
    };
  } catch (err) {
    // Fail gracefully to Nominatim
    return null;
  }
}

// Rate-limiting timestamp for Nominatim (1 request per second requirement)
let lastNominatimCallTime = 0;

/**
 * Reverse geocode using OpenStreetMap Nominatim with rate limiting & timeout
 */
async function geocodeWithNominatim(lat: number, lon: number): Promise<GeocodedLocation | null> {
  const now = Date.now();
  const waitMs = Math.max(0, 1050 - (now - lastNominatimCallTime));
  if (waitMs > 0) {
    await new Promise(r => setTimeout(r, waitMs));
  }
  lastNominatimCallTime = Date.now();

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1&zoom=14`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'KrushiSathiApp/1.0 (sudarshan.farming.assistant@gmail.com)',
        'Accept-Language': 'en',
      },
    });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const json = await res.json();
    const address = json.address || {};

    const village = address.village || address.hamlet || address.suburb || address.neighbourhood || address.residential || '';
    const town = address.town || address.city || address.municipality || '';
    const taluk = address.county || address.subdistrict || address.state_district || '';
    // Strip "District" word if present e.g. "Mysuru District" -> "Mysuru"
    let district = (address.state_district || address.district || address.county || '').replace(/\s+district$/i, '').trim();
    const state = address.state || '';
    const country = address.country || '';

    return {
      village: village || town,
      town,
      taluk: taluk || town,
      district,
      state,
      country,
      formattedAddress: json.display_name,
      latitude: lat,
      longitude: lon,
      source: 'gps',
      isApproximate: false,
    };
  } catch (err) {
    return null;
  }
}

/**
 * Main reverse geocoding function with caching and fallback
 */
export async function reverseGeocode(lat: number, lon: number, accuracy?: number): Promise<GeocodedLocation> {
  // Check bounds
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    throw new Error('Coordinates are outside valid geographical bounds');
  }

  // Check cache
  const cacheKey = getCacheKey(lat, lon);
  const cached = cache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    return { ...cached.data, accuracy, source: 'gps' };
  }

  // 1. Try Google Geocoding first if available
  let result = await geocodeWithGoogle(lat, lon);

  // 2. Fallback to Nominatim
  if (!result) {
    result = await geocodeWithNominatim(lat, lon);
  }

  if (!result || (!result.state && !result.district)) {
    // If reverse geocoding didn't resolve state/district, check if coordinates match known regional centers in India
    result = {
      village: result?.village || '',
      town: result?.town || '',
      taluk: result?.taluk || '',
      district: result?.district || '',
      state: result?.state || '',
      country: result?.country || 'India',
      formattedAddress: result?.formattedAddress,
      latitude: lat,
      longitude: lon,
      accuracy,
      source: 'gps',
      isApproximate: false,
    };
  } else {
    result.accuracy = accuracy;
    cache.set(cacheKey, { data: result, timestamp: Date.now() });
  }

  return result;
}

/**
 * Approximate IP-based location fallback
 */
export async function getLocationFromIp(clientIp?: string): Promise<GeocodedLocation | null> {
  // Avoid querying local/private loopback IPs
  const isPrivate = !clientIp || 
    clientIp === '127.0.0.1' || 
    clientIp === '::1' || 
    clientIp.startsWith('192.168.') || 
    clientIp.startsWith('10.') || 
    clientIp.startsWith('172.');

  const targetIpParam = isPrivate ? '' : clientIp;

  // 1. Try ipapi.co
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const url = targetIpParam ? `https://ipapi.co/${targetIpParam}/json/` : 'https://ipapi.co/json/';
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'KrushiSathi-FarmingAssistant/1.0' },
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data && data.latitude && data.longitude) {
        return {
          village: data.city || '',
          town: data.city || '',
          district: data.city || data.region || '',
          state: data.region || '',
          country: data.country_name || 'India',
          latitude: Number(data.latitude),
          longitude: Number(data.longitude),
          source: 'ip',
          isApproximate: true,
        };
      }
    }
  } catch {
    // Fall through to second IP provider
  }

  // 2. Try ip-api.com fallback
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const url = targetIpParam ? `http://ip-api.com/json/${targetIpParam}` : 'http://ip-api.com/json/';
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data && data.status === 'success' && data.lat && data.lon) {
        return {
          village: data.city || '',
          town: data.city || '',
          district: data.city || data.regionName || '',
          state: data.regionName || '',
          country: data.country || 'India',
          latitude: Number(data.lat),
          longitude: Number(data.lon),
          source: 'ip',
          isApproximate: true,
        };
      }
    }
  } catch {
    // Return null if all IP lookups fail
  }

  return null;
}
