-- Fix forum_categories RLS policy - FORCE DROP AND RECREATE
-- Run this to fix the "new row violates row-level security policy" error

-- Force drop ALL existing policies (ignore errors if they don't exist)
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Anyone can view forum categories" ON public.forum_categories;
    DROP POLICY IF EXISTS "Admin can create forum categories" ON public.forum_categories;
    DROP POLICY IF EXISTS "Admin can update forum categories" ON public.forum_categories;
    DROP POLICY IF EXISTS "Admin can delete forum categories" ON public.forum_categories;
    DROP POLICY IF EXISTS "Allow all to read categories" ON public.forum_categories;
    DROP POLICY IF EXISTS "Allow admin to manage categories" ON public.forum_categories;
    DROP POLICY IF EXISTS "Allow authenticated users to read categories" ON public.forum_categories;
    DROP POLICY IF EXISTS "Allow admin to insert categories" ON public.forum_categories;
    DROP POLICY IF EXISTS "Allow admin to update categories" ON public.forum_categories;
    DROP POLICY IF EXISTS "Allow admin to delete categories" ON public.forum_categories;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- Enable RLS
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Anyone can view forum categories"
  ON public.forum_categories
  FOR SELECT
  USING (true);

CREATE POLICY "Admin can create forum categories"
  ON public.forum_categories
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = '30b81e8f-3ba6-4c60-9f94-bcfe61ac81f9'
  );

CREATE POLICY "Admin can update forum categories"
  ON public.forum_categories
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = '30b81e8f-3ba6-4c60-9f94-bcfe61ac81f9'
  );

CREATE POLICY "Admin can delete forum categories"
  ON public.forum_categories
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = '30b81e8f-3ba6-4c60-9f94-bcfe61ac81f9'
  );

-- Verify
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'forum_categories';
