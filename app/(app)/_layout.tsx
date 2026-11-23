import { Redirect } from 'expo-router';

import { ThemedStack } from '@/components/ThemedStack';
import { useAuth } from '@/features/auth/AuthProvider';
import { useTaskRealtime } from '@/features/tasks/hooks';
import { TeamProvider, useCurrentTeam } from '@/features/teams/TeamProvider';

export default function AppLayout() {
  const { session, pendingRecovery } = useAuth();

  if (pendingRecovery) {
    return <Redirect href="/nueva-contrasena" />;
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  return (
    <TeamProvider>
      <TaskRealtimeBridge />
      <ThemedStack headerShown={false} />
    </TeamProvider>
  );
}

function TaskRealtimeBridge() {
  const { currentTeam } = useCurrentTeam();
  useTaskRealtime(currentTeam?.id ?? null);
  return null;
}
