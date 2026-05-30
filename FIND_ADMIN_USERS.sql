-- ============================================================================
-- FIND ADMIN USERS
-- ============================================================================
-- Run this in Supabase Dashboard → SQL Editor
-- https://supabase.com/dashboard/project/rbgbttfxipzkjezekadd/sql
-- ============================================================================

-- Query 1: Find all admin users
SELECT 
  c.id as client_id,
  c.email,
  c.first_name,
  c.last_name,
  c.role,
  c.user_id,
  c.created_at,
  u.email as auth_email,
  u.email_confirmed_at
FROM public.clients c
LEFT JOIN auth.users u ON c.user_id = u.id
WHERE c.role = 'admin'
ORDER BY c.created_at DESC;

-- Query 2: Show all users with their roles
SELECT 
  c.email,
  c.first_name,
  c.last_name,
  c.role,
  c.user_id IS NOT NULL as has_auth_link,
  c.created_at
FROM public.clients c
ORDER BY c.created_at DESC;

-- Query 3: Count users by role
SELECT 
  role,
  COUNT(*) as user_count
FROM public.clients
GROUP BY role
ORDER BY role;

-- ============================================================================
-- TO CREATE AN ADMIN USER
-- ============================================================================
-- If you need to make a user an admin, uncomment and run this:
-- (Replace 'your-email@example.com' with the actual email)

/*
UPDATE public.clients 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
*/

-- Verify the update:
/*
SELECT email, first_name, last_name, role 
FROM public.clients 
WHERE email = 'your-email@example.com';
*/

-- ============================================================================
-- TO CREATE A NEW ADMIN USER FROM SCRATCH
-- ============================================================================
-- If you need to create a completely new admin user:

/*
-- Step 1: The user must first register on the website
-- Step 2: Then run this to make them admin:
UPDATE public.clients 
SET role = 'admin' 
WHERE email = 'new-admin@example.com';
*/

-- ============================================================================
-- TROUBLESHOOTING
-- ============================================================================

-- Check if any users exist at all:
SELECT COUNT(*) as total_users FROM public.clients;

-- Check auth.users table:
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10;

-- Find users without client profiles:
SELECT 
  u.id,
  u.email,
  u.created_at
FROM auth.users u
LEFT JOIN public.clients c ON c.user_id = u.id
WHERE c.id IS NULL;

-- Find client profiles without auth users (orphaned):
SELECT 
  c.id,
  c.email,
  c.user_id,
  c.created_at
FROM public.clients c
LEFT JOIN auth.users u ON c.user_id = u.id
WHERE c.user_id IS NOT NULL AND u.id IS NULL;
