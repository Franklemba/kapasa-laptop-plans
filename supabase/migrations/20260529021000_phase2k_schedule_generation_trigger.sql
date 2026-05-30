-- ============================================================
-- PHASE 2-K: Auto-generate payment_schedule on plan approval
-- ------------------------------------------------------------
-- Fires AFTER UPDATE on payment_plans when status transitions
-- from 'pending' → 'active'. Inserts one row per week for the
-- full plan_duration. Also notifies the client of the approval
-- and writes to the audit log.
-- ============================================================

CREATE OR REPLACE FUNCTION public.generate_payment_schedule_on_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  i           integer;
  v_due_date  date;
BEGIN
  -- Only fire when transitioning pending → active
  IF OLD.status = 'pending' AND NEW.status = 'active' THEN

    -- Generate one row per week
    FOR i IN 1..NEW.plan_duration LOOP
      v_due_date := NEW.start_date + ((i - 1) * INTERVAL '7 days');

      INSERT INTO public.payment_schedule (
        payment_plan_id, week_number, due_date, amount_due, status
      )
      VALUES (
        NEW.id, i, v_due_date, NEW.weekly_payment, 'pending'
      )
      ON CONFLICT (payment_plan_id, week_number) DO NOTHING;
    END LOOP;

    -- Set end_date = start_date + plan_duration weeks
    UPDATE public.payment_plans
    SET    end_date   = NEW.start_date + (NEW.plan_duration * INTERVAL '7 days'),
           approved_at = COALESCE(NEW.approved_at, now())
    WHERE  id = NEW.id;

    -- Notify the client their plan was approved
    INSERT INTO public.notifications (
      client_id, title, message, type,
      category, related_entity_type, related_entity_id
    )
    SELECT
      c.id,
      'Payment Plan Approved!',
      'Your payment plan has been approved. Your first payment of ZMK '
        || NEW.weekly_payment::text || ' is due on '
        || to_char(NEW.start_date, 'DD Mon YYYY') || '.',
      'plan_approved',
      'payment_plans',
      'payment_plan',
      NEW.id
    FROM public.clients c
    WHERE c.id = NEW.client_id;

    -- Audit log
    INSERT INTO public.audit_log (
      performed_by, action_type, entity_type, entity_id,
      old_values, new_values, description
    )
    VALUES (
      auth.uid(),
      'approve_plan',
      'payment_plan',
      NEW.id,
      jsonb_build_object('status', OLD.status),
      jsonb_build_object('status', NEW.status, 'approved_at', now()),
      'Payment plan approved — ' || NEW.plan_duration::text || ' week schedule generated'
    );

  -- Also handle pending → cancelled (rejection)
  ELSIF OLD.status = 'pending' AND NEW.status = 'cancelled' THEN

    -- Notify the client their plan was rejected
    INSERT INTO public.notifications (
      client_id, title, message, type,
      category, related_entity_type, related_entity_id
    )
    SELECT
      c.id,
      'Payment Plan Not Approved',
      COALESCE(
        'Your payment plan application was not approved. ' || NEW.notes,
        'Your payment plan application was not approved. Please contact us for details.'
      ),
      'plan_rejected',
      'payment_plans',
      'payment_plan',
      NEW.id
    FROM public.clients c
    WHERE c.id = NEW.client_id;

    -- Audit log
    INSERT INTO public.audit_log (
      performed_by, action_type, entity_type, entity_id,
      old_values, new_values, description
    )
    VALUES (
      auth.uid(),
      'reject_plan',
      'payment_plan',
      NEW.id,
      jsonb_build_object('status', OLD.status),
      jsonb_build_object('status', NEW.status, 'notes', NEW.notes),
      'Payment plan rejected'
    );

  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS generate_schedule_on_plan_approval ON public.payment_plans;

CREATE TRIGGER generate_schedule_on_plan_approval
  AFTER UPDATE ON public.payment_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_payment_schedule_on_approval();

COMMENT ON FUNCTION public.generate_payment_schedule_on_approval() IS
  'Generates payment_schedule rows when a plan is approved (pending→active). Also sends client notification and audit log entry. Handles rejection (pending→cancelled) too.';
