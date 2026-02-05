console.log('ROOT LAYOUT EVALUATING');
import 'react-native-reanimated';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useColorScheme } from '@/components/useColorScheme';
import { useAuthStore } from '../store/authStore';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync().catch(() => {
  /* catch potential error on reload */
});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    console.log('Fonts loaded:', loaded, 'Error:', error);
    if (error) console.error('Font loading error:', error);
  }, [loaded, error]);

  useEffect(() => {
    if (loaded) {
      console.log('Setting ready state');
      setIsReady(true);
    }
    // Fallback timer to hide splash screen anyway after 5s
    const timer = setTimeout(() => {
      console.log('Fallback to ready state');
      setIsReady(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, [loaded]);

  useEffect(() => {
    if (isReady) {
      console.log('Hiding Splash Screen');
      SplashScreen.hideAsync().catch(() => { });
    }
  }, [isReady]);

  if (!isReady) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, initialize } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    console.log('Initializing Auth Store...');
    initialize().then(() => {
      console.log('Auth Store Initialized');
      setIsAuthReady(true);
    }).catch(() => setIsAuthReady(true));
  }, []);

  useEffect(() => {
    if (!isAuthReady) return;

    console.log('Auth State:', isAuthenticated, 'Segments:', segments);
    const inAuthGroup = segments[0] === '(tabs)';

    if (!isAuthenticated && inAuthGroup) {
      console.log('Redirecting to /login');
      router.replace('/login');
    } else if (isAuthenticated && !inAuthGroup) {
      console.log('Redirecting to /(tabs)');
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, isAuthReady]);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(onboarding)" />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          </Stack>
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
