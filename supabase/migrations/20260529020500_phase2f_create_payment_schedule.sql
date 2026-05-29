-- ============================================================
-- PHASE 2-F: Create payment_schedule table
-- ------------------------------------------------------------
-- Each approved payment plan generates one row per week.
-- This replaces the fragile JS math that computed due dates
-- at runtime (start_date + weeks * 7). Now the DB owns the
-- schedule and can flag overdue instalments automatically.
--
-- status values:
--   pending  — not yet due or due but not paid
--   paid     — payment_id is set, paid_at is set
--   overdue  — due_date has passed, payment_id still NULL
-- ============================================================

CREATE TABLE IF NOT EXISTS public.payment_schedule (
  id              uuid DEFAULT gen_random_uuid() NOT NULL,
  payment_plan_id uuid NOT NULL,
  payment_id      uuid,                          -- set when this instalment is paid
  week_number     integer NOT NULL,              -- 1-based (week 1 = first payment)
  due_date        date NOT NULL,
  amount_due      numeric NOT NULL,
  status          text NOT NULL DEFAULT 'pending',
  paid_at         timestamp with time zone,
  created_at      timestamp with time zone DEFAULT now() NOT NULL,

  CONSTRAINT payment_schedule_pkey PRIMARY KEY (id),
  CONSTRAINT payment_schedule_plan_fkey
    FOREIGN KEY (payment_plan_id)
    REFERENCES public.payment_plans(id)
    ON DELETE CASCADE,
  CONSTRAINT payment_schedule_payment_fkey
    FOREIGN KEY (payment_id)
    REFERENCES public.payments(id)
    ON DELETE SET NULL,
  CONSTRAINT payment_schedule_status_check
    CHECK (status IN ('pending', 'paid', 'overdue')),
  CONSTRAINT payment_schedule_week_positive
    CHECK (week_number > 0),
  CONSTRAINT payment_schedule_amount_positive
    CHECK (amount_due > 0),
  -- Each plan can only have one row per week number
  CONSTRAINT payment_schedule_plan_week_unique
    UNIQUE (payment_plan_id, week_number)
);

COMMENT ON TABLE  public.payment_schedule IS
  'One row per weekly instalment per payment plan. Generated automatically when a plan is approved.';
COMMENT ON COLUMN public.payment_schedule.week_number  IS '1-based week index within the plan.';
COMMENT ON COLUMN public.payment_schedule.due_date     IS 'start_date + (week_number - 1) * 7 days.';
COMMENT ON COLUMN public.payment_schedule.payment_id   IS 'Set to the payments.id that satisfied this instalment.';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payment_schedule_plan_id
  ON public.payment_schedule(payment_plan_id);

CREATE INDEX IF NOT EXISTS idx_payment_schedule_due_date
  ON public.payment_schedule(due_date);

CREATE INDEX IF NOT EXISTS idx_payment_schedule_status
  ON public.payment_schedule(status);

-- ── RLS ───────────────────────────────────────────────────────
ALTER TABLE public.payment_schedule ENABLE ROW LEVEL SECURITY;

-- Clients can view their own schedule
CREATE POLICY "Clients can view own payment schedule"
ON public.payment_schedule
FOR SELECT
TO authenticated
USING (
  payment_plan_id IN (
    SELECT id FROM public.payment_plans
    WHERE client_id IN (
      SELECT id FROM public.clients WHERE user_id = auth.uid()
    )
  )
);

-- Admins can manage all schedules
CREATE POLICY "Admins can manage payment schedules"
ON public.payment_schedule
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.clients
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- ── Grants ────────────────────────────────────────────────────
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_schedule TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_schedule TO service_role;
