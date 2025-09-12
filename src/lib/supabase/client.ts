import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../types/supabase'

// Environment variables are typed in src/env.d.ts
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file')
}

// Create a single Supabase client for the entire app
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Export the client and types for easy access
export type { Database } from '../../types/supabase'

export default supabase
