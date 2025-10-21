-- SYNC DISPLAY NAME BETWEEN PROFILES AND AUTH.USERS

-- Create trigger function to sync display name changes from profiles to auth.users
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

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS sync_display_name_trigger ON public.profiles;

-- Create trigger on profiles table
CREATE TRIGGER sync_display_name_trigger
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  WHEN (NEW.username IS DISTINCT FROM OLD.username)
  EXECUTE FUNCTION public.sync_display_name_to_auth();

SELECT '✅ Display name sync trigger created - profile updates will now sync to auth display name' as status;

-- Also update your current display name to DeanWaringDev
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{full_name}',
  '"DeanWaringDev"'
)
WHERE id = '7cd64da3-c70c-4d6c-942b-ef1e331e72a1';

UPDATE public.profiles
SET username = 'DeanWaringDev'
WHERE id = '7cd64da3-c70c-4d6c-942b-ef1e331e72a1';

SELECT '✅ Your display name has been updated to DeanWaringDev' as status;

-- Verify the change
SELECT 
  u.email,
  u.raw_user_meta_data->>'full_name' as display_name,
  p.username as profile_username
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.id = '7cd64da3-c70c-4d6c-942b-ef1e331e72a1';
