-- ============================================================
-- PHASE 1-B: Fix clients SELECT policy — PII exposed to public
-- ------------------------------------------------------------
-- "Enable read access for all users" grants SELECT to the
-- public (anon) role, meaning every client's name, phone,
-- national_id, monthly_income and address is readable by
-- anyone with the API URL — no token required.
--
-- Replace with two scoped policies:
--   1. Clients can only read their own row
--   2. Admins can read all rows
-- ============================================================

-- Drop the dangerously open public SELECT policy
DROP POLICY IF EXISTS "Enable read access for all users" ON public.clients;

-- Policy 1: Each client can only read their own profile row
CREATE POLICY "Clients can view own profile"
ON public.clients
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy 2: Admins can read all client rows
CREATE POLICY "Admins can view all clients"
ON public.clients
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.clients admin_check
    WHERE admin_check.user_id = auth.uid()
      AND admin_check.role = 'admin'
  )
);

-- Verify the two new policies exist and the open one is gone
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'clients'
      AND policyname = 'Enable read access for all users'
  ) THEN
    RAISE EXCEPTION 'Safety check failed: open public SELECT policy still exists';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'clients'
      AND policyname = 'Clients can view own profile'
  ) THEN
    RAISE EXCEPTION 'Safety check failed: own-profile SELECT policy was not created';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'clients'
      AND policyname = 'Admins can view all clients'
  ) THEN
    RAISE EXCEPTION 'Safety check failed: admin SELECT policy was not created';
  END IF;
END $$;
