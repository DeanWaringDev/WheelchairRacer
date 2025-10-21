-- Check your current admin account details
SELECT 
  id,
  email,
  raw_user_meta_data->>'username' as username,
  raw_user_meta_data->>'full_name' as display_name,
  raw_user_meta_data
FROM auth.users
WHERE email = 'contact@deanwaring.co.uk';

-- Check profiles table
SELECT 
  id,
  username,
  avatar_url
FROM public.profiles
WHERE id = '7cd64da3-c70c-4d6c-942b-ef1e331e72a1';

-- Fix admin account metadata and display name
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{username}',
    '"DeanWaringDev"'
  ),
  '{full_name}',
  '"DeanWaringDev"'
)
WHERE id = '7cd64da3-c70c-4d6c-942b-ef1e331e72a1';

-- Update profile username
INSERT INTO public.profiles (id, username, avatar_url, created_at, updated_at)
VALUES (
  '7cd64da3-c70c-4d6c-942b-ef1e331e72a1',
  'DeanWaringDev',
  '',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET username = 'DeanWaringDev',
    updated_at = NOW();

-- Verify the fix
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'username' as auth_username,
  u.raw_user_meta_data->>'full_name' as display_name,
  p.username as profile_username
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.id = '7cd64da3-c70c-4d6c-942b-ef1e331e72a1';
