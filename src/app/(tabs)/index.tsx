import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { ChildAvatar } from '@/components/ChildAvatar';
import { EmptyState } from '@/components/EmptyState';
import { Fab } from '@/components/Fab';
import { ThemedText } from '@/components/themed-text';
import { Brand, Spacing } from '@/constants/theme';
import {
  listAllAccountsWithBalance,
  listChildrenWithSummary,
  type ChildSummary,
} from '@/db/queries';
import type { AccountWithBalance } from '@/db/types';
import { useFocusData } from '@/hooks/use-focus-data';
import { useMoney } from '@/hooks/use-money';
import { useParentAction } from '@/hooks/use-parent-action';
import { useTheme } from '@/hooks/use-theme';

type Data = { children: ChildSummary[]; accounts: AccountWithBalance[] };

export default function OverviewScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { format } = useMoney();
  const theme = useTheme();
  const guard = useParentAction();

  const { data } = useFocusData<Data>(
    useCallback(async () => {
      const [children, accounts] = await Promise.all([
        listChildrenWithSummary(),
        listAllAccountsWithBalance(),
      ]);
      return { children, accounts };
    }, []),
  );

  const children = data?.children ?? [];
  const grandTotal = children.reduce((sum, c) => sum + c.total_cents, 0);

  const accountsFor = (childId: string) =>
    data?.accounts.filter((a) => a.child_id === childId) ?? [];

  const addChild = () => guard(() => router.push('/child-form'));

  return (
    <View style={styles.flex}>
      <FlatList
        data={children}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          children.length > 1 ? (
            <Card style={styles.summary}>
              <ThemedText themeColor="textSecondary" type="smallBold" style={styles.summaryLabel}>
                {t('overview.summaryTitle').toUpperCase()}
              </ThemedText>
              <ThemedText
                style={[
                  styles.summaryTotal,
                  { color: grandTotal < 0 ? theme.negative : theme.positive },
                ]}
              >
                {format(grandTotal)}
              </ThemedText>
            </Card>
          ) : null
        }
        ListEmptyComponent={
          data ? (
            <EmptyState title={t('kids.emptyTitle')} subtitle={t('kids.emptySubtitle')} />
          ) : null
        }
        renderItem={({ item }) => {
          const accounts = accountsFor(item.id);
          return (
            <Card accentColor={item.color} style={styles.childCard}>
              <Pressable style={styles.childHeader} onPress={() => router.push(`/child/${item.id}`)}>
                <ChildAvatar emoji={item.emoji} color={item.color} />
                <View style={styles.childInfo}>
                  <ThemedText style={styles.childName}>{item.name}</ThemedText>
                  <ThemedText themeColor="textSecondary" type="small">
                    {t('kids.accountsCount', { count: item.account_count })}
                  </ThemedText>
                </View>
                <ThemedText
                  style={[
                    styles.childTotal,
                    { color: item.total_cents < 0 ? theme.negative : theme.positive },
                  ]}
                >
                  {format(item.total_cents)}
                </ThemedText>
              </Pressable>

              {accounts.length > 0 ? (
                <View style={[styles.accounts, { borderTopColor: theme.border }]}>
                  {accounts.map((account) => (
                    <Pressable
                      key={account.id}
                      style={styles.accountRow}
                      onPress={() => router.push(`/account/${account.id}`)}
                    >
                      <View style={[styles.dot, { backgroundColor: account.color }]} />
                      <ThemedText style={styles.accountName} numberOfLines={1}>
                        {account.name}
                      </ThemedText>
                      <ThemedText
                        style={[
                          styles.accountBalance,
                          { color: account.balance_cents < 0 ? theme.negative : theme.text },
                        ]}
                      >
                        {format(account.balance_cents)}
                      </ThemedText>
                    </Pressable>
                  ))}
                </View>
              ) : (
                <View style={[styles.accounts, { borderTopColor: theme.border }]}>
                  <ThemedText themeColor="textSecondary" type="small">
                    {t('child.emptyAccountsTitle')}
                  </ThemedText>
                </View>
              )}
            </Card>
          );
        }}
      />
      <Fab onPress={addChild} accessibilityLabel={t('kids.addChild')} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { padding: Spacing.three, gap: Spacing.three, flexGrow: 1 },
  summary: { alignItems: 'center', gap: Spacing.one, backgroundColor: Brand.goldSoft },
  summaryLabel: { letterSpacing: 0.5, color: Brand.goldDark },
  summaryTotal: { fontSize: 34, lineHeight: 42, fontWeight: '800', color: Brand.goldDark },
  childCard: { gap: 0 },
  childHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  childInfo: { flex: 1, gap: 2 },
  childName: { fontSize: 18, fontWeight: '700' },
  childTotal: { fontSize: 20, lineHeight: 26, fontWeight: '800' },
  accounts: {
    marginTop: Spacing.three,
    paddingTop: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: Spacing.one,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.one,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  accountName: { flex: 1, fontSize: 15, fontWeight: '500' },
  accountBalance: { fontSize: 15, fontWeight: '700' },
});
