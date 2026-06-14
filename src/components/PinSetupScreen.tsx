import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { PinPad, PIN_LENGTH } from '@/components/PinPad';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

type Props = {
  /** Called with the confirmed PIN once entry + confirmation match. */
  onComplete: (pin: string) => void | Promise<void>;
  /** Override copy (used by the change-PIN flow). */
  enterTitle?: string;
  subtitle?: string;
  showBranding?: boolean;
};

/** Two-step "enter, then confirm" PIN creation flow. */
export function PinSetupScreen({ onComplete, enterTitle, subtitle, showBranding = true }: Props) {
  const { t } = useTranslation();
  const [stage, setStage] = useState<'enter' | 'confirm'>('enter');
  const [first, setFirst] = useState('');
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleComplete = async (pin: string) => {
    if (stage === 'enter') {
      setFirst(pin);
      setValue('');
      setStage('confirm');
      return;
    }
    if (pin === first) {
      await onComplete(pin);
    } else {
      setError(t('pin.mismatch'));
      setValue('');
      setFirst('');
      setStage('enter');
    }
  };

  const onChange = (next: string) => {
    if (error && next.length < PIN_LENGTH) setError(null);
    setValue(next);
  };

  return (
    <Screen>
      <View style={styles.container}>
        {showBranding ? (
          <>
            <Text style={styles.mascot}>🐹</Text>
            <ThemedText type="title" style={styles.appName}>
              {t('common.appName')}
            </ThemedText>
          </>
        ) : null}
        <ThemedText type="subtitle" style={styles.title}>
          {stage === 'enter' ? (enterTitle ?? t('pin.setupTitle')) : t('pin.confirmTitle')}
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.subtitle}>
          {subtitle ?? t('pin.setupSubtitle')}
        </ThemedText>
        <PinPad value={value} onChange={onChange} onComplete={handleComplete} error={error} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.two },
  mascot: { fontSize: 56 },
  appName: { fontSize: 36, lineHeight: 40 },
  title: { fontSize: 22, lineHeight: 28, textAlign: 'center', marginTop: Spacing.two },
  subtitle: { textAlign: 'center', paddingHorizontal: Spacing.four, marginBottom: Spacing.two },
});
