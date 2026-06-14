import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Loading } from '@/components/Loading';
import { PinSetupScreen } from '@/components/PinSetupScreen';
import { Brand, Colors } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { SettingsProvider, useSettings } from '@/context/SettingsContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { runStandingOrders } from '@/lib/standingOrders';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SettingsProvider>
          <AuthProvider>
            <Gate />
          </AuthProvider>
        </SettingsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function Gate() {
  const { ready } = useSettings();
  const { hasPin, createPin } = useAuth();
  const [bootstrapped, setBootstrapped] = useState(false);

  // Apply any due standing orders once the database is ready.
  useEffect(() => {
    if (!ready) return;
    (async () => {
      try {
        await runStandingOrders();
      } catch {
        /* non-fatal: surfaces stale balances at worst */
      } finally {
        setBootstrapped(true);
      }
    })();
  }, [ready]);

  if (!ready || hasPin === null || !bootstrapped) {
    return <Loading />;
  }

  if (hasPin === false) {
    return <PinSetupScreen onComplete={createPin} />;
  }

  return <Navigator />;
}

function Navigator() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const isDark = colorScheme === 'dark';
  const palette = isDark ? Colors.dark : Colors.light;
  const base = isDark ? DarkTheme : DefaultTheme;

  const navTheme = {
    ...base,
    colors: {
      ...base.colors,
      primary: Brand.gold,
      background: palette.background,
      card: palette.background,
      text: palette.text,
      border: palette.border,
    },
  };

  const headerOptions = {
    headerStyle: { backgroundColor: palette.background },
    headerTintColor: palette.text,
    headerShadowVisible: false,
    contentStyle: { backgroundColor: palette.background },
  } as const;

  return (
    <ThemeProvider value={navTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={headerOptions}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="lock" options={{ presentation: 'modal', title: t('pin.enterTitle') }} />
        <Stack.Screen name="child-form" options={{ presentation: 'modal' }} />
        <Stack.Screen name="account-form" options={{ presentation: 'modal' }} />
        <Stack.Screen name="transaction-form" options={{ presentation: 'modal' }} />
        <Stack.Screen name="standing-order-form" options={{ presentation: 'modal' }} />
        <Stack.Screen
          name="change-pin"
          options={{ presentation: 'modal', title: t('pin.changeTitle') }}
        />
        <Stack.Screen name="child/[id]" options={{ title: '' }} />
        <Stack.Screen name="account/[id]" options={{ title: '' }} />
      </Stack>
    </ThemeProvider>
  );
}
