import { useCallback } from 'react';

import { useSettings } from '@/context/SettingsContext';
import { formatMoney, formatSignedMoney } from '@/lib/money';

/** Currency formatting bound to the user's current currency & language. */
export function useMoney() {
  const { currency, language } = useSettings();

  const format = useCallback(
    (cents: number) => formatMoney(cents, currency, language),
    [currency, language],
  );

  const formatSigned = useCallback(
    (cents: number) => formatSignedMoney(cents, currency, language),
    [currency, language],
  );

  return { format, formatSigned, currency };
}
