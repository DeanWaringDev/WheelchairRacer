-- RESET PASSWORD FOR ADMIN ACCOUNT

-- First, let's check the user's confirmation status
SELECT 
  id,
  email,
  email_confirmed_at,
  confirmed_at,
  CASE 
    WHEN email_confirmed_at IS NULL THEN '❌ Email NOT confirmed'
    ELSE '✅ Email confirmed'
  END as confirmation_status,
  created_at,
  last_sign_in_at
FROM auth.users
WHERE email = 'contact@deanwaring.co.uk';

-- Force confirm the email (confirmed_at is auto-generated)
UPDATE auth.users
SET 
  email_confirmed_at = NOW()
WHERE email = 'contact@deanwaring.co.uk'
  AND email_confirmed_at IS NULL;

SELECT '✅ Email confirmed' as status;

-- Check if profile exists
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT id FROM auth.users WHERE email = 'contact@deanwaring.co.uk'))
    THEN '✅ Profile exists'
    ELSE '❌ Profile missing'
  END as profile_status;

-- Create profile if missing
INSERT INTO public.profiles (id, username, avatar_url, created_at, updated_at)
SELECT 
  id,
  'contact',
  '',
  NOW(),
  NOW()
FROM auth.users
WHERE email = 'contact@deanwaring.co.uk'
  AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.users.id)
ON CONFLICT (id) DO NOTHING;

SELECT '✅ Profile created/verified' as status;

SELECT '========================================' as divider;
SELECT 'NEXT STEPS:' as heading;
SELECT '========================================' as divider;
SELECT '1. Go to Supabase → Authentication → Users' as step1;
SELECT '2. Click on contact@deanwaring.co.uk' as step2;
SELECT '3. Click "Send password recovery" button' as step3;
SELECT '4. Check your email for password reset link' as step4;
SELECT '5. Set a new password' as step5;
SELECT '6. Try signing in again' as step6;
