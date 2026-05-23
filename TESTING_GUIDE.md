# 🧪 Comprehensive Testing Guide
## Kapasa Laptop Payment Plans System

---

## 📋 Table of Contents
1. [Testing Environment Setup](#testing-environment-setup)
2. [Phase 1: Public Browsing & Authentication](#phase-1-public-browsing--authentication)
3. [Phase 2: Payment Plan Creation](#phase-2-payment-plan-creation)
4. [Phase 3: Role-Based Access Control](#phase-3-role-based-access-control)
5. [Phase 4: Real Dashboard Data](#phase-4-real-dashboard-data)
6. [Phase 5: Payment Plan Approval](#phase-5-payment-plan-approval)
7. [Phase 6: Payment Recording](#phase-6-payment-recording)
8. [Phase 7: Stock Management](#phase-7-stock-management)
9. [Regression Testing](#regression-testing)
10. [Performance Testing](#performance-testing)

---

## Testing Environment Setup

### Prerequisites
```bash
# 1. Start Supabase
cd /Users/user/projects/Uncle_kapasa_project/kapasa-laptop-plans
supabase status

# 2. Start development server
npm run dev

# 3. Open browser
# Navigate to: http://localhost:5173
```

### Test Accounts

**Admin Account:**
- Email: goat@gmail.com
- Password: [Your chosen password]
- Role: admin

**Test Client Account (Create during testing):**
- Email: testclient@example.com
- Password: Test123!
- Role: client

### Database Verification Commands
```bash
# Check payment plans
docker exec supabase_db_kapasa-laptop-plans psql -U postgres -d postgres -c "SELECT id, status, client_id, laptop_id, total_amount, amount_paid FROM payment_plans;"

# Check clients
docker exec supabase_db_kapasa-laptop-plans psql -U postgres -d postgres -c "SELECT id, first_name, last_name, email, role FROM clients;"

# Check laptops
docker exec supabase_db_kapasa-laptop-plans psql -U postgres -d postgres -c "SELECT id, name, brand, price, stock_quantity FROM laptops;"

# Check payments
docker exec supabase_db_kapasa-laptop-plans psql -U postgres -d postgres -c "SELECT * FROM payments;"
```

---

## Phase 1: Public Browsing & Authentication

### ✅ Test 1.1: Public Catalog Access (Unauthenticated)

**Objective:** Verify users can browse laptops without signing in

**Steps:**
1. Open browser in incognito/private mode
2. Navigate to http://localhost:5173
3. Click "Browse Laptops" button on landing page
4. Verify catalog page loads successfully
5. Verify you can see laptop cards with:
   - Laptop images
   - Names and brands
   - Prices
   - "From K[amount]/week" text
6. Test search functionality:
   - Type "Apple" in search box
   - Verify results filter correctly
7. Test price filters:
   - Click "Under K4000"
   - Verify only laptops under K4000 show
   - Click "All Prices"
   - Verify all laptops return

**Expected Results:**
- ✅ Catalog accessible without login
- ✅ All laptops visible
- ✅ Search works
- ✅ Filters work
- ✅ No authentication required

**Code Verification:**
```bash
# Check route is public in App.tsx
grep -A 2 'path="/catalog"' src/App.tsx
# Should NOT be wrapped in <RequireAuth>
```

---

### ✅ Test 1.2: Laptop Details (Unauthenticated)

**Objective:** Verify users can view laptop details without signing in

**Steps:**
1. From catalog, click on any laptop card
2. Verify laptop details page loads with:
   - Large laptop image
   - Full specifications (Processor, RAM, Storage, Display)
   - Price information
   - Payment calculator
3. Scroll to bottom
4. Verify button shows: "Sign In to Apply for Payment Plan"
5. Click the button
6. Verify redirected to login page

**Expected Results:**
- ✅ Details page accessible
- ✅ All information visible
- ✅ Calculator works
- ✅ "Sign In" button shows for unauthenticated users
- ✅ Redirects to login when clicked

**Code Verification:**
```bash
# Check authentication state handling
grep -A 5 "isAuthenticated" src/pages/Client/LaptopDetails.tsx
```

---

### ✅ Test 1.3: User Registration

**Objective:** Verify new users can register successfully

**Steps:**
1. Navigate to http://localhost:5173/register
2. Fill in registration form:
   - Email: testclient@example.com
   - Password: Test123!
   - Confirm Password: Test123!
3. Click "Sign Up"
4. Verify redirected to complete profile page
5. Fill in profile form:
   - First Name: Test
   - Last Name: Client
   - Phone: 0971234567
   - Address: 123 Test Street
   - Employment Status: Employed
   - Monthly Income: 5000
6. Click "Complete Profile"
7. Verify redirected to dashboard

**Expected Results:**
- ✅ Registration form validates inputs
- ✅ Account created successfully
- ✅ Profile completion required
- ✅ Redirected to dashboard after completion

**Database Verification:**
```bash
# Check user was created
docker exec supabase_db_kapasa-laptop-plans psql -U postgres -d postgres -c "SELECT email, created_at FROM auth.users WHERE email = 'testclient@example.com';"

# Check client profile was created
docker exec supabase_db_kapasa-laptop-plans psql -U postgres -d postgres -c "SELECT first_name, last_name, email, role FROM clients WHERE email = 'testclient@example.com';"
```

**Expected Database State:**
- ✅ User exists in auth.users
- ✅ Client profile exists in clients table
- ✅ Role is 'client' (not admin)
- ✅ user_id is linked

---

### ✅ Test 1.4: User Login

**Objective:** Verify users can login successfully

**Steps:**
1. Logout (if logged in)
2. Navigate to http://localhost:5173/login
3. Enter credentials:
   - Email: testclient@example.com
   - Password: Test123!
4. Click "Sign In"
5. Verify redirected to dashboard
6. Verify user name appears in dashboard

**Expected Results:**
- ✅ Login successful
- ✅ Redirected to dashboard
- ✅ User session persists on page refresh

---

## Phase 2: Payment Plan Creation

### ✅ Test 2.1: Apply for Payment Plan (Authenticated)

**Objective:** Verify payment plan application saves to database

**Steps:**
1. Login as testclient@example.com
2. Navigate to catalog
3. Click on any laptop
4. Adjust payment calculator:
   - Weekly Payment: K200
   - Down Payment: K500
   - Loan Term: 26 weeks
5. Click "Apply for Payment Plan"
6. Verify redirected to application form
7. Verify form pre-populated with:
   - Your name
   - Your email
   - Your phone
8. Fill in additional fields:
   - Date of Birth: 01/01/1990
   - Employer: Test Company
   - Job Title: Developer
   - Employment Length: 2 years
   - Bank Name: Test Bank
   - Account Type: Savings
   - Monthly Expenses: 2000
   - Reason for Purchase: Work
9. Check both agreement checkboxes
10. Click "Submit Application"
11. Verify success toast appears
12. Verify redirected to dashboard

**Expected Results:**
- ✅ Form loads with pre-populated data
- ✅ All fields validate correctly
- ✅ Submission successful
- ✅ Success message shown
- ✅ Redirected to dashboard

**Database Verification:**
```bash
# Check payment plan was created
docker exec supabase_db_kapasa-laptop-plans psql -U postgres -d postgres -c "SELECT pp.id, pp.status, pp.weekly_payment, pp.total_amount, pp.amount_paid, c.email, l.name FROM payment_plans pp JOIN clients c ON pp.client_id = c.id JOIN laptops l ON pp.laptop_id = l.id WHERE c.email = 'testclient@example.com';"
```

**Expected Database State:**
- ✅ Payment plan exists in payment_plans table
- ✅ Status is 'pending'
- ✅ client_id matches testclient
- ✅ laptop_id is correct
- ✅ weekly_payment = 200
- ✅ total_amount = (200 * 26) + 500 = 5700
- ✅ amount_paid = 500 (down payment)

---

### ✅ Test 2.2: Multiple Payment Plans

**Objective:** Verify users can apply for multiple plans

**Steps:**
1. Login as testclient@example.com
2. Apply for a second payment plan (different laptop)
3. Complete application
4. Navigate to dashboard
5. Go to "Payments" tab
6. Verify both payment plans are listed

**Expected Results:**
- ✅ Can apply for multiple plans
- ✅ All plans show in dashboard
- ✅ Each plan has correct status

**Database Verification:**
```bash
# Check multiple plans exist
docker exec supabase_db_kapasa-laptop-plans psql -U postgres -d postgres -c "SELECT COUNT(*) as plan_count FROM payment_plans WHERE client_id = (SELECT id FROM clients WHERE email = 'testclient@example.com');"
```

**Expected:** plan_count >= 2

---

### ✅ Test 2.3: Payment Plan Validation

**Objective:** Verify form validation works correctly

**Steps:**
1. Navigate to apply for payment plan
2. Try to submit without checking agreements
3. Verify error message appears
4. Try to submit with empty required fields
5. Verify validation errors show

**Expected Results:**
- ✅ Cannot submit without agreements
- ✅ Required fields validated
- ✅ Error messages clear and helpful

---


## Phase 3: Role-Based Access Control

### ✅ Test 3.1: Admin Access (Admin User)

**Objective:** Verify admin can access admin routes

**Steps:**
1. Logout from testclient account
2. Login as admin:
   - Email: goat@gmail.com
   - Password: [Your password]
3. Navigate to http://localhost:5173/admin
4. Verify admin dashboard loads successfully
5. Try accessing:
   - /inventory
   - /add-laptop
   - /stock-movements
   - /manage-clients
6. Verify all pages load without errors

**Expected Results:**
- ✅ Admin can access all admin routes
- ✅ No "Access Denied" messages
- ✅ All admin pages functional

**Database Verification:**
```bash
# Verify admin role
docker exec supabase_db_kapasa-laptop-plans psql -U postgres -d postgres -c "SELECT email, role FROM clients WHERE email = 'goat@gmail.com';"
```

**Expected:** role = 'admin'

---

### ✅ Test 3.2: Client Access Restriction

**Objective:** Verify regular clients cannot access admin routes

**Steps:**
1. Logout from admin account
2. Login as testclient@example.com
3. Try to navigate to http://localhost:5173/admin
4. Verify "Access Denied" page appears
5. Verify message: "You don't have permission to access this page"
6. Click "Go to Dashboard" button
7. Verify redirected to client dashboard
8. Try accessing other admin routes directly:
   - http://localhost:5173/inventory
   - http://localhost:5173/add-laptop
9. Verify all show "Access Denied"

**Expected Results:**
- ✅ Client cannot access admin routes
- ✅ "Access Denied" page shows
- ✅ Redirected to dashboard
- ✅ No admin functionality visible

**Code Verification:**
```bash
# Check RequireAdmin wrapper exists
grep -A 3 "RequireAdmin" src/App.tsx | grep -E "(admin|inventory|add-laptop|manage-clients)"
```

---

### ✅ Test 3.3: Unauthenticated Admin Access

**Objective:** Verify unauthenticated users cannot access admin routes

**Steps:**
1. Logout completely
2. Try to navigate to http://localhost:5173/admin
3. Verify redirected to login page
4. Try other admin routes
5. Verify all redirect to login

**Expected Results:**
- ✅ Redirected to login
- ✅ Cannot access admin routes without auth
- ✅ After login, appropriate access based on role

---

### ✅ Test 3.4: Role Persistence

**Objective:** Verify role persists across sessions

**Steps:**
1. Login as admin
2. Access admin dashboard
3. Refresh page
4. Verify still on admin dashboard
5. Close browser
6. Reopen and navigate to site
7. Verify still logged in as admin

**Expected Results:**
- ✅ Role persists on refresh
- ✅ Session maintained
- ✅ Admin access retained

---

## Phase 4: Real Dashboard Data

### ✅ Test 4.1: Dashboard with Payment Plans

**Objective:** Verify dashboard shows real payment plan data

**Steps:**
1. Login as testclient@example.com (should have payment plans from Phase 2)
2. Navigate to dashboard
3. Verify "Overview" tab shows:
   - Payment Progress card with correct laptop name
   - Correct total amount
   - Correct amount paid
   - Correct progress percentage
   - Correct remaining amount
   - Correct payments remaining
4. Verify "Next Payment" card shows:
   - Correct weekly payment amount
   - Calculated next payment date
5. Verify "Stats" card shows:
   - Plan status (pending/active)
   - Plan duration in weeks
   - Weekly amount

**Expected Results:**
- ✅ All data matches database
- ✅ Calculations are correct
- ✅ No mock data visible
- ✅ Real-time data from database

**Database Verification:**
```bash
# Get payment plan details
docker exec supabase_db_kapasa-laptop-plans psql -U postgres -d postgres -c "SELECT pp.*, l.name as laptop_name FROM payment_plans pp JOIN laptops l ON pp.laptop_id = l.id WHERE pp.client_id = (SELECT id FROM clients WHERE email = 'testclient@example.com') ORDER BY pp.created_at DESC LIMIT 1;"
```

**Manual Verification:**
- Compare dashboard values with database output
- Verify progress = (amount_paid / total_amount) * 100
- Verify remaining = total_amount - amount_paid
- Verify payments_remaining = CEIL(remaining / weekly_payment)

---

### ✅ Test 4.2: Dashboard Empty State

**Objective:** Verify dashboard shows empty state when no plans

**Steps:**
1. Create a new test account:
   - Email: newuser@example.com
   - Password: Test123!
2. Complete profile
3. Navigate to dashboard
4. Verify empty state shows:
   - Laptop icon
   - "No Active Payment Plans" message
   - "Browse Laptops" button
5. Click "Browse Laptops"
6. Verify redirected to catalog

**Expected Results:**
- ✅ Empty state displays correctly
- ✅ Helpful message shown
- ✅ CTA button works
- ✅ No errors or crashes

---

### ✅ Test 4.3: Dashboard Profile Tab

**Objective:** Verify profile tab shows real user data

**Steps:**
1. Login as testclient@example.com
2. Navigate to dashboard
3. Click "Profile" tab
4. Verify displays:
   - Full name (Test Client)
   - Email (testclient@example.com)
   - Phone number
   - Account status
   - Address (if provided)

**Expected Results:**
- ✅ All profile data correct
- ✅ Matches database
- ✅ No placeholder data

**Database Verification:**
```bash
# Get client profile
docker exec supabase_db_kapasa-laptop-plans psql -U postgres -d postgres -c "SELECT first_name, last_name, email, phone, address, status FROM clients WHERE email = 'testclient@example.com';"
```

---

### ✅ Test 4.4: Dashboard Payments Tab

**Objective:** Verify payments tab shows all payment plans

**Steps:**
1. Login as testclient@example.com
2. Navigate to dashboard
3. Click "Payments" tab
4. Verify all payment plans listed with:
   - Laptop name
   - Start date
   - Amount paid / Total amount
   - Status badge (pending/active/completed)
5. Verify plans ordered by date (newest first)

**Expected Results:**
- ✅ All plans visible
- ✅ Correct information displayed
- ✅ Status badges colored correctly
- ✅ Ordered properly

---

### ✅ Test 4.5: Dashboard Loading States

**Objective:** Verify loading states work correctly

**Steps:**
1. Logout and login again
2. Watch dashboard load
3. Verify loading spinner shows briefly
4. Verify smooth transition to data

**Expected Results:**
- ✅ Loading state visible
- ✅ No flash of wrong content
- ✅ Smooth user experience

---

## Phase 5: Payment Plan Approval

### ✅ Test 5.1: View Pending Applications (Admin)

**Objective:** Verify admin can see pending payment plan applications

**Steps:**
1. Login as admin (goat@gmail.com)
2. Navigate to http://localhost:5173/admin/pending-applications
3. Verify page shows list of pending applications
4. For each application, verify displays:
   - Client name
   - Client email
   - Laptop name
   - Weekly payment amount
   - Total amount
   - Application date
   - Status badge (pending)
   - Action buttons (Approve/Reject)

**Expected Results:**
- ✅ All pending applications visible
- ✅ Complete information shown
- ✅ Action buttons present

**Database Verification:**
```bash
# Get pending applications
docker exec supabase_db_kapasa-laptop-plans psql -U postgres -d postgres -c "SELECT pp.id, c.first_name, c.last_name, c.email, l.name as laptop, pp.weekly_payment, pp.total_amount, pp.status FROM payment_plans pp JOIN clients c ON pp.client_id = c.id JOIN laptops l ON pp.laptop_id = l.id WHERE pp.status = 'pending' ORDER BY pp.created_at DESC;"
```

---

### ✅ Test 5.2: Approve Payment Plan

**Objective:** Verify admin can approve payment plans

**Steps:**
1. Login as admin
2. Navigate to pending applications
3. Select a pending application
4. Click "Approve" button
5. Verify confirmation dialog appears
6. Confirm approval
7. Verify success toast appears
8. Verify application removed from pending list
9. Logout and login as the client whose plan was approved
10. Navigate to dashboard
11. Verify plan status changed to "active"
12. Verify "Make Payment" button is now enabled

**Expected Results:**
- ✅ Approval successful
- ✅ Status updated to 'active'
- ✅ Client can see active status
- ✅ Payment button enabled

**Database Verification:**
```bash
# Check status changed
docker exec supabase_db_kapasa-laptop-plans psql -U postgres -d postgres -c "SELECT id, status FROM payment_plans WHERE id = '[PLAN_ID]';"
```

**Expected:** status = 'active'

---

### ✅ Test 5.3: Reject Payment Plan

**Objective:** Verify admin can reject payment plans

**Steps:**
1. Login as admin
2. Navigate to pending applications
3. Select a pending application
4. Click "Reject" button
5. Verify confirmation dialog appears
6. Optionally enter rejection reason
7. Confirm rejection
8. Verify success toast appears
9. Verify application removed from pending list
10. Logout and login as the client
11. Navigate to dashboard
12. Verify plan status shows "cancelled"

**Expected Results:**
- ✅ Rejection successful
- ✅ Status updated to 'cancelled'
- ✅ Client can see cancelled status
- ✅ Reason stored (if provided)

**Database Verification:**
```bash
# Check status changed
docker exec supabase_db_kapasa-laptop-plans psql -U postgres -d postgres -c "SELECT id, status FROM payment_plans WHERE id = '[PLAN_ID]';"
```

**Expected:** status = 'cancelled'

---

### ✅ Test 5.4: Stock Reduction on Approval

**Objective:** Verify stock reduces when plan approved

**Steps:**
1. Login as admin
2. Note current stock of a laptop:
   ```bash
   docker exec supabase_db_kapasa-laptop-plans psql -U postgres -d postgres -c "SELECT id, name, stock_quantity FROM laptops WHERE id = '[LAPTOP_ID]';"
   ```
3. Approve a payment plan for that laptop
4. Check stock again
5. Verify stock reduced by 1

**Expected Results:**
- ✅ Stock quantity decreases by 1
- ✅ Stock movement record created
- ✅ Movement type is 'sold'

**Database Verification:**
```bash
# Check stock reduced
docker exec supabase_db_kapasa-laptop-plans psql -U postgres -d postgres -c "SELECT stock_quantity FROM laptops WHERE id = '[LAPTOP_ID]';"

# Check stock movement created
docker exec supabase_db_kapasa-laptop-plans psql -U postgres -d postgres -c "SELECT * FROM stock_movements WHERE laptop_id = '[LAPTOP_ID]' ORDER BY created_at DESC LIMIT 1;"
```

**Expected:**
- stock_quantity decreased by 1
- stock_movement exists with type 'sold'

---

### ✅ Test 5.5: Bulk Actions

**Objective:** Verify admin can approve/reject multiple plans

**Steps:**
1. Login as admin
2. Navigate to pending applications
3. Select multiple applications (checkboxes)
4. Click "Approve Selected"
5. Verify all selected plans approved
6. Verify success message shows count

**Expected Results:**
- ✅ Multiple plans processed
- ✅ All statuses updated
- ✅ Stock reduced for each
- ✅ Confirmation message accurate

---


## Phase 6: Payment Recording

### ✅ Test 6.1: Record Payment (Admin)

**Objective:** Verify admin can record customer payments

**Steps:**
1. Login as admin
2. Navigate to http://localhost:5173/admin/record-payment
3. Select a client from dropdown
4. Verify their active payment plans load
5. Select a payment plan
6. Enter payment details:
   - Amount: K200 (or weekly payment amount)
   - Payment Method: Cash
   - Reference Number: REF123
   - Notes: Weekly payment
7. Click "Record Payment"
8. Verify success toast appears
9. Verify payment added to history

**Expected Results:**
- ✅ Payment recorded successfully
- ✅ amount_paid updated in payment_plans
- ✅ Payment record created in payments table
- ✅ Success feedback shown

**Database Verification:**
```bash
# Check payment_plans updated
docker exec supabase_db_kapasa-laptop-plans psql -U postgres -d postgres -c "SELECT id, amount_paid, total_amount FROM payment_plans WHERE id = '[PLAN_ID]';"

# Check payment record created
docker exec supabase_db_kapasa-laptop-plans psql -U postgres -d postgres -c "SELECT * FROM payments WHERE payment_plan_id = '[PLAN_ID]' ORDER BY created_at DESC LIMIT 1;"
```

**Expected:**
- amount_paid increased by payment amount
- Payment record exists with correct details

---

### ✅ Test 6.2: Multiple Payments

**Objective:** Verify multiple payments can be recorded

**Steps:**
1. Login as admin
2. Record 3 payments for the same plan:
   - Payment 1: K200
   - Payment 2: K200
   - Payment 3: K200
3. Verify amount_paid increases each time
4. Verify all payments in history

**Expected Results:**
- ✅ All payments recorded
- ✅ amount_paid = sum of all payments
- ✅ Payment history shows all records

**Database Verification:**
```bash
# Check total payments
docker exec supabase_db_kapasa-laptop-plans psql -U postgres -d postgres -c "SELECT COUNT(*) as payment_count, SUM(amount) as total_paid FROM payments WHERE payment_plan_id = '[PLAN_ID]';"

# Compare with payment_plans
docker exec supabase_db_kapasa-laptop-plans psql -U postgres -d postgres -c "SELECT amount_paid FROM payment_plans WHERE id = '[PLAN_ID]';"
```

**Expected:** total_paid = amount_paid

---

### ✅ Test 6.3: Plan Completion

**Objective:** Verify plan status changes to 'completed' when fully paid

**Steps:**
1. Login as admin
2. Find a payment plan close to completion
3. Record final payment to reach total_amount
4. Verify success message includes "Plan Completed!"
5. Verify plan status changed to 'completed'
6. Login as client
7. Navigate to dashboard
8. Verify plan shows as "completed"
9. Verify "Make Payment" button disabled

**Expected Results:**
- ✅ Status changes to 'completed'
- ✅ Client sees completed status
- ✅ No more payments allowed
- ✅ Completion notification sent

**Database Verification:**
```bash
# Check plan completed
docker exec supabase_db_kapasa-laptop-plans psql -U postgres -d postgres -c "SELECT id, status, amount_paid, total_amount FROM payment_plans WHERE id = '[PLAN_ID]';"
```

**Expected:**
- status = 'completed'
- amount_paid >= total_amount

---

### ✅ Test 6.4: Payment Validation

**Objective:** Verify payment validation works correctly

**Steps:**
1. Login as admin
2. Try to record payment with:
   - Amount = 0
   - Verify error: "Amount must be greater than 0"
3. Try to record payment exceeding remaining balance
   - Amount = K10000 (more than remaining)
   - Verify warning: "Amount exceeds remaining balance"
4. Try to record payment without payment method
   - Verify error: "Payment method required"

**Expected Results:**
- ✅ Cannot record zero amount
- ✅ Warning for overpayment
- ✅ Required fields validated
- ✅ Clear error messages

---

### ✅ Test 6.5: Payment History View

**Objective:** Verify payment history displays correctly

**Steps:**
1. Login as client (testclient@example.com)
2. Navigate to http://localhost:5173/payment-history
3. Verify page shows all payments with:
   - Payment date
   - Amount
   - Payment method
   - Reference number
   - Status (completed)
4. Verify payments ordered by date (newest first)
5. Verify total paid amount shown
6. Verify remaining balance shown

**Expected Results:**
- ✅ All payments visible
- ✅ Correct information displayed
- ✅ Totals calculated correctly
- ✅ Ordered properly

**Database Verification:**
```bash
# Get payment history
docker exec supabase_db_kapasa-laptop-plans psql -U postgres -d postgres -c "SELECT p.*, pp.laptop_id FROM payments p JOIN payment_plans pp ON p.payment_plan_id = pp.id WHERE pp.client_id = (SELECT id FROM clients WHERE email = 'testclient@example.com') ORDER BY p.payment_date DESC;"
```

---

### ✅ Test 6.6: Payment Receipt Generation

**Objective:** Verify payment receipts can be generated

**Steps:**
1. Login as client
2. Navigate to payment history
3. Click "View Receipt" on a payment
4. Verify receipt shows:
   - Payment details
   - Client information
   - Laptop information
   - Payment plan details
   - Receipt number
5. Click "Download PDF"
6. Verify PDF downloads correctly

**Expected Results:**
- ✅ Receipt displays correctly
- ✅ All information accurate
- ✅ PDF generation works
- ✅ Professional formatting

---

## Phase 7: Stock Management

### ✅ Test 7.1: Stock Reduction on Approval

**Objective:** Verify stock automatically reduces when plan approved

**Steps:**
1. Login as admin
2. Check current stock of a laptop
3. Approve a payment plan for that laptop
4. Verify stock reduced by 1
5. Navigate to stock movements
6. Verify new movement record with:
   - Type: 'sold'
   - Quantity: -1
   - Reason: "Payment plan approved"
   - Reference: Payment plan ID

**Expected Results:**
- ✅ Stock reduces automatically
- ✅ Stock movement created
- ✅ Correct movement type
- ✅ Audit trail maintained

**Database Verification:**
```bash
# Check stock and movement
docker exec supabase_db_kapasa-laptop-plans psql -U postgres -d postgres -c "SELECT l.name, l.stock_quantity, sm.movement_type, sm.quantity, sm.reason FROM laptops l LEFT JOIN stock_movements sm ON l.id = sm.laptop_id WHERE l.id = '[LAPTOP_ID]' ORDER BY sm.created_at DESC LIMIT 1;"
```

---

### ✅ Test 7.2: Low Stock Alert

**Objective:** Verify low stock alerts work

**Steps:**
1. Login as admin
2. Navigate to inventory management
3. Find a laptop with stock below min_stock_level
4. Verify red "Low Stock" badge shows
5. Navigate to admin dashboard
6. Verify low stock alert in notifications
7. Click alert
8. Verify redirected to inventory page

**Expected Results:**
- ✅ Low stock badge visible
- ✅ Alert on dashboard
- ✅ Clickable notification
- ✅ Correct laptop highlighted

**Database Verification:**
```bash
# Find low stock items
docker exec supabase_db_kapasa-laptop-plans psql -U postgres -d postgres -c "SELECT name, stock_quantity, min_stock_level FROM laptops WHERE stock_quantity <= min_stock_level;"
```

---

### ✅ Test 7.3: Out of Stock Prevention

**Objective:** Verify cannot approve plans for out-of-stock laptops

**Steps:**
1. Login as admin
2. Set a laptop stock to 0
3. Try to approve a payment plan for that laptop
4. Verify error message: "Cannot approve - laptop out of stock"
5. Verify plan remains pending
6. Verify stock not reduced

**Expected Results:**
- ✅ Approval blocked
- ✅ Clear error message
- ✅ Plan stays pending
- ✅ Stock unchanged

---

### ✅ Test 7.4: Stock Adjustment

**Objective:** Verify manual stock adjustments work

**Steps:**
1. Login as admin
2. Navigate to inventory management
3. Select a laptop
4. Click "Adjust Stock"
5. Enter adjustment:
   - Type: Stock In
   - Quantity: 5
   - Reason: New shipment
   - Reference: PO-12345
6. Click "Save"
7. Verify stock increased by 5
8. Verify stock movement created

**Expected Results:**
- ✅ Stock adjusted correctly
- ✅ Movement record created
- ✅ Audit trail complete
- ✅ Success feedback shown

**Database Verification:**
```bash
# Check adjustment
docker exec supabase_db_kapasa-laptop-plans psql -U postgres -d postgres -c "SELECT * FROM stock_movements WHERE laptop_id = '[LAPTOP_ID]' AND movement_type = 'stock_in' ORDER BY created_at DESC LIMIT 1;"
```

---

### ✅ Test 7.5: Stock History

**Objective:** Verify complete stock history visible

**Steps:**
1. Login as admin
2. Navigate to stock movements history
3. Filter by laptop
4. Verify all movements shown:
   - Stock in
   - Stock out
   - Adjustments
   - Sold (from approved plans)
5. Verify each shows:
   - Date/time
   - Type
   - Quantity
   - Previous quantity
   - New quantity
   - Reason
   - Created by

**Expected Results:**
- ✅ Complete history visible
- ✅ All movement types shown
- ✅ Chronological order
- ✅ Full audit trail

---

## Regression Testing

### ✅ Regression Test 1: End-to-End User Journey

**Objective:** Verify complete user flow works

**Steps:**
1. **As Visitor:**
   - Browse catalog (no auth)
   - View laptop details
   - Click "Sign In to Apply"

2. **Register:**
   - Create new account
   - Complete profile

3. **Apply for Plan:**
   - Browse catalog
   - Select laptop
   - Customize payment plan
   - Submit application

4. **As Admin:**
   - Login as admin
   - View pending application
   - Approve application
   - Verify stock reduced

5. **As Client:**
   - Login as client
   - View active plan on dashboard
   - Check payment schedule

6. **As Admin:**
   - Record payment
   - Verify amount updated

7. **As Client:**
   - View payment history
   - Verify payment recorded

**Expected Results:**
- ✅ Complete flow works end-to-end
- ✅ No errors at any step
- ✅ Data consistent across all views

---

### ✅ Regression Test 2: Multi-User Scenarios

**Objective:** Verify system handles multiple users correctly

**Steps:**
1. Create 3 test clients
2. Each applies for different payment plans
3. Login as admin
4. Approve all plans
5. Record payments for each
6. Verify each client sees only their data
7. Verify admin sees all data

**Expected Results:**
- ✅ Data isolation works
- ✅ No data leakage between users
- ✅ Admin sees all data
- ✅ Clients see only their data

---

### ✅ Regression Test 3: Browser Compatibility

**Objective:** Verify works across browsers

**Test in:**
- Chrome
- Firefox
- Safari
- Edge

**Steps:**
1. Test complete user journey in each browser
2. Verify UI renders correctly
3. Verify all functionality works
4. Check responsive design

**Expected Results:**
- ✅ Works in all major browsers
- ✅ Consistent UI
- ✅ No browser-specific bugs

---

### ✅ Regression Test 4: Mobile Responsiveness

**Objective:** Verify mobile experience

**Steps:**
1. Open on mobile device or use browser dev tools
2. Test all pages:
   - Landing
   - Catalog
   - Laptop details
   - Dashboard
   - Admin pages
3. Verify:
   - Touch targets adequate size
   - Text readable
   - Images scale properly
   - Navigation works
   - Forms usable

**Expected Results:**
- ✅ Fully responsive
- ✅ Mobile-friendly
- ✅ Touch-optimized
- ✅ No horizontal scroll

---

## Performance Testing

### ✅ Performance Test 1: Page Load Times

**Objective:** Verify pages load quickly

**Steps:**
1. Open browser dev tools (Network tab)
2. Clear cache
3. Load each page and measure:
   - Landing page
   - Catalog
   - Dashboard
   - Admin dashboard

**Expected Results:**
- ✅ Landing < 2 seconds
- ✅ Catalog < 3 seconds
- ✅ Dashboard < 2 seconds
- ✅ No blocking resources

---

### ✅ Performance Test 2: Large Dataset Handling

**Objective:** Verify system handles many records

**Steps:**
1. Create 50+ payment plans
2. Add 100+ laptops
3. Record 200+ payments
4. Test:
   - Catalog loads
   - Dashboard loads
   - Admin views load
   - Search/filter works

**Expected Results:**
- ✅ No significant slowdown
- ✅ Pagination works (if implemented)
- ✅ Search remains fast
- ✅ No memory leaks

---

### ✅ Performance Test 3: Concurrent Users

**Objective:** Verify handles multiple simultaneous users

**Steps:**
1. Open 5 browser windows
2. Login as different users in each
3. Perform actions simultaneously:
   - Apply for plans
   - Record payments
   - Browse catalog
4. Verify no conflicts or errors

**Expected Results:**
- ✅ No race conditions
- ✅ Data consistency maintained
- ✅ No errors
- ✅ Smooth performance

---

## Test Completion Checklist

### Phase 1: Public Browsing ✅
- [ ] Test 1.1: Public catalog access
- [ ] Test 1.2: Laptop details unauthenticated
- [ ] Test 1.3: User registration
- [ ] Test 1.4: User login

### Phase 2: Payment Plan Creation ✅
- [ ] Test 2.1: Apply for payment plan
- [ ] Test 2.2: Multiple payment plans
- [ ] Test 2.3: Payment plan validation

### Phase 3: Role-Based Access Control ✅
- [ ] Test 3.1: Admin access
- [ ] Test 3.2: Client access restriction
- [ ] Test 3.3: Unauthenticated admin access
- [ ] Test 3.4: Role persistence

### Phase 4: Real Dashboard Data ✅
- [ ] Test 4.1: Dashboard with payment plans
- [ ] Test 4.2: Dashboard empty state
- [ ] Test 4.3: Dashboard profile tab
- [ ] Test 4.4: Dashboard payments tab
- [ ] Test 4.5: Dashboard loading states

### Phase 5: Payment Plan Approval ⏳
- [ ] Test 5.1: View pending applications
- [ ] Test 5.2: Approve payment plan
- [ ] Test 5.3: Reject payment plan
- [ ] Test 5.4: Stock reduction on approval
- [ ] Test 5.5: Bulk actions

### Phase 6: Payment Recording ⏳
- [ ] Test 6.1: Record payment
- [ ] Test 6.2: Multiple payments
- [ ] Test 6.3: Plan completion
- [ ] Test 6.4: Payment validation
- [ ] Test 6.5: Payment history view
- [ ] Test 6.6: Payment receipt generation

### Phase 7: Stock Management ⏳
- [ ] Test 7.1: Stock reduction on approval
- [ ] Test 7.2: Low stock alert
- [ ] Test 7.3: Out of stock prevention
- [ ] Test 7.4: Stock adjustment
- [ ] Test 7.5: Stock history

### Regression Testing ⏳
- [ ] Regression Test 1: End-to-end user journey
- [ ] Regression Test 2: Multi-user scenarios
- [ ] Regression Test 3: Browser compatibility
- [ ] Regression Test 4: Mobile responsiveness

### Performance Testing ⏳
- [ ] Performance Test 1: Page load times
- [ ] Performance Test 2: Large dataset handling
- [ ] Performance Test 3: Concurrent users

---

## Bug Reporting Template

When you find a bug, document it using this template:

```markdown
### Bug #[NUMBER]: [Brief Description]

**Severity:** Critical / High / Medium / Low

**Phase:** [Which test phase]

**Test:** [Which specific test]

**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Expected Result:**
What should happen

**Actual Result:**
What actually happened

**Screenshots:**
[Attach if applicable]

**Database State:**
[SQL query results if relevant]

**Browser/Environment:**
- Browser: Chrome 120
- OS: macOS
- Screen size: 1920x1080

**Additional Notes:**
Any other relevant information
```

---

## Success Criteria

### Phase 1-4 (Already Implemented):
- ✅ All tests pass
- ✅ No critical bugs
- ✅ Database state correct
- ✅ User experience smooth

### Phase 5-7 (To Be Implemented):
- ⏳ All tests pass
- ⏳ No critical bugs
- ⏳ Complete business workflow
- ⏳ Production-ready

### Overall System:
- ⏳ All regression tests pass
- ⏳ Performance acceptable
- ⏳ Mobile-responsive
- ⏳ Cross-browser compatible
- ⏳ Security verified
- ⏳ Data integrity maintained

---

## Notes

- Run tests in order (Phase 1 → Phase 7)
- Document all bugs found
- Retest after bug fixes
- Keep database in known state
- Use consistent test data
- Clear browser cache between major tests

**Good luck with testing! 🧪**
