# Forum Quick Reference

## 🚀 Quick Start

### Setup (One-time)
1. Open Supabase SQL Editor
2. Copy/paste contents of `supabase-migrations/forum-schema.sql`
3. Click "Run"
4. Done! Forum is ready

### Access
- **Main Forum**: `/forum`
- **Category View**: `/forum/category/:categoryId`
- **View Topic**: `/forum/topic/:topicId`

---

## 🎯 User Actions

### Anyone (Not Signed In)
- ✅ View categories
- ✅ View topics
- ✅ View replies
- ✅ See stats
- ❌ Cannot create/reply

### Authenticated Users
- ✅ Create topics
- ✅ Reply to topics
- ✅ Edit own replies
- ✅ Delete own replies

### Admin Only (ID: 5bc2da58-8e69-4779-ba02-52e6182b9668)
- ✅ Add categories
- ✅ Pin/unpin topics
- ✅ Lock/unlock topics
- ✅ Delete any topic/reply

---

## 📊 Stats Explained

| Stat | Description |
|------|-------------|
| Total Members | Unique users who posted |
| Total Posts | Topics + Replies combined |
| Active Topics | Activity in last 30 days |
| Online Now | Currently signed in users |

---

## 🗂️ Database Tables

### forum_categories
- `name`, `description`, `icon`, `color`
- Admin only (RLS)
- 4 default categories included

### forum_topics
- `title`, `content`, `author_name`
- `views_count`, `replies_count`
- `is_pinned`, `is_locked`
- Auto-updates via triggers

### forum_replies
- `content`, `author_name`
- `topic_id` (cascade delete)
- Auto-updates topic stats

---

## 🎨 Category Colors

| Color | CSS Class | Example |
|-------|-----------|---------|
| blue | `bg-blue-100 text-blue-800` | General |
| green | `bg-green-100 text-green-800` | Training |
| purple | `bg-purple-100 text-purple-800` | Equipment |
| red | `bg-red-100 text-red-800` | Events |
| yellow | `bg-yellow-100 text-yellow-800` | Custom |
| pink | `bg-pink-100 text-pink-800` | Custom |

---

## 🔧 Admin Controls

### On Forum Page
- **+ Add Category**: Opens modal to create new category

### On Topic Page
- **📌**: Pin/unpin topic (shows at top)
- **🔒/🔓**: Lock/unlock topic (prevent replies)
- **Delete**: Remove topic + all replies

---

## 📝 Sample Data

### Categories (4)
1. General Discussion 💬
2. Training & Technique 🏃‍♂️
3. Equipment & Gear ⚙️
4. Events & Races 🏁

### Topics (8)
- 2 per category
- Pre-populated with realistic content
- Sample replies included

---

## 🔐 Security (RLS)

### Categories
- **Select**: Everyone
- **Insert/Update/Delete**: Admin only

### Topics
- **Select**: Everyone
- **Insert**: Authenticated
- **Update**: Author only
- **Delete**: Author or Admin

### Replies
- **Select**: Everyone
- **Insert**: Authenticated (if topic not locked)
- **Update**: Author only
- **Delete**: Author or Admin

---

## ⚡ Key Features

✅ Real-time stats calculation
✅ Auto-updating reply counts
✅ View tracking per topic
✅ Color-coded categories
✅ Pin important topics
✅ Lock closed topics
✅ Responsive design
✅ Admin moderation tools
✅ Sample data included
✅ Production-ready

---

## 🐛 Troubleshooting

### Can't see forum?
- Check route: `/forum`
- Verify SQL ran successfully

### Can't create topic?
- Must be signed in
- Check RLS policies enabled

### Stats showing zero?
- Verify triggers created
- Check sample data inserted

### Admin buttons not showing?
- Verify user ID matches admin UUID
- Check RLS policies

---

## 📚 Documentation

- **Setup Guide**: `FORUM-SETUP.md`
- **Full Summary**: `FORUM-SUMMARY.md`
- **SQL Schema**: `supabase-migrations/forum-schema.sql`
- **Components**: 
  - `frontend/src/pages/Forum.tsx`
  - `frontend/src/pages/ForumTopic.tsx`

---

## 🎉 That's It!

Your forum is ready to use. Run the SQL, visit `/forum`, and start building your community!

**Questions?** Check the detailed documentation in `FORUM-SETUP.md`
