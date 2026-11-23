import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { ErrorView } from '@/components/ErrorView';
import { EnergyRing } from '@/components/hud/EnergyRing';
import { PriorityBadge } from '@/components/hud/PriorityBadge';
import { LoadingView } from '@/components/LoadingView';
import { Screen } from '@/components/Screen';
import { CommentSection } from '@/features/tasks/components/CommentSection';
import { useCompleteTask, useTask, useToggleSubtask } from '@/features/tasks/hooks';
import { personName } from '@/features/tasks/labels';
import {
  estimatedXp,
  formatMissionWhen,
  missionEnergy,
  subtaskProgress,
} from '@/features/tasks/mission';
import { getErrorMessage } from '@/lib/supabase/errors';
import { isUuid, oneParam } from '@/lib/route-params';
import { useTheme } from '@/theme/ThemeProvider';

export default function TaskDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string | string[] }>();
  const id = oneParam(params.id);
  const validId = isUuid(id) ? id : null;
  const taskQuery = useTask(validId);
  const toggle = useToggleSubtask(id);
  const complete = useCompleteTask(id);

  if (!validId) {
    return (
      <Screen>
        <ErrorView message="El enlace de la misión no es válido." />
      </Screen>
    );
  }

  if (taskQuery.isLoading) {
    return (
      <Screen>
        <Stack.Screen options={{ title: 'Misión', headerShown: true }} />
        <LoadingView label="Abriendo la misión…" fill />
      </Screen>
    );
  }

  if (taskQuery.error || !taskQuery.data) {
    return (
      <Screen>
        <Stack.Screen options={{ title: 'Misión', headerShown: true }} />
        <ErrorView
          message={
            taskQuery.error ? getErrorMessage(taskQuery.error) : 'No encontramos esa misión.'
          }
          onRetry={() => void taskQuery.refetch()}
        />
      </Screen>
    );
  }

  const task = taskQuery.data;
  const when = formatMissionWhen(task.due_date);
  const progress = subtaskProgress(task);
  const pending = progress.total - progress.done;
  const energy = missionEnergy(task);

  async function finish() {
    const xp = task.xp_awarded ?? estimatedXp(task.subtasks.length);
    await complete.mutateAsync(xp);
    router.replace({ pathname: '/tareas/[id]/completada', params: { id: task.id } });
  }

  return (
    <Screen scroll>
      <Stack.Screen
        options={{
          title: 'Misión',
          headerShown: true,
          headerRight: () => (
            <Pressable
              style={{ paddingRight: 8 }}
              onPress={() =>
                router.push({ pathname: '/tareas/[id]/editar', params: { id: task.id } })
              }
            >
              <AppText variant="label">Editar</AppText>
            </Pressable>
          ),
        }}
      />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <AppText variant="label">Misión</AppText>
        <PriorityBadge priority={task.priority} />
      </View>
      <AppText variant="heading">{task.title}</AppText>
      <AppText variant="body" style={{ color: theme.colors.textMuted }}>
        {task.description?.trim() ? task.description : 'Sin objetivo escrito.'}
      </AppText>
      <View style={{ flexDirection: 'row', gap: theme.spacing.md, alignItems: 'center' }}>
        <EnergyRing percent={energy} />
        <View style={{ flex: 1, gap: theme.spacing.xs }}>
          <AppText variant="label">Fecha límite</AppText>
          <AppText variant="mono">{when.date}</AppText>
          <AppText variant="mono" style={{ color: theme.colors.line }}>
            {when.countdown}
          </AppText>
          <AppText variant="muted">
            {progress.done}/{progress.total} sub-objetivos · {pending} pendientes
          </AppText>
          <AppText variant="muted">Asignada a {personName(task.assignee, 'nadie')}</AppText>
        </View>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <AppText variant="label">Objetivos</AppText>
        <AppText variant="muted">
          {progress.done}/{progress.total} completados
        </AppText>
      </View>
      {task.subtasks.length === 0 ? (
        <AppText variant="muted">Esta misión no tiene pasos.</AppText>
      ) : null}
      {task.subtasks.map((item) => (
        <Pressable
          key={item.id}
          onPress={() => void toggle.mutate({ id: item.id, isDone: !item.is_done })}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.sm,
            borderWidth: 1,
            borderColor: theme.colors.lineDim,
            padding: theme.spacing.sm,
          }}
        >
          <View
            style={{
              width: 18,
              height: 18,
              borderWidth: 1,
              borderColor: item.is_done ? theme.colors.line : theme.colors.lineDim,
              backgroundColor: item.is_done ? theme.colors.line : 'transparent',
            }}
          />
          <AppText variant="body" style={{ flex: 1, opacity: item.is_done ? 0.7 : 1 }}>
            {item.title}
          </AppText>
          {item.is_done ? <AppText variant="label">OK</AppText> : null}
        </Pressable>
      ))}
      <CommentSection taskId={task.id} />
      {complete.error ? (
        <AppText variant="muted" style={{ color: theme.colors.danger }}>
          {getErrorMessage(complete.error)}
        </AppText>
      ) : null}
      {task.status !== 'done' ? (
        <Button
          label="Completar misión"
          onPress={() => void finish()}
          loading={complete.isPending}
        />
      ) : (
        <Button
          label="Ver cierre"
          variant="secondary"
          onPress={() =>
            router.push({ pathname: '/tareas/[id]/completada', params: { id: task.id } })
          }
        />
      )}
    </Screen>
  );
}
