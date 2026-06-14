import { StyleSheet, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  children: React.ReactNode;
  edges?: readonly Edge[];
  padded?: boolean;
};

/** Full-screen themed background with a centered, max-width content column. */
export function Screen({ children, edges = ['top', 'bottom'], padded = true }: Props) {
  const theme = useTheme();
  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.safe} edges={edges}>
        <View style={[styles.content, padded && styles.padded]}>{children}</View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1, alignItems: 'center' },
  content: { flex: 1, width: '100%', maxWidth: MaxContentWidth },
  padded: { paddingHorizontal: Spacing.three },
});
