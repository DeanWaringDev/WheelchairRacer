-- DEBUG 406 ERROR

-- ============================================
-- Check if posts table exists and has data
-- ============================================

SELECT 'Checking posts table...' as step;

-- Does table exist?
SELECT 
  CASE WHEN EXISTS (SELECT FROM pg_tables WHERE tablename = 'posts')
    THEN '✅ Posts table exists'
    ELSE '❌ Posts table missing'
  END as table_status;

-- What columns does it have?
SELECT 'Posts columns:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'posts'
ORDER BY ordinal_position;

-- How many posts?
SELECT 'Total posts: ' || COUNT(*) as count FROM public.posts;

-- Sample post
SELECT 'Sample post:' as info;
SELECT * FROM public.posts LIMIT 1;

-- ============================================
-- Check RLS and policies
-- ============================================

SELECT 'RLS status:' as info;
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'posts';

SELECT 'Policies:' as info;
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'posts';

-- ============================================
-- Check grants
-- ============================================

SELECT 'Grants:' as info;
SELECT 
  grantee,
  privilege_type
FROM information_schema.table_privileges
WHERE table_name = 'posts'
ORDER BY grantee;

-- ============================================
-- TRY DISABLING RLS COMPLETELY FOR TESTING
-- ============================================

ALTER TABLE public.posts DISABLE ROW LEVEL SECURITY;

SELECT '⚠️ RLS DISABLED on posts table (testing only!)' as warning;

-- ============================================
-- ALSO CHECK IF POSTGREST IS CONFIGURED
-- ============================================

-- Check if the API schema is exposed
SELECT 'Exposed schemas:' as info;
SELECT 
  nspname as schema_name
FROM pg_namespace
WHERE nspname IN ('public', 'auth', 'storage');

SELECT '========================================' as divider;
SELECT 'Try refreshing your site now' as next_step;
SELECT 'If it works, RLS was blocking it' as diagnosis;
