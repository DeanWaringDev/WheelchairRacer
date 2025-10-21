-- Simple check: What is your current logged-in user ID?
SELECT auth.uid() as "Your Current User ID";

-- What policies exist on forum_categories?
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'forum_categories'
ORDER BY cmd;

-- Get all user IDs from profiles
SELECT id, username FROM public.profiles ORDER BY created_at DESC LIMIT 5;
