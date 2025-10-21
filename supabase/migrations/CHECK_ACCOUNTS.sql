-- Check all user accounts and their email confirmation status
SELECT 
  id,
  email,
  raw_user_meta_data->>'username' as username,
  raw_user_meta_data->>'full_name' as display_name,
  email_confirmed_at,
  created_at,
  CASE 
    WHEN email_confirmed_at IS NULL THEN '❌ NOT CONFIRMED'
    ELSE '✅ CONFIRMED'
  END as status
FROM auth.users
ORDER BY created_at DESC;

-- Check if email confirmation is required
SELECT 
  name,
  value
FROM auth.config
WHERE name IN ('MAILER_AUTOCONFIRM', 'DISABLE_SIGNUP');
