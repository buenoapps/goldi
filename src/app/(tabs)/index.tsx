import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { ChildAvatar } from '@/components/ChildAvatar';
import { EmptyState } from '@/components/EmptyState';
import { Fab } from '@/components/Fab';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { listChildrenWithSummary, type ChildSummary } from '@/db/queries';
import { useFocusData } from '@/hooks/use-focus-data';
import { useMoney } from '@/hooks/use-money';
import { useParentAction } from '@/hooks/use-parent-action';
import { useTheme } from '@/hooks/use-theme';

export default function KidsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { format } = useMoney();
  const theme = useTheme();
  const guard = useParentAction();

  const { data: children } = useFocusData<ChildSummary[]>(
    useCallback(() => listChildrenWithSummary(), []),
  );

  const addChild = () => guard(() => router.push('/child-form'));

  return (
    <View style={styles.flex}>
      <FlatList
        data={children ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          children ? (
            <EmptyState title={t('kids.emptyTitle')} subtitle={t('kids.emptySubtitle')} />
          ) : null
        }
        renderItem={({ item }) => (
          <Card
            accentColor={item.color}
            onPress={() => router.push(`/child/${item.id}`)}
            style={styles.card}
          >
            <ChildAvatar emoji={item.emoji} color={item.color} />
            <View style={styles.cardBody}>
              <ThemedText style={styles.name}>{item.name}</ThemedText>
              <ThemedText themeColor="textSecondary" type="small">
                {t('kids.accountsCount', { count: item.account_count })}
              </ThemedText>
            </View>
            <View style={styles.balanceBox}>
              <ThemedText themeColor="textSecondary" type="small">
                {t('kids.totalBalance')}
              </ThemedText>
              <ThemedText
                style={[
                  styles.balance,
                  { color: item.total_cents < 0 ? theme.negative : theme.positive },
                ]}
              >
                {format(item.total_cents)}
              </ThemedText>
            </View>
          </Card>
        )}
      />
      <Fab onPress={addChild} accessibilityLabel={t('kids.addChild')} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { padding: Spacing.three, gap: Spacing.three, flexGrow: 1 },
  card: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  cardBody: { flex: 1, gap: 2 },
  name: { fontSize: 18, fontWeight: '700' },
  balanceBox: { alignItems: 'flex-end' },
  balance: { fontSize: 18, fontWeight: '800' },
});
