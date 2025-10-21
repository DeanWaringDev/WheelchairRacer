/**
 * Application Constants
 * 
 * Centralized location for app-wide constants and configuration values.
 * Using environment variables where appropriate for security and flexibility.
 */

// Admin Configuration
// This should be set in your .env.local file as: VITE_ADMIN_USER_ID=your-admin-id
export const ADMIN_USER_ID = import.meta.env.VITE_ADMIN_USER_ID || '7cd64da3-c70c-4d6c-942b-ef1e331e72a1';

// Supabase Storage
export const STORAGE_BUCKET = 'post-images';

// Application Settings
export const APP_NAME = 'Wheelchair Racer';
export const APP_URL = 'https://wheelchairracer.com';
export const CONTACT_EMAIL = 'contact@wheelchairracer.com';

// Pagination
export const POSTS_PER_PAGE = 10;
export const TOPICS_PER_PAGE = 20;
export const REPLIES_PER_PAGE = 50;

// Feature Flags (can be moved to env vars if needed)
export const FEATURES = {
  FORUM_ENABLED: true,
  BLOG_ENABLED: true,
  NEWSLETTER_ENABLED: false, // TODO: Implement
  DARK_MODE_ENABLED: false,  // TODO: Implement
} as const;

// External Links
export const SOCIAL_LINKS = {
  FACEBOOK: 'https://facebook.com/wheelchairracer',
  TWITTER: 'https://twitter.com/wheelchairracer',
  INSTAGRAM: 'https://instagram.com/wheelchairracer',
} as const;
