import { Pressable, StyleSheet, Text } from 'react-native';

import { Brand, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  label: string;
  onPress: () => void;
  /** Emphasized (gold, bold) — used for the primary "Save" action. */
  primary?: boolean;
  disabled?: boolean;
};

/** A text button for navigation headers (e.g. Cancel / Save on modals). */
export function HeaderButton({ label, onPress, primary, disabled }: Props) {
  const theme = useTheme();
  return (
    <Pressable onPress={onPress} disabled={disabled} hitSlop={12}>
      <Text
        style={[
          styles.label,
          { color: primary ? Brand.gold : theme.text, fontWeight: primary ? '700' : '500' },
          disabled && styles.disabled,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 17, paddingHorizontal: Spacing.one },
  disabled: { opacity: 0.4 },
});
