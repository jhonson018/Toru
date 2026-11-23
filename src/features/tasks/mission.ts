import type { TaskWithPeople } from '@/types/database';

export type MissionFilter = 'all' | 'high' | 'today' | 'week';

export const MISSION_FILTERS: readonly { value: MissionFilter; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'high', label: 'Alta' },
  { value: 'today', label: 'Hoy' },
  { value: 'week', label: 'Esta semana' },
];

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function sameDay(iso: string, day: Date): boolean {
  const date = new Date(iso);
  return startOfDay(date).getTime() === startOfDay(day).getTime();
}

function inCurrentWeek(iso: string, now: Date): boolean {
  const date = startOfDay(new Date(iso));
  const today = startOfDay(now);
  const mondayOffset = (today.getDay() + 6) % 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - mondayOffset);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return date >= monday && date <= sunday;
}

/** La cabina muestra misiones abiertas. Hecha sale del carrusel y suma en Completadas. */
export function filterMissions(
  tasks: TaskWithPeople[],
  filter: MissionFilter,
  now = new Date(),
): TaskWithPeople[] {
  const open = tasks
    .filter((task) => task.status !== 'done')
    .sort((a, b) => {
      if (a.due_date && b.due_date && a.due_date !== b.due_date) {
        return a.due_date < b.due_date ? -1 : 1;
      }
      if (a.due_date && !b.due_date) return -1;
      if (!a.due_date && b.due_date) return 1;
      return a.created_at < b.created_at ? -1 : 1;
    });

  if (filter === 'high') {
    return open.filter((task) => task.priority === 'high');
  }
  if (filter === 'today') {
    return open.filter((task) => task.due_date !== null && sameDay(task.due_date, now));
  }
  if (filter === 'week') {
    return open.filter((task) => task.due_date !== null && inCurrentWeek(task.due_date, now));
  }
  return open;
}

export function subtaskProgress(task: TaskWithPeople): { done: number; total: number } {
  const total = task.subtasks.length;
  const done = task.subtasks.filter((item) => item.is_done).length;
  return { done, total };
}

/** Porcentaje de la barra "energía". Sin sub-objetivos, el estado da una cifra provisional. */
export function missionEnergy(task: TaskWithPeople): number {
  const { done, total } = subtaskProgress(task);
  if (total === 0) {
    if (task.status === 'done') return 100;
    if (task.status === 'in_progress') return 40;
    return 0;
  }
  return Math.round((done / total) * 100);
}

export function nextObjective(task: TaskWithPeople): string {
  const pending = [...task.subtasks]
    .sort((a, b) => a.position - b.position)
    .find((item) => !item.is_done);
  if (pending) return pending.title;
  if (task.subtasks.length === 0) return 'Definir sub-objetivos';
  return 'Objetivos listos';
}

export function formatMissionWhen(
  iso: string | null,
  now = new Date(),
): { date: string; countdown: string } {
  if (!iso) {
    return { date: 'SIN PLAZO', countdown: 'T-- --' };
  }

  const due = new Date(iso);
  const date = new Intl.DateTimeFormat('es', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
    .format(due)
    .replace(',', ' ·')
    .replace(/\s+/g, ' ')
    .toUpperCase();

  const diff = due.getTime() - now.getTime();
  const past = diff < 0;
  const abs = Math.abs(diff);
  const days = Math.floor(abs / 86_400_000);
  const hours = Math.floor((abs % 86_400_000) / 3_600_000);
  const countdown = `T${past ? '+' : '-'}${String(days).padStart(2, '0')}D ${String(hours).padStart(2, '0')}H`;

  return { date, countdown };
}

export function formatCounter(index: number, total: number): string {
  const current = total === 0 ? 0 : index + 1;
  return `${String(current).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
}

export type PilotStats = {
  completed: number;
  streakDays: number;
  xp: number;
};

/**
 * XP provisional.
 * TODO: Astrak muestra 2.480 XP en el diseño; esa cifra es de muestra.
 * Hasta definir la progresión real, cada misión hecha vale 100
 * y cada sub-objetivo hecho vale 20.
 */
export function pilotStats(tasks: TaskWithPeople[], now = new Date()): PilotStats {
  const doneTasks = tasks.filter((task) => task.status === 'done');

  const days = new Set<string>();
  for (const task of doneTasks) {
    if (!task.completed_at) continue;
    const date = new Date(task.completed_at);
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    days.add(key);
  }

  let streak = 0;
  const cursor = startOfDay(now);
  const todayKey = `${cursor.getFullYear()}-${cursor.getMonth()}-${cursor.getDate()}`;
  if (!days.has(todayKey)) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (days.has(`${cursor.getFullYear()}-${cursor.getMonth()}-${cursor.getDate()}`)) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return {
    completed: doneTasks.length,
    streakDays: streak,
    xp: doneTasks.reduce(
      (sum, task) => sum + (task.xp_awarded ?? estimatedXp(task.subtasks.length)),
      0,
    ),
  };
}

export function formatXp(xp: number): string {
  return new Intl.NumberFormat('es').format(xp);
}

/**
 * Recompensa provisional.
 * TODO: el diseño de Astrak usa +250 XP y +350 XP como cifras de muestra.
 * Hasta definir la curva real: 100 por desplegar la misión y 50 por cada sub-objetivo.
 */
export function estimatedXp(subtaskCount: number): number {
  return 100 + Math.max(0, subtaskCount) * 50;
}

/** TODO: el nivel sube cada 500 XP. El umbral es provisional. */
export function pilotLevel(totalXp: number): { level: number; into: number; span: number } {
  const span = 500;
  const safe = Math.max(0, totalXp);
  return { level: 1 + Math.floor(safe / span), into: safe % span, span };
}

export function formatDuration(fromIso: string, toIso: string): string {
  const ms = Math.max(0, new Date(toIso).getTime() - new Date(fromIso).getTime());
  const hours = Math.floor(ms / 3_600_000);
  const days = Math.floor(hours / 24);
  const rest = hours % 24;
  return `${String(days).padStart(2, '0')}D ${String(rest).padStart(2, '0')}H`;
}
