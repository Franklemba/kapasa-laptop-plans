-- ============================================================
-- PHASE 2-B: Add recorded_by to payments table
-- ------------------------------------------------------------
-- Currently there is no way to know which admin recorded a
-- payment or who deleted one. This adds an audit column.
--
-- Note: added as nullable first so existing rows are not
-- rejected. After the application code is updated to always
-- pass auth.uid() when recording, we can tighten to NOT NULL.
-- ============================================================

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS recorded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.payments.recorded_by IS
  'auth.users.id of the admin who recorded this payment. Should always be set.';

-- Index to quickly find all payments recorded by a specific admin
CREATE INDEX IF NOT EXISTS idx_payments_recorded_by
  ON public.payments(recorded_by);
