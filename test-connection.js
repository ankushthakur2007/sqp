import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uslpqtsrxnjhhkbpsbxz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzbHBxdHNyeG5qaGhrYnBzYnh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4NTk0MDIsImV4cCI6MjA3OTQzNTQwMn0.q9rx5hqx5qb8KDCrIHNHO3mLrTuAzIanWBrrvGHCRpcc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('Testing Supabase connection...\n');
  
  try {
    // Test 1: Check if we can query the daily_entries table
    console.log('1. Testing table query...');
    const { data, error, count } = await supabase
      .from('daily_entries')
      .select('*', { count: 'exact' })
      .limit(5);
    
    if (error) {
      console.error('❌ Error querying table:', error.message);
      return;
    }
    
    console.log(`✅ Successfully connected! Found ${count} total records.`);
    console.log('Sample data:', data);
    
    // Test 2: Try to insert a test record
    console.log('\n2. Testing insert capability...');
    const testData = {
      date: '2026-01-15',
      production: 5000,
      quality: 95,
      safety_status: 'safe'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('daily_entries')
      .insert([testData])
      .select();
    
    if (insertError) {
      console.error('❌ Insert error:', insertError.message);
    } else {
      console.log('✅ Insert successful:', insertData);
      
      // Clean up test data
      await supabase
        .from('daily_entries')
        .delete()
        .eq('date', '2026-01-15');
      console.log('✅ Test data cleaned up');
    }
    
    console.log('\n✅ Backend connectivity test completed successfully!');
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

testConnection();
