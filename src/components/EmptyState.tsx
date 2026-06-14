import { StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

type Props = {
  emoji?: string;
  title: string;
  subtitle?: string;
};

export function EmptyState({ emoji = '🐹', title, subtitle }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emoji}</Text>
      <ThemedText type="subtitle" style={styles.title}>
        {title}
      </ThemedText>
      {subtitle ? (
        <ThemedText themeColor="textSecondary" style={styles.subtitle}>
          {subtitle}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
    gap: Spacing.two,
  },
  emoji: { fontSize: 64, marginBottom: Spacing.two },
  title: { textAlign: 'center', fontSize: 24, lineHeight: 30 },
  subtitle: { textAlign: 'center' },
});
