import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import type { StandingOrder } from '@/db/types';
import { useMoney } from '@/hooks/use-money';
import { useTheme } from '@/hooks/use-theme';
import { dateLocaleFor } from '@/i18n';
import { formatDisplayDate } from '@/lib/dates';

type Props = {
  order: StandingOrder;
  /** Optional account label shown when the row isn't already account-scoped. */
  accountName?: string;
  onPress?: () => void;
};

/** Compact recurring-payment row used on the child & account detail screens. */
export function StandingOrderRow({ order, accountName, onPress }: Props) {
  const { t, i18n } = useTranslation();
  const { format } = useMoney();
  const theme = useTheme();

  const positive = order.amount_cents >= 0;
  const title = order.comment?.trim() || t('transaction.types.standing_order');

  const meta = [
    accountName,
    t(`standingOrders.intervals.${order.interval}`),
    order.active
      ? t('standingOrders.nextRun', {
          date: formatDisplayDate(order.next_run_date, dateLocaleFor(i18n.language)),
        })
      : t('standingOrders.paused'),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : 1 }]}
    >
      <ThemedText style={styles.icon}>🔁</ThemedText>
      <View style={styles.middle}>
        <ThemedText numberOfLines={1} style={styles.title}>
          {title}
        </ThemedText>
        <ThemedText themeColor="textSecondary" type="small">
          {meta}
        </ThemedText>
      </View>
      <ThemedText
        style={[styles.amount, { color: positive ? theme.positive : theme.negative }]}
      >
        {format(order.amount_cents)}
      </ThemedText>
    </Pressable>
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
