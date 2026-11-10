import { router, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { IconButton } from '@/components/ui';
import { registerServiceWorker } from '@/lib/serviceWorker';
import { applyWebPolish } from '@/lib/webPolish';
import { useHydrated } from '@/store/useStore';
import { C, navTheme, T } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});
applyWebPolish();
registerServiceWorker();

/**
 * Back button for the web app's title bar: a full 44 px target in place of the stock 30 px one.
 * A page opened directly (a reload, a link) has nowhere to go back to, so there it goes to Today.
 */
function WebBackButton({ canGoBack }: { canGoBack?: boolean }) {
  return (
    <IconButton
      plain
      icon="chevron-back"
      size={24}
      label={canGoBack ? 'Back' : 'Back to Today'}
      onPress={() => (canGoBack ? router.back() : router.replace('/'))}
    />
  );
}

export default function RootLayout() {
  const hydrated = useHydrated();

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(C.bg).catch(() => {});
  }, []);

  useEffect(() => {
    if (hydrated) SplashScreen.hideAsync().catch(() => {});
  }, [hydrated]);

  if (!hydrated) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: C.bg }}>
      <ThemeProvider value={navTheme}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: C.bg },
            headerTintColor: C.text,
            headerTitleStyle: { fontSize: T.button.fontSize, fontWeight: T.button.fontWeight },
            headerTitleAlign: 'center',
            headerShadowVisible: false,
            headerBackButtonDisplayMode: 'minimal',
            // The phone apps keep their own system back button.
            headerLeft: Platform.OS === 'web' ? WebBackButton : undefined,
            contentStyle: { backgroundColor: C.bg },
          }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="workout" options={{ headerShown: false, gestureEnabled: false }} />
          <Stack.Screen name="routine/[id]" options={{ title: '' }} />
          <Stack.Screen name="exercise/[id]" options={{ title: '' }} />
          <Stack.Screen name="history/index" options={{ title: 'History' }} />
          <Stack.Screen name="history/[id]" options={{ title: '' }} />
          <Stack.Screen name="guide/[slug]" options={{ title: '' }} />
          <Stack.Screen name="exercises" options={{ title: 'Exercises' }} />
          <Stack.Screen name="settings" options={{ title: 'Settings' }} />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
