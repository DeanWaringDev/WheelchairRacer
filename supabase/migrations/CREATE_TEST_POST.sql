-- CREATE TEST BLOG POST

-- First check what columns exist
SELECT 'Posts table columns:' as info;
SELECT column_name FROM information_schema.columns WHERE table_name = 'posts' ORDER BY ordinal_position;

-- Get your user ID first
SELECT 'Your user ID:' as info, id, email FROM auth.users WHERE email = 'contact@deanwaring.co.uk';

-- Insert a test blog post with your user ID as author
INSERT INTO public.posts (
  title,
  content,
  category,
  image_url,
  created_at,
  author_id
)
SELECT
  'Welcome to Wheelchair Racer!',
  '# Welcome to Our Community

We''re excited to launch Wheelchair Racer - your comprehensive guide to finding the most accessible parkrun routes across the UK!

## What We Offer

- **800+ Parkrun Routes Analyzed** - Every parkrun route has been carefully assessed for accessibility
- **8 Mobility Types Supported** - Whether you use a manual wheelchair, powerchair, or mobility scooter, we''ve got you covered
- **Detailed Accessibility Scores** - Each route is scored based on surface quality, gradient, width, and more
- **Interactive Map** - Easily find accessible parkruns near you

## Get Started

Head over to our [Parkrun Browser](/parkrun) to explore routes, or check out our [About Us](/about) page to learn more about our mission.

Happy running! 🏃‍♂️💨',
  'Inspiration',
  '',
  NOW(),
  id
FROM auth.users
WHERE email = 'contact@deanwaring.co.uk';

SELECT '✅ Test blog post created!' as status;

-- Verify it was created
SELECT 'Post check:' as info;
SELECT id, title, category, created_at FROM public.posts ORDER BY created_at DESC LIMIT 1;

SELECT '========================================' as divider;
SELECT 'Refresh your website - the 406 error should be GONE!' as next_step;
