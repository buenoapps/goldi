import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { AmountInput } from '@/components/forms/AmountInput';
import { TextField } from '@/components/forms/TextField';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useSettings } from '@/context/SettingsContext';
import { createTransaction } from '@/db/queries';
import { useMoney } from '@/hooks/use-money';
import { useTheme } from '@/hooks/use-theme';
import { dateLocaleFor } from '@/i18n';
import { formatDisplayDate, todayISO } from '@/lib/dates';
import { parseAmountToCents } from '@/lib/money';

export default function TransactionFormScreen() {
  const { accountId, type } = useLocalSearchParams<{
    accountId: string;
    type: 'deposit' | 'withdrawal';
  }>();
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { currency } = useSettings();
  const { format } = useMoney();
  const theme = useTheme();

  const isWithdrawal = type === 'withdrawal';
  const [amount, setAmount] = useState('');
  const [comment, setComment] = useState('');
  const today = todayISO();

  const cents = parseAmountToCents(amount) ?? 0;
  const tint = isWithdrawal ? theme.negative : theme.positive;

  const save = async () => {
    const value = parseAmountToCents(amount);
    if (value === null || value === 0) {
      Alert.alert(t('transaction.invalidAmount'));
      return;
    }
    await createTransaction({
      accountId,
      amountCents: isWithdrawal ? -value : value,
      comment: comment.trim(),
      type: isWithdrawal ? 'withdrawal' : 'deposit',
    });
    router.back();
  };

  return (
    <Screen edges={['bottom']}>
      <Stack.Screen
        options={{ title: isWithdrawal ? t('transaction.removeTitle') : t('transaction.addTitle') }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <ThemedText themeColor="textSecondary" type="smallBold" style={styles.label}>
            {t('transaction.amount').toUpperCase()}
          </ThemedText>
          <AmountInput
            value={amount}
            onChangeText={setAmount}
            currency={currency}
            tint={cents > 0 ? tint : undefined}
            autoFocus
          />

          <TextField
            label={t('transaction.comment')}
            value={comment}
            onChangeText={setComment}
            placeholder={
              isWithdrawal
                ? t('transaction.commentPlaceholderWithdrawal')
                : t('transaction.commentPlaceholderDeposit')
            }
            returnKeyType="done"
            onSubmitEditing={save}
          />

          <View style={[styles.dateRow, { borderColor: theme.border }]}>
            <ThemedText themeColor="textSecondary">{t('transaction.date')}</ThemedText>
            <ThemedText>{formatDisplayDate(today, dateLocaleFor(i18n.language))}</ThemedText>
          </View>

          <Button
            label={
              cents > 0
                ? `${isWithdrawal ? t('account.removeMoney') : t('account.addMoney')} · ${format(cents)}`
                : isWithdrawal
                  ? t('account.removeMoney')
                  : t('account.addMoney')
            }
            variant={isWithdrawal ? 'danger' : 'primary'}
            onPress={save}
            style={styles.saveBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { gap: Spacing.three, paddingVertical: Spacing.three },
  label: { letterSpacing: 0.5 },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  saveBtn: { marginTop: Spacing.two },
});
