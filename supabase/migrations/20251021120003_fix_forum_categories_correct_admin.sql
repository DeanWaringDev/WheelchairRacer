-- Fix forum_categories RLS with YOUR ACTUAL admin ID
-- Admin ID: 7cd64da3-c70c-4d6c-942b-ef1e331e72a1 (DeanWaringDev)

-- Drop ALL existing policies completely
DROP POLICY IF EXISTS "Anyone can view forum categories" ON public.forum_categories;
DROP POLICY IF EXISTS "Admin can create forum categories" ON public.forum_categories;
DROP POLICY IF EXISTS "Admin can update forum categories" ON public.forum_categories;
DROP POLICY IF EXISTS "Admin can delete forum categories" ON public.forum_categories;
DROP POLICY IF EXISTS "Admin can insert categories" ON public.forum_categories;

-- Enable RLS
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;

-- Create SELECT policy (everyone can view)
CREATE POLICY "Anyone can view forum categories"
  ON public.forum_categories
  FOR SELECT
  USING (true);

-- Create INSERT policy (only DeanWaringDev can create)
CREATE POLICY "Admin can create forum categories"
  ON public.forum_categories
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = '7cd64da3-c70c-4d6c-942b-ef1e331e72a1');

-- Create UPDATE policy (only DeanWaringDev can update)
CREATE POLICY "Admin can update forum categories"
  ON public.forum_categories
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = '7cd64da3-c70c-4d6c-942b-ef1e331e72a1');

-- Create DELETE policy (only DeanWaringDev can delete)
CREATE POLICY "Admin can delete forum categories"
  ON public.forum_categories
  FOR DELETE
  TO authenticated
  USING (auth.uid() = '7cd64da3-c70c-4d6c-942b-ef1e331e72a1');

-- Verify policies are created correctly
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'forum_categories'
ORDER BY cmd;
