import { demoProfile } from '@/demo/cabin';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client';
import type { Profile } from '@/types/database';

export async function fetchProfile(userId: string): Promise<Profile> {
  if (!isSupabaseConfigured) return { ...demoProfile(), id: userId };

  const { data, error } = await getSupabase()
    .from('profiles')
    .select('id, email, full_name, callsign, created_at')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error('No encontramos tu perfil. Revisa que la migración SQL se haya ejecutado.');
  }

  return data as unknown as Profile;
}
