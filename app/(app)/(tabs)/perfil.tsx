import { useState } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/features/auth/AuthProvider';
import { useCurrentProfile } from '@/features/auth/hooks';
import { getErrorMessage } from '@/lib/supabase/errors';
import { useTheme } from '@/theme/ThemeProvider';

export default function ProfileScreen() {
  const theme = useTheme();
  const { session, signOut } = useAuth();
  const profile = useCurrentProfile();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSignOut() {
    setError(null);
    setPending(true);
    try {
      await signOut();
    } catch (signOutError) {
      setError(getErrorMessage(signOutError));
    } finally {
      setPending(false);
    }
  }

  const callsign = profile.data?.callsign || 'Sin indicativo';

  return (
    <Screen scroll>
      <AppText variant="label">Perfil</AppText>
      <AppText variant="title">{callsign}</AppText>
      <View style={{ gap: theme.spacing.sm }}>
        <AppText variant="label">Nombre</AppText>
        <AppText variant="body">{profile.data?.full_name || '—'}</AppText>
        <AppText variant="label">Correo</AppText>
        <AppText variant="body">{profile.data?.email || session?.user.email || '—'}</AppText>
      </View>
      <AppText variant="muted">
        La ficha se crea al registrarte. El indicativo es el que aparece arriba en la cabina.
      </AppText>
      {error ? (
        <AppText variant="muted" style={{ color: theme.colors.danger }}>
          {error}
        </AppText>
      ) : null}
      <Button
        label="Cerrar sesión"
        variant="danger"
        onPress={() => void handleSignOut()}
        loading={pending}
      />
    </Screen>
  );
}
