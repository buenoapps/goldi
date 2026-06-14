const mockGetLocales = jest.fn();
jest.mock('expo-localization', () => ({ getLocales: () => mockGetLocales() }));

import { de, enUS } from 'date-fns/locale';

import i18n, { dateLocaleFor, deviceLanguage, initI18n, SUPPORTED_LANGUAGES } from '../index';
import en from '../locales/en.json';
import deLocale from '../locales/de.json';

describe('dateLocaleFor', () => {
  it('maps language codes to date-fns locales', () => {
    expect(dateLocaleFor('de')).toBe(de);
    expect(dateLocaleFor('en')).toBe(enUS);
  });

  it('falls back to English for unknown codes', () => {
    expect(dateLocaleFor('fr')).toBe(enUS);
    expect(dateLocaleFor('')).toBe(enUS);
  });
});

describe('deviceLanguage', () => {
  it('returns a supported device language', () => {
    mockGetLocales.mockReturnValue([{ languageCode: 'de' }]);
    expect(deviceLanguage()).toBe('de');
  });

  it('falls back to English for unsupported languages', () => {
    mockGetLocales.mockReturnValue([{ languageCode: 'fr' }]);
    expect(deviceLanguage()).toBe('en');
  });

  it('falls back to English when no locale is reported', () => {
    mockGetLocales.mockReturnValue([]);
    expect(deviceLanguage()).toBe('en');
  });
});

describe('initI18n', () => {
  it('initializes i18next and resolves translations', async () => {
    initI18n('en');
    expect(i18n.isInitialized).toBe(true);
    expect(i18n.t('tabs.kids')).toBe('Kids');

    await i18n.changeLanguage('de');
    expect(i18n.t('tabs.kids')).toBe('Kinder');
  });
});

/** Flattens a nested translation object into dotted leaf keys. */
function flatten(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return value && typeof value === 'object'
      ? flatten(value as Record<string, unknown>, path)
      : [path];
  });
}

describe('locale completeness', () => {
  it('ships exactly the supported languages', () => {
    expect([...SUPPORTED_LANGUAGES].sort()).toEqual(['de', 'en']);
  });

  it('has identical keys in English and German', () => {
    const enKeys = flatten(en).sort();
    const deKeys = flatten(deLocale).sort();
    expect(deKeys).toEqual(enKeys);
  });
});
