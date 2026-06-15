import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { AmountInput } from '@/components/forms/AmountInput';
import { OptionGroup, type Option } from '@/components/forms/OptionGroup';
import { TextField } from '@/components/forms/TextField';
import { HeaderButton } from '@/components/HeaderButton';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useSettings } from '@/context/SettingsContext';
import {
  createStandingOrder,
  deleteStandingOrder,
  getStandingOrder,
  listAllAccountsForPicker,
  updateStandingOrder,
} from '@/db/queries';
import type { IntervalUnit } from '@/db/types';
import { todayISO } from '@/lib/dates';
import { parseAmountToCents } from '@/lib/money';

type Direction = 'deposit' | 'withdrawal';

export default function StandingOrderFormScreen() {
  const { id, accountId: presetAccount } = useLocalSearchParams<{
    id?: string;
    accountId?: string;
  }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { currency } = useSettings();
  const isEdit = !!id;

  const [accounts, setAccounts] = useState<Option<string>[]>([]);
  const [accountId, setAccountId] = useState<string>(presetAccount ?? '');
  const [direction, setDirection] = useState<Direction>('deposit');
  const [amount, setAmount] = useState('');
  const [interval, setInterval] = useState<IntervalUnit>('weekly');
  const [comment, setComment] = useState('');

  useEffect(() => {
    listAllAccountsForPicker().then((rows) => {
      const opts = rows.map((r) => ({ value: r.id, label: r.label }));
      setAccounts(opts);
      if (!presetAccount && !id && opts[0]) setAccountId((prev) => prev || opts[0].value);
    });
  }, [presetAccount, id]);

  useEffect(() => {
    if (!id) return;
    getStandingOrder(id).then((order) => {
      if (order) {
        setAccountId(order.account_id);
        setDirection(order.amount_cents < 0 ? 'withdrawal' : 'deposit');
        setAmount((Math.abs(order.amount_cents) / 100).toString());
        setInterval(order.interval);
        setComment(order.comment);
      }
    });
  }, [id]);

  const directionOptions: Option<Direction>[] = [
    { value: 'deposit', label: t('transaction.types.deposit') },
    { value: 'withdrawal', label: t('transaction.types.withdrawal') },
  ];
  const intervalOptions: Option<IntervalUnit>[] = [
    { value: 'weekly', label: t('standingOrders.intervals.weekly') },
    { value: 'biweekly', label: t('standingOrders.intervals.biweekly') },
    { value: 'monthly', label: t('standingOrders.intervals.monthly') },
  ];

  const save = async () => {
    const value = parseAmountToCents(amount);
    if (value === null || value === 0) {
      Alert.alert(t('transaction.invalidAmount'));
      return;
    }
    const signed = direction === 'withdrawal' ? -value : value;
    if (isEdit) {
      await updateStandingOrder(id!, { amountCents: signed, interval, comment: comment.trim() });
    } else {
      if (!accountId) return;
      await createStandingOrder({
        accountId,
        amountCents: signed,
        interval,
        startDate: todayISO(),
        comment: comment.trim(),
      });
    }
    router.back();
  };

  const remove = () => {
    Alert.alert(t('standingOrders.deleteConfirmTitle'), t('standingOrders.deleteConfirmMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          await deleteStandingOrder(id!);
          router.back();
        },
      },
    ]);
  };

  return (
    <Screen edges={['bottom']}>
      <Stack.Screen
        options={{
          title: isEdit ? t('standingOrders.editTitle') : t('standingOrders.newTitle'),
          headerLeft: () => <HeaderButton label={t('common.cancel')} onPress={() => router.back()} />,
          headerRight: () => <HeaderButton primary label={t('common.save')} onPress={save} />,
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {!isEdit ? (
            <OptionGroup
              label={t('standingOrders.selectAccount')}
              options={accounts}
              value={accountId}
              onChange={setAccountId}
            />
          ) : null}

          <ThemedText themeColor="textSecondary" type="smallBold" style={styles.label}>
            {t('standingOrders.amount').toUpperCase()}
          </ThemedText>
          <AmountInput value={amount} onChangeText={setAmount} currency={currency} />

          <OptionGroup
            label={t('standingOrders.direction')}
            options={directionOptions}
            value={direction}
            onChange={setDirection}
          />
          <OptionGroup
            label={t('standingOrders.interval')}
            options={intervalOptions}
            value={interval}
            onChange={setInterval}
          />
          <TextField
            label={t('standingOrders.comment')}
            value={comment}
            onChangeText={setComment}
            placeholder={t('standingOrders.commentPlaceholder')}
          />

          {isEdit ? (
            <View style={styles.buttons}>
              <Button label={t('common.delete')} variant="danger" onPress={remove} />
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { gap: Spacing.three, paddingVertical: Spacing.three },
  label: { letterSpacing: 0.5 },
  buttons: { gap: Spacing.two, marginTop: Spacing.two },
});
