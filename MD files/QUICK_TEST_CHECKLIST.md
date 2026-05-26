# ⚡ Quick Test Checklist

## Before Each Test Session

```bash
# 1. Start Supabase
supabase status

# 2. Start dev server
npm run dev

# 3. Open browser
# http://localhost:5173
```

---

## ✅ Phase 1-4: COMPLETED (Test These First)

### Quick Smoke Test (5 minutes)

**As Visitor:**
1. ✅ Browse catalog without login
2. ✅ View laptop details
3. ✅ See "Sign In to Apply" button

**As New User:**
1. ✅ Register account (testclient@example.com / Test123!)
2. ✅ Complete profile
3. ✅ Apply for payment plan
4. ✅ See plan on dashboard

**As Admin:**
1. ✅ Login (goat@gmail.com)
2. ✅ Access admin dashboard
3. ✅ View inventory
4. ✅ Manage clients

**Database Check:**
```bash
# Verify payment plan created
docker exec supabase_db_kapasa-laptop-plans psql -U postgres -d postgres -c "SELECT COUNT(*) FROM payment_plans WHERE status = 'pending';"
```

**Expected:** At least 1 pending plan

---

## ⏳ Phase 5: Payment Plan Approval (Test After Implementation)

### Quick Test (10 minutes)

**As Admin:**
1. ⏳ Go to /admin/pending-applications
2. ⏳ See pending plans
3. ⏳ Click "Approve" on one
4. ⏳ Verify success message

**As Client:**
1. ⏳ Login as testclient
2. ⏳ Check dashboard
3. ⏳ Verify plan status = "active"

**Database Check:**
```bash
# Verify status changed
docker exec supabase_db_kapasa-laptop-plans psql -U postgres -d postgres -c "SELECT status FROM payment_plans WHERE client_id = (SELECT id FROM clients WHERE email = 'testclient@example.com');"
```

**Expected:** status = 'active'

```bash
# Verify stock reduced
docker exec supabase_db_kapasa-laptop-plans psql -U postgres -d postgres -c "SELECT * FROM stock_movements WHERE movement_type = 'sold' ORDER BY created_at DESC LIMIT 1;"
```

**Expected:** Recent 'sold' movement

---

## ⏳ Phase 6: Payment Recording (Test After Implementation)

### Quick Test (10 minutes)

**As Admin:**
1. ⏳ Go to /admin/record-payment
2. ⏳ Select client
3. ⏳ Select payment plan
4. ⏳ Enter amount (K200)
5. ⏳ Record payment

**As Client:**
1. ⏳ Go to /payment-history
2. ⏳ See payment recorded

**Database Check:**
```bash
# Verify payment recorded
docker exec supabase_db_kapasa-laptop-plans psql -U postgres -d postgres -c "SELECT COUNT(*) FROM payments;"
```

**Expected:** At least 1 payment

```bash
# Verify amount_paid updated
docker exec supabase_db_kapasa-laptop-plans psql -U postgres -d postgres -c "SELECT amount_paid FROM payment_plans WHERE id = '[PLAN_ID]';"
```

**Expected:** amount_paid increased

---

## ⏳ Phase 7: Stock Management (Test After Implementation)

### Quick Test (5 minutes)

**Check Stock Reduction:**
```bash
# Before approval
docker exec supabase_db_kapasa-laptop-plans psql -U postgres -d postgres -c "SELECT stock_quantity FROM laptops WHERE id = '[LAPTOP_ID]';"

# Approve a plan for this laptop

# After approval
docker exec supabase_db_kapasa-laptop-plans psql -U postgres -d postgres -c "SELECT stock_quantity FROM laptops WHERE id = '[LAPTOP_ID]';"
```

**Expected:** Stock reduced by 1

---

## 🔥 Critical Tests (Must Pass)

### Security Tests
- [ ] Client cannot access /admin
- [ ] Unauthenticated cannot access /dashboard
- [ ] Admin can access all admin routes
- [ ] Data isolation (clients see only their data)

### Data Integrity Tests
- [ ] Payment plan saves to database
- [ ] Status changes persist
- [ ] Stock updates correctly
- [ ] Payments record properly

### User Experience Tests
- [ ] Public browsing works
- [ ] Registration flow smooth
- [ ] Dashboard shows real data
- [ ] No errors in console

---

## 🐛 Common Issues & Fixes

### Issue: "Access Denied" for admin
**Fix:**
```bash
docker exec supabase_db_kapasa-laptop-plans psql -U postgres -d postgres -c "UPDATE clients SET role = 'admin' WHERE email = 'goat@gmail.com';"
```

### Issue: No payment plans showing
**Fix:** Apply for a plan first, or check:
```bash
docker exec supabase_db_kapasa-laptop-plans psql -U postgres -d postgres -c "SELECT * FROM payment_plans;"
```

### Issue: Supabase not running
**Fix:**
```bash
supabase stop
supabase start
```

### Issue: Port already in use
**Fix:**
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
npm run dev
```

---

## 📊 Test Results Template

```markdown
## Test Session: [DATE]

### Environment
- Supabase: ✅ Running
- Dev Server: ✅ Running
- Browser: Chrome 120

### Phase 1-4 Results
- Public Browsing: ✅ PASS
- Registration: ✅ PASS
- Payment Plan Creation: ✅ PASS
- RBAC: ✅ PASS
- Dashboard Data: ✅ PASS

### Phase 5 Results (After Implementation)
- View Pending: ⏳ NOT TESTED
- Approve Plan: ⏳ NOT TESTED
- Reject Plan: ⏳ NOT TESTED
- Stock Reduction: ⏳ NOT TESTED

### Phase 6 Results (After Implementation)
- Record Payment: ⏳ NOT TESTED
- Payment History: ⏳ NOT TESTED
- Plan Completion: ⏳ NOT TESTED

### Phase 7 Results (After Implementation)
- Stock Management: ⏳ NOT TESTED
- Low Stock Alert: ⏳ NOT TESTED

### Bugs Found
1. [None / List bugs]

### Notes
[Any observations]
```

---

## 🎯 Quick Database Queries

### Check Everything
```bash
# All payment plans
docker exec supabase_db_kapasa-laptop-plans psql -U postgres -d postgres -c "SELECT pp.id, c.email, l.name, pp.status, pp.amount_paid, pp.total_amount FROM payment_plans pp JOIN clients c ON pp.client_id = c.id JOIN laptops l ON pp.laptop_id = l.id;"

# All clients
docker exec supabase_db_kapasa-laptop-plans psql -U postgres -d postgres -c "SELECT email, first_name, last_name, role FROM clients;"

# All payments
docker exec supabase_db_kapasa-laptop-plans psql -U postgres -d postgres -c "SELECT p.amount, p.payment_date, pp.id as plan_id FROM payments p JOIN payment_plans pp ON p.payment_plan_id = pp.id;"

# Stock levels
docker exec supabase_db_kapasa-laptop-plans psql -U postgres -d postgres -c "SELECT name, stock_quantity, min_stock_level FROM laptops ORDER BY stock_quantity;"
```

### Reset Test Data (Use Carefully!)
```bash
# Delete all payment plans
docker exec supabase_db_kapasa-laptop-plans psql -U postgres -d postgres -c "DELETE FROM payment_plans WHERE client_id IN (SELECT id FROM clients WHERE email LIKE '%test%');"

# Delete test clients
docker exec supabase_db_kapasa-laptop-plans psql -U postgres -d postgres -c "DELETE FROM clients WHERE email LIKE '%test%';"
```

---

## ✅ Sign-Off Checklist

Before marking a phase complete:

- [ ] All tests passed
- [ ] No critical bugs
- [ ] Database state verified
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] Screenshots taken (if needed)

---

**Use this checklist for quick daily testing!** 🚀
