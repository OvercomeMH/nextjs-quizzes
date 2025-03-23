import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// These environment variables will be loaded from .env.local
// Adding fallback URLs for development to prevent crashes during testing
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://missing-url.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'missing-key'

// Log warning if environment variables are missing
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('Warning: Supabase environment variables are missing!')
  console.warn('Make sure to set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local')
  if (process.env.NODE_ENV !== 'production') {
    console.warn('Using placeholder values for development/testing')
  }
}

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// For browser-only usage, we can use this to check auth state
export const getUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Helper function to get session
export const getSession = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

// Export commonly used types from the Database type
export type Tables = Database['public']['Tables']
export type Enums = Database['public']['Enums']

// Helper type to get a specific table's type
export type TableRow<T extends keyof Tables> = Tables[T]['Row']
export type TableInsert<T extends keyof Tables> = Tables[T]['Insert']
export type TableUpdate<T extends keyof Tables> = Tables[T]['Update'] 