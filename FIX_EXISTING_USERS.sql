-- ============================================================================
-- FIX EXISTING USERS - Manually Confirm and Create Profiles
-- ============================================================================
-- Run this in Supabase Dashboard → SQL Editor
-- This will fix users who are stuck in unconfirmed state
-- ============================================================================

-- Step 1: View all users and their confirmation status
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  u.created_at,
  c.id as client_id,
  c.first_name,
  c.last_name,
  c.role
FROM auth.users u
LEFT JOIN public.clients c ON c.user_id = u.id
ORDER BY u.created_at DESC;

-- Step 2: Confirm all unconfirmed users (ONLY RUN IF NEEDED)
-- Uncomment the lines below to confirm all users
/*
UPDATE auth.users 
SET email_confirmed_at = NOW(),
    confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;
*/

-- Step 3: Create client profiles for users without profiles
-- This will create a basic profile for any user that doesn't have one
INSERT INTO public.clients (user_id, email, first_name, last_name, role)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'first_name', 'User'),
  COALESCE(u.raw_user_meta_data->>'last_name', split_part(u.email, '@', 1)),
  'client'
FROM auth.users u
WHERE u.id NOT IN (
  SELECT user_id 
  FROM public.clients 
  WHERE user_id IS NOT NULL
)
ON CONFLICT (email) DO NOTHING;

-- Step 4: Verify all users now have profiles
SELECT 
  u.email,
  u.email_confirmed_at IS NOT NULL as is_confirmed,
  c.id IS NOT NULL as has_profile,
  c.first_name,
  c.last_name,
  c.role
FROM auth.users u
LEFT JOIN public.clients c ON c.user_id = u.id
ORDER BY u.created_at DESC;

-- Step 5: Make a specific user an admin (REPLACE EMAIL)
-- Uncomment and replace with your email
/*
UPDATE public.clients 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
*/

-- ============================================================================
-- MANUAL FIX FOR SPECIFIC USER
-- ============================================================================
-- If you need to fix a specific user, use these queries:

-- 1. Find the user
/*
SELECT id, email, email_confirmed_at 
FROM auth.users 
WHERE email = 'specific-email@example.com';
*/

-- 2. Confirm the user
/*
UPDATE auth.users 
SET email_confirmed_at = NOW(),
    confirmed_at = NOW()
WHERE email = 'specific-email@example.com';
*/

-- 3. Create or update their client profile
/*
INSERT INTO public.clients (user_id, email, first_name, last_name, role)
SELECT 
  id,
  email,
  'First',
  'Last',
  'client'
FROM auth.users
WHERE email = 'specific-email@example.com'
ON CONFLICT (email) 
DO UPDATE SET 
  user_id = EXCLUDED.user_id,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name;
*/

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check total users vs profiles
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (SELECT COUNT(*) FROM public.clients) as total_profiles,
  (SELECT COUNT(*) FROM auth.users WHERE email_confirmed_at IS NULL) as unconfirmed_users;

-- Check for users without profiles
SELECT 
  u.email,
  u.created_at
FROM auth.users u
LEFT JOIN public.clients c ON c.user_id = u.id
WHERE c.id IS NULL;

-- Check for profiles without users (orphaned profiles)
SELECT 
  c.email,
  c.created_at
FROM public.clients c
LEFT JOIN auth.users u ON c.user_id = u.id
WHERE u.id IS NULL AND c.user_id IS NOT NULL;

-- ============================================================================
-- CLEANUP (USE WITH CAUTION)
-- ============================================================================

-- Delete test users (ONLY FOR DEVELOPMENT)
-- Uncomment to delete users with test emails
/*
DELETE FROM public.clients 
WHERE email LIKE '%test%' OR email LIKE '%example%';

-- Note: You cannot delete auth.users directly via SQL
-- Use Supabase Dashboard → Authentication → Users to delete auth users
*/

-- ============================================================================
-- DONE!
-- ============================================================================
