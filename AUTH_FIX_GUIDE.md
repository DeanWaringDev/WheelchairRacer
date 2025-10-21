# 🔧 Authentication Fix Guide - Wheelchair Racer

**Date:** October 21, 2025  
**Priority:** CRITICAL - Authentication Not Working

---

## 🚨 **Problems Identified**

### 1. **Sign Up Error**
```
POST .../auth/v1/signup 500 (Internal Server Error)
"Database error saving new user"
```
**Root Cause:** Missing database trigger to create profile automatically, or RLS policy preventing profile creation.

### 2. **Sign In Error**
```
POST .../auth/v1/token?grant_type=password 400 (Bad Request)
"Invalid login credentials"
```
**Root Cause:** Either user doesn't exist, or email confirmation is required but not completed.

### 3. **Google OAuth Error**
```
Redirects to Google → Returns to home page without signing in
```
**Root Cause:** Missing OAuth callback configuration or provider settings in Supabase.

---

## ✅ **Step-by-Step Fix**

### **STEP 1: Run the Database Migration**

1. **Go to Supabase Dashboard:**
   - Open: https://app.supabase.com
   - Select your project: `uezmndcoqfpfccmrksvt`

2. **Navigate to SQL Editor:**
   - Click "SQL Editor" in left sidebar
   - Click "New Query"

3. **Copy and Run the Migration:**
   - Open: `supabase/migrations/20251021000000_fix_auth_setup.sql`
   - Copy the ENTIRE contents
   - Paste into Supabase SQL Editor
   - Click "Run" or press `Ctrl+Enter`

4. **Verify Success:**
   - You should see: "Auth setup migration completed successfully!"
   - Check for any error messages

---

### **STEP 2: Check Email Confirmation Settings**

1. **Go to Authentication Settings:**
   - Supabase Dashboard → Authentication → Settings

2. **Disable Email Confirmation (for testing):**
   - Find: "Enable email confirmations"
   - **UNCHECK** this box (temporarily for testing)
   - Click "Save"

3. **Later, Re-enable for Production:**
   - After testing works, re-enable email confirmations
   - Configure email templates properly

---

### **STEP 3: Configure Google OAuth (if using)**

1. **Go to Authentication → Providers:**
   - Supabase Dashboard → Authentication → Providers
   - Find "Google"

2. **Enable Google Provider:**
   - Toggle "Enable Sign in with Google" to ON

3. **Add OAuth Credentials:**
   ```
   Client ID: [Your Google OAuth Client ID]
   Client Secret: [Your Google OAuth Client Secret]
   ```

4. **Set Redirect URL:**
   - In Google Cloud Console, add:
   ```
   https://uezmndcoqfpfccmrksvt.supabase.co/auth/v1/callback
   ```

5. **Set Site URL:**
   - In Supabase → Authentication → URL Configuration
   - Site URL: `http://localhost:5173` (for development)
   - Or: `https://yourdomain.com` (for production)

---

### **STEP 4: Test the Fix**

#### Test Sign Up:
1. Clear browser cache/cookies
2. Go to: `http://localhost:5173/signin`
3. Click "Create Account" tab
4. Enter:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `test123456`
5. Click "Create Account"

**Expected Result:**
- ✅ Success message or verification modal
- ✅ User appears in Supabase → Authentication → Users
- ✅ Profile appears in Database → profiles table

#### Test Sign In:
1. Use the same email/password from sign up
2. Click "Sign In"

**Expected Result:**
- ✅ Redirects to home page
- ✅ User icon/name appears in header
- ✅ Can access profile page

#### Test Google OAuth (if configured):
1. Click "Sign in with Google"
2. Select Google account

**Expected Result:**
- ✅ Redirects back to your app
- ✅ User is signed in
- ✅ Profile created automatically

---

### **STEP 5: Check Console for Errors**

Open browser console (F12) and check for:

**Should NOT see:**
- ❌ 400 Bad Request errors
- ❌ 500 Internal Server errors
- ❌ "Database error" messages
- ❌ RLS policy violations

**Should see:**
- ✅ Successful auth responses
- ✅ User session data
- ✅ No error messages

---

## 🔍 **Troubleshooting Common Issues**

### Issue: "Email already registered"
**Solution:** That email already exists. Either:
1. Use that email to sign in instead
2. Go to Supabase → Authentication → Users → Delete the user
3. Try signing up again

### Issue: "Email not confirmed"
**Solution:** 
1. Check email inbox for verification link
2. Or disable email confirmation (see Step 2)

### Issue: Still getting 500 errors
**Solution:**
1. Check Supabase logs: Dashboard → Logs
2. Verify migration ran successfully
3. Check RLS policies: Database → Policies

### Issue: Google OAuth not working
**Solution:**
1. Verify OAuth credentials are correct
2. Check redirect URL matches exactly
3. Ensure Google provider is enabled in Supabase
4. Clear browser cookies and try again

### Issue: User signs in but profile is empty
**Solution:**
1. Check Database → profiles table
2. Verify trigger is working: Run migration again
3. Check RLS policies allow INSERT

---

## 📋 **Post-Fix Verification Checklist**

After running all fixes, verify:

- [ ] Migration ran successfully (no SQL errors)
- [ ] Email confirmation is disabled (for testing)
- [ ] Can sign up new user
- [ ] New user appears in auth.users table
- [ ] Profile automatically created in profiles table
- [ ] Can sign in with email/password
- [ ] Session persists after page refresh
- [ ] Can access profile page when logged in
- [ ] Google OAuth redirects properly (if configured)
- [ ] No console errors during auth flow

---

## 🚀 **Next Steps After Fix**

Once authentication is working:

1. **Re-enable Email Confirmation:**
   - For production security
   - Configure email templates in Supabase

2. **Test All Auth Flows:**
   - Sign up
   - Sign in
   - Sign out
   - Password reset
   - Profile updates

3. **Update Environment Variables:**
   - Ensure `.env.local` has correct Supabase keys
   - Never commit `.env.local` to git

4. **Deploy Migration to Production:**
   - When ready, run same migration on production database
   - Test thoroughly in staging first

---

## 📞 **Still Having Issues?**

If authentication still doesn't work after following all steps:

1. **Check Supabase Status:**
   - Visit: https://status.supabase.com
   - Ensure no ongoing incidents

2. **Review Supabase Logs:**
   - Dashboard → Logs → Auth logs
   - Look for specific error messages

3. **Verify Database Schema:**
   - Check profiles table exists
   - Check columns match migration
   - Check RLS policies are enabled

4. **Test with Supabase CLI:**
   ```bash
   # If you have Supabase CLI installed
   supabase db reset
   supabase migration up
   ```

5. **Contact Support:**
   - Supabase Discord: https://discord.supabase.com
   - Provide: error messages, logs, migration status

---

## 🔐 **Security Notes**

- **Email Confirmation:** Disable only for testing, re-enable for production
- **Password Requirements:** Minimum 6 characters (can increase in Supabase settings)
- **OAuth Secrets:** Keep Client Secret secure, never commit to git
- **RLS Policies:** Always keep enabled, they protect your data

---

**Created:** October 21, 2025  
**Status:** Ready to implement  
**Estimated Time:** 15-30 minutes
