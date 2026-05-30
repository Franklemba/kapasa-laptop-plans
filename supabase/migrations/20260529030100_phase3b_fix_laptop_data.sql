-- ============================================================
-- PHASE 3-B: Fix laptop data — typo + pricing
-- ------------------------------------------------------------
-- Issues found in live data:
--
-- 1. "Mackbook pro" — double-k typo → "MacBook Pro"
--
-- 2. Pricing consistency: the default_weekly_payment should
--    reflect a realistic standard plan (e.g. 52-week / 1 year).
--    Suggested formula: price / 52 weeks, rounded up to nearest 5.
--
--    Current vs corrected:
--    | Laptop        | Price  | Old weekly | Implied wks | New weekly (÷52) |
--    | MacBook Pro   | 1,500  | 229.97     | 6.5  ← wrong | 30.00            |
--    | Lenovo        | 6,000  | 46.00      | 130  ← ok   | 115.40 (~120)    |
--    | Macbook (Air) | 7,600  | 35.00      | 217  ← wrong | 146.15 (~150)    |
--
--    The Lenovo is already on a 52-week plan in the DB (2392 / 46 = 52 weeks)
--    but 46/week on 6000 = 130 weeks in catalog default — inconsistent.
--    Correcting to sensible 52-week defaults.
--
-- Note: These are catalog DEFAULTS only. Existing payment_plans
-- are NOT touched — they keep their locked-in weekly_payment.
-- ============================================================

-- Fix 1: Typo correction
UPDATE public.laptops
SET    name = 'MacBook Pro'
WHERE  name = 'Mackbook pro';

-- Fix 2: Correct default_weekly_payment to sensible 52-week defaults
-- MacBook Pro: 1500 / 52 = 28.85 → round to 30.00
UPDATE public.laptops
SET    default_weekly_payment = 30.00,
       updated_at = now()
WHERE  name = 'MacBook Pro'
  AND  price = 1500.00;

-- Lenovo: 6000 / 52 = 115.38 → round to 120.00
UPDATE public.laptops
SET    default_weekly_payment = 120.00,
       updated_at = now()
WHERE  name = 'Lenovo'
  AND  price = 6000.00;

-- Macbook (Air): 7600 / 52 = 146.15 → round to 150.00
UPDATE public.laptops
SET    default_weekly_payment = 150.00,
       updated_at = now()
WHERE  name = 'Macbook'
  AND  price = 7600.00;

-- Verify results
DO $$
DECLARE
  r record;
BEGIN
  RAISE NOTICE '=== Laptop catalog after fix ===';
  FOR r IN
    SELECT name, price, default_weekly_payment,
           round(price / default_weekly_payment) AS implied_weeks
    FROM public.laptops
    ORDER BY price
  LOOP
    RAISE NOTICE 'Name: % | Price: % | Weekly: % | Implied weeks: %',
      r.name, r.price, r.default_weekly_payment, r.implied_weeks;
  END LOOP;
END $$;
