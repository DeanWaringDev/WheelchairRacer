/**
 * Input Sanitization Utilities
 * 
 * Provides functions to sanitize user input and prevent XSS attacks.
 * Uses DOMPurify to clean HTML content and prevent malicious scripts.
 */

import DOMPurify from 'dompurify'

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param dirty - Untrusted HTML string
 * @returns Sanitized HTML string safe for rendering
 */
export const sanitizeHTML = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre'
    ],
    ALLOWED_ATTR: ['href', 'title', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
  })
}

/**
 * Sanitize HTML for rich text content (blog posts, forum posts)
 * Allows more HTML tags for formatted content
 * @param dirty - Untrusted HTML string
 * @returns Sanitized HTML string
 */
export const sanitizeRichText = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre',
      'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr', 'div', 'span'
    ],
    ALLOWED_ATTR: ['href', 'title', 'target', 'rel', 'src', 'alt', 'width', 'height', 'class'],
    ALLOW_DATA_ATTR: false,
  })
}

/**
 * Strip all HTML tags and return plain text
 * Use for usernames, titles, etc. where HTML should never be allowed
 * @param dirty - Untrusted string
 * @returns Plain text string with all HTML removed
 */
export const stripHTML = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  })
}

/**
 * Sanitize user input for safe display
 * Escapes special characters but preserves line breaks
 * @param input - Untrusted user input
 * @returns Escaped string safe for display
 */
export const sanitizeInput = (input: string): string => {
  return stripHTML(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * Sanitize URL to prevent javascript: and data: URLs
 * @param url - Untrusted URL string
 * @returns Sanitized URL or empty string if invalid
 */
export const sanitizeURL = (url: string): string => {
  const cleanUrl = url.trim().toLowerCase()
  
  // Block dangerous protocols
  if (
    cleanUrl.startsWith('javascript:') ||
    cleanUrl.startsWith('data:') ||
    cleanUrl.startsWith('vbscript:') ||
    cleanUrl.startsWith('file:')
  ) {
    return ''
  }
  
  // Allow relative URLs, http, and https
  if (
    cleanUrl.startsWith('/') ||
    cleanUrl.startsWith('./') ||
    cleanUrl.startsWith('../') ||
    cleanUrl.startsWith('http://') ||
    cleanUrl.startsWith('https://')
  ) {
    return url.trim()
  }
  
  return ''
}

/**
 * Validate and sanitize email address
 * @param email - Email address to validate
 * @returns Sanitized email or empty string if invalid
 */
export const sanitizeEmail = (email: string): string => {
  const cleaned = email.trim().toLowerCase()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  return emailRegex.test(cleaned) ? cleaned : ''
}

/**
 * Sanitize username - alphanumeric, underscores, hyphens only
 * @param username - Username to sanitize
 * @returns Sanitized username
 */
export const sanitizeUsername = (username: string): string => {
  return username
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '')
    .substring(0, 50) // Limit length
}
