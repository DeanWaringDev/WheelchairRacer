-- Quick Diagnostic Script for Auth Issues
-- Run this in Supabase SQL Editor to check current setup

-- ============================================
-- 1. CHECK IF PROFILES TABLE EXISTS
-- ============================================
SELECT 'Checking profiles table...' as status;

SELECT 
  CASE 
    WHEN EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'profiles'
    )
    THEN '✅ profiles table EXISTS'
    ELSE '❌ profiles table MISSING'
  END as profiles_table_status;

-- ============================================
-- 2. CHECK PROFILES TABLE STRUCTURE
-- ============================================
SELECT 'Checking profiles table columns...' as status;

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- ============================================
-- 3. CHECK RLS POLICIES ON PROFILES
-- ============================================
SELECT 'Checking RLS policies...' as status;

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'profiles';

-- ============================================
-- 4. CHECK IF RLS IS ENABLED
-- ============================================
SELECT 'Checking if RLS enabled...' as status;

SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'profiles';

-- ============================================
-- 5. CHECK FOR AUTH TRIGGER
-- ============================================
SELECT 'Checking for auth trigger...' as status;

SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- ============================================
-- 6. CHECK EXISTING USERS
-- ============================================
SELECT 'Checking existing users...' as status;

SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  raw_user_meta_data->>'username' as username
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- ============================================
-- 7. CHECK EXISTING PROFILES
-- ============================================
SELECT 'Checking existing profiles...' as status;

SELECT 
  p.id,
  p.username,
  p.created_at,
  u.email
FROM public.profiles p
LEFT JOIN auth.users u ON p.id = u.id
ORDER BY p.created_at DESC
LIMIT 10;

-- ============================================
-- 8. CHECK FOR ORPHANED PROFILES
-- ============================================
SELECT 'Checking for orphaned profiles (no matching user)...' as status;

SELECT 
  p.id,
  p.username,
  p.created_at,
  CASE 
    WHEN u.id IS NULL THEN '❌ ORPHANED - No matching auth user'
    ELSE '✅ OK'
  END as status
FROM public.profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE u.id IS NULL;

-- ============================================
-- 9. CHECK FOR USERS WITHOUT PROFILES
-- ============================================
SELECT 'Checking for users without profiles...' as status;

SELECT 
  u.id,
  u.email,
  u.created_at,
  CASE 
    WHEN p.id IS NULL THEN '❌ MISSING PROFILE'
    ELSE '✅ Profile exists'
  END as status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- ============================================
-- 10. SUMMARY
-- ============================================
SELECT 'SUMMARY' as status;

SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_auth_users,
  (SELECT COUNT(*) FROM public.profiles) as total_profiles,
  (SELECT COUNT(*) FROM auth.users u LEFT JOIN public.profiles p ON u.id = p.id WHERE p.id IS NULL) as users_missing_profiles,
  CASE 
    WHEN (SELECT COUNT(*) FROM auth.users) = (SELECT COUNT(*) FROM public.profiles)
    THEN '✅ Auth users and profiles match'
    ELSE '⚠️ Mismatch between users and profiles'
  END as sync_status;

-- ============================================
-- DIAGNOSTIC COMPLETE
-- ============================================
SELECT '✅ Diagnostic complete! Review results above.' as final_status;
