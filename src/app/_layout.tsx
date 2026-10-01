import { useEffect } from 'react';
import { IBMPlexMono_500Medium } from '@expo-google-fonts/ibm-plex-mono';
import {
  Sora_400Regular,
  Sora_500Medium,
  Sora_600SemiBold,
} from '@expo-google-fonts/sora';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { useReducedMotion } from 'react-native-reanimated';
import { StoreProvider, useStore } from '@/data/store';
import { fonts, useTheme } from '@/theme';
import { Button, EmptyState, ScrollScreen } from '@/ui';

export const unstable_settings = { initialRouteName: 'index' };

void SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ fade: true, duration: 200 });

// Android aligns header titles left by default, which crowds the title against
// a text button like Cancel. Modals carry buttons on both sides, so center it.
const modalOptions = {
  presentation: 'modal',
  headerTitleAlign: 'center',
} as const;

export default function RootLayout() {
  const [loaded, error] = useFonts({
    IBMPlexMono_500Medium,
    Sora_400Regular,
    Sora_500Medium,
    Sora_600SemiBold,
  });
  if (!loaded && !error) return null;
  return (
    <KeyboardProvider>
      <StoreProvider>
        <StatusBar style="auto" />
        <Navigator />
      </StoreProvider>
    </KeyboardProvider>
  );
}

function Navigator() {
  const { colors } = useTheme();
  const { status, retry } = useStore();
  const reduceMotion = useReducedMotion();

  /** Keep the splash up until stored records are readable, so nothing flashes. */
  useEffect(() => {
    if (status.kind !== 'loading') SplashScreen.hide();
  }, [status.kind]);

  if (status.kind === 'loading') return null;
  if (status.kind === 'failed')
    return (
      <ScrollScreen>
        <EmptyState
          icon="alert"
          title="Deliveries could not open"
          body={status.error}
        >
          <Button label="Try again" onPress={retry} />
        </EmptyState>
      </ScrollScreen>
    );

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.canvas },
        headerTintColor: colors.ink,
        headerTitleStyle: { fontFamily: fonts.semibold, color: colors.ink },
        headerLargeTitleStyle: {
          fontFamily: fonts.semibold,
          color: colors.ink,
        },
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: colors.canvas },
        animation: reduceMotion ? 'fade' : 'default',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Deliveries',
          headerLargeTitleEnabled: true,
          // iOS 26 hides a large title drawn over a solid header color.
          ...(Platform.OS === 'ios' && { headerStyle: {} }),
        }}
      />
      <Stack.Screen
        name="new"
        options={{ title: 'New delivery', ...modalOptions }}
      />
      <Stack.Screen name="delivery/[id]" options={{ title: 'Delivery' }} />
      <Stack.Screen
        name="confirm/[id]"
        options={{ title: 'Record handoff', ...modalOptions }}
      />
      <Stack.Screen name="about" options={{ title: 'About' }} />
    </Stack>
  );
}
