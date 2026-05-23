# Local Database Setup Guide

This guide explains how to work with your restored Supabase database locally.

## ✅ Database Restoration Complete

Your Supabase backup has been successfully restored to your local development environment!

### Restored Data
- **1 client**
- **3 laptops**
- **2 stock movements**
- **0 laptop images**
- **0 payment plans**
- **0 payments**

## 🚀 Getting Started

### 1. Start Supabase (if not already running)

```bash
supabase start
```

### 2. Start Your React App

```bash
npm run dev
```

The app will automatically connect to your local Supabase instance using the configuration in `.env.local`.

## 🔧 Configuration

### Environment Files

- **`.env`** - Contains your production Supabase credentials (remote database)
- **`.env.local`** - Contains your local Supabase credentials (restored database)

Vite automatically prioritizes `.env.local` over `.env` during development, so your app will connect to the local database when you run `npm run dev`.

### Local Supabase URLs

- **API URL**: http://127.0.0.1:54321
- **Studio Dashboard**: http://127.0.0.1:54323
- **Database URL**: postgresql://postgres:postgres@127.0.0.1:54322/postgres
- **Mailpit (Email Testing)**: http://127.0.0.1:54324

## 📊 Accessing Your Data

### Via Studio Dashboard
Open http://127.0.0.1:54323 in your browser to:
- Browse tables and data
- Run SQL queries
- View table relationships
- Manage authentication

### Via psql (Command Line)
```bash
docker exec -it supabase_db_kapasa-laptop-plans psql -U postgres -d postgres
```

Then you can run SQL queries:
```sql
-- View all clients
SELECT * FROM public.clients;

-- View all laptops
SELECT * FROM public.laptops;

-- View stock movements
SELECT * FROM public.stock_movements;
```

### Via Your React App
Your app is now configured to use the local database. All queries will run against your restored data.

## 🔄 Switching Between Local and Production

### Use Local Database (Development)
```bash
npm run dev
```
This uses `.env.local` automatically.

### Use Production Database
Temporarily rename or remove `.env.local`:
```bash
mv .env.local .env.local.backup
npm run dev
```

Or set environment variables explicitly:
```bash
VITE_SUPABASE_URL=https://lxlammhsylusuvpkfdsd.supabase.co npm run dev
```

## 🛠️ Useful Commands

### Check Supabase Status
```bash
supabase status
```

### Stop Supabase
```bash
supabase stop
```

### Reset Database (⚠️ This will delete all data)
```bash
supabase db reset
```

### View Supabase Logs
```bash
supabase logs
```

### Export Data
```bash
# Export a specific table to CSV
docker exec supabase_db_kapasa-laptop-plans psql -U postgres -d postgres -c "\COPY public.laptops TO '/tmp/laptops.csv' CSV HEADER"
docker cp supabase_db_kapasa-laptop-plans:/tmp/laptops.csv ./laptops.csv
```

## 📝 Database Schema

Your restored database includes these main tables:

### Public Schema (Your App Tables)
- `clients` - Customer information
- `laptops` - Laptop inventory
- `laptop_images` - Laptop product images
- `payment_plans` - Payment plan configurations
- `payments` - Payment records
- `stock_movements` - Inventory tracking

### Supabase System Tables
- `auth.*` - Authentication and user management
- `storage.*` - File storage metadata
- `realtime.*` - Real-time subscriptions

## 🔐 Authentication

The local Supabase instance uses default credentials:
- **Database User**: postgres
- **Database Password**: postgres
- **JWT Secret**: super-secret-jwt-token-with-at-least-32-characters-long

⚠️ **Never use these credentials in production!**

## 📦 Storage

Your storage backup was empty, so no files were restored. If you need to add files:

1. Go to Studio Dashboard: http://127.0.0.1:54323
2. Navigate to Storage
3. Create buckets and upload files as needed

## 🐛 Troubleshooting

### App can't connect to database
1. Make sure Supabase is running: `supabase status`
2. Check that `.env.local` exists and has the correct values
3. Restart your dev server: `npm run dev`

### Supabase won't start
1. Check if Docker is running
2. Stop and restart: `supabase stop && supabase start`
3. Check Docker logs: `docker logs supabase_db_kapasa-laptop-plans`

### Data is missing
The backup was restored successfully. If you don't see data:
1. Check the correct table in Studio Dashboard
2. Verify you're connected to the local database (check the URL in your app)
3. Run a direct SQL query to confirm data exists

## 📚 Additional Resources

- [Supabase Local Development Docs](https://supabase.com/docs/guides/cli/local-development)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli/introduction)
- [Supabase JavaScript Client Docs](https://supabase.com/docs/reference/javascript/introduction)

## ⚠️ Important Notes

1. **Local data is temporary** - If you run `supabase db reset` or remove Docker volumes, your data will be lost
2. **Backup files are preserved** - Your original backup files are still in the project root
3. **Production safety** - `.env.local` is gitignored, so your local config won't be committed
4. **Development only** - This local setup is not production-ready and should only be used for development

---

**Need help?** Check the Supabase documentation or run `supabase --help` for more commands.
