-- ─── 0002 — auth, profiles, ownership, realtime ────────────────────────────
-- Run this in Supabase Dashboard → SQL Editor after migration 0001.

-- ── Profiles (one row per auth.users row) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  mode         TEXT CHECK (mode IN ('client','pilot')),   -- NULL until onboarding
  display_name TEXT,
  bio          TEXT,
  avatar_url   TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_all"    ON profiles FOR ALL    USING (auth.uid() = id);

-- ── Tasks: add poster ownership ───────────────────────────────────────────────
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS poster_id UUID REFERENCES auth.users;

-- Drop old open policies, add auth-aware ones
DROP POLICY IF EXISTS "Anyone can read tasks"   ON tasks;
DROP POLICY IF EXISTS "Anyone can insert tasks" ON tasks;

CREATE POLICY "tasks_select"          ON tasks FOR SELECT  USING (true);
CREATE POLICY "tasks_insert_auth"     ON tasks FOR INSERT  TO authenticated
  WITH CHECK (poster_id = auth.uid() OR poster_id IS NULL);
CREATE POLICY "tasks_insert_anon"     ON tasks FOR INSERT  TO anon
  WITH CHECK (poster_id IS NULL);
CREATE POLICY "tasks_update_poster"   ON tasks FOR UPDATE  USING (auth.uid() = poster_id);

-- ── Mounts: add pilot ownership ───────────────────────────────────────────────
ALTER TABLE mounts ADD COLUMN IF NOT EXISTS pilot_user_id UUID REFERENCES auth.users;

DROP POLICY IF EXISTS "Anyone can read mounts"   ON mounts;
DROP POLICY IF EXISTS "Anyone can insert mounts" ON mounts;

CREATE POLICY "mounts_select" ON mounts FOR SELECT USING (
  auth.uid() = pilot_user_id
  OR EXISTS (
    SELECT 1 FROM tasks
    WHERE tasks.id = mounts.task_id AND tasks.poster_id = auth.uid()
  )
);
CREATE POLICY "mounts_insert_auth" ON mounts FOR INSERT TO authenticated
  WITH CHECK (pilot_user_id = auth.uid() OR pilot_user_id IS NULL);
CREATE POLICY "mounts_insert_anon" ON mounts FOR INSERT TO anon
  WITH CHECK (pilot_user_id IS NULL);

-- ── Realtime ─────────────────────────────────────────────────────────────────
-- Enable realtime via Supabase Dashboard → Database → Replication
-- or uncomment the lines below (only if supabase_realtime publication exists):
-- ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
-- ALTER PUBLICATION supabase_realtime ADD TABLE mounts;
