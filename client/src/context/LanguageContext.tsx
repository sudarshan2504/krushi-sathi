import React, { createContext, useContext, useState, useEffect } from 'react';
import { LanguageCode, LANGUAGES, LanguageOption, getTranslation } from '../i18n';
import { en } from '../i18n/en';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: keyof typeof en, params?: Record<string, string | number>) => string;
  languages: LanguageOption[];
  currentLanguageOption: LanguageOption;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLangState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('krishi_sathi_lang');
    if (saved === 'kn' || saved === 'ta' || saved === 'te' || saved === 'en') {
      return saved;
    }
    return 'en';
  });

  const setLanguage = (lang: LanguageCode) => {
    setLangState(lang);
    localStorage.setItem('krishi_sathi_lang', lang);
  };

  const t = (key: keyof typeof en, params?: Record<string, string | number>) => {
    return getTranslation(language, key, params);
  };

  const currentLanguageOption = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages: LANGUAGES, currentLanguageOption }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
