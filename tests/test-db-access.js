/**
 * This script runs the Supabase database access tests
 * It's useful as a quick check to ensure our database connections work
 * and all columns are accessible.
 */

const { execSync } = require('child_process');
const { config } = require('dotenv');
const path = require('path');

// Load environment variables first
config({ path: path.resolve(process.cwd(), '.env.local') });

console.log('Running database access tests...');
console.log('-------------------------------');
console.log('Environment variables loaded from:', path.resolve(process.cwd(), '.env.local'));
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'exists' : 'missing');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'exists' : 'missing');
console.log('-------------------------------');

try {
  // Use vitest to run only the supabase access tests
  // Pass the environment variables explicitly
  const result = execSync(
    'npx vitest run tests/supabase-access.test.ts', 
    { 
      stdio: 'inherit',
      encoding: 'utf-8',
      env: {
        ...process.env,
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      }
    }
  );
  
  // The result will be printed automatically due to stdio: 'inherit'
  console.log('-------------------------------');
  console.log('Database access tests completed successfully');
} catch (error) {
  console.error('Database access tests failed!');
  console.error('Check the error messages above for details.');
  
  console.log('\nCommon issues:');
  console.log('1. Supabase credentials may be incorrect in .env.local');
  console.log('2. Network connection to Supabase may be unavailable');
  console.log('3. Table schemas might have changed and need updating in Types');
  
  process.exit(1);
} 