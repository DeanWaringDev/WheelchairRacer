# ✨ CLEAN SLATE - Fresh Start (No Users)

Since you have NO existing users, we can do this the clean, easy way!

---

## 🚀 Quick Setup (5 Minutes Total)

### **STEP 1: Run Clean Slate SQL** (2 min)

**File:** `supabase/migrations/CLEAN_SLATE.sql`

**Do this:**
1. Open Supabase Dashboard: https://app.supabase.com
2. Go to: **SQL Editor** → **New Query**
3. Open file: `CLEAN_SLATE.sql`
4. Copy **ENTIRE** contents
5. Paste into Supabase
6. Click **RUN** ▶️

**What it does:**
- ✅ Deletes any broken old setup
- ✅ Creates fresh profiles table
- ✅ Sets up RLS policies
- ✅ Creates trigger for auto-profile creation
- ✅ Verifies everything is ready

**Expected output:**
```
✅ Cleaned up old data
✅ Created profiles table
✅ RLS policies created
✅ Permissions granted
✅ Auto-profile trigger created
✅ CLEAN SLATE SETUP COMPLETE
```

---

### **STEP 2: Configure Supabase Settings** (2 min)

**Go to:** Supabase Dashboard → **Authentication** → **Settings**

#### **Email Auth Section:**
- [ ] **UNCHECK** "Enable email confirmations" (for easy testing)
- [ ] **UNCHECK** "Secure email change"
- [ ] Click **Save**

#### **URL Configuration Section:**
- [ ] **Site URL**: `http://localhost:5173`
- [ ] **Redirect URLs**: Add `http://localhost:5173/**`
- [ ] Click **Save**

#### **Security Section:**
- [ ] **Minimum password length**: 6
- [ ] Click **Save**

---

### **STEP 3: Test Sign Up** (1 min)

1. **Clear browser cache/cookies** (CTRL+SHIFT+DELETE)
2. Go to: http://localhost:5173/signin
3. Click **"Create Account"**
4. Enter:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `test123456`
5. Click **"Create Account"**

**Expected:**
- ✅ Account created successfully
- ✅ Redirects to profile or home page
- ✅ User appears in header
- ✅ No console errors

---

### **STEP 4: Verify in Supabase** (30 sec)

**Check:** Supabase Dashboard → **Authentication** → **Users**
- ✅ Should see: test@example.com

**Check:** Supabase Dashboard → **Database** → **profiles** table
- ✅ Should see: 1 row with username "testuser"

---

### **STEP 5: Test Sign In** (30 sec)

1. Sign out from your app
2. Sign in again with:
   - Email: `test@example.com`
   - Password: `test123456`

**Expected:**
- ✅ Signs in successfully
- ✅ No errors
- ✅ User stays logged in

---

## ✅ Success Checklist

After setup, verify:

- [ ] Can create new account
- [ ] Profile auto-created in database
- [ ] Can sign in with created account
- [ ] User stays logged in after page refresh
- [ ] Can access profile page
- [ ] No console errors during auth
- [ ] User appears in Supabase → Users table
- [ ] Profile appears in Supabase → profiles table

---

## 🎯 What's Fixed

**Before:**
- ❌ No profiles table or broken setup
- ❌ Sign up failed with 500 error
- ❌ Sign in failed with 400 error
- ❌ Manual profile creation in code (unreliable)

**After:**
- ✅ Clean profiles table with proper structure
- ✅ Automatic profile creation via database trigger
- ✅ Proper RLS policies for security
- ✅ Sign up creates user + profile automatically
- ✅ Sign in works immediately
- ✅ Clean, maintainable setup

---

## 🔐 For Production Later

Once everything works in dev, re-enable security:

1. **Enable email confirmation:**
   - Supabase → Authentication → Settings
   - Check "Enable email confirmations"
   - Configure email templates

2. **Set production URL:**
   - Update Site URL to your production domain
   - Add production redirect URLs

3. **Review RLS policies:**
   - Policies are already secure (users can only edit their own)
   - But review for your specific needs

---

## 🆘 If Something Goes Wrong

**Issue: "Email already registered"**
- Delete that email from Supabase → Authentication → Users
- Try again

**Issue: Still getting 500 error**
- Re-run CLEAN_SLATE.sql
- Check Supabase logs: Dashboard → Logs

**Issue: Profile not created**
- Check Database → profiles table manually
- Verify trigger exists: Should see it in table functions

**Issue: Can't sign in**
- Make sure email confirmation is DISABLED
- Clear browser cookies
- Check password is correct

---

## 📊 Database Schema Created

```sql
profiles table:
├── id (UUID, Primary Key, references auth.users)
├── username (TEXT)
├── avatar_url (TEXT)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)

Trigger: on_auth_user_created
├── Fires: After INSERT on auth.users
└── Action: Creates profile automatically

RLS Policies:
├── Public profiles are viewable (anyone can SELECT)
├── Users can create own profile (INSERT)
└── Users can update own profile (UPDATE)
```

---

**Total Time:** 5 minutes  
**Difficulty:** Easy (copy/paste)  
**Result:** Working authentication! 🎉

**Next:** Run `CLEAN_SLATE.sql` NOW and test signup!
