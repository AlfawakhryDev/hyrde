-- 0036 — CVs, candidate reports, and the dossier they are built from
--
-- The interview already writes a rich per-attempt assessment, but it is
-- addressed TO the candidate and nobody could read it anywhere. Nothing
-- consolidated a person across attempts, and their CV never entered the system
-- at all: /api/parse-cv had been built and then never called.
--
-- CVs are PII: private bucket, owner-or-admin. The report is admin-only —
-- a hiring report about someone is not feedback for them.

create table if not exists public.candidate_cvs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  filename text not null,
  bytes int,
  parsed jsonb,
  uploaded_at timestamptz not null default now()
);
create index if not exists candidate_cvs_user_idx on public.candidate_cvs (user_id, uploaded_at desc);
alter table public.candidate_cvs enable row level security;

create policy cv_select_own_or_admin on public.candidate_cvs
  for select using (user_id = auth.uid() or public.am_i_admin());
create policy cv_insert_own on public.candidate_cvs
  for insert with check (user_id = auth.uid());
create policy cv_delete_own_or_admin on public.candidate_cvs
  for delete using (user_id = auth.uid() or public.am_i_admin());

create table if not exists public.candidate_reports (
  user_id uuid primary key references auth.users(id) on delete cascade,
  report jsonb not null,
  model text,
  sources jsonb,
  generated_at timestamptz not null default now(),
  generated_by uuid references auth.users(id)
);
alter table public.candidate_reports enable row level security;
create policy report_admin_all on public.candidate_reports
  for all using (public.am_i_admin()) with check (public.am_i_admin());

grant select, insert, delete on public.candidate_cvs to authenticated;
grant select, insert, update, delete on public.candidate_reports to authenticated;

insert into storage.buckets (id, name, public, file_size_limit)
values ('candidate-cvs', 'candidate-cvs', false, 5242880)
on conflict (id) do nothing;

-- Files live at <user_id>/<name>; the first path segment is the owner.
drop policy if exists cv_obj_rw on storage.objects;
create policy cv_obj_rw on storage.objects
  for all to authenticated
  using (bucket_id = 'candidate-cvs'
         and ((storage.foldername(name))[1] = auth.uid()::text or public.am_i_admin()))
  with check (bucket_id = 'candidate-cvs'
              and (storage.foldername(name))[1] = auth.uid()::text);

-- anon can never satisfy the owner policy (auth.uid() is null), so these
-- column grants were only ever surface area.
revoke all on public.profile_private from anon;

-- Everything known about one candidate, in one call, for the report generator.
-- SECURITY DEFINER so it can cross into auth.users and profile_private, with an
-- explicit admin check as the first statement.
create or replace function public.candidate_dossier(p_user uuid)
returns jsonb language plpgsql security definer stable set search_path = public as $$
declare v jsonb;
begin
  if not public.am_i_admin() then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  select jsonb_build_object(
    'profile', (
      select jsonb_build_object(
        'display_name', p.display_name, 'headline', p.headline, 'bio', p.bio,
        'country', p.country, 'city', p.city, 'website', p.website,
        'mode', p.mode, 'joined', p.created_at,
        'email', u.email, 'email_verified', p.email_verified_at is not null,
        'phone', pv.phone)
      from public.profiles p join auth.users u on u.id = p.id
      left join public.profile_private pv on pv.user_id = p.id
      where p.id = p_user),
    -- Failed attempts are evidence, not noise.
    'vettings', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'category', v2.category, 'status', v2.status, 'score', v2.score,
        'band', v2.band, 'mode', v2.mode, 'created_at', v2.created_at,
        'completed_at', v2.completed_at, 'assessment', v2.assessment,
        'transcript', v2.transcript) order by v2.created_at desc), '[]'::jsonb)
      from public.vettings v2 where v2.user_id = p_user),
    'cv', (
      select jsonb_build_object('filename', c.filename, 'uploaded_at', c.uploaded_at, 'parsed', c.parsed)
      from public.candidate_cvs c where c.user_id = p_user order by c.uploaded_at desc limit 1),
    'delivery', (
      select jsonb_build_object(
        'claimed', count(*),
        'delivered', count(*) filter (where t.status = 'delivered' or t.payment_status <> 'unpaid'),
        'paid', count(*) filter (where t.payment_status = 'paid'),
        'on_time', count(*) filter (where t.deadline is not null and t.claimed_at is not null
                                      and t.status = 'delivered' and t.deadline >= t.claimed_at),
        'categories', coalesce(jsonb_agg(distinct t.category) filter (where t.category is not null), '[]'::jsonb))
      from public.tasks t where t.claimed_by_user_id = p_user)
  ) into v;
  return v;
end;
$$;
revoke execute on function public.candidate_dossier(uuid) from public, anon;
grant execute on function public.candidate_dossier(uuid) to authenticated;

create or replace function public.candidate_index()
returns table (user_id uuid, display_name text, email text, country text,
  best_score int, best_band text, attempts int, passed int,
  has_cv boolean, has_report boolean, report_at timestamptz, joined timestamptz)
language sql security definer stable set search_path = public as $$
  select p.id, p.display_name, u.email, p.country,
         (select max(v.score) from public.vettings v where v.user_id = p.id),
         (select v.band from public.vettings v where v.user_id = p.id and v.band is not null
            order by v.score desc nulls last limit 1),
         (select count(*)::int from public.vettings v where v.user_id = p.id),
         (select count(*)::int from public.vettings v where v.user_id = p.id and v.status = 'passed'),
         exists (select 1 from public.candidate_cvs c where c.user_id = p.id),
         exists (select 1 from public.candidate_reports r where r.user_id = p.id),
         (select r.generated_at from public.candidate_reports r where r.user_id = p.id),
         p.created_at
    from public.profiles p join auth.users u on u.id = p.id
   where p.mode = 'pilot' and public.am_i_admin()
   order by p.created_at desc;
$$;
revoke execute on function public.candidate_index() from public, anon;
grant execute on function public.candidate_index() to authenticated;
