import { Pressable, StyleSheet, Text } from 'react-native';

import { Brand, Radius } from '@/constants/theme';

type Props = {
  onPress: () => void;
  icon?: string;
  accessibilityLabel?: string;
};

/** A playful round "+" floating action button anchored bottom-right. */
export function Fab({ onPress, icon = '+', accessibilityLabel }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [styles.fab, { opacity: pressed ? 0.85 : 1 }]}
    >
      <Text style={styles.icon}>{icon}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 28,
    width: 60,
    height: 60,
    borderRadius: Radius.pill,
    backgroundColor: Brand.gold,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  icon: { fontSize: 32, color: '#FFFFFF', fontWeight: '700', lineHeight: 36 },
});
