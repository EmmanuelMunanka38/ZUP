import { useEffect, useState, Component, ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { tokenCache } from '@/utils/clerk';

// Dynamic import of Clerk to avoid native module crash in Expo client without native modules.
let ClerkProvider: any = ({ children }: any) => children;
let SignedIn: any = ({ children }: any) => children;
let SignedOut: any = ({ children }: any) => null;
try {
  const clerk = require('@clerk/clerk-expo');
  ClerkProvider = clerk.ClerkProvider;
  SignedIn = clerk.SignedIn;
  SignedOut = clerk.SignedOut;
} catch (e) {
  console.warn('Clerk native modules not available; running without Clerk auth wrapper.', e instanceof Error ? e.message : e);
}

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || '';

SplashScreen.preventAutoHideAsync();

const FONT_TIMEOUT_MS = 5000;

class ErrorBoundary extends Component<{ children: ReactNode }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>Please restart the app and try again.</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });
  const [fontTimedOut, setFontTimedOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFontTimedOut(true), FONT_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError || fontTimedOut) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, fontTimedOut]);

  if (!fontsLoaded && !fontError && !fontTimedOut) return null;

  return (
    <ErrorBoundary>
      <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
        <StatusBar style="dark" />
        <SignedIn>
          <Slot />
        </SignedIn>
        <SignedOut>
          <Slot />
        </SignedOut>
      </ClerkProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fcf9f8', padding: 32 },
  errorTitle: { fontSize: 20, fontWeight: '700', color: '#1c1b1b', marginBottom: 8 },
  errorMessage: { fontSize: 14, color: '#3d4a3e', textAlign: 'center' },
});
