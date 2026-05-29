-- ============================================================
-- PHASE 2-C: Extend clients table
-- ------------------------------------------------------------
-- Add fields collected in the apply form but not currently
-- stored in the clients row:
--   employer, job_title  — employment detail fields
--   date_of_birth        — collected in ApplyForPlan form
--
-- Split the flat "address" text field into structured columns:
--   street_address, city, province
-- (Keep the old "address" column for now so the app doesn't
--  break; we'll deprecate it once the frontend is updated.)
--
-- Add UNIQUE constraint to national_id to prevent duplicates.
-- ============================================================

-- Employment detail fields
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS employer text;

ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS job_title text;

COMMENT ON COLUMN public.clients.employer   IS 'Current employer name.';
COMMENT ON COLUMN public.clients.job_title  IS 'Current job title / position.';

-- Personal detail
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS date_of_birth date;

COMMENT ON COLUMN public.clients.date_of_birth IS 'Client date of birth. Used for identity verification.';

-- Structured address columns (alongside existing flat "address")
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS street_address text;

ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS city text;

ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS province text;

COMMENT ON COLUMN public.clients.street_address IS 'Street / house number. Replaces the flat address field.';
COMMENT ON COLUMN public.clients.city           IS 'City or town.';
COMMENT ON COLUMN public.clients.province       IS 'Province or region (e.g. Lusaka, Copperbelt).';

-- Migrate existing flat address data into street_address
-- (city and province cannot be parsed from a single text field,
--  so they remain NULL until updated by each client)
UPDATE public.clients
SET    street_address = address
WHERE  address IS NOT NULL
  AND  street_address IS NULL;

-- Unique constraint on national_id (only where not null)
-- Use a partial unique index so multiple NULL values are allowed
CREATE UNIQUE INDEX IF NOT EXISTS idx_clients_national_id_unique
  ON public.clients(national_id)
  WHERE national_id IS NOT NULL;

COMMENT ON COLUMN public.clients.national_id IS
  'National ID / NRC number. Must be unique across all clients when provided.';
