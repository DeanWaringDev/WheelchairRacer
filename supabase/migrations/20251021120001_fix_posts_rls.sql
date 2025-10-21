-- Fix posts table RLS policies to allow admin to update posts
-- This migration fixes the "400 Bad Request" error when admin tries to update blog posts

-- First, drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON public.posts;
DROP POLICY IF EXISTS "Anyone can view posts" ON public.posts;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.posts;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.posts;
DROP POLICY IF EXISTS "Users can update own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update own posts or admin can update any" ON public.posts;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete own posts or admin can delete any" ON public.posts;

-- Enable RLS on posts if not already enabled
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Policy 1: Everyone can read posts (even anonymous users)
CREATE POLICY "Anyone can view posts"
  ON public.posts
  FOR SELECT
  USING (true);

-- Policy 2: Authenticated users can create posts
-- NOTE: You might want to restrict this to admin only by adding the admin check
CREATE POLICY "Authenticated users can create posts"
  ON public.posts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy 3: Users can update their own posts OR admin can update any post
CREATE POLICY "Users can update own posts or admin can update any"
  ON public.posts
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = author_id OR 
    auth.uid() = '30b81e8f-3ba6-4c60-9f94-bcfe61ac81f9'
  );

-- Policy 4: Users can delete their own posts OR admin can delete any post
CREATE POLICY "Users can delete own posts or admin can delete any"
  ON public.posts
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = author_id OR 
    auth.uid() = '30b81e8f-3ba6-4c60-9f94-bcfe61ac81f9'
  );

-- Verify the policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'posts';
