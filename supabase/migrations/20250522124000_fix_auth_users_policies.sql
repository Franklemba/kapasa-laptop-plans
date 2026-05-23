-- Fix RLS policies that were incorrectly referencing auth.users table
-- This caused "permission denied for table users" errors
-- All policies should check role via clients table, not auth.users directly

-- Drop old problematic policies that reference auth.users
DROP POLICY IF EXISTS "Admins can create stock movements" ON stock_movements;
DROP POLICY IF EXISTS "Admins can manage laptops" ON laptops;
DROP POLICY IF EXISTS "Admins can view stock movements" ON stock_movements;
DROP POLICY IF EXISTS "Allow insert for all" ON laptops;
DROP POLICY IF EXISTS "Anyone can view active laptops" ON laptops;
DROP POLICY IF EXISTS "Authenticated users can insert laptops" ON laptops;
DROP POLICY IF EXISTS "Authenticated users can view all laptops" ON laptops;

-- Create correct policies that use clients table for role checking

-- Laptops policies
CREATE POLICY "Admins can manage laptops"
ON laptops
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM clients
    WHERE clients.user_id = auth.uid()
    AND clients.role = 'admin'
  )
);

-- Stock movements policies
CREATE POLICY "Admins can view stock movements"
ON stock_movements
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM clients
    WHERE clients.user_id = auth.uid()
    AND clients.role = 'admin'
  )
);

CREATE POLICY "Admins can create stock movements"
ON stock_movements
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM clients
    WHERE clients.user_id = auth.uid()
    AND clients.role = 'admin'
  )
);

COMMENT ON POLICY "Admins can manage laptops" ON laptops IS 'Allows admins to perform all operations on laptops table';
COMMENT ON POLICY "Admins can view stock movements" ON stock_movements IS 'Allows admins to view stock movement history';
COMMENT ON POLICY "Admins can create stock movements" ON stock_movements IS 'Allows admins to create stock movement records';
