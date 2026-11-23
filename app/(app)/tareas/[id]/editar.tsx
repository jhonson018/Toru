import { useQueryClient } from '@tanstack/react-query';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { ErrorView } from '@/components/ErrorView';
import { LoadingView } from '@/components/LoadingView';
import { Screen } from '@/components/Screen';
import { TaskForm } from '@/features/tasks/components/TaskForm';
import { useTask, useUpdateTask } from '@/features/tasks/hooks';
import { replaceSubtasks } from '@/features/tasks/api';
import { formValuesToUpdate, taskToFormValues } from '@/features/tasks/schemas';
import { useTeamMembers } from '@/features/teams/hooks';
import { getErrorMessage } from '@/lib/supabase/errors';
import { isUuid, oneParam } from '@/lib/route-params';

export default function EditTaskScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string | string[] }>();
  const id = oneParam(params.id);
  const validId = isUuid(id) ? id : null;
  const taskQuery = useTask(validId);
  const members = useTeamMembers(taskQuery.data?.team_id ?? null);
  const updateTask = useUpdateTask(id);
  const queryClient = useQueryClient();

  if (!validId) {
    return (
      <Screen>
        <Stack.Screen options={{ title: 'Editar misión', headerShown: true }} />
        <ErrorView message="El enlace de la tarea no es válido." />
      </Screen>
    );
  }

  if (taskQuery.isLoading) {
    return (
      <Screen>
        <Stack.Screen options={{ title: 'Editar misión', headerShown: true }} />
        <LoadingView label="Cargando la tarea…" fill />
      </Screen>
    );
  }

  if (taskQuery.error) {
    return (
      <Screen>
        <Stack.Screen options={{ title: 'Editar misión', headerShown: true }} />
        <ErrorView
          message={getErrorMessage(taskQuery.error)}
          onRetry={() => void taskQuery.refetch()}
          fill
        />
      </Screen>
    );
  }

  const task = taskQuery.data;
  if (!task) {
    return (
      <Screen>
        <Stack.Screen options={{ title: 'Editar misión', headerShown: true }} />
        <ErrorView message="No encontramos esa tarea." />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Stack.Screen options={{ title: 'Editar misión', headerShown: true }} />
      <TaskForm
        key={task.updated_at}
        initialValues={taskToFormValues(task)}
        initialSubtasks={task.subtasks}
        members={members.data ?? []}
        membersLoading={members.isLoading}
        submitLabel="Guardar cambios"
        onSubmit={async (values, subtasks) => {
          await updateTask.mutateAsync(formValuesToUpdate(values));
          await replaceSubtasks(task.id, subtasks);
          await queryClient.invalidateQueries({ queryKey: ['tasks'] });
          await queryClient.invalidateQueries({ queryKey: ['task', task.id] });
          router.back();
        }}
      />
    </Screen>
  );
}
