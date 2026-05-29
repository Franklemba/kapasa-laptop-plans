# Setup Supabase Cloud Database

## Current Status
✅ Migrations are already pushed to cloud
✅ All tables exist in your Supabase cloud database
❌ No laptop data yet (catalog is empty)

## Step 1: Add Sample Laptops

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/rbgbttfxipzkjezekadd

2. Click **SQL Editor** in the left sidebar

3. Click **New Query**

4. Copy and paste the entire contents of `SUPABASE_CLOUD_SETUP.sql` file

5. Click **Run** (or press Cmd+Enter)

6. You should see a success message and a table showing 8 laptops

## Step 2: Verify Tables Exist

Run this query in SQL Editor:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see:
- ✅ clients
- ✅ laptop_images
- ✅ laptops
- ✅ payment_plans
- ✅ payments
- ✅ stock_movements

## Step 3: Verify Laptops Were Added

Run this query:

```sql
SELECT brand, model, price, stock_quantity, status
FROM public.laptops
ORDER BY brand;
```

You should see 8 laptops:
1. Acer Aspire 5 - ZMK 4,500
2. Apple MacBook Air M2 - ZMK 10,500
3. Apple MacBook Pro 16" - ZMK 15,000
4. ASUS ROG Strix G15 - ZMK 11,000
5. Dell XPS 15 - ZMK 12,000
6. HP Pavilion 15 - ZMK 6,000
7. Lenovo ThinkPad X1 Carbon - ZMK 13,500
8. Microsoft Surface Laptop 5 - ZMK 9,500

## Step 4: Create Admin Account

### Option A: Register on the website first

1. Go to your deployed site: https://fitech-cjyj.onrender.com
2. Click **Register**
3. Fill in your details (use your real email)
4. Complete registration

### Option B: Or use an existing account

If you already have an account (like fitech@gmail.com), skip to the next step.

### Make the account an admin

1. Go back to Supabase SQL Editor
2. Run this query (replace with your email):

```sql
UPDATE public.clients 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

3. Verify it worked:

```sql
SELECT email, role, first_name, last_name 
FROM public.clients 
WHERE role = 'admin';
```

4. **Important:** Logout and login again on the website for the admin role to take effect

## Step 5: Update Supabase Authentication Settings

1. In Supabase dashboard, go to **Authentication** → **URL Configuration**

2. Set **Site URL** to:
   ```
   https://fitech-cjyj.onrender.com
   ```

3. Add **Redirect URLs**:
   ```
   https://fitech-cjyj.onrender.com/**
   http://localhost:8080/**
   ```

4. Click **Save**

## Step 6: Test Your Application

1. Visit: https://fitech-cjyj.onrender.com

2. You should see:
   - ✅ Landing page loads
   - ✅ Laptop catalog shows 8 laptops
   - ✅ Can click on laptops to view details
   - ✅ Can register/login
   - ✅ Admin can access admin dashboard

## Troubleshooting

### Issue: Can't see laptops on the website

**Check 1:** Verify laptops exist in database
```sql
SELECT COUNT(*) FROM public.laptops WHERE status = 'active';
```
Should return 8.

**Check 2:** Check RLS policies
```sql
SELECT * FROM public.laptops LIMIT 1;
```
If this works in SQL Editor but not on website, it's an RLS issue.

**Solution:** Run this to allow public access to laptops:
```sql
-- This policy should already exist, but let's verify
SELECT * FROM pg_policies WHERE tablename = 'laptops';
```

### Issue: Can't login

**Check:** Verify user exists
```sql
SELECT email, created_at FROM auth.users;
```

**Check:** Verify client record exists
```sql
SELECT c.email, c.user_id, c.role 
FROM public.clients c
JOIN auth.users u ON c.user_id = u.id;
```

**Solution:** If user exists but no client record:
```sql
-- This should happen automatically via trigger, but if not:
INSERT INTO public.clients (user_id, email, first_name, last_name, role)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'first_name', 'User'),
  COALESCE(raw_user_meta_data->>'last_name', 'Name'),
  'client'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.clients WHERE user_id IS NOT NULL);
```

### Issue: Admin features not working

**Check:** Verify admin role
```sql
SELECT email, role FROM public.clients WHERE email = 'your-email@example.com';
```

**Solution:** Make sure role is 'admin' (not 'Admin' or 'ADMIN')
```sql
UPDATE public.clients SET role = 'admin' WHERE email = 'your-email@example.com';
```

Then **logout and login again**.

## Quick Test Checklist

After setup, test these features:

### Public Features (No Login Required)
- [ ] Landing page loads
- [ ] Can view laptop catalog
- [ ] Can click on laptop to see details
- [ ] Can register new account

### Client Features (Login Required)
- [ ] Can login with registered account
- [ ] Can view dashboard
- [ ] Can view profile
- [ ] Can browse laptops
- [ ] Can create payment plan request

### Admin Features (Admin Login Required)
- [ ] Can access admin dashboard
- [ ] Can see statistics
- [ ] Can view all clients
- [ ] Can approve/reject payment plans
- [ ] Can add new laptops
- [ ] Can manage stock

## Database Schema Summary

Your cloud database now has:

**Tables:**
- `clients` - User profiles (linked to auth.users)
- `laptops` - Laptop catalog
- `laptop_images` - Multiple images per laptop
- `payment_plans` - Payment plan requests
- `payments` - Individual payments
- `stock_movements` - Stock tracking

**Key Features:**
- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Proper foreign key relationships
- ✅ Triggers for auto-updating timestamps
- ✅ Trigger for linking auth.users to clients
- ✅ Admin and client role separation

## Next Steps

1. ✅ Add sample laptops (run SUPABASE_CLOUD_SETUP.sql)
2. ✅ Create admin account
3. ✅ Update Supabase Site URL
4. ✅ Test the application
5. 📝 Add real laptop data with images
6. 📝 Customize laptop descriptions
7. 📝 Set up email notifications (optional)
8. 📝 Configure custom domain (optional)

---

**Your Supabase Project:**
- URL: https://rbgbttfxipzkjezekadd.supabase.co
- Dashboard: https://supabase.com/dashboard/project/rbgbttfxipzkjezekadd
- SQL Editor: https://supabase.com/dashboard/project/rbgbttfxipzkjezekadd/sql

**Your Deployed App:**
- URL: https://fitech-cjyj.onrender.com
