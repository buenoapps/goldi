/** i18next configuration. Default language is English; German ships too. */

import { de as deDateLocale, enUS as enDateLocale, type Locale } from 'date-fns/locale';
import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import de from './locales/de.json';
import en from './locales/en.json';

export const SUPPORTED_LANGUAGES = ['en', 'de'] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: Language = 'en';

const DATE_LOCALES: Record<Language, Locale> = {
  en: enDateLocale,
  de: deDateLocale,
};

/** date-fns locale matching the active i18next language. */
export function dateLocaleFor(language: string): Locale {
  return DATE_LOCALES[(language as Language) in DATE_LOCALES ? (language as Language) : 'en'];
}

/** Best-effort device language, falling back to the default. */
export function deviceLanguage(): Language {
  const code = getLocales()[0]?.languageCode?.toLowerCase();
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(code ?? '')
    ? (code as Language)
    : DEFAULT_LANGUAGE;
}

/** Initializes i18next once with the resolved starting language. */
export function initI18n(language: Language): typeof i18n {
  if (!i18n.isInitialized) {
    i18n.use(initReactI18next).init({
      resources: {
        en: { translation: en },
        de: { translation: de },
      },
      lng: language,
      fallbackLng: DEFAULT_LANGUAGE,
      interpolation: { escapeValue: false },
      returnNull: false,
    });
  }
  return i18n;
}

export default i18n;
