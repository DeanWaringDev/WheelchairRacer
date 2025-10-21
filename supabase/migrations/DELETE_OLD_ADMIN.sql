-- SIMPLE SOLUTION: Delete old admin account and create fresh one

-- ============================================
-- STEP 1: Find what content belongs to old admin
-- ============================================

SELECT 'Checking content ownership...' as step;

-- Check posts
SELECT 'Posts by old admin: ' || COUNT(*) as posts_count
FROM public.posts
WHERE author_id = '5bc2da58-8e69-4779-ba02-52e6182b9668';

-- Check forum categories
SELECT 'Forum categories: ' || COUNT(*) as categories_count
FROM public.forum_categories
WHERE created_by = '5bc2da58-8e69-4779-ba02-52e6182b9668';

-- ============================================
-- STEP 2: Transfer ownership to a placeholder
-- ============================================

-- Create a system user to own old content
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  role,
  aud
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  'system@wheelchairracer.com',
  '$2a$10$PLACEHOLDER',
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"username":"system"}',
  NOW(),
  NOW(),
  'authenticated',
  'authenticated'
)
ON CONFLICT (id) DO NOTHING;

-- Create profile for system user
INSERT INTO public.profiles (id, username, avatar_url, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'System',
  '',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

SELECT '✅ System user created' as status;

-- Transfer posts ownership
UPDATE public.posts
SET author_id = '00000000-0000-0000-0000-000000000000'
WHERE author_id = '5bc2da58-8e69-4779-ba02-52e6182b9668';

-- Transfer forum categories ownership
UPDATE public.forum_categories
SET created_by = '00000000-0000-0000-0000-000000000000'
WHERE created_by = '5bc2da58-8e69-4779-ba02-52e6182b9668';

-- Transfer any other content (comments, likes, etc)
UPDATE public.comments
SET author_id = '00000000-0000-0000-0000-000000000000'
WHERE author_id = '5bc2da58-8e69-4779-ba02-52e6182b9668';

UPDATE public.post_likes
SET user_id = '00000000-0000-0000-0000-000000000000'
WHERE user_id = '5bc2da58-8e69-4779-ba02-52e6182b9668';

SELECT '✅ Content ownership transferred' as status;

-- ============================================
-- STEP 3: Delete old admin account
-- ============================================

-- Delete profile first
DELETE FROM public.profiles
WHERE id = '5bc2da58-8e69-4779-ba02-52e6182b9668';

-- Delete auth user
DELETE FROM auth.users
WHERE id = '5bc2da58-8e69-4779-ba02-52e6182b9668';

SELECT '✅ Old admin account deleted' as status;

-- ============================================
-- VERIFICATION
-- ============================================

SELECT '========================================' as divider;
SELECT 'COMPLETE! Next steps:' as heading;
SELECT '========================================' as divider;

SELECT 
  'Total users: ' || COUNT(*) as user_count
FROM auth.users;

SELECT 
  'Users with profiles: ' || COUNT(*) as profile_count
FROM public.profiles;

SELECT '1. Sign up with contact@deanwaring.co.uk again' as step1;
SELECT '2. Use a NEW password' as step2;
SELECT '3. Your old content is now owned by "System"' as step3;
SELECT '4. You can transfer it back later if needed' as step4;
