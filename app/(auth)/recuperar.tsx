import { Stack } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { useAuth } from '@/features/auth/AuthProvider';
import { resetSchema } from '@/features/auth/schemas';
import { getErrorMessage } from '@/lib/supabase/errors';
import { fieldErrors } from '@/lib/validation';
import { useTheme } from '@/theme/ThemeProvider';

export default function RecoverScreen() {
  const theme = useTheme();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setFormError(null);
    const parsed = resetSchema.safeParse({ email });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
      await resetPassword(parsed.data.email);
      setSent(true);
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Screen scroll>
      <Stack.Screen options={{ title: 'Recuperar' }} />
      <View style={{ gap: theme.spacing.md }}>
        <AppText variant="title">Recuperar acceso</AppText>
        <AppText variant="body">
          Te enviamos un correo para elegir otra contraseña. El enlace abre Toru en la pantalla de
          nueva contraseña.
        </AppText>
        <TextField
          label="Correo"
          value={email}
          onChangeText={setEmail}
          error={errors.email}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          placeholder="ana@ejemplo.com"
        />
        {formError ? (
          <AppText variant="muted" style={{ color: theme.colors.danger }}>
            {formError}
          </AppText>
        ) : null}
        {sent ? (
          <AppText variant="body">
            Listo. Revisa el correo y abre el enlace desde este teléfono.
          </AppText>
        ) : null}
        <Button label="Enviar enlace" onPress={() => void handleSubmit()} loading={isSubmitting} />
      </View>
    </Screen>
  );
}
