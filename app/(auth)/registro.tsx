import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { TextButton } from '@/components/TextButton';
import { TextField } from '@/components/TextField';
import { useAuth } from '@/features/auth/AuthProvider';
import { signupSchema } from '@/features/auth/schemas';
import { getErrorMessage } from '@/lib/supabase/errors';
import { fieldErrors } from '@/lib/validation';
import { useTheme } from '@/theme/ThemeProvider';

export default function SignUpScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { signUp } = useAuth();
  const [callsign, setCallsign] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setFormError(null);
    setConfirmationMessage(null);
    const parsed = signupSchema.safeParse({ callsign, fullName, email, password });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
      const result = await signUp(parsed.data);
      if (result.needsEmailConfirmation) {
        setConfirmationMessage('Cuenta creada. Abre el correo de confirmación y luego entra.');
      }
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Screen scroll>
      <Stack.Screen options={{ title: 'Alta' }} />
      <View style={{ gap: theme.spacing.md }}>
        <AppText variant="title">Alta de piloto</AppText>
        <AppText variant="body">
          El indicativo es el nombre que verás en la cabina, por ejemplo YJ-07 HALCÓN. También
          puedes entrar con el correo.
        </AppText>
        <TextField
          label="Indicativo"
          value={callsign}
          onChangeText={setCallsign}
          error={errors.callsign}
          autoCapitalize="characters"
          placeholder="YJ-07 HALCÓN"
        />
        <TextField
          label="Nombre"
          value={fullName}
          onChangeText={setFullName}
          error={errors.fullName}
          placeholder="Ana García"
        />
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
        {confirmationMessage ? <AppText variant="body">{confirmationMessage}</AppText> : null}
        <Button label="Crear cuenta" onPress={() => void handleSubmit()} loading={isSubmitting} />
        <TextButton label="Ya tengo cuenta" onPress={() => router.back()} />
      </View>
    </Screen>
  );
}
