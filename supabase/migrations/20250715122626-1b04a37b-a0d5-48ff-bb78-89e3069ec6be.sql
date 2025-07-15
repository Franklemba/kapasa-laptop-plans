-- Remove the foreign key constraint that's causing issues
-- The clients.user_id should not reference auth.users directly per Supabase best practices

-- Drop the foreign key constraint if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'clients_user_id_fkey' 
        AND table_name = 'clients'
    ) THEN
        ALTER TABLE public.clients DROP CONSTRAINT clients_user_id_fkey;
    END IF;
END $$;