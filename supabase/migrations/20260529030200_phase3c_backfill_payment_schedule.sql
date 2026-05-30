-- ============================================================
-- PHASE 3-C: Backfill payment_schedule for existing active plan
-- ------------------------------------------------------------
-- The trigger only fires going forward (new approvals).
-- The 1 existing active plan (fitech@gmail.com / Lenovo,
-- 52 weeks, ZMK 46/week) needs its schedule rows generated
-- retroactively.
--
-- Plan details from live DB:
--   total_amount = 2392, weekly_payment = 46, plan_duration = 52
--   amount_paid  = 46 (1 payment made = week 1 paid)
--   start_date   = determined from the live plan row
--
-- Strategy:
--   1. Generate all 52 schedule rows (pending)
--   2. Mark week 1 as paid (since amount_paid = 46 = 1 × weekly)
--   3. Mark any past-due weeks as overdue
-- ============================================================

DO $$
DECLARE
  v_plan      record;
  v_payment   record;
  i           integer;
  v_due_date  date;
  v_weeks_paid integer;
BEGIN
  -- Fetch the active plan
  SELECT pp.*, c.email AS client_email
  INTO   v_plan
  FROM   public.payment_plans pp
  JOIN   public.clients c ON pp.client_id = c.id
  WHERE  pp.status = 'active'
  LIMIT  1;

  IF NOT FOUND THEN
    RAISE NOTICE 'No active plans found — nothing to backfill.';
    RETURN;
  END IF;

  RAISE NOTICE 'Backfilling schedule for plan % (client: %, % weeks, start: %)',
    v_plan.id, v_plan.client_email, v_plan.plan_duration, v_plan.start_date;

  -- Calculate how many weeks have been paid
  v_weeks_paid := floor(v_plan.amount_paid / v_plan.weekly_payment)::integer;
  RAISE NOTICE 'Amount paid: % | Weekly: % | Weeks paid: %',
    v_plan.amount_paid, v_plan.weekly_payment, v_weeks_paid;

  -- Generate all schedule rows
  FOR i IN 1..v_plan.plan_duration LOOP
    v_due_date := v_plan.start_date + ((i - 1) * INTERVAL '7 days');

    INSERT INTO public.payment_schedule (
      payment_plan_id, week_number, due_date, amount_due, status
    )
    VALUES (
      v_plan.id,
      i,
      v_due_date,
      v_plan.weekly_payment,
      CASE
        WHEN i <= v_weeks_paid        THEN 'paid'
        WHEN v_due_date < CURRENT_DATE THEN 'overdue'
        ELSE 'pending'
      END
    )
    ON CONFLICT (payment_plan_id, week_number) DO NOTHING;
  END LOOP;

  -- Link the first paid week to the actual payment record (if one exists)
  SELECT id INTO v_payment
  FROM   public.payments
  WHERE  payment_plan_id = v_plan.id
  ORDER  BY payment_date
  LIMIT  1;

  IF FOUND THEN
    UPDATE public.payment_schedule
    SET    payment_id = v_payment.id,
           paid_at    = now()
    WHERE  payment_plan_id = v_plan.id
      AND  week_number      = 1
      AND  status           = 'paid';

    RAISE NOTICE 'Linked week 1 to payment id: %', v_payment.id;
  END IF;

  -- Set end_date on the plan if not already set
  UPDATE public.payment_plans
  SET    end_date = start_date + (plan_duration * INTERVAL '7 days')
  WHERE  id = v_plan.id
    AND  end_date IS NULL;

  RAISE NOTICE 'Backfill complete — % rows inserted.', v_plan.plan_duration;
END $$;

-- Summary check
SELECT
  ps.week_number,
  ps.due_date,
  ps.amount_due,
  ps.status,
  ps.payment_id IS NOT NULL AS is_linked
FROM public.payment_schedule ps
JOIN public.payment_plans    pp ON ps.payment_plan_id = pp.id
ORDER BY ps.week_number
LIMIT 10;
