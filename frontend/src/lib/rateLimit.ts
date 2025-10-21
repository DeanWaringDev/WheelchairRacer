/**
 * Client-Side Rate Limiting Utility
 * 
 * Provides rate limiting functionality to prevent spam and abuse.
 * Note: This is client-side only. For production, implement server-side
 * rate limiting using Supabase Edge Functions or middleware.
 */

interface RateLimitConfig {
  maxAttempts: number
  windowMs: number // Time window in milliseconds
  blockDurationMs?: number // How long to block after exceeding limit
}

interface RateLimitEntry {
  count: number
  resetAt: number
  blockedUntil?: number
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map()

  /**
   * Check if an action is rate limited
   * @param key - Unique key for the action (e.g., 'login:user@email.com')
   * @param config - Rate limit configuration
   * @returns true if allowed, false if rate limited
   */
  check(key: string, config: RateLimitConfig): boolean {
    const now = Date.now()
    const entry = this.limits.get(key)

    // Check if currently blocked
    if (entry?.blockedUntil && entry.blockedUntil > now) {
      return false
    }

    // Clean up expired entry or create new one
    if (!entry || entry.resetAt < now) {
      this.limits.set(key, {
        count: 1,
        resetAt: now + config.windowMs,
      })
      return true
    }

    // Increment counter
    entry.count++

    // Check if limit exceeded
    if (entry.count > config.maxAttempts) {
      if (config.blockDurationMs) {
        entry.blockedUntil = now + config.blockDurationMs
      }
      return false
    }

    return true
  }

  /**
   * Get remaining attempts before rate limit
   * @param key - Unique key for the action
   * @param config - Rate limit configuration
   * @returns Number of remaining attempts
   */
  remaining(key: string, config: RateLimitConfig): number {
    const entry = this.limits.get(key)
    if (!entry || entry.resetAt < Date.now()) {
      return config.maxAttempts
    }
    return Math.max(0, config.maxAttempts - entry.count)
  }

  /**
   * Get time until reset in milliseconds
   * @param key - Unique key for the action
   * @returns Milliseconds until reset, or 0 if not limited
   */
  resetIn(key: string): number {
    const entry = this.limits.get(key)
    if (!entry) return 0
    
    const now = Date.now()
    if (entry.blockedUntil && entry.blockedUntil > now) {
      return entry.blockedUntil - now
    }
    
    return Math.max(0, entry.resetAt - now)
  }

  /**
   * Clear rate limit for a specific key
   * @param key - Unique key to clear
   */
  clear(key: string): void {
    this.limits.delete(key)
  }

  /**
   * Clear all rate limits
   */
  clearAll(): void {
    this.limits.clear()
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.limits.entries()) {
      if (entry.resetAt < now && (!entry.blockedUntil || entry.blockedUntil < now)) {
        this.limits.delete(key)
      }
    }
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter()

// Predefined rate limit configurations
export const RateLimits = {
  // Authentication
  LOGIN: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 15 * 60 * 1000, // Block for 15 minutes
  },
  SIGNUP: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDurationMs: 60 * 60 * 1000, // Block for 1 hour
  },
  PASSWORD_RESET: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
  },

  // Content creation
  POST_CREATE: {
    maxAttempts: 5,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  COMMENT_CREATE: {
    maxAttempts: 10,
    windowMs: 10 * 60 * 1000, // 10 minutes
  },
  FORUM_TOPIC: {
    maxAttempts: 5,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  FORUM_REPLY: {
    maxAttempts: 15,
    windowMs: 10 * 60 * 1000, // 10 minutes
  },

  // Contact/Email
  CONTACT_FORM: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  EMAIL_SEND: {
    maxAttempts: 5,
    windowMs: 60 * 60 * 1000, // 1 hour
  },

  // File uploads
  IMAGE_UPLOAD: {
    maxAttempts: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
  },

  // General API calls
  API_CALL: {
    maxAttempts: 100,
    windowMs: 60 * 1000, // 1 minute
  },
} as const

// Auto-cleanup expired entries every 5 minutes
setInterval(() => {
  rateLimiter.cleanup()
}, 5 * 60 * 1000)

/**
 * Helper function to format time remaining
 * @param ms - Milliseconds
 * @returns Human-readable string
 */
export const formatTimeRemaining = (ms: number): string => {
  const seconds = Math.ceil(ms / 1000)
  if (seconds < 60) return `${seconds} second${seconds !== 1 ? 's' : ''}`
  
  const minutes = Math.ceil(seconds / 60)
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''}`
  
  const hours = Math.ceil(minutes / 60)
  return `${hours} hour${hours !== 1 ? 's' : ''}`
}
