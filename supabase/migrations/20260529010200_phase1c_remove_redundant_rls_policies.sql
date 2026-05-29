-- ============================================================
-- PHASE 1-C: Remove redundant overlapping RLS policies
-- ------------------------------------------------------------
-- When a FOR ALL policy exists for a role, separate FOR SELECT
-- or FOR INSERT policies for the same role are redundant —
-- they add noise, can confuse debugging, and in some edge
-- cases cause unexpected double-evaluation.
--
-- payment_plans:
--   "Admins can manage all payment plans"  (ALL)  ← keep
--   "Admins can view all payment plans"    (SELECT) ← DROP (covered by ALL)
--
-- stock_movements:
--   "Admins can manage stock movements"    (ALL)  ← keep
--   "Admins can view stock movements"      (SELECT) ← DROP (covered by ALL)
--   "Admins can create stock movements"    (INSERT) ← DROP (covered by ALL)
-- ============================================================

-- payment_plans — drop the redundant SELECT policy
DROP POLICY IF EXISTS "Admins can view all payment plans" ON public.payment_plans;

-- stock_movements — drop the two redundant sub-policies
DROP POLICY IF EXISTS "Admins can view stock movements"   ON public.stock_movements;
DROP POLICY IF EXISTS "Admins can create stock movements" ON public.stock_movements;

-- Verify the ALL policies that we're keeping are still present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'payment_plans'
      AND policyname = 'Admins can manage all payment plans'
  ) THEN
    RAISE EXCEPTION 'Safety check: payment_plans ALL admin policy missing';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'stock_movements'
      AND policyname = 'Admins can manage stock movements'
  ) THEN
    RAISE EXCEPTION 'Safety check: stock_movements ALL admin policy missing';
  END IF;
END $$;
