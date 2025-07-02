import { supabase } from "@/integrations/supabase/client";

export interface Laptop {
  id: string;
  name: string;
  brand: string;
  model: string;
  price: number;
  original_price?: number;
  weekly_payment: number;
  image_url?: string;
  rating?: number;
  review_count?: number;
  processor: string;
  ram: string;
  storage: string;
  display: string;
  graphics?: string;
  condition: string;
  description?: string;
  status: string;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
}

export const fetchLaptops = async (): Promise<Laptop[]> => {
  const { data, error } = await supabase
    .from('laptops')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching laptops:', error);
    throw new Error('Failed to fetch laptops');
  }

  return data || [];
};

export const fetchLaptopById = async (id: string): Promise<Laptop | null> => {
  const { data, error } = await supabase
    .from('laptops')
    .select('*')
    .eq('id', id)
    .eq('status', 'active')
    .maybeSingle();

  if (error) {
    console.error('Error fetching laptop:', error);
    throw new Error('Failed to fetch laptop');
  }

  return data;
};

export const searchLaptops = async (searchTerm: string, priceFilter?: string): Promise<Laptop[]> => {
  let query = supabase
    .from('laptops')
    .select('*')
    .eq('status', 'active');

  // Add search filter
  if (searchTerm) {
    query = query.or(`name.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%`);
  }

  // Add price filter
  if (priceFilter && priceFilter !== 'all') {
    switch (priceFilter) {
      case 'budget':
        query = query.lte('price', 4000);
        break;
      case 'mid':
        query = query.gte('price', 4000).lte('price', 6500);
        break;
      case 'premium':
        query = query.gt('price', 6500);
        break;
    }
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Error searching laptops:', error);
    throw new Error('Failed to search laptops');
  }

  return data || [];
};