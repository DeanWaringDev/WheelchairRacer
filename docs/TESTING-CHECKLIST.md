# 🧪 Production Testing Checklist - Wheelchair Racer

## 🔐 ADMIN Features

### Authentication
- [ ] Sign In as Admin
- [ ] Sign Out

### Profile Management
- [ ] Change Username (updates display name everywhere)
- [ ] Change Profile Picture
- [ ] Username Change Updates Display Name in posts/comments

### Blog Management
- [ ] Add Blog Post (with/without images)
- [ ] Edit Blog Post
- [ ] Delete Blog Post
- [ ] Like Blog Post
- [ ] Comment On Blog Post
- [ ] Delete Comment on Blog Post (own + others)
- [ ] Blog post images display correctly
- [ ] Blog categories filter works

### Forum Management
- [ ] Add Forum Category
- [ ] Edit Forum Category (if available)
- [ ] Delete Forum Category (if available)
- [ ] Add New Topic
- [ ] Edit Topic (if available)
- [ ] Delete Topic (if available)
- [ ] Reply In A Topic
- [ ] Edit Reply (if available)
- [ ] Delete Reply (own + others)
- [ ] Pin Topic (if available)
- [ ] Lock Topic (if available)

---

## 👤 User Via Google Sign In

### Authentication
- [ ] Sign In with Google
- [ ] Sign Out

### Profile
- [ ] Change Username
- [ ] Change Profile Picture
- [ ] Username Change Updates Display Name
- [ ] View own profile page
- [ ] Profile shows user's posts/activity

### Blog Interaction
- [ ] Like Blog Post
- [ ] Comment On Blog Post
- [ ] Delete Comment on Blog Post (own only)
- [ ] Cannot edit others' blog posts
- [ ] Cannot delete others' blog posts

### Forum Interaction
- [ ] Add New Topic
- [ ] Reply In A Topic
- [ ] Edit own topic (if available)
- [ ] Delete own topic (if available)
- [ ] Edit own reply (if available)
- [ ] Delete own reply (if available)
- [ ] Cannot delete others' topics/replies

---

## 📧 User Via Email Sign Up

### Authentication
- [ ] Sign Up with email/password
- [ ] Sign In with email/password
- [ ] Forgot Password flow works
- [ ] Reset Password flow works
- [ ] Sign Out

### Profile
- [ ] Change Username
- [ ] Change Profile Picture
- [ ] Username Change Updates Display Name
- [ ] View own profile page

### Blog Interaction
- [ ] Like Blog Post
- [ ] Comment On Blog Post
- [ ] Delete Comment on Blog Post (own only)

### Forum Interaction
- [ ] Add New Topic
- [ ] Reply In A Topic
- [ ] Delete own replies (if available)

---

## 🌐 General Site (Not Signed In)

### Core Pages Load
- [ ] Home page loads
- [ ] About page loads
- [ ] Contact page loads
- [ ] Blog page loads
- [ ] Forum page loads
- [ ] Parkrun page loads
- [ ] Privacy Policy loads
- [ ] Terms of Service loads
- [ ] Cookie Policy loads

### Blog Features
- [ ] Blog Likes Showing and Updating Correctly
- [ ] Blog Comments Showing and Updating Correctly
- [ ] Blog posts display correctly
- [ ] Blog images load
- [ ] Blog categories filter works
- [ ] Cannot post/comment without sign in (shows prompt)

### Forum Features
- [ ] Forum categories list correctly
- [ ] Forum topics display correctly
- [ ] Forum replies display correctly
- [ ] View counts increment
- [ ] Cannot post without sign in (shows prompt)

### Parkrun Features
- [ ] All Parkruns Can be Found
- [ ] Search Features Work as Expected
- [ ] Filter by Country works
- [ ] Filter by Mobility Type works
- [ ] Filter by Minimum Score works
- [ ] Scores For Accessibility Look Accurate
- [ ] "Load More" pagination works
- [ ] Map view toggle works
- [ ] Individual parkrun detail pages load
- [ ] Parkrun route maps (iframes) display
- [ ] Accessibility scores display correctly

### Contact & Forms
- [ ] Contact Form Works
- [ ] Email Subscribe Works (newsletter)
- [ ] Form validation works
- [ ] Success messages appear
- [ ] Error messages appear when appropriate

### Navigation
- [ ] All header links work
- [ ] All footer links work
- [ ] Logo links back to home
- [ ] Sign In link works
- [ ] User menu works (when signed in)

---

## 🔒 Security Testing

### Rate Limiting
- [ ] Try submitting contact form 4+ times quickly (should be blocked)
- [ ] Try creating multiple blog posts quickly (should be blocked)
- [ ] Try creating multiple forum topics quickly (should be blocked)
- [ ] Rate limit messages display correctly

### Input Sanitization
- [ ] Try XSS in blog post: `<script>alert('xss')</script>` (should be stripped)
- [ ] Try XSS in forum topic: `<img src=x onerror="alert('xss')">` (should be stripped)
- [ ] Try XSS in comments (should be stripped)
- [ ] Try XSS in username (should be stripped)

### Authorization
- [ ] Regular user cannot access admin-only features
- [ ] Signed out user redirected from protected pages
- [ ] Cannot delete/edit others' content (unless admin)

---

## 📱 Responsive & Mobile

### Mobile View (Chrome DevTools or real device)
- [ ] Navigation menu works on mobile
- [ ] All forms work on touch devices
- [ ] Images are responsive
- [ ] Parkrun cards display correctly
- [ ] Forum topics display correctly
- [ ] Blog posts display correctly
- [ ] Map view works on mobile

### Tablet View
- [ ] Layout looks good on tablet
- [ ] All features work on tablet

---

## ⚡ Performance & Technical

### Developer Console (F12)
- [ ] No JavaScript errors in console
- [ ] No 404 errors for assets
- [ ] No failed network requests
- [ ] HTTPS is active (green padlock)

### Loading States
- [ ] Loading spinners show while fetching data
- [ ] Skeleton loaders work (if implemented)
- [ ] Page doesn't flash or jump while loading

### Images & Assets
- [ ] All images load correctly
- [ ] Lazy loading works (images load as you scroll)
- [ ] Profile pictures load
- [ ] Blog post images load
- [ ] Icons/logos load

### Page Speed
- [ ] Homepage loads quickly (< 3 seconds)
- [ ] Parkrun page loads reasonably (may be slow with 600+ events)
- [ ] Navigation between pages is smooth

---

## 🌍 Browser Compatibility

### Test in Multiple Browsers
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if available)
- [ ] Mobile browsers

---

## 🐛 Edge Cases & Error Handling

### Network Issues
- [ ] Test with slow network (Chrome DevTools throttling)
- [ ] Test offline behavior (shows error, not broken)

### Empty States
- [ ] View page with no blog posts
- [ ] View forum category with no topics
- [ ] View topic with no replies

### Long Content
- [ ] Test with very long blog post
- [ ] Test with very long comment
- [ ] Test with very long username

---

## ✅ Final Checks

- [ ] All links work (no broken links)
- [ ] All images load
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Forms submit correctly
- [ ] Authentication works
- [ ] Rate limiting works
- [ ] Content displays correctly
- [ ] Search/filters work
- [ ] Pagination works

---

**Testing Date:** _________________

**Tested By:** _________________

**Issues Found:** _________________

**Status:** ⬜ Pass | ⬜ Fail | ⬜ Pass with minor issues

