import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/features/auth/AuthProvider';
import { createTeam, fetchTeamMembers, fetchTeams } from '@/features/teams/api';

export function useTeams() {
  return useQuery({
    queryKey: ['teams'],
    queryFn: fetchTeams,
  });
}

export function useTeamMembers(teamId: string | null) {
  return useQuery({
    queryKey: ['team-members', teamId],
    enabled: Boolean(teamId),
    queryFn: () => fetchTeamMembers(teamId as string),
  });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();
  const { session } = useAuth();

  return useMutation({
    mutationFn: async (name: string) => {
      const userId = session?.user.id;
      if (!userId) {
        throw new Error('No hay sesión. Entra de nuevo.');
      }
      await createTeam(name, userId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
}
