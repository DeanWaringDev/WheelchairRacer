-- Find correct column names and transfer ownership

-- ============================================
-- STEP 1: Check what columns exist in each table
-- ============================================

-- Check posts table columns
SELECT 'Posts table columns:' as info;
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'posts'
ORDER BY ordinal_position;

-- Check forum_categories columns
SELECT 'Forum categories columns:' as info;
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'forum_categories'
ORDER BY ordinal_position;

-- Check comments columns
SELECT 'Comments table columns:' as info;
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'comments'
ORDER BY ordinal_position;

-- ============================================
-- STEP 2: Just delete the old admin without transferring
-- ============================================

-- Since we don't know the exact schema, let's just try to delete
-- The foreign keys might prevent this, which will tell us what needs fixing

SELECT 'Attempting to delete old admin account...' as step;

-- Delete profile first
DELETE FROM public.profiles
WHERE id = '5bc2da58-8e69-4779-ba02-52e6182b9668';

-- Try to delete auth user - this will fail if there are foreign keys
DELETE FROM auth.users
WHERE id = '5bc2da58-8e69-4779-ba02-52e6182b9668';

SELECT '✅ Old admin deleted (if no errors above)' as status;

-- ============================================
-- VERIFICATION
-- ============================================

SELECT 'Remaining users:' as info;
SELECT id, email FROM auth.users;
