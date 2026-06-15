import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { ColorPicker } from '@/components/forms/ColorPicker';
import { EmojiPicker } from '@/components/forms/EmojiPicker';
import { TextField } from '@/components/forms/TextField';
import { HeaderButton } from '@/components/HeaderButton';
import { Screen } from '@/components/Screen';
import { AccentPalette, Spacing } from '@/constants/theme';
import { createChild, deleteChild, getChild, updateChild } from '@/db/queries';

export default function ChildFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const isEdit = !!id;

  const [name, setName] = useState('');
  const [color, setColor] = useState<string>(AccentPalette[0]);
  const [emoji, setEmoji] = useState('🐹');

  useEffect(() => {
    if (!id) return;
    getChild(id).then((child) => {
      if (child) {
        setName(child.name);
        setColor(child.color);
        setEmoji(child.emoji);
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
      await updateChild(id!, { name: trimmed, color, emoji });
    } else {
      await createChild({ name: trimmed, color, emoji });
    }
    router.back();
  };

  const remove = () => {
    Alert.alert(t('child.deleteConfirmTitle'), t('child.deleteConfirmMessage', { name }), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          await deleteChild(id!);
          router.dismissAll?.();
          router.replace('/');
        },
      },
    ]);
  };

  return (
    <Screen edges={['bottom']}>
      <Stack.Screen
        options={{
          title: isEdit ? t('child.editTitle') : t('child.newTitle'),
          headerLeft: () => <HeaderButton label={t('common.cancel')} onPress={() => router.back()} />,
          headerRight: () => <HeaderButton primary label={t('common.save')} onPress={save} />,
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <TextField
            label={t('child.name')}
            value={name}
            onChangeText={setName}
            placeholder={t('child.namePlaceholder')}
            autoFocus={!isEdit}
            returnKeyType="done"
            onSubmitEditing={save}
          />
          <EmojiPicker label={t('child.emoji')} value={emoji} onChange={setEmoji} />
          <ColorPicker label={t('child.color')} value={color} onChange={setColor} />

          {isEdit ? (
            <View style={styles.buttons}>
              <Button label={t('child.deleteChild')} variant="danger" onPress={remove} />
            </View>
          ) : null}
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
