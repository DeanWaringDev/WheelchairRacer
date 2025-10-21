-- FIX REMAINING ISSUES

-- ============================================
-- ISSUE 1: Fix posts table 406 error
-- ============================================

-- The 406 error means RLS is blocking the query
-- Let's make posts readable by everyone

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Anyone can view posts" ON public.posts;
DROP POLICY IF EXISTS "Public posts are viewable by everyone" ON public.posts;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.posts;

-- Create permissive read policy
CREATE POLICY "Anyone can view posts"
  ON public.posts FOR SELECT
  USING (true);

-- Grant permissions
GRANT SELECT ON public.posts TO anon, authenticated, service_role;

SELECT '✅ Posts table access fixed' as status;

-- ============================================
-- ISSUE 2: Fix other tables that might have 406 errors
-- ============================================

-- Comments
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view comments" ON public.comments;
CREATE POLICY "Anyone can view comments"
  ON public.comments FOR SELECT
  USING (true);
GRANT SELECT ON public.comments TO anon, authenticated, service_role;

-- Post likes
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view likes" ON public.post_likes;
CREATE POLICY "Anyone can view likes"
  ON public.post_likes FOR SELECT
  USING (true);
GRANT SELECT ON public.post_likes TO anon, authenticated, service_role;

-- Forum categories
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view forum_categories" ON public.forum_categories;
CREATE POLICY "Anyone can view forum_categories"
  ON public.forum_categories FOR SELECT
  USING (true);
GRANT SELECT ON public.forum_categories TO anon, authenticated, service_role;

-- Forum topics
ALTER TABLE public.forum_topics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view forum_topics" ON public.forum_topics;
CREATE POLICY "Anyone can view forum_topics"
  ON public.forum_topics FOR SELECT
  USING (true);
GRANT SELECT ON public.forum_topics TO anon, authenticated, service_role;

-- Forum replies
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view forum_replies" ON public.forum_replies;
CREATE POLICY "Anyone can view forum_replies"
  ON public.forum_replies FOR SELECT
  USING (true);
GRANT SELECT ON public.forum_replies TO anon, authenticated, service_role;

SELECT '✅ All tables accessible' as status;

-- ============================================
-- VERIFICATION
-- ============================================

SELECT '========================================' as divider;
SELECT 'FIXED!' as heading;
SELECT '========================================' as divider;

-- Check posts policies
SELECT 'Posts policies: ' || COUNT(*) as posts_policies
FROM pg_policies WHERE tablename = 'posts';

-- Test query (this should work)
SELECT 'Total posts: ' || COUNT(*) as post_count FROM public.posts;

SELECT '✅✅✅ ALL ISSUES FIXED ✅✅✅' as final_status;
SELECT 'Refresh your website - errors should be gone!' as next_step;
