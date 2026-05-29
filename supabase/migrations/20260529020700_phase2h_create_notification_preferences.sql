-- ============================================================
-- PHASE 2-H: Create notification_preferences table
-- ------------------------------------------------------------
-- Replaces the useState in the Notifications page that reset
-- every time the page loaded. One row per client (enforced
-- by UNIQUE on client_id). Created automatically when a
-- client first registers via a trigger.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id                      uuid DEFAULT gen_random_uuid() NOT NULL,
  client_id               uuid NOT NULL,
  payment_reminders       boolean NOT NULL DEFAULT true,
  payment_confirmations   boolean NOT NULL DEFAULT true,
  plan_updates            boolean NOT NULL DEFAULT true,
  system_updates          boolean NOT NULL DEFAULT true,
  sms_enabled             boolean NOT NULL DEFAULT true,
  reminder_days_before    integer NOT NULL DEFAULT 3,  -- days before due date to send reminder
  updated_at              timestamp with time zone DEFAULT now() NOT NULL,

  CONSTRAINT notification_preferences_pkey    PRIMARY KEY (id),
  CONSTRAINT notification_preferences_client_fkey
    FOREIGN KEY (client_id)
    REFERENCES public.clients(id)
    ON DELETE CASCADE,
  CONSTRAINT notification_preferences_client_unique
    UNIQUE (client_id),   -- one preferences row per client
  CONSTRAINT reminder_days_range
    CHECK (reminder_days_before BETWEEN 1 AND 14)
);

COMMENT ON TABLE  public.notification_preferences IS
  'Per-client notification settings. One row per client, auto-created on registration.';
COMMENT ON COLUMN public.notification_preferences.reminder_days_before IS
  'How many days before a payment is due to send a reminder. Min 1, max 14.';

-- Updated_at trigger
CREATE OR REPLACE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create a preferences row when a new client is inserted
CREATE OR REPLACE FUNCTION public.create_default_notification_preferences()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.notification_preferences (client_id)
  VALUES (NEW.id)
  ON CONFLICT (client_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER create_client_notification_preferences
  AFTER INSERT ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_notification_preferences();

COMMENT ON FUNCTION public.create_default_notification_preferences() IS
  'Auto-creates a notification_preferences row with defaults when a new client registers.';

-- ── RLS ───────────────────────────────────────────────────────
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can manage own preferences"
ON public.notification_preferences
FOR ALL
TO authenticated
USING (
  client_id IN (
    SELECT id FROM public.clients WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  client_id IN (
    SELECT id FROM public.clients WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all preferences"
ON public.notification_preferences
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.clients
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- ── Grants ────────────────────────────────────────────────────
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_preferences TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_preferences TO service_role;

-- ── Backfill for existing clients ────────────────────────────
INSERT INTO public.notification_preferences (client_id)
SELECT id FROM public.clients
ON CONFLICT (client_id) DO NOTHING;
