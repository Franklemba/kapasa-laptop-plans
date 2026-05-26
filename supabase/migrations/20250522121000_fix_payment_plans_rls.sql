-- Fix RLS policies for payment_plans table
-- This allows users to create and manage their own payment plans
-- and allows admins to manage all payment plans

-- Drop existing policies if any (including any from initial schema)
DROP POLICY IF EXISTS "Users can view their own payment plans" ON payment_plans;
DROP POLICY IF EXISTS "Users can insert their own payment plans" ON payment_plans;
DROP POLICY IF EXISTS "Users can update their own payment plans" ON payment_plans;
DROP POLICY IF EXISTS "Admins can view all payment plans" ON payment_plans;
DROP POLICY IF EXISTS "Admins can manage all payment plans" ON payment_plans;

-- Policy: Users can view their own payment plans
CREATE POLICY "Users can view their own payment plans"
ON payment_plans
FOR SELECT
TO authenticated
USING (
  client_id IN (
    SELECT id FROM clients WHERE user_id = auth.uid()
  )
);

-- Policy: Users can insert their own payment plans
CREATE POLICY "Users can insert their own payment plans"
ON payment_plans
FOR INSERT
TO authenticated
WITH CHECK (
  client_id IN (
    SELECT id FROM clients WHERE user_id = auth.uid()
  )
);

-- Policy: Users can update their own payment plans
CREATE POLICY "Users can update their own payment plans"
ON payment_plans
FOR UPDATE
TO authenticated
USING (
  client_id IN (
    SELECT id FROM clients WHERE user_id = auth.uid()
  )
);

-- Policy: Admins can view all payment plans
CREATE POLICY "Admins can view all payment plans"
ON payment_plans
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM clients
    WHERE clients.user_id = auth.uid()
    AND clients.role = 'admin'
  )
);

-- Policy: Admins can manage all payment plans (INSERT, UPDATE, DELETE)
CREATE POLICY "Admins can manage all payment plans"
ON payment_plans
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM clients
    WHERE clients.user_id = auth.uid()
    AND clients.role = 'admin'
  )
);

COMMENT ON POLICY "Users can view their own payment plans" ON payment_plans IS 'Allows users to view only their own payment plans';
COMMENT ON POLICY "Users can insert their own payment plans" ON payment_plans IS 'Allows users to create payment plans for themselves';
COMMENT ON POLICY "Users can update their own payment plans" ON payment_plans IS 'Allows users to update their own payment plans';
COMMENT ON POLICY "Admins can view all payment plans" ON payment_plans IS 'Allows admins to view all payment plans';
COMMENT ON POLICY "Admins can manage all payment plans" ON payment_plans IS 'Allows admins full access to all payment plans';
