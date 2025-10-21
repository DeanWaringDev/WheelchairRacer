-- ========================================
-- DISPLAY NAME SYNC TRIGGER
-- Copy and paste this entire file into Supabase SQL Editor
-- ========================================

-- Step 1: Create the sync function
CREATE OR REPLACE FUNCTION public.sync_display_name_to_auth()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When username is updated in profiles, update full_name in auth.users
  IF NEW.username IS DISTINCT FROM OLD.username THEN
    UPDATE auth.users
    SET raw_user_meta_data = jsonb_set(
      COALESCE(raw_user_meta_data, '{}'::jsonb),
      '{full_name}',
      to_jsonb(NEW.username)
    )
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Display name sync failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Step 2: Drop old trigger if exists
DROP TRIGGER IF EXISTS sync_display_name_trigger ON public.profiles;

-- Step 3: Create the trigger
CREATE TRIGGER sync_display_name_trigger
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  WHEN (NEW.username IS DISTINCT FROM OLD.username)
  EXECUTE FUNCTION public.sync_display_name_to_auth();

-- Step 4: Update your admin display name to DeanWaringDev
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{full_name}',
  '"DeanWaringDev"'
)
WHERE id = '7cd64da3-c70c-4d6c-942b-ef1e331e72a1';

-- Step 5: Verify it worked
SELECT 
  email,
  raw_user_meta_data->>'full_name' as display_name,
  raw_user_meta_data->>'username' as username
FROM auth.users
ORDER BY created_at DESC;
