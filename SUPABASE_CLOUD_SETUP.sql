-- ============================================================================
-- SUPABASE CLOUD DATABASE SETUP
-- ============================================================================
-- Run this in Supabase Dashboard → SQL Editor
-- This will add sample laptops to your catalog
-- ============================================================================

-- First, let's verify the tables exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'laptops') THEN
    RAISE EXCEPTION 'Tables not found! Please run migrations first.';
  END IF;
END $$;

-- Clear existing laptop data (optional - comment out if you want to keep existing data)
-- TRUNCATE TABLE public.laptop_images CASCADE;
-- TRUNCATE TABLE public.laptops CASCADE;

-- Insert sample laptops
INSERT INTO public.laptops (
  name, brand, model, processor, ram, storage, display, graphics,
  price, weekly_payment, condition, stock_quantity, status, description
) VALUES
  (
    'MacBook Pro 16" M2',
    'Apple',
    'MacBook Pro 16"',
    'Apple M2 Pro',
    '16GB',
    '512GB SSD',
    '16-inch Liquid Retina XDR',
    'Integrated GPU',
    15000.00,
    500.00,
    'new',
    5,
    'active',
    'Powerful laptop for professionals with stunning display and long battery life'
  ),
  (
    'Dell XPS 15',
    'Dell',
    'XPS 15 9530',
    'Intel Core i7-13700H',
    '16GB DDR5',
    '512GB SSD',
    '15.6-inch FHD+',
    'NVIDIA GeForce RTX 4050',
    12000.00,
    400.00,
    'new',
    8,
    'active',
    'Premium Windows laptop with excellent performance and build quality'
  ),
  (
    'HP Pavilion 15',
    'HP',
    'Pavilion 15-eg2000',
    'Intel Core i5-1235U',
    '8GB DDR4',
    '256GB SSD',
    '15.6-inch HD',
    'Intel Iris Xe Graphics',
    6000.00,
    200.00,
    'refurbished',
    10,
    'active',
    'Affordable laptop perfect for students and everyday use'
  ),
  (
    'Lenovo ThinkPad X1 Carbon',
    'Lenovo',
    'ThinkPad X1 Carbon Gen 11',
    'Intel Core i7-1355U',
    '16GB LPDDR5',
    '512GB SSD',
    '14-inch WUXGA',
    'Intel Iris Xe Graphics',
    13500.00,
    450.00,
    'new',
    6,
    'active',
    'Ultra-portable business laptop with legendary ThinkPad keyboard'
  ),
  (
    'ASUS ROG Strix G15',
    'ASUS',
    'ROG Strix G15',
    'AMD Ryzen 7 6800H',
    '16GB DDR5',
    '1TB SSD',
    '15.6-inch FHD 144Hz',
    'NVIDIA GeForce RTX 3060',
    11000.00,
    370.00,
    'new',
    4,
    'active',
    'Gaming laptop with high refresh rate display and powerful graphics'
  ),
  (
    'Microsoft Surface Laptop 5',
    'Microsoft',
    'Surface Laptop 5',
    'Intel Core i5-1235U',
    '8GB LPDDR5',
    '256GB SSD',
    '13.5-inch PixelSense',
    'Intel Iris Xe Graphics',
    9500.00,
    320.00,
    'new',
    7,
    'active',
    'Sleek and stylish laptop with touchscreen display'
  ),
  (
    'Acer Aspire 5',
    'Acer',
    'Aspire 5 A515-57',
    'Intel Core i3-1215U',
    '8GB DDR4',
    '256GB SSD',
    '15.6-inch FHD',
    'Intel UHD Graphics',
    4500.00,
    150.00,
    'refurbished',
    15,
    'active',
    'Budget-friendly laptop for basic computing needs'
  ),
  (
    'MacBook Air M2',
    'Apple',
    'MacBook Air 13"',
    'Apple M2',
    '8GB',
    '256GB SSD',
    '13.6-inch Liquid Retina',
    'Integrated GPU',
    10500.00,
    350.00,
    'new',
    10,
    'active',
    'Thin and light laptop with incredible battery life'
  )
ON CONFLICT (id) DO NOTHING;

-- Verify the data was inserted
SELECT 
  id, 
  brand, 
  model, 
  price, 
  weekly_payment,
  stock_quantity,
  status
FROM public.laptops
ORDER BY brand, model;

-- Show summary
SELECT 
  COUNT(*) as total_laptops,
  SUM(stock_quantity) as total_stock,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_laptops
FROM public.laptops;

-- ============================================================================
-- DONE! You should now see 8 laptops in your catalog
-- ============================================================================
