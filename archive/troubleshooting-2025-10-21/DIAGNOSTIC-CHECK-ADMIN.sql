-- DIAGNOSTIC: Check your actual user ID vs the hardcoded admin ID

-- First, check what policies currently exist
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'forum_categories'
ORDER BY cmd;

-- Second, check your actual user ID from profiles table
SELECT id, username, created_at
FROM public.profiles 
ORDER BY created_at DESC
LIMIT 10;

-- Third, show what the INSERT policy is checking
SELECT 
  policyname,
  qual as "Policy Check Expression"
FROM pg_policies 
WHERE tablename = 'forum_categories' 
AND cmd = 'INSERT';
