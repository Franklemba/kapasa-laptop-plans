-- ============================================================
-- PHASE 3-E: Enforce clients.user_id NOT NULL
-- ------------------------------------------------------------
-- Must run AFTER Phase 3-A (orphan deleted).
-- Adds NOT NULL constraint so no future orphaned client rows
-- can be created without a valid auth.users link.
-- ============================================================

-- Safety check: abort if any NULL user_id rows still exist
DO $$
DECLARE
  v_null_count integer;
BEGIN
  SELECT COUNT(*) INTO v_null_count
  FROM public.clients
  WHERE user_id IS NULL;

  IF v_null_count > 0 THEN
    RAISE EXCEPTION
      'Cannot enforce NOT NULL — % client row(s) still have user_id = NULL. Run Phase 3-A first.',
      v_null_count;
  END IF;

  RAISE NOTICE 'No NULL user_id rows found. Proceeding to enforce NOT NULL.';
END $$;

-- Enforce NOT NULL
ALTER TABLE public.clients
  ALTER COLUMN user_id SET NOT NULL;

-- Add explicit FK to auth.users if not already present
-- (the trigger sets it but there was no hard FK constraint)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_schema = 'public'
      AND tc.table_name   = 'clients'
      AND tc.constraint_type = 'FOREIGN KEY'
      AND kcu.column_name = 'user_id'
  ) THEN
    ALTER TABLE public.clients
      ADD CONSTRAINT clients_user_id_fkey
      FOREIGN KEY (user_id)
      REFERENCES auth.users(id)
      ON DELETE CASCADE;

    RAISE NOTICE 'Added FK constraint: clients.user_id → auth.users.id';
  ELSE
    RAISE NOTICE 'FK constraint on user_id already exists — skipped.';
  END IF;
END $$;

-- Also add a UNIQUE index on user_id so one auth user = one client profile
CREATE UNIQUE INDEX IF NOT EXISTS idx_clients_user_id_unique
  ON public.clients(user_id);

COMMENT ON COLUMN public.clients.user_id IS
  'Links to auth.users.id. NOT NULL — every client must have an auth account. UNIQUE — one profile per auth user.';
