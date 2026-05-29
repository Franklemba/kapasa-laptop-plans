-- ============================================================
-- PHASE 1-D: Fix stock_movements.laptop_id FK — CASCADE → SET NULL
-- ------------------------------------------------------------
-- Currently: deleting a laptop row wipes ALL its stock movement
-- history (CASCADE DELETE). For a financial audit trail this is
-- unacceptable — you lose evidence of every sale, adjustment,
-- and return for that product.
--
-- Fix: change to SET NULL so movements are preserved with
-- laptop_id = NULL when the source laptop is deleted.
-- The laptop name/info is already denormalised into the
-- reason/notes columns on each movement row, so history
-- remains interpretable even without the FK.
-- ============================================================

-- Step 1: Drop the existing CASCADE constraint
ALTER TABLE public.stock_movements
  DROP CONSTRAINT IF EXISTS stock_movements_laptop_id_fkey;

-- Step 2: Re-add with SET NULL
ALTER TABLE public.stock_movements
  ADD CONSTRAINT stock_movements_laptop_id_fkey
  FOREIGN KEY (laptop_id)
  REFERENCES public.laptops(id)
  ON DELETE SET NULL;

-- Step 3: Verify
DO $$
DECLARE
  v_rule text;
BEGIN
  SELECT rc.delete_rule
  INTO   v_rule
  FROM   information_schema.referential_constraints rc
  JOIN   information_schema.table_constraints tc
         ON rc.constraint_name = tc.constraint_name
  WHERE  tc.table_schema  = 'public'
    AND  tc.table_name    = 'stock_movements'
    AND  tc.constraint_name = 'stock_movements_laptop_id_fkey';

  IF v_rule IS DISTINCT FROM 'SET NULL' THEN
    RAISE EXCEPTION 'FK constraint delete rule is "%" — expected "SET NULL"', v_rule;
  END IF;
END $$;

COMMENT ON COLUMN public.stock_movements.laptop_id IS
  'References laptops.id. SET NULL on laptop delete to preserve audit history.';
