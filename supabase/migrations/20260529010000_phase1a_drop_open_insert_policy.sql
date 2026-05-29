-- ============================================================
-- PHASE 1-A: Drop dangerous open INSERT policy on clients
-- ------------------------------------------------------------
-- The "Allow insert for all" policy allows unauthenticated
-- (anon / public role) users to INSERT rows into the clients
-- table. This is what created the goat@gmail.com orphan with
-- user_id = NULL.
--
-- The "Enable insert for authenticated users only" policy
-- already handles legitimate registrations. This one is just
-- a security hole — drop it.
-- ============================================================

DROP POLICY IF EXISTS "Allow insert for all" ON public.clients;

-- Verify the authenticated-only insert policy still exists
-- (it should — we are only dropping the public one)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'clients'
      AND policyname = 'Enable insert for authenticated users only'
  ) THEN
    RAISE EXCEPTION 'Safety check failed: authenticated insert policy is missing — do not proceed';
  END IF;
END $$;

COMMENT ON TABLE public.clients IS
  'Client profiles linked to auth.users. INSERT restricted to authenticated users only.';
