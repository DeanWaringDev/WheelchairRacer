/**
 * Sign In Page Component
 * 
 * Handles user authentication with email/password sign in and sign up forms.
 * Includes form validation, error handling, and navigation after successful auth.
 */

import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { sanitizeEmail, sanitizeUsername } from '../lib/sanitize'
import { rateLimiter, RateLimits, formatTimeRemaining } from '../lib/rateLimit'

const SignIn: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Sanitize inputs
      const cleanEmail = sanitizeEmail(email)
      const cleanUsername = sanitizeUsername(username)

      // Validate email
      if (!cleanEmail) {
        setError('Please enter a valid email address')
        setLoading(false)
        return
      }

      // Rate limiting
      const rateLimitKey = isSignUp ? `signup:${cleanEmail}` : `login:${cleanEmail}`
      const rateLimit = isSignUp ? RateLimits.SIGNUP : RateLimits.LOGIN
      
      if (!rateLimiter.check(rateLimitKey, rateLimit)) {
        const resetTime = rateLimiter.resetIn(rateLimitKey)
        setError(`Too many attempts. Please try again in ${formatTimeRemaining(resetTime)}.`)
        setLoading(false)
        return
      }

      let result
      if (isSignUp) {
        if (!cleanUsername.trim()) {
          setError('Username is required')
          setLoading(false)
          return
        }
        result = await signUp(cleanEmail, password, cleanUsername)
        if (!result.error) {
          // Clear rate limit on success
          rateLimiter.clear(rateLimitKey)
          // Email confirmation is disabled, redirect to home
          window.location.href = '/'
          return
        }
      } else {
        result = await signIn(cleanEmail, password)
        if (!result.error) {
          // Clear rate limit on success
          rateLimiter.clear(rateLimitKey)
        }
      }

      if (result.error) {
        console.error('Auth error details:', result.error)
        setError(result.error.message || 'An error occurred during authentication')
      } else {
        // Success! Navigate to profile or home
        navigate(isSignUp ? '/profile' : '/')
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('An unexpected error occurred: ' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setLoading(false)
    }
  }

  // Google sign-in handler
  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError('')
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' })
      if (error) setError(error.message)
    } catch (err) {
      setError('Google sign-in failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'var(--color-background)' }}>
      <div style={{ width: '100%', maxWidth: '28rem', minWidth: '320px', margin: '0 auto', padding: '0 1rem' }}>
        {/* Card wrapper for better structure */}
        <div className="card" style={{ width: '100%', padding: '2.5rem' }}>
        {/* Header */}
        <div className="text-center mb-8">
          <img
            className="mx-auto h-20 w-20"
            src="/logo.svg"
            alt="Wheelchair Racer Logo"
          />
          <h2 className="mt-6 text-3xl font-extrabold" style={{ color: 'var(--color-secondary)', width: '100%' }}>
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </h2>
          <p className="mt-3 text-sm" style={{ color: 'var(--color-text-body)', width: '100%' }}>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError('')
              }}
              className="font-medium"
              style={{ color: 'var(--color-primary)' }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              {isSignUp ? 'Sign in here' : 'Sign up here'}
            </button>
          </p>
        </div>

        {/* Google Sign-In Button */}
        <div className="mb-6">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            style={{ 
              border: '1px solid rgba(0, 0, 0, 0.2)', 
              backgroundColor: 'var(--color-white)', 
              color: 'var(--color-secondary)',
              boxShadow: 'var(--shadow-card)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-background)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-white)'}
          >
            <svg width="20" height="20" viewBox="0 0 48 48" className="mr-2" aria-hidden="true">
              <g>
                <path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.85-6.85C35.64 2.39 30.18 0 24 0 14.82 0 6.71 5.48 2.69 13.44l7.98 6.2C12.13 13.13 17.62 9.5 24 9.5z"/>
                <path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.01l7.19 5.6C43.93 37.13 46.1 31.36 46.1 24.55z"/>
                <path fill="#FBBC05" d="M10.67 28.09a14.5 14.5 0 010-8.18l-7.98-6.2A23.94 23.94 0 000 24c0 3.77.9 7.34 2.69 10.29l7.98-6.2z"/>
                <path fill="#EA4335" d="M24 48c6.18 0 11.36-2.05 15.15-5.59l-7.19-5.6c-2.01 1.35-4.59 2.16-7.96 2.16-6.38 0-11.87-3.63-14.33-8.89l-7.98 6.2C6.71 42.52 14.82 48 24 48z"/>
                <path fill="none" d="M0 0h48v48H0z"/>
              </g>
            </svg>
            Sign in with Google
          </button>
        </div>

        {/* Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-5">
            {/* Username field (only for sign up) */}
            {isSignUp && (
              <div>
                <label htmlFor="username" className="label">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required={isSignUp}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-field"
                  placeholder="Choose a username"
                />
              </div>
            )}

            {/* Email field */}
            <div>
              <label htmlFor="email" className="label">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="Enter your email"
              />
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isSignUp ? "new-password" : "current-password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder={isSignUp ? "Create a password" : "Enter your password"}
              />
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="rounded-md p-4" style={{ backgroundColor: '#FEE', border: '1px solid #FCC' }}>
              <p className="text-sm" style={{ color: '#C33' }}>{error}</p>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed py-3"
          >
            {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>

          {/* Additional links */}
          {!isSignUp && (
            <div className="text-center mt-4">
              <Link
                to="/forgot-password"
                className="text-sm"
                style={{ color: 'var(--color-primary)' }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                Forgot your password?
              </Link>
            </div>
          )}
        </form>

        {/* Back to home link */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-sm"
            style={{ color: 'var(--color-text-body)' }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            ← Back to home
          </Link>
        </div>
        </div>
      </div>
    </main>
  )
}

export default SignIn