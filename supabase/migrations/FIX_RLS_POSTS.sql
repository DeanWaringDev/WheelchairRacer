-- ========================================
-- FIX RLS POLICIES FOR POSTS TABLE
-- This will enable RLS and create proper policies
-- ========================================

-- Step 1: Enable RLS on posts table
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop any existing policies
DROP POLICY IF EXISTS "Posts are viewable by everyone" ON public.posts;
DROP POLICY IF EXISTS "Users can insert their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;
DROP POLICY IF EXISTS "Admin can insert posts" ON public.posts;
DROP POLICY IF EXISTS "Admin can update posts" ON public.posts;
DROP POLICY IF EXISTS "Admin can delete posts" ON public.posts;

-- Step 3: Create new policies

-- Everyone can view posts
CREATE POLICY "Posts are viewable by everyone"
ON public.posts
FOR SELECT
USING (true);

-- Admin can insert posts (using your admin ID)
CREATE POLICY "Admin can insert posts"
ON public.posts
FOR INSERT
WITH CHECK (auth.uid() = '7cd64da3-c70c-4d6c-942b-ef1e331e72a1'::uuid);

-- Admin can update any post
CREATE POLICY "Admin can update posts"
ON public.posts
FOR UPDATE
USING (auth.uid() = '7cd64da3-c70c-4d6c-942b-ef1e331e72a1'::uuid)
WITH CHECK (auth.uid() = '7cd64da3-c70c-4d6c-942b-ef1e331e72a1'::uuid);

-- Admin can delete any post
CREATE POLICY "Admin can delete posts"
ON public.posts
FOR DELETE
USING (auth.uid() = '7cd64da3-c70c-4d6c-942b-ef1e331e72a1'::uuid);

-- Step 4: Verify policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'posts'
ORDER BY policyname;

SELECT '✅ RLS enabled and policies created for posts table' as status;
