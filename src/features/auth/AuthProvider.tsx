import type { Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { demoSession } from '@/demo/cabin';
import { getSupabase, isSupabaseConfigured, supabase } from '@/lib/supabase/client';
import { translateAuthError } from '@/lib/supabase/errors';
import { queryClient } from '@/lib/query-client';

/**
 * La sesión vive en AsyncStorage (ver el cliente de Supabase) y sobrevive
 * al cerrar la app. onAuthStateChange avisa de entrar, salir y de
 * PASSWORD_RECOVERY, que es el enlace del correo de "olvidé la contraseña".
 */

type SignUpInput = {
  email: string;
  password: string;
  fullName: string;
  callsign: string;
};

type AuthContextValue = {
  session: Session | null;
  isLoading: boolean;
  pendingRecovery: boolean;
  signIn: (identifier: string, password: string) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<{ needsEmailConfirmation: boolean }>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  clearRecovery: () => void;
  signOut: () => Promise<void>;
  unlocked: boolean;
  unlock: () => void;
  demoMode: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function emailForIdentifier(identifier: string): Promise<string> {
  const value = identifier.trim();
  if (value.includes('@')) {
    return value;
  }

  const { data, error } = await getSupabase().rpc('email_for_callsign', { p_callsign: value });
  if (error) {
    throw error;
  }
  if (typeof data !== 'string' || data.length === 0) {
    throw new Error('No hay un piloto con ese indicativo.');
  }
  return data;
}

async function captureRecoveryUrl(url: string | null): Promise<boolean> {
  if (!url || !supabase) {
    return false;
  }

  const fragment = url.includes('#') ? url.split('#')[1] : (url.split('?')[1] ?? '');
  const params = new URLSearchParams(fragment);
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  if (!accessToken || !refreshToken || params.get('type') !== 'recovery') {
    return false;
  }

  const { error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  if (error) {
    throw error;
  }
  return true;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => {
    if (isSupabaseConfigured || typeof sessionStorage === 'undefined') return null;
    return sessionStorage.getItem('toru.demo') === '1' ? demoSession() : null;
  });
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);
  const [pendingRecovery, setPendingRecovery] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      return;
    }

    const client = supabase;
    const { data } = client.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      setIsLoading(false);
      if (event === 'PASSWORD_RECOVERY') {
        setPendingRecovery(true);
      }
      if (event === 'SIGNED_OUT') {
        setPendingRecovery(false);
      }
    });

    void Linking.getInitialURL().then((url) => {
      void captureRecoveryUrl(url).then((isRecovery) => {
        if (isRecovery) setPendingRecovery(true);
      });
    });

    const subscription = Linking.addEventListener('url', ({ url }) => {
      void captureRecoveryUrl(url).then((isRecovery) => {
        if (isRecovery) setPendingRecovery(true);
      });
    });

    return () => {
      data.subscription.unsubscribe();
      subscription.remove();
    };
  }, []);

  const signIn = useCallback(async (identifier: string, password: string) => {
    if (!isSupabaseConfigured) {
      if (typeof sessionStorage !== 'undefined') sessionStorage.setItem('toru.demo', '1');
      setSession(demoSession());
      setUnlocked(true);
      return;
    }
    const email = await emailForIdentifier(identifier);
    const { error } = await getSupabase().auth.signInWithPassword({ email, password });
    if (error) {
      throw new Error(translateAuthError(error));
    }
    setUnlocked(true);
  }, []);

  const signUp = useCallback(async ({ email, password, fullName, callsign }: SignUpInput) => {
    if (!isSupabaseConfigured) {
      setSession(demoSession());
      setUnlocked(true);
      return { needsEmailConfirmation: false };
    }

    const lookup = await getSupabase().rpc('email_for_callsign', { p_callsign: callsign.trim() });
    if (typeof lookup.data === 'string' && lookup.data.length > 0) {
      throw new Error('Ese indicativo ya está en uso.');
    }

    const visibleName = fullName.trim().length > 0 ? fullName.trim() : callsign.trim();
    const { data, error } = await getSupabase().auth.signUp({
      email,
      password,
      options: {
        data: { full_name: visibleName, callsign: callsign.trim() },
      },
    });

    if (error) {
      throw new Error(translateAuthError(error));
    }

    // Si el proyecto exige confirmar el correo, no hay sesión hasta abrir el enlace.
    return { needsEmailConfirmation: !data.session };
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const redirectTo = Linking.createURL('/nueva-contrasena');
    const { error } = await getSupabase().auth.resetPasswordForEmail(email.trim(), { redirectTo });
    if (error) {
      throw new Error(translateAuthError(error));
    }
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    const { error } = await getSupabase().auth.updateUser({ password });
    if (error) {
      throw new Error(translateAuthError(error));
    }
    setPendingRecovery(false);
  }, []);

  const clearRecovery = useCallback(() => {
    setPendingRecovery(false);
  }, []);

  const unlock = useCallback(() => {
    if (session) setUnlocked(true);
  }, [session]);

  const signOut = useCallback(async () => {
    const { error } = await getSupabase().auth.signOut();
    if (error) {
      throw new Error(translateAuthError(error));
    }
    setPendingRecovery(false);
    if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem('toru.demo');
    queryClient.clear();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isLoading,
      pendingRecovery,
      signIn,
      signUp,
      resetPassword,
      updatePassword,
      clearRecovery,
      signOut,
      unlocked: !isSupabaseConfigured ? unlocked || !session : true,
      unlock,
      demoMode: !isSupabaseConfigured,
    }),
    [
      session,
      isLoading,
      pendingRecovery,
      signIn,
      signUp,
      resetPassword,
      updatePassword,
      clearRecovery,
      signOut,
      unlocked,
      unlock,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth debe usarse dentro de AuthProvider.');
  }
  return value;
}
