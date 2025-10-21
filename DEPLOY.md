# 🚀 Deployment Guide - Wheelchair Racer

## Pre-Deployment Checklist

### 1. Environment Variables
- [ ] Verify `.env.local` has correct production Supabase credentials
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

### 2. Build & Test
```bash
cd frontend
npm run test          # Run all tests (should show 117 passing)
npm run build         # Build production files
```

### 3. Verify Build Output
Check `frontend/dist/` folder contains:
- [ ] `index.html`
- [ ] `.htaccess` file (automatically copied from `frontend/public/`)
- [ ] `assets/` folder with JS/CSS files
- [ ] All static assets (images, fonts)

**Note:** The `.htaccess` file is stored in `frontend/public/.htaccess` and is automatically copied to `dist/` during build. This file is critical for React Router to work in production.

### 4. Upload to one.com
Files to upload:
1. **All contents of `frontend/dist/`** (including `.htaccess`) → Upload to your public_html or root directory

**CRITICAL:** Make sure `.htaccess` is uploaded! Without it, direct navigation to routes like `/parkrun/bushy-park` will fail with 404 errors.

### 5. Post-Deployment Verification
Visit your site and test:
- [ ] Homepage loads correctly
- [ ] All routes work (Blog, Forum, Parkrun, etc.)
- [ ] Images and assets load
- [ ] Sign in/Sign up works
- [ ] Forum posting works
- [ ] Blog posting works (if admin)
- [ ] Parkrun browser works and loads data
- [ ] Check browser console for errors (F12)

### 6. Production Monitoring
- [ ] Test on multiple devices/browsers
- [ ] Check mobile responsiveness
- [ ] Verify HTTPS is working
- [ ] Test all forms (Contact, Sign In, Forum, Blog)

## Quick Deploy Command

```bash
# One command to test and build:
cd frontend && npm run test -- --run && npm run build
```

## Rollback Plan
If something goes wrong:
1. Keep a backup of previous `dist/` folder
2. Re-upload previous version
3. Check Supabase dashboard for any database issues

## Common Issues

### CSS/JS not loading
- Ensure `.htaccess` is uploaded
- Check MIME types in `.htaccess`
- Clear browser cache

### Routes not working (404 errors)
- Verify `.htaccess` SPA routing is active
- Check RewriteEngine is On

### Authentication issues
- Verify Supabase environment variables
- Check Supabase project settings
- Verify allowed redirect URLs in Supabase Auth settings

## Production URLs to Check
- Homepage: https://yoursite.com
- Blog: https://yoursite.com/blog
- Forum: https://yoursite.com/forum
- Parkrun: https://yoursite.com/parkrun
- Sign In: https://yoursite.com/signin

---

**Last Updated:** October 21, 2025
**Build Version:** Check `package.json` version
