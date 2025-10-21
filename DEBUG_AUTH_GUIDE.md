# 🔧 STILL NOT WORKING? Debug Guide

## Current Issue:
- ❌ Sign up: "Database error saving new user" (500 error)
- This means Supabase can't create the auth user

---

## 🚨 URGENT FIX (Try in Order):

### **FIX 1: Run ALTERNATIVE_FIX.sql** (2 min)

**File:** `supabase/migrations/ALTERNATIVE_FIX.sql`

**What's different:**
- Makes profile creation non-blocking (user gets created even if profile fails)
- Super permissive RLS policies
- Better error handling
- Fallback in code if trigger fails

**Run it:**
1. Supabase Dashboard → SQL Editor
2. Copy entire `ALTERNATIVE_FIX.sql`
3. Paste and RUN

---

### **FIX 2: Check Supabase Logs** (1 min)

**Go to:** Supabase Dashboard → **Logs** → **Auth Logs**

Look for your signup attempt and check the error message.

**Common errors:**

| Error Message | Cause | Fix |
|---------------|-------|-----|
| "trigger function returned null" | Trigger failed | Run ALTERNATIVE_FIX.sql |
| "permission denied" | RLS blocking | Check RLS policies |
| "violates foreign key constraint" | User/profile mismatch | Drop and recreate table |
| "function does not exist" | Trigger not created | Re-run migration |

---

### **FIX 3: Disable RLS Temporarily** (30 sec)

If nothing else works, disable RLS completely for testing:

```sql
-- Run in Supabase SQL Editor
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
```

Then try signing up again.

---

### **FIX 4: Check Database Permissions** (30 sec)

```sql
-- Run in Supabase SQL Editor
-- Check what permissions exist
SELECT 
  grantee, 
  privilege_type
FROM information_schema.table_privileges
WHERE table_name = 'profiles';

-- Grant everything
GRANT ALL ON public.profiles TO anon, authenticated, service_role, postgres;
```

---

### **FIX 5: Rebuild from Scratch** (2 min)

Nuclear option - delete EVERYTHING:

```sql
-- Run in Supabase SQL Editor
-- Delete all users first
DELETE FROM auth.users;

-- Drop profiles table
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
```

Then run `ALTERNATIVE_FIX.sql` fresh.

---

### **FIX 6: Check Supabase Project Settings**

**Supabase Dashboard → Project Settings:**

1. **Database**
   - Check connection string is valid
   - Verify database is not in read-only mode

2. **API**
   - Check service_role key exists
   - Verify anon key is correct

3. **Authentication → Settings**
   - Disable ALL confirmations
   - Disable ALL validations
   - Make it as permissive as possible

---

## 🔍 Debugging Steps:

### **Step 1: Test Trigger Manually**

```sql
-- Run this in SQL Editor to test if trigger works
-- Replace with a test UUID
INSERT INTO auth.users (
  instance_id,
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'triggertest@example.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  '{"username": "triggertest"}'::jsonb,
  NOW(),
  NOW()
);

-- Check if profile was created
SELECT * FROM public.profiles 
WHERE username = 'triggertest';

-- Clean up
DELETE FROM auth.users WHERE email = 'triggertest@example.com';
```

---

### **Step 2: Check Frontend Logs**

Open browser console (F12) during signup and check for:

1. **Request payload:**
   ```json
   {
     "email": "test@example.com",
     "password": "test123",
     "options": {
       "data": {
         "username": "testuser"
       }
     }
   }
   ```

2. **Response error:**
   - Look for specific error message
   - Check status code (400 vs 500)

---

### **Step 3: Try Supabase CLI**

If you have Supabase CLI installed:

```bash
# Check migration status
supabase db diff

# Reset database
supabase db reset

# Run migrations
supabase migration up
```

---

## 🆘 Last Resort Options:

### **Option A: Create New Supabase Project**

Sometimes projects get corrupted:

1. Create new Supabase project
2. Update `.env.local` with new keys
3. Run `ALTERNATIVE_FIX.sql` in new project
4. Test signup

### **Option B: Remove Profiles Table Entirely**

If you don't actually need profiles yet:

```sql
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
```

Then users can sign up without profiles. Add profiles later.

### **Option C: Use Supabase Auth UI**

Bypass custom signup, use Supabase's built-in UI:

```bash
npm install @supabase/auth-ui-react @supabase/auth-ui-shared
```

```tsx
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'

<Auth
  supabaseClient={supabase}
  appearance={{ theme: ThemeSupa }}
  providers={['google']}
/>
```

---

## 📋 Checklist Before Trying Again:

- [ ] Ran ALTERNATIVE_FIX.sql
- [ ] Disabled email confirmation
- [ ] Disabled RLS or made it permissive
- [ ] Granted all permissions
- [ ] Cleared browser cookies
- [ ] Checked Supabase logs
- [ ] Verified environment variables are correct
- [ ] Updated frontend code with new AuthContext

---

## 💬 Share This Info:

If still not working, share:

1. **Exact error from Supabase logs**
2. **Exact error from browser console**
3. **Result of diagnostic SQL** (show all output)
4. **Supabase auth settings screenshot**

This will help diagnose the exact issue!

---

**Next:** Run ALTERNATIVE_FIX.sql and check logs immediately! 🔍
