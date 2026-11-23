import type { TaskPriority, TaskStatus } from '@/types/database';

export type TaskListFilter = 'team' | 'mine';

export const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: 'Por hacer',
  in_progress: 'En curso',
  done: 'Hecha',
};

export const PRIORITY_LABEL: Record<TaskPriority, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
};

export const STATUS_OPTIONS = (Object.keys(STATUS_LABEL) as TaskStatus[]).map((value) => ({
  value,
  label: STATUS_LABEL[value],
}));

export const PRIORITY_OPTIONS = (['high', 'medium', 'low'] as const).map((value) => ({
  value,
  label: PRIORITY_LABEL[value],
}));

export const FILTER_OPTIONS: readonly { value: TaskListFilter; label: string }[] = [
  { value: 'team', label: 'Del equipo' },
  { value: 'mine', label: 'Mías' },
];

/** Comparar AAAA-MM-DD como texto evita líos con la hora y la zona horaria. */
export function isOverdue(dueDate: string | null, status: TaskStatus): boolean {
  if (!dueDate || status === 'done') {
    return false;
  }

  const today = new Date();
  const todayKey = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-');

  return dueDate < todayKey;
}

export function formatDueDate(value: string | null): string {
  if (!value) {
    return 'Sin fecha';
  }

  const [yearText, monthText, dayText] = value.split('-');
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  if (!year || !month || !day) {
    return value;
  }

  return new Intl.DateTimeFormat('es', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(year, month - 1, day));
}

export function personName(
  person: { full_name: string; callsign?: string; email?: string } | null | undefined,
  emptyLabel: string,
): string {
  if (!person) {
    return emptyLabel;
  }

  if (person.callsign && person.callsign.trim().length > 0) {
    return person.callsign;
  }

  if (person.full_name.trim().length > 0) {
    return person.full_name;
  }

  return person.email ?? emptyLabel;
}
