/**
 * Supabase Client Configuration
 * 
 * This file sets up the Supabase client for authentication, database, and storage.
 * The client is configured to work with user authentication and real-time features.
 */

import { createClient } from '@supabase/supabase-js'

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  )
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Enable automatic token refresh
    autoRefreshToken: true,
    // Persist user session in localStorage
    persistSession: true,
    // Detect auth changes and update UI accordingly
    detectSessionInUrl: true
  }
})

// Export types for TypeScript support
export type { User, Session } from '@supabase/supabase-js'