
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { CartProvider } from '@/contexts/CartContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { PurchaseProvider } from '@/contexts/PurchaseContext';
import { runSupabaseSetup } from '@/utils/setupSupabase';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    // Run DB migration + seed on first launch (idempotent, guarded by AsyncStorage flag)
    runSupabaseSetup();
  }, []);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <AuthProvider>
      <PurchaseProvider>
        <CartProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
            <Stack.Screen name="formsheet" options={{ presentation: 'formSheet' }} />
            <Stack.Screen name="transparent-modal" options={{ presentation: 'transparentModal' }} />
          </Stack>
        </CartProvider>
      </PurchaseProvider>
    </AuthProvider>
  );
}
