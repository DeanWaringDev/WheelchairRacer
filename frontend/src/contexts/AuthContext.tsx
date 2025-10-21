/**
 * Authentication Context
 * 
 * Provides user authentication state and functions throughout the app.
 * Handles sign up, sign in, sign out, and user session management.
 */

import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

// Define the shape of our auth context
interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, username: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
  updateProfile: (updates: { username?: string, avatar_url?: string }) => Promise<{ error: any }>
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auth Provider Component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Sign up function
  const signUp = async (email: string, password: string, username: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
          avatar_url: '', // Will be updated when user uploads profile picture
        }
      }
    })
    
    if (error) {
      console.error('Sign up error:', error)
      return { error }
    }
    
    // Fallback: Create profile manually if trigger didn't work
    if (data?.user) {
      try {
        // Wait a moment for trigger to fire
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Check if profile exists
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .single()
        
        // If no profile, create it manually
        if (!existingProfile) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              { 
                id: data.user.id, 
                username: username,
                avatar_url: '',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            ])
          
          if (profileError) {
            console.error('Manual profile creation failed:', profileError)
            // Don't block signup - profile can be created later
          }
        }
      } catch (err) {
        console.error('Profile check/creation error:', err)
        // Don't block signup - profile can be created later
      }
    }
    
    return { error }
  }

  // Sign in function
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  // Sign out function
  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  // Update user profile
  const updateProfile = async (updates: { username?: string, avatar_url?: string }) => {
    if (!user) return { error: new Error('No user logged in') }

    // Update auth.users metadata
    const { error: authError } = await supabase.auth.updateUser({
      data: updates
    })
    
    if (authError) return { error: authError }

    // Update profiles table (this will trigger the display name sync)
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        username: updates.username,
        avatar_url: updates.avatar_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    return { error: profileError }
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}