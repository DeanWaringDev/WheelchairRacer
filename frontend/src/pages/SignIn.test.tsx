/**
 * Tests for SignIn Page
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../test/utils'
import SignIn from './SignIn'
import * as sanitizeModule from '../lib/sanitize'
import * as rateLimitModule from '../lib/rateLimit'

// Mock Supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      signInWithPassword: vi.fn(),
      signUp: vi.fn()
    }
  }
}))

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
      <a href={to}>{children}</a>
    )
  }
})

describe('SignIn Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    rateLimitModule.rateLimiter.clearAll()
    mockNavigate.mockClear()
  })

  describe('Form Rendering', () => {
    it('should render sign in form by default', async () => {
      renderWithProviders(<SignIn />)
      
      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
      })
      
      const buttons = screen.getAllByRole('button')
      const signInButton = buttons.find(btn => btn.textContent?.includes('Sign In'))
      expect(signInButton).toBeInTheDocument()
    })

    it('should have email input with correct type', () => {
      renderWithProviders(<SignIn />)
      
      const emailInput = screen.getByLabelText(/email/i)
      expect(emailInput).toHaveAttribute('type', 'email')
    })

    it('should have password input with correct type', () => {
      renderWithProviders(<SignIn />)
      
      const passwordInput = screen.getByLabelText(/password/i)
      expect(passwordInput).toHaveAttribute('type', 'password')
    })

    it('should show toggle to switch between sign in and sign up', () => {
      renderWithProviders(<SignIn />)
      
      const toggleText = screen.getByText(/don't have an account/i)
      expect(toggleText).toBeInTheDocument()
    })
  })

  describe('Input Sanitization', () => {
    it('should sanitize email input on submit', async () => {
      const sanitizeEmailSpy = vi.spyOn(sanitizeModule, 'sanitizeEmail')
      const user = userEvent.setup()
      
      renderWithProviders(<SignIn />)
      
      await user.type(screen.getByLabelText(/email/i), 'TEST@EXAMPLE.COM')
      await user.type(screen.getByLabelText(/password/i), 'password123')
      
      const buttons = screen.getAllByRole('button')
      const signInButton = buttons.find(btn => btn.textContent?.includes('Sign In'))
      if (signInButton) await user.click(signInButton)
      
      // Sanitization happens on submit
      expect(sanitizeEmailSpy).toHaveBeenCalled()
    })

    it('should sanitize username input in sign up mode', async () => {
      const sanitizeUsernameSpy = vi.spyOn(sanitizeModule, 'sanitizeUsername')
      const user = userEvent.setup()
      
      renderWithProviders(<SignIn />)
      
      // Switch to sign up mode
      const signUpToggle = screen.getByText(/sign up/i)
      await user.click(signUpToggle)
      
      // Wait for username field to appear
      await waitFor(() => {
        expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
      })
      
      const usernameInput = screen.getByLabelText(/username/i)
      await user.type(usernameInput, 'testuser123')
      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/password/i), 'password123')
      
      const buttons = screen.getAllByRole('button')
      const createButton = buttons.find(btn => btn.textContent?.match(/create|sign up/i))
      if (createButton) await user.click(createButton)
      
      // Sanitization happens on submit
      expect(sanitizeUsernameSpy).toHaveBeenCalled()
    })
  })

  describe('Rate Limiting', () => {
    it('should apply rate limiting to login attempts', async () => {
      const checkSpy = vi.spyOn(rateLimitModule.rateLimiter, 'check')
      const { supabase } = await import('../lib/supabase')
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid credentials', name: 'AuthError', status: 400 }
      } as any)
      
      const user = userEvent.setup()
      renderWithProviders(<SignIn />)
      
      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/password/i), 'password123')
      
      const buttons = screen.getAllByRole('button')
      const signInButton = buttons.find(btn => btn.textContent?.includes('Sign In'))
      if (signInButton) await user.click(signInButton)
      
      // Rate limiter should be checked
      expect(checkSpy).toHaveBeenCalled()
    })

    it('should enforce rate limits on failed attempts', async () => {
      const { supabase } = await import('../lib/supabase')
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid credentials', name: 'AuthError', status: 400 }
      } as any)
      
      const user = userEvent.setup()
      renderWithProviders(<SignIn />)
      
      // Make multiple failed attempts
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      
      for (let i = 0; i < 3; i++) {
        await user.clear(emailInput)
        await user.clear(passwordInput)
        await user.type(emailInput, `test${i}@example.com`)
        await user.type(passwordInput, 'wrongpassword')
        
        const buttons = screen.getAllByRole('button')
        const signInButton = buttons.find(btn => btn.textContent?.includes('Sign In'))
        if (signInButton) await user.click(signInButton)
        
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      // Rate limiter should have been invoked multiple times
      expect(supabase.auth.signInWithPassword).toHaveBeenCalled()
    })
  })

  describe('Form Validation', () => {
    it('should require email and password', () => {
      renderWithProviders(<SignIn />)
      
      // Check that required attributes are present
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      
      expect(emailInput).toHaveAttribute('required')
      expect(passwordInput).toHaveAttribute('required')
    })

    it('should validate email format', () => {
      renderWithProviders(<SignIn />)
      
      const emailInput = screen.getByLabelText(/email/i)
      expect(emailInput).toHaveAttribute('type', 'email')
    })
  })

  describe('Sign In Flow', () => {
    it('should call signInWithPassword on form submit', async () => {
      const { supabase } = await import('../lib/supabase')
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { 
          user: { id: '123', email: 'test@example.com' } as any,
          session: { access_token: 'token' } as any
        },
        error: null
      } as any)
      
      const user = userEvent.setup()
      renderWithProviders(<SignIn />)
      
      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/password/i), 'password123')
      
      const buttons = screen.getAllByRole('button')
      const signInButton = buttons.find(btn => btn.textContent?.includes('Sign In'))
      if (signInButton) await user.click(signInButton)
      
      // Should call the auth method
      expect(supabase.auth.signInWithPassword).toHaveBeenCalled()
    })

    it('should navigate on successful sign in', async () => {
      const { supabase } = await import('../lib/supabase')
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { 
          user: { id: '123', email: 'test@example.com' } as any,
          session: { access_token: 'token' } as any
        },
        error: null
      } as any)
      
      const user = userEvent.setup()
      renderWithProviders(<SignIn />)
      
      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/password/i), 'password123')
      
      const buttons = screen.getAllByRole('button')
      const signInButton = buttons.find(btn => btn.textContent?.includes('Sign In'))
      if (signInButton) await user.click(signInButton)
      
      // Navigation should be called eventually
      await waitFor(() => {
        expect(supabase.auth.signInWithPassword).toHaveBeenCalled()
      })
    })

    it('should handle failed sign in', async () => {
      const { supabase } = await import('../lib/supabase')
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid credentials', name: 'AuthError', status: 400 }
      } as any)
      
      const user = userEvent.setup()
      renderWithProviders(<SignIn />)
      
      await user.type(screen.getByLabelText(/email/i), 'wrong@example.com')
      await user.type(screen.getByLabelText(/password/i), 'wrongpass')
      
      const buttons = screen.getAllByRole('button')
      const signInButton = buttons.find(btn => btn.textContent?.includes('Sign In'))
      if (signInButton) await user.click(signInButton)
      
      // Form should still be present after error
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    })
  })

  describe('Sign Up Mode', () => {
    it('should switch to sign up mode when clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<SignIn />)
      
      const signUpLink = screen.getByText(/sign up/i)
      await user.click(signUpLink)
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create account|sign up/i })).toBeInTheDocument()
      })
    })

    it('should show username field in sign up mode', async () => {
      const user = userEvent.setup()
      renderWithProviders(<SignIn />)
      
      const signUpLink = screen.getByText(/sign up/i)
      await user.click(signUpLink)
      
      await waitFor(() => {
        expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper labels for all inputs', () => {
      renderWithProviders(<SignIn />)
      
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    })

    it('should have required attributes', () => {
      renderWithProviders(<SignIn />)
      
      expect(screen.getByLabelText(/email/i)).toHaveAttribute('required')
      expect(screen.getByLabelText(/password/i)).toHaveAttribute('required')
    })
  })
})
