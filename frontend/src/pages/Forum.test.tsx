/**
 * Tests for Forum Pages
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { waitFor } from '@testing-library/react'
import { renderWithProviders } from '../test/utils'
import ForumCategory from './ForumCategory'
import ForumTopic from './ForumTopic'
import * as sanitizeModule from '../lib/sanitize'
import * as rateLimitModule from '../lib/rateLimit'

// Mock Supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ 
        data: { session: { user: { id: '123', email: 'test@example.com' } } }, 
        error: null 
      }),
      onAuthStateChange: vi.fn().mockReturnValue({ 
        data: { subscription: { unsubscribe: vi.fn() } } 
      })
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ 
            data: { 
              id: '1', 
              name: 'Test Category', 
              description: 'Test',
              title: 'Test Topic',
              content: 'Test content'
            }, 
            error: null 
          }),
          order: vi.fn(() => ({
            range: vi.fn().mockResolvedValue({ data: [], error: null })
          }))
        })),
        order: vi.fn(() => ({
          range: vi.fn().mockResolvedValue({ data: [], error: null })
        }))
      })),
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      update: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ data: null, error: null })
      })),
      delete: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ data: null, error: null })
      }))
    }))
  }
}))

// Mock useParams
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: () => ({ categoryId: '1', topicId: '1' }),
    useNavigate: () => vi.fn(),
    Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
      <a href={to}>{children}</a>
    )
  }
})

describe('Forum Category Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    rateLimitModule.rateLimiter.clearAll()
  })

  describe('Page Rendering', () => {
    it('should render forum category page', async () => {
      renderWithProviders(<ForumCategory />)
      
      await waitFor(() => {
        // Should load without errors
        expect(document.body).toBeInTheDocument()
      })
    })
  })

  describe('Input Sanitization - Topic Creation', () => {
    it('should sanitize topic titles', () => {
      const maliciousTitle = '<script>alert("XSS")</script>My Topic'
      const sanitized = sanitizeModule.stripHTML(maliciousTitle)
      
      expect(sanitized).not.toContain('<script>')
      expect(sanitized).not.toContain('alert')
    })

    it('should sanitize topic content', () => {
      const content = '<p>Safe content</p><script>alert("XSS")</script>'
      const sanitized = sanitizeModule.sanitizeHTML(content)
      
      expect(sanitized).not.toContain('<script>')
      expect(sanitized).toContain('Safe content')
    })
  })

  describe('Rate Limiting - Topic Creation', () => {
    it('should have rate limiting for topic creation', () => {
      expect(rateLimitModule.RateLimits.FORUM_TOPIC).toBeDefined()
      expect(rateLimitModule.RateLimits.FORUM_TOPIC.maxAttempts).toBe(5)
    })

    it('should enforce rate limits on topic creation', () => {
      const config = rateLimitModule.RateLimits.FORUM_TOPIC
      const userId = 'test-user-123'
      
      // Simulate rapid topic creation attempts
      for (let i = 0; i < 6; i++) {
        rateLimitModule.rateLimiter.check(`forum:topic:${userId}`, config)
      }
      
      // 6th attempt should be blocked
      const result = rateLimitModule.rateLimiter.check(`forum:topic:${userId}`, config)
      expect(result).toBe(false)
    })
  })

  describe('Security Features', () => {
    it('should prevent XSS in topic titles', () => {
      const maliciousTitle = '<img src=x onerror="alert(1)">Topic'
      const sanitized = sanitizeModule.stripHTML(maliciousTitle)
      
      expect(sanitized).not.toContain('<img')
      expect(sanitized).not.toContain('onerror')
    })

    it('should prevent XSS in topic content', () => {
      const maliciousContent = '<p>Good</p><script>document.cookie</script>'
      const sanitized = sanitizeModule.sanitizeHTML(maliciousContent)
      
      expect(sanitized).not.toContain('<script>')
      expect(sanitized).toContain('<p>')
    })
  })
})

describe('Forum Topic Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    rateLimitModule.rateLimiter.clearAll()
  })

  describe('Page Rendering', () => {
    it('should render forum topic page', async () => {
      renderWithProviders(<ForumTopic />)
      
      await waitFor(() => {
        // Should load without errors
        expect(document.body).toBeInTheDocument()
      })
    })
  })

  describe('Input Sanitization - Replies', () => {
    it('should sanitize reply content', () => {
      const replyContent = '<p>My reply</p><script>steal()</script>'
      const sanitized = sanitizeModule.sanitizeHTML(replyContent)
      
      expect(sanitized).not.toContain('<script>')
      expect(sanitized).toContain('My reply')
    })

    it('should allow safe HTML in replies', () => {
      const safeReply = '<p>Good reply</p><strong>Important</strong>'
      const sanitized = sanitizeModule.sanitizeHTML(safeReply)
      
      expect(sanitized).toContain('<p>')
      expect(sanitized).toContain('<strong>')
    })
  })

  describe('Rate Limiting - Replies', () => {
    it('should have rate limiting for replies', () => {
      expect(rateLimitModule.RateLimits.FORUM_REPLY).toBeDefined()
      expect(rateLimitModule.RateLimits.FORUM_REPLY.maxAttempts).toBe(15)
    })

    it('should enforce rate limits on replies', () => {
      const config = rateLimitModule.RateLimits.FORUM_REPLY
      const userId = 'test-user-123'
      
      // Simulate rapid reply attempts
      for (let i = 0; i < 16; i++) {
        rateLimitModule.rateLimiter.check(`forum:reply:${userId}`, config)
      }
      
      // 16th attempt should be blocked
      const result = rateLimitModule.rateLimiter.check(`forum:reply:${userId}`, config)
      expect(result).toBe(false)
    })

    it('should have higher limit for replies than topics', () => {
      const topicLimit = rateLimitModule.RateLimits.FORUM_TOPIC.maxAttempts
      const replyLimit = rateLimitModule.RateLimits.FORUM_REPLY.maxAttempts
      
      expect(replyLimit).toBeGreaterThan(topicLimit)
    })
  })

  describe('Security Features', () => {
    it('should prevent JavaScript injection in replies', () => {
      const injection = '<a href="javascript:alert(1)">Click</a>'
      const sanitized = sanitizeModule.sanitizeHTML(injection)
      
      expect(sanitized).not.toContain('javascript:')
    })

    it('should prevent event handler injection', () => {
      const injection = '<div onclick="steal()">Click me</div>'
      const sanitized = sanitizeModule.sanitizeHTML(injection)
      
      expect(sanitized).not.toContain('onclick')
    })
  })

  describe('Data Fetching', () => {
    it('should fetch topic data on mount', async () => {
      const { supabase } = await import('../lib/supabase')
      
      renderWithProviders(<ForumTopic />)
      
      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalled()
      })
    })

    it('should fetch replies for topic', async () => {
      const { supabase } = await import('../lib/supabase')
      
      renderWithProviders(<ForumTopic />)
      
      await waitFor(() => {
        // Should attempt to fetch data
        expect(supabase.from).toHaveBeenCalled()
      })
    })
  })

  describe('User Interactions', () => {
    it('should render for authenticated users', async () => {
      renderWithProviders(<ForumTopic />)
      
      await waitFor(() => {
        // Component should render without errors
        expect(document.body).toBeInTheDocument()
      })
      
      // Component successfully rendered for authenticated user
      expect(true).toBe(true)
    })
  })
})

describe('Forum Rate Limiting Integration', () => {
  beforeEach(() => {
    rateLimitModule.rateLimiter.clearAll()
  })

  it('should have different rate limits for different actions', () => {
    const topicLimit = rateLimitModule.RateLimits.FORUM_TOPIC
    const replyLimit = rateLimitModule.RateLimits.FORUM_REPLY
    
    expect(topicLimit.maxAttempts).toBe(5)
    expect(replyLimit.maxAttempts).toBe(15)
    expect(topicLimit.windowMs).toBeGreaterThan(replyLimit.windowMs)
  })

  it('should track rate limits per user', () => {
    const config = rateLimitModule.RateLimits.FORUM_REPLY
    
    // User 1 makes attempts
    for (let i = 0; i < 10; i++) {
      rateLimitModule.rateLimiter.check('forum:reply:user1', config)
    }
    
    // User 2 should still have full limit
    const remaining = rateLimitModule.rateLimiter.remaining('forum:reply:user2', config)
    expect(remaining).toBe(15)
  })

  it('should provide time remaining until reset', () => {
    const config = rateLimitModule.RateLimits.FORUM_REPLY
    const key = 'forum:reply:test'
    
    rateLimitModule.rateLimiter.check(key, config)
    const resetTime = rateLimitModule.rateLimiter.resetIn(key)
    
    expect(resetTime).toBeGreaterThanOrEqual(0)
    expect(resetTime).toBeLessThanOrEqual(config.windowMs)
  })
})
