import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { EmptyState } from '@/components/EmptyState';
import { ErrorView } from '@/components/ErrorView';
import { FilterChips } from '@/components/hud/FilterChips';
import { HudGrid } from '@/components/hud/HudGrid';
import { MissionCarousel } from '@/components/hud/MissionCarousel';
import { PilotHeader } from '@/components/hud/PilotHeader';
import { StatBox } from '@/components/hud/StatBox';
import { StatusLine } from '@/components/hud/StatusLine';
import { LoadingView } from '@/components/LoadingView';
import { useAuth } from '@/features/auth/AuthProvider';
import { useCurrentProfile } from '@/features/auth/hooks';
import { useTasks } from '@/features/tasks/hooks';
import {
  filterMissions,
  formatCounter,
  formatXp,
  MISSION_FILTERS,
  pilotStats,
  type MissionFilter,
} from '@/features/tasks/mission';
import { CreateTeamForm } from '@/features/teams/CreateTeamForm';
import { useCurrentTeam } from '@/features/teams/TeamProvider';
import { getErrorMessage } from '@/lib/supabase/errors';
import { useTheme } from '@/theme/ThemeProvider';
import type { TaskWithPeople } from '@/types/database';

export default function MissionScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { session } = useAuth();
  const profile = useCurrentProfile();
  const { currentTeam, teams, isLoading, error, refresh } = useCurrentTeam();
  const tasks = useTasks(currentTeam?.id ?? null, 'team', session?.user.id ?? null);
  const [filter, setFilter] = useState<MissionFilter>('all');
  const [index, setIndex] = useState(0);

  const all = tasks.data ?? [];
  const visible = filterMissions(all, filter);
  const stats = pilotStats(all);
  const safeIndex = visible.length === 0 ? 0 : Math.min(index, visible.length - 1);
  const callsign = profile.data?.callsign?.trim() || profile.data?.full_name || 'Piloto';

  function openMission(task: TaskWithPeople) {
    router.push({ pathname: '/tareas/[id]', params: { id: task.id } });
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <HudGrid />
      <StatusLine />
      <PilotHeader callsign={callsign} />
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          paddingHorizontal: theme.spacing.md,
          paddingTop: theme.spacing.md,
        }}
      >
        <AppText variant="title" style={{ fontSize: theme.fontSize.md }}>
          Misiones activas
        </AppText>
        <AppText variant="mono" style={{ color: theme.colors.line }}>
          {formatCounter(safeIndex, visible.length)}
        </AppText>
      </View>
      <View style={{ paddingVertical: theme.spacing.sm }}>
        <FilterChips
          options={MISSION_FILTERS}
          value={filter}
          onChange={(next) => {
            setFilter(next);
            setIndex(0);
          }}
        />
      </View>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        {isLoading || tasks.isLoading ? <LoadingView label="Sincronizando misiones…" /> : null}
        {error ? <ErrorView message={error} onRetry={refresh} /> : null}
        {!isLoading && !error && teams.length === 0 ? (
          <View style={{ paddingHorizontal: theme.spacing.md }}>
            <CreateTeamForm />
          </View>
        ) : null}
        {currentTeam && tasks.error ? (
          <ErrorView message={getErrorMessage(tasks.error)} onRetry={() => void tasks.refetch()} />
        ) : null}
        {currentTeam && !tasks.isLoading && !tasks.error && visible.length === 0 ? (
          <View style={{ paddingHorizontal: theme.spacing.md }}>
            <EmptyState
              title="Sin misiones en este filtro"
              body="Crea una con el hexágono de abajo, o cambia el filtro."
            />
          </View>
        ) : null}
        {visible.length > 0 ? (
          <MissionCarousel
            tasks={visible}
            resetKey={filter}
            onIndexChange={setIndex}
            onOpen={openMission}
          />
        ) : null}
      </View>
      <AppText variant="muted" style={{ textAlign: 'center', paddingVertical: theme.spacing.xs }}>
        Desliza para cambiar de misión
      </AppText>
      <View style={{ flexDirection: 'row', gap: theme.spacing.sm, padding: theme.spacing.md }}>
        <StatBox label="Completadas" value={String(stats.completed)} />
        <StatBox label="Racha" value={`${stats.streakDays} días`} accent />
        <StatBox label="XP piloto" value={formatXp(stats.xp)} />
      </View>
    </View>
  );
}
