import en from '@/locales/en.json';
import hi from '@/locales/hi.json';
import ta from '@/locales/ta.json';
import kn from '@/locales/kn.json';

export const languages = [
  { value: 'en' as const, labelKey: 'language.en' },
  { value: 'hi' as const, labelKey: 'language.hi' },
  { value: 'ta' as const, labelKey: 'language.ta' },
  { value: 'kn' as const, labelKey: 'language.kn' },
];

export type Language = typeof languages[number]['value'];

export const defaultLanguage: Language = 'en';

export const translations = {
  en,
  hi,
  ta,
  kn,
};
