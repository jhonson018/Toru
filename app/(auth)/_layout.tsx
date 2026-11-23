import { Redirect } from 'expo-router';

import { ThemedStack } from '@/components/ThemedStack';
import { useAuth } from '@/features/auth/AuthProvider';

export default function AuthLayout() {
  const { session, pendingRecovery } = useAuth();

  if (pendingRecovery) {
    return <Redirect href="/nueva-contrasena" />;
  }

  if (session) {
    return <Redirect href="/" />;
  }

  return <ThemedStack />;
}
