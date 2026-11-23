import {
  demoAddComment,
  demoComments,
  demoComplete,
  demoCreateTask,
  demoReplaceSubtasks,
  demoSetSubtaskDone,
  demoTask,
  demoTasks,
  demoUpdateTask,
} from '@/demo/cabin';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { asSingle } from '@/lib/supabase/relations';
import {
  isTaskPriority,
  isTaskStatus,
  type Profile,
  type SubtaskInput,
  type TaskCommentWithAuthor,
  type TaskDraft,
  type TaskSubtask,
  type TaskUpdate,
  type TaskWithPeople,
} from '@/types/database';

import type { TaskListFilter } from '@/features/tasks/labels';

const TASK_COLUMNS = `
  id, team_id, title, description, status, priority, due_date,
  assignee_id, created_by, completed_at, xp_awarded, created_at, updated_at,
  assignee:profiles!tasks_assignee_id_fkey(id, full_name, email, callsign),
  creator:profiles!tasks_created_by_fkey(id, full_name, email, callsign),
  subtasks:task_subtasks(id, task_id, title, is_done, position)
`;

type Person = Pick<Profile, 'id' | 'full_name' | 'email' | 'callsign'>;

type TaskRow = Omit<TaskWithPeople, 'status' | 'priority' | 'assignee' | 'creator' | 'subtasks'> & {
  status: string;
  priority: string;
  assignee: Person | Person[] | null;
  creator: Person | Person[] | null;
  subtasks: TaskSubtask[] | null;
};

type CommentRow = Omit<TaskCommentWithAuthor, 'author'> & {
  author: Pick<Profile, 'id' | 'full_name'> | Pick<Profile, 'id' | 'full_name'>[] | null;
};

function mapTask(row: TaskRow): TaskWithPeople {
  if (!isTaskStatus(row.status)) {
    throw new Error(`Estado desconocido: ${row.status}`);
  }
  if (!isTaskPriority(row.priority)) {
    throw new Error(`Prioridad desconocida: ${row.priority}`);
  }

  const subtasks = Array.isArray(row.subtasks) ? row.subtasks : [];

  return {
    ...row,
    status: row.status,
    priority: row.priority,
    assignee: asSingle(row.assignee),
    creator: asSingle(row.creator),
    subtasks: [...subtasks].sort((a, b) => a.position - b.position),
  };
}

export async function fetchTasks(
  teamId: string,
  filter: TaskListFilter,
  userId: string | null,
): Promise<TaskWithPeople[]> {
  if (!isSupabaseConfigured) {
    const all = demoTasks().filter((task) => task.team_id.length > 0);
    if (filter === 'mine' && userId) return all.filter((task) => task.assignee_id === userId);
    return all;
  }

  if (filter === 'mine' && !userId) {
    return [];
  }

  let query = getSupabase()
    .from('tasks')
    .select(TASK_COLUMNS)
    .eq('team_id', teamId)
    .order('due_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (filter === 'mine' && userId) {
    query = query.eq('assignee_id', userId);
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  return ((data ?? []) as unknown as TaskRow[]).map(mapTask);
}

export async function fetchTask(id: string): Promise<TaskWithPeople | null> {
  if (!isSupabaseConfigured) return demoTask(id);

  const { data, error } = await getSupabase()
    .from('tasks')
    .select(TASK_COLUMNS)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return mapTask(data as unknown as TaskRow);
}

export async function createTask(draft: TaskDraft, subtasks: SubtaskInput[] = []): Promise<string> {
  if (!isSupabaseConfigured) return demoCreateTask(draft, subtasks);

  const { data, error } = await getSupabase().from('tasks').insert(draft).select('id').single();
  if (error) {
    throw error;
  }

  const id = (data as { id?: string } | null)?.id;
  if (!id) {
    throw new Error('La misión se creó, pero no pudimos abrirla.');
  }

  if (subtasks.length > 0) {
    await replaceSubtasks(id, subtasks);
  }

  return id;
}

export async function replaceSubtasks(taskId: string, items: SubtaskInput[]): Promise<void> {
  if (!isSupabaseConfigured) {
    demoReplaceSubtasks(taskId, items);
    return;
  }

  const client = getSupabase();
  const { error: deleteError } = await client.from('task_subtasks').delete().eq('task_id', taskId);
  if (deleteError) {
    throw deleteError;
  }

  if (items.length === 0) {
    return;
  }

  const { error } = await client.from('task_subtasks').insert(
    items.map((item, position) => ({
      task_id: taskId,
      title: item.title,
      is_done: item.is_done,
      position,
    })),
  );
  if (error) {
    throw error;
  }
}

export async function setSubtaskDone(id: string, isDone: boolean): Promise<void> {
  if (!isSupabaseConfigured) {
    demoSetSubtaskDone(id, isDone);
    return;
  }

  const { error } = await getSupabase()
    .from('task_subtasks')
    .update({ is_done: isDone })
    .eq('id', id);
  if (error) {
    throw error;
  }
}

export async function updateTask(
  id: string,
  patch: Partial<TaskUpdate> & { xp_awarded?: number | null },
): Promise<void> {
  if (!isSupabaseConfigured) {
    demoUpdateTask(id, patch);
    return;
  }

  const { error } = await getSupabase().from('tasks').update(patch).eq('id', id);
  if (error) {
    throw error;
  }
}

export async function completeTask(id: string, xp: number): Promise<void> {
  if (!isSupabaseConfigured) {
    demoComplete(id, xp);
    return;
  }

  const client = getSupabase();
  const { error: subError } = await client
    .from('task_subtasks')
    .update({ is_done: true })
    .eq('task_id', id);
  if (subError) throw subError;
  const { error } = await client
    .from('tasks')
    .update({ status: 'done', xp_awarded: xp, completed_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function fetchComments(taskId: string): Promise<TaskCommentWithAuthor[]> {
  if (!isSupabaseConfigured) return demoComments(taskId);

  const { data, error } = await getSupabase()
    .from('task_comments')
    .select(
      'id, task_id, author_id, body, created_at, author:profiles!task_comments_author_id_fkey(id, full_name)',
    )
    .eq('task_id', taskId)
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return ((data ?? []) as unknown as CommentRow[]).map((row) => ({
    ...row,
    author: asSingle(row.author),
  }));
}

export async function addComment(taskId: string, authorId: string, body: string): Promise<void> {
  if (!isSupabaseConfigured) {
    demoAddComment(taskId, authorId, body);
    return;
  }

  const { error } = await getSupabase().from('task_comments').insert({
    task_id: taskId,
    author_id: authorId,
    body,
  });

  if (error) {
    throw error;
  }
}
