# 🔐 Administrator Account Setup

## Quick Setup - Make Your Current Account Admin

If you already have an account (like **fitech@gmail.com**), make it admin:

```bash
docker exec supabase_db_kapasa-laptop-plans psql -U postgres -d postgres -c "UPDATE clients SET role = 'admin' WHERE email = 'fitech@gmail.com';"
```

Replace `fitech@gmail.com` with your actual email address.

## Create a New Admin Account

### Step 1: Register
1. Go to `/register` page
2. Create account with:
   - **Email:** admin@fitech.com (or any email)
   - **Password:** Your choice (remember it!)
   - **First Name:** Admin
   - **Last Name:** User

### Step 2: Make it Admin
After registration, run:
```bash
docker exec supabase_db_kapasa-laptop-plans psql -U postgres -d postgres -c "UPDATE clients SET role = 'admin' WHERE email = 'admin@fitech.com';"
```

### Step 3: Login
- Logout and login again with the admin account
- Navigate to `/admin` to access admin panel

## Check Current Admins

To see all admin accounts:
```bash
docker exec supabase_db_kapasa-laptop-plans psql -U postgres -d postgres -c "SELECT email, first_name, last_name, role FROM clients WHERE role = 'admin';"
```

## Admin Panel Access

Once you have an admin account:
1. Login with admin credentials
2. Navigate to `/admin` route
3. Access features:
   - **Dashboard** - Statistics and overview
   - **Manage Clients** - View all clients
   - **Pending Applications** - Approve/reject payment plans
   - **Record Payment** - Record client payments
   - **Inventory Management** - Manage laptop stock
   - **Stock Movements** - View stock history
   - **Client Payment History** - View payment records

## Admin Features

✅ View all clients and their payment plans  
✅ Approve or reject payment plan applications  
✅ Record payments for clients  
✅ Manage laptop inventory (add, edit, stock)  
✅ View stock movement history  
✅ Access comprehensive statistics  
✅ View client payment history  

## Security Notes

- Admin role is determined by `role = 'admin'` in the `clients` table
- Admin routes are protected by `RequireAdmin` component
- Only authenticated users with admin role can access admin panel
- RLS policies enforce admin-only access to sensitive operations

## Troubleshooting

### Can't access admin panel?
1. Check your role:
   ```bash
   docker exec supabase_db_kapasa-laptop-plans psql -U postgres -d postgres -c "SELECT email, role FROM clients WHERE email = 'your@email.com';"
   ```

2. If role is not 'admin', update it:
   ```bash
   docker exec supabase_db_kapasa-laptop-plans psql -U postgres -d postgres -c "UPDATE clients SET role = 'admin' WHERE email = 'your@email.com';"
   ```

3. Logout and login again

### Orphaned admin record?
The `goat@gmail.com` account exists in clients table but has no auth user. This is an orphaned record and can be ignored or deleted.
