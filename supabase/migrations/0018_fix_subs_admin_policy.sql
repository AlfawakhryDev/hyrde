-- ============================================================================
-- 0018 Fix subscriptions admin policies reading profiles.is_admin as invoker
-- ----------------------------------------------------------------------------
-- Regression from the PII lockdown (0013/0014): SELECT on profiles.is_admin was
-- revoked from `authenticated`. The subscriptions admin policies still checked
-- admin with an inline subquery `EXISTS (SELECT 1 FROM profiles WHERE id =
-- auth.uid() AND is_admin)`, evaluated as the invoking user. That subquery reads
-- is_admin, so EVERY authenticated read / insert-with-returning on subscriptions
-- threw "permission denied for table profiles" -- breaking the billing upgrade
-- and the dashboard's subscription fetch (surfaced right after onboarding).
--
-- Fix: check admin via the SECURITY DEFINER am_i_admin(), which reads is_admin as
-- the function owner, not the caller. No column grant to the caller is needed.
-- (am_i_admin was added in migration 0013.)
-- ============================================================================
alter policy subs_admin_select on public.subscriptions using (public.am_i_admin());
alter policy subs_admin_update on public.subscriptions using (public.am_i_admin());
