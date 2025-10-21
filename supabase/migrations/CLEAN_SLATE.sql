-- CLEAN SLATE: Fresh Auth Setup (No Existing Users)
-- This is the cleanest way to set up authentication from scratch

-- ============================================
-- STEP 1: Clean up everything
-- ============================================

-- Delete all existing data (safe since no users)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

SELECT '✅ Cleaned up old data' as status;

-- ============================================
-- STEP 2: Create profiles table fresh
-- ============================================

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

SELECT '✅ Created profiles table' as status;

-- ============================================
-- STEP 3: Enable RLS with simple policies
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can view any profile
CREATE POLICY "Public profiles are viewable"
  ON public.profiles
  FOR SELECT
  USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can create own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

SELECT '✅ RLS policies created' as status;

-- ============================================
-- STEP 4: Grant permissions
-- ============================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

SELECT '✅ Permissions granted' as status;

-- ============================================
-- STEP 5: Create trigger for automatic profile creation
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

SELECT '✅ Auto-profile trigger created' as status;

-- ============================================
-- STEP 6: Create index for performance
-- ============================================

CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles(username);

SELECT '✅ Performance index created' as status;

-- ============================================
-- VERIFICATION
-- ============================================

SELECT '=== VERIFICATION ===' as step;

-- Check table exists
SELECT 
  CASE 
    WHEN EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles')
    THEN '✅ profiles table exists'
    ELSE '❌ profiles table missing'
  END as table_status;

-- Check RLS is enabled
SELECT 
  CASE 
    WHEN EXISTS (SELECT FROM pg_tables WHERE tablename = 'profiles' AND rowsecurity = true)
    THEN '✅ RLS is enabled'
    ELSE '❌ RLS is disabled'
  END as rls_status;

-- Check trigger exists
SELECT 
  CASE 
    WHEN EXISTS (SELECT FROM pg_trigger WHERE tgname = 'on_auth_user_created')
    THEN '✅ Trigger exists'
    ELSE '❌ Trigger missing'
  END as trigger_status;

-- Check policies exist
SELECT 
  COUNT(*) as policy_count,
  CASE 
    WHEN COUNT(*) >= 3 THEN '✅ All policies created'
    ELSE '⚠️ Some policies missing'
  END as policy_status
FROM pg_policies 
WHERE tablename = 'profiles';

-- ============================================
-- FINAL MESSAGE
-- ============================================

SELECT '✅✅✅ CLEAN SLATE SETUP COMPLETE ✅✅✅' as final_status;
SELECT 'Database is ready for users!' as message1;
SELECT 'Profiles will be created automatically on signup' as message2;
SELECT 'You can now register your first user!' as next_step;
