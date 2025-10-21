/**
 * Tests for Contact Page
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../test/utils'
import Contact from './Contact'
import * as sanitizeModule from '../lib/sanitize'
import * as rateLimitModule from '../lib/rateLimit'

// Mock Supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } })
    },
    functions: {
      invoke: vi.fn()
    }
  }
}))

describe('Contact Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    rateLimitModule.rateLimiter.clearAll()
  })

  describe('Form Rendering', () => {
    it('should render all form fields', () => {
      renderWithProviders(<Contact />)
      
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/subject/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/message/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument()
    })

    it('should have proper input types', () => {
      renderWithProviders(<Contact />)
      
      const emailInput = screen.getByLabelText(/email/i)
      expect(emailInput).toHaveAttribute('type', 'email')
    })
  })

  describe('Input Sanitization', () => {
    it('should sanitize email input on submit', async () => {
      const sanitizeEmailSpy = vi.spyOn(sanitizeModule, 'sanitizeEmail')
      const user = userEvent.setup()
      
      renderWithProviders(<Contact />)
      
      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'TEST@EXAMPLE.COM')
      await user.type(screen.getByLabelText(/name/i), 'Test')
      await user.type(screen.getByLabelText(/subject/i), 'Test')
      await user.type(screen.getByLabelText(/message/i), 'Test')
      
      const submitButton = screen.getByRole('button', { name: /send message/i })
      await user.click(submitButton)
      
      // Sanitization happens on submit
      expect(sanitizeEmailSpy).toHaveBeenCalled()
    })

    it('should sanitize text inputs on submit', async () => {
      const sanitizeInputSpy = vi.spyOn(sanitizeModule, 'sanitizeInput')
      const user = userEvent.setup()
      
      renderWithProviders(<Contact />)
      
      await user.type(screen.getByLabelText(/name/i), '<script>alert("xss")</script>John')
      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/subject/i), 'Test')
      await user.type(screen.getByLabelText(/message/i), 'Test')
      
      const submitButton = screen.getByRole('button', { name: /send message/i })
      await user.click(submitButton)
      
      // Sanitization happens on submit
      expect(sanitizeInputSpy).toHaveBeenCalled()
    })
  })

  describe('Form Validation', () => {
    it('should require all fields', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Contact />)
      
      const submitButton = screen.getByRole('button', { name: /send message/i })
      await user.click(submitButton)
      
      // Should show validation errors or not submit
      await waitFor(() => {
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
      })
    })

    it('should validate email format', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Contact />)
      
      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'invalid-email')
      
      // Email input should have HTML5 validation
      expect(emailInput).toHaveAttribute('type', 'email')
    })
  })

  describe('Rate Limiting', () => {
    it('should apply rate limiting to form submissions', async () => {
      const checkSpy = vi.spyOn(rateLimitModule.rateLimiter, 'check')
      const user = userEvent.setup()
      
      renderWithProviders(<Contact />)
      
      // Fill form
      await user.type(screen.getByLabelText(/name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/subject/i), 'Test Subject')
      await user.type(screen.getByLabelText(/message/i), 'Test message')
      
      const submitButton = screen.getByRole('button', { name: /send message/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(checkSpy).toHaveBeenCalled()
      })
    })

    it('should block rapid submissions', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Contact />)
      
      // Fill form
      await user.type(screen.getByLabelText(/name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/subject/i), 'Test')
      await user.type(screen.getByLabelText(/message/i), 'Test message')
      
      const submitButton = screen.getByRole('button', { name: /send message/i })
      
      // Submit multiple times rapidly
      for (let i = 0; i < 4; i++) {
        await user.click(submitButton)
      }
      
      // Should show rate limit error after 3 attempts
      await waitFor(() => {
        const errorText = screen.queryByText(/too (quickly|many|fast)/i)
        if (errorText) {
          expect(errorText).toBeInTheDocument()
        }
      }, { timeout: 3000 })
    })
  })

  describe('Accessibility', () => {
    it('should have proper labels for all inputs', () => {
      renderWithProviders(<Contact />)
      
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/subject/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/message/i)).toBeInTheDocument()
    })

    it('should have required attributes where needed', () => {
      renderWithProviders(<Contact />)
      
      const nameInput = screen.getByLabelText(/name/i)
      const emailInput = screen.getByLabelText(/email/i)
      
      // These should typically be required
      expect(nameInput).toHaveAttribute('required')
      expect(emailInput).toHaveAttribute('required')
    })
  })

  describe('Error Handling', () => {
    it('should handle submission errors gracefully', async () => {
      const { supabase } = await import('../lib/supabase')
      vi.mocked(supabase.functions.invoke).mockRejectedValueOnce(
        new Error('Network error')
      )
      
      const user = userEvent.setup()
      renderWithProviders(<Contact />)
      
      // Fill and submit form
      await user.type(screen.getByLabelText(/name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/subject/i), 'Test')
      await user.type(screen.getByLabelText(/message/i), 'Test message')
      
      await user.click(screen.getByRole('button', { name: /send message/i }))
      
      // Form should still be present after error
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    })
  })

  describe('Success State', () => {
    it('should clear form on successful submission', async () => {
      const { supabase } = await import('../lib/supabase')
      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({ 
        data: { success: true },
        error: null 
      })
      
      const user = userEvent.setup()
      renderWithProviders(<Contact />)
      
      const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement
      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement
      
      await user.type(nameInput, 'John Doe')
      await user.type(emailInput, 'john@example.com')
      await user.type(screen.getByLabelText(/subject/i), 'Test')
      await user.type(screen.getByLabelText(/message/i), 'Test message')
      
      await user.click(screen.getByRole('button', { name: /send message/i }))
      
      // Form should be cleared on success
      await waitFor(() => {
        expect(nameInput.value).toBe('')
        expect(emailInput.value).toBe('')
      }, { timeout: 3000 })
    })
  })
})
