// This file sets up the environment for Jest
import { config } from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
console.log('Loading environment variables from .env.local');
config({ path: path.resolve(__dirname, '../.env.local') });

// Log environment variable status to help with debugging
console.log('Environment variables loaded:');
console.log('- NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓' : '✗');
console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓' : '✗'); 