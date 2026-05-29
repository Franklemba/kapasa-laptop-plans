-- ============================================================
-- PHASE 2-G: Create notifications table
-- ------------------------------------------------------------
-- Replaces the ephemeral JS-computed notifications that reset
-- on every page load. Notifications are now persisted, have
-- read/unread state, and can be created by the admin side
-- (e.g. "your plan was approved") not just derived client-side.
--
-- type values (enforced by CHECK):
--   payment_due        — upcoming instalment reminder
--   payment_received   — admin recorded a payment
--   plan_approved      — plan moved to active
--   plan_rejected      — plan cancelled by admin
--   plan_completed     — all instalments paid
--   system             — general system message
-- ============================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id                  uuid DEFAULT gen_random_uuid() NOT NULL,
  client_id           uuid NOT NULL,
  title               text NOT NULL,
  message             text NOT NULL,
  type                text NOT NULL,
  category            text,
  is_read             boolean NOT NULL DEFAULT false,
  read_at             timestamp with time zone,
  related_entity_type text,       -- e.g. 'payment_plan', 'payment', 'laptop'
  related_entity_id   uuid,       -- the id of that entity
  created_at          timestamp with time zone DEFAULT now() NOT NULL,

  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_client_fkey
    FOREIGN KEY (client_id)
    REFERENCES public.clients(id)
    ON DELETE CASCADE,
  CONSTRAINT notifications_type_check
    CHECK (type IN (
      'payment_due', 'payment_received', 'plan_approved',
      'plan_rejected', 'plan_completed', 'system'
    ))
);

COMMENT ON TABLE  public.notifications IS
  'Persistent per-client notifications. Created by DB triggers or admin actions.';
COMMENT ON COLUMN public.notifications.related_entity_type IS
  'The type of entity this notification refers to (payment_plan, payment, etc.).';
COMMENT ON COLUMN public.notifications.related_entity_id   IS
  'The UUID of the related entity for deep-linking from notification.';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_client_id
  ON public.notifications(client_id);

CREATE INDEX IF NOT EXISTS idx_notifications_is_read
  ON public.notifications(client_id, is_read)
  WHERE is_read = false;   -- partial index — only unread rows (most common query)

CREATE INDEX IF NOT EXISTS idx_notifications_created_at
  ON public.notifications(created_at DESC);

-- ── RLS ───────────────────────────────────────────────────────
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Clients can view and update (mark as read) their own notifications
CREATE POLICY "Clients can view own notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (
  client_id IN (
    SELECT id FROM public.clients WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Clients can mark own notifications as read"
ON public.notifications
FOR UPDATE
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

-- Admins can manage all notifications (create, view, delete)
CREATE POLICY "Admins can manage all notifications"
ON public.notifications
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.clients
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- ── Grants ────────────────────────────────────────────────────
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO service_role;
