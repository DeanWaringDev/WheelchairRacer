# 🔴 TWO RLS POLICY ISSUES TO FIX IN SUPABASE

## Issue 1: Forum Categories (Still Not Fixed)
**Error:** "new row violates row-level security policy for table 'forum_categories'"

**Fix:** Run this SQL migration in Supabase SQL Editor:
- File: `supabase/migrations/20251021120000_fix_forum_categories_rls.sql`
- Action: Copy entire file contents and run in Supabase dashboard

## Issue 2: Blog Post Updates (NEW)
**Error:** `PATCH https://...supabase.co/rest/v1/posts?id=eq.... 400 (Bad Request)`

**Problem:** The `posts` table likely has RLS policies that are blocking UPDATE operations, even for admin users.

**Fix Needed:** Create RLS policies for the `posts` table similar to forum_categories:

```sql
-- Enable RLS on posts table
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read posts
CREATE POLICY "Anyone can view posts"
  ON public.posts
  FOR SELECT
  USING (true);

-- Allow authenticated users to create posts (you may want admin-only)
CREATE POLICY "Authenticated users can create posts"
  ON public.posts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow users to update their own posts OR admin can update any post
CREATE POLICY "Users can update own posts or admin can update any"
  ON public.posts
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    auth.uid() = '30b81e8f-3ba6-4c60-9f94-bcfe61ac81f9'
  );

-- Allow users to delete their own posts OR admin can delete any post
CREATE POLICY "Users can delete own posts or admin can delete any"
  ON public.posts
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    auth.uid() = '30b81e8f-3ba6-4c60-9f94-bcfe61ac81f9'
  );
```

## How to Fix

### Step 1: Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to SQL Editor

### Step 2: Run Forum Categories Migration
1. Copy contents of `supabase/migrations/20251021120000_fix_forum_categories_rls.sql`
2. Paste into SQL Editor
3. Click "Run"
4. Verify no errors

### Step 3: Check Posts Table Policies
Run this query to see existing policies:
```sql
SELECT * FROM pg_policies WHERE tablename = 'posts';
```

### Step 4: Fix Posts Table Policies
If policies exist but are blocking admin updates, drop them and create new ones:
```sql
-- Drop old policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.posts;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.posts;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.posts;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.posts;

-- Then run the CREATE POLICY commands above
```

### Step 5: Test
1. Try creating a forum category (should work)
2. Try updating a blog post (should work)
3. Check console for any remaining errors

## Admin User ID
Your admin user ID: `30b81e8f-3ba6-4c60-9f94-bcfe61ac81f9`

This UUID is hardcoded in the policies to give admin full access.
