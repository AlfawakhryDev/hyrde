-- Outcome-style intake: a client describes an outcome ("I need an MVP"), the
-- AI decomposes it into an ordered milestone plan. Each milestone is a normal
-- `tasks` row (AI-matched, AI-reviewed, paid on delivery) — `projects` just
-- groups them and tracks overall progress. Milestones are matched
-- sequentially: only the first is auto-assigned on creation; approving a
-- milestone (poster action, already-authenticated) triggers matching the
-- next one client-side, via the existing /api/assign endpoint.

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  poster_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  outcome_brief text not null,     -- the client's original outcome-level ask
  status text not null default 'active' check (status in ('active','completed','cancelled')),
  milestone_total int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.projects enable row level security;

-- Milestone columns on tasks FIRST, so the policy below can reference them.
alter table public.tasks add column if not exists project_id uuid references public.projects(id) on delete cascade;
alter table public.tasks add column if not exists milestone_index int;
alter table public.tasks add column if not exists milestone_total int;
create index if not exists tasks_project_id_idx on public.tasks (project_id, milestone_index);

-- Poster sees/owns their own projects.
drop policy if exists projects_select_own on public.projects;
create policy projects_select_own on public.projects
  for select to authenticated using (poster_id = auth.uid());
drop policy if exists projects_insert_own on public.projects;
create policy projects_insert_own on public.projects
  for insert to authenticated with check (poster_id = auth.uid());
drop policy if exists projects_update_own on public.projects;
create policy projects_update_own on public.projects
  for update to authenticated using (poster_id = auth.uid());

-- Freelancers matched to a milestone can read the parent project's
-- title/brief for context (shown in the task detail "part of a project" strip).
drop policy if exists projects_select_milestone_freelancer on public.projects;
create policy projects_select_milestone_freelancer on public.projects
  for select to authenticated
  using (exists (
    select 1 from public.tasks t
    where t.project_id = projects.id and t.claimed_by_user_id = auth.uid()
  ));
