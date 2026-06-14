import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = TextInputProps & {
  label?: string;
};

export function TextField({ label, style, ...rest }: Props) {
  const theme = useTheme();
  return (
    <View style={styles.container}>
      {label ? (
        <ThemedText themeColor="textSecondary" type="smallBold" style={styles.label}>
          {label}
        </ThemedText>
      ) : null}
      <TextInput
        placeholderTextColor={theme.textSecondary}
        style={[
          styles.input,
          {
            backgroundColor: theme.backgroundElement,
            borderColor: theme.border,
            color: theme.text,
          },
          style,
        ]}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.one },
  label: { textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    minHeight: 52,
    borderRadius: Radius.medium,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
  },
});
