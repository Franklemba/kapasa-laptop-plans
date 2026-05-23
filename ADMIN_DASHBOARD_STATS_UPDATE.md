# Admin Dashboard Statistics Update

## Date: May 22, 2026

## Overview
Updated the Admin Dashboard to display real-time statistics from the database instead of hardcoded placeholder values.

## Changes Made

### 1. Real-Time Statistics

#### Total Clients
**Before**: Hardcoded value (142)
**After**: Real count from `clients` table
- Shows total number of registered clients
- Shows new clients added this month
- Format: `{total}` with `+{new} from this month`

**Query**:
```sql
-- Total clients
SELECT COUNT(*) FROM clients;

-- New clients this month
SELECT COUNT(*) FROM clients 
WHERE created_at >= start_of_current_month;
```

#### Laptops Sold
**Before**: Hardcoded value (89)
**After**: Real count from `payment_plans` table
- Counts all active and completed payment plans
- Shows laptops sold last month
- Format: `{total}` with `+{last_month} from last month`

**Query**:
```sql
-- Total laptops sold (active + completed plans)
SELECT COUNT(*) FROM payment_plans 
WHERE status IN ('active', 'completed');

-- Laptops sold last month
SELECT COUNT(*) FROM payment_plans 
WHERE status IN ('active', 'completed')
AND start_date >= start_of_last_month
AND start_date <= end_of_last_month;
```

#### Outstanding Payments
**Before**: Hardcoded value (ZMK 45,231)
**After**: Real calculation from active payment plans
- Calculates: `SUM(total_amount - amount_paid)` for active plans
- Shows number of active plans
- Format: `ZMK {amount}` with `Across {count} active plans`

**Calculation**:
```javascript
outstanding = activePlans.reduce((sum, plan) => {
  return sum + (plan.total_amount - plan.amount_paid);
}, 0);
```

#### Weekly Collection
**Before**: Hardcoded value (ZMK 3,450)
**After**: Real calculation from active payment plans
- Calculates: `SUM(weekly_payment)` for all active plans
- Shows expected collection for the current week
- Format: `ZMK {amount}` with `Expected this week`

**Calculation**:
```javascript
weeklyCollection = activePlans.reduce((sum, plan) => {
  return sum + (plan.weekly_payment || 0);
}, 0);
```

### 2. Loading States

Added loading states for all statistics:
- Shows animated "..." while fetching data
- Prevents layout shift during loading
- Provides better user experience

### 3. Parallel Data Fetching

Optimized performance by fetching all data in parallel:
```javascript
const [clientsResult, paymentPlansResult, lowStockResult] = 
  await Promise.all([
    fetchClientStats(),
    fetchPaymentPlanStats(),
    fetchLowStockItems()
  ]);
```

### 4. Updated Quick Actions

**Transaction History Card**:
- **Before**: Non-functional button
- **After**: Links to `/client-payment-history` page
- Allows admins to view detailed payment transactions

## Technical Implementation

### State Management
```typescript
const [stats, setStats] = useState({
  totalClients: 0,
  newClientsThisMonth: 0,
  laptopsSold: 0,
  laptopsSoldLastMonth: 0,
  outstandingPayments: 0,
  activePlansCount: 0,
  weeklyCollection: 0,
});
```

### Data Fetching Functions

1. **fetchClientStats()** - Fetches client statistics
   - Total clients count
   - New clients this month

2. **fetchPaymentPlanStats()** - Fetches payment plan statistics
   - Total laptops sold (active + completed plans)
   - Laptops sold last month
   - Outstanding payments calculation
   - Active plans count
   - Weekly collection calculation

3. **fetchLowStockItems()** - Fetches low stock alerts (existing)
   - Laptops with stock <= min_stock_level

### Error Handling

All fetch functions include try-catch blocks:
- Logs errors to console
- Returns default values (0) on error
- Prevents dashboard from breaking

## Statistics Breakdown

### Total Clients
- **Source**: `clients` table
- **Includes**: All registered clients
- **Comparison**: New clients added this month
- **Updates**: Real-time on page load

### Laptops Sold
- **Source**: `payment_plans` table
- **Includes**: Active and completed payment plans
- **Excludes**: Pending, cancelled, or defaulted plans
- **Comparison**: Plans created last month
- **Updates**: Real-time on page load

### Outstanding Payments
- **Source**: `payment_plans` table (active plans only)
- **Calculation**: Sum of (total_amount - amount_paid)
- **Represents**: Total remaining balance across all active plans
- **Context**: Number of active plans
- **Updates**: Real-time on page load

### Weekly Collection
- **Source**: `payment_plans` table (active plans only)
- **Calculation**: Sum of weekly_payment for all active plans
- **Represents**: Expected collection for current week
- **Assumption**: All clients pay on schedule
- **Updates**: Real-time on page load

## Benefits

### For Admins
1. **Accurate Data** - No more guessing or manual counting
2. **Real-Time Insights** - Always up-to-date information
3. **Better Decision Making** - Data-driven business decisions
4. **Quick Overview** - Instant snapshot of business health
5. **Trend Tracking** - Month-over-month comparisons

### For Business
1. **Financial Visibility** - Clear view of outstanding payments
2. **Cash Flow Planning** - Know expected weekly collections
3. **Growth Tracking** - Monitor client acquisition
4. **Sales Performance** - Track laptops sold over time
5. **Inventory Management** - Low stock alerts

## Testing Checklist

### Statistics Accuracy
- [ ] Verify Total Clients matches database count
- [ ] Verify new clients this month is correct
- [ ] Verify Laptops Sold matches active + completed plans
- [ ] Verify laptops sold last month is correct
- [ ] Verify Outstanding Payments calculation is accurate
- [ ] Verify active plans count is correct
- [ ] Verify Weekly Collection matches sum of weekly payments

### Loading States
- [ ] Verify loading animation appears on page load
- [ ] Verify statistics update after loading completes
- [ ] Verify no layout shift during loading

### Edge Cases
- [ ] Test with zero clients
- [ ] Test with zero payment plans
- [ ] Test with all plans completed (no active plans)
- [ ] Test with no new clients this month
- [ ] Test with no laptops sold last month

### Performance
- [ ] Verify page loads within 2 seconds
- [ ] Verify no console errors
- [ ] Verify parallel fetching works correctly

### Links
- [ ] Click "Transaction History" button
- [ ] Verify redirects to Client Payment History page

## Future Enhancements

### Additional Statistics
1. **Revenue This Month** - Total payments received this month
2. **Completion Rate** - Percentage of completed vs active plans
3. **Default Rate** - Percentage of defaulted plans
4. **Average Plan Value** - Average total_amount across plans
5. **Top Selling Laptops** - Most popular laptop models

### Visualizations
1. **Revenue Chart** - Line chart showing revenue over time
2. **Client Growth Chart** - Bar chart showing client acquisition
3. **Payment Status Pie Chart** - Distribution of plan statuses
4. **Collection Forecast** - Projected collections for next 4 weeks

### Comparisons
1. **Year-over-Year** - Compare with same period last year
2. **Quarter-over-Quarter** - Compare with previous quarter
3. **Custom Date Ranges** - Allow admins to select date ranges

### Alerts
1. **Low Collection Alert** - When weekly collection drops below threshold
2. **High Default Alert** - When default rate exceeds threshold
3. **Growth Milestone** - Celebrate reaching client/sales milestones

### Export
1. **Dashboard Report** - Export statistics as PDF
2. **Email Reports** - Schedule daily/weekly email reports
3. **CSV Export** - Export raw data for analysis

## Notes

- All currency values displayed in ZMK (Zambian Kwacha)
- Statistics refresh on every page load
- No caching implemented (can be added for performance)
- Date calculations use JavaScript Date object
- Month boundaries use local timezone
- Rounding applied to currency values (no decimals)

## Related Files

- `src/pages/Admin/AdminDashboard.tsx` - Main dashboard component
- `src/components/admin/AdminLayout.tsx` - Admin layout wrapper
- Database tables: `clients`, `payment_plans`, `laptops`
