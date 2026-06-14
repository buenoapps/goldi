import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AccentPalette, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  label?: string;
  value: string;
  onChange: (color: string) => void;
};

export function ColorPicker({ label, value, onChange }: Props) {
  const theme = useTheme();
  return (
    <View style={styles.container}>
      {label ? (
        <ThemedText themeColor="textSecondary" type="smallBold" style={styles.label}>
          {label}
        </ThemedText>
      ) : null}
      <View style={styles.swatches}>
        {AccentPalette.map((color) => {
          const selected = color === value;
          return (
            <Pressable
              key={color}
              accessibilityRole="button"
              onPress={() => onChange(color)}
              style={[
                styles.swatch,
                { backgroundColor: color },
                selected && { borderColor: theme.text, borderWidth: 3 },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.two },
  label: { textTransform: 'uppercase', letterSpacing: 0.5 },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  swatch: { width: 40, height: 40, borderRadius: 20 },
});
