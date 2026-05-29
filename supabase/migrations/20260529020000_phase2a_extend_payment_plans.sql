-- ============================================================
-- PHASE 2-A: Extend payment_plans table
-- ------------------------------------------------------------
-- Add columns missing from the ideal schema:
--   down_payment   — currently hacked into amount_paid at creation
--   end_date       — currently inferred from updated_at
--   approved_by    — which admin approved this plan
--   approved_at    — when it was approved
--   rejected_by    — which admin rejected this plan
--   rejected_at    — when it was rejected
-- ============================================================

-- Down payment as its own explicit field
ALTER TABLE public.payment_plans
  ADD COLUMN IF NOT EXISTS down_payment numeric NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.payment_plans.down_payment IS
  'Initial lump-sum payment made at plan creation. Separate from weekly instalments.';

-- Date the plan was completed/ended
ALTER TABLE public.payment_plans
  ADD COLUMN IF NOT EXISTS end_date date;

COMMENT ON COLUMN public.payment_plans.end_date IS
  'Date the plan was fully paid off or cancelled. NULL while still active.';

-- Admin who approved the plan
ALTER TABLE public.payment_plans
  ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.payment_plans
  ADD COLUMN IF NOT EXISTS approved_at timestamp with time zone;

COMMENT ON COLUMN public.payment_plans.approved_by IS
  'auth.users.id of the admin who approved this plan.';
COMMENT ON COLUMN public.payment_plans.approved_at IS
  'Timestamp when the plan was approved and moved to active status.';

-- Admin who rejected the plan
ALTER TABLE public.payment_plans
  ADD COLUMN IF NOT EXISTS rejected_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.payment_plans
  ADD COLUMN IF NOT EXISTS rejected_at timestamp with time zone;

COMMENT ON COLUMN public.payment_plans.rejected_by IS
  'auth.users.id of the admin who rejected this plan.';
COMMENT ON COLUMN public.payment_plans.rejected_at IS
  'Timestamp when the plan was rejected/cancelled.';

-- ── Backfill down_payment for existing plans ──────────────────
-- The original code set amount_paid = down_payment at creation
-- for plans with a down payment. For pending plans this is 0,
-- for active plans with a down payment the amount_paid already
-- includes it. We set down_payment = 0 for all existing rows
-- (safe default — we can't know retroactively what was a down
-- payment vs a first weekly payment).
UPDATE public.payment_plans
SET down_payment = 0
WHERE down_payment IS NULL;
