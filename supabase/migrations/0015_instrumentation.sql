-- ============================================================================
-- 0015 Outcome instrumentation layer
-- ----------------------------------------------------------------------------
-- Implements sections 1-3 of the Interrogation & Instrumentation spec: the
-- immutable estimate/actual dataset that cannot be retrofitted. Every project
-- that closes without this is a permanently lost data point, so it ships behind
-- the existing (naive) decomposition flow and starts collecting immediately.
--
-- Design decisions reconciled with the live schema:
--   * `projects` already exists (0010). We EXTEND it, never re-create it.
--   * Execution stays on `tasks`; this adds a SEPARATE immutable estimate layer.
--     A `milestones` row + `milestone_estimates` is the frozen quote artifact;
--     a `tasks` row is the execution of it. Linked via `tasks.milestone_id`.
--   * Controlled vocabularies live in lookup tables (FK-enforced) so "extend
--     deliberately" is a one-line INSERT, not a CHECK-constraint migration.
--   * Immutability is enforced at the DB level (BEFORE UPDATE triggers) AND the
--     app level (no update path). Estimates are physically unwritable from the
--     browser: no UPDATE policy exists and a trigger blocks it regardless.
-- ============================================================================

-- ── Shared immutability guards ──────────────────────────────────────────────
create or replace function public.tg_block_update() returns trigger
  language plpgsql as $$
begin
  raise exception 'Row in %.% is immutable and cannot be updated.', TG_TABLE_SCHEMA, TG_TABLE_NAME
    using errcode = 'check_violation';
end $$;

-- ── Controlled vocabularies ─────────────────────────────────────────────────
create table if not exists public.milestone_types (
  type   text primary key,
  active boolean not null default true
);
insert into public.milestone_types (type) values
  ('discovery'),('data_audit'),('information_architecture'),('design_system'),
  ('design_page'),('frontend_build'),('backend_build'),('integration_third_party'),
  ('data_migration'),('content_migration'),('seo_preservation'),('payment_config'),
  ('qa_functional'),('qa_cross_browser'),('performance_optimization'),('deployment'),
  ('training_handover'),('post_launch_support')
on conflict (type) do nothing;

create table if not exists public.change_order_reasons (
  reason text primary key
);
insert into public.change_order_reasons (reason) values
  ('client_added_requirement'),('client_changed_direction'),('undiscovered_technical_debt'),
  ('third_party_limitation'),('data_quality_worse_than_stated'),('missing_asset_from_client'),
  ('freelancer_underestimated'),('external_dependency_delay'),('spec_ambiguity')
on conflict (reason) do nothing;

-- ── Archetype taxonomy (seed: Shopify branch + generic buckets) ─────────────
create table if not exists public.project_archetypes (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  parent_id     uuid references public.project_archetypes(id),
  display_name  text not null,
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);
insert into public.project_archetypes (slug, display_name) values
  ('shopify',              'Shopify (general)'),
  ('shopify_replatform',   'Shopify replatform / migration'),
  ('shopify_theme_custom', 'Shopify custom theme build'),
  ('web_app_mvp',          'Web app / MVP build'),
  ('marketing_site',       'Marketing site / landing pages'),
  ('brand_identity',       'Brand identity / design system'),
  ('content_production',   'Content / copywriting production'),
  ('other',                'Other / unclassified')
on conflict (slug) do nothing;
-- Parent the two Shopify sub-archetypes under the general Shopify node.
update public.project_archetypes c
   set parent_id = p.id
  from public.project_archetypes p
 where p.slug = 'shopify'
   and c.slug in ('shopify_replatform','shopify_theme_custom')
   and c.parent_id is null;

-- ── Extend existing projects table ──────────────────────────────────────────
alter table public.projects add column if not exists raw_request  text;
alter table public.projects add column if not exists archetype_id uuid references public.project_archetypes(id);
-- Backfill the verbatim request from the never-edited outcome brief.
update public.projects set raw_request = outcome_brief where raw_request is null;

-- Widen the status vocabulary to the spec lifecycle while keeping legacy values
-- ('active','completed','cancelled') valid for existing rows.
alter table public.projects drop constraint if exists projects_status_check;
alter table public.projects add constraint projects_status_check
  check (status in ('intake','interrogating','scoped','matched','active','completed','closed','cancelled','abandoned'));

-- raw_request is training data: never edited once written.
create or replace function public.tg_lock_raw_request() returns trigger
  language plpgsql as $$
begin
  if old.raw_request is not null and new.raw_request is distinct from old.raw_request then
    raise exception 'projects.raw_request is immutable once set.' using errcode = 'check_violation';
  end if;
  return new;
end $$;
drop trigger if exists lock_raw_request on public.projects;
create trigger lock_raw_request before update on public.projects
  for each row execute function public.tg_lock_raw_request();

-- ── Interrogation (tables now; engine wired later) ──────────────────────────
create table if not exists public.interrogation_sessions (
  id                   uuid primary key default gen_random_uuid(),
  project_id           uuid not null references public.projects(id) on delete cascade,
  archetype_id         uuid references public.project_archetypes(id),
  started_at           timestamptz not null default now(),
  completed_at         timestamptz,
  final_confidence     numeric,
  abandoned            boolean not null default false,
  question_set_version text not null default 'none-naive-v0'
);
create index if not exists interrogation_sessions_project_idx on public.interrogation_sessions (project_id);

create table if not exists public.interrogation_answers (
  id                uuid primary key default gen_random_uuid(),
  session_id        uuid not null references public.interrogation_sessions(id) on delete cascade,
  question_key      text not null,
  question_text     text not null,
  answer_raw        text,
  answer_normalized jsonb,
  answered          boolean not null default false,
  asked_at          timestamptz not null default now(),
  answered_at       timestamptz,
  variance_weight   numeric
);
create index if not exists interrogation_answers_session_idx on public.interrogation_answers (session_id);

-- ── Immutable scope documents ───────────────────────────────────────────────
create table if not exists public.scope_documents (
  id                  uuid primary key default gen_random_uuid(),
  project_id          uuid not null references public.projects(id) on delete cascade,
  session_id          uuid references public.interrogation_sessions(id),
  version             int not null default 1,
  supersedes_id       uuid references public.scope_documents(id),
  confidence          numeric,
  total_estimate_low  numeric,
  total_estimate_high numeric,
  currency            text not null default 'USD',
  frozen              boolean not null default true,
  created_at          timestamptz not null default now()
);
create index if not exists scope_documents_project_idx on public.scope_documents (project_id, version);
drop trigger if exists block_update on public.scope_documents;
create trigger block_update before update on public.scope_documents
  for each row execute function public.tg_block_update();

-- Structural milestones (immutable per scope version).
create table if not exists public.milestones (
  id                uuid primary key default gen_random_uuid(),
  scope_document_id uuid not null references public.scope_documents(id) on delete cascade,
  sequence          int not null,
  milestone_type    text not null references public.milestone_types(type),
  title             text not null,
  description       text,
  depends_on        uuid[]
);
create index if not exists milestones_scope_idx on public.milestones (scope_document_id, sequence);

-- The immutable estimate: one row per milestone per scope version. NEVER UPDATE.
create table if not exists public.milestone_estimates (
  id                uuid primary key default gen_random_uuid(),
  milestone_id      uuid not null references public.milestones(id) on delete cascade,
  cost_low          numeric,
  cost_high         numeric,
  duration_days_low numeric,
  duration_days_high numeric,
  confidence        numeric,
  basis             text not null default 'heuristic' check (basis in ('prior','heuristic','manual')),
  prior_sample_size int not null default 0,
  created_at        timestamptz not null default now()
);
create index if not exists milestone_estimates_milestone_idx on public.milestone_estimates (milestone_id);
drop trigger if exists block_update on public.milestone_estimates;
create trigger block_update before update on public.milestone_estimates
  for each row execute function public.tg_block_update();

-- Actuals captured at close (step 4). Mutable during execution, then settled.
create table if not exists public.milestone_actuals (
  id                   uuid primary key default gen_random_uuid(),
  milestone_id         uuid not null references public.milestones(id) on delete cascade,
  -- cascade (not set null): milestone_actuals is reachable from a project delete
  -- via both milestone_id and task_id; a SET NULL update here races the milestone
  -- cascade and breaks project/user deletion once an actuals row exists.
  task_id              uuid references public.tasks(id) on delete cascade,
  cost_actual          numeric,
  duration_days_actual numeric,
  started_at           timestamptz,
  completed_at         timestamptz,
  outcome              text check (outcome in ('delivered','delivered_late','abandoned','disputed')),
  rework_cycles        int not null default 0,
  updated_at           timestamptz not null default now()
);
create unique index if not exists milestone_actuals_milestone_uq on public.milestone_actuals (milestone_id);

-- Change orders: scope changes create NEW records, never edit estimates.
create table if not exists public.change_orders (
  id                  uuid primary key default gen_random_uuid(),
  project_id          uuid not null references public.projects(id) on delete cascade,
  milestone_id        uuid references public.milestones(id) on delete set null,
  raised_by           text check (raised_by in ('client','freelancer','system')),
  reason_category     text references public.change_order_reasons(reason),
  cost_delta          numeric,
  duration_delta_days numeric,
  linked_risk_flag_id uuid,
  approved            boolean,
  created_at          timestamptz not null default now()
);
create index if not exists change_orders_project_idx on public.change_orders (project_id);

-- Explicit unknowns surfaced during scoping. A product feature, not an error log.
create table if not exists public.risk_flags (
  id                  uuid primary key default gen_random_uuid(),
  scope_document_id   uuid not null references public.scope_documents(id) on delete cascade,
  milestone_id        uuid references public.milestones(id) on delete set null,
  source_question_key text,
  description         text not null,
  likelihood          numeric,
  cost_impact_low     numeric,
  cost_impact_high    numeric,
  materialized        boolean,          -- null until project close
  created_at          timestamptz not null default now()
);
create index if not exists risk_flags_scope_idx on public.risk_flags (scope_document_id);
alter table public.change_orders
  add constraint change_orders_risk_fk foreign key (linked_risk_flag_id)
  references public.risk_flags(id) on delete set null;

-- Per-freelancer performance sliced by archetype AND milestone type.
create table if not exists public.freelancer_milestone_performance (
  id                       uuid primary key default gen_random_uuid(),
  freelancer_id            uuid not null references auth.users(id) on delete cascade,
  archetype_id             uuid references public.project_archetypes(id),
  milestone_type           text references public.milestone_types(type),
  n_completed              int not null default 0,
  cost_variance_median     numeric,
  duration_variance_median numeric,
  rework_rate              numeric,
  on_scope_rate            numeric,
  updated_at               timestamptz not null default now()
);
create unique index if not exists fmp_slice_uq
  on public.freelancer_milestone_performance (freelancer_id, archetype_id, milestone_type);

-- Append-only event log. Never updated, never deleted.
create table if not exists public.events (
  id          bigserial primary key,
  project_id  uuid references public.projects(id) on delete cascade,
  event_type  text not null,
  payload     jsonb,
  actor       text,
  occurred_at timestamptz not null default now()
);
create index if not exists events_project_idx on public.events (project_id, occurred_at);
-- History is never rewritten (block UPDATE). DELETE stays allowed at the DB level
-- so cascade cleanup (project or auth.users deletion) still works; the app cannot
-- delete because `authenticated` is granted INSERT only, never DELETE.
drop trigger if exists block_update on public.events;
create trigger block_update before update on public.events
  for each row execute function public.tg_block_update();

-- Link execution back to the estimated milestone.
alter table public.tasks add column if not exists milestone_id uuid references public.milestones(id) on delete set null;
create index if not exists tasks_milestone_id_idx on public.tasks (milestone_id);

-- ============================================================================
-- Row-level security + grants
-- ----------------------------------------------------------------------------
-- Everything is RLS-on. Client-facing tables (the quote the client sees) allow
-- the project owner to SELECT/INSERT their own rows; no UPDATE path exists.
-- Internal tables (actuals, change orders, performance, interrogation) deny all
-- authenticated/anon access for now and are written by privileged jobs later.
-- Lookup tables are world-readable reference data.
-- ============================================================================

-- Lookup / reference: readable by all, writable only via migration.
do $$
declare t text;
begin
  foreach t in array array['milestone_types','change_order_reasons','project_archetypes']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists %I on public.%I', t||'_read', t);
    execute format('create policy %I on public.%I for select to anon, authenticated using (true)', t||'_read', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
    execute format('grant select on public.%I to anon, authenticated', t);
  end loop;
end $$;

-- Helper: does the current user own the project behind a scope document?
create or replace function public.owns_scope(scope uuid) returns boolean
  language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.scope_documents sd
    join public.projects p on p.id = sd.project_id
    where sd.id = scope and p.poster_id = auth.uid()
  );
$$;

-- scope_documents: owner reads + inserts own; no update/delete.
alter table public.scope_documents enable row level security;
revoke all on public.scope_documents from anon, authenticated;
grant select, insert on public.scope_documents to authenticated;
drop policy if exists scope_documents_select_own on public.scope_documents;
create policy scope_documents_select_own on public.scope_documents for select to authenticated
  using (exists (select 1 from public.projects p where p.id = project_id and p.poster_id = auth.uid()));
drop policy if exists scope_documents_insert_own on public.scope_documents;
create policy scope_documents_insert_own on public.scope_documents for insert to authenticated
  with check (exists (select 1 from public.projects p where p.id = project_id and p.poster_id = auth.uid()));

-- milestones: gated by owning the parent scope document.
alter table public.milestones enable row level security;
revoke all on public.milestones from anon, authenticated;
grant select, insert on public.milestones to authenticated;
drop policy if exists milestones_select_own on public.milestones;
create policy milestones_select_own on public.milestones for select to authenticated
  using (public.owns_scope(scope_document_id));
drop policy if exists milestones_insert_own on public.milestones;
create policy milestones_insert_own on public.milestones for insert to authenticated
  with check (public.owns_scope(scope_document_id));

-- milestone_estimates: gated up the chain; insert-only, immutable.
alter table public.milestone_estimates enable row level security;
revoke all on public.milestone_estimates from anon, authenticated;
grant select, insert on public.milestone_estimates to authenticated;
drop policy if exists milestone_estimates_select_own on public.milestone_estimates;
create policy milestone_estimates_select_own on public.milestone_estimates for select to authenticated
  using (exists (select 1 from public.milestones m where m.id = milestone_id and public.owns_scope(m.scope_document_id)));
drop policy if exists milestone_estimates_insert_own on public.milestone_estimates;
create policy milestone_estimates_insert_own on public.milestone_estimates for insert to authenticated
  with check (exists (select 1 from public.milestones m where m.id = milestone_id and public.owns_scope(m.scope_document_id)));

-- risk_flags: owner reads + inserts own; materialization is server-side later.
alter table public.risk_flags enable row level security;
revoke all on public.risk_flags from anon, authenticated;
grant select, insert on public.risk_flags to authenticated;
drop policy if exists risk_flags_select_own on public.risk_flags;
create policy risk_flags_select_own on public.risk_flags for select to authenticated
  using (public.owns_scope(scope_document_id));
drop policy if exists risk_flags_insert_own on public.risk_flags;
create policy risk_flags_insert_own on public.risk_flags for insert to authenticated
  with check (public.owns_scope(scope_document_id));

-- events: owner may append for their own project; nobody reads via the API.
alter table public.events enable row level security;
revoke all on public.events from anon, authenticated;
grant insert on public.events to authenticated;
grant usage, select on sequence public.events_id_seq to authenticated;
drop policy if exists events_insert_own on public.events;
create policy events_insert_own on public.events for insert to authenticated
  with check (project_id is null or exists (select 1 from public.projects p where p.id = project_id and p.poster_id = auth.uid()));

-- Internal tables: RLS on, no policy => denied to anon/authenticated entirely.
-- Written by privileged/admin jobs in later build-order steps.
do $$
declare t text;
begin
  foreach t in array array[
    'interrogation_sessions','interrogation_answers','milestone_actuals',
    'change_orders','freelancer_milestone_performance'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
  end loop;
end $$;
