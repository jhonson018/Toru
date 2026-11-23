import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { ErrorView } from '@/components/ErrorView';
import { LoadingView } from '@/components/LoadingView';
import { Screen } from '@/components/Screen';
import { StatBox } from '@/components/hud/StatBox';
import { useAuth } from '@/features/auth/AuthProvider';
import { useTask, useTasks } from '@/features/tasks/hooks';
import { filterMissions, formatDuration, pilotLevel, pilotStats } from '@/features/tasks/mission';
import { useCurrentTeam } from '@/features/teams/TeamProvider';
import { isUuid, oneParam } from '@/lib/route-params';
import { useTheme } from '@/theme/ThemeProvider';

export default function MissionCompleteScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string | string[] }>();
  const id = oneParam(params.id);
  const validId = isUuid(id) ? id : null;
  const taskQuery = useTask(validId);
  const { session } = useAuth();
  const { currentTeam } = useCurrentTeam();
  const tasks = useTasks(currentTeam?.id ?? null, 'team', session?.user.id ?? null);
  const task = taskQuery.data;

  if (!validId) {
    return (
      <Screen>
        <ErrorView message="El enlace de la misión no es válido." />
      </Screen>
    );
  }

  if (taskQuery.isLoading || !task) {
    return (
      <Screen>
        <Stack.Screen options={{ headerShown: false }} />
        <LoadingView label="Cerrando la misión…" fill />
      </Screen>
    );
  }

  const stats = pilotStats(tasks.data ?? []);
  const level = pilotLevel(stats.xp);
  const gained = task.xp_awarded ?? 0;
  const done = task.subtasks.filter((item) => item.is_done).length;
  const total = task.subtasks.length;
  const duration =
    task.completed_at && task.created_at
      ? formatDuration(task.created_at, task.completed_at)
      : '00D 00H';
  const next = filterMissions(tasks.data ?? [], 'all').find((item) => item.id !== task.id);

  return (
    <Screen scroll>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ alignItems: 'center', gap: theme.spacing.md, paddingTop: theme.spacing.xl }}>
        <Svg width={160} height={160}>
          <Circle
            cx={80}
            cy={80}
            r={70}
            stroke={theme.colors.lineDim}
            strokeWidth={2}
            fill="none"
          />
          <Circle cx={80} cy={80} r={54} stroke={theme.colors.amber} strokeWidth={3} fill="none" />
          <Path
            d="M58 82 l14 14 30-34"
            stroke={theme.colors.amber}
            strokeWidth={6}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
        <AppText variant="title">Misión completada</AppText>
        <AppText variant="heading" style={{ textAlign: 'center' }}>
          {task.title}
        </AppText>
      </View>
      <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
        <StatBox label="XP ganada" value={`+${gained}`} accent />
        <StatBox label="Tiempo" value={duration} />
        <StatBox label="Objetivos" value={`${done}/${total}`} />
      </View>
      <View style={{ gap: theme.spacing.sm }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <AppText variant="label">Nivel de piloto</AppText>
          <AppText variant="mono">{level.level}</AppText>
        </View>
        <View
          style={{
            height: 10,
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.lineDim,
          }}
        >
          <View
            style={{
              height: '100%',
              width: `${Math.round((level.into / level.span) * 100)}%`,
              backgroundColor: theme.colors.amber,
            }}
          />
        </View>
        <AppText variant="muted">
          {level.into} / {level.span} XP hacia el siguiente nivel. La curva es provisional.
        </AppText>
      </View>
      <Button label="Volver al hangar" onPress={() => router.replace('/hangar')} />
      <Button
        label="Siguiente misión"
        variant="secondary"
        onPress={() => {
          if (next) {
            router.replace({ pathname: '/tareas/[id]', params: { id: next.id } });
            return;
          }
          router.replace('/');
        }}
      />
    </Screen>
  );
}
