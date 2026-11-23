import { AppText } from '@/components/AppText';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/theme/ThemeProvider';

export function ConfigMissing() {
  const theme = useTheme();

  return (
    <Screen scroll>
      <AppText variant="title">Toru aún no tiene backend</AppText>
      <AppText variant="body">
        La app arranca igual, pero para entrar y ver tareas necesita un proyecto de Supabase. Crea
        un archivo .env en la raíz (puedes copiar .env.example) con estos dos valores:
      </AppText>
      <AppText variant="label">EXPO_PUBLIC_SUPABASE_URL</AppText>
      <AppText variant="muted">La Project URL, en Project Settings → API.</AppText>
      <AppText variant="label">EXPO_PUBLIC_SUPABASE_ANON_KEY</AppText>
      <AppText variant="muted">
        La clave pública. En el panel puede decir anon o publishable. No uses la clave service_role.
      </AppText>
      <AppText variant="body" style={{ marginTop: theme.spacing.sm }}>
        Después de guardar el archivo, para el servidor (Ctrl+C) y vuelve a ejecutar npx expo start.
        Expo lee esas variables al arrancar.
      </AppText>
    </Screen>
  );
}
