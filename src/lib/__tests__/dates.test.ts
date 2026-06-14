import { de, enUS } from 'date-fns/locale';

import {
  advanceByInterval,
  formatDisplayDate,
  isOnOrBefore,
  toISODate,
  todayISO,
} from '../dates';

describe('todayISO / toISODate', () => {
  it('produces a YYYY-MM-DD string', () => {
    expect(todayISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('formats a specific date in local time', () => {
    // Construct with local Y/M/D to avoid timezone drift.
    const d = new Date(2026, 5, 14); // 14 Jun 2026
    expect(toISODate(d)).toBe('2026-06-14');
  });
});

describe('advanceByInterval', () => {
  it('advances weekly by 7 days', () => {
    expect(advanceByInterval('2026-06-14', 'weekly')).toBe('2026-06-21');
  });

  it('advances biweekly by 14 days', () => {
    expect(advanceByInterval('2026-06-14', 'biweekly')).toBe('2026-06-28');
  });

  it('advances monthly by one calendar month', () => {
    expect(advanceByInterval('2026-06-14', 'monthly')).toBe('2026-07-14');
  });

  it('clamps month-end overflow', () => {
    // Jan 31 + 1 month -> Feb 28 (2026 is not a leap year).
    expect(advanceByInterval('2026-01-31', 'monthly')).toBe('2026-02-28');
  });

  it('crosses year boundaries weekly', () => {
    expect(advanceByInterval('2026-12-29', 'weekly')).toBe('2027-01-05');
  });
});

describe('isOnOrBefore', () => {
  it('is true for earlier and equal dates', () => {
    expect(isOnOrBefore('2026-06-13', '2026-06-14')).toBe(true);
    expect(isOnOrBefore('2026-06-14', '2026-06-14')).toBe(true);
  });

  it('is false for later dates', () => {
    expect(isOnOrBefore('2026-06-15', '2026-06-14')).toBe(false);
  });
});

describe('formatDisplayDate', () => {
  it('formats with the default (English) locale', () => {
    const out = formatDisplayDate('2026-06-14', enUS);
    expect(out).toContain('2026');
    expect(out).toContain('Jun');
  });

  it('formats with a German locale', () => {
    const out = formatDisplayDate('2026-06-14', de);
    expect(out).toContain('2026');
    expect(out).toContain('Juni');
  });
});
