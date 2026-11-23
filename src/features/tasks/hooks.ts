import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { useAuth } from '@/features/auth/AuthProvider';
import {
  addComment,
  completeTask,
  createTask,
  fetchComments,
  fetchTask,
  fetchTasks,
  setSubtaskDone,
  updateTask,
} from '@/features/tasks/api';
import type { TaskListFilter } from '@/features/tasks/labels';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client';
import type { SubtaskInput, TaskDraft, TaskStatus, TaskUpdate } from '@/types/database';

/**
 * Cada useQuery identifica su caché con queryKey.
 * ['tasks', equipo, filtro] es la lista; ['task', id] es el detalle.
 * invalidateQueries vuelve a pedir los datos que empiezan por esa clave.
 */

export function useTasks(teamId: string | null, filter: TaskListFilter, userId: string | null) {
  return useQuery({
    queryKey: ['tasks', teamId, filter, userId],
    enabled: Boolean(teamId) && (filter === 'team' || Boolean(userId)),
    queryFn: () => fetchTasks(teamId as string, filter, userId),
  });
}

export function useTask(id: string | null) {
  return useQuery({
    queryKey: ['task', id],
    enabled: Boolean(id),
    queryFn: () => fetchTask(id as string),
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { draft: TaskDraft; subtasks: SubtaskInput[] }) =>
      createTask(input.draft, input.subtasks),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useCompleteTask(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (xp: number) => completeTask(taskId, xp),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['tasks'] });
      await queryClient.invalidateQueries({ queryKey: ['task', taskId] });
    },
  });
}

export function useToggleSubtask(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isDone }: { id: string; isDone: boolean }) => setSubtaskDone(id, isDone),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['tasks'] });
      await queryClient.invalidateQueries({ queryKey: ['task', taskId] });
    },
  });
}

export function useUpdateTask(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patch: Partial<TaskUpdate> | { status: TaskStatus }) => updateTask(taskId, patch),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['tasks'] });
      await queryClient.invalidateQueries({ queryKey: ['task', taskId] });
    },
  });
}

export function useComments(taskId: string | null) {
  return useQuery({
    queryKey: ['comments', taskId],
    enabled: Boolean(taskId),
    queryFn: () => fetchComments(taskId as string),
  });
}

export function useAddComment(taskId: string) {
  const queryClient = useQueryClient();
  const { session } = useAuth();

  return useMutation({
    mutationFn: async (body: string) => {
      const authorId = session?.user.id;
      if (!authorId) {
        throw new Error('No hay sesión. Entra de nuevo.');
      }
      await addComment(taskId, authorId, body);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
    },
  });
}

/**
 * Realtime: Supabase abre un canal y avisa cuando cambia la tabla tasks.
 * No pintamos el evento a mano. Invalidamos la caché y TanStack Query
 * vuelve a leer la lista. La migración SQL añade la tabla a la publicación
 * supabase_realtime; sin eso, el canal se conecta pero no llegan cambios.
 */
export function useTaskRealtime(teamId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!teamId || !isSupabaseConfigured) {
      return;
    }

    const client = getSupabase();
    const refresh = () => {
      void queryClient.invalidateQueries({ queryKey: ['tasks'] });
      void queryClient.invalidateQueries({ queryKey: ['task'] });
    };
    const channel = client
      .channel(`tasks:${teamId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks', filter: `team_id=eq.${teamId}` },
        refresh,
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'task_subtasks' }, refresh)
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, [teamId, queryClient]);
}
