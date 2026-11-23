import { z } from 'zod';

import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  type Task,
  type TaskDraft,
  type TaskUpdate,
} from '@/types/database';

function isRealIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [yearText, monthText, dayText] = value.split('-');
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

export const taskFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Escribe un título.')
    .max(120, 'El título admite 120 caracteres.'),
  description: z.string().trim().max(2000, 'La descripción admite 2000 caracteres.'),
  status: z.enum(TASK_STATUSES),
  priority: z.enum(TASK_PRIORITIES),
  due_date: z
    .string()
    .trim()
    .refine(
      (value) => value.length === 0 || isRealIsoDate(value),
      'Usa una fecha real, con formato AAAA-MM-DD.',
    ),
  due_time: z
    .string()
    .trim()
    .refine(
      (value) => value.length === 0 || /^([01]\d|2[0-3]):[0-5]\d$/.test(value),
      'La hora es HH:MM.',
    ),
  assignee_id: z.string().uuid('Elige una persona del equipo.').nullable(),
});

export const commentSchema = z
  .string()
  .trim()
  .min(1, 'Escribe un comentario.')
  .max(1000, 'El comentario admite 1000 caracteres.');

export type TaskFormValues = z.infer<typeof taskFormSchema>;

export const emptyTaskForm: TaskFormValues = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  due_date: '',
  due_time: '',
  assignee_id: null,
};

function splitDue(value: string | null): { due_date: string; due_time: string } {
  if (!value) {
    return { due_date: '', due_time: '' };
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return { due_date: value, due_time: '18:00' };
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return { due_date: '', due_time: '' };
  }
  const dueDate = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
  const dueTime = [
    String(date.getHours()).padStart(2, '0'),
    String(date.getMinutes()).padStart(2, '0'),
  ].join(':');
  return { due_date: dueDate, due_time: dueTime };
}

function combineDue(date: string, time: string): string | null {
  if (!date) {
    return null;
  }
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = (time || '18:00').split(':').map(Number);
  return new Date(year, (month ?? 1) - 1, day, hour, minute, 0, 0).toISOString();
}

export function taskToFormValues(task: Task): TaskFormValues {
  const due = splitDue(task.due_date);
  return {
    title: task.title,
    description: task.description ?? '',
    status: task.status,
    priority: task.priority,
    due_date: due.due_date,
    due_time: due.due_time,
    assignee_id: task.assignee_id,
  };
}

function toNullableFields(values: TaskFormValues) {
  return {
    title: values.title,
    description: values.description.length > 0 ? values.description : null,
    status: values.status,
    priority: values.priority,
    due_date: combineDue(values.due_date, values.due_time),
    assignee_id: values.assignee_id,
  };
}

export function formValuesToDraft(
  values: TaskFormValues,
  extra: { team_id: string; created_by: string },
): TaskDraft {
  return { ...extra, ...toNullableFields(values) };
}

export function formValuesToUpdate(values: TaskFormValues): TaskUpdate {
  return toNullableFields(values);
}
