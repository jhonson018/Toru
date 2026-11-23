import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { HexMark } from '@/components/hud/HexMark';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { useAuth } from '@/features/auth/AuthProvider';
import { loginSchema } from '@/features/auth/schemas';
import { getErrorMessage } from '@/lib/supabase/errors';
import { fieldErrors } from '@/lib/validation';
import { useTheme } from '@/theme/ThemeProvider';

const BOOT_LINES = ['Iniciando sistemas...', 'Protocolo primarius', 'Sensores HUD', 'En espera'];

export default function LoginScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { signIn, unlock, session, demoMode } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setFormError(null);
    if (demoMode && identifier.trim().length === 0 && password.trim().length === 0) {
      setIsSubmitting(true);
      try {
        await signIn('YJ-07 HALCÓN', 'demo');
      } catch (error) {
        setFormError(getErrorMessage(error));
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    const parsed = loginSchema.safeParse({ identifier, password });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
      await signIn(parsed.data.identifier, parsed.data.password);
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function scanFingerprint() {
    setFormError(null);
    try {
      const LocalAuthentication = await import('expo-local-authentication');
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const enrolled = hasHardware && (await LocalAuthentication.isEnrolledAsync());
      if (!enrolled) {
        if (demoMode) {
          await signIn('YJ-07 HALCÓN', 'demo');
          return;
        }
        setFormError('Este dispositivo no tiene huella. Usa tu código de acceso.');
        return;
      }
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Toca para escanear huella',
        cancelLabel: 'Cancelar',
      });
      if (!result.success) return;
      if (session) {
        unlock();
        return;
      }
      if (demoMode) {
        await signIn('YJ-07 HALCÓN', 'demo');
        return;
      }
      setFormError('No hay una sesión guardada. Entra con tu código una vez.');
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  }

  return (
    <Screen scroll>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ gap: 2, marginBottom: theme.spacing.md }}>
        {BOOT_LINES.map((line) => (
          <AppText key={line} variant="muted">
            {line}
          </AppText>
        ))}
      </View>
      <View style={{ alignItems: 'center', gap: theme.spacing.sm, marginBottom: theme.spacing.md }}>
        <HexMark />
        <AppText variant="title" style={{ fontSize: 18 }}>
          Misión//control
        </AppText>
        <AppText variant="muted">Gestor táctico de misiones</AppText>
      </View>
      <AppText variant="label" style={{ color: theme.colors.text }}>
        Acceso de piloto
      </AppText>
      <TextField
        label="ID de piloto"
        value={identifier}
        onChangeText={setIdentifier}
        error={errors.identifier}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="piloto@correo.com"
      />
      <View style={{ gap: theme.spacing.xs }}>
        <TextField
          label="Código de acceso"
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          secureTextEntry={!showPassword}
          placeholder="••••••••"
        />
        <Pressable
          onPress={() => setShowPassword((current) => !current)}
          style={{ position: 'absolute', right: 12, top: 28 }}
        >
          <AppText variant="muted">{showPassword ? 'Ocultar' : 'Ver'}</AppText>
        </Pressable>
      </View>
      <Pressable onPress={() => router.push('/recuperar')} style={{ alignSelf: 'flex-end' }}>
        <AppText variant="muted" style={{ color: theme.colors.line }}>
          ¿Olvidaste tu código?
        </AppText>
      </Pressable>
      {formError ? (
        <AppText variant="muted" style={{ color: theme.colors.danger }}>
          {formError}
        </AppText>
      ) : null}
      {demoMode ? (
        <AppText variant="muted">
          Sin Supabase todavía: Iniciar enlace abre la cabina de demostración.
        </AppText>
      ) : null}
      <Button label="Iniciar enlace" onPress={() => void handleSubmit()} loading={isSubmitting} />
      <Pressable
        onPress={() => void scanFingerprint()}
        style={{ alignItems: 'center', gap: theme.spacing.sm, paddingVertical: theme.spacing.md }}
      >
        <Svg width={54} height={54} viewBox="0 0 54 54">
          <Path
            d="M27 4a23 23 0 1 0 0 46 23 23 0 0 0 0-46z"
            stroke={theme.colors.lineDim}
            strokeWidth={1.4}
            fill="none"
          />
          <Path
            d="M20 28c0-4 3-8 7-8s7 4 7 8v6M23 34c1 4 3 6 4 8M27 18c6 0 10 5 10 12"
            stroke={theme.colors.line}
            strokeWidth={1.6}
            fill="none"
            strokeLinecap="round"
          />
        </Svg>
        <AppText variant="label">Toca para escanear huella</AppText>
      </Pressable>
      <Pressable onPress={() => router.push('/registro')} style={{ alignItems: 'center' }}>
        <AppText variant="muted">
          ¿Nuevo en la unidad?{' '}
          <AppText variant="muted" style={{ color: theme.colors.amber }}>
            Registrar nuevo piloto
          </AppText>
        </AppText>
      </Pressable>
    </Screen>
  );
}
