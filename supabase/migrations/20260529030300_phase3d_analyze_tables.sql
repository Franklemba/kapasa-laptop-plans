-- ============================================================
-- PHASE 3-D: Run ANALYZE to fix stale pg_stat_user_tables
-- ------------------------------------------------------------
-- pg_stat_user_tables showed 0 rows for all tables even though
-- data exists. ANALYZE refreshes the query planner statistics.
-- ============================================================

ANALYZE public.clients;
ANALYZE public.laptops;
ANALYZE public.laptop_images;
ANALYZE public.payment_plans;
ANALYZE public.payments;
ANALYZE public.stock_movements;
ANALYZE public.payment_schedule;
ANALYZE public.notifications;
ANALYZE public.notification_preferences;
ANALYZE public.audit_log;

-- Quick verification — should now show real row counts
SELECT
  relname        AS table_name,
  n_live_tup     AS row_count,
  last_analyze   AS analyzed_at
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY relname;
