import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, processLock, type SupabaseClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';

/**
 * Cliente de Supabase.
 *
 * Expo solo mete en la app las variables que empiezan por EXPO_PUBLIC_
 * y que se leen tal cual, por ejemplo process.env.EXPO_PUBLIC_SUPABASE_URL.
 * No vale construir el nombre: el empaquetador no lo vería.
 *
 * La clave anon es pública (viaja dentro de la app). Quien protege las filas
 * son las políticas RLS del SQL, no esconder esta clave.
 * La clave service_role no debe aparecer nunca aquí.
 *
 * AsyncStorage guarda la sesión en el teléfono. Al cerrar Toru y volver
 * a abrirlo, la persona sigue dentro sin escribir la contraseña.
 */

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? '';

const hasPlaceholder =
  supabaseUrl.includes('TU_PROYECTO') || supabaseAnonKey === 'tu-clave-anon';
const hasValues = supabaseUrl.length > 0 && supabaseAnonKey.length > 0;
const hasUrl = /^https?:\/\//.test(supabaseUrl);

export const isSupabaseConfigured = hasValues && hasUrl && !hasPlaceholder;

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        lock: processLock,
      },
    })
  : null;

export function getSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error('Supabase no está configurado. Crea el archivo .env a partir de .env.example.');
  }

  return supabase;
}

if (supabase) {
  AppState.addEventListener('change', (nextState) => {
    if (nextState === 'active') {
      void supabase.auth.startAutoRefresh();
    } else {
      void supabase.auth.stopAutoRefresh();
    }
  });
}
