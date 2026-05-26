# Supabase Cloud Setup Instructions

## Link Local Project to Cloud

Run these commands in your terminal:

```bash
cd /Users/user/projects/Uncle_kapasa_project/kapasa-laptop-plans

# Link to your cloud project (replace YOUR-PROJECT-REF with your actual project reference)
supabase link --project-ref YOUR-PROJECT-REF

# You'll be prompted for your database password (the one you set when creating the project)
```

## Push Database Schema to Cloud

After linking, push all your migrations:

```bash
# Push all migrations to cloud
supabase db push

# This will apply all migration files from supabase/migrations/ to your cloud database
```

## Verify Migrations Were Applied

Check in Supabase dashboard:
1. Go to **Database** → **Tables**
2. You should see these tables:
   - clients
   - laptops
   - laptop_images
   - payment_plans
   - payments
   - stock_movements

## Alternative: Manual Migration (If CLI Doesn't Work)

If the CLI method doesn't work, you can manually run migrations:

1. Go to Supabase dashboard → **SQL Editor**
2. Create a new query
3. Copy and paste each migration file content in order:

### Migration 1: Initial Schema
Copy content from: `supabase/migrations/20250101000000_initial_schema.sql`

### Migration 2: Fix Client User ID Trigger
Copy content from: `supabase/migrations/20250522120000_fix_client_user_id_trigger.sql`

### Migration 3: Fix Payment Plans RLS
Copy content from: `supabase/migrations/20250522121000_fix_payment_plans_rls.sql`

### Migration 4: Fix All RLS Policies
Copy content from: `supabase/migrations/20250522122000_fix_all_rls_policies.sql`

### Migration 5: Add Pending Status
Copy content from: `supabase/migrations/20250522123000_add_pending_status.sql`

### Migration 6: Fix Auth Users Policies
Copy content from: `supabase/migrations/20250522124000_fix_auth_users_policies.sql`

### Migration 7: Add Notes Column
Copy content from: `supabase/migrations/20250522125000_add_notes_column.sql`

Run each migration one by one in the SQL Editor.

## Get Your Supabase Credentials

After migrations are applied, get your credentials:

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: The long JWT token under "Project API keys"

## Update Local Environment

Create `.env.local` file with your cloud credentials:

```bash
# Create .env.local file
cat > .env.local << 'EOF'
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
EOF
```

Replace the values with your actual credentials.

## Test Connection

Start your local dev server:

```bash
npm run dev
```

Try to:
1. Register a new account
2. Login
3. Browse catalog

If everything works, your local app is now connected to Supabase cloud!

## Configure Authentication

In Supabase dashboard:

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL**: `http://localhost:8080` (for local testing)
3. Add **Redirect URLs**:
   - `http://localhost:8080/**`
   - `http://localhost:5173/**` (Vite default)

## Add Sample Data (Optional)

Run this in SQL Editor to add sample laptops:

```sql
INSERT INTO laptops (name, brand, model, processor, ram, storage, display, price, weekly_payment, condition, stock_quantity, min_stock_level, status)
VALUES 
  ('MacBook Pro 16"', 'Apple', 'MacBook Pro', 'M2 Pro', '16GB', '512GB SSD', '16-inch Retina', 15000, 500, 'new', 5, 2, 'active'),
  ('Dell XPS 15', 'Dell', 'XPS 15', 'Intel Core i7', '16GB DDR4', '512GB SSD', '15.6-inch FHD', 12000, 400, 'new', 8, 3, 'active'),
  ('HP Pavilion 15', 'HP', 'Pavilion 15', 'Intel Core i5', '8GB DDR4', '256GB SSD', '15.6-inch HD', 6000, 200, 'refurbished', 10, 5, 'active'),
  ('Lenovo ThinkPad', 'Lenovo', 'ThinkPad X1', 'Intel Core i7', '16GB DDR4', '512GB SSD', '14-inch FHD', 11000, 380, 'new', 6, 2, 'active'),
  ('ASUS VivoBook', 'ASUS', 'VivoBook 15', 'AMD Ryzen 5', '8GB DDR4', '512GB SSD', '15.6-inch FHD', 7000, 250, 'new', 12, 4, 'active');
```

## Troubleshooting

### "Failed to link project"
- Make sure you're logged in: `supabase login`
- Check your project reference ID is correct
- Verify you have access to the project

### "Database password incorrect"
- Use the password you set when creating the Supabase project
- Reset it in **Settings** → **Database** if forgotten

### "Migration failed"
- Check the error message in terminal
- Try running migrations manually in SQL Editor
- Verify no tables already exist (drop them if needed)

### "Cannot connect to database"
- Check your internet connection
- Verify Supabase project is active (not paused)
- Check firewall settings

## Next Steps

Once your cloud database is set up:
1. ✅ Push code to GitHub
2. ✅ Deploy to Render
3. ✅ Update Render environment variables with cloud credentials
4. ✅ Test the deployed application

Your Supabase cloud database is now ready! 🎉
