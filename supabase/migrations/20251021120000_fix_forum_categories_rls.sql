-- Fix forum_categories RLS policy to allow admin to create categories
-- This migration fixes the "row-level security policy" error when admin tries to create forum categories

-- First, check existing policies and drop them if they exist
DROP POLICY IF EXISTS "Allow all to read categories" ON public.forum_categories;
DROP POLICY IF EXISTS "Allow admin to manage categories" ON public.forum_categories;
DROP POLICY IF EXISTS "Allow authenticated users to read categories" ON public.forum_categories;
DROP POLICY IF EXISTS "Allow admin to insert categories" ON public.forum_categories;
DROP POLICY IF EXISTS "Allow admin to update categories" ON public.forum_categories;
DROP POLICY IF EXISTS "Allow admin to delete categories" ON public.forum_categories;

-- Enable RLS on forum_categories if not already enabled
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;

-- Policy 1: Everyone can read categories
CREATE POLICY "Anyone can view forum categories"
  ON public.forum_categories
  FOR SELECT
  USING (true);

-- Policy 2: Only admin can insert categories
CREATE POLICY "Admin can create forum categories"
  ON public.forum_categories
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE id = auth.uid() AND id = '30b81e8f-3ba6-4c60-9f94-bcfe61ac81f9'
    )
  );

-- Policy 3: Only admin can update categories
CREATE POLICY "Admin can update forum categories"
  ON public.forum_categories
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE id = auth.uid() AND id = '30b81e8f-3ba6-4c60-9f94-bcfe61ac81f9'
    )
  );

-- Policy 4: Only admin can delete categories
CREATE POLICY "Admin can delete forum categories"
  ON public.forum_categories
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE id = auth.uid() AND id = '30b81e8f-3ba6-4c60-9f94-bcfe61ac81f9'
    )
  );

-- Verify the policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'forum_categories';
