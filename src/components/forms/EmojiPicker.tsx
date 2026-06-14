import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const EMOJIS = ['🐹', '🐰', '🦊', '🐻', '🐼', '🐯', '🦁', '🐸', '🐵', '🦄', '🐶', '🐱'];

type Props = {
  label?: string;
  value: string;
  onChange: (emoji: string) => void;
};

export function EmojiPicker({ label, value, onChange }: Props) {
  const theme = useTheme();
  return (
    <View style={styles.container}>
      {label ? (
        <ThemedText themeColor="textSecondary" type="smallBold" style={styles.label}>
          {label}
        </ThemedText>
      ) : null}
      <View style={styles.grid}>
        {EMOJIS.map((emoji) => {
          const selected = emoji === value;
          return (
            <Pressable
              key={emoji}
              accessibilityRole="button"
              onPress={() => onChange(emoji)}
              style={[
                styles.cell,
                { backgroundColor: theme.backgroundElement, borderColor: theme.border },
                selected && { borderColor: theme.tint, borderWidth: 2 },
              ]}
            >
              <Text style={styles.emoji}>{emoji}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.two },
  label: { textTransform: 'uppercase', letterSpacing: 0.5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  cell: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 24 },
});
