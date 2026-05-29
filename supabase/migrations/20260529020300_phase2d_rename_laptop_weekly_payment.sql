-- ============================================================
-- PHASE 2-D: Rename laptops.weekly_payment → default_weekly_payment
--            Fix created_by / updated_by via trigger
-- ------------------------------------------------------------
-- laptops.weekly_payment is the CATALOG DEFAULT shown in the
-- browse page and pre-filled into the apply form. The ACTUAL
-- agreed weekly payment is locked into payment_plans.weekly_payment
-- at application time.
--
-- Renaming makes this distinction explicit and prevents
-- confusion between the two.
--
-- Also: created_by and updated_by exist as FK columns on
-- laptops but the application never writes them. Add a trigger
-- to auto-populate them from auth.uid().
-- ============================================================

-- ── Rename the column ─────────────────────────────────────────
ALTER TABLE public.laptops
  RENAME COLUMN weekly_payment TO default_weekly_payment;

COMMENT ON COLUMN public.laptops.default_weekly_payment IS
  'Suggested default weekly payment shown in catalog. The actual plan amount is in payment_plans.weekly_payment.';

-- ── Auto-populate created_by / updated_by ────────────────────
CREATE OR REPLACE FUNCTION public.set_laptop_audit_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.created_by := auth.uid();
    NEW.updated_by := auth.uid();
  ELSIF TG_OP = 'UPDATE' THEN
    NEW.updated_by := auth.uid();
    NEW.updated_at := now();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_laptop_audit_fields_trigger ON public.laptops;

CREATE TRIGGER set_laptop_audit_fields_trigger
  BEFORE INSERT OR UPDATE ON public.laptops
  FOR EACH ROW
  EXECUTE FUNCTION public.set_laptop_audit_fields();

COMMENT ON FUNCTION public.set_laptop_audit_fields() IS
  'Auto-sets created_by, updated_by, updated_at on laptops from auth.uid().';
