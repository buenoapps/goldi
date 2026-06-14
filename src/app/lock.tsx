import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { PinPad, PIN_LENGTH } from '@/components/PinPad';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { consumePendingAction } from '@/lib/pendingAction';

export default function LockScreen() {
  const { t } = useTranslation();
  const { unlock } = useAuth();
  const router = useRouter();
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleComplete = async (pin: string) => {
    const ok = await unlock(pin);
    if (ok) {
      const action = consumePendingAction();
      if (router.canGoBack()) router.back();
      // Run the deferred parent action after dismissing the modal.
      setTimeout(() => action?.(), 0);
    } else {
      setError(t('pin.wrong'));
      setValue('');
    }
  };

  const onChange = (next: string) => {
    if (error && next.length < PIN_LENGTH) setError(null);
    setValue(next);
  };

  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.mascot}>🔒</Text>
        <ThemedText type="subtitle" style={styles.title}>
          {t('pin.enterTitle')}
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.subtitle}>
          {t('pin.enterSubtitle')}
        </ThemedText>
        <PinPad value={value} onChange={onChange} onComplete={handleComplete} error={error} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.two },
  mascot: { fontSize: 48 },
  title: { fontSize: 24, lineHeight: 30, textAlign: 'center' },
  subtitle: { textAlign: 'center', paddingHorizontal: Spacing.four, marginBottom: Spacing.two },
});
