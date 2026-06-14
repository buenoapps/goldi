import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Text, type ColorValue } from 'react-native';

import { Brand, Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

function TabEmoji({ emoji, color }: { emoji: string; color: ColorValue }) {
  return <Text style={{ fontSize: 22, color }}>{emoji}</Text>;
}

export default function TabsLayout() {
  const { t } = useTranslation();
  const isDark = useColorScheme() === 'dark';
  const palette = isDark ? Colors.dark : Colors.light;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Brand.gold,
        tabBarInactiveTintColor: palette.textSecondary,
        headerStyle: { backgroundColor: palette.background },
        headerTintColor: palette.text,
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '700' },
        tabBarStyle: {
          backgroundColor: palette.background,
          borderTopColor: palette.border,
        },
        sceneStyle: { backgroundColor: palette.background },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.kids'),
          tabBarIcon: ({ color }) => <TabEmoji emoji="🐹" color={color} />,
        }}
      />
      <Tabs.Screen
        name="standing-orders"
        options={{
          title: t('tabs.standingOrders'),
          tabBarIcon: ({ color }) => <TabEmoji emoji="🔁" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.settings'),
          tabBarIcon: ({ color }) => <TabEmoji emoji="⚙️" color={color} />,
        }}
      />
    </Tabs>
  );
}
