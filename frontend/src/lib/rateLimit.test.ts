/**
 * Tests for Rate Limiting Utilities
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { rateLimiter, RateLimits, formatTimeRemaining } from '../lib/rateLimit'

describe('RateLimiter', () => {
  beforeEach(() => {
    rateLimiter.clearAll()
    vi.clearAllTimers()
  })

  describe('check', () => {
    it('should allow first attempt', () => {
      const result = rateLimiter.check('test-key', { maxAttempts: 3, windowMs: 1000 })
      expect(result).toBe(true)
    })

    it('should allow attempts up to limit', () => {
      const config = { maxAttempts: 3, windowMs: 1000 }
      
      expect(rateLimiter.check('test-key', config)).toBe(true)
      expect(rateLimiter.check('test-key', config)).toBe(true)
      expect(rateLimiter.check('test-key', config)).toBe(true)
    })

    it('should block after exceeding limit', () => {
      const config = { maxAttempts: 3, windowMs: 1000 }
      
      rateLimiter.check('test-key', config)
      rateLimiter.check('test-key', config)
      rateLimiter.check('test-key', config)
      
      expect(rateLimiter.check('test-key', config)).toBe(false)
    })

    it('should reset after time window', () => {
      vi.useFakeTimers()
      const config = { maxAttempts: 2, windowMs: 1000 }
      
      rateLimiter.check('test-key', config)
      rateLimiter.check('test-key', config)
      expect(rateLimiter.check('test-key', config)).toBe(false)
      
      // Advance time past window
      vi.advanceTimersByTime(1001)
      
      expect(rateLimiter.check('test-key', config)).toBe(true)
      
      vi.useRealTimers()
    })

    it('should handle different keys separately', () => {
      const config = { maxAttempts: 2, windowMs: 1000 }
      
      rateLimiter.check('key1', config)
      rateLimiter.check('key1', config)
      expect(rateLimiter.check('key1', config)).toBe(false)
      
      expect(rateLimiter.check('key2', config)).toBe(true)
    })

    it('should block for blockDuration when specified', () => {
      vi.useFakeTimers()
      const config = { 
        maxAttempts: 2, 
        windowMs: 1000,
        blockDurationMs: 5000
      }
      
      rateLimiter.check('test-key', config)
      rateLimiter.check('test-key', config)
      rateLimiter.check('test-key', config) // Exceeds limit, starts block
      
      // Advance past window but not past block
      vi.advanceTimersByTime(1001)
      expect(rateLimiter.check('test-key', config)).toBe(false)
      
      // Advance past block
      vi.advanceTimersByTime(4000)
      expect(rateLimiter.check('test-key', config)).toBe(true)
      
      vi.useRealTimers()
    })
  })

  describe('remaining', () => {
    it('should return max attempts initially', () => {
      const config = { maxAttempts: 5, windowMs: 1000 }
      expect(rateLimiter.remaining('test-key', config)).toBe(5)
    })

    it('should decrease with each attempt', () => {
      const config = { maxAttempts: 5, windowMs: 1000 }
      
      rateLimiter.check('test-key', config)
      expect(rateLimiter.remaining('test-key', config)).toBe(4)
      
      rateLimiter.check('test-key', config)
      expect(rateLimiter.remaining('test-key', config)).toBe(3)
    })

    it('should return 0 when limit exceeded', () => {
      const config = { maxAttempts: 2, windowMs: 1000 }
      
      rateLimiter.check('test-key', config)
      rateLimiter.check('test-key', config)
      rateLimiter.check('test-key', config)
      
      expect(rateLimiter.remaining('test-key', config)).toBe(0)
    })
  })

  describe('resetIn', () => {
    it('should return 0 for new key', () => {
      expect(rateLimiter.resetIn('test-key')).toBe(0)
    })

    it('should return time until reset', () => {
      vi.useFakeTimers()
      const config = { maxAttempts: 2, windowMs: 1000 }
      
      rateLimiter.check('test-key', config)
      
      const resetTime = rateLimiter.resetIn('test-key')
      expect(resetTime).toBeGreaterThan(0)
      expect(resetTime).toBeLessThanOrEqual(1000)
      
      vi.useRealTimers()
    })

    it('should return block time when blocked', () => {
      vi.useFakeTimers()
      const config = { 
        maxAttempts: 1, 
        windowMs: 1000,
        blockDurationMs: 5000
      }
      
      rateLimiter.check('test-key', config)
      rateLimiter.check('test-key', config) // Trigger block
      
      const resetTime = rateLimiter.resetIn('test-key')
      expect(resetTime).toBeGreaterThan(0)
      expect(resetTime).toBeLessThanOrEqual(5000)
      
      vi.useRealTimers()
    })
  })

  describe('clear', () => {
    it('should clear specific key', () => {
      const config = { maxAttempts: 2, windowMs: 1000 }
      
      rateLimiter.check('test-key', config)
      rateLimiter.check('test-key', config)
      expect(rateLimiter.check('test-key', config)).toBe(false)
      
      rateLimiter.clear('test-key')
      expect(rateLimiter.check('test-key', config)).toBe(true)
    })

    it('should not affect other keys', () => {
      const config = { maxAttempts: 2, windowMs: 1000 }
      
      rateLimiter.check('key1', config)
      rateLimiter.check('key2', config)
      
      rateLimiter.clear('key1')
      
      expect(rateLimiter.remaining('key1', config)).toBe(2)
      expect(rateLimiter.remaining('key2', config)).toBe(1)
    })
  })

  describe('clearAll', () => {
    it('should clear all keys', () => {
      const config = { maxAttempts: 2, windowMs: 1000 }
      
      rateLimiter.check('key1', config)
      rateLimiter.check('key2', config)
      rateLimiter.check('key3', config)
      
      rateLimiter.clearAll()
      
      expect(rateLimiter.remaining('key1', config)).toBe(2)
      expect(rateLimiter.remaining('key2', config)).toBe(2)
      expect(rateLimiter.remaining('key3', config)).toBe(2)
    })
  })
})

describe('RateLimits configuration', () => {
  it('should have LOGIN configuration', () => {
    expect(RateLimits.LOGIN.maxAttempts).toBe(5)
    expect(RateLimits.LOGIN.windowMs).toBe(15 * 60 * 1000)
  })

  it('should have SIGNUP configuration', () => {
    expect(RateLimits.SIGNUP.maxAttempts).toBe(3)
    expect(RateLimits.SIGNUP.windowMs).toBe(60 * 60 * 1000)
  })

  it('should have POST_CREATE configuration', () => {
    expect(RateLimits.POST_CREATE.maxAttempts).toBe(5)
    expect(RateLimits.POST_CREATE.windowMs).toBe(60 * 60 * 1000)
  })

  it('should have COMMENT_CREATE configuration', () => {
    expect(RateLimits.COMMENT_CREATE.maxAttempts).toBe(10)
    expect(RateLimits.COMMENT_CREATE.windowMs).toBe(10 * 60 * 1000)
  })

  it('should have CONTACT_FORM configuration', () => {
    expect(RateLimits.CONTACT_FORM.maxAttempts).toBe(3)
    expect(RateLimits.CONTACT_FORM.windowMs).toBe(60 * 60 * 1000)
  })
})

describe('formatTimeRemaining', () => {
  it('should format seconds', () => {
    expect(formatTimeRemaining(1000)).toBe('1 second')
    expect(formatTimeRemaining(5000)).toBe('5 seconds')
    expect(formatTimeRemaining(30000)).toBe('30 seconds')
  })

  it('should format minutes', () => {
    expect(formatTimeRemaining(60000)).toBe('1 minute')
    expect(formatTimeRemaining(120000)).toBe('2 minutes')
    expect(formatTimeRemaining(600000)).toBe('10 minutes')
  })

  it('should format hours', () => {
    expect(formatTimeRemaining(3600000)).toBe('1 hour')
    expect(formatTimeRemaining(7200000)).toBe('2 hours')
    expect(formatTimeRemaining(36000000)).toBe('10 hours')
  })

  it('should round up', () => {
    expect(formatTimeRemaining(1500)).toBe('2 seconds')
    expect(formatTimeRemaining(90000)).toBe('2 minutes')
    expect(formatTimeRemaining(5400000)).toBe('2 hours')
  })

  it('should handle edge cases', () => {
    expect(formatTimeRemaining(0)).toBe('0 seconds')
    expect(formatTimeRemaining(500)).toBe('1 second')
  })
})
