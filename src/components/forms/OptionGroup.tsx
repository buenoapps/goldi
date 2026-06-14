import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  label?: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
};

/** A vertically stacked single-select list (used for intervals, accounts…). */
export function OptionGroup<T extends string>({ label, options, value, onChange }: Props<T>) {
  const theme = useTheme();
  return (
    <View style={styles.container}>
      {label ? (
        <ThemedText themeColor="textSecondary" type="smallBold" style={styles.label}>
          {label}
        </ThemedText>
      ) : null}
      <View style={[styles.group, { borderColor: theme.border }]}>
        {options.map((opt, index) => {
          const selected = opt.value === value;
          return (
            <Pressable
              key={opt.value}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => onChange(opt.value)}
              style={[
                styles.row,
                {
                  backgroundColor: selected ? theme.backgroundSelected : theme.backgroundElement,
                  borderTopColor: theme.border,
                  borderTopWidth: index === 0 ? 0 : StyleSheet.hairlineWidth,
                },
              ]}
            >
              <ThemedText style={styles.optionLabel}>{opt.label}</ThemedText>
              <View
                style={[
                  styles.radio,
                  { borderColor: selected ? theme.tint : theme.border },
                  selected && { borderWidth: 7 },
                ]}
              />
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
  group: {
    borderRadius: Radius.medium,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    minHeight: 52,
  },
  optionLabel: { fontSize: 16, fontWeight: '500', flex: 1 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2 },
});
