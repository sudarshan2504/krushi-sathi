import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const envApiKey = (import.meta.env.VITE_FIREBASE_API_KEY || '').trim();
const envAuthDomain = (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '').trim();
const envProjectId = (import.meta.env.VITE_FIREBASE_PROJECT_ID || '').trim();
const envAppId = (import.meta.env.VITE_FIREBASE_APP_ID || '').trim();

/**
 * Returns true only when real Firebase project credentials are provided
 */
export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    envApiKey &&
    envApiKey !== 'your_api_key_here' &&
    envApiKey !== 'AIzaSyDemoDummyPlaceholderKey000000000' &&
    envAuthDomain &&
    envProjectId &&
    envAppId
  );
};

// Safe configuration values to prevent getAuth() throwing at module evaluation time
const firebaseConfig = {
  apiKey: envApiKey || 'AIzaSyDemoDummyPlaceholderKey000000000',
  authDomain: envAuthDomain || 'krushi-sathi-demo.firebaseapp.com',
  projectId: envProjectId || 'krushi-sathi-demo',
  storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '').trim() || 'krushi-sathi-demo.appspot.com',
  messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '').trim() || '123456789012',
  appId: envAppId || '1:123456789012:web:abcdef123456',
};

// Initialize Firebase once safely
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

export default auth;
