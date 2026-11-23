import { useQuery } from '@tanstack/react-query';

import { fetchProfile } from '@/features/auth/api';
import { useAuth } from '@/features/auth/AuthProvider';

export function useCurrentProfile() {
  const { session } = useAuth();
  const userId = session?.user.id ?? null;

  return useQuery({
    queryKey: ['profile', userId],
    enabled: Boolean(userId),
    queryFn: () => fetchProfile(userId as string),
  });
}
