import en from '@/locales/en.json';
import hi from '@/locales/hi.json';
import ta from '@/locales/ta.json';
import kn from '@/locales/kn.json';
import bn from '@/locales/bn.json';
import raj from '@/locales/raj.json';
import mr from '@/locales/mr.json';
import gu from '@/locales/gu.json';

export const languages = [
  { value: 'en' as const, labelKey: 'language.en' },
  { value: 'hi' as const, labelKey: 'language.hi' },
  { value: 'ta' as const, labelKey: 'language.ta' },
  { value: 'kn' as const, labelKey: 'language.kn' },
  { value: 'bn' as const, labelKey: 'language.bn' },
  { value: 'raj' as const, labelKey: 'language.raj' },
  { value: 'mr' as const, labelKey: 'language.mr' },
  { value: 'gu' as const, labelKey: 'language.gu' },
];

export type Language = typeof languages[number]['value'];

export const defaultLanguage: Language = 'en';

export const translations = {
  en,
  hi,
  ta,
  kn,
  bn,
  raj,
  mr,
  gu,
};
