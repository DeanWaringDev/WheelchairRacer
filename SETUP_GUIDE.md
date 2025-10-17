# Quick Setup Guide - Blog Features

## Step 1: Run Database Migration

1. Go to your Supabase project: https://supabase.com/dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Open the file: `supabase-migrations/blog-likes-comments.sql`
4. Copy ALL the SQL code
5. Paste it into the Supabase SQL Editor
6. Click **Run** button
7. You should see success messages for all operations

## Step 2: Test the Features

### Test Header Responsiveness
1. Open your app in browser
2. Press `F12` to open Dev Tools
3. Click the device toolbar icon (or press `Ctrl+Shift+M`)
4. Set width to **469px**
5. Verify header looks clean and not cramped

### Test Like Feature
1. Navigate to Blog page
2. Click the heart icon on any post
3. See the count increase and heart fill with color
4. Click again to unlike
5. Try in incognito mode (anonymous like)

### Test Comments Feature
1. Make sure you're signed in
2. Click "Comments" button on any post
3. Type a comment and press Enter (or click Post)
4. See your comment appear with your username
5. Click delete to remove your comment

### Test Admin Delete Post
1. Sign in with admin account (ID: 5bc2da58-8e69-4779-ba02-52e6182b9668)
2. You should see "Delete" button on each post
3. Click Delete on a test post
4. Confirm the deletion
5. Post should disappear

## Step 3: Verify Database Tables

Go to Supabase **Table Editor** and verify these tables exist:
- `posts` (should have new `likes_count` column)
- `post_likes`
- `comments`

## Troubleshooting

### "Like button not working"
- Check browser console for errors
- Verify `post_likes` table exists in Supabase
- Check RLS policies are enabled

### "Can't add comments"
- Make sure you're signed in
- Check `comments` table exists
- Verify user has proper authentication

### "Delete button not visible"
- Verify you're signed in as admin user
- Check the ADMIN_USER_ID matches your user ID in code

### "Header still looks cramped on mobile"
- Hard refresh browser (Ctrl+Shift+R)
- Clear browser cache
- Check screen width is below 470px

## Success Indicators

✅ Heart icon fills and unfills when clicked
✅ Like count updates immediately
✅ Comments toggle open/closed
✅ Can add and delete comments
✅ Admin sees Delete button on posts
✅ Header scales down nicely on small screens
✅ No console errors

## Need Help?

Check the detailed documentation in `BLOG_UPDATES.md`
