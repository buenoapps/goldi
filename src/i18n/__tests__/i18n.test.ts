const mockGetLocales = jest.fn();
jest.mock('expo-localization', () => ({ getLocales: () => mockGetLocales() }));

import { de, enUS } from 'date-fns/locale';

import i18n, { dateLocaleFor, deviceLanguage, initI18n, SUPPORTED_LANGUAGES } from '../index';
import en from '../locales/en.json';

/** Every official EU language ships, keyed by its ISO 639-1 code. */
const EU_LANGUAGES = [
  'bg', 'cs', 'da', 'de', 'el', 'en', 'es', 'et', 'fi', 'fr', 'ga', 'hr',
  'hu', 'it', 'lt', 'lv', 'mt', 'nl', 'pl', 'pt', 'ro', 'sk', 'sl', 'sv',
];

describe('dateLocaleFor', () => {
  it('maps language codes to date-fns locales', () => {
    expect(dateLocaleFor('de')).toBe(de);
    expect(dateLocaleFor('en')).toBe(enUS);
  });

  it('falls back to English for unknown codes', () => {
    expect(dateLocaleFor('xx')).toBe(enUS);
    expect(dateLocaleFor('')).toBe(enUS);
  });

  it('resolves a date-fns locale for every supported language', () => {
    for (const lng of SUPPORTED_LANGUAGES) {
      expect(dateLocaleFor(lng)).toBeDefined();
    }
  });
});

describe('deviceLanguage', () => {
  it('returns a supported device language', () => {
    mockGetLocales.mockReturnValue([{ languageCode: 'fr' }]);
    expect(deviceLanguage()).toBe('fr');
  });

  it('falls back to English for unsupported languages', () => {
    mockGetLocales.mockReturnValue([{ languageCode: 'zz' }]);
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

    await i18n.changeLanguage('fr');
    expect(i18n.t('tabs.kids')).toBe('Enfants');

    await i18n.changeLanguage('en');
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
  it('ships exactly the 24 official EU languages', () => {
    expect([...SUPPORTED_LANGUAGES].sort()).toEqual([...EU_LANGUAGES].sort());
  });

  it('has identical keys in every locale', () => {
    const enKeys = flatten(en).sort();
    for (const lng of EU_LANGUAGES) {
      const locale = require(`../locales/${lng}.json`);
      expect({ lng, keys: flatten(locale).sort() }).toEqual({ lng, keys: enKeys });
    }
  });
});
