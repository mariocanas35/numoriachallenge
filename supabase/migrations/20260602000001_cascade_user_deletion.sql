-- 20260602000001_cascade_user_deletion.sql
--
-- Permite que un admin elimine permanentemente a un usuario desde el panel.
--
-- Problema: al borrar un usuario, el borrado en cascada auth.users -> profiles
-- fallaba ("Database error deleting user") porque dos FKs bloqueaban el borrado
-- del profile:
--   * teams.coach_id           -> estaba ON DELETE RESTRICT
--   * contest_sessions.opened_by -> no tenia regla (NO ACTION)
-- Como un maestro normalmente tiene un equipo (es coach), el borrado siempre
-- fallaba.
--
-- Fix: cambiar ambas a ON DELETE CASCADE. Al eliminar al usuario, sus equipos
-- (como coach) y las sesiones que abrio se borran en cascada. La cadena ya esta
-- limpia (team_members, contest_sessions.team_id, session_id, etc. ya son
-- CASCADE), asi que no quedan bloqueos.
--
-- Idempotente: elimina la FK existente sobre la columna (sea cual sea su nombre)
-- y la recrea con CASCADE. Se puede correr varias veces sin error.

-- teams.coach_id -> CASCADE
do $$
declare r record;
begin
  for r in
    select conname from pg_constraint
    where conrelid = 'public.teams'::regclass and contype = 'f'
      and pg_get_constraintdef(oid) ilike '%(coach_id)%profiles%'
  loop
    execute format('alter table public.teams drop constraint %I', r.conname);
  end loop;
  alter table public.teams
    add constraint teams_coach_id_fkey
    foreign key (coach_id) references public.profiles(id) on delete cascade;
end $$;

-- contest_sessions.opened_by -> CASCADE
do $$
declare r record;
begin
  for r in
    select conname from pg_constraint
    where conrelid = 'public.contest_sessions'::regclass and contype = 'f'
      and pg_get_constraintdef(oid) ilike '%(opened_by)%profiles%'
  loop
    execute format('alter table public.contest_sessions drop constraint %I', r.conname);
  end loop;
  alter table public.contest_sessions
    add constraint contest_sessions_opened_by_fkey
    foreign key (opened_by) references public.profiles(id) on delete cascade;
end $$;
