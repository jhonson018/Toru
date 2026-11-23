import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { LoadingView } from '@/components/LoadingView';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { useAuth } from '@/features/auth/AuthProvider';
import { newPasswordSchema } from '@/features/auth/schemas';
import { getErrorMessage } from '@/lib/supabase/errors';
import { fieldErrors } from '@/lib/validation';
import { useTheme } from '@/theme/ThemeProvider';

export default function NewPasswordScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { session, isLoading, updatePassword, clearRecovery } = useAuth();
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setFormError(null);
    const parsed = newPasswordSchema.safeParse({ password });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
      await updatePassword(parsed.data.password);
      clearRecovery();
      router.replace('/');
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Screen scroll>
      <Stack.Screen options={{ title: 'Nueva contraseña', headerShown: true }} />
      {isLoading ? (
        <LoadingView label="Abriendo el enlace…" />
      ) : !session ? (
        <View style={{ gap: theme.spacing.md }}>
          <AppText variant="title">Enlace no válido</AppText>
          <AppText variant="body">
            Pide otro correo desde Recuperar acceso y ábrelo en este teléfono. Si Supabase muestra
            la página web del enlace, copia la dirección de redirección que indica el README.
          </AppText>
        </View>
      ) : (
        <View style={{ gap: theme.spacing.md }}>
          <AppText variant="title">Nueva contraseña</AppText>
          <TextField
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            secureTextEntry
            placeholder="Mínimo 6 caracteres"
          />
          {formError ? (
            <AppText variant="muted" style={{ color: theme.colors.danger }}>
              {formError}
            </AppText>
          ) : null}
          <Button label="Guardar" onPress={() => void handleSubmit()} loading={isSubmitting} />
        </View>
      )}
    </Screen>
  );
}
