-- Toru: modelo inicial.
-- Ejecuta este archivo en el SQL Editor de Supabase (una sola vez)
-- antes de supabase/seed.sql.
--
-- RLS: cada política deja ver solo las filas de los equipos de la persona.
-- current_team_ids() es security definer para no entrar en un bucle
-- (una política que lee la misma tabla que protege).

create extension if not exists pgcrypto with schema extensions;

-- Perfiles. El indicativo (callsign) es el nombre de la cabina, p. ej. YJ-07 HALCÓN.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null,
  callsign text not null default '',
  created_at timestamptz not null default now(),
  constraint profiles_full_name_check check (char_length(trim(full_name)) between 1 and 80),
  constraint profiles_callsign_check check (char_length(callsign) <= 40)
);

create unique index profiles_callsign_unique
  on public.profiles (lower(callsign))
  where length(trim(callsign)) > 0;

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint teams_name_check check (char_length(trim(name)) between 1 and 60)
);

create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  constraint team_members_role_check check (role in ('owner', 'member')),
  constraint team_members_team_user_key unique (team_id, user_id)
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'todo',
  priority text not null default 'medium',
  due_date timestamptz,
  assignee_id uuid references public.profiles (id) on delete set null,
  created_by uuid not null references public.profiles (id) on delete restrict,
  completed_at timestamptz,
  xp_awarded integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tasks_title_check check (char_length(trim(title)) between 1 and 120),
  constraint tasks_description_check check (description is null or char_length(description) <= 2000),
  constraint tasks_status_check check (status in ('todo', 'in_progress', 'done')),
  constraint tasks_priority_check check (priority in ('low', 'medium', 'high'))
);

-- Los sub-objetivos alimentan la lista, la energía y el XP.
create table public.task_subtasks (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  title text not null,
  is_done boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  constraint task_subtasks_title_check check (char_length(trim(title)) between 1 and 160)
);

create table public.task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete restrict,
  body text not null,
  created_at timestamptz not null default now(),
  constraint task_comments_body_check check (char_length(trim(body)) between 1 and 1000)
);

create index tasks_team_id_idx on public.tasks (team_id);
create index tasks_assignee_id_idx on public.tasks (assignee_id);
create index team_members_user_id_idx on public.team_members (user_id);
create index task_subtasks_task_id_idx on public.task_subtasks (task_id);
create index task_comments_task_id_idx on public.task_comments (task_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, callsign)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(nullif(trim(new.raw_user_meta_data->>'full_name'), ''), split_part(coalesce(new.email, 'piloto'), '@', 1)),
    coalesce(nullif(trim(new.raw_user_meta_data->>'callsign'), ''), '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.add_team_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.team_members (team_id, user_id, role)
  values (new.id, new.created_by, 'owner');
  return new;
end;
$$;

create trigger on_team_created
  after insert on public.teams
  for each row execute function public.add_team_owner();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

create or replace function public.stamp_completed_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.status = 'done' and (tg_op = 'INSERT' or old.status is distinct from 'done') then
    new.completed_at = coalesce(new.completed_at, now());
  elsif new.status <> 'done' then
    new.completed_at = null;
  end if;
  return new;
end;
$$;

create trigger tasks_stamp_completed_at
  before insert or update on public.tasks
  for each row execute function public.stamp_completed_at();

create or replace function public.ensure_assignee_in_team()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.assignee_id is not null and not exists (
    select 1 from public.team_members
    where team_id = new.team_id and user_id = new.assignee_id
  ) then
    raise exception 'La persona asignada no pertenece al equipo';
  end if;
  return new;
end;
$$;

create trigger tasks_assignee_in_team
  before insert or update on public.tasks
  for each row execute function public.ensure_assignee_in_team();

-- Equipos del usuario actual. security definer evita la recursión de RLS.
create or replace function public.current_team_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select team_id from public.team_members where user_id = auth.uid();
$$;

create or replace function public.is_team_owner(target_team uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.team_members
    where team_id = target_team and user_id = auth.uid() and role = 'owner'
  );
$$;

-- Permite entrar con el indicativo. Solo devuelve el correo, no el resto del perfil.
create or replace function public.email_for_callsign(p_callsign text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select email
  from public.profiles
  where lower(callsign) = lower(trim(p_callsign))
    and length(trim(p_callsign)) > 0
  limit 1;
$$;

revoke all on function public.handle_new_user() from public;
revoke all on function public.add_team_owner() from public;
revoke all on function public.set_updated_at() from public;
revoke all on function public.stamp_completed_at() from public;
revoke all on function public.ensure_assignee_in_team() from public;
revoke all on function public.current_team_ids() from public;
revoke all on function public.is_team_owner(uuid) from public;
revoke all on function public.email_for_callsign(text) from public;
grant execute on function public.current_team_ids() to authenticated;
grant execute on function public.is_team_owner(uuid) to authenticated;
grant execute on function public.email_for_callsign(text) to anon, authenticated;

alter table public.profiles enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.tasks enable row level security;
alter table public.task_subtasks enable row level security;
alter table public.task_comments enable row level security;

create policy "Leer el propio perfil o el de la unidad"
  on public.profiles for select to authenticated
  using (
    id = auth.uid()
    or id in (
      select tm.user_id from public.team_members tm
      where tm.team_id in (select public.current_team_ids())
    )
  );

create policy "Actualizar el propio perfil"
  on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "Ver los equipos propios"
  on public.teams for select to authenticated
  using (id in (select public.current_team_ids()));

create policy "Crear un equipo"
  on public.teams for insert to authenticated
  with check (created_by = auth.uid());

create policy "El responsable edita el equipo"
  on public.teams for update to authenticated
  using (public.is_team_owner(id))
  with check (public.is_team_owner(id));

create policy "Ver miembros de mis equipos"
  on public.team_members for select to authenticated
  using (team_id in (select public.current_team_ids()));

create policy "El responsable invita"
  on public.team_members for insert to authenticated
  with check (public.is_team_owner(team_id));

create policy "Ver misiones de la unidad"
  on public.tasks for select to authenticated
  using (team_id in (select public.current_team_ids()));

create policy "Crear misiones en la unidad"
  on public.tasks for insert to authenticated
  with check (
    team_id in (select public.current_team_ids())
    and created_by = auth.uid()
  );

create policy "Editar misiones de la unidad"
  on public.tasks for update to authenticated
  using (team_id in (select public.current_team_ids()))
  with check (team_id in (select public.current_team_ids()));

create policy "Ver sub-objetivos de misiones visibles"
  on public.task_subtasks for select to authenticated
  using (
    exists (
      select 1 from public.tasks t
      where t.id = task_id and t.team_id in (select public.current_team_ids())
    )
  );

create policy "Crear sub-objetivos"
  on public.task_subtasks for insert to authenticated
  with check (
    exists (
      select 1 from public.tasks t
      where t.id = task_id and t.team_id in (select public.current_team_ids())
    )
  );

create policy "Editar sub-objetivos"
  on public.task_subtasks for update to authenticated
  using (
    exists (
      select 1 from public.tasks t
      where t.id = task_id and t.team_id in (select public.current_team_ids())
    )
  )
  with check (
    exists (
      select 1 from public.tasks t
      where t.id = task_id and t.team_id in (select public.current_team_ids())
    )
  );

create policy "Borrar sub-objetivos"
  on public.task_subtasks for delete to authenticated
  using (
    exists (
      select 1 from public.tasks t
      where t.id = task_id and t.team_id in (select public.current_team_ids())
    )
  );

create policy "Ver notas de misiones visibles"
  on public.task_comments for select to authenticated
  using (
    exists (
      select 1 from public.tasks t
      where t.id = task_id and t.team_id in (select public.current_team_ids())
    )
  );

create policy "Escribir notas"
  on public.task_comments for insert to authenticated
  with check (
    author_id = auth.uid()
    and exists (
      select 1 from public.tasks t
      where t.id = task_id and t.team_id in (select public.current_team_ids())
    )
  );

revoke all on public.profiles from anon;
revoke all on public.teams from anon;
revoke all on public.team_members from anon;
revoke all on public.tasks from anon;
revoke all on public.task_subtasks from anon;
revoke all on public.task_comments from anon;

grant select, update on public.profiles to authenticated;
grant select, insert, update on public.teams to authenticated;
grant select, insert, delete on public.team_members to authenticated;
grant select, insert, update, delete on public.tasks to authenticated;
grant select, insert, update, delete on public.task_subtasks to authenticated;
grant select, insert on public.task_comments to authenticated;

alter table public.tasks replica identity full;
alter table public.task_subtasks replica identity full;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'tasks'
  ) then
    alter publication supabase_realtime add table public.tasks;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'task_subtasks'
  ) then
    alter publication supabase_realtime add table public.task_subtasks;
  end if;
end $$;
