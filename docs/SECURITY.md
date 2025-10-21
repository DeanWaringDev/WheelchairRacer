# Security Implementation Guide

## Overview
This document outlines the security measures implemented in the Wheelchair Racer application.

## 1. Input Sanitization

### DOMPurify Integration
We use DOMPurify to sanitize all user-generated content and prevent XSS attacks.

**Location:** `frontend/src/lib/sanitize.ts`

### Available Functions

#### `sanitizeHTML(dirty: string): string`
Sanitizes HTML for basic formatted text (comments, short descriptions).
- **Allowed tags:** b, i, em, strong, a, p, br, ul, ol, li, headings, blockquote, code, pre
- **Use for:** Comments, forum replies, short descriptions

#### `sanitizeRichText(dirty: string): string`
Sanitizes HTML for rich text content with more formatting options.
- **Additional tags:** img, table, hr, div, span
- **Use for:** Blog posts, forum topics, long-form content

#### `stripHTML(dirty: string): string`
Removes all HTML tags completely.
- **Use for:** Usernames, titles, metadata

#### `sanitizeInput(input: string): string`
Escapes special characters for safe display.
- **Use for:** Plain text display where HTML should never render

#### `sanitizeURL(url: string): string`
Validates and sanitizes URLs to prevent javascript: and data: URLs.
- **Use for:** User-provided links, profile URLs

#### `sanitizeEmail(email: string): string`
Validates and cleans email addresses.
- **Use for:** Email inputs, contact forms

#### `sanitizeUsername(username: string): string`
Sanitizes usernames to alphanumeric, underscores, and hyphens only.
- **Use for:** Username inputs, display names

### Usage Examples

```typescript
import { sanitizeHTML, sanitizeUsername, sanitizeEmail } from '@/lib/sanitize'

// Sanitize user comment
const cleanComment = sanitizeHTML(userComment)

// Sanitize username on signup
const cleanUsername = sanitizeUsername(formData.username)

// Sanitize email
const cleanEmail = sanitizeEmail(formData.email)
```

### Where to Apply

✅ **Always sanitize:**
- Blog post content
- Forum topic titles and content
- Forum replies
- Comments on posts
- User profile information
- Contact form messages
- Any user-generated HTML content

✅ **Strip HTML from:**
- Usernames
- Display names
- Email addresses
- Titles
- Tags
- Search queries

## 2. Rate Limiting

### Client-Side Rate Limiting
We implement client-side rate limiting to prevent spam and abuse.

**Location:** `frontend/src/lib/rateLimit.ts`

### Configuration

Pre-configured rate limits are available in the `RateLimits` object:

```typescript
export const RateLimits = {
  LOGIN: { maxAttempts: 5, windowMs: 15 * 60 * 1000 },
  SIGNUP: { maxAttempts: 3, windowMs: 60 * 60 * 1000 },
  POST_CREATE: { maxAttempts: 5, windowMs: 60 * 60 * 1000 },
  COMMENT_CREATE: { maxAttempts: 10, windowMs: 10 * 60 * 1000 },
  CONTACT_FORM: { maxAttempts: 3, windowMs: 60 * 60 * 1000 },
  // ... and more
}
```

### Usage Example

```typescript
import { rateLimiter, RateLimits, formatTimeRemaining } from '@/lib/rateLimit'

// Check if action is allowed
const key = `action:${userId}`
if (!rateLimiter.check(key, RateLimits.POST_CREATE)) {
  const resetTime = rateLimiter.resetIn(key)
  throw new Error(`Rate limit exceeded. Try again in ${formatTimeRemaining(resetTime)}`)
}

// Perform action...

// Clear rate limit on success (optional)
rateLimiter.clear(key)
```

### Where to Apply

✅ **Apply rate limiting to:**
- Login attempts
- Signup attempts
- Password reset requests
- Blog post creation
- Comment creation
- Forum topic creation
- Forum replies
- Contact form submissions
- File uploads
- Email sending

### Current Implementation

Rate limiting is currently applied to:
- ✅ Sign In page (login and signup)

**TODO:** Apply to:
- [ ] Blog post creation
- [ ] Comment creation
- [ ] Forum topic/reply creation
- [ ] Contact form
- [ ] Profile picture uploads

## 3. Environment Variables

### Secure Configuration
Environment variables are stored in `.env.local` and excluded from version control.

**Protected variables:**
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Public anon key (safe for client-side)
- `VITE_ADMIN_USER_ID` - Admin user identifier

### .gitignore
Root `.gitignore` file ensures sensitive files are never committed:
- ✅ `.env.local`
- ✅ `node_modules/`
- ✅ Build artifacts
- ✅ Temporary files

## 4. Database Security

### Row Level Security (RLS)
All tables have RLS enabled with proper policies.

**Posts table policies:**
- Everyone can view posts (SELECT)
- Only admin can create posts (INSERT)
- Only admin can update posts (UPDATE)
- Only admin can delete posts (DELETE)

**Profiles table policies:**
- Everyone can view profiles (SELECT)
- Users can update their own profile (UPDATE)

### Function Security
All database functions use:
- `SECURITY DEFINER` for privilege elevation
- `SET search_path = public` to prevent search path attacks

**Example:**
```sql
CREATE OR REPLACE FUNCTION public.update_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Function logic
END;
$$;
```

## 5. Authentication Security

### Password Requirements
- Minimum length: 6 characters (configurable in Supabase)
- Recommended: 8+ characters

### Rate Limiting
- Login: 5 attempts per 15 minutes
- Signup: 3 attempts per hour
- Password reset: 3 attempts per hour

### Email Confirmation
Currently disabled for development. Enable for production:
1. Go to Supabase Dashboard
2. Authentication → Settings → Email Auth
3. Enable "Confirm email"

### Google OAuth
- Secure OAuth 2.0 flow
- Profile data synced automatically
- Display name preserved from Google account

## 6. Content Security

### XSS Prevention
- All user content sanitized with DOMPurify
- HTML tags whitelisted based on content type
- Dangerous attributes removed (onclick, onerror, etc.)
- JavaScript URLs blocked

### SQL Injection Prevention
- Supabase client uses parameterized queries
- All database operations go through Supabase SDK
- No raw SQL from user input

### CSRF Protection
- Supabase handles CSRF tokens automatically
- Session cookies are httpOnly and secure

## 7. File Upload Security

### Profile Pictures
- Stored in Supabase Storage
- Size limit: 2MB
- Allowed types: PNG, JPG only
- Public bucket with RLS policies

**TODO Improvements:**
- [ ] Add virus scanning
- [ ] Implement image optimization
- [ ] Add file type validation on server

## 8. Production Checklist

Before deploying to production:

### Authentication
- [ ] Enable email confirmation
- [ ] Set strong password requirements (8+ chars, mixed case, numbers)
- [ ] Enable leaked password protection (Pro plan required)
- [ ] Review OAuth settings

### Database
- [ ] Verify all RLS policies are enabled
- [ ] Review and tighten policies if needed
- [ ] Enable connection pooling
- [ ] Set up regular backups

### Environment
- [ ] Generate new API keys for production
- [ ] Use separate Supabase project for production
- [ ] Set up proper CORS policies
- [ ] Enable rate limiting at infrastructure level

### Monitoring
- [ ] Set up Sentry or error tracking
- [ ] Enable Supabase logs monitoring
- [ ] Set up uptime monitoring
- [ ] Configure security alerts

### Code
- [ ] Run security audit: `npm audit`
- [ ] Update all dependencies
- [ ] Remove console.logs
- [ ] Enable production build optimizations

## 9. Incident Response

### If Security Issue Detected

1. **Immediate Actions**
   - Disable affected feature if possible
   - Review Supabase logs for suspicious activity
   - Check for data breach

2. **Investigation**
   - Identify attack vector
   - Assess scope of impact
   - Document findings

3. **Remediation**
   - Apply security patches
   - Reset compromised credentials
   - Notify affected users if necessary

4. **Prevention**
   - Update security measures
   - Add additional protections
   - Document lessons learned

## 10. Resources

- [Supabase Security Best Practices](https://supabase.com/docs/guides/security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [DOMPurify Documentation](https://github.com/cure53/DOMPurify)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

## Support

For security concerns, contact: contact@deanwaring.co.uk
