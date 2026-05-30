import { createClient } from '@supabase/supabase-js';

// Use cloud database credentials from .env
const supabaseUrl = 'https://rbgbttfxipzkjezekadd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiZ2J0dGZ4aXB6a2plemVrYWRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3MDgxNzMsImV4cCI6MjA5NTI4NDE3M30.ppKahdOiIEExrMwsduGeo53iF_zeSCDruht9PZwhqB8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔍 Searching for admin users in cloud database...\n');

// Query for admin users
const { data: adminUsers, error: adminError } = await supabase
  .from('clients')
  .select('id, email, first_name, last_name, role, created_at, user_id')
  .eq('role', 'admin');

if (adminError) {
  console.error('❌ Error fetching admin users:', adminError);
} else {
  if (adminUsers && adminUsers.length > 0) {
    console.log(`✅ Found ${adminUsers.length} admin user(s):\n`);
    adminUsers.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.first_name} ${admin.last_name}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   User ID: ${admin.user_id || 'NULL'}`);
      console.log(`   Client ID: ${admin.id}`);
      console.log(`   Created: ${new Date(admin.created_at).toLocaleString()}`);
      console.log('');
    });
  } else {
    console.log('❌ No admin users found in the database.');
    console.log('\n💡 To create an admin user:');
    console.log('   1. Register an account on your website');
    console.log('   2. Run this SQL in Supabase dashboard:');
    console.log('      UPDATE clients SET role = \'admin\' WHERE email = \'your-email@example.com\';');
  }
}

// Also show all users for reference
console.log('\n📋 All users in database:\n');
const { data: allUsers, error: allError } = await supabase
  .from('clients')
  .select('email, first_name, last_name, role, created_at')
  .order('created_at', { ascending: false });

if (!allError && allUsers) {
  if (allUsers.length > 0) {
    console.log(`Total users: ${allUsers.length}\n`);
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} - ${user.first_name} ${user.last_name} (${user.role})`);
    });
  } else {
    console.log('No users found. Database is empty.');
  }
}

console.log('\n✨ Done!');
