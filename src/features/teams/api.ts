import { demoMembers, demoTeams } from '@/demo/cabin';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { asSingle } from '@/lib/supabase/relations';
import { isTeamRole, type Profile, type Team, type TeamMemberWithProfile } from '@/types/database';

type MemberRow = Omit<TeamMemberWithProfile, 'role' | 'profile'> & {
  role: string;
  profile:
    | Pick<Profile, 'id' | 'full_name' | 'email' | 'callsign'>
    | Pick<Profile, 'id' | 'full_name' | 'email' | 'callsign'>[]
    | null;
};

export async function fetchTeams(): Promise<Team[]> {
  if (!isSupabaseConfigured) return demoTeams();

  const { data, error } = await getSupabase()
    .from('teams')
    .select('id, name, created_by, created_at')
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as unknown as Team[];
}

export async function createTeam(name: string, userId: string): Promise<void> {
  // El trigger add_team_owner (en el SQL) añade a quien crea el equipo como responsable.
  const { error } = await getSupabase().from('teams').insert({ name, created_by: userId });
  if (error) {
    throw error;
  }
}

export async function fetchTeamMembers(teamId: string): Promise<TeamMemberWithProfile[]> {
  if (!isSupabaseConfigured) return demoMembers().filter((member) => member.team_id === teamId);

  const { data, error } = await getSupabase()
    .from('team_members')
    .select(
      'id, team_id, user_id, role, created_at, profile:profiles!team_members_user_id_fkey(id, full_name, email, callsign)',
    )
    .eq('team_id', teamId)
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return ((data ?? []) as unknown as MemberRow[]).map((row) => {
    if (!isTeamRole(row.role)) {
      throw new Error(`Rol desconocido: ${row.role}`);
    }

    return {
      ...row,
      role: row.role,
      profile: asSingle(row.profile),
    };
  });
}
