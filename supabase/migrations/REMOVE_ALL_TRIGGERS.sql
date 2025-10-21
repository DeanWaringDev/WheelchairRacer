-- NUCLEAR OPTION: Remove ALL triggers and try manual signup

-- Step 1: Drop ALL triggers on auth.users
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT trigger_name FROM information_schema.triggers 
              WHERE event_object_schema = 'auth' AND event_object_table = 'users')
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || r.trigger_name || ' ON auth.users';
        RAISE NOTICE 'Dropped trigger: %', r.trigger_name;
    END LOOP;
END $$;

-- Step 2: Verify no triggers remain
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ All triggers removed'
        ELSE '⚠️ ' || COUNT(*) || ' triggers still exist'
    END as trigger_status
FROM information_schema.triggers 
WHERE event_object_schema = 'auth' AND event_object_table = 'users';

-- Step 3: Make sure profiles table exists with super permissive access
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Step 4: Disable RLS completely for testing
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Step 5: Grant everything to everyone
GRANT ALL ON public.profiles TO anon, authenticated, service_role, postgres;

SELECT '✅ Setup complete - NO TRIGGERS' as status;
SELECT 'Try signing up now' as next_step;
SELECT 'If it works, the trigger was the problem' as diagnosis;
SELECT 'If it still fails, something else is wrong' as alternative;
