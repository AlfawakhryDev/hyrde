-- ── Direct claim + payment fields on tasks ───────────────────────────────────
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS amount_cents             INTEGER      NOT NULL DEFAULT 0;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS claimed_by_user_id       UUID         REFERENCES auth.users(id);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS claimed_at               TIMESTAMPTZ;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS deliverable_text         TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS payment_status           TEXT         NOT NULL DEFAULT 'unpaid';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;

-- Allow pilots and owners to update task state (claim, deliver, approve, pay)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'tasks' AND policyname = 'task claim and work updates'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "task claim and work updates"
      ON tasks FOR UPDATE TO authenticated
      USING (
        poster_id = auth.uid()
        OR claimed_by_user_id = auth.uid()
        OR claimed_by_user_id IS NULL
      )
    $policy$;
  END IF;
END $$;

-- ── Meetings ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS meetings (
  id               UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id          UUID         REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  organizer_id     UUID         REFERENCES auth.users(id),
  attendee_id      UUID         REFERENCES auth.users(id),
  scheduled_at     TIMESTAMPTZ  NOT NULL,
  duration_minutes INTEGER      NOT NULL DEFAULT 30,
  note             TEXT,
  status           TEXT         NOT NULL DEFAULT 'scheduled',
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'meetings' AND policyname = 'Anyone can read meetings'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Anyone can read meetings"
      ON meetings FOR SELECT USING (true)
    $policy$;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'meetings' AND policyname = 'Authenticated users can create meetings'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Authenticated users can create meetings"
      ON meetings FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = organizer_id)
    $policy$;
  END IF;
END $$;

-- Add meetings to realtime
ALTER PUBLICATION supabase_realtime ADD TABLE meetings;
