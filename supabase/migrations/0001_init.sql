-- ════════════════════════════════════════════════════════════════════════
-- Hyrde — initial relational schema (Postgres / Supabase)
-- Run this in Supabase → SQL Editor → New query → paste → Run.
-- ════════════════════════════════════════════════════════════════════════

-- ── Enums ────────────────────────────────────────────────────────────────
create type task_status  as enum ('open','agent_attempted','mounted','delivered','closed');
create type task_origin  as enum ('human','ai_client');
create type mount_status as enum ('claimed','in_progress','delivered','released');
create type lead_status  as enum ('new','contacted','active','archived');

-- ── Clients (hire-side leads / waitlist) ─────────────────────────────────
create table public.clients (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text,
  email       text not null,
  company     text,
  brief       text,
  budget      text,
  timeline    text,
  source      text default 'web',
  status      lead_status not null default 'new'
);

-- ── Pilots (freelancer-side leads / waitlist) ────────────────────────────
create table public.pilots (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  name              text,
  email             text not null,
  primary_skill     text,
  experience_level  text,
  location          text,
  portfolio_url     text,
  referral          text,
  xp                integer not null default 0,
  status            lead_status not null default 'new'
);

-- ── Tasks (work dropped into the Arena) ──────────────────────────────────
create table public.tasks (
  id                 uuid primary key default gen_random_uuid(),
  created_at         timestamptz not null default now(),
  client_id          uuid references public.clients(id) on delete set null,
  title              text not null,
  brief              text not null,
  category           text,
  origin             task_origin not null default 'human',
  status             task_status not null default 'open',
  agent_completion   integer not null default 0 check (agent_completion between 0 and 100),
  agent_summary      text,
  agent_deliverable  text
);

-- ── Mounts (a pilot taking a task to the finish line) ────────────────────
create table public.mounts (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  task_id     uuid not null references public.tasks(id) on delete cascade,
  pilot_id    uuid references public.pilots(id) on delete set null,
  pilot_email text,
  role        text,
  xp          integer not null default 0,
  bounty      text,
  status      mount_status not null default 'claimed'
);

-- ── Indexes ──────────────────────────────────────────────────────────────
create index tasks_status_created_idx on public.tasks (status, created_at desc);
create index tasks_category_idx       on public.tasks (category);
create index mounts_task_idx          on public.mounts (task_id);

-- ════════════════════════════════════════════════════════════════════════
-- Row Level Security (Supabase requires this for the public anon key)
-- v1 policy: the Arena (tasks + mounts) is public to read & create; client /
-- pilot rows can be created by anyone (signup) but NOT read via the anon key
-- (their PII stays private). Tighten with auth before you scale.
-- ════════════════════════════════════════════════════════════════════════
alter table public.clients enable row level security;
alter table public.pilots  enable row level security;
alter table public.tasks   enable row level security;
alter table public.mounts  enable row level security;

create policy "anon can sign up as client" on public.clients for insert to anon with check (true);
create policy "anon can sign up as pilot"  on public.pilots  for insert to anon with check (true);

create policy "anyone can read tasks"  on public.tasks  for select to anon using (true);
create policy "anyone can post a task" on public.tasks  for insert to anon with check (true);

create policy "anyone can read mounts"  on public.mounts for select to anon using (true);
create policy "anyone can create mount" on public.mounts for insert to anon with check (true);

-- ── Seed a few tasks so the app shows life on first run ──────────────────
insert into public.tasks (title, brief, category, origin, status, agent_completion, agent_summary) values
  ('Write launch-day landing page copy for a SaaS', 'Hero, subhead, 3 benefits, and a CTA for a B2B SaaS that runs better standups.', 'Copywriting', 'human', 'agent_attempted', 75, 'Drafted full landing copy; a human nails the brand voice.'),
  ('Refactor a 400-line Python scraper + add tests', 'Clean up structure and add pytest coverage.', 'Development', 'ai_client', 'agent_attempted', 72, 'Refactored structure; human verifies edge cases.'),
  ('Rebrand a fintech landing page', 'Needs real human taste and visual design.', 'Design', 'human', 'open', 40, 'Scoped and ready for a designer to mount.'),
  ('Draft API docs from an endpoint list', 'Turn 5 REST endpoints into clean docs.', 'Technical writing', 'ai_client', 'agent_attempted', 95, 'Docs drafted; human reviews accuracy.');
