# 🎯 QUICK START - Auth Fix (Clean Slate)

## YOU HAVE NO USERS = EASY FIX!

---

## DO THIS (5 minutes):

### 1️⃣ Run SQL (2 min)
```
File: supabase/migrations/CLEAN_SLATE.sql
→ Copy entire file
→ Supabase SQL Editor
→ Paste and RUN ▶️
```

### 2️⃣ Disable Email Confirmation (1 min)
```
Supabase → Authentication → Settings
→ UNCHECK "Enable email confirmations"
→ Save
```

### 3️⃣ Test (2 min)
```
1. Clear browser cookies (CTRL+SHIFT+DELETE)
2. Go to /signin
3. Create account: test@example.com / test123456
4. Should work! ✅
```

---

## What This Does:
- ✅ Deletes broken old setup
- ✅ Creates fresh profiles table
- ✅ Auto-creates profiles on signup
- ✅ Sign up/sign in works immediately

---

## Files:
- **CLEAN_SLATE.sql** - The fix (run this)
- **CLEAN_SLATE_GUIDE.md** - Detailed guide
- **TODO.md** - Updated checklist

---

**Time:** 5 minutes  
**Difficulty:** Copy/paste  
**Result:** Working auth! 🎉
