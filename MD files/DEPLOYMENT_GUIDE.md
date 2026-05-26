# Deployment Guide - Render + Supabase

This guide will help you deploy the fiTech Laptop Payment Plans application to Render with Supabase as the database backend.

## Prerequisites

- GitHub account
- Render account (free tier available at https://render.com)
- Supabase account (free tier available at https://supabase.com)
- Git installed locally

## Part 1: Setup Supabase Cloud Database

### Step 1: Create Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Fill in project details:
   - **Name:** fitech-laptop-plans
   - **Database Password:** Choose a strong password (save this!)
   - **Region:** Choose closest to your users
   - **Pricing Plan:** Free tier is fine to start
4. Click "Create new project"
5. Wait 2-3 minutes for project to be provisioned

### Step 2: Get Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy these values (you'll need them later):
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (the long JWT token)

### Step 3: Run Database Migrations

You have two options:

#### Option A: Using Supabase CLI (Recommended)

```bash
# Link to your cloud project
supabase link --project-ref your-project-ref

# Push migrations to cloud
supabase db push
```

#### Option B: Manual SQL Execution

1. Go to **SQL Editor** in Supabase dashboard
2. Copy and paste each migration file from `supabase/migrations/` in order:
   - `20250101000000_initial_schema.sql`
   - `20250522120000_fix_client_user_id_trigger.sql`
   - `20250522121000_fix_payment_plans_rls.sql`
   - `20250522122000_fix_all_rls_policies.sql`
   - `20250522123000_add_pending_status.sql`
   - `20250522124000_fix_auth_users_policies.sql`
   - `20250522125000_add_notes_column.sql`
3. Run each migration in order

### Step 4: Verify Database Setup

Run this query in SQL Editor to verify tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see: `clients`, `laptops`, `laptop_images`, `payment_plans`, `payments`, `stock_movements`

## Part 2: Push Code to GitHub

### Step 1: Initialize Git Repository (if not already done)

```bash
cd /Users/user/projects/Uncle_kapasa_project/kapasa-laptop-plans

# Initialize git if needed
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - fiTech Laptop Plans"
```

### Step 2: Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository:
   - **Name:** fitech-laptop-plans
   - **Visibility:** Private (recommended) or Public
   - **Don't** initialize with README (you already have one)
3. Click "Create repository"

### Step 3: Push to GitHub

```bash
# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/fitech-laptop-plans.git

# Push code
git branch -M main
git push -u origin main
```

## Part 3: Deploy to Render

### Step 1: Create Render Account

1. Go to https://render.com
2. Sign up with GitHub (recommended for easy integration)
3. Authorize Render to access your GitHub repositories

### Step 2: Create New Static Site

1. Click "New +" button → "Static Site"
2. Connect your GitHub repository:
   - Find and select `fitech-laptop-plans`
   - Click "Connect"

### Step 3: Configure Build Settings

Fill in these settings:

- **Name:** `fitech-laptop-plans` (or your preferred name)
- **Branch:** `main`
- **Root Directory:** (leave empty)
- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `dist`

### Step 4: Add Environment Variables

Click "Advanced" and add these environment variables:

1. **VITE_SUPABASE_URL**
   - Value: Your Supabase Project URL (from Part 1, Step 2)
   - Example: `https://xxxxx.supabase.co`

2. **VITE_SUPABASE_ANON_KEY**
   - Value: Your Supabase anon public key (from Part 1, Step 2)
   - Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Step 5: Deploy

1. Click "Create Static Site"
2. Render will automatically:
   - Clone your repository
   - Install dependencies
   - Build the application
   - Deploy to a URL like `https://fitech-laptop-plans.onrender.com`
3. Wait 3-5 minutes for first deployment

### Step 6: Configure Custom Domain (Optional)

1. In Render dashboard, go to your site settings
2. Click "Custom Domains"
3. Add your domain (e.g., `app.fitech.com`)
4. Follow DNS configuration instructions
5. Render provides free SSL certificates

## Part 4: Post-Deployment Setup

### Step 1: Update Supabase Site URL

1. Go to Supabase dashboard → **Authentication** → **URL Configuration**
2. Add your Render URL to **Site URL**: `https://fitech-laptop-plans.onrender.com`
3. Add to **Redirect URLs**:
   - `https://fitech-laptop-plans.onrender.com/**`
   - `http://localhost:8080/**` (for local development)

### Step 2: Create Admin Account

1. Visit your deployed site
2. Register a new account
3. In Supabase SQL Editor, run:
   ```sql
   UPDATE clients SET role = 'admin' WHERE email = 'your@email.com';
   ```
4. Logout and login again

### Step 3: Add Sample Data (Optional)

Add some laptops to the catalog:

```sql
INSERT INTO laptops (name, brand, model, processor, ram, storage, display, price, weekly_payment, condition, stock_quantity, status)
VALUES 
  ('MacBook Pro 16"', 'Apple', 'MacBook Pro', 'M2 Pro', '16GB', '512GB SSD', '16-inch Retina', 15000, 500, 'new', 5, 'active'),
  ('Dell XPS 15', 'Dell', 'XPS 15', 'Intel Core i7', '16GB DDR4', '512GB SSD', '15.6-inch FHD', 12000, 400, 'new', 8, 'active'),
  ('HP Pavilion', 'HP', 'Pavilion 15', 'Intel Core i5', '8GB DDR4', '256GB SSD', '15.6-inch HD', 6000, 200, 'refurbished', 10, 'active');
```

## Part 5: Continuous Deployment

Render automatically redeploys when you push to GitHub:

```bash
# Make changes to your code
git add .
git commit -m "Your commit message"
git push origin main

# Render will automatically detect the push and redeploy
```

## Troubleshooting

### Build Fails

**Error:** "Module not found"
- **Solution:** Make sure all dependencies are in `package.json`
- Run `npm install` locally to verify

**Error:** "Build command failed"
- **Solution:** Check build logs in Render dashboard
- Verify `npm run build` works locally

### App Loads But Shows Errors

**Error:** "Failed to fetch"
- **Solution:** Check environment variables are set correctly
- Verify Supabase URL and anon key

**Error:** "Invalid API key"
- **Solution:** Regenerate anon key in Supabase and update in Render

### Authentication Issues

**Error:** "Email not confirmed"
- **Solution:** In Supabase → **Authentication** → **Settings**
- Disable "Enable email confirmations" for testing

**Error:** "Redirect URL not allowed"
- **Solution:** Add your Render URL to Supabase redirect URLs

### Database Connection Issues

**Error:** "relation does not exist"
- **Solution:** Run all migrations in Supabase SQL Editor
- Verify tables exist with the query in Part 1, Step 4

## Monitoring & Maintenance

### View Logs

1. Go to Render dashboard
2. Click on your service
3. Click "Logs" tab
4. View real-time deployment and runtime logs

### Monitor Database

1. Go to Supabase dashboard
2. **Database** → **Tables** - View data
3. **Database** → **Logs** - View query logs
4. **Auth** → **Users** - Manage users

### Backup Database

Supabase automatically backs up your database daily on paid plans. For free tier:

```bash
# Export data using Supabase CLI
supabase db dump -f backup.sql
```

## Cost Estimates

### Free Tier Limits

**Render (Free):**
- Static sites: Unlimited
- Bandwidth: 100GB/month
- Build minutes: 500/month
- Auto-sleep after 15 min inactivity

**Supabase (Free):**
- Database: 500MB
- Bandwidth: 5GB
- API requests: Unlimited
- Auth users: Unlimited

### Upgrade Recommendations

Consider upgrading when:
- **Render:** Need custom domain, more bandwidth, or no auto-sleep
- **Supabase:** Database > 500MB, need daily backups, or > 5GB bandwidth

## Security Checklist

- [ ] Environment variables set in Render (not in code)
- [ ] Supabase RLS policies enabled on all tables
- [ ] Redirect URLs configured in Supabase
- [ ] Strong database password used
- [ ] Admin accounts secured with strong passwords
- [ ] `.env` files in `.gitignore` (never commit secrets)

## Support

- **Render Docs:** https://render.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **GitHub Issues:** Create issues in your repository

## Next Steps

1. Set up monitoring and alerts
2. Configure custom domain
3. Add more laptops to catalog
4. Test payment plan workflow
5. Create user documentation
6. Set up analytics (optional)

---

**Deployment Complete!** 🎉

Your fiTech Laptop Payment Plans application is now live and accessible to users worldwide.
