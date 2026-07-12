-- ═══ 0005 — P2P payment settlement layer ═══
-- Applied to production via Supabase MCP on 2026-07-06.
-- The platform coordinates payments; money moves on accessible rails
-- (Airtm, InstaPay, Vodafone Cash, USDT, PayPal, bank transfer).

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS payout_method TEXT
  CHECK (payout_method IN ('airtm','instapay','vodafone_cash','usdt','paypal','bank'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS payout_handle TEXT;

CREATE TABLE IF NOT EXISTS payments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  task_id      UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  payer_id     UUID NOT NULL REFERENCES auth.users(id),
  payee_id     UUID NOT NULL REFERENCES auth.users(id),
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  currency     TEXT NOT NULL DEFAULT 'USD',
  method       TEXT,
  reference    TEXT NOT NULL UNIQUE,
  proof_note   TEXT,
  status       TEXT NOT NULL DEFAULT 'awaiting_payment'
    CHECK (status IN ('awaiting_payment','payment_sent','confirmed','cancelled','disputed'))
);

CREATE INDEX IF NOT EXISTS payments_task_idx  ON payments (task_id);
CREATE INDEX IF NOT EXISTS payments_payee_idx ON payments (payee_id, status);
CREATE INDEX IF NOT EXISTS payments_payer_idx ON payments (payer_id, status);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payments_select_parties" ON payments FOR SELECT TO authenticated
  USING (auth.uid() = payer_id OR auth.uid() = payee_id);
CREATE POLICY "payments_insert_payer" ON payments FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = payer_id
    AND EXISTS (SELECT 1 FROM tasks t WHERE t.id = task_id AND t.poster_id = auth.uid())
  );
CREATE POLICY "payments_update_parties" ON payments FOR UPDATE TO authenticated
  USING (auth.uid() = payer_id OR auth.uid() = payee_id);

ALTER PUBLICATION supabase_realtime ADD TABLE payments;
