import { en } from './en';
import { kn } from './kn';
import { ta } from './ta';
import { te } from './te';

export type LanguageCode = 'en' | 'kn' | 'ta' | 'te';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
  symbol: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', symbol: 'A' },
  { code: 'kn', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ', symbol: 'ಪ' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்', symbol: 'அ' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు', symbol: 'తె' },
];

export const translations: Record<LanguageCode, typeof en> = {
  en,
  kn: kn as unknown as typeof en,
  ta: ta as unknown as typeof en,
  te: te as unknown as typeof en,
};

export function getTranslation(lang: LanguageCode = 'en', key: keyof typeof en, params?: Record<string, string | number>): string {
  const dict = translations[lang] || translations.en;
  let text = dict[key] || translations.en[key] || String(key);

  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }

  return text;
}
