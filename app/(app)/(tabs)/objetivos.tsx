import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { EmptyState } from '@/components/EmptyState';
import { LoadingView } from '@/components/LoadingView';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/features/auth/AuthProvider';
import { useTasks } from '@/features/tasks/hooks';
import { useCurrentTeam } from '@/features/teams/TeamProvider';
import { useTheme } from '@/theme/ThemeProvider';

export default function ObjectivesScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { session } = useAuth();
  const { currentTeam } = useCurrentTeam();
  const tasks = useTasks(currentTeam?.id ?? null, 'team', session?.user.id ?? null);

  const rows = (tasks.data ?? []).flatMap((task) =>
    task.subtasks
      .filter((item) => !item.is_done && task.status !== 'done')
      .map((item) => ({ item, task })),
  );

  return (
    <Screen scroll>
      <AppText variant="title">Objetivos</AppText>
      <AppText variant="muted">Pasos abiertos de las misiones activas.</AppText>
      {tasks.isLoading ? <LoadingView label="Cargando objetivos…" /> : null}
      {!tasks.isLoading && rows.length === 0 ? (
        <EmptyState
          title="Nada pendiente"
          body="Cuando una misión tenga sub-objetivos abiertos, salen aquí."
        />
      ) : null}
      {rows.map(({ item, task }) => (
        <Pressable
          key={item.id}
          onPress={() => router.push({ pathname: '/tareas/[id]', params: { id: task.id } })}
          style={{
            borderWidth: 1,
            borderColor: theme.colors.lineDim,
            padding: theme.spacing.md,
            gap: theme.spacing.xs,
          }}
        >
          <AppText variant="label">{task.title}</AppText>
          <AppText variant="body">▸ {item.title}</AppText>
        </Pressable>
      ))}
      <View />
    </Screen>
  );
}
