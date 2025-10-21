# 🔧 SUPABASE SQL MIGRATIONS - RUN THESE NOW

## Overview
Both the **Forum Categories** and **Blog Post Updates** are failing due to missing/incorrect RLS (Row Level Security) policies in Supabase. You need to run 2 SQL migrations to fix both issues.

---

## 🚨 MIGRATION 1: Fix Forum Categories

**File:** `supabase/migrations/20251021120000_fix_forum_categories_rls.sql`

**Fixes:** "new row violates row-level security policy for table 'forum_categories'"

**What it does:**
- Drops old/conflicting RLS policies
- Creates proper admin-only policies for INSERT/UPDATE/DELETE
- Allows everyone to view categories (SELECT)

---

## 🚨 MIGRATION 2: Fix Blog Post Updates

**File:** `supabase/migrations/20251021120001_fix_posts_rls.sql`

**Fixes:** "400 Bad Request" when updating blog posts

**What it does:**
- Drops old/conflicting RLS policies
- Allows everyone to read posts
- Allows users to update/delete their own posts
- Allows admin to update/delete ANY post
- Allows authenticated users to create posts

---

## 📋 HOW TO RUN THESE MIGRATIONS

### Step 1: Open Supabase Dashboard
1. Go to: https://supabase.com/dashboard
2. Click on your **Wheelchair Racer** project
3. In the left sidebar, click **SQL Editor**

### Step 2: Run Migration 1 (Forum Categories)
1. In SQL Editor, click **New Query**
2. Open the file: `supabase/migrations/20251021120000_fix_forum_categories_rls.sql`
3. **Copy ALL contents** of the file (lines 1-58)
4. **Paste** into the SQL Editor
5. Click **Run** (or press Ctrl+Enter)
6. Wait for success message
7. Scroll down to see verification results (should show 4 policies)

### Step 3: Run Migration 2 (Blog Posts)
1. In SQL Editor, click **New Query** (for a fresh query)
2. Open the file: `supabase/migrations/20251021120001_fix_posts_rls.sql`
3. **Copy ALL contents** of the file (lines 1-57)
4. **Paste** into the SQL Editor
5. Click **Run** (or press Ctrl+Enter)
6. Wait for success message
7. Scroll down to see verification results (should show 4 policies)

### Step 4: Verify Success
Both queries should show a table at the bottom with the policies created:

**For forum_categories:**
- Anyone can view forum categories (SELECT)
- Admin can create forum categories (INSERT)
- Admin can update forum categories (UPDATE)
- Admin can delete forum categories (DELETE)

**For posts:**
- Anyone can view posts (SELECT)
- Authenticated users can create posts (INSERT)
- Users can update own posts or admin can update any (UPDATE)
- Users can delete own posts or admin can delete any (DELETE)

---

## 🧪 TESTING AFTER MIGRATIONS

### Test 1: Create Forum Category
1. Go to Forum page
2. Click "Create New Category"
3. Fill in:
   - Name: "Test Category"
   - Description: "Testing RLS fix"
   - Icon: "🧪"
   - Color: Any
4. Click "Create Category"
5. ✅ Should succeed without errors

### Test 2: Edit Blog Post
1. Go to Blog page
2. Find any blog post (as admin)
3. Click "Edit" button
4. Change the title or content
5. Click "Update Post"
6. ✅ Should succeed without errors
7. ✅ Post should update and show changes

---

## ⚠️ IMPORTANT NOTES

### Admin User ID
These policies use your admin UUID: `30b81e8f-3ba6-4c60-9f94-bcfe61ac81f9`

This gives you (and only you) full admin access to:
- Create/update/delete forum categories
- Update/delete ANY blog post (even if you didn't create it)

### Security
- Everyone can read posts and categories (public access)
- Only authenticated users can create posts
- Only admin can manage categories
- Users can edit their own posts, admin can edit all posts

### If Migrations Fail
If you get errors like "policy already exists", the policies might already be in place. Check existing policies:

```sql
-- Check forum_categories policies
SELECT * FROM pg_policies WHERE tablename = 'forum_categories';

-- Check posts policies
SELECT * FROM pg_policies WHERE tablename = 'posts';
```

If policies exist but are incorrect, the `DROP POLICY IF EXISTS` commands at the top of each migration should handle it.

---

## 🎯 EXPECTED OUTCOME

After running both migrations:
1. ✅ Forum category creation works
2. ✅ Blog post editing works
3. ✅ No more 403 Forbidden errors
4. ✅ No more 400 Bad Request errors
5. ✅ Console shows no RLS errors

---

## 📞 NEXT STEPS AFTER RUNNING

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Refresh the page** (F5)
3. **Test forum category creation**
4. **Test blog post editing**
5. Upload the new `dist/` folder with all fixes to one.com

---

## 📁 FILES LOCATION

Both migration files are in your project:
```
WheelchairRacer/
└── supabase/
    └── migrations/
        ├── 20251021120000_fix_forum_categories_rls.sql  ← Run this first
        └── 20251021120001_fix_posts_rls.sql             ← Run this second
```

You're currently viewing the first file in VS Code.
