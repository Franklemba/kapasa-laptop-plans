// Quick test script to verify Supabase connection
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔌 Testing connection to local Supabase...\n');

// Test 1: Fetch laptops
console.log('📱 Fetching laptops...');
const { data: laptops, error: laptopsError } = await supabase
  .from('laptops')
  .select('*');

if (laptopsError) {
  console.error('❌ Error fetching laptops:', laptopsError);
} else {
  console.log(`✅ Found ${laptops.length} laptops:`);
  laptops.forEach(laptop => {
    console.log(`   - ${laptop.brand} ${laptop.model} (${laptop.processor})`);
  });
}

// Test 2: Fetch clients
console.log('\n👥 Fetching clients...');
const { data: clients, error: clientsError } = await supabase
  .from('clients')
  .select('*');

if (clientsError) {
  console.error('❌ Error fetching clients:', clientsError);
} else {
  console.log(`✅ Found ${clients.length} client(s)`);
}

// Test 3: Fetch stock movements
console.log('\n📦 Fetching stock movements...');
const { data: movements, error: movementsError } = await supabase
  .from('stock_movements')
  .select('*');

if (movementsError) {
  console.error('❌ Error fetching stock movements:', movementsError);
} else {
  console.log(`✅ Found ${movements.length} stock movement(s)`);
}

console.log('\n✨ Connection test complete!');
console.log('\n📝 Next steps:');
console.log('   1. Run: npm run dev');
console.log('   2. Open: http://localhost:5173');
console.log('   3. Your app will connect to the local database automatically');
console.log('   4. Visit Studio: http://127.0.0.1:54323');
