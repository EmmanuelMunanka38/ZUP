import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
// Dynamic import of Clerk to avoid native module crash in Expo client without native modules.
// If Clerk native modules are missing (ExpoCryptoAES), fall back to no-op components so the app can run in the dev client.
let ClerkProvider: any = ({ children }: any) => children;
let SignedIn: any = ({ children }: any) => children;
let SignedOut: any = ({ children }: any) => children;
try {
  // require is used to avoid static evaluation by the bundler on environments where native modules are absent.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const clerk = require('@clerk/clerk-expo');
  ClerkProvider = clerk.ClerkProvider;
  SignedIn = clerk.SignedIn;
  SignedOut = clerk.SignedOut;
} catch (e) {
  // Log a warning so developer knows Clerk didn't initialize.
  // In production/native builds the require should succeed; ensure native modules are installed for Clerk.
  // eslint-disable-next-line no-console
  console.warn('Clerk native modules not available; running without Clerk auth wrapper.', e?.message || e);
}

import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { tokenCache } from '@/utils/clerk';

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || '';

SplashScreen.preventAutoHideAsync();

function RootStack() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="restaurant-details"
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="your-cart"
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen name="checkout" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="restaurant" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="driver" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
      <StatusBar style="dark" />
      <SignedIn>
        <RootStack />
      </SignedIn>
      <SignedOut>
        <RootStack />
      </SignedOut>
    </ClerkProvider>
  );
}
