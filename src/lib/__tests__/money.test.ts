import {
  currencySymbol,
  formatMoney,
  formatSignedMoney,
  parseAmountToCents,
  SUPPORTED_CURRENCIES,
} from '../money';

// Normalize the various Unicode spaces ICU may insert (e.g. U+00A0, U+202F).
const norm = (s: string) => s.replace(/\s/g, ' ');

describe('parseAmountToCents', () => {
  it('parses plain decimals with a dot', () => {
    expect(parseAmountToCents('3.50')).toBe(350);
    expect(parseAmountToCents('0.01')).toBe(1);
    expect(parseAmountToCents('10')).toBe(1000);
  });

  it('accepts a comma as the decimal mark', () => {
    expect(parseAmountToCents('1,50')).toBe(150);
    expect(parseAmountToCents('2,5')).toBe(250);
  });

  it('trims surrounding and inner whitespace', () => {
    expect(parseAmountToCents('  4.20 ')).toBe(420);
    expect(parseAmountToCents('1 0')).toBe(1000);
  });

  it('rounds sub-cent input to the nearest cent', () => {
    expect(parseAmountToCents('1.119')).toBe(112);
    expect(parseAmountToCents('1.111')).toBe(111);
  });

  it('returns null for empty or invalid input', () => {
    expect(parseAmountToCents('')).toBeNull();
    expect(parseAmountToCents('   ')).toBeNull();
    expect(parseAmountToCents('abc')).toBeNull();
    expect(parseAmountToCents('1.2.3')).toBeNull();
    expect(parseAmountToCents('-5')).toBeNull();
    expect(parseAmountToCents('1e3')).toBeNull();
  });
});

describe('currencySymbol', () => {
  it('returns known symbols', () => {
    expect(currencySymbol('EUR')).toBe('€');
    expect(currencySymbol('USD')).toBe('$');
    expect(currencySymbol('GBP')).toBe('£');
  });

  it('falls back to the code for unknown currencies', () => {
    expect(currencySymbol('JPY')).toBe('JPY ');
  });

  it('lists EUR first among supported currencies', () => {
    expect(SUPPORTED_CURRENCIES[0]).toBe('EUR');
  });
});

describe('formatMoney', () => {
  it('formats positive amounts in EUR/en', () => {
    expect(norm(formatMoney(350, 'EUR', 'en'))).toBe('€3.50');
  });

  it('formats zero', () => {
    expect(norm(formatMoney(0, 'EUR', 'en'))).toBe('€0.00');
  });

  it('formats German locale with a trailing symbol', () => {
    const out = norm(formatMoney(150, 'EUR', 'de'));
    expect(out).toContain('1,50');
    expect(out).toContain('€');
  });

  it('formats negatives with a leading minus', () => {
    expect(norm(formatMoney(-500, 'EUR', 'en'))).toBe('-€5.00');
  });
});

describe('formatSignedMoney', () => {
  it('prefixes a plus for positive amounts', () => {
    expect(norm(formatSignedMoney(350, 'EUR', 'en'))).toBe('+€3.50');
  });

  it('prefixes a minus for negative amounts', () => {
    expect(norm(formatSignedMoney(-350, 'EUR', 'en'))).toBe('-€3.50');
  });

  it('does not prefix zero', () => {
    expect(norm(formatSignedMoney(0, 'EUR', 'en'))).toBe('€0.00');
  });
});
