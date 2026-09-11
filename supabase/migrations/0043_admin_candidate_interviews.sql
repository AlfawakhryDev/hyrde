-- Let admins see the interviews, without letting everyone else see them.
--
-- /admin/candidates showed "N attempts, M passed" and a CV badge, and nothing
-- else: no interview has ever been viewable by an admin. The obvious fix — an
-- admin SELECT policy on vettings — does not work, and the way it fails invites
-- a worse fix. transcript and assessment are deliberately not column-granted to
-- `authenticated`, so the select fails outright; granting them would expose
-- every passed candidate's answers to every signed-in user through the
-- existing vettings_public_passed policy.
--
-- So: the same shape as candidate_index(). Definer, self-gated on am_i_admin()
-- inside the query, callable by authenticated. A non-admin gets zero rows.
create or replace function public.admin_candidate_interviews(p_user uuid)
returns table(
  id uuid, category text, status text, score integer, band text,
  mode text, locale text, created_at timestamptz, completed_at timestamptz,
  transcript jsonb, assessment jsonb
)
language sql stable security definer set search_path = public as $$
  select v.id, v.category, v.status, v.score, v.band, v.mode, v.locale,
         v.created_at, v.completed_at, v.transcript, v.assessment
    from public.vettings v
   where v.user_id = p_user and public.am_i_admin()
   order by v.created_at desc;
$$;
revoke execute on function public.admin_candidate_interviews(uuid) from public, anon;
grant execute on function public.admin_candidate_interviews(uuid) to authenticated;

-- Recordings: the CV bucket already lets admins read (cv_obj_rw); the
-- recordings bucket never did. Read only — admins have no reason to write
-- into a candidate's evidence folder.
create policy "Admin can view recordings" on storage.objects
  for select to authenticated
  using (bucket_id = 'interview-recordings' and public.am_i_admin());
