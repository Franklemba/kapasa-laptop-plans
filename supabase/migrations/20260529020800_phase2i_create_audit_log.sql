-- ============================================================
-- PHASE 2-I: Create audit_log table
-- ------------------------------------------------------------
-- Generic admin action log capturing every sensitive operation
-- with before/after state. Complements stock_movements
-- (which is domain-specific) with a system-wide trail.
--
-- action_type values (not enforced by CHECK to allow extension
-- without migrations, but standard values are documented):
--   approve_plan | reject_plan | cancel_plan
--   record_payment | delete_payment
--   adjust_stock
--   update_client | suspend_client
--   add_laptop | update_laptop | remove_laptop
-- ============================================================

CREATE TABLE IF NOT EXISTS public.audit_log (
  id            uuid DEFAULT gen_random_uuid() NOT NULL,
  performed_by  uuid NOT NULL,
  action_type   text NOT NULL,
  entity_type   text NOT NULL,   -- 'payment_plan', 'payment', 'client', 'laptop', etc.
  entity_id     uuid NOT NULL,
  old_values    jsonb,           -- state before the action
  new_values    jsonb,           -- state after the action
  description   text,           -- human-readable summary
  ip_address    inet,
  created_at    timestamp with time zone DEFAULT now() NOT NULL,

  CONSTRAINT audit_log_pkey PRIMARY KEY (id),
  CONSTRAINT audit_log_performed_by_fkey
    FOREIGN KEY (performed_by)
    REFERENCES auth.users(id)
    ON DELETE SET NULL            -- preserve log even if user account is removed
    DEFERRABLE INITIALLY DEFERRED
);

COMMENT ON TABLE  public.audit_log IS
  'System-wide admin action log. Append-only — rows should never be updated or deleted.';
COMMENT ON COLUMN public.audit_log.old_values IS 'JSON snapshot of the record before the action.';
COMMENT ON COLUMN public.audit_log.new_values IS 'JSON snapshot of the record after the action.';

-- Make performed_by nullable to allow SET NULL on user delete
ALTER TABLE public.audit_log
  ALTER COLUMN performed_by DROP NOT NULL;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_audit_log_performed_by
  ON public.audit_log(performed_by);

CREATE INDEX IF NOT EXISTS idx_audit_log_entity
  ON public.audit_log(entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_audit_log_created_at
  ON public.audit_log(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_log_action_type
  ON public.audit_log(action_type);

-- ── RLS ───────────────────────────────────────────────────────
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can read. Nobody (not even admins) can UPDATE or DELETE —
-- the audit log is append-only. INSERTs happen via service_role only.
CREATE POLICY "Admins can view audit log"
ON public.audit_log
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.clients
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- No INSERT policy for authenticated — inserts go through service_role
-- (the atomic DB functions use SECURITY DEFINER which runs as postgres)

-- ── Grants ────────────────────────────────────────────────────
GRANT SELECT ON public.audit_log TO authenticated;
GRANT SELECT, INSERT ON public.audit_log TO service_role;
