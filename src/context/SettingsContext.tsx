/** App settings (language, currency), persisted in the SQLite settings table. */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { getSetting, setSetting } from '@/db/queries';
import { deviceLanguage, initI18n, type Language } from '@/i18n';
import i18n from '@/i18n';

const LANGUAGE_KEY = 'language';
const CURRENCY_KEY = 'currency';
const DEFAULT_CURRENCY = 'EUR';

type SettingsContextValue = {
  ready: boolean;
  language: Language;
  currency: string;
  setLanguage: (language: Language) => Promise<void>;
  setCurrency: (currency: string) => Promise<void>;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [language, setLanguageState] = useState<Language>('en');
  const [currency, setCurrencyState] = useState<string>(DEFAULT_CURRENCY);

  useEffect(() => {
    (async () => {
      const [storedLang, storedCurrency] = await Promise.all([
        getSetting(LANGUAGE_KEY),
        getSetting(CURRENCY_KEY),
      ]);
      const lang = (storedLang as Language) ?? deviceLanguage();
      initI18n(lang);
      await i18n.changeLanguage(lang);
      setLanguageState(lang);
      setCurrencyState(storedCurrency ?? DEFAULT_CURRENCY);
      setReady(true);
    })();
  }, []);

  const setLanguage = useCallback(async (lang: Language) => {
    setLanguageState(lang);
    await i18n.changeLanguage(lang);
    await setSetting(LANGUAGE_KEY, lang);
  }, []);

  const setCurrency = useCallback(async (cur: string) => {
    setCurrencyState(cur);
    await setSetting(CURRENCY_KEY, cur);
  }, []);

  const value = useMemo<SettingsContextValue>(
    () => ({ ready, language, currency, setLanguage, setCurrency }),
    [ready, language, currency, setLanguage, setCurrency],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
