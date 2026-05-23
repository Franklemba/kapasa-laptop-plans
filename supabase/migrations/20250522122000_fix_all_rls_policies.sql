-- Fix RLS policies for all tables
-- This comprehensive migration ensures all tables have proper RLS policies

-- ============================================================================
-- PAYMENTS TABLE POLICIES
-- ============================================================================

-- Users can view their own payments
CREATE POLICY "Users can view their own payments"
ON payments
FOR SELECT
TO authenticated
USING (
  payment_plan_id IN (
    SELECT pp.id FROM payment_plans pp
    JOIN clients c ON pp.client_id = c.id
    WHERE c.user_id = auth.uid()
  )
);

-- Admins can view all payments
CREATE POLICY "Admins can view all payments"
ON payments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM clients
    WHERE clients.user_id = auth.uid()
    AND clients.role = 'admin'
  )
);

-- Admins can manage all payments
CREATE POLICY "Admins can manage all payments"
ON payments
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM clients
    WHERE clients.user_id = auth.uid()
    AND clients.role = 'admin'
  )
);

-- ============================================================================
-- LAPTOPS TABLE POLICIES
-- ============================================================================

-- Everyone can view active laptops
CREATE POLICY "Anyone can view laptops"
ON laptops
FOR SELECT
USING (true);

-- Admins can manage laptops
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

-- ============================================================================
-- STOCK_MOVEMENTS TABLE POLICIES
-- ============================================================================

-- Admins can view all stock movements
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

-- Admins can manage stock movements
CREATE POLICY "Admins can manage stock movements"
ON stock_movements
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM clients
    WHERE clients.user_id = auth.uid()
    AND clients.role = 'admin'
  )
);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON POLICY "Users can view their own payments" ON payments IS 'Allows users to view payments for their own payment plans';
COMMENT ON POLICY "Admins can view all payments" ON payments IS 'Allows admins to view all payments';
COMMENT ON POLICY "Admins can manage all payments" ON payments IS 'Allows admins full access to all payments';

COMMENT ON POLICY "Anyone can view laptops" ON laptops IS 'Allows anyone to browse the laptop catalog';
COMMENT ON POLICY "Admins can manage laptops" ON laptops IS 'Allows admins to add, update, and delete laptops';

COMMENT ON POLICY "Admins can view stock movements" ON stock_movements IS 'Allows admins to view stock movement history';
COMMENT ON POLICY "Admins can manage stock movements" ON stock_movements IS 'Allows admins to manage stock movements';
