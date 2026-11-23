import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';

import { AppText } from '@/components/AppText';
import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/features/auth/AuthProvider';
import { TaskForm } from '@/features/tasks/components/TaskForm';
import { useCreateTask, useTasks } from '@/features/tasks/hooks';
import { filterMissions } from '@/features/tasks/mission';
import { emptyTaskForm, formValuesToDraft } from '@/features/tasks/schemas';
import { useTeamMembers } from '@/features/teams/hooks';
import { useCurrentTeam } from '@/features/teams/TeamProvider';

export default function NewTaskScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const { currentTeam } = useCurrentTeam();
  const members = useTeamMembers(currentTeam?.id ?? null);
  const createTask = useCreateTask();
  const existing = useTasks(currentTeam?.id ?? null, 'team', session?.user.id ?? null);
  const [draftNote, setDraftNote] = useState<string | null>(null);
  const nextCode = String(filterMissions(existing.data ?? [], 'all').length + 1).padStart(2, '0');

  return (
    <Screen scroll>
      <Stack.Screen
        options={{
          title: 'Nueva misión',
          headerShown: true,
          headerRight: () => (
            <AppText
              variant="label"
              style={{ marginRight: 8 }}
              onPress={() => {
                void AsyncStorage.setItem('toru.mission-draft', '1');
                setDraftNote(
                  'Borrador marcado en este teléfono. Desplegar misión lo guarda de verdad.',
                );
              }}
            >
              Borrador
            </AppText>
          ),
        }}
      />
      {!currentTeam || !session ? (
        <EmptyState
          title="Primero abre un hangar"
          body="Sin unidad no hay a quién asignarle la misión."
        />
      ) : (
        <TaskForm
          initialValues={emptyTaskForm}
          members={members.data ?? []}
          membersLoading={members.isLoading}
          submitLabel="Desplegar misión"
          codeLabel={`Misión ${nextCode}`}
          showStatus={false}
          showAssignee={false}
          onSubmit={async (values, subtasks) => {
            const id = await createTask.mutateAsync({
              draft: formValuesToDraft(values, {
                team_id: currentTeam.id,
                created_by: session.user.id,
              }),
              subtasks,
            });
            router.replace({ pathname: '/tareas/[id]', params: { id } });
          }}
        />
      )}
      {draftNote ? <AppText variant="muted">{draftNote}</AppText> : null}
    </Screen>
  );
}
