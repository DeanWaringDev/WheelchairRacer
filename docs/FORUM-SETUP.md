# Forum Setup Guide

## Overview
This guide will help you set up the complete Forum system with categories, topics, replies, and sample data.

## Step 1: Run the SQL Migration

1. **Open Supabase Dashboard**
   - Go to your Supabase project
   - Navigate to the SQL Editor

2. **Execute the Forum Schema**
   - Open the file: `supabase-migrations/forum-schema.sql`
   - Copy all contents
   - Paste into Supabase SQL Editor
   - Click "Run" to execute

This will create:
- ✅ `forum_categories` table
- ✅ `forum_topics` table  
- ✅ `forum_replies` table
- ✅ RLS policies (admin for categories, authenticated users for topics/replies)
- ✅ Triggers for auto-updating reply counts and last activity
- ✅ Indexes for performance
- ✅ 4 default categories with icons and colors
- ✅ 8 sample topics (2 per category)
- ✅ Sample replies for each topic
- ✅ `increment_topic_views()` function for tracking views

## Step 2: Verify Installation

After running the SQL:

1. **Check Tables**
   - Go to Table Editor in Supabase
   - You should see 3 new tables:
     - `forum_categories` (4 rows)
     - `forum_topics` (8 rows)
     - `forum_replies` (several rows)

2. **Check RLS Policies**
   - Go to Authentication > Policies
   - Verify policies exist for all 3 forum tables

## Step 3: Test the Forum

1. **Visit Forum Page**
   - Navigate to `/forum` on your website
   - You should see:
     - Real-time stats (members, posts, active topics, online)
     - 4 category cards (General Discussion, Training & Technique, Equipment & Gear, Events & Races)
     - Recent topics list with 8 sample topics

2. **Test Creating a Topic**
   - Sign in to your account
   - Click "New Topic" button
   - Select a category
   - Fill in title and content
   - Submit

3. **Test Viewing a Topic**
   - Click on any topic from the list
   - You should see:
     - Topic details (title, author, views, replies)
     - All replies
     - Reply form (if signed in)

4. **Test Replying**
   - Sign in (if not already)
   - View a topic
   - Type a reply in the form at the bottom
   - Submit
   - Reply should appear immediately

## Admin Features

As admin (user ID: `5bc2da58-8e69-4779-ba02-52e6182b9668`), you can:

1. **Add New Categories**
   - Click "+ Add Category" button on forum page
   - Fill in name, description, icon (emoji), and color
   - Submit

2. **Manage Topics**
   - Pin/unpin topics (📌 button)
   - Lock/unlock topics (🔒 button)
   - Delete topics (Delete button)

3. **Manage Replies**
   - Delete any user's reply

## Forum Features

### Categories
- 4 default categories included
- Admin can add unlimited categories
- Each category tracks topic count and post count
- Color-coded for easy identification

### Topics
- Any authenticated user can create topics
- Topics show: author, date, views, replies count
- Can be pinned (shows at top with 📌)
- Can be locked (no new replies, shows 🔒)
- Sorted by last activity

### Replies
- Any authenticated user can reply (unless topic is locked)
- Users can edit/delete their own replies
- Admin can delete any reply
- Shows edit timestamp if edited

### Stats (Real-time)
- **Total Members**: Unique users who created topics or replies
- **Total Posts**: Sum of topics + replies
- **Active Topics**: Topics with activity in last 30 days
- **Online Now**: Currently 1 if you're signed in, 0 if not

### Recent Topics
- Shows last 10 topics sorted by activity
- Displays category, author, reply count, views
- Color-coded by category

## Database Schema

### forum_categories
```
id              UUID (primary key)
name            TEXT (unique)
description     TEXT
icon            TEXT (emoji)
color           TEXT (blue/green/purple/red/yellow/pink)
display_order   INTEGER
is_active       BOOLEAN
created_by      UUID (admin user)
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### forum_topics
```
id                UUID (primary key)
category_id       UUID (foreign key)
title             TEXT
content           TEXT
author_id         UUID
author_name       TEXT
views_count       INTEGER (default 0)
replies_count     INTEGER (default 0)
is_pinned         BOOLEAN (default false)
is_locked         BOOLEAN (default false)
created_at        TIMESTAMP
updated_at        TIMESTAMP
last_activity_at  TIMESTAMP
```

### forum_replies
```
id              UUID (primary key)
topic_id        UUID (foreign key, cascade delete)
content         TEXT
author_id       UUID
author_name     TEXT
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

## Troubleshooting

### Topics not showing?
- Check that `is_active = true` on categories
- Verify RLS policies are enabled
- Check browser console for errors

### Can't create topics?
- Make sure you're signed in
- Verify your user has a username set
- Check RLS policy: "Authenticated users can create topics"

### Stats showing zero?
- Run SQL again to ensure triggers are created
- Check that sample data was inserted
- Verify no errors in Supabase logs

### Can't delete as admin?
- Verify your user ID matches: `5bc2da58-8e69-4779-ba02-52e6182b9668`
- Check RLS policy includes your admin UUID
- Test by viewing topic as admin (should see admin buttons)

## Next Steps

The forum is now fully functional! You can:
- Create more categories
- Encourage users to create topics
- Monitor forum activity from the main forum page
- Pin important topics to keep them at the top
- Lock topics to prevent further replies when needed

Enjoy your new community forum! 🎉
