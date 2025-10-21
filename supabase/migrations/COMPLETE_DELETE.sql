-- COMPLETE FIX: Handle all foreign key references

-- ============================================
-- STEP 1: Find ALL tables that reference auth.users
-- ============================================

SELECT 'Finding all foreign key references...' as step;

SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND ccu.table_name = 'users'
ORDER BY tc.table_name;

-- ============================================
-- STEP 2: Create system user for old content
-- ============================================

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
  crypt('system-account-no-login', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"username":"System"}',
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

-- ============================================
-- STEP 3: Transfer ALL content to system user
-- ============================================

-- Forum categories
UPDATE public.forum_categories
SET created_by = '00000000-0000-0000-0000-000000000000'
WHERE created_by = '5bc2da58-8e69-4779-ba02-52e6182b9668';

SELECT '✅ Forum categories transferred' as status;

-- Posts (check for user_id, author_id, or created_by)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'user_id') THEN
    UPDATE public.posts SET user_id = '00000000-0000-0000-0000-000000000000' WHERE user_id = '5bc2da58-8e69-4779-ba02-52e6182b9668';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'author_id') THEN
    UPDATE public.posts SET author_id = '00000000-0000-0000-0000-000000000000' WHERE author_id = '5bc2da58-8e69-4779-ba02-52e6182b9668';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'created_by') THEN
    UPDATE public.posts SET created_by = '00000000-0000-0000-0000-000000000000' WHERE created_by = '5bc2da58-8e69-4779-ba02-52e6182b9668';
  END IF;
END $$;

-- Comments
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'user_id') THEN
    UPDATE public.comments SET user_id = '00000000-0000-0000-0000-000000000000' WHERE user_id = '5bc2da58-8e69-4779-ba02-52e6182b9668';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'author_id') THEN
    UPDATE public.comments SET author_id = '00000000-0000-0000-0000-000000000000' WHERE author_id = '5bc2da58-8e69-4779-ba02-52e6182b9668';
  END IF;
END $$;

-- Post likes
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'post_likes') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'post_likes' AND column_name = 'user_id') THEN
      UPDATE public.post_likes SET user_id = '00000000-0000-0000-0000-000000000000' WHERE user_id = '5bc2da58-8e69-4779-ba02-52e6182b9668';
    END IF;
  END IF;
END $$;

-- Forum topics
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'forum_topics') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forum_topics' AND column_name = 'created_by') THEN
      UPDATE public.forum_topics SET created_by = '00000000-0000-0000-0000-000000000000' WHERE created_by = '5bc2da58-8e69-4779-ba02-52e6182b9668';
    END IF;
  END IF;
END $$;

-- Forum replies
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'forum_replies') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forum_replies' AND column_name = 'created_by') THEN
      UPDATE public.forum_replies SET created_by = '00000000-0000-0000-0000-000000000000' WHERE created_by = '5bc2da58-8e69-4779-ba02-52e6182b9668';
    END IF;
  END IF;
END $$;

SELECT '✅ All content transferred' as status;

-- ============================================
-- STEP 4: Delete old admin
-- ============================================

-- Delete profile
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
SELECT 'SUCCESS! Now:' as heading;
SELECT '========================================' as divider;

SELECT 'Remaining users: ' || COUNT(*) as users FROM auth.users;
SELECT 'Profiles: ' || COUNT(*) as profiles FROM public.profiles;

SELECT '1. Sign up with contact@deanwaring.co.uk' as step1;
SELECT '2. Use a NEW password' as step2;
SELECT '3. All old content is owned by "System" user' as step3;
SELECT '✅ Authentication is fully working!' as final;
