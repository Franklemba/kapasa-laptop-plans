import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔍 Checking payment schedule data...\n');

// Query 1: Count schedule rows for active payment plans
const { data: countData, error: countError } = await supabase.rpc('exec_sql', {
  query: `
    SELECT COUNT(*) AS schedule_rows
    FROM public.payment_schedule ps
    JOIN public.payment_plans pp ON ps.payment_plan_id = pp.id
    WHERE pp.status = 'active';
  `
});

if (countError) {
  console.error('❌ Error counting schedule rows:', countError);
  
  // Try direct query instead
  console.log('\n📊 Trying direct query...\n');
  
  const { data: scheduleData, error: scheduleError } = await supabase
    .from('payment_schedule')
    .select('*, payment_plans!inner(status)', { count: 'exact' })
    .eq('payment_plans.status', 'active');
  
  if (scheduleError) {
    console.error('❌ Error with direct query:', scheduleError);
  } else {
    console.log(`✅ Schedule rows for active plans: ${scheduleData?.length || 0}`);
    
    // Count by status
    const statusCounts = {};
    scheduleData?.forEach(row => {
      statusCounts[row.status] = (statusCounts[row.status] || 0) + 1;
    });
    
    console.log('\n📈 Status breakdown:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} weeks`);
    });
  }
} else {
  console.log('✅ Count result:', countData);
}

// Also check total payment plans
const { data: plansData, error: plansError } = await supabase
  .from('payment_plans')
  .select('status', { count: 'exact' });

if (!plansError) {
  console.log(`\n📋 Total payment plans: ${plansData?.length || 0}`);
  
  const planStatusCounts = {};
  plansData?.forEach(plan => {
    planStatusCounts[plan.status] = (planStatusCounts[plan.status] || 0) + 1;
  });
  
  console.log('\n📊 Payment plans by status:');
  Object.entries(planStatusCounts).forEach(([status, count]) => {
    console.log(`   ${status}: ${count} plans`);
  });
}

console.log('\n✨ Done!');
