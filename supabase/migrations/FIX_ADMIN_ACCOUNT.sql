-- FIX OLD ADMIN ACCOUNT - Two Options

-- ============================================
-- OPTION 1: Find which account is broken
-- ============================================

SELECT '=== Checking all users ===' as step;

SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  CASE WHEN p.id IS NOT NULL THEN '✅ Has profile' ELSE '❌ No profile' END as profile_status,
  u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at;

-- ============================================
-- OPTION 2A: Create profile for old admin account
-- ============================================

-- Creating profile for your admin account

INSERT INTO public.profiles (id, username, avatar_url, created_at, updated_at)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'username', split_part(email, '@', 1)),
  COALESCE(raw_user_meta_data->>'avatar_url', ''),
  NOW(),
  NOW()
FROM auth.users
WHERE email = 'contact@deanwaring.co.uk'
  AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.users.id)
ON CONFLICT (id) DO NOTHING;

SELECT '✅ Created profile for old admin account' as status;

-- ============================================
-- OPTION 2B: OR manually specify the admin user ID
-- ============================================

-- If you know the admin user ID (5bc2da58-8e69-4779-ba02-52e6182b9668), use this:

INSERT INTO public.profiles (id, username, avatar_url, created_at, updated_at)
VALUES (
  '5bc2da58-8e69-4779-ba02-52e6182b9668',  -- Your admin ID
  'admin',
  '',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

SELECT '✅ Created profile for admin user ID' as status;

-- ============================================
-- STEP 3: Create simple working trigger
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Profile creation failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

SELECT '✅ Trigger created' as status;

-- ============================================
-- STEP 4: Fix RLS
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Anyone can view profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- STEP 5: Fix posts table (406 error)
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'posts') THEN
    EXECUTE 'ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can view posts" ON public.posts';
    EXECUTE 'CREATE POLICY "Anyone can view posts" ON public.posts FOR SELECT USING (true)';
    EXECUTE 'GRANT SELECT ON public.posts TO anon, authenticated';
    RAISE NOTICE '✅ Posts table fixed';
  END IF;
END $$;

-- ============================================
-- VERIFICATION
-- ============================================

SELECT '=== VERIFICATION ===' as step;

SELECT 
  COUNT(*) || ' users total' as users,
  COUNT(*) FILTER (WHERE p.id IS NOT NULL) || ' have profiles' as with_profiles,
  COUNT(*) FILTER (WHERE p.id IS NULL) || ' missing profiles' as without_profiles
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id;

SELECT '✅✅✅ COMPLETE ✅✅✅' as status;
