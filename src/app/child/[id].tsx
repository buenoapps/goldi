import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { ChildAvatar } from '@/components/ChildAvatar';
import { EmptyState } from '@/components/EmptyState';
import { Fab } from '@/components/Fab';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { getChild, listAccountsWithBalance } from '@/db/queries';
import type { AccountWithBalance, Child } from '@/db/types';
import { useFocusData } from '@/hooks/use-focus-data';
import { useMoney } from '@/hooks/use-money';
import { useParentAction } from '@/hooks/use-parent-action';
import { useTheme } from '@/hooks/use-theme';

type Data = { child: Child | null; accounts: AccountWithBalance[] };

export default function ChildDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { format } = useMoney();
  const theme = useTheme();
  const guard = useParentAction();

  const { data } = useFocusData<Data>(
    useCallback(async () => {
      const [child, accounts] = await Promise.all([
        getChild(id),
        listAccountsWithBalance(id),
      ]);
      return { child, accounts };
    }, [id]),
  );

  const child = data?.child;
  const accounts = data?.accounts ?? [];
  const total = accounts.reduce((sum, a) => sum + a.balance_cents, 0);

  const editChild = () => guard(() => router.push(`/child-form?id=${id}`));
  const addAccount = () => guard(() => router.push(`/account-form?childId=${id}`));

  return (
    <View style={styles.flex}>
      <Stack.Screen
        options={{
          title: child?.name ?? '',
          headerRight: () => (
            <Pressable onPress={editChild} hitSlop={12}>
              <Text style={styles.editIcon}>✏️</Text>
            </Pressable>
          ),
        }}
      />

      <FlatList
        data={accounts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          child ? (
            <Card accentColor={child.color} style={styles.header}>
              <ChildAvatar emoji={child.emoji} color={child.color} size={64} />
              <ThemedText style={styles.name}>{child.name}</ThemedText>
              <ThemedText themeColor="textSecondary" type="small">
                {t('kids.totalBalance')}
              </ThemedText>
              <ThemedText
                style={[styles.total, { color: total < 0 ? theme.negative : theme.positive }]}
              >
                {format(total)}
              </ThemedText>
            </Card>
          ) : null
        }
        ListEmptyComponent={
          data ? (
            <EmptyState
              emoji="🏦"
              title={t('child.emptyAccountsTitle')}
              subtitle={t('child.emptyAccountsSubtitle')}
            />
          ) : null
        }
        renderItem={({ item }) => (
          <Card
            accentColor={item.color}
            onPress={() => router.push(`/account/${item.id}`)}
            style={styles.accountRow}
          >
            <View style={styles.accountInfo}>
              <ThemedText style={styles.accountName}>{item.name}</ThemedText>
            </View>
            <ThemedText
              style={[
                styles.accountBalance,
                { color: item.balance_cents < 0 ? theme.negative : theme.text },
              ]}
            >
              {format(item.balance_cents)}
            </ThemedText>
          </Card>
        )}
      />
      <Fab onPress={addAccount} accessibilityLabel={t('child.addAccount')} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { padding: Spacing.three, gap: Spacing.three, flexGrow: 1 },
  header: { alignItems: 'center', gap: Spacing.one },
  name: { fontSize: 22, fontWeight: '800', marginTop: Spacing.two },
  total: { fontSize: 32, fontWeight: '800' },
  editIcon: { fontSize: 20 },
  accountRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  accountInfo: { flex: 1 },
  accountName: { fontSize: 17, fontWeight: '600' },
  accountBalance: { fontSize: 18, fontWeight: '700' },
});
