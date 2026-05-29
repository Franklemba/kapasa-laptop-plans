-- ============================================================
-- PHASE 2-E: Add payment_plan_id FK to stock_movements
-- ------------------------------------------------------------
-- Links a "sold" stock movement directly back to the payment
-- plan that triggered it. Enables full traceability:
--   stock_movement → payment_plan → client + laptop
-- ============================================================

ALTER TABLE public.stock_movements
  ADD COLUMN IF NOT EXISTS payment_plan_id uuid
    REFERENCES public.payment_plans(id)
    ON DELETE SET NULL;

COMMENT ON COLUMN public.stock_movements.payment_plan_id IS
  'The payment plan that caused this movement (for sold/stock_out types). NULL for manual adjustments.';

CREATE INDEX IF NOT EXISTS idx_stock_movements_payment_plan_id
  ON public.stock_movements(payment_plan_id)
  WHERE payment_plan_id IS NOT NULL;
