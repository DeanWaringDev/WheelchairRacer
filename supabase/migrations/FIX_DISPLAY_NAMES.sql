-- FIX DISPLAY NAMES FOR EXISTING USERS

-- Update display name for your email account (contact@deanwaring.co.uk)
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{full_name}',
  '"Dean Waring"'::jsonb
)
WHERE email = 'contact@deanwaring.co.uk';

-- Update display name for your Google account (deanwaring@outlook.com)
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{full_name}',
  '"Dean Waring"'::jsonb
)
WHERE email = 'deanwaring@outlook.com';

SELECT '✅ Display names updated!' as status;

-- Verify
SELECT 
  email,
  raw_user_meta_data->>'full_name' as display_name,
  raw_user_meta_data->>'username' as username
FROM auth.users
WHERE email IN ('contact@deanwaring.co.uk', 'deanwaring@outlook.com');
