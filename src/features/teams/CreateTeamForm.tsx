import { useState } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { useCreateTeam } from '@/features/teams/hooks';
import { teamNameSchema } from '@/features/teams/schemas';
import { getErrorMessage } from '@/lib/supabase/errors';
import { useTheme } from '@/theme/ThemeProvider';

export function CreateTeamForm() {
  const theme = useTheme();
  const createTeam = useCreateTeam();
  const [name, setName] = useState('');
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit() {
    setFormError(null);
    const parsed = teamNameSchema.safeParse(name);
    if (!parsed.success) {
      setFieldError(parsed.error.issues[0]?.message ?? 'Revisa el nombre.');
      return;
    }

    setFieldError(undefined);
    try {
      await createTeam.mutateAsync(parsed.data);
      setName('');
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  }

  return (
    <View style={{ gap: theme.spacing.md }}>
      <AppText variant="heading">Crea tu equipo</AppText>
      <AppText variant="muted">
        Una tarea siempre pertenece a un equipo. Empieza por ponerle nombre al tuyo. Quien lo crea
        queda como responsable.
      </AppText>
      <TextField
        label="Nombre del equipo"
        value={name}
        onChangeText={setName}
        error={fieldError}
        placeholder="Taller Norte"
        autoCapitalize="sentences"
      />
      {formError ? (
        <AppText variant="muted" style={{ color: theme.colors.danger }}>
          {formError}
        </AppText>
      ) : null}
      <Button
        label="Crear equipo"
        onPress={() => void handleSubmit()}
        loading={createTeam.isPending}
      />
    </View>
  );
}
