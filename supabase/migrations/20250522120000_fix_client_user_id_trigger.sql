-- Fix the client user_id trigger to properly link auth.users with clients table
-- This ensures that when a new client is created, their user_id is set to auth.uid()

-- Drop the old incorrect trigger and function
DROP TRIGGER IF EXISTS set_user_id_before_insert ON clients;
DROP FUNCTION IF EXISTS set_user_id_to_id() CASCADE;

-- Create the correct function that sets user_id from auth.uid()
CREATE OR REPLACE FUNCTION public.handle_new_client()
RETURNS TRIGGER AS $$
BEGIN
  -- Set user_id to the authenticated user's ID if not already set
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger to automatically set user_id on insert
CREATE TRIGGER set_user_id_before_insert
  BEFORE INSERT ON clients
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_client();

-- Fix existing clients that have NULL user_id by matching email
UPDATE clients c
SET user_id = u.id
FROM auth.users u
WHERE c.email = u.email
  AND c.user_id IS NULL;

COMMENT ON FUNCTION handle_new_client() IS 'Automatically sets user_id to auth.uid() when a new client is created';
