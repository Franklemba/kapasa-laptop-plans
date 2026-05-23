# Currency Update: USD ($) to Zambian Kwacha (ZMK)

## Date: May 22, 2026

## Overview
Updated the entire application to use Zambian Kwacha (ZMK) instead of US Dollars ($).

## Changes Made

### 1. Created Currency Utility
- **File**: `src/utils/currency.ts`
- **Purpose**: Centralized currency formatting functions
- **Functions**:
  - `formatCurrency(amount)` - Formats with 2 decimal places (e.g., "ZMK 1,234.56")
  - `formatCurrencyShort(amount)` - Formats without decimals (e.g., "ZMK 1,234")
  - `getCurrencySymbol()` - Returns "ZMK"

### 2. Updated Files

#### Client Pages
- ✅ `src/pages/Client/Dashboard.tsx` - All payment displays, progress tracking
- ✅ `src/pages/Client/PaymentHistory.tsx` - Payment history table and summaries
- ✅ `src/pages/Client/Catalog.tsx` - Price filter buttons
- ✅ `src/pages/Client/LaptopDetails.tsx` - Laptop pricing display
- ✅ `src/pages/Client/Notifications.tsx` - Payment notification messages

#### Admin Pages
- ✅ `src/pages/Admin/AdminDashboard.tsx` - Dashboard statistics
- ✅ `src/pages/Admin/ManageClients.tsx` - Monthly income field label
- ✅ `src/pages/Admin/InventoryManagement.tsx` - Laptop prices and total value
- ✅ `src/pages/Admin/PendingApplications.tsx` - Weekly payment and total amount displays
- ✅ `src/pages/Admin/RecordPayment.tsx` - Payment recording interface

#### Components
- ✅ `src/components/PaymentPlanCalculator.tsx` - All payment calculations and displays
- ✅ `src/components/LaptopCard.tsx` - Laptop card pricing
- ✅ `src/components/client/LaptopSummaryCard.tsx` - Summary card pricing
- ✅ `src/components/PaymentReceipt.tsx` - Receipt generation

### 3. Currency Symbol Changes

All instances of the following have been updated:
- `$` → `ZMK`
- `K` → `ZMK` (where K was used as shorthand for Kwacha)

### 4. Price Filter Labels Updated

**Catalog Page Price Filters:**
- "Under K4000" → "Under ZMK 4000"
- "K4000 - K6500" → "ZMK 4000 - ZMK 6500"
- "K6500+" → "ZMK 6500+"

### 5. Form Labels Updated
- "Monthly Income ($)" → "Monthly Income (ZMK)"

## Database Considerations

**Note**: The database schema does not need to be updated as it stores numeric values without currency symbols. The currency symbol is only applied in the UI layer.

## Testing Checklist

### Client Interface
- [ ] Dashboard displays ZMK correctly
- [ ] Payment history shows ZMK amounts
- [ ] Catalog price filters use ZMK
- [ ] Laptop details page shows ZMK pricing
- [ ] Payment plan calculator uses ZMK
- [ ] Payment receipts display ZMK

### Admin Interface
- [ ] Admin dashboard statistics show ZMK
- [ ] Inventory management displays ZMK prices
- [ ] Pending applications show ZMK amounts
- [ ] Payment recording interface uses ZMK
- [ ] Client management shows ZMK for income

### Notifications
- [ ] Payment reminders show ZMK amounts
- [ ] Payment confirmation messages use ZMK

## Future Enhancements

Consider implementing:
1. **Multi-currency support** - Allow switching between currencies
2. **Currency conversion** - If dealing with international transactions
3. **Localization** - Use browser locale for number formatting
4. **Currency utility usage** - Refactor all currency displays to use the centralized utility functions

## Notes

- All currency values are formatted using `toLocaleString()` for proper thousand separators
- The currency symbol "ZMK" is used consistently throughout the application
- No backend changes were required as currency is a display-only concern
