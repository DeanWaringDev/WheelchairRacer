-- Quick fix for forum_categories RLS - Only fix the INSERT policy
-- The SELECT policy already exists, so we just need to add/fix INSERT, UPDATE, DELETE

-- Drop only the admin policies (keep the SELECT policy)
DROP POLICY IF EXISTS "Admin can create forum categories" ON public.forum_categories;
DROP POLICY IF EXISTS "Admin can update forum categories" ON public.forum_categories;
DROP POLICY IF EXISTS "Admin can delete forum categories" ON public.forum_categories;

-- Create admin policies with simple auth check
CREATE POLICY "Admin can create forum categories"
  ON public.forum_categories
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = '30b81e8f-3ba6-4c60-9f94-bcfe61ac81f9');

CREATE POLICY "Admin can update forum categories"
  ON public.forum_categories
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = '30b81e8f-3ba6-4c60-9f94-bcfe61ac81f9');

CREATE POLICY "Admin can delete forum categories"
  ON public.forum_categories
  FOR DELETE
  TO authenticated
  USING (auth.uid() = '30b81e8f-3ba6-4c60-9f94-bcfe61ac81f9');

-- Verify
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'forum_categories' ORDER BY cmd;
