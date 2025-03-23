// This file sets up the environment for Vitest
import { config } from 'dotenv';
import { beforeAll, beforeEach } from 'vitest';
import * as path from 'path';

// Load environment variables from .env.local
// This is important because our tests will use the Supabase client
// which needs environment variables like NEXT_PUBLIC_SUPABASE_URL

console.log('Loading environment variables from .env.local');
config({ path: path.resolve(process.cwd(), '.env.local') });

// Log environment variable status to help with debugging
console.log('Environment Check:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'exists' : 'missing');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'exists' : 'missing');

beforeAll(() => {
  // Ensure required environment variables are present
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL', 
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.warn(`Warning: ${envVar} environment variable is not set.`);
    }
  }
}); 