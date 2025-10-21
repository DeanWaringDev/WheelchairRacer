-- TRANSFER SYSTEM USER CONTENT TO YOUR ACCOUNT

-- ============================================
-- STEP 1: Check what the System user owns
-- ============================================

SELECT 'System user content:' as info;

-- Check posts
SELECT 'Posts: ' || COUNT(*) as count
FROM public.posts
WHERE author_id = '00000000-0000-0000-0000-000000000000';

-- Check forum categories (check actual column name)
SELECT 'Forum categories columns:' as info;
SELECT column_name FROM information_schema.columns WHERE table_name = 'forum_categories' AND column_name LIKE '%user%' OR column_name LIKE '%created%';

SELECT 'Forum categories: ' || COUNT(*) as count
FROM public.forum_categories
WHERE created_by = '00000000-0000-0000-0000-000000000000';

-- Check forum topics (check actual column name)
SELECT 'Forum topics columns:' as info;
SELECT column_name FROM information_schema.columns WHERE table_name = 'forum_topics' AND (column_name LIKE '%user%' OR column_name LIKE '%author%' OR column_name LIKE '%created%');

-- Check forum replies (check actual column name)
SELECT 'Forum replies columns:' as info;
SELECT column_name FROM information_schema.columns WHERE table_name = 'forum_replies' AND (column_name LIKE '%user%' OR column_name LIKE '%author%' OR column_name LIKE '%created%');

-- Check comments
SELECT 'Comments: ' || COUNT(*) as count
FROM public.comments
WHERE user_id = '00000000-0000-0000-0000-000000000000';

-- ============================================
-- STEP 2: Transfer everything to your account
-- ============================================

-- Transfer posts
UPDATE public.posts
SET author_id = '7cd64da3-c70c-4d6c-942b-ef1e331e72a1'
WHERE author_id = '00000000-0000-0000-0000-000000000000';

-- Transfer forum categories
UPDATE public.forum_categories
SET created_by = '7cd64da3-c70c-4d6c-942b-ef1e331e72a1'
WHERE created_by = '00000000-0000-0000-0000-000000000000';

-- Transfer forum topics (use actual column - check output above first)
-- UPDATE public.forum_topics
-- SET user_id = '7cd64da3-c70c-4d6c-942b-ef1e331e72a1'
-- WHERE user_id = '00000000-0000-0000-0000-000000000000';

-- Transfer forum replies (use actual column - check output above first)
-- UPDATE public.forum_replies
-- SET user_id = '7cd64da3-c70c-4d6c-942b-ef1e331e72a1'
-- WHERE user_id = '00000000-0000-0000-0000-000000000000';

-- Transfer comments
UPDATE public.comments
SET user_id = '7cd64da3-c70c-4d6c-942b-ef1e331e72a1'
WHERE user_id = '00000000-0000-0000-0000-000000000000';

-- Transfer post likes
UPDATE public.post_likes
SET user_id = '7cd64da3-c70c-4d6c-942b-ef1e331e72a1'
WHERE user_id = '00000000-0000-0000-0000-000000000000';

SELECT '✅ Content transferred (posts, categories, comments, likes)' as status;
SELECT 'ℹ️ Check forum topics/replies columns above' as note;

-- ============================================
-- STEP 3: Delete System user
-- ============================================

-- Delete System profile
DELETE FROM public.profiles
WHERE id = '00000000-0000-0000-0000-000000000000';

-- Delete System auth user
DELETE FROM auth.users
WHERE id = '00000000-0000-0000-0000-000000000000';

SELECT '✅ System user deleted' as status;

-- ============================================
-- VERIFICATION
-- ============================================

SELECT '========================================' as divider;
SELECT 'COMPLETE!' as heading;
SELECT '========================================' as divider;

-- Check your content
SELECT 'Your posts: ' || COUNT(*) as your_posts
FROM public.posts
WHERE author_id = '7cd64da3-c70c-4d6c-942b-ef1e331e72a1';

SELECT 'Your forum categories: ' || COUNT(*) as your_categories
FROM public.forum_categories
WHERE created_by = '7cd64da3-c70c-4d6c-942b-ef1e331e72a1';

-- Total users remaining
SELECT 'Total users: ' || COUNT(*) as total_users
FROM auth.users;

SELECT '✅ All done! You now own all content.' as final_message;
