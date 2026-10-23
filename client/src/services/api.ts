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

    async register(formData: {
      name: string;
      phone: string;
      language: string;
      state: string;
      district: string;
      village?: string;
      farmSize?: number;
      farmUnit?: string;
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
        await fetch(`${API_BASE}/auth/logout`, { method: 'POST' });
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
    async getAll(params?: { category?: string; search?: string }): Promise<any[]> {
      const q = new URLSearchParams(params as any).toString();
      const res = await fetch(`${API_BASE}/crops?${q}`);
      return handleResponse(res);
    },

    async getById(id: string): Promise<any> {
      const res = await fetch(`${API_BASE}/crops/${id}`);
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
    async getAll(params?: { crop?: string; search?: string }): Promise<Disease[]> {
      const q = new URLSearchParams(params as any).toString();
      const res = await fetch(`${API_BASE}/diseases?${q}`);
      return handleResponse<Disease[]>(res);
    },

    async getById(id: string): Promise<Disease> {
      const res = await fetch(`${API_BASE}/diseases/${id}`);
      return handleResponse<Disease>(res);
    },

    async diagnose(data: { cropName?: string; symptomsDescription?: string; hasImage?: boolean }) {
      const res = await fetch(`${API_BASE}/diseases/diagnose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return handleResponse<{ mode: string; message?: string; matches?: Disease[]; candidates?: Disease[] }>(res);
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
};
