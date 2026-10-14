-- Ejecute este archivo una sola vez en Supabase > SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.game_runs (
  id uuid primary key,
  alias varchar(20) not null check (char_length(alias) between 2 and 20),
  started_at timestamptz not null default now()
);

create table if not exists public.results (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null unique references public.game_runs(id) on delete cascade,
  alias varchar(20) not null check (char_length(alias) between 2 and 20),
  score integer not null check (score between 0 and 2000),
  duration_seconds integer not null check (duration_seconds between 20 and 1800),
  moderated boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.level_answers (
  id bigint generated always as identity primary key,
  run_id uuid not null references public.game_runs(id) on delete cascade,
  level_id smallint not null check (level_id between 1 and 10),
  answer varchar(120) not null,
  elapsed_seconds smallint not null check (elapsed_seconds between 0 and 120),
  correct boolean not null,
  unique(run_id, level_id)
);

create index if not exists results_ranking_idx on public.results(score desc, duration_seconds asc, created_at asc) where moderated = false;
create index if not exists level_answers_level_idx on public.level_answers(level_id, correct);

alter table public.game_runs enable row level security;
alter table public.results enable row level security;
alter table public.level_answers enable row level security;

-- No se crean políticas para anon/authenticated: el navegador no puede leer ni escribir.
-- Las funciones Vercel usan exclusivamente la service role, que omite RLS.
revoke all on public.game_runs, public.results, public.level_answers from anon, authenticated;

-- El backend usa exclusivamente service_role / una Secret API Key.
-- RLS continúa bloqueando por completo al navegador y a usuarios anónimos.
grant usage on schema public to service_role;
grant select, insert, update, delete on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;
alter default privileges in schema public grant select, insert, update, delete on tables to service_role;
alter default privileges in schema public grant usage, select on sequences to service_role;

-- Limpieza opcional de sesiones abandonadas (ejecutar mediante tarea programada):
-- delete from public.game_runs g where g.started_at < now() - interval '24 hours'
-- and not exists (select 1 from public.results r where r.run_id = g.id);

