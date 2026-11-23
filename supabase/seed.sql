-- Datos de ejemplo. Contraseña de las dos cuentas: clave-demo
-- Correos: ana@ejemplo.com (indicativo YJ-07 HALCÓN) y luis@ejemplo.com.
-- Ejecuta esto después de la migración. Si falla, corre rollback; y no lo uses en producción.

begin;

create or replace function public._seed_demo_user(p_id uuid, p_email text, p_name text, p_callsign text)
returns void
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
begin
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    confirmation_token, recovery_token, email_change, email_change_token_new,
    email_change_token_current, phone_change, phone_change_token, reauthentication_token,
    email_change_confirm_status, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, is_sso_user
  ) values (
    '00000000-0000-0000-0000-000000000000',
    p_id, 'authenticated', 'authenticated', p_email,
    extensions.crypt('clave-demo', extensions.gen_salt('bf', 10)),
    now(), '', '', '', '', '', '', '', '', 0,
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', p_name, 'callsign', p_callsign),
    now(), now(), false
  ) on conflict (id) do nothing;

  insert into auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) values (
    p_id, p_id,
    jsonb_build_object('sub', p_id::text, 'email', p_email, 'email_verified', true),
    'email', p_id::text, now(), now(), now()
  ) on conflict (id) do nothing;
end;
$$;

select public._seed_demo_user(
  '11111111-1111-4111-8111-111111111111',
  'ana@ejemplo.com',
  'Ana García',
  'YJ-07 HALCÓN'
);

select public._seed_demo_user(
  '22222222-2222-4222-8222-222222222222',
  'luis@ejemplo.com',
  'Luis Pérez',
  'LP-12 LUCIDO'
);

drop function public._seed_demo_user(uuid, text, text, text);

insert into public.teams (id, name, created_by)
values ('33333333-3333-4333-8333-333333333333', 'Unidad Halcón', '11111111-1111-4111-8111-111111111111')
on conflict (id) do nothing;

insert into public.team_members (team_id, user_id, role)
values ('33333333-3333-4333-8333-333333333333', '22222222-2222-4222-8222-222222222222', 'member')
on conflict (team_id, user_id) do nothing;

insert into public.tasks (
  id, team_id, title, description, status, priority, due_date, assignee_id, created_by
) values
  (
    '44444444-4444-4444-8444-444444444442',
    '33333333-3333-4333-8333-333333333333',
    'Entregar etiquetas Edén Botánico',
    'Exportar las 9 etiquetas finales en PNG y SVG para impresión.',
    'in_progress', 'high', timestamptz '2026-11-25 18:00:00+00',
    '11111111-1111-4111-8111-111111111111',
    '11111111-1111-4111-8111-111111111111'
  ),
  (
    '44444444-4444-4444-8444-444444444444',
    '33333333-3333-4333-8333-333333333333',
    'Fondo app hangar',
    'Entregar versiones móvil y escritorio con overlay.',
    'in_progress', 'low', timestamptz '2026-12-02 17:00:00+00',
    '22222222-2222-4222-8222-222222222222',
    '11111111-1111-4111-8111-111111111111'
  )
on conflict (id) do nothing;

insert into public.task_subtasks (task_id, title, is_done, position) values
  ('44444444-4444-4444-8444-444444444442', 'Estructura base de etiquetado', true, 0),
  ('44444444-4444-4444-8444-444444444442', 'Ilustraciones de ingredientes', true, 1),
  ('44444444-4444-4444-8444-444444444442', 'Mayúsculas en nombres ("De Averno")', true, 2),
  ('44444444-4444-4444-8444-444444444442', 'Sábila en jabón para piel grasa', true, 3),
  ('44444444-4444-4444-8444-444444444442', 'Exportar final de textos', true, 4),
  ('44444444-4444-4444-8444-444444444442', 'Revisión de paleta', true, 5),
  ('44444444-4444-4444-8444-444444444442', 'Exportar SVG editables', false, 6),
  ('44444444-4444-4444-8444-444444444442', 'Enviar a Mery para aprobación', false, 7),
  ('44444444-4444-4444-8444-444444444442', 'Imprimir pruebas de color', false, 8),
  ('44444444-4444-4444-8444-444444444444', 'Fotografía del hangar', true, 0),
  ('44444444-4444-4444-8444-444444444444', 'Overlay de rejilla', true, 1),
  ('44444444-4444-4444-8444-444444444444', 'Versión móvil', true, 2),
  ('44444444-4444-4444-8444-444444444444', 'Recorte de luces', true, 3),
  ('44444444-4444-4444-8444-444444444444', 'Exportar versión escritorio', false, 4);

insert into public.task_comments (task_id, author_id, body) values (
  '44444444-4444-4444-8444-444444444442',
  '11111111-1111-4111-8111-111111111111',
  'Confirmar con Mery el peso neto antes de imprimir. Papel adhesivo mate.'
);

commit;
