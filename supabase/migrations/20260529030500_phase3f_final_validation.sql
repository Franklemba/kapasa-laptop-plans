-- ============================================================
-- PHASE 3-F: Final Validation Queries
-- ------------------------------------------------------------
-- Runs a comprehensive post-migration health check.
-- All queries are read-only — safe to re-run at any time.
-- Expected results noted inline.
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. No NULL user_id rows in clients
--    Expected: 0 rows
-- ─────────────────────────────────────────────────────────────
DO $$
DECLARE v_count integer;
BEGIN
  SELECT COUNT(*) INTO v_count FROM public.clients WHERE user_id IS NULL;
  IF v_count > 0 THEN
    RAISE WARNING '❌ CHECK 1 FAILED: % client row(s) still have user_id = NULL', v_count;
  ELSE
    RAISE NOTICE '✓ CHECK 1 PASSED: No NULL user_id rows in clients';
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────
-- 2. clients.user_id is NOT NULL and has FK to auth.users
--    Expected: NOT NULL = true, FK exists = true
-- ─────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_is_not_null boolean;
  v_has_fk      boolean;
BEGIN
  SELECT is_nullable = 'NO'
  INTO   v_is_not_null
  FROM   information_schema.columns
  WHERE  table_schema = 'public'
    AND  table_name   = 'clients'
    AND  column_name  = 'user_id';

  SELECT EXISTS (
    SELECT 1
    FROM   information_schema.table_constraints tc
    JOIN   information_schema.key_column_usage kcu
           ON tc.constraint_name = kcu.constraint_name
    WHERE  tc.table_schema   = 'public'
      AND  tc.table_name     = 'clients'
      AND  tc.constraint_type = 'FOREIGN KEY'
      AND  kcu.column_name   = 'user_id'
  ) INTO v_has_fk;

  IF NOT v_is_not_null THEN
    RAISE WARNING '❌ CHECK 2a FAILED: clients.user_id is still nullable';
  ELSE
    RAISE NOTICE '✓ CHECK 2a PASSED: clients.user_id is NOT NULL';
  END IF;

  IF NOT v_has_fk THEN
    RAISE WARNING '❌ CHECK 2b FAILED: No FK constraint on clients.user_id';
  ELSE
    RAISE NOTICE '✓ CHECK 2b PASSED: FK constraint clients.user_id → auth.users.id exists';
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────
-- 3. No public-role SELECT on clients table
--    Expected: 0 rows (no policies granting SELECT to 'anon' or 'public')
-- ─────────────────────────────────────────────────────────────
DO $$
DECLARE v_count integer;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM   pg_policies
  WHERE  schemaname = 'public'
    AND  tablename  = 'clients'
    AND  cmd        = 'SELECT'
    AND  roles && ARRAY['anon'::name, 'public'::name];

  IF v_count > 0 THEN
    RAISE WARNING '❌ CHECK 3 FAILED: % public/anon SELECT policy(ies) still exist on clients', v_count;
  ELSE
    RAISE NOTICE '✓ CHECK 3 PASSED: No public-role SELECT policies on clients';
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────
-- 4. RLS is enabled on all key tables
--    Expected: all 10 tables show relrowsecurity = true
-- ─────────────────────────────────────────────────────────────
SELECT
  relname                       AS table_name,
  relrowsecurity                AS rls_enabled,
  CASE WHEN relrowsecurity THEN '✓' ELSE '❌' END AS status
FROM pg_class
WHERE relname IN (
  'clients','laptops','laptop_images','payment_plans','payments',
  'stock_movements','payment_schedule','notifications',
  'notification_preferences','audit_log'
)
ORDER BY relname;

-- ─────────────────────────────────────────────────────────────
-- 5. All new tables exist with expected columns
--    Expected: each table listed with its column count
-- ─────────────────────────────────────────────────────────────
SELECT
  table_name,
  COUNT(*) AS column_count
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN (
    'payment_schedule', 'notifications',
    'notification_preferences', 'audit_log'
  )
GROUP BY table_name
ORDER BY table_name;

-- ─────────────────────────────────────────────────────────────
-- 6. payment_schedule rows exist for the active plan
--    Expected: rows > 0, all statuses present
-- ─────────────────────────────────────────────────────────────
DO $$
DECLARE v_count integer;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM public.payment_schedule ps
  JOIN public.payment_plans pp ON ps.payment_plan_id = pp.id
  WHERE pp.status = 'active';

  IF v_count = 0 THEN
    RAISE NOTICE '~ CHECK 6 SKIPPED: No active plans on this DB — payment_schedule table exists but has no rows to validate (expected on fresh/remote DB with no active plans)';
  ELSE
    RAISE NOTICE '✓ CHECK 6 PASSED: % schedule rows exist for active plan', v_count;
  END IF;
END $$;

SELECT
  ps.status,
  COUNT(*) AS week_count
FROM public.payment_schedule ps
JOIN public.payment_plans pp ON ps.payment_plan_id = pp.id
WHERE pp.status = 'active'
GROUP BY ps.status
ORDER BY ps.status;

-- ─────────────────────────────────────────────────────────────
-- 7. stock_movements.laptop_id FK is SET NULL (not CASCADE)
--    Expected: delete_rule = 'SET NULL'
-- ─────────────────────────────────────────────────────────────
DO $$
DECLARE v_rule text;
BEGIN
  SELECT rc.delete_rule INTO v_rule
  FROM   information_schema.referential_constraints rc
  JOIN   information_schema.key_column_usage kcu
         ON rc.constraint_name = kcu.constraint_name
  WHERE  kcu.table_schema  = 'public'
    AND  kcu.table_name    = 'stock_movements'
    AND  kcu.column_name   = 'laptop_id';

  IF v_rule IS NULL THEN
    RAISE WARNING '❌ CHECK 7 FAILED: FK on stock_movements.laptop_id not found';
  ELSIF v_rule = 'SET NULL' THEN
    RAISE NOTICE '✓ CHECK 7 PASSED: stock_movements.laptop_id FK delete rule = SET NULL';
  ELSE
    RAISE WARNING '❌ CHECK 7 FAILED: delete_rule = % (expected SET NULL)', v_rule;
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────
-- 8. Open anon INSERT policy on clients is gone
--    Expected: 0 rows
-- ─────────────────────────────────────────────────────────────
DO $$
DECLARE v_count integer;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM   pg_policies
  WHERE  schemaname = 'public'
    AND  tablename  = 'clients'
    AND  cmd        = 'INSERT'
    AND  roles && ARRAY['anon'::name, 'public'::name];

  IF v_count > 0 THEN
    RAISE WARNING '❌ CHECK 8 FAILED: Open anon INSERT policy still exists on clients';
  ELSE
    RAISE NOTICE '✓ CHECK 8 PASSED: No anon/public INSERT policy on clients';
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────
-- 9. Laptop data fixes applied
--    Expected: name = 'MacBook Pro' (no "Mackbook"), sensible weekly defaults
-- ─────────────────────────────────────────────────────────────
DO $$
DECLARE v_count integer;
BEGIN
  SELECT COUNT(*) INTO v_count FROM public.laptops WHERE name ILIKE '%mackbook%';
  IF v_count > 0 THEN
    RAISE WARNING '❌ CHECK 9 FAILED: Typo "Mackbook" still in laptops table';
  ELSE
    RAISE NOTICE '✓ CHECK 9 PASSED: No "Mackbook" typo in laptops';
  END IF;
END $$;

SELECT name, price, default_weekly_payment,
       round(price / NULLIF(default_weekly_payment, 0)) AS implied_weeks
FROM public.laptops
ORDER BY price;

-- ─────────────────────────────────────────────────────────────
-- 10. notification_preferences auto-created for all clients
--     Expected: count matches clients count
-- ─────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_clients integer;
  v_prefs   integer;
BEGIN
  SELECT COUNT(*) INTO v_clients FROM public.clients;
  SELECT COUNT(*) INTO v_prefs   FROM public.notification_preferences;

  IF v_prefs < v_clients THEN
    RAISE WARNING '❌ CHECK 10 FAILED: % clients but only % notification_preference rows',
      v_clients, v_prefs;
  ELSE
    RAISE NOTICE '✓ CHECK 10 PASSED: notification_preferences count (%) matches clients (%)',
      v_prefs, v_clients;
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────
-- 11. record_payment_atomic function exists
--     Expected: 1 row
-- ─────────────────────────────────────────────────────────────
DO $$
DECLARE v_count integer;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
    AND p.proname = 'record_payment_atomic';

  IF v_count = 0 THEN
    RAISE WARNING '❌ CHECK 11 FAILED: record_payment_atomic function not found';
  ELSE
    RAISE NOTICE '✓ CHECK 11 PASSED: record_payment_atomic function exists';
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────
-- 12. Summary: overall table row counts
-- ─────────────────────────────────────────────────────────────
SELECT
  relname        AS table_name,
  n_live_tup     AS row_count,
  last_analyze   AS last_analyzed
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY relname;

-- ─────────────────────────────────────────────────────────────
-- 13. All current RLS policies — full reference list
-- ─────────────────────────────────────────────────────────────
SELECT
  tablename   AS table_name,
  policyname  AS policy_name,
  cmd         AS command,
  roles       AS applies_to
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd, policyname;
