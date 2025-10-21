# Security Implementation Examples

## How to Apply Sanitization and Rate Limiting

### Example 1: Blog Post Creation

```typescript
// In Blog.tsx or similar component
import { sanitizeRichText, stripHTML } from '../lib/sanitize'
import { rateLimiter, RateLimits, formatTimeRemaining } from '../lib/rateLimit'

const handleCreatePost = async (title: string, content: string) => {
  // Rate limiting
  const rateLimitKey = `post:create:${user.id}`
  if (!rateLimiter.check(rateLimitKey, RateLimits.POST_CREATE)) {
    const resetTime = rateLimiter.resetIn(rateLimitKey)
    setError(`You're posting too quickly. Try again in ${formatTimeRemaining(resetTime)}.`)
    return
  }

  // Sanitize inputs
  const cleanTitle = stripHTML(title) // No HTML in titles
  const cleanContent = sanitizeRichText(content) // Allow rich formatting

  // Create post
  const { data, error } = await supabase
    .from('posts')
    .insert({
      title: cleanTitle,
      content: cleanContent,
      author_id: user.id
    })

  if (!error) {
    rateLimiter.clear(rateLimitKey) // Clear on success
  }
}
```

### Example 2: Comment Creation

```typescript
// In Comments component
import { sanitizeHTML } from '../lib/sanitize'
import { rateLimiter, RateLimits, formatTimeRemaining } from '../lib/rateLimit'

const handleAddComment = async (commentText: string, postId: string) => {
  // Rate limiting
  const rateLimitKey = `comment:${user.id}`
  if (!rateLimiter.check(rateLimitKey, RateLimits.COMMENT_CREATE)) {
    const resetTime = rateLimiter.resetIn(rateLimitKey)
    throw new Error(`Too many comments. Try again in ${formatTimeRemaining(resetTime)}.`)
  }

  // Sanitize comment
  const cleanComment = sanitizeHTML(commentText)

  // Insert comment
  await supabase
    .from('comments')
    .insert({
      content: cleanComment,
      post_id: postId,
      user_id: user.id
    })
}
```

### Example 3: Contact Form

```typescript
// In Contact.tsx
import { sanitizeInput, sanitizeEmail } from '../lib/sanitize'
import { rateLimiter, RateLimits, formatTimeRemaining } from '../lib/rateLimit'

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  // Rate limiting
  const rateLimitKey = `contact:${email}`
  if (!rateLimiter.check(rateLimitKey, RateLimits.CONTACT_FORM)) {
    const resetTime = rateLimiter.resetIn(rateLimitKey)
    setError(`Too many submission attempts. Try again in ${formatTimeRemaining(resetTime)}.`)
    return
  }

  // Sanitize inputs
  const cleanEmail = sanitizeEmail(email)
  const cleanName = sanitizeInput(name)
  const cleanMessage = sanitizeInput(message)

  if (!cleanEmail) {
    setError('Please enter a valid email address')
    return
  }

  // Send email via Supabase Edge Function
  const { error } = await supabase.functions.invoke('send-contact-email', {
    body: {
      from_email: cleanEmail,
      from_name: cleanName,
      message: cleanMessage
    }
  })

  if (!error) {
    rateLimiter.clear(rateLimitKey)
    setSuccess('Message sent successfully!')
  }
}
```

### Example 4: Forum Topic Creation

```typescript
// In Forum.tsx
import { sanitizeHTML, stripHTML } from '../lib/sanitize'
import { rateLimiter, RateLimits, formatTimeRemaining } from '../lib/rateLimit'

const handleCreateTopic = async (title: string, content: string, categoryId: string) => {
  // Rate limiting
  const rateLimitKey = `forum:topic:${user.id}`
  if (!rateLimiter.check(rateLimitKey, RateLimits.FORUM_TOPIC)) {
    const resetTime = rateLimiter.resetIn(rateLimitKey)
    setError(`Please wait ${formatTimeRemaining(resetTime)} before creating another topic.`)
    return
  }

  // Sanitize inputs
  const cleanTitle = stripHTML(title) // Plain text only for titles
  const cleanContent = sanitizeHTML(content) // Allow basic formatting

  // Create topic
  const { error } = await supabase
    .from('forum_topics')
    .insert({
      title: cleanTitle,
      content: cleanContent,
      category_id: categoryId,
      user_id: user.id
    })

  if (!error) {
    rateLimiter.clear(rateLimitKey)
  }
}
```

### Example 5: Profile Update

```typescript
// In Profile.tsx
import { sanitizeUsername, sanitizeURL } from '../lib/sanitize'

const handleUpdateProfile = async () => {
  // Sanitize inputs
  const cleanUsername = sanitizeUsername(username)
  const cleanWebsite = sanitizeURL(website)
  const cleanBio = sanitizeInput(bio)

  if (!cleanUsername) {
    setError('Username can only contain letters, numbers, underscores, and hyphens')
    return
  }

  if (website && !cleanWebsite) {
    setError('Please enter a valid website URL')
    return
  }

  // Update profile
  await supabase
    .from('profiles')
    .update({
      username: cleanUsername,
      website: cleanWebsite,
      bio: cleanBio
    })
    .eq('id', user.id)
}
```

### Example 6: Displaying User Content

```typescript
// When displaying HTML content from database
import { sanitizeHTML } from '../lib/sanitize'

// In your component
const BlogPost = ({ post }) => {
  // Even though we sanitized on input, sanitize again on output for defense-in-depth
  const cleanContent = sanitizeHTML(post.content)

  return (
    <div>
      <h1>{post.title}</h1>
      {/* Use dangerouslySetInnerHTML only with sanitized content */}
      <div dangerouslySetInnerHTML={{ __html: cleanContent }} />
    </div>
  )
}
```

## Best Practices

### 1. Sanitize at Input AND Output
- Sanitize when users submit data
- Sanitize again when displaying data (defense-in-depth)

### 2. Use Appropriate Sanitization Level
- **Strip all HTML**: Usernames, titles, search queries
- **Basic HTML**: Comments, short descriptions
- **Rich HTML**: Blog posts, long-form content

### 3. Rate Limiting Keys
Use specific, unique keys:
- `login:${email}` - For login attempts
- `post:create:${userId}` - For post creation
- `comment:${userId}` - For comments
- `contact:${email}` - For contact forms

### 4. Clear Rate Limits on Success
```typescript
if (!error) {
  rateLimiter.clear(rateLimitKey)
}
```

### 5. Show User-Friendly Messages
```typescript
const resetTime = rateLimiter.resetIn(rateLimitKey)
setError(`Too many attempts. Please try again in ${formatTimeRemaining(resetTime)}.`)
```

## Testing Security Features

### Test Input Sanitization

Try these malicious inputs to verify sanitization works:

```javascript
// XSS attempts (should be blocked)
"<script>alert('XSS')</script>"
"<img src=x onerror=alert('XSS')>"
"javascript:alert('XSS')"
"<iframe src='evil.com'></iframe>"

// HTML injection attempts (should be cleaned)
"<div onclick='alert(1)'>Click me</div>"
"<a href='javascript:void(0)'>Link</a>"
```

### Test Rate Limiting

1. Try logging in with wrong password 6 times
2. Verify you get blocked after 5 attempts
3. Verify the timeout message shows correct time
4. Wait for timeout or clear localStorage to reset

## Next Steps

Apply sanitization and rate limiting to:
- [ ] Blog.tsx - Post creation
- [ ] Home.tsx - Comment creation
- [ ] Forum.tsx - Topic/reply creation
- [ ] Contact.tsx - Contact form
- [ ] Profile.tsx - Profile updates (already partially done)
