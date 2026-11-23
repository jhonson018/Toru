import type { Session } from '@supabase/supabase-js';

import type {
  Profile,
  SubtaskInput,
  TaskCommentWithAuthor,
  TaskDraft,
  TaskSubtask,
  TaskUpdate,
  TaskWithPeople,
  Team,
  TeamMemberWithProfile,
} from '@/types/database';

/**
 * Cabina de demostración.
 * Si no hay proyecto de Supabase, las pantallas usan estos datos en memoria
 * para que se pueda ver el diseño de Astrak sin backend.
 */

export const DEMO_USER_ID = '11111111-1111-4111-8111-111111111111';
const LUIS_ID = '22222222-2222-4222-8222-222222222222';
const TEAM_ID = '33333333-3333-4333-8333-333333333333';

const ANA: Profile = {
  id: DEMO_USER_ID,
  email: 'ana@ejemplo.com',
  full_name: 'Ana García',
  callsign: 'YJ-07 HALCÓN',
  created_at: '2026-01-01T00:00:00.000Z',
};

const LUIS: Profile = {
  id: LUIS_ID,
  email: 'luis@ejemplo.com',
  full_name: 'Luis Pérez',
  callsign: 'LP-12 LUCIDO',
  created_at: '2026-01-02T00:00:00.000Z',
};

function isoDaysFromNow(days: number, hours = 18, minutes = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
}

function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(12, 0, 0, 0);
  return date.toISOString();
}

function subtasks(taskId: string, items: { title: string; is_done: boolean }[]): TaskSubtask[] {
  return items.map((item, position) => ({
    id: `${taskId}-sub-${position + 1}`,
    task_id: taskId,
    title: item.title,
    is_done: item.is_done,
    position,
  }));
}

function mission(
  partial: Omit<TaskWithPeople, 'subtasks' | 'assignee' | 'creator'> & {
    assignee?: Profile | null;
    subtasks: { title: string; is_done: boolean }[];
  },
): TaskWithPeople {
  return {
    ...partial,
    assignee: partial.assignee ?? ANA,
    creator: ANA,
    subtasks: subtasks(partial.id, partial.subtasks),
  };
}

function buildTasks(): TaskWithPeople[] {
  const open: TaskWithPeople[] = [
    mission({
      id: '44444444-4444-4444-8444-444444444441',
      team_id: TEAM_ID,
      title: 'Calibrar sensores del HUD',
      description: 'Alinear el brillo del anillo y la rejilla antes del turno.',
      status: 'in_progress',
      priority: 'medium',
      due_date: isoDaysFromNow(0, 21, 0),
      assignee_id: LUIS_ID,
      assignee: LUIS,
      created_by: DEMO_USER_ID,
      completed_at: null,
      xp_awarded: null,
      created_at: daysAgo(3),
      updated_at: daysAgo(1),
      subtasks: [
        { title: 'Medir brillo del anillo', is_done: true },
        { title: 'Ajustar rejilla', is_done: true },
        { title: 'Probar en el hangar', is_done: false },
        { title: 'Guardar perfil de vuelo', is_done: false },
      ],
    }),
    mission({
      id: '44444444-4444-4444-8444-444444444442',
      team_id: TEAM_ID,
      title: 'Entregar etiquetas Edén Botánico',
      description: 'Exportar las 9 etiquetas finales en PNG y SVG para impresión.',
      status: 'in_progress',
      priority: 'high',
      due_date: '2026-11-25T18:00:00.000Z',
      assignee_id: DEMO_USER_ID,
      created_by: DEMO_USER_ID,
      completed_at: null,
      xp_awarded: null,
      created_at: daysAgo(6),
      updated_at: daysAgo(0),
      subtasks: [
        { title: 'Estructura base de etiquetado', is_done: true },
        { title: 'Ilustraciones de ingredientes', is_done: true },
        { title: 'Mayúsculas en nombres ("De Averno")', is_done: true },
        { title: 'Sábila en jabón para piel grasa', is_done: true },
        { title: 'Exportar final de textos', is_done: true },
        { title: 'Revisión de paleta', is_done: true },
        { title: 'Exportar SVG editables', is_done: false },
        { title: 'Enviar a Mery para aprobación', is_done: false },
        { title: 'Imprimir pruebas de color', is_done: false },
      ],
    }),
    mission({
      id: '44444444-4444-4444-8444-444444444443',
      team_id: TEAM_ID,
      title: 'Revisar paleta nocturna',
      description: 'Bajar el cian de los paneles para el turno de noche.',
      status: 'todo',
      priority: 'medium',
      due_date: isoDaysFromNow(4, 17, 0),
      assignee_id: DEMO_USER_ID,
      created_by: DEMO_USER_ID,
      completed_at: null,
      xp_awarded: null,
      created_at: daysAgo(2),
      updated_at: daysAgo(2),
      subtasks: [
        { title: 'Comparar con el fondo del hangar', is_done: true },
        { title: 'Proponer tres acentos', is_done: false },
        { title: 'Validar contraste del ámbar', is_done: false },
      ],
    }),
    mission({
      id: '44444444-4444-4444-8444-444444444444',
      team_id: TEAM_ID,
      title: 'Fondo app hangar',
      description: 'Entregar versiones móvil y escritorio con overlay.',
      status: 'in_progress',
      priority: 'low',
      due_date: '2026-12-02T17:00:00.000Z',
      assignee_id: LUIS_ID,
      assignee: LUIS,
      created_by: DEMO_USER_ID,
      completed_at: null,
      xp_awarded: null,
      created_at: daysAgo(8),
      updated_at: daysAgo(1),
      subtasks: [
        { title: 'Fotografía del hangar', is_done: true },
        { title: 'Overlay de rejilla', is_done: true },
        { title: 'Versión móvil', is_done: true },
        { title: 'Recorte de luces', is_done: true },
        { title: 'Exportar versión escritorio', is_done: false },
      ],
    }),
    mission({
      id: '44444444-4444-4444-8444-444444444445',
      team_id: TEAM_ID,
      title: 'Archivar telemetría',
      description: 'Cerrar el paquete de vuelo de la semana y dejarlo en el hangar.',
      status: 'todo',
      priority: 'low',
      due_date: isoDaysFromNow(12, 11, 0),
      assignee_id: null,
      assignee: null,
      created_by: DEMO_USER_ID,
      completed_at: null,
      xp_awarded: null,
      created_at: daysAgo(1),
      updated_at: daysAgo(1),
      subtasks: [
        { title: 'Exportar registros', is_done: false },
        { title: 'Nombrar el paquete', is_done: false },
      ],
    }),
  ];

  const xpEach = [220, 220, 220, 200, 200, 200, 200, 200, 200, 200, 200, 200];
  const done = xpEach.map((xp, index) =>
    mission({
      id: `55555555-5555-4555-8555-5555555555${String(index).padStart(2, '0')}`,
      team_id: TEAM_ID,
      title: `Misión archivada ${String(index + 1).padStart(2, '0')}`,
      description: 'Cerrada en turnos anteriores.',
      status: 'done',
      priority: 'low',
      due_date: daysAgo(index),
      assignee_id: DEMO_USER_ID,
      created_by: DEMO_USER_ID,
      completed_at: daysAgo(index < 5 ? index : index + 2),
      xp_awarded: xp,
      created_at: daysAgo(index + 10),
      updated_at: daysAgo(index < 5 ? index : index + 2),
      subtasks: [{ title: 'Cerrar paquete', is_done: true }],
    }),
  );

  return [...open, ...done];
}

let tasks = buildTasks();
let createdCount = 0;
let comments: TaskCommentWithAuthor[] = [
  {
    id: '66666666-6666-4666-8666-666666666661',
    task_id: '44444444-4444-4444-8444-444444444442',
    author_id: DEMO_USER_ID,
    body: 'Confirmar con Mery el peso neto antes de imprimir. Papel adhesivo mate.',
    created_at: daysAgo(0),
    author: { id: DEMO_USER_ID, full_name: ANA.full_name },
  },
];

export function demoSession(): Session {
  return {
    access_token: 'demo',
    refresh_token: 'demo',
    expires_in: 60 * 60,
    expires_at: Math.floor(Date.now() / 1000) + 60 * 60,
    token_type: 'bearer',
    user: {
      id: DEMO_USER_ID,
      aud: 'authenticated',
      email: ANA.email,
      app_metadata: {},
      user_metadata: { full_name: ANA.full_name, callsign: ANA.callsign },
      created_at: ANA.created_at,
    },
  } as Session;
}

export function demoProfile(): Profile {
  return ANA;
}

export function demoTeams(): Team[] {
  return [
    { id: TEAM_ID, name: 'Unidad Halcón', created_by: DEMO_USER_ID, created_at: ANA.created_at },
  ];
}

export function demoMembers(): TeamMemberWithProfile[] {
  return [
    {
      id: '77777777-7777-4777-8777-777777777771',
      team_id: TEAM_ID,
      user_id: DEMO_USER_ID,
      role: 'owner',
      created_at: ANA.created_at,
      profile: ANA,
    },
    {
      id: '77777777-7777-4777-8777-777777777772',
      team_id: TEAM_ID,
      user_id: LUIS_ID,
      role: 'member',
      created_at: LUIS.created_at,
      profile: LUIS,
    },
  ];
}

export function demoTasks(): TaskWithPeople[] {
  return tasks.map((task) => ({ ...task, subtasks: task.subtasks.map((item) => ({ ...item })) }));
}

export function demoTask(id: string): TaskWithPeople | null {
  return demoTasks().find((task) => task.id === id) ?? null;
}

export function demoCreateTask(draft: TaskDraft, items: SubtaskInput[]): string {
  createdCount += 1;
  const id = `44444444-4444-4444-9444-${String(createdCount).padStart(12, '0')}`;
  tasks = [
    mission({
      id,
      team_id: draft.team_id,
      title: draft.title,
      description: draft.description,
      status: draft.status,
      priority: draft.priority,
      due_date: draft.due_date,
      assignee_id: draft.assignee_id,
      created_by: draft.created_by,
      completed_at: null,
      xp_awarded: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      subtasks: items,
    }),
    ...tasks,
  ];
  return id;
}

export function demoUpdateTask(
  id: string,
  patch: Partial<TaskUpdate> & { xp_awarded?: number | null },
): void {
  tasks = tasks.map((task) => {
    if (task.id !== id) return task;
    const next = { ...task, ...patch, updated_at: new Date().toISOString() };
    if (patch.status === 'done' && !next.completed_at) {
      next.completed_at = new Date().toISOString();
    }
    if (patch.status && patch.status !== 'done') {
      next.completed_at = null;
      next.xp_awarded = null;
    }
    return next;
  });
}

export function demoReplaceSubtasks(taskId: string, items: SubtaskInput[]): void {
  tasks = tasks.map((task) =>
    task.id === taskId ? { ...task, subtasks: subtasks(taskId, items) } : task,
  );
}

export function demoSetSubtaskDone(id: string, isDone: boolean): void {
  tasks = tasks.map((task) => ({
    ...task,
    subtasks: task.subtasks.map((item) => (item.id === id ? { ...item, is_done: isDone } : item)),
  }));
}

export function demoComplete(id: string, xp: number): void {
  tasks = tasks.map((task) => {
    if (task.id !== id) return task;
    return {
      ...task,
      status: 'done',
      completed_at: new Date().toISOString(),
      xp_awarded: xp,
      updated_at: new Date().toISOString(),
      subtasks: task.subtasks.map((item) => ({ ...item, is_done: true })),
    };
  });
}

export function demoComments(taskId: string): TaskCommentWithAuthor[] {
  return comments.filter((comment) => comment.task_id === taskId);
}

export function demoAddComment(taskId: string, authorId: string, body: string): void {
  comments = [
    ...comments,
    {
      id: `c-${Date.now()}`,
      task_id: taskId,
      author_id: authorId,
      body,
      created_at: new Date().toISOString(),
      author: { id: authorId, full_name: authorId === LUIS_ID ? LUIS.full_name : ANA.full_name },
    },
  ];
}

export function demoNextOpenId(currentId: string): string | null {
  const open = demoTasks().filter((task) => task.status !== 'done' && task.id !== currentId);
  return open[0]?.id ?? null;
}
