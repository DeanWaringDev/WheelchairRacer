-- Migration: Add support for multiple images per post
-- Run this in your Supabase SQL Editor AFTER blog-likes-comments.sql

-- Add a new column to store an array of image URLs
ALTER TABLE posts ADD COLUMN IF NOT EXISTS image_urls TEXT[];

-- Migrate existing single image_url to image_urls array (if you have existing posts)
UPDATE posts 
SET image_urls = ARRAY[image_url]::TEXT[]
WHERE image_url IS NOT NULL 
  AND image_url != '' 
  AND (image_urls IS NULL OR array_length(image_urls, 1) IS NULL);

-- Note: We keep the old image_url column for backward compatibility
-- New posts will use image_urls, old posts can still use image_url
