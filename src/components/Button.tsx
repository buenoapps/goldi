import { ActivityIndicator, Pressable, StyleSheet, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Brand, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  icon,
  style,
}: Props) {
  const theme = useTheme();

  const background =
    variant === 'primary'
      ? Brand.gold
      : variant === 'danger'
        ? theme.negative
        : variant === 'secondary'
          ? theme.backgroundSelected
          : 'transparent';

  const textColor =
    variant === 'primary' || variant === 'danger'
      ? '#FFFFFF'
      : variant === 'ghost'
        ? theme.tint
        : theme.text;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: background, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
        variant === 'ghost' && styles.ghost,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <>
          {icon}
          <ThemedText style={[styles.label, { color: textColor }]}>{label}</ThemedText>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: Radius.medium,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  ghost: {
    minHeight: 44,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
  },
});
