import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Brand } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function Loading() {
  const theme = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={styles.mascot}>🐹</Text>
      <ActivityIndicator color={Brand.gold} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  mascot: { fontSize: 56 },
});
