-- ============================================================
-- PHASE 3-A: Fix orphaned admin account (goat@gmail.com)
-- ------------------------------------------------------------
-- goat@gmail.com has user_id = NULL. This account:
--   - Cannot log in through the app (all RLS uses auth.uid() = user_id)
--   - Was created without going through the registration flow
--   - Has no payment plans linked to it (safe to delete)
--
-- We delete it. If this account needs to exist, the correct
-- process is: register through the app at /register first
-- (which creates the auth.users entry), then elevate role
-- to admin via SQL: UPDATE clients SET role='admin' WHERE email=...
-- ============================================================

-- Safety: confirm the row has no payment plans before deleting
DO $$
DECLARE
  v_plan_count integer;
  v_client_id  uuid;
BEGIN
  SELECT id INTO v_client_id
  FROM public.clients
  WHERE email = 'goat@gmail.com' AND user_id IS NULL;

  IF v_client_id IS NULL THEN
    RAISE NOTICE 'goat@gmail.com orphan not found — already cleaned up or email changed.';
    RETURN;
  END IF;

  SELECT COUNT(*) INTO v_plan_count
  FROM public.payment_plans
  WHERE client_id = v_client_id;

  IF v_plan_count > 0 THEN
    RAISE EXCEPTION
      'Cannot delete goat@gmail.com — it has % payment plan(s) linked. Resolve manually.',
      v_plan_count;
  END IF;

  -- Safe to delete
  DELETE FROM public.clients
  WHERE id = v_client_id;

  RAISE NOTICE 'Deleted orphaned client: goat@gmail.com (id: %)', v_client_id;
END $$;

-- Confirm no more NULL user_id rows remain
DO $$
DECLARE
  v_null_count integer;
BEGIN
  SELECT COUNT(*) INTO v_null_count
  FROM public.clients
  WHERE user_id IS NULL;

  IF v_null_count > 0 THEN
    RAISE WARNING '% client row(s) still have user_id = NULL after cleanup. Review before enforcing NOT NULL.', v_null_count;
  ELSE
    RAISE NOTICE 'All client rows now have user_id set. Safe to enforce NOT NULL.';
  END IF;
END $$;
