/** i18next configuration. English is the default; all 24 official EU languages ship. */

import {
  bg as bgDate,
  cs as csDate,
  da as daDate,
  de as deDate,
  el as elDate,
  enUS as enDate,
  enIE as gaDate,
  es as esDate,
  et as etDate,
  fi as fiDate,
  fr as frDate,
  hr as hrDate,
  hu as huDate,
  it as itDate,
  lt as ltDate,
  lv as lvDate,
  mt as mtDate,
  nl as nlDate,
  pl as plDate,
  pt as ptDate,
  ro as roDate,
  sk as skDate,
  sl as slDate,
  sv as svDate,
  type Locale,
} from 'date-fns/locale';
import { getLocales } from 'expo-localization';
import i18n, { type Resource } from 'i18next';
import { initReactI18next } from 'react-i18next';

import bg from './locales/bg.json';
import cs from './locales/cs.json';
import da from './locales/da.json';
import de from './locales/de.json';
import el from './locales/el.json';
import en from './locales/en.json';
import es from './locales/es.json';
import et from './locales/et.json';
import fi from './locales/fi.json';
import fr from './locales/fr.json';
import ga from './locales/ga.json';
import hr from './locales/hr.json';
import hu from './locales/hu.json';
import it from './locales/it.json';
import lt from './locales/lt.json';
import lv from './locales/lv.json';
import mt from './locales/mt.json';
import nl from './locales/nl.json';
import pl from './locales/pl.json';
import pt from './locales/pt.json';
import ro from './locales/ro.json';
import sk from './locales/sk.json';
import sl from './locales/sl.json';
import sv from './locales/sv.json';

/**
 * Every shipped language, paired with the date-fns locale used for date
 * formatting. Irish has no date-fns locale, so it borrows English (Ireland).
 */
const LANGUAGES = {
  en: { translation: en, dateLocale: enDate },
  bg: { translation: bg, dateLocale: bgDate },
  cs: { translation: cs, dateLocale: csDate },
  da: { translation: da, dateLocale: daDate },
  de: { translation: de, dateLocale: deDate },
  el: { translation: el, dateLocale: elDate },
  es: { translation: es, dateLocale: esDate },
  et: { translation: et, dateLocale: etDate },
  fi: { translation: fi, dateLocale: fiDate },
  fr: { translation: fr, dateLocale: frDate },
  ga: { translation: ga, dateLocale: gaDate },
  hr: { translation: hr, dateLocale: hrDate },
  hu: { translation: hu, dateLocale: huDate },
  it: { translation: it, dateLocale: itDate },
  lt: { translation: lt, dateLocale: ltDate },
  lv: { translation: lv, dateLocale: lvDate },
  mt: { translation: mt, dateLocale: mtDate },
  nl: { translation: nl, dateLocale: nlDate },
  pl: { translation: pl, dateLocale: plDate },
  pt: { translation: pt, dateLocale: ptDate },
  ro: { translation: ro, dateLocale: roDate },
  sk: { translation: sk, dateLocale: skDate },
  sl: { translation: sl, dateLocale: slDate },
  sv: { translation: sv, dateLocale: svDate },
} as const;

export type Language = keyof typeof LANGUAGES;

export const SUPPORTED_LANGUAGES = Object.keys(LANGUAGES) as Language[];

export const DEFAULT_LANGUAGE: Language = 'en';

/** date-fns locale matching the active i18next language. */
export function dateLocaleFor(language: string): Locale {
  return (LANGUAGES[language as Language] ?? LANGUAGES[DEFAULT_LANGUAGE]).dateLocale;
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
    const resources = Object.fromEntries(
      Object.entries(LANGUAGES).map(([code, { translation }]) => [code, { translation }]),
    ) as Resource;
    i18n.use(initReactI18next).init({
      resources,
      lng: language,
      fallbackLng: DEFAULT_LANGUAGE,
      interpolation: { escapeValue: false },
      returnNull: false,
    });
  }
  return i18n;
}

export default i18n;
