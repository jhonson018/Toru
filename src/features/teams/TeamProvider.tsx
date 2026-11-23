import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import { useTeams } from '@/features/teams/hooks';
import { getErrorMessage } from '@/lib/supabase/errors';
import type { Team } from '@/types/database';

type TeamContextValue = {
  teams: Team[];
  currentTeam: Team | null;
  selectTeam: (teamId: string) => void;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
};

const TeamContext = createContext<TeamContextValue | null>(null);

export function TeamProvider({ children }: { children: ReactNode }) {
  const teamsQuery = useTeams();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const teams = useMemo(() => teamsQuery.data ?? [], [teamsQuery.data]);
  const currentTeam = teams.find((team) => team.id === selectedId) ?? teams[0] ?? null;

  const value = useMemo<TeamContextValue>(
    () => ({
      teams,
      currentTeam,
      selectTeam: setSelectedId,
      isLoading: teamsQuery.isLoading,
      error: teamsQuery.error ? getErrorMessage(teamsQuery.error) : null,
      refresh: () => {
        void teamsQuery.refetch();
      },
    }),
    [teams, currentTeam, teamsQuery],
  );

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
}

export function useCurrentTeam(): TeamContextValue {
  const value = useContext(TeamContext);
  if (!value) {
    throw new Error('useCurrentTeam debe usarse dentro de TeamProvider.');
  }
  return value;
}
