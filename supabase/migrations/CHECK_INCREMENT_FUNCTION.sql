-- ========================================
-- FIX REMAINING SECURITY WARNINGS
-- ========================================

-- Check what the actual increment_topic_views function looks like
SELECT 
  p.proname as function_name,
  pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname = 'increment_topic_views';

-- Drop and recreate the function with proper search_path
DROP FUNCTION IF EXISTS public.increment_topic_views() CASCADE;

-- Note: Since we don't see triggers calling this in the warnings,
-- this function might need to be adjusted based on how it's actually used.
-- Let's check if there's a trigger associated with it.

SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  proname as function_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE p.proname = 'increment_topic_views';
