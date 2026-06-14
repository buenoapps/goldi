import { StyleSheet, Text, View } from 'react-native';

type Props = {
  emoji: string;
  color: string;
  size?: number;
};

/** A circular, color-tinted avatar showing the child's chosen emoji. */
export function ChildAvatar({ emoji, color, size = 48 }: Props) {
  return (
    <View
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: color + '26' },
      ]}
    >
      <Text style={{ fontSize: size * 0.5 }}>{emoji}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
