import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Brand, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export const PIN_LENGTH = 4;

type Props = {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  error?: string | null;
};

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

/** A 4-digit numeric PIN entry with dot indicators. */
export function PinPad({ value, onChange, onComplete, error }: Props) {
  const theme = useTheme();

  useEffect(() => {
    if (value.length === PIN_LENGTH) {
      onComplete?.(value);
    }
    // Only fire when a full PIN is entered.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const press = (key: string) => {
    if (key === 'del') {
      onChange(value.slice(0, -1));
    } else if (key && value.length < PIN_LENGTH) {
      onChange(value + key);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.dots}>
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { borderColor: error ? theme.negative : theme.textSecondary },
              i < value.length && {
                backgroundColor: error ? theme.negative : Brand.gold,
                borderColor: error ? theme.negative : Brand.gold,
              },
            ]}
          />
        ))}
      </View>

      {error ? (
        <ThemedText style={[styles.error, { color: theme.negative }]}>{error}</ThemedText>
      ) : (
        <View style={styles.errorSpacer} />
      )}

      <View style={styles.pad}>
        {KEYS.map((key, i) =>
          key === '' ? (
            <View key={i} style={styles.key} />
          ) : (
            <Pressable
              key={i}
              accessibilityRole="button"
              accessibilityLabel={key === 'del' ? 'delete' : key}
              onPress={() => press(key)}
              style={({ pressed }) => [
                styles.key,
                {
                  backgroundColor: pressed ? theme.backgroundSelected : theme.backgroundElement,
                  borderColor: theme.border,
                },
              ]}
            >
              <ThemedText style={styles.keyLabel}>{key === 'del' ? '⌫' : key}</ThemedText>
            </Pressable>
          ),
        )}
      </View>
    </View>
  );
}

const KEY_SIZE = 72;

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: Spacing.three },
  dots: { flexDirection: 'row', gap: Spacing.three, marginTop: Spacing.two },
  dot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2 },
  error: { fontWeight: '600' },
  errorSpacer: { height: 24 },
  pad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: KEY_SIZE * 3 + Spacing.three * 2,
    gap: Spacing.three,
    justifyContent: 'center',
  },
  key: {
    width: KEY_SIZE,
    height: KEY_SIZE,
    borderRadius: KEY_SIZE / 2,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyLabel: { fontSize: 28, fontWeight: '600' },
});
