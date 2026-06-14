import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { currencySymbol } from '@/lib/money';

type Props = {
  value: string;
  onChangeText: (value: string) => void;
  currency: string;
  tint?: string;
  autoFocus?: boolean;
};

/** A large, centered amount entry with the currency symbol up front. */
export function AmountInput({ value, onChangeText, currency, tint, autoFocus }: Props) {
  const theme = useTheme();
  const color = tint ?? theme.text;
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.backgroundElement, borderColor: theme.border },
      ]}
    >
      <Text style={[styles.symbol, { color }]}>{currencySymbol(currency).trim()}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType="decimal-pad"
        placeholder="0.00"
        placeholderTextColor={theme.textSecondary}
        autoFocus={autoFocus}
        style={[styles.input, { color }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    borderRadius: Radius.large,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.three,
  },
  symbol: { fontSize: 40, fontWeight: '700' },
  input: { fontSize: 48, fontWeight: '800', minWidth: 120, textAlign: 'center' },
});
