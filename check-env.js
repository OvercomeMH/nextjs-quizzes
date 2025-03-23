// Simple script to check environment variables
require('dotenv').config({ path: '.env.local' });

console.log('Environment Check:');
console.log('------------------');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'exists' : 'missing');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'exists' : 'missing'); 