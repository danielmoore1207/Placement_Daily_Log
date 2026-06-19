create extension if not exists pgcrypto;

create table if not exists public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  projects text[] not null default '{}',
  tasks_completed text not null,
  outcomes text not null,
  blockers text not null default '',
  learnings text not null,
  collaboration text not null default '',
  next_steps text not null,
  reflection text not null,
  productivity smallint not null check (productivity between 1 and 5),
  communication smallint not null check (communication between 1 and 5),
  problem_solving smallint not null check (problem_solving between 1 and 5),
  wellbeing smallint not null check (wellbeing between 1 and 5),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint daily_logs_user_date_unique unique (user_id, log_date)
);

create or replace function public.set_daily_logs_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_daily_logs_updated_at on public.daily_logs;
create trigger trg_daily_logs_updated_at
before update on public.daily_logs
for each row
execute function public.set_daily_logs_updated_at();

alter table public.daily_logs enable row level security;

drop policy if exists "daily_logs_select_own" on public.daily_logs;
create policy "daily_logs_select_own"
on public.daily_logs
for select
using (auth.uid() = user_id);

drop policy if exists "daily_logs_insert_own" on public.daily_logs;
create policy "daily_logs_insert_own"
on public.daily_logs
for insert
with check (auth.uid() = user_id);

drop policy if exists "daily_logs_update_own" on public.daily_logs;
create policy "daily_logs_update_own"
on public.daily_logs
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "daily_logs_delete_own" on public.daily_logs;
create policy "daily_logs_delete_own"
on public.daily_logs
for delete
using (auth.uid() = user_id);
