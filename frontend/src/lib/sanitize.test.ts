/**
 * Tests for Sanitization Utilities
 */

import { describe, it, expect } from 'vitest'
import {
  sanitizeHTML,
  sanitizeRichText,
  stripHTML,
  sanitizeInput,
  sanitizeURL,
  sanitizeEmail,
  sanitizeUsername,
} from '../lib/sanitize'

describe('sanitizeHTML', () => {
  it('should allow basic HTML tags', () => {
    const input = '<p>Hello <b>world</b>!</p>'
    const output = sanitizeHTML(input)
    expect(output).toContain('<p>')
    expect(output).toContain('<b>')
  })

  it('should remove script tags', () => {
    const input = '<p>Hello</p><script>alert("XSS")</script>'
    const output = sanitizeHTML(input)
    expect(output).not.toContain('<script>')
    expect(output).not.toContain('alert')
  })

  it('should remove onclick attributes', () => {
    const input = '<div onclick="alert(1)">Click me</div>'
    const output = sanitizeHTML(input)
    expect(output).not.toContain('onclick')
  })

  it('should remove javascript: URLs', () => {
    const input = '<a href="javascript:alert(1)">Link</a>'
    const output = sanitizeHTML(input)
    expect(output).not.toContain('javascript:')
  })

  it('should allow safe links', () => {
    const input = '<a href="https://example.com">Link</a>'
    const output = sanitizeHTML(input)
    expect(output).toContain('href="https://example.com"')
  })
})

describe('sanitizeRichText', () => {
  it('should allow more HTML tags than basic sanitize', () => {
    const input = '<div><img src="test.jpg" alt="test" /><table><tr><td>Cell</td></tr></table></div>'
    const output = sanitizeRichText(input)
    expect(output).toContain('<img')
    expect(output).toContain('<table>')
  })

  it('should still remove dangerous content', () => {
    const input = '<div><script>alert("XSS")</script></div>'
    const output = sanitizeRichText(input)
    expect(output).not.toContain('<script>')
  })
})

describe('stripHTML', () => {
  it('should remove all HTML tags', () => {
    const input = '<p>Hello <b>world</b>!</p>'
    const output = stripHTML(input)
    expect(output).toBe('Hello world!')
  })

  it('should handle script tags', () => {
    const input = '<script>alert("XSS")</script>Hello'
    const output = stripHTML(input)
    expect(output).not.toContain('<')
    expect(output).not.toContain('>')
  })

  it('should handle nested tags', () => {
    const input = '<div><p><span>Test</span></p></div>'
    const output = stripHTML(input)
    expect(output).toBe('Test')
  })
})

describe('sanitizeInput', () => {
  it('should remove HTML and escape special characters', () => {
    // DOMPurify removes script tags and their content
    const input1 = '<script>alert("test")</script>'
    expect(sanitizeInput(input1)).toBe('')
    
    // For non-script tags, it extracts text and escapes it
    // Note: DOMPurify already escapes &, then we escape it again
    const input2 = '<div>Hello "World" & <span>Friends</span></div>'
    const output2 = sanitizeInput(input2)
    expect(output2).toBe('Hello &quot;World&quot; &amp;amp; Friends')
  })

  it('should handle quotes', () => {
    const input = 'He said "hello" and \'goodbye\''
    const output = sanitizeInput(input)
    expect(output).toContain('&quot;')
    expect(output).toContain('&#x27;')
  })

  it('should handle ampersands', () => {
    const input = 'Tom & Jerry'
    const output = sanitizeInput(input)
    expect(output).toContain('&amp;')
  })
})

describe('sanitizeURL', () => {
  it('should allow http URLs', () => {
    const input = 'http://example.com'
    const output = sanitizeURL(input)
    expect(output).toBe('http://example.com')
  })

  it('should allow https URLs', () => {
    const input = 'https://example.com'
    const output = sanitizeURL(input)
    expect(output).toBe('https://example.com')
  })

  it('should allow relative URLs', () => {
    const input = '/path/to/page'
    const output = sanitizeURL(input)
    expect(output).toBe('/path/to/page')
  })

  it('should block javascript: URLs', () => {
    const input = 'javascript:alert(1)'
    const output = sanitizeURL(input)
    expect(output).toBe('')
  })

  it('should block data: URLs', () => {
    const input = 'data:text/html,<script>alert(1)</script>'
    const output = sanitizeURL(input)
    expect(output).toBe('')
  })

  it('should block file: URLs', () => {
    const input = 'file:///etc/passwd'
    const output = sanitizeURL(input)
    expect(output).toBe('')
  })
})

describe('sanitizeEmail', () => {
  it('should accept valid email addresses', () => {
    const input = 'test@example.com'
    const output = sanitizeEmail(input)
    expect(output).toBe('test@example.com')
  })

  it('should trim and lowercase emails', () => {
    const input = '  TEST@EXAMPLE.COM  '
    const output = sanitizeEmail(input)
    expect(output).toBe('test@example.com')
  })

  it('should reject invalid emails', () => {
    expect(sanitizeEmail('notanemail')).toBe('')
    expect(sanitizeEmail('missing@domain')).toBe('')
    expect(sanitizeEmail('@example.com')).toBe('')
  })
})

describe('sanitizeUsername', () => {
  it('should allow alphanumeric characters', () => {
    const input = 'user123'
    const output = sanitizeUsername(input)
    expect(output).toBe('user123')
  })

  it('should allow underscores and hyphens', () => {
    const input = 'user_name-123'
    const output = sanitizeUsername(input)
    expect(output).toBe('user_name-123')
  })

  it('should remove special characters', () => {
    const input = 'user!@#$name'
    const output = sanitizeUsername(input)
    expect(output).toBe('username')
  })

  it('should convert to lowercase', () => {
    const input = 'UserName'
    const output = sanitizeUsername(input)
    expect(output).toBe('username')
  })

  it('should limit length to 50 characters', () => {
    const input = 'a'.repeat(100)
    const output = sanitizeUsername(input)
    expect(output.length).toBe(50)
  })

  it('should trim whitespace', () => {
    const input = '  username  '
    const output = sanitizeUsername(input)
    expect(output).toBe('username')
  })
})
