-- Fix any posts with NULL likes_count
-- Run this in your Supabase SQL Editor if you're still seeing zero counts

-- Update any posts with NULL likes_count to 0
UPDATE posts 
SET likes_count = 0
WHERE likes_count IS NULL;

-- Verify: Update likes_count based on actual likes in post_likes table
UPDATE posts 
SET likes_count = (
  SELECT COUNT(*) 
  FROM post_likes 
  WHERE post_likes.post_id = posts.id
);

-- This will ensure all posts have the correct like count
