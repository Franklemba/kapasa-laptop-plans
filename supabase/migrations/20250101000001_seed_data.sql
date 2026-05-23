-- Drop the foreign key constraint that's causing the error
ALTER TABLE public.clients DROP CONSTRAINT IF EXISTS clients_user_id_fkey;