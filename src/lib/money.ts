/** Money helpers. All amounts are integer cents to avoid float drift. */

/** Formats signed cents as a locale-aware currency string, e.g. 350 -> "€3.50". */
export function formatMoney(cents: number, currency = 'EUR', locale = 'en'): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(cents / 100);
  } catch {
    // Fallback if Intl currency data is unavailable on the platform.
    const sign = cents < 0 ? '-' : '';
    return `${sign}${currencySymbol(currency)}${Math.abs(cents / 100).toFixed(2)}`;
  }
}

/** Formats cents with an explicit leading + or - (for transaction rows). */
export function formatSignedMoney(cents: number, currency = 'EUR', locale = 'en'): string {
  const formatted = formatMoney(Math.abs(cents), currency, locale);
  if (cents > 0) return `+${formatted}`;
  if (cents < 0) return `-${formatted}`;
  return formatted;
}

const SYMBOLS: Record<string, string> = {
  EUR: '€',
  USD: '$',
  GBP: '£',
  CHF: 'CHF ',
};

export function currencySymbol(currency: string): string {
  return SYMBOLS[currency] ?? `${currency} `;
}

export const SUPPORTED_CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF'] as const;

/**
 * Parses a user-entered amount string (accepts "." or "," as decimal mark)
 * into positive integer cents. Returns null for invalid input.
 */
export function parseAmountToCents(input: string): number | null {
  const trimmed = input.trim().replace(/\s/g, '');
  if (!trimmed) return null;
  const normalized = trimmed.replace(',', '.');
  if (!/^\d*\.?\d*$/.test(normalized)) return null;
  const value = Number.parseFloat(normalized);
  if (!Number.isFinite(value) || value < 0) return null;
  return Math.round(value * 100);
}
