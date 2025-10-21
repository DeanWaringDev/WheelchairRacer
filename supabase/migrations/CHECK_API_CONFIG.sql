-- CHECK SUPABASE API CONFIGURATION

-- ============================================
-- STEP 1: Verify table is in public schema
-- ============================================

SELECT 'Schema check:' as info;
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE tablename = 'posts';

-- ============================================
-- STEP 2: Check if there are any issues with the table
-- ============================================

-- Check for reserved column names that might cause issues
SELECT 'Column names:' as info;
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'posts'
ORDER BY ordinal_position;

-- ============================================
-- STEP 3: Grant ALL permissions (nuclear option)
-- ============================================

GRANT ALL ON public.posts TO anon;
GRANT ALL ON public.posts TO authenticated;
GRANT ALL ON public.posts TO service_role;
GRANT ALL ON public.posts TO postgres;

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

SELECT '✅ All permissions granted' as status;

-- ============================================
-- STEP 4: Check if there's a view or materialized view conflict
-- ============================================

SELECT 'Views named posts:' as info;
SELECT 
  schemaname,
  viewname
FROM pg_views
WHERE viewname = 'posts';

-- ============================================
-- STEP 5: Ensure PostgREST can see the table
-- ============================================

-- Check table privileges for anon role
SELECT 'Anon role privileges on posts:' as info;
SELECT 
  grantee,
  privilege_type,
  is_grantable
FROM information_schema.table_privileges
WHERE table_name = 'posts' AND grantee = 'anon';

SELECT '========================================' as divider;
SELECT 'NEXT: Check Supabase Dashboard' as action;
SELECT '1. Go to Settings → API' as step1;
SELECT '2. Check if there are any "Exposed schemas" settings' as step2;
SELECT '3. Make sure "public" schema is exposed' as step3;
SELECT '========================================' as divider;
SELECT 'If still 406, the issue might be in your frontend code' as diagnosis;
