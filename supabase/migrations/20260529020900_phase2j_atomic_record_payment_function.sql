-- ============================================================
-- PHASE 2-J: Atomic record_payment function
-- ------------------------------------------------------------
-- Replaces the 3-step app-level process (read plan → insert
-- payment → update amount_paid) with a single SECURITY DEFINER
-- function that wraps everything in one transaction.
--
-- If any step fails the whole thing rolls back — no more
-- partial state where a payment row exists but amount_paid
-- on the plan wasn't updated.
--
-- Also: marks the matching payment_schedule row as paid,
-- creates a notification for the client, and writes to audit_log.
-- ============================================================

CREATE OR REPLACE FUNCTION public.record_payment_atomic(
  p_payment_plan_id  uuid,
  p_amount           numeric,
  p_payment_date     date,
  p_payment_method   text,
  p_reference_number text  DEFAULT NULL,
  p_notes            text  DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_plan            record;
  v_new_amount_paid numeric;
  v_new_status      text;
  v_payment_id      uuid;
  v_schedule_row    record;
  v_admin_id        uuid := auth.uid();
BEGIN
  -- ── 1. Lock and fetch current plan ────────────────────────
  SELECT pp.*, c.id AS client_row_id, c.first_name
  INTO   v_plan
  FROM   public.payment_plans pp
  JOIN   public.clients        c ON pp.client_id = c.id
  WHERE  pp.id = p_payment_plan_id
  FOR UPDATE;                       -- row lock prevents concurrent payment race

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment plan not found: %', p_payment_plan_id;
  END IF;

  IF v_plan.status NOT IN ('active', 'pending') THEN
    RAISE EXCEPTION 'Cannot record payment on a % plan', v_plan.status;
  END IF;

  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Payment amount must be positive, got: %', p_amount;
  END IF;

  -- ── 2. Calculate new totals ────────────────────────────────
  v_new_amount_paid := v_plan.amount_paid + p_amount;
  v_new_status      := CASE
    WHEN v_new_amount_paid >= v_plan.total_amount THEN 'completed'
    WHEN v_plan.status = 'pending'               THEN 'active'
    ELSE v_plan.status
  END;

  -- ── 3. Insert the payment record ──────────────────────────
  INSERT INTO public.payments (
    payment_plan_id, amount, payment_date,
    payment_method, reference_number, notes, recorded_by
  )
  VALUES (
    p_payment_plan_id, p_amount, p_payment_date,
    p_payment_method, p_reference_number, p_notes, v_admin_id
  )
  RETURNING id INTO v_payment_id;

  -- ── 4. Update the payment plan ────────────────────────────
  UPDATE public.payment_plans
  SET
    amount_paid = v_new_amount_paid,
    status      = v_new_status,
    end_date    = CASE WHEN v_new_status = 'completed' THEN p_payment_date ELSE end_date END,
    updated_at  = now()
  WHERE id = p_payment_plan_id;

  -- ── 5. Mark the earliest unpaid schedule row as paid ──────
  SELECT id INTO v_schedule_row
  FROM   public.payment_schedule
  WHERE  payment_plan_id = p_payment_plan_id
    AND  status IN ('pending', 'overdue')
  ORDER BY week_number
  LIMIT 1
  FOR UPDATE;

  IF FOUND THEN
    UPDATE public.payment_schedule
    SET
      status     = 'paid',
      payment_id = v_payment_id,
      paid_at    = now()
    WHERE id = v_schedule_row.id;
  END IF;

  -- ── 6. Create client notification ─────────────────────────
  INSERT INTO public.notifications (
    client_id, title, message, type,
    category, related_entity_type, related_entity_id
  )
  VALUES (
    v_plan.client_row_id,
    'Payment Received',
    'Your payment of ZMK ' || p_amount::text || ' has been recorded successfully.',
    'payment_received',
    'payments',
    'payment',
    v_payment_id
  );

  -- ── 7. Write to audit log ──────────────────────────────────
  INSERT INTO public.audit_log (
    performed_by, action_type, entity_type, entity_id,
    old_values, new_values, description
  )
  VALUES (
    v_admin_id,
    'record_payment',
    'payment',
    v_payment_id,
    jsonb_build_object(
      'plan_amount_paid_before', v_plan.amount_paid,
      'plan_status_before',      v_plan.status
    ),
    jsonb_build_object(
      'payment_id',              v_payment_id,
      'amount',                  p_amount,
      'plan_amount_paid_after',  v_new_amount_paid,
      'plan_status_after',       v_new_status
    ),
    'Recorded ZMK ' || p_amount::text || ' payment for plan ' || p_payment_plan_id::text
  );

  -- ── 8. Return result ──────────────────────────────────────
  RETURN jsonb_build_object(
    'success',        true,
    'payment_id',     v_payment_id,
    'new_amount_paid', v_new_amount_paid,
    'new_status',     v_new_status,
    'is_completed',   (v_new_status = 'completed')
  );

EXCEPTION
  WHEN OTHERS THEN
    RAISE;  -- re-raise so the transaction rolls back cleanly
END;
$$;

COMMENT ON FUNCTION public.record_payment_atomic IS
  'Atomically records a payment: inserts into payments, updates payment_plans, marks schedule row paid, creates notification, writes audit log. All in one transaction.';

GRANT EXECUTE ON FUNCTION public.record_payment_atomic TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_payment_atomic TO service_role;
