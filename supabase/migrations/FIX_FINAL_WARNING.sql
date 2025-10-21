-- ========================================
-- FIX FINAL SECURITY WARNING - increment_topic_views
-- ========================================

-- Drop the existing function
DROP FUNCTION IF EXISTS public.increment_topic_views() CASCADE;

-- Recreate with proper search_path
-- This function is typically called manually or via trigger to increment view counts
CREATE OR REPLACE FUNCTION public.increment_topic_views(topic_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.forum_topics
  SET view_count = view_count + 1
  WHERE id = topic_id_param;
END;
$$;

-- Alternative: If it's used as a trigger function (BEFORE or AFTER UPDATE/INSERT)
CREATE OR REPLACE FUNCTION public.increment_topic_views_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.view_count = COALESCE(NEW.view_count, 0) + 1;
  RETURN NEW;
END;
$$;

SELECT '✅ increment_topic_views function fixed with search_path' as status;

-- Verify the function now has search_path set
SELECT 
  p.proname as function_name,
  CASE 
    WHEN p.prosecdef THEN '✅ SECURITY DEFINER'
    ELSE '❌ SECURITY INVOKER'
  END as security,
  CASE 
    WHEN p.proconfig IS NOT NULL AND 'search_path=public' = ANY(p.proconfig) THEN '✅ search_path set'
    ELSE '⚠️ search_path missing'
  END as search_path_status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname LIKE '%increment_topic_views%';
