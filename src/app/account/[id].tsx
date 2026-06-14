import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { ThemedText } from '@/components/themed-text';
import { TransactionRow } from '@/components/TransactionRow';
import { Spacing } from '@/constants/theme';
import { deleteTransaction, getAccount, listTransactions } from '@/db/queries';
import type { Account, Transaction } from '@/db/types';
import { useFocusData } from '@/hooks/use-focus-data';
import { useMoney } from '@/hooks/use-money';
import { useParentAction } from '@/hooks/use-parent-action';
import { useTheme } from '@/hooks/use-theme';

type Data = { account: Account | null; transactions: Transaction[] };

export default function AccountDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { format } = useMoney();
  const theme = useTheme();
  const guard = useParentAction();

  const { data, reload } = useFocusData<Data>(
    useCallback(async () => {
      const [account, transactions] = await Promise.all([
        getAccount(id),
        listTransactions(id),
      ]);
      return { account, transactions };
    }, [id]),
  );

  const account = data?.account;
  const transactions = data?.transactions ?? [];
  const balance = transactions.reduce((sum, tx) => sum + tx.amount_cents, 0);

  const addMoney = () => guard(() => router.push(`/transaction-form?accountId=${id}&type=deposit`));
  const removeMoney = () =>
    guard(() => router.push(`/transaction-form?accountId=${id}&type=withdrawal`));
  const editAccount = () => guard(() => router.push(`/account-form?id=${id}`));

  const confirmDelete = (tx: Transaction) =>
    guard(() =>
      Alert.alert(t('transaction.deleteConfirmTitle'), t('transaction.deleteConfirmMessage'), [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            await deleteTransaction(tx.id);
            reload();
          },
        },
      ]),
    );

  return (
    <View style={styles.flex}>
      <Stack.Screen
        options={{
          title: account?.name ?? '',
          headerRight: () => (
            <Pressable onPress={editAccount} hitSlop={12}>
              <Text style={styles.editIcon}>✏️</Text>
            </Pressable>
          ),
        }}
      />

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.headerWrap}>
            <Card accentColor={account?.color} style={styles.balanceCard}>
              <ThemedText themeColor="textSecondary" type="small">
                {t('account.balance')}
              </ThemedText>
              <ThemedText
                style={[styles.balance, { color: balance < 0 ? theme.negative : theme.positive }]}
              >
                {format(balance)}
              </ThemedText>
              <View style={styles.actions}>
                <Button
                  label={t('account.addMoney')}
                  variant="primary"
                  onPress={addMoney}
                  style={styles.actionBtn}
                />
                <Button
                  label={t('account.removeMoney')}
                  variant="secondary"
                  onPress={removeMoney}
                  style={styles.actionBtn}
                />
              </View>
            </Card>
            {transactions.length > 0 ? (
              <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionTitle}>
                {t('account.history').toUpperCase()}
              </ThemedText>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          data ? (
            <EmptyState
              emoji="📜"
              title={t('account.emptyHistoryTitle')}
              subtitle={t('account.emptyHistorySubtitle')}
            />
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable onLongPress={() => confirmDelete(item)}>
            <TransactionRow tx={item} />
          </Pressable>
        )}
        ItemSeparatorComponent={() => (
          <View style={[styles.separator, { backgroundColor: theme.border }]} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { padding: Spacing.three, gap: 0, flexGrow: 1 },
  headerWrap: { gap: Spacing.three, marginBottom: Spacing.two },
  balanceCard: { alignItems: 'center', gap: Spacing.one },
  balance: { fontSize: 40, fontWeight: '800', marginBottom: Spacing.two },
  actions: { flexDirection: 'row', gap: Spacing.two, alignSelf: 'stretch' },
  actionBtn: { flex: 1 },
  sectionTitle: { letterSpacing: 0.5 },
  editIcon: { fontSize: 20 },
  separator: { height: StyleSheet.hairlineWidth, marginLeft: 38 },
});
