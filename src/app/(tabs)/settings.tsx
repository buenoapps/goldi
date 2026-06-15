import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { OptionGroup, type Option } from '@/components/forms/OptionGroup';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useSettings } from '@/context/SettingsContext';
import { useParentAction } from '@/hooks/use-parent-action';
import { useTheme } from '@/hooks/use-theme';
import { SUPPORTED_LANGUAGES, type Language } from '@/i18n';
import { exportCsv, exportJson, ImportError, importJsonFromPicker } from '@/lib/exportImport';
import { SUPPORTED_CURRENCIES } from '@/lib/money';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionTitle}>
        {title.toUpperCase()}
      </ThemedText>
      <Card>{children}</Card>
    </View>
  );
}

function ActionRow({
  label,
  onPress,
  last,
}: {
  label: string;
  onPress: () => void;
  last?: boolean;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.actionRow,
        !last && { borderBottomColor: theme.border, borderBottomWidth: StyleSheet.hairlineWidth },
      ]}
    >
      <ThemedText style={styles.actionLabel}>{label}</ThemedText>
      <Text style={[styles.chevron, { color: theme.textSecondary }]}>›</Text>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const guard = useParentAction();
  const { language, setLanguage, currency, setCurrency } = useSettings();

  const languageOptions: Option<Language>[] = SUPPORTED_LANGUAGES.map((lng) => ({
    value: lng,
    label: t(`settings.languages.${lng}`),
  }));
  const currencyOptions: Option<string>[] = SUPPORTED_CURRENCIES.map((c) => ({
    value: c,
    label: c,
  }));

  const runExportJson = () =>
    guard(async () => {
      try {
        await exportJson();
      } catch {
        Alert.alert(t('settings.importFailedTitle'));
      }
    });

  const runExportCsv = () =>
    guard(async () => {
      try {
        await exportCsv();
      } catch {
        Alert.alert(t('settings.importFailedTitle'));
      }
    });

  const runImport = () =>
    guard(() => {
      Alert.alert(t('settings.importConfirmTitle'), t('settings.importConfirmMessage'), [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          style: 'destructive',
          onPress: async () => {
            try {
              const done = await importJsonFromPicker();
              if (done) Alert.alert(t('settings.importSuccess'));
            } catch (e) {
              const key = e instanceof ImportError ? e.message : 'invalidFormat';
              Alert.alert(t('settings.importFailedTitle'), t(`settings.errors.${key}`));
            }
          },
        },
      ]);
    });

  return (
    <Screen edges={['bottom']} padded={false}>
      <ScrollView contentContainerStyle={styles.content}>
        <Section title={t('settings.children')}>
          <ActionRow label={t('settings.manageKids')} onPress={() => router.push('/kids')} last />
        </Section>

        <Section title={t('settings.language')}>
          <OptionGroup options={languageOptions} value={language} onChange={setLanguage} />
        </Section>

        <Section title={t('settings.currency')}>
          <OptionGroup options={currencyOptions} value={currency} onChange={setCurrency} />
        </Section>

        <Section title={t('settings.security')}>
          <ActionRow label={t('settings.changePin')} onPress={() => guard(() => router.push('/change-pin'))} last />
        </Section>

        <Section title={t('settings.data')}>
          <ActionRow label={t('settings.exportJson')} onPress={runExportJson} />
          <ActionRow label={t('settings.exportCsv')} onPress={runExportCsv} />
          <ActionRow label={t('settings.importJson')} onPress={runImport} last />
        </Section>

        <View style={styles.about}>
          <Text style={styles.mascot}>🐹</Text>
          <ThemedText style={styles.appName}>{t('common.appName')}</ThemedText>
          <ThemedText themeColor="textSecondary" type="small">
            {t('settings.tagline')}
          </ThemedText>
          <ThemedText themeColor="textSecondary" type="small">
            {t('settings.version')} {Constants.expoConfig?.version ?? '1.0.0'}
          </ThemedText>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.three, gap: Spacing.four },
  section: { gap: Spacing.two },
  sectionTitle: { letterSpacing: 0.5, paddingHorizontal: Spacing.one },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.three,
  },
  actionLabel: { fontSize: 16, fontWeight: '500' },
  chevron: { fontSize: 24, fontWeight: '300' },
  about: { alignItems: 'center', gap: Spacing.one, paddingVertical: Spacing.four },
  mascot: { fontSize: 48 },
  appName: { fontSize: 20, fontWeight: '800' },
});
