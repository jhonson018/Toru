/**
 * Tipos del modelo de datos.
 *
 * Usan los mismos nombres que las columnas de Postgres (snake_case).
 * Así, al leer una consulta, el objeto de TypeScript y la fila SQL
 * se corresponden sin una capa de traducción.
 *
 * Si más adelante cambias una columna, actualiza este archivo y el SQL
 * de supabase/migrations. La CLI de Supabase también puede generarlos.
 */

export const TASK_STATUSES = ['todo', 'in_progress', 'done'] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_PRIORITIES = ['low', 'medium', 'high'] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const TEAM_ROLES = ['owner', 'member'] as const;
export type TeamRole = (typeof TEAM_ROLES)[number];

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  callsign: string;
  created_at: string;
}

export interface Team {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: TeamRole;
  created_at: string;
}

export interface TeamMemberWithProfile extends TeamMember {
  profile: Pick<Profile, 'id' | 'full_name' | 'email' | 'callsign'> | null;
}

export interface Task {
  id: string;
  team_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  assignee_id: string | null;
  created_by: string;
  completed_at: string | null;
  xp_awarded: number | null;
  created_at: string;
  updated_at: string;
}

export interface TaskSubtask {
  id: string;
  task_id: string;
  title: string;
  is_done: boolean;
  position: number;
}

export interface SubtaskInput {
  title: string;
  is_done: boolean;
}

export interface TaskWithPeople extends Task {
  assignee: Pick<Profile, 'id' | 'full_name' | 'email' | 'callsign'> | null;
  creator: Pick<Profile, 'id' | 'full_name' | 'email' | 'callsign'> | null;
  subtasks: TaskSubtask[];
}

export interface TaskDraft {
  team_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  assignee_id: string | null;
  created_by: string;
}

export type TaskUpdate = Pick<
  TaskDraft,
  'title' | 'description' | 'status' | 'priority' | 'due_date' | 'assignee_id'
>;

export interface TaskComment {
  id: string;
  task_id: string;
  author_id: string;
  body: string;
  created_at: string;
}

export interface TaskCommentWithAuthor extends TaskComment {
  author: Pick<Profile, 'id' | 'full_name'> | null;
}

export function isTaskStatus(value: string): value is TaskStatus {
  return (TASK_STATUSES as readonly string[]).includes(value);
}

export function isTaskPriority(value: string): value is TaskPriority {
  return (TASK_PRIORITIES as readonly string[]).includes(value);
}

export function isTeamRole(value: string): value is TeamRole {
  return (TEAM_ROLES as readonly string[]).includes(value);
}
