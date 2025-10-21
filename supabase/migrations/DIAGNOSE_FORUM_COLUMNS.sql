-- Diagnostic: Check what columns actually exist in forum_topics table

-- Check all columns in forum_topics
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'forum_topics'
ORDER BY ordinal_position;

-- Check all columns in forum_replies
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'forum_replies'
ORDER BY ordinal_position;

-- List all functions related to forum
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%forum%'
ORDER BY routine_name;

-- List all triggers on forum tables
SELECT trigger_name, event_object_table, action_timing, event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table IN ('forum_topics', 'forum_replies')
ORDER BY event_object_table, trigger_name;
