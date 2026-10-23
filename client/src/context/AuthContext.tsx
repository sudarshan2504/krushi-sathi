import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';
import {
  onAuthStateChanged,
  signOut,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../firebase';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string, otp: string) => Promise<{ isNewUser: boolean }>;
  setFirebaseSession: (fbUser: FirebaseUser) => void;
  register: (formData: any) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Helper to build a standard application user object from a Firebase User
  const buildUserFromFirebase = (fbUser: FirebaseUser, existing?: User | null): User => {
    const rawPhone = fbUser.phoneNumber || '';
    const cleanPhone = rawPhone.replace(/^\+91/, '').replace(/\D/g, '') || rawPhone;

    return {
      id: fbUser.uid,
      name: existing?.name || fbUser.displayName || 'Farmer',
      phone: cleanPhone || existing?.phone || '',
      language: (existing?.language || localStorage.getItem('krishi_sathi_lang') || 'en') as 'en' | 'kn' | 'ta' | 'te',
      state: existing?.state || 'Karnataka',
      district: existing?.district || 'Mandya',
      village: existing?.village || null,
      farmSize: existing?.farmSize || 2.5,
      farmUnit: existing?.farmUnit || 'Acres',
      avatar: existing?.avatar || fbUser.photoURL || null,
    };
  };

  const refreshUser = async () => {
    const token = localStorage.getItem('krishi_sathi_token');
    if (token) {
      try {
        const me = await api.auth.getMe();
        if (me) {
          setUser(me);
          return;
        }
      } catch {
        localStorage.removeItem('krishi_sathi_token');
      }
    }
  };

  // Subscribe to Firebase Authentication state observer
  useEffect(() => {
    let unsubscribe = () => {};

    if (isFirebaseConfigured()) {
      try {
        unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
          if (fbUser) {
            setFirebaseUser(fbUser);
            // Check if backend session exists or fallback to synthesized user
            const token = localStorage.getItem('krishi_sathi_token');
            if (token) {
              try {
                const me = await api.auth.getMe();
                setUser(buildUserFromFirebase(fbUser, me));
              } catch {
                setUser(buildUserFromFirebase(fbUser));
              }
            } else {
              setUser(buildUserFromFirebase(fbUser));
            }
          } else {
            setFirebaseUser(null);
            // If no Firebase user, fallback to local token check if present
            await refreshUser();
          }
          setIsLoading(false);
        });
      } catch (err) {
        console.warn('[AuthContext] Firebase auth listener error:', err);
        refreshUser().finally(() => setIsLoading(false));
      }
    } else {
      // Firebase not configured yet, use local storage session
      refreshUser().finally(() => setIsLoading(false));
    }

    return () => unsubscribe();
  }, []);

  const setFirebaseSession = (fbUser: FirebaseUser) => {
    setFirebaseUser(fbUser);
    setUser(buildUserFromFirebase(fbUser, user));
  };

  const login = async (phone: string, otp: string) => {
    const res = await api.auth.verifyOtp(phone, otp);
    setUser(res.user);
    return { isNewUser: res.isNewUser };
  };

  const register = async (formData: any) => {
    const res = await api.auth.register(formData);
    setUser(res.user);
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      if (isFirebaseConfigured()) {
        await signOut(auth);
      }
    } catch (err) {
      console.warn('[AuthContext] Firebase signOut error:', err);
    }

    try {
      await api.auth.logout();
    } catch {
      // ignore
    }

    localStorage.removeItem('krishi_sathi_token');
    setFirebaseUser(null);
    setUser(null);
    setIsLoading(false);
  };

  const updateUser = (data: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...data });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        isAuthenticated: Boolean(user || firebaseUser),
        isLoading,
        login,
        setFirebaseSession,
        register,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
