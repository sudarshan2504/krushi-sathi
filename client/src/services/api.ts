import { User, WeatherData, RecommendationResult, CropPlan, Disease, ChatMessage } from '../types';

export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('krishi_api_base');
    if (stored) return stored.replace(/\/$/, '');
  }
  const envUrl = (import.meta as any).env?.VITE_API_BASE_URL;
  if (envUrl) return envUrl.replace(/\/$/, '');
  return '/api';
}

export const API_BASE = getApiBaseUrl();

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('krishi_sathi_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

interface CacheEntry<T> {
  timestamp: number;
  data: T;
}

const MEMORY_CACHE = new Map<string, CacheEntry<any>>();

export function getCachedData<T>(key: string, maxAgeMs = 30 * 60 * 1000): T | null {
  try {
    const mem = MEMORY_CACHE.get(key);
    if (mem && (Date.now() - mem.timestamp < maxAgeMs || !navigator.onLine)) {
      return mem.data as T;
    }
    const raw = localStorage.getItem(`ks_cache_${key}`);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() - entry.timestamp < maxAgeMs || !navigator.onLine) {
      MEMORY_CACHE.set(key, entry);
      return entry.data;
    }
  } catch {
    // ignore cache parsing error
  }
  return null;
}

export function setCachedData<T>(key: string, data: T): void {
  try {
    const entry: CacheEntry<T> = { timestamp: Date.now(), data };
    MEMORY_CACHE.set(key, entry);
    localStorage.setItem(`ks_cache_${key}`, JSON.stringify(entry));
  } catch {
    // ignore storage quota errors
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data.data;
}

export async function fetchWithRetry<T>(
  url: string,
  options: RequestInit = {},
  retries = 2,
  timeoutMs = 9000
): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  const isGet = method === 'GET';

  if (!navigator.onLine && !isGet) {
    throw new Error('You are currently offline. Please reconnect to the internet and try again.');
  }

  let lastError: any = null;
  const attempts = isGet ? retries + 1 : 1;

  for (let attempt = 0; attempt < attempts; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timer);
      return await handleResponse<T>(res);
    } catch (err: any) {
      clearTimeout(timer);
      lastError = err;
      if (err.name === 'AbortError') {
        lastError = new Error(`Network timeout: request exceeded ${timeoutMs / 1000}s.`);
      }
      // If server returned a 4xx or business error, do not retry
      if (err.message && (err.message.includes('status 4') || err.message.includes('Invalid') || err.message.includes('not found'))) {
        throw err;
      }
      if (attempt < attempts - 1) {
        // Exponential backoff
        await new Promise((r) => setTimeout(r, 400 * Math.pow(2, attempt)));
      }
    }
  }

  throw lastError;
}

export const api = {
  auth: {
    async sendOtp(phone: string) {
      const res = await fetch(`${API_BASE}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      return handleResponse<{ phone: string; isExistingUser: boolean; userName: string | null; demoOtpNote: string }>(res);
    },

    async verifyOtp(phone: string, otp: string) {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await handleResponse<{ token: string; user: User; isNewUser: boolean }>(res);
      if (data.token) {
        localStorage.setItem('krishi_sathi_token', data.token);
      }
      return data;
    },

    async firebaseLogin(idToken: string) {
      const res = await fetch(`${API_BASE}/auth/firebase-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ idToken }),
      });
      const data = await handleResponse<{ token: string; user: User; isNewUser: boolean }>(res);
      if (data.token) {
        localStorage.setItem('krishi_sathi_token', data.token);
      }
      return data;
    },

    async guestLogin(preferredPhone?: string, preferredName?: string) {
      const res = await fetch(`${API_BASE}/auth/guest-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ preferredPhone, preferredName }),
      });
      const data = await handleResponse<{ token: string; user: User; isNewUser: boolean }>(res);
      if (data.token) {
        localStorage.setItem('krishi_sathi_token', data.token);
      }
      return data;
    },

    async directLogin(phone: string, name?: string) {
      const res = await fetch(`${API_BASE}/auth/direct-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phone, name }),
      });
      const data = await handleResponse<{ token: string; user: User; isNewUser: boolean }>(res);
      if (data.token) {
        localStorage.setItem('krishi_sathi_token', data.token);
      }
      return data;
    },

    async register(formData: {
      name: string;
      phone: string;
      language: string;
      state: string;
      district: string;
      village?: string;
      taluk?: string;
      farmSize?: number;
      farmUnit?: string;
      latitude?: number | null;
      longitude?: number | null;
      locationAccuracy?: number | null;
      locationSource?: string;
    }) {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await handleResponse<{ token: string; user: User }>(res);
      if (data.token) {
        localStorage.setItem('krishi_sathi_token', data.token);
      }
      return data;
    },

    async getMe(): Promise<User> {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse<User>(res);
    },

    async updateProfile(data: Partial<User>): Promise<User> {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(data),
      });
      return handleResponse<User>(res);
    },

    async uploadAvatar(imageData: string): Promise<User> {
      const res = await fetch(`${API_BASE}/auth/avatar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ imageData }),
      });
      return handleResponse<User>(res);
    },

    async removeAvatar(): Promise<User> {
      const res = await fetch(`${API_BASE}/auth/avatar`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() },
      });
      return handleResponse<User>(res);
    },

    async logout() {
      localStorage.removeItem('krishi_sathi_token');
      try {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          credentials: 'include',
        });
      } catch {
        // ignore
      }
    },
  },

  weather: {
    async get(district?: string, lat?: number, lon?: number, allowDemo?: boolean): Promise<WeatherData> {
      const cacheKey = `weather_${district || 'gps'}_${lat !== undefined ? lat.toFixed(2) : 0}_${lon !== undefined ? lon.toFixed(2) : 0}`;
      const cached = getCachedData<WeatherData>(cacheKey, 20 * 60 * 1000); // 20 min freshness

      if (!navigator.onLine && cached) {
        return {
          ...cached,
          isStale: true,
          dataSource: `${cached.dataSource} (Offline Client Cache)`
        };
      }

      const params = new URLSearchParams();
      if (district) {
        params.append('district', district);
      }
      if (lat !== undefined && lon !== undefined) {
        params.append('lat', String(lat));
        params.append('lon', String(lon));
      }
      if (allowDemo) {
        params.append('demo', 'true');
      }

      try {
        const data = await fetchWithRetry<WeatherData>(`${API_BASE}/weather?${params.toString()}`, {}, 1, 8000);
        setCachedData(cacheKey, data);
        return data;
      } catch (err) {
        if (cached) {
          return {
            ...cached,
            isStale: true,
            dataSource: `${cached.dataSource} (Offline Client Cache)`
          };
        }
        throw err;
      }
    },

    async reverseGeocode(lat: number, lon: number): Promise<{
      location: string;
      villageOrTown?: string;
      district?: string;
      state?: string;
      country?: string;
      lat: number;
      lon: number;
    }> {
      return await fetchWithRetry(`${API_BASE}/weather/reverse?lat=${lat}&lon=${lon}`, {}, 1, 6000);
    },

    async getDistricts(): Promise<{ name: string; state: string; lat: number; lon: number }[]> {
      const cacheKey = 'weather_districts';
      const cached = getCachedData<{ name: string; state: string; lat: number; lon: number }[]>(cacheKey, 7 * 24 * 60 * 60 * 1000);
      if (cached && (!navigator.onLine || Math.random() > 0.1)) {
        return cached;
      }
      try {
        const data = await fetchWithRetry<{ name: string; state: string; lat: number; lon: number }[]>(`${API_BASE}/weather/districts`);
        setCachedData(cacheKey, data);
        return data;
      } catch (err) {
        if (cached) return cached;
        throw err;
      }
    },

    async getLocations(): Promise<any> {
      const cacheKey = 'weather_locations';
      const cached = getCachedData<any>(cacheKey, 7 * 24 * 60 * 60 * 1000);
      if (cached && (!navigator.onLine || Math.random() > 0.1)) {
        return cached;
      }
      try {
        const data = await fetchWithRetry<any>(`${API_BASE}/weather/locations`);
        setCachedData(cacheKey, data);
        return data;
      } catch (err) {
        if (cached) return cached;
        throw err;
      }
    },

    async getLocationConditions(params: {
      state?: string;
      district?: string;
      taluk?: string;
      lat?: number;
      lon?: number;
    }): Promise<any> {
      const q = new URLSearchParams(
        Object.entries(params)
          .filter(([_, v]) => v !== undefined && v !== null && v !== '')
          .map(([k, v]) => [k, String(v)])
      ).toString();
      const res = await fetch(`${API_BASE}/weather/location-conditions?${q}`);
      return handleResponse(res);
    },
  },

  season: {
    async detect(params: {
      state?: string;
      district?: string;
      taluk?: string;
      lat?: number;
      lon?: number;
    }): Promise<any> {
      const q = new URLSearchParams(
        Object.entries(params)
          .filter(([_, v]) => v !== undefined && v !== null && v !== '')
          .map(([k, v]) => [k, String(v)])
      ).toString();
      const res = await fetch(`${API_BASE}/season/detect?${q}`);
      return handleResponse(res);
    },

    async getVerificationList(): Promise<any> {
      const res = await fetch(`${API_BASE}/season/verification-list`);
      return handleResponse(res);
    },

    async getCropStatus(cropId: string, params?: { state?: string; district?: string }): Promise<any> {
      const q = params ? new URLSearchParams(
        Object.entries(params)
          .filter(([_, v]) => v !== undefined && v !== null && v !== '')
          .map(([k, v]) => [k, String(v)])
      ).toString() : '';
      const res = await fetch(`${API_BASE}/season/crop-status/${cropId}?${q}`);
      return handleResponse(res);
    },
  },

  soil: {
    async submitAssessment(data: any): Promise<{ assessment: any; recommendations: RecommendationResult[] }> {
      const res = await fetch(`${API_BASE}/soil/assessments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(data),
      });
      const result = await handleResponse<{ assessment: any; recommendations: RecommendationResult[] }>(res);
      setCachedData('last_soil_assessment', result);
      return result;
    },

    getLastCachedAssessment(): { assessment: any; recommendations: RecommendationResult[] } | null {
      return getCachedData('last_soil_assessment', 30 * 24 * 60 * 60 * 1000);
    },

    async getAssessments(): Promise<any[]> {
      const cacheKey = 'user_soil_assessments';
      const cached = getCachedData<any[]>(cacheKey, 24 * 60 * 60 * 1000);
      if (!navigator.onLine && cached) return cached;
      try {
        const res = await fetch(`${API_BASE}/soil/assessments`, {
          headers: { ...getAuthHeader() },
        });
        const data = await handleResponse<any[]>(res);
        setCachedData(cacheKey, data);
        return data;
      } catch (err) {
        if (cached) return cached;
        throw err;
      }
    },

    async getAssessment(id: string): Promise<any> {
      const cacheKey = `soil_assessment_${id}`;
      const cached = getCachedData<any>(cacheKey, 7 * 24 * 60 * 60 * 1000);
      if (!navigator.onLine && cached) return cached;
      try {
        const res = await fetch(`${API_BASE}/soil/assessments/${id}`, {
          headers: { ...getAuthHeader() },
        });
        const data = await handleResponse(res);
        setCachedData(cacheKey, data);
        return data;
      } catch (err) {
        if (cached) return cached;
        throw err;
      }
    },
  },

  crops: {
    async getAll(params?: {
      category?: string;
      search?: string;
      durationType?: string;
      season?: string;
      isSeasonalFruit?: boolean;
      isLongTerm?: boolean;
    }): Promise<any[]> {
      const cleanedParams: Record<string, string> = {};
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== '') {
            cleanedParams[k] = String(v);
          }
        });
      }
      const q = new URLSearchParams(cleanedParams).toString();
      const cacheKey = `crops_all_${q}`;
      const cached = getCachedData<any[]>(cacheKey, 24 * 60 * 60 * 1000);
      if (!navigator.onLine && cached) return cached;

      try {
        const data = await fetchWithRetry<any[]>(`${API_BASE}/crops?${q}`, {}, 2, 8000);
        setCachedData(cacheKey, data);
        return data;
      } catch (err) {
        if (cached) return cached;
        throw err;
      }
    },

    async getById(id: string): Promise<any> {
      const cacheKey = `crop_detail_${id}`;
      const cached = getCachedData<any>(cacheKey, 7 * 24 * 60 * 60 * 1000);
      if (!navigator.onLine && cached) return cached;
      try {
        const data = await fetchWithRetry<any>(`${API_BASE}/crops/${id}`, {}, 2, 8000);
        setCachedData(cacheKey, data);
        return data;
      } catch (err) {
        if (cached) return cached;
        throw err;
      }
    },

    async getCategories(): Promise<{ id: string; name: string; nameKannada: string; nameTamil: string; nameTelugu: string; icon: string; count: number }[]> {
      const cacheKey = 'crops_categories';
      const cached = getCachedData<any[]>(cacheKey, 7 * 24 * 60 * 60 * 1000);
      if (cached && (!navigator.onLine || Math.random() > 0.2)) return cached;
      try {
        const data = await fetchWithRetry<any[]>(`${API_BASE}/crops/categories`, {}, 2, 8000);
        setCachedData(cacheKey, data);
        return data;
      } catch (err) {
        if (cached) return cached;
        throw err;
      }
    },

    async getSeasonalFruits(): Promise<any[]> {
      const cacheKey = 'crops_seasonal_fruits';
      const cached = getCachedData<any[]>(cacheKey, 24 * 60 * 60 * 1000);
      if (!navigator.onLine && cached) return cached;
      try {
        const data = await fetchWithRetry<any[]>(`${API_BASE}/crops/seasonal-fruits`, {}, 2, 8000);
        setCachedData(cacheKey, data);
        return data;
      } catch (err) {
        if (cached) return cached;
        throw err;
      }
    },

    async getLongTermCrops(): Promise<any[]> {
      const cacheKey = 'crops_long_term';
      const cached = getCachedData<any[]>(cacheKey, 24 * 60 * 60 * 1000);
      if (!navigator.onLine && cached) return cached;
      try {
        const data = await fetchWithRetry<any[]>(`${API_BASE}/crops/long-term`, {}, 2, 8000);
        setCachedData(cacheKey, data);
        return data;
      } catch (err) {
        if (cached) return cached;
        throw err;
      }
    },

    async getCatalog(params?: {
      letter?: string;
      category?: string;
      season?: string;
      duration?: string;
      soilType?: string;
      waterNeed?: string;
      search?: string;
      page?: number;
      limit?: number;
      farmerSoilType?: string;
      farmerSeason?: string;
      farmerTaluk?: string;
      recommendedOnly?: boolean;
    }): Promise<{ data: any[]; pagination: any }> {
      const cleanedParams: Record<string, string> = {};
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== '') {
            cleanedParams[k] = String(v);
          }
        });
      }
      const q = new URLSearchParams(cleanedParams).toString();
      const res = await fetch(`${API_BASE}/crops/catalog?${q}`);
      return handleResponse(res);
    },

    async getCatalogById(id: string): Promise<any> {
      const res = await fetch(`${API_BASE}/crops/catalog/${id}`);
      return handleResponse(res);
    },

    async getImageCredits(): Promise<{ totalImages: number; credits: any[] }> {
      const res = await fetch(`${API_BASE}/crops/credits`);
      return handleResponse(res);
    },

    async getConfidenceReport(): Promise<any> {
      const res = await fetch(`${API_BASE}/crops/confidence-report`);
      return handleResponse(res);
    },

    async quickRecommend(data: any): Promise<RecommendationResult[]> {
      const res = await fetch(`${API_BASE}/crops/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
  },

  lifecycle: {
    async getPlans(): Promise<CropPlan[]> {
      const cacheKey = 'user_crop_plans';
      const cached = getCachedData<CropPlan[]>(cacheKey, 24 * 60 * 60 * 1000);
      if (!navigator.onLine && cached) return cached;
      try {
        const res = await fetch(`${API_BASE}/lifecycle/plans`, {
          headers: { ...getAuthHeader() },
        });
        const data = await handleResponse<CropPlan[]>(res);
        setCachedData(cacheKey, data);
        return data;
      } catch (err) {
        if (cached) return cached;
        throw err;
      }
    },

    async createPlan(data: { cropId: string; fieldName?: string; areaAcre?: number }): Promise<CropPlan> {
      const res = await fetch(`${API_BASE}/lifecycle/plans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(data),
      });
      const plan = await handleResponse<CropPlan>(res);
      setCachedData(`user_crop_plan_${plan.id}`, plan);
      return plan;
    },

    async getPlan(id: string): Promise<CropPlan> {
      const cacheKey = `user_crop_plan_${id}`;
      const cached = getCachedData<CropPlan>(cacheKey, 7 * 24 * 60 * 60 * 1000);
      if (!navigator.onLine && cached) return cached;
      try {
        const res = await fetch(`${API_BASE}/lifecycle/plans/${id}`, {
          headers: { ...getAuthHeader() },
        });
        const plan = await handleResponse<CropPlan>(res);
        setCachedData(cacheKey, plan);
        return plan;
      } catch (err) {
        if (cached) return cached;
        throw err;
      }
    },

    async toggleTask(taskId: string, isCompleted: boolean): Promise<any> {
      const res = await fetch(`${API_BASE}/lifecycle/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ isCompleted }),
      });
      return handleResponse(res);
    },

    async deletePlan(id: string) {
      const res = await fetch(`${API_BASE}/lifecycle/plans/${id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() },
      });
      return handleResponse(res);
    },
  },

  diseases: {
    async getAll(params?: {
      crop?: string;
      type?: string;
      severity?: string;
      stage?: string;
      season?: string;
      search?: string;
    }): Promise<Disease[]> {
      const filteredParams = Object.entries(params || {}).reduce((acc, [k, v]) => {
        if (v && v !== 'all') acc[k] = v;
        return acc;
      }, {} as Record<string, string>);
      const q = new URLSearchParams(filteredParams).toString();
      const cacheKey = `diseases_all_${q}`;
      const cached = getCachedData<Disease[]>(cacheKey, 7 * 24 * 60 * 60 * 1000);
      if (!navigator.onLine && cached) return cached;

      try {
        const data = await fetchWithRetry<Disease[]>(`${API_BASE}/diseases?${q}`, {}, 2, 8000);
        setCachedData(cacheKey, data);
        return data;
      } catch (err) {
        if (cached) return cached;
        throw err;
      }
    },

    async getById(id: string): Promise<Disease> {
      const cacheKey = `disease_detail_${id}`;
      const cached = getCachedData<Disease>(cacheKey, 7 * 24 * 60 * 60 * 1000);
      if (!navigator.onLine && cached) return cached;
      try {
        const data = await fetchWithRetry<Disease>(`${API_BASE}/diseases/${id}`, {}, 2, 8000);
        setCachedData(cacheKey, data);
        return data;
      } catch (err) {
        if (cached) return cached;
        throw err;
      }
    },

    async getCropsCatalog(): Promise<any[]> {
      const cacheKey = 'diseases_crops_catalog';
      const cached = getCachedData<any[]>(cacheKey, 7 * 24 * 60 * 60 * 1000);
      if (cached && (!navigator.onLine || Math.random() > 0.2)) return cached;
      try {
        const data = await fetchWithRetry<any[]>(`${API_BASE}/diseases/crops/catalog`, {}, 2, 8000);
        setCachedData(cacheKey, data);
        return data;
      } catch (err) {
        if (cached) return cached;
        throw err;
      }
    },

    async getTags(): Promise<any[]> {
      const cacheKey = 'diseases_tags_all';
      const cached = getCachedData<any[]>(cacheKey, 7 * 24 * 60 * 60 * 1000);
      if (cached && (!navigator.onLine || Math.random() > 0.2)) return cached;
      try {
        const data = await fetchWithRetry<any[]>(`${API_BASE}/diseases/tags/all`, {}, 2, 8000);
        setCachedData(cacheKey, data);
        return data;
      } catch (err) {
        if (cached) return cached;
        throw err;
      }
    },

    async diagnose(data: any) {
      let res;
      if (data instanceof FormData) {
        res = await fetch(`${API_BASE}/diseases/diagnose`, {
          method: 'POST',
          body: data,
        });
      } else {
        res = await fetch(`${API_BASE}/diseases/diagnose`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      }
      return handleResponse<{
        mode: string;
        message?: string;
        matches?: any[];
        candidates?: any[];
        note?: string;
        extractedTags?: any[];
        topChecks?: string[];
      }>(res);
    },

    async analyzePhoto(payload: {
      photos: Array<{ kind: 'closeup_leaf' | 'whole_plant' | 'underside_stem'; dataUrl: string }>;
      crop: string;
      cropSlug: string;
      location?: { state?: string; district?: string };
      season?: string;
      weather?: { humidity?: number; temperature?: number; condition?: string };
      guidedTags?: any;
      consentToStore?: boolean;
      language?: string;
    }) {
      if (!navigator.onLine) {
        throw new Error('You are currently offline. Leaf photo diagnosis requires an active internet connection to analyze crop images.');
      }
      const res = await fetch(`${API_BASE}/diseases/analyze-photo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return handleResponse<any>(res);
    },

    async sendDiagnosisFeedback(feedback: {
      problemSlug: string;
      confidence: string;
      crop: string;
      rating: 'correct' | 'incorrect' | 'not_sure';
      farmerCorrection?: string;
      notes?: string;
      hasConsent?: boolean;
      storedImagePath?: string;
    }) {
      const res = await fetch(`${API_BASE}/diseases/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedback),
      });
      return handleResponse<any>(res);
    },
  },

  chat: {
    /**
     * Sends a chat message and returns the complete response via SSE streaming.
     *
     * Calls onChunk(text) for each incremental text chunk while the AI streams.
     * Returns the full structured response once the "done" event arrives.
     *
     * For the rule-based local fallback, onChunk is never called and the response
     * arrives directly as a "done" event — the caller treats both paths identically.
     *
     * Pass an AbortSignal via options.signal to cancel the stream (e.g. on page leave).
     */
    async sendMessage(
      message: string,
      language: string,
      conversationId?: string,
      options?: {
        onChunk?: (text: string) => void;
        signal?: AbortSignal;
      }
    ): Promise<{
      conversationId: string;
      message: ChatMessage;
      speechContent?: string;
      suggestedQuestions: string[];
    }> {
      if (!navigator.onLine) {
        throw new Error('You are currently offline. Raitha Mitra AI chat requires an active internet connection to reply.');
      }

      return new Promise((resolve, reject) => {
        const controller = new AbortController();

        // Allow external cancellation
        if (options?.signal) {
          options.signal.addEventListener('abort', () => controller.abort());
        }

        fetch(`${API_BASE}/chat/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
          body: JSON.stringify({ message, language, conversationId }),
          signal: controller.signal,
        })
          .then(async (res) => {
            // Handle non-SSE error responses (4xx before headers flushed)
            if (!res.ok) {
              const errData = await res.json().catch(() => ({ message: `Request failed ${res.status}` }));
              return reject(new Error(errData.message || `Request failed ${res.status}`));
            }

            const reader = res.body!.getReader();
            // Use a TextDecoder with stream:true so multi-byte UTF-8 (Kannada/Tamil/Telugu)
            // is never split across chunk boundaries.
            const decoder = new TextDecoder('utf-8', { fatal: false });
            let buffer = '';

            const processBuffer = () => {
              const events = buffer.split('\n\n');
              // Keep the last (possibly incomplete) fragment in the buffer
              buffer = events.pop() ?? '';

              for (const eventBlock of events) {
                if (!eventBlock.trim()) continue;
                let eventName = 'message';
                let dataLine = '';
                for (const line of eventBlock.split('\n')) {
                  if (line.startsWith('event: ')) eventName = line.slice(7).trim();
                  if (line.startsWith('data: ')) dataLine = line.slice(6).trim();
                }
                if (!dataLine) continue;

                try {
                  const payload = JSON.parse(dataLine);
                  if (eventName === 'chunk') {
                    options?.onChunk?.(payload.text ?? '');
                  } else if (eventName === 'done') {
                    resolve(payload);
                    controller.abort(); // stop reading
                  } else if (eventName === 'error') {
                    reject(new Error(payload.message || 'Chat error from server'));
                    controller.abort();
                  }
                } catch {
                  // Ignore malformed JSON in a chunk
                }
              }
            };

            const pump = async () => {
              while (true) {
                let done: boolean, value: Uint8Array | undefined;
                try {
                  ({ done, value } = await reader.read());
                } catch {
                  break; // AbortError or network error
                }
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                processBuffer();
              }
              // Flush any remaining bytes
              buffer += decoder.decode();
              if (buffer.trim()) processBuffer();
            };

            pump().catch((err) => {
              if (err?.name !== 'AbortError') reject(err);
            });
          })
          .catch((err) => {
            if (err?.name !== 'AbortError') reject(err);
          });
      });
    },

    async synthesizeSpeech(
      text: string,
      language: string,
      gender: 'female' | 'male' = 'female',
      provider: 'auto' | 'gemini-tts' | 'edge-neural' | 'browser' = 'auto',
      speed: number = 1.0
    ) {
      const res = await fetch(`${API_BASE}/chat/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ text, language, gender, provider, speed }),
      });
      return handleResponse<{
        audio?: string;
        mimeType?: string;
        provider?: 'gemini-tts' | 'edge-neural' | 'browser';
        voice?: string;
        fallbackToBrowser?: boolean;
        message?: string;
      }>(res);
    },

    async getConversations(): Promise<any[]> {
      const res = await fetch(`${API_BASE}/chat/conversations`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse(res);
    },

    async getMessages(convId: string): Promise<ChatMessage[]> {
      const res = await fetch(`${API_BASE}/chat/conversations/${convId}/messages`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse<ChatMessage[]>(res);
    },

    async getStatus() {
      const res = await fetch(`${API_BASE}/chat/status`);
      return handleResponse<{
        provider: string;
        hasGeminiKey: boolean;
        geminiModel: string;
        availableModels?: string[];
        isLocalDemoFallback?: boolean;
      }>(res);
    },

    async updateKeys(keys: {
      geminiApiKey?: string;
      geminiModel?: string;
    }) {
      const res = await fetch(`${API_BASE}/chat/keys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(keys),
      });
      return handleResponse<any>(res);
    },

  },

  profile: {
    async get(): Promise<any> {
      const res = await fetch(`${API_BASE}/profile`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse(res);
    },

    async update(data: any): Promise<User> {
      const res = await fetch(`${API_BASE}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(data),
      });
      return handleResponse<User>(res);
    },
  },

  location: {
    async reverseGeocode(latitude: number, longitude: number, accuracy?: number) {
      const res = await fetch(`${API_BASE}/location/reverse-geocode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude, longitude, accuracy }),
      });
      return handleResponse<{
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
      }>(res);
    },

    async getIpLocation() {
      const res = await fetch(`${API_BASE}/location/ip-location`);
      return handleResponse<{
        village?: string;
        town?: string;
        taluk?: string;
        district?: string;
        state?: string;
        country?: string;
        latitude: number;
        longitude: number;
        source: 'ip';
        isApproximate: boolean;
      }>(res);
    },
  },
};
