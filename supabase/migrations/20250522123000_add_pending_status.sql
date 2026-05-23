-- Add 'pending' status to payment_plans status check constraint
-- This allows payment plans to be created with 'pending' status awaiting admin approval

-- Drop the old constraint
ALTER TABLE payment_plans DROP CONSTRAINT IF EXISTS payment_plans_status_check;

-- Add the new constraint with 'pending' included
ALTER TABLE payment_plans 
ADD CONSTRAINT payment_plans_status_check 
CHECK (status = ANY (ARRAY['pending'::text, 'active'::text, 'completed'::text, 'defaulted'::text, 'cancelled'::text]));

COMMENT ON CONSTRAINT payment_plans_status_check ON payment_plans IS 'Allowed statuses: pending (awaiting approval), active (approved and ongoing), completed (fully paid), defaulted (missed payments), cancelled (rejected or cancelled)';
