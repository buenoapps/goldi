import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, Switch, View } from 'react-native';

import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { Fab } from '@/components/Fab';
import { ThemedText } from '@/components/themed-text';
import { Brand, Spacing } from '@/constants/theme';
import {
  listAllAccountsForPicker,
  listStandingOrdersDetailed,
  setStandingOrderActive,
  type StandingOrderDetailed,
} from '@/db/queries';
import { useFocusData } from '@/hooks/use-focus-data';
import { useMoney } from '@/hooks/use-money';
import { useParentAction } from '@/hooks/use-parent-action';
import { useTheme } from '@/hooks/use-theme';
import { dateLocaleFor } from '@/i18n';
import { formatDisplayDate } from '@/lib/dates';

type Data = { orders: StandingOrderDetailed[]; accountCount: number };

export default function StandingOrdersScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { format } = useMoney();
  const theme = useTheme();
  const guard = useParentAction();

  const { data, reload } = useFocusData<Data>(
    useCallback(async () => {
      const [orders, accounts] = await Promise.all([
        listStandingOrdersDetailed(),
        listAllAccountsForPicker(),
      ]);
      return { orders, accountCount: accounts.length };
    }, []),
  );

  const orders = data?.orders ?? [];

  const addOrder = () => guard(() => router.push('/standing-order-form'));
  const toggle = (order: StandingOrderDetailed, next: boolean) =>
    guard(async () => {
      await setStandingOrderActive(order.id, next);
      reload();
    });

  if (data && data.accountCount === 0) {
    return (
      <View style={styles.flex}>
        <EmptyState
          emoji="🏦"
          title={t('standingOrders.noAccountsTitle')}
          subtitle={t('standingOrders.noAccountsSubtitle')}
        />
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          data ? (
            <EmptyState
              emoji="🔁"
              title={t('standingOrders.emptyTitle')}
              subtitle={t('standingOrders.emptySubtitle')}
            />
          ) : null
        }
        renderItem={({ item }) => {
          const positive = item.amount_cents >= 0;
          return (
            <Card
              accentColor={item.child_color}
              onPress={() => guard(() => router.push(`/standing-order-form?id=${item.id}`))}
            >
              <View style={styles.cardTop}>
                <View style={styles.cardInfo}>
                  <ThemedText style={styles.title}>
                    {item.comment?.trim() || t('transaction.types.standing_order')}
                  </ThemedText>
                  <ThemedText themeColor="textSecondary" type="small">
                    {item.child_name} · {item.account_name}
                  </ThemedText>
                </View>
                <ThemedText
                  style={[
                    styles.amount,
                    { color: positive ? theme.positive : theme.negative },
                  ]}
                >
                  {format(item.amount_cents)}
                </ThemedText>
              </View>
              <View style={styles.cardBottom}>
                <ThemedText themeColor="textSecondary" type="small">
                  {t(`standingOrders.intervals.${item.interval}`)}
                  {item.active
                    ? ` · ${t('standingOrders.nextRun', {
                        date: formatDisplayDate(item.next_run_date, dateLocaleFor(i18n.language)),
                      })}`
                    : ` · ${t('standingOrders.paused')}`}
                </ThemedText>
                <Switch
                  value={!!item.active}
                  onValueChange={(next) => toggle(item, next)}
                  trackColor={{ true: Brand.gold }}
                />
              </View>
            </Card>
          );
        }}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.three }} />}
      />
      <Fab onPress={addOrder} accessibilityLabel={t('standingOrders.addOrder')} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { padding: Spacing.three, flexGrow: 1 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two },
  cardInfo: { flex: 1, gap: 2 },
  title: { fontSize: 16, fontWeight: '700' },
  amount: { fontSize: 18, fontWeight: '800' },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.two,
  },
});
