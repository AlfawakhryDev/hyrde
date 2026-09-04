-- Roster of vetted specialists for the scoping flow's "who should join a call"
-- step (/api/suggest-specialists). SECURITY DEFINER so it can read vetting
-- assessments, but it exposes only the fields get_match_pool already returns,
-- to authenticated users, and never the raw interview transcript.
--
-- Unlike get_match_pool this is NOT scoped to a task category: the caller (the
-- AI) judges fit across the whole roster and is required to return an empty
-- list when nobody genuinely fits. Category pre-filtering was hiding good
-- cross-category matches while the 'Other' escape hatch let through bad ones.
create or replace function public.get_suggestion_pool()
returns jsonb
language plpgsql
stable
security definer
set search_path to 'public'
as $function$
declare v_result jsonb;
begin
  if auth.uid() is null then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  select coalesce(jsonb_agg(row_to_json(c) order by c.score desc), '[]'::jsonb)
  into v_result
  from (
    select distinct on (v.user_id)
      v.user_id as id,
      coalesce(p.display_name, 'Freelancer') as name,
      coalesce(p.bio, '')      as bio,
      coalesce(p.headline, '') as headline,
      coalesce(p.country, '')  as country,
      v.score, v.band, v.category,
      coalesce(v.assessment->'verifiedSkills', '[]'::jsonb) as "verifiedSkills",
      coalesce(v.assessment->>'summary', '')                as summary
    from public.vettings v
    join public.profiles p on p.id = v.user_id
    where v.status = 'passed'
      and v.user_id <> auth.uid()
    order by v.user_id, v.score desc
  ) c;
  return v_result;
end;
$function$;

revoke execute on function public.get_suggestion_pool() from anon;
grant execute on function public.get_suggestion_pool() to authenticated;
