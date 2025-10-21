-- UPDATE TRIGGER TO SET DISPLAY NAME FROM USERNAME

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_username TEXT;
  v_full_name TEXT;
BEGIN
  -- Get username from metadata or email
  v_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    split_part(NEW.email, '@', 1)
  );
  
  -- Get full_name or use username as fallback
  v_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    v_username
  );
  
  -- Update the user's metadata with full_name if it wasn't set
  IF NEW.raw_user_meta_data->>'full_name' IS NULL THEN
    UPDATE auth.users
    SET raw_user_meta_data = jsonb_set(
      COALESCE(raw_user_meta_data, '{}'::jsonb),
      '{full_name}',
      to_jsonb(v_username)
    )
    WHERE id = NEW.id;
  END IF;
  
  -- Create profile
  INSERT INTO public.profiles (id, username, avatar_url, created_at, updated_at)
  VALUES (
    NEW.id,
    v_username,
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

SELECT '✅ Trigger updated - display name will now be set from username' as status;

-- Also fix the third account that has no display name
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{full_name}',
  to_jsonb(COALESCE(raw_user_meta_data->>'username', split_part(email, '@', 1)))
)
WHERE email = 'deanwaring77@outlook.com';

SELECT '✅ Fixed existing account without display name' as status;

-- Verify all accounts
SELECT 
  email,
  raw_user_meta_data->>'full_name' as display_name,
  raw_user_meta_data->>'username' as username
FROM auth.users
ORDER BY created_at;
