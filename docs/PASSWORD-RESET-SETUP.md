# Password Reset Email Configuration for Supabase

## Setup Instructions

To enable password reset functionality, you need to configure the email template in Supabase:

### 1. Go to Supabase Dashboard
- Navigate to: https://supabase.com/dashboard
- Select your project: `WheelchairRacer`

### 2. Configure Email Template
1. Go to **Authentication** → **Email Templates**
2. Select **Reset Password** template
3. Update the template with the following:

**Subject:**
```
Reset your password for Wheelchair Racer
```

**Email Body (HTML):**
```html
<h2>Reset Your Password</h2>
<p>Hi there,</p>
<p>We received a request to reset your password for your Wheelchair Racer account.</p>
<p>Click the button below to create a new password:</p>
<a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">Reset Password</a>
<p>Or copy and paste this link into your browser:</p>
<p>{{ .ConfirmationURL }}</p>
<p>This link will expire in 1 hour.</p>
<p>If you didn't request a password reset, you can safely ignore this email.</p>
<p>Best regards,<br>The Wheelchair Racer Team</p>
```

### 3. Configure URL Configuration
1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL** to: `http://localhost:5173` (for development)
3. Add **Redirect URLs**:
   - `http://localhost:5173/reset-password`
   - `https://yourdomain.com/reset-password` (for production)

### 4. Test the Flow

**As a user:**
1. Go to `/signin`
2. Click "Forgot your password?"
3. Enter your email address
4. Check your email inbox
5. Click the reset link
6. Enter your new password
7. Get redirected to sign in page

**Flow:**
```
/signin 
  → Click "Forgot password" 
  → /forgot-password 
  → Enter email 
  → Check email 
  → Click link 
  → /reset-password 
  → Enter new password 
  → Success! 
  → /signin
```

## Features Implemented

✅ **Forgot Password Page** (`/forgot-password`)
   - Email input form
   - Loading state
   - Error handling
   - Success message with instructions
   - Link back to sign in

✅ **Reset Password Page** (`/reset-password`)
   - Password strength indicator
   - Password confirmation
   - Validation (min 6 characters, passwords match)
   - Token validation (checks if link is valid)
   - Auto-redirect after success
   - Helpful error messages

✅ **Security Features**
   - Reset links expire after 1 hour
   - Secure token-based authentication
   - Password strength requirements
   - Confirmation password matching

## Troubleshooting

**Email not received:**
- Check spam/junk folder
- Verify email is correct in Supabase Users table
- Check Supabase email logs in Dashboard → Logs

**Reset link not working:**
- Link expires after 1 hour - request new one
- Make sure redirect URL is configured in Supabase
- Check browser console for errors

**Password update fails:**
- Must be at least 6 characters
- Check Supabase auth logs for specific error
- Try refreshing the page and clicking email link again
