-- Migration: Add likes and comments to blog posts
-- Run this in your Supabase SQL Editor

-- 1. Add likes_count column to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;

-- 2. Create post_likes table to track who liked what
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID,  -- Nullable to allow anonymous likes
  liked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)  -- Prevent duplicate likes from same user/anonymous
);

-- 3. Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add author_name column if it doesn't exist (for existing tables)
ALTER TABLE comments ADD COLUMN IF NOT EXISTS author_name TEXT;

-- 4. Enable Row Level Security (RLS)
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for post_likes
-- Anyone can view likes
CREATE POLICY "Anyone can view likes" ON post_likes
  FOR SELECT USING (true);

-- Anyone can add a like (anonymous or authenticated)
CREATE POLICY "Anyone can add a like" ON post_likes
  FOR INSERT WITH CHECK (true);

-- Users can delete their own likes
CREATE POLICY "Users can delete their own likes" ON post_likes
  FOR DELETE USING (
    user_id = auth.uid()
  );

-- 6. RLS Policies for comments
-- Anyone can view comments
CREATE POLICY "Anyone can view comments" ON comments
  FOR SELECT USING (true);

-- Authenticated users can add comments
CREATE POLICY "Authenticated users can add comments" ON comments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update their own comments
CREATE POLICY "Users can update their own comments" ON comments
  FOR UPDATE USING (user_id = auth.uid());

-- Users can delete their own comments OR admin can delete any comment
CREATE POLICY "Users can delete their own comments or admin can delete any" ON comments
  FOR DELETE USING (
    user_id = auth.uid() 
    OR auth.uid() = '5bc2da58-8e69-4779-ba02-52e6182b9668'::uuid
  );

-- 7. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- 8. Create function to update likes_count automatically
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 9. Create trigger to automatically update likes_count
DROP TRIGGER IF EXISTS trigger_update_post_likes_count ON post_likes;
CREATE TRIGGER trigger_update_post_likes_count
AFTER INSERT OR DELETE ON post_likes
FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

-- 10. Create function to update updated_at timestamp on comments
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 11. Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_update_comments_updated_at ON comments;
CREATE TRIGGER trigger_update_comments_updated_at
BEFORE UPDATE ON comments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 12. Fix foreign key constraints to enable CASCADE DELETE
-- Drop and recreate foreign key constraints with ON DELETE CASCADE

-- Fix post_likes foreign key
ALTER TABLE post_likes DROP CONSTRAINT IF EXISTS post_likes_post_id_fkey;
ALTER TABLE post_likes 
  ADD CONSTRAINT post_likes_post_id_fkey 
  FOREIGN KEY (post_id) 
  REFERENCES posts(id) 
  ON DELETE CASCADE;

-- Fix comments foreign key
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_post_id_fkey;
ALTER TABLE comments 
  ADD CONSTRAINT comments_post_id_fkey 
  FOREIGN KEY (post_id) 
  REFERENCES posts(id) 
  ON DELETE CASCADE;

-- 13. Initialize likes_count for existing posts
-- This updates all posts to have the correct like count based on existing likes
UPDATE posts 
SET likes_count = (
  SELECT COUNT(*) 
  FROM post_likes 
  WHERE post_likes.post_id = posts.id
)
WHERE likes_count IS NULL OR likes_count = 0;

-- 14. Add RLS policy to allow admin to delete posts
-- First check if policy exists and drop it
DROP POLICY IF EXISTS "Admin can delete posts" ON posts;

-- Create policy for admin to delete any post
CREATE POLICY "Admin can delete posts" ON posts
  FOR DELETE USING (
    auth.uid() = '5bc2da58-8e69-4779-ba02-52e6182b9668'::uuid
  );
