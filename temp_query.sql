-- Check 6: Count schedule rows for active payment plans
SELECT COUNT(*) AS schedule_rows
FROM public.payment_schedule ps
JOIN public.payment_plans pp ON ps.payment_plan_id = pp.id
WHERE pp.status = 'active';

-- Status breakdown
SELECT
  ps.status,
  COUNT(*) AS week_count
FROM public.payment_schedule ps
JOIN public.payment_plans pp ON ps.payment_plan_id = pp.id
WHERE pp.status = 'active'
GROUP BY ps.status
ORDER BY ps.status;
