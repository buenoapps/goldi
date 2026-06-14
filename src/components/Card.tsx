import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  accentColor?: string;
};

/** A rounded, soft-shadowed surface — the building block of every screen. */
export function Card({ children, onPress, style, accentColor }: Props) {
  const theme = useTheme();
  const content = (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.backgroundElement, borderColor: theme.border },
        accentColor ? { borderLeftColor: accentColor, borderLeftWidth: 4 } : null,
        style,
      ]}
    >
      {children}
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.large,
    padding: Spacing.three,
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
});
