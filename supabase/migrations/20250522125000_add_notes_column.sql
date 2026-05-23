-- Add notes column to payment_plans table
-- This allows admins to add notes about payment plans (e.g., rejection reasons, special conditions)

ALTER TABLE payment_plans 
ADD COLUMN IF NOT EXISTS notes TEXT;

COMMENT ON COLUMN payment_plans.notes IS 'Admin notes about the payment plan (e.g., rejection reason, special conditions, approval notes)';
