-- Part B: revoke the world-readable grants that leaked PII. Applied to prod
-- AFTER the code using the 0013 accessors is deployed. Confirmed via anon pen
-- test before/after (payout handles + interview transcripts were dumpable with
-- only the public anon key).
revoke select on public.profiles from anon, authenticated;
grant select (
  id, created_at, updated_at, mode, display_name, headline, company,
  website, country, city, bio, avatar_url
) on public.profiles to anon, authenticated;

revoke select on public.vettings from anon, authenticated;
grant select (
  id, user_id, category, status, mode, score, band, completed_at, created_at
) on public.vettings to anon, authenticated;
