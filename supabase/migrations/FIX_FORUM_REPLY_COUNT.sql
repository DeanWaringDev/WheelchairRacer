-- Fix Forum Reply Count Column Name Mismatch
-- The update_topic_stats function uses 'reply_count' but the column is 'replies_count'

-- Fix the update_topic_stats function to use correct column name
DROP FUNCTION IF EXISTS public.update_topic_stats() CASCADE;

CREATE OR REPLACE FUNCTION public.update_topic_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.forum_topics
    SET 
      replies_count = replies_count + 1,
      last_activity_at = NEW.created_at
    WHERE id = NEW.topic_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.forum_topics
    SET replies_count = GREATEST(replies_count - 1, 0)
    WHERE id = OLD.topic_id;
  END IF;
  RETURN NULL;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS update_topic_stats_trigger ON public.forum_replies;

CREATE TRIGGER update_topic_stats_trigger
  AFTER INSERT OR DELETE ON public.forum_replies
  FOR EACH ROW EXECUTE FUNCTION public.update_topic_stats();

-- Also fix update_forum_reply_count if it exists
DROP FUNCTION IF EXISTS public.update_forum_reply_count() CASCADE;

CREATE OR REPLACE FUNCTION public.update_forum_reply_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.forum_topics
    SET 
      replies_count = replies_count + 1,
      last_activity_at = NEW.created_at
    WHERE id = NEW.topic_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.forum_topics
    SET replies_count = GREATEST(replies_count - 1, 0)
    WHERE id = OLD.topic_id;
  END IF;
  RETURN NULL;
END;
$$;

-- Recalculate reply counts to ensure accuracy
UPDATE public.forum_topics t
SET replies_count = (
  SELECT COUNT(*)
  FROM public.forum_replies r
  WHERE r.topic_id = t.id
);
