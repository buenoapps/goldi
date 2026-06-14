import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { ColorPicker } from '@/components/forms/ColorPicker';
import { TextField } from '@/components/forms/TextField';
import { Screen } from '@/components/Screen';
import { AccentPalette, Spacing } from '@/constants/theme';
import { createAccount, deleteAccount, getAccount, updateAccount } from '@/db/queries';

export default function AccountFormScreen() {
  const { id, childId } = useLocalSearchParams<{ id?: string; childId?: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const isEdit = !!id;

  const [name, setName] = useState('');
  const [color, setColor] = useState<string>(AccentPalette[1]);

  useEffect(() => {
    if (!id) return;
    getAccount(id).then((account) => {
      if (account) {
        setName(account.name);
        setColor(account.color);
      }
    });
  }, [id]);

  const save = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert(t('validation.nameRequired'));
      return;
    }
    if (isEdit) {
      await updateAccount(id!, { name: trimmed, color });
    } else if (childId) {
      await createAccount({ childId, name: trimmed, color });
    }
    router.back();
  };

  const remove = () => {
    Alert.alert(t('account.deleteConfirmTitle'), t('account.deleteConfirmMessage', { name }), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          await deleteAccount(id!);
          // Return past the account-detail screen to the child screen.
          router.back();
          router.back();
        },
      },
    ]);
  };

  return (
    <Screen edges={['bottom']}>
      <Stack.Screen options={{ title: isEdit ? t('account.editTitle') : t('account.newTitle') }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <TextField
            label={t('account.name')}
            value={name}
            onChangeText={setName}
            placeholder={t('account.namePlaceholder')}
            autoFocus={!isEdit}
            returnKeyType="done"
            onSubmitEditing={save}
          />
          <ColorPicker label={t('account.color')} value={color} onChange={setColor} />

          <View style={styles.buttons}>
            <Button label={t('common.save')} onPress={save} />
            {isEdit ? (
              <Button label={t('account.deleteAccount')} variant="danger" onPress={remove} />
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { gap: Spacing.four, paddingVertical: Spacing.three },
  buttons: { gap: Spacing.two, marginTop: Spacing.two },
});
