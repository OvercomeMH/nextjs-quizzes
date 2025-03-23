/**
 * Simple Database Schema Validation Script
 * 
 * This script checks if we can access our Supabase tables and columns.
 * It helps identify issues with permissions or missing tables.
 * 
 * Usage:
 *   node scripts/validate-db-schema.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase environment variables are not set.');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are defined in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Define the tables we expect to exist in our database
const EXPECTED_TABLES = [
  'users',
  'quizzes',
  'questions',
  'question_possible_answers',
  'submissions',
  'user_answers'
];

// Function to check if a table exists
async function checkTable(tableName) {
  try {
    console.log(`Checking table: ${tableName}`);
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (error) {
      console.error(`❌ Error accessing table ${tableName}:`, error.message);
      return false;
    }
    
    console.log(`✅ Successfully accessed table ${tableName}`);
    
    if (data && data.length > 0) {
      const columns = Object.keys(data[0]);
      console.log(`   Found ${columns.length} columns: ${columns.join(', ')}`);
      return true;
    } else {
      console.log(`   Table exists but has no rows`);
      return true;
    }
  } catch (error) {
    console.error(`❌ Error accessing table ${tableName}:`, error);
    return false;
  }
}

// Main function to validate database
async function validateDatabase() {
  console.log('Database Validation');
  console.log('==================');
  console.log(`Using Supabase URL: ${supabaseUrl}`);
  
  let successCount = 0;
  let failureCount = 0;
  
  for (const tableName of EXPECTED_TABLES) {
    const success = await checkTable(tableName);
    if (success) {
      successCount++;
    } else {
      failureCount++;
    }
    console.log('------------------');
  }
  
  console.log('==================');
  console.log(`Results: ${successCount} tables accessible, ${failureCount} tables inaccessible`);
  
  if (failureCount > 0) {
    console.error(`❌ Some tables could not be accessed`);
    console.error('Common issues:');
    console.error('1. The table might not exist in the database');
    console.error('2. You might not have permission to access the table (check RLS policies)');
    console.error('3. Your connection to Supabase might be interrupted');
    process.exit(1);
  } else {
    console.log('✅ All expected tables are accessible!');
  }
}

// Run the validation
validateDatabase(); 