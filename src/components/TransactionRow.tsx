import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useMoney } from '@/hooks/use-money';
import { useTheme } from '@/hooks/use-theme';
import { dateLocaleFor } from '@/i18n';
import { formatDisplayDate } from '@/lib/dates';
import type { Transaction } from '@/db/types';

const ICONS: Record<Transaction['type'], string> = {
  deposit: '⬆️',
  withdrawal: '⬇️',
  standing_order: '🔁',
};

export function TransactionRow({ tx }: { tx: Transaction }) {
  const theme = useTheme();
  const { formatSigned } = useMoney();
  const { t, i18n } = useTranslation();

  const positive = tx.amount_cents >= 0;
  const title = tx.comment?.trim() || t(`transaction.types.${tx.type}`);

  return (
    <View style={styles.row}>
      <Text style={styles.icon}>{ICONS[tx.type]}</Text>
      <View style={styles.middle}>
        <ThemedText numberOfLines={1} style={styles.title}>
          {title}
        </ThemedText>
        <ThemedText themeColor="textSecondary" type="small">
          {formatDisplayDate(tx.date, dateLocaleFor(i18n.language))}
        </ThemedText>
      </View>
      <ThemedText
        style={[styles.amount, { color: positive ? theme.positive : theme.negative }]}
      >
        {formatSigned(tx.amount_cents)}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.two,
  },
  icon: { fontSize: 22 },
  middle: { flex: 1, gap: 2 },
  title: { fontSize: 16, fontWeight: '600' },
  amount: { fontSize: 16, fontWeight: '700' },
});
