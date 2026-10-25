import { User, WeatherData, RecommendationResult, CropPlan, Disease, ChatMessage } from '../types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('krishi_sathi_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data.data;
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
    async get(district = 'Mandya', lat?: number, lon?: number): Promise<WeatherData> {
      const params = new URLSearchParams({ district });
      if (lat !== undefined && lon !== undefined) {
        params.append('lat', String(lat));
        params.append('lon', String(lon));
      }
      const res = await fetch(`${API_BASE}/weather?${params.toString()}`);
      return handleResponse<WeatherData>(res);
    },

    async getDistricts(): Promise<{ name: string; state: string; lat: number; lon: number }[]> {
      const res = await fetch(`${API_BASE}/weather/districts`);
      return handleResponse(res);
    },

    async getLocations(): Promise<any> {
      const res = await fetch(`${API_BASE}/weather/locations`);
      return handleResponse(res);
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
      return handleResponse(res);
    },

    async getAssessments(): Promise<any[]> {
      const res = await fetch(`${API_BASE}/soil/assessments`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse(res);
    },

    async getAssessment(id: string): Promise<any> {
      const res = await fetch(`${API_BASE}/soil/assessments/${id}`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse(res);
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
      const res = await fetch(`${API_BASE}/crops?${q}`);
      return handleResponse(res);
    },

    async getById(id: string): Promise<any> {
      const res = await fetch(`${API_BASE}/crops/${id}`);
      return handleResponse(res);
    },

    async getCategories(): Promise<{ id: string; name: string; nameKannada: string; nameTamil: string; nameTelugu: string; icon: string; count: number }[]> {
      const res = await fetch(`${API_BASE}/crops/categories`);
      return handleResponse(res);
    },

    async getSeasonalFruits(): Promise<any[]> {
      const res = await fetch(`${API_BASE}/crops/seasonal-fruits`);
      return handleResponse(res);
    },

    async getLongTermCrops(): Promise<any[]> {
      const res = await fetch(`${API_BASE}/crops/long-term`);
      return handleResponse(res);
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
      const res = await fetch(`${API_BASE}/lifecycle/plans`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse<CropPlan[]>(res);
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
      return handleResponse<CropPlan>(res);
    },

    async getPlan(id: string): Promise<CropPlan> {
      const res = await fetch(`${API_BASE}/lifecycle/plans/${id}`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse<CropPlan>(res);
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
      const res = await fetch(`${API_BASE}/diseases?${q}`);
      return handleResponse<Disease[]>(res);
    },

    async getById(id: string): Promise<Disease> {
      const res = await fetch(`${API_BASE}/diseases/${id}`);
      return handleResponse<Disease>(res);
    },

    async getCropsCatalog(): Promise<any[]> {
      const res = await fetch(`${API_BASE}/diseases/crops/catalog`);
      return handleResponse<any[]>(res);
    },

    async getTags(): Promise<any[]> {
      const res = await fetch(`${API_BASE}/diseases/tags/all`);
      return handleResponse<any[]>(res);
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
    async sendMessage(message: string, language: string, conversationId?: string) {
      const res = await fetch(`${API_BASE}/chat/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ message, language, conversationId }),
      });
      return handleResponse<{
        conversationId: string;
        message: ChatMessage;
        speechContent?: string;
        suggestedQuestions: string[];
      }>(res);
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
