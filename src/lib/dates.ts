import { addDays, addMonths, format, parseISO, type Locale } from 'date-fns';

import type { IntervalUnit } from '@/db/types';

export type { Locale } from 'date-fns';

/** Today's date as an ISO calendar date (YYYY-MM-DD), local time. */
export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/** ISO date (YYYY-MM-DD) for a given Date. */
export function toISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/** Advances an ISO date by one interval step. */
export function advanceByInterval(isoDate: string, interval: IntervalUnit): string {
  const date = parseISO(isoDate);
  switch (interval) {
    case 'weekly':
      return toISODate(addDays(date, 7));
    case 'biweekly':
      return toISODate(addDays(date, 14));
    case 'monthly':
      return toISODate(addMonths(date, 1));
  }
}

/** True if `a` (ISO) is on or before `b` (ISO). */
export function isOnOrBefore(a: string, b: string): boolean {
  return a <= b;
}

/** Locale-aware medium date formatting for display, e.g. "14 Jun 2026". */
export function formatDisplayDate(isoDate: string, locale?: Locale): string {
  return format(parseISO(isoDate), 'PP', locale ? { locale } : undefined);
}
