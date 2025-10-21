-- DIAGNOSTIC: Find out what's actually happening

SELECT '========================================' as divider;
SELECT '1. CHECK AUTH.USERS TABLE' as step;
SELECT '========================================' as divider;

SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  raw_user_meta_data
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

SELECT '========================================' as divider;
SELECT '2. CHECK PROFILES TABLE' as step;
SELECT '========================================' as divider;

SELECT * FROM public.profiles
ORDER BY created_at DESC
LIMIT 5;

SELECT '========================================' as divider;
SELECT '3. CHECK NEWSLETTER_SUBSCRIBERS TABLE' as step;
SELECT '========================================' as divider;

SELECT * FROM public.newsletter_subscribers
ORDER BY subscribed_at DESC
LIMIT 5;

SELECT '========================================' as divider;
SELECT '4. CHECK CURRENT TRIGGERS' as step;
SELECT '========================================' as divider;

SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE event_object_schema = 'auth' 
  AND event_object_table = 'users';

SELECT '========================================' as divider;
SELECT '5. CHECK TRIGGER FUNCTION CODE' as step;
SELECT '========================================' as divider;

SELECT 
  proname as function_name,
  prosrc as function_code
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
  AND proname = 'handle_new_user';

SELECT '========================================' as divider;
SELECT '6. CHECK TABLE COLUMNS' as step;
SELECT '========================================' as divider;

-- Profiles columns
SELECT 'PROFILES:' as table_name;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Newsletter columns
SELECT 'NEWSLETTER_SUBSCRIBERS:' as table_name;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'newsletter_subscribers'
ORDER BY ordinal_position;

SELECT '========================================' as divider;
SELECT '7. CHECK RLS POLICIES' as step;
SELECT '========================================' as divider;

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('profiles', 'newsletter_subscribers');

SELECT '========================================' as divider;
SELECT '8. CHECK GRANTS' as step;
SELECT '========================================' as divider;

SELECT 
  table_name,
  grantee,
  privilege_type
FROM information_schema.table_privileges
WHERE table_name IN ('profiles', 'newsletter_subscribers')
ORDER BY table_name, grantee;

SELECT '========================================' as divider;
SELECT 'DIAGNOSTIC COMPLETE' as status;
SELECT '========================================' as divider;
