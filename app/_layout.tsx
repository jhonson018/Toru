import 'react-native-gesture-handler';

import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { GestureRoot } from '@/components/GestureRoot';
import { LoadingView } from '@/components/LoadingView';
import { AuthProvider, useAuth } from '@/features/auth/AuthProvider';
import { queryClient } from '@/lib/query-client';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { useToruFonts } from '@/theme/fonts';
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';

/**
 * Expo Router convierte cada archivo de esta carpeta en una pantalla.
 * Los paréntesis de (auth) y (app) agrupan rutas sin aparecer en la URL:
 * (auth)/login.tsx se abre en /login.
 *
 * Este archivo envuelve todas las pantallas con el tema, la caché de datos
 * y la sesión. No pinta una pantalla propia.
 */

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RootShell />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

function RootShell() {
  const theme = useTheme();
  const { isLoading } = useAuth();
  const fontsLoaded = useToruFonts();

  useEffect(() => {
    if (fontsLoaded && (!isSupabaseConfigured || !isLoading)) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isLoading]);

  return (
    <GestureRoot style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar style={theme.statusBar} />
      {!fontsLoaded ? null : isLoading ? (
        <LoadingView label="Comprobando la sesión…" fill />
      ) : (
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.colors.background },
          }}
        >
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(app)" />
          <Stack.Screen name="nueva-contrasena" />
        </Stack>
      )}
    </GestureRoot>
  );
}
