-- SIMPLE DIAGNOSTIC - Run this and send me ALL the output

-- 1. How many users?
SELECT 'Users count: ' || COUNT(*) FROM auth.users;

-- 2. How many profiles?
SELECT 'Profiles count: ' || COUNT(*) FROM public.profiles;

-- 3. What triggers exist?
SELECT 'Trigger: ' || trigger_name || ' - ' || action_statement 
FROM information_schema.triggers
WHERE event_object_schema = 'auth' AND event_object_table = 'users';

-- 4. What's the function code?
SELECT prosrc 
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' AND proname = 'handle_new_user';

-- 5. Newsletter table columns
SELECT column_name || ' (' || data_type || ')' as newsletter_columns
FROM information_schema.columns
WHERE table_name = 'newsletter_subscribers'
ORDER BY ordinal_position;
