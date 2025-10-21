# 📋 TODO List - Wheelchair Racer Project

**Last Updated:** October 21, 2025  
**Project Status:** ⚠️ AUTHENTICATION BROKEN - REQUIRES IMMEDIATE FIX

---

## 🚨 **URGENT - AUTH NOT WORKING** (Fix Immediately!)

### ✨ Clean Slate Setup (No Existing Users)

- [ ] **Run CLEAN_SLATE.sql migration** (2 min)
  - File: `supabase/migrations/CLEAN_SLATE.sql`
  - Copy entire contents to Supabase SQL Editor and run
  - Deletes any broken setup and creates fresh profiles table
  - Sets up RLS policies and automatic profile creation trigger
  - **BLOCKER:** Nothing works until this is done

- [ ] **Configure Supabase Settings** (2 min)
  - Supabase Dashboard → Authentication → Settings
  - **UNCHECK** "Enable email confirmations" (for testing)
  - **UNCHECK** "Secure email change"
  - Set Site URL: `http://localhost:5173`
  - Add Redirect URL: `http://localhost:5173/**`
  - Click Save after each change

- [ ] **Test sign up flow** (1 min)
  - Clear browser cache/cookies (CTRL+SHIFT+DELETE)
  - Go to sign up page
  - Create account: testuser / test@example.com / test123456
  - Should work immediately with no errors

- [ ] **Verify in Supabase** (30 sec)
  - Check Authentication → Users (should see test@example.com)
  - Check Database → profiles table (should see 1 row)
  - Verify user and profile counts match

- [ ] **Test sign in flow** (30 sec)
  - Sign out and sign in again with test account
  - Verify session persists after page refresh
  - Check user appears in header
  - Can access profile page

**See:** `CLEAN_SLATE_GUIDE.md` for detailed step-by-step instructions

**Total Time:** 5 minutes to fix everything! 🚀

---

## 🔴 **CRITICAL PRIORITY** - Must Fix Before Production

### Security & Configuration

- [ ] **Create root `.gitignore` file**
  - Add protection for `.env` files, Python cache, node_modules
  - Prevent accidental commit of sensitive data
  - Location: `WheelchairRacer/.gitignore`

- [ ] **Verify `.env` files not tracked in git**
  - Check: `git status` for any `.env` files
  - Remove if tracked: `git rm --cached data/.env`
  - Document required environment variables

- [ ] **Fix hardcoded admin ID fallback** 
  - File: `frontend/src/lib/constants.ts` (line 11)
  - Remove fallback value `'5bc2da58-8e69-4779-ba02-52e6182b9668'`
  - Throw error if `VITE_ADMIN_USER_ID` not set
  - Ensures production security

- [ ] **Add input sanitization with DOMPurify**
  - Install: `npm install dompurify @types/dompurify`
  - Sanitize user content in:
    - `frontend/src/pages/Blog.tsx`
    - `frontend/src/pages/Forum.tsx`
    - `frontend/src/pages/ForumTopic.tsx`
  - Prevent XSS attacks on user-generated content

---

## 🟡 **HIGH PRIORITY** - Should Fix Soon

### Security Enhancements

- [ ] **Implement rate limiting on forms**
  - Contact form submissions
  - Blog post creation
  - Forum post/reply creation
  - Consider: Upstash Rate Limit or Supabase Edge Function middleware

- [ ] **Add Error Boundary to app root**
  - File: `frontend/src/main.tsx`
  - Wrap `<App />` with existing `<ErrorBoundary>`
  - Provides graceful error recovery

- [ ] **Enforce file upload size limits**
  - Files: `frontend/src/pages/Profile.tsx`, `frontend/src/pages/Blog.tsx`
  - Add validation before upload (max 2MB)
  - Show user-friendly error messages

- [ ] **Add image optimization**
  - Option 1: Use Supabase Image Transformations
  - Option 2: Client-side compression with `browser-image-compression`
  - Reduce bandwidth and improve load times

### Code Quality

- [ ] **Refactor large components**
  - `Blog.tsx` (836 lines) - Extract:
    - `<CommentSection />` component
    - `<PostForm />` component
    - `<PostCard />` component
  - Improves maintainability and testing

- [ ] **Fix AuthContext error handling**
  - File: `frontend/src/contexts/AuthContext.tsx`
  - Profile creation errors are swallowed (lines 76-84)
  - Log to error tracking service or notify user

---

## 🟢 **MEDIUM PRIORITY** - Nice to Have

### User Experience

- [ ] **Implement loading skeletons**
  - Replace "Loading..." text with skeleton screens
  - Files: All pages with loading states
  - Create reusable `<LoadingSkeleton />` component
  - Better perceived performance

- [ ] **Add SEO meta tags**
  - Install: `npm install react-helmet-async`
  - Add meta tags for:
    - Open Graph (social sharing)
    - Twitter Cards
    - Page titles and descriptions
  - Improves discoverability

- [ ] **Implement PWA support**
  - Install: `npm install vite-plugin-pwa -D`
  - Enable offline functionality
  - Add app manifest
  - Cache parkrun data for offline viewing

### Performance

- [ ] **Add React.memo to expensive components**
  - Candidate components:
    - `ParkrunCard`
    - `MapView` markers
    - `ForumTopic` replies
  - Reduces unnecessary re-renders

- [ ] **Implement virtual scrolling**
  - Install: `npm install react-window`
  - Use for long lists (parkrun results, forum topics)
  - Improves performance with large datasets

- [ ] **Add image lazy loading**
  - Add `loading="lazy"` to all `<img>` tags
  - Especially important for blog posts and parkrun images

- [ ] **Configure bundle size analysis**
  - Run: `npm run build -- --analyze`
  - Identify large dependencies
  - Consider code splitting

### Monitoring & Analytics

- [ ] **Set up error tracking**
  - Service: Sentry or LogRocket
  - Track production errors
  - Monitor user sessions
  - Set up alerts for critical errors

- [ ] **Add analytics**
  - Service: Google Analytics, Plausible, or Vercel Analytics
  - Track user behavior
  - Monitor popular parkruns
  - Analyze feature usage

- [ ] **Configure uptime monitoring**
  - Service: UptimeRobot or Better Uptime
  - Monitor site availability
  - Alert on downtime
  - Track response times

---

## 🔵 **LOW PRIORITY** - Polish & Refinement

### Testing

- [ ] **Set up testing framework**
  - Install: `npm install -D vitest @testing-library/react @testing-library/jest-dom`
  - Create test files for:
    - Utility functions
    - Context providers
    - Critical components
  - Target: 60%+ code coverage

- [ ] **Add E2E tests**
  - Tool: Playwright or Cypress
  - Test critical user flows:
    - Sign up → Profile update
    - Blog post creation → Editing
    - Forum topic → Reply
    - Parkrun search → Detail view

### Code Quality & Style

- [ ] **Configure Prettier**
  - Install: `npm install -D prettier`
  - Create `.prettierrc` config
  - Add format script to `package.json`
  - Set up auto-format on save

- [ ] **Replace magic numbers with named constants**
  - File: `frontend/src/components/ParkrunBrowser.tsx`
  - Example: `.limit(25)` → `INITIAL_RESULTS_LIMIT`
  - Improves code readability

- [ ] **Fix inconsistent path handling in Python**
  - Use `pathlib.Path` instead of string concatenation
  - Files: All Python scripts in `/data`
  - Ensures cross-platform compatibility

- [ ] **Set up commit hooks**
  - Install: `npm install -D husky lint-staged`
  - Run linting before commit
  - Run formatting before commit
  - Prevents bad code from being committed

### CI/CD

- [ ] **Create GitHub Actions workflow**
  - Jobs:
    - Lint and type check
    - Run tests
    - Build verification
    - Deploy to production
  - File: `.github/workflows/deploy.yml`

- [ ] **Configure deployment platform**
  - Options: Vercel, Netlify, or Cloudflare Pages
  - Set environment variables
  - Configure build settings
  - Set up domain

### Documentation

- [ ] **Create API documentation**
  - Document Supabase schema
  - Document Edge Functions
  - Document data pipeline (bronze → silver → gold)

- [ ] **Add CONTRIBUTING.md**
  - Contribution guidelines
  - Code style guide
  - Pull request process
  - Development setup instructions

- [ ] **Create architecture diagram**
  - Visual representation of system components
  - Data flow diagrams
  - Technology stack overview

- [ ] **Clean up unused directories**
  - Remove or populate `frontend/docs/` (currently empty)
  - Archive old documentation in `docs/archive/`

### Features & Enhancements

- [ ] **Implement newsletter feature**
  - Currently marked as TODO in `constants.ts`
  - Set up email service integration
  - Create subscription form
  - Design email templates

- [ ] **Implement dark mode**
  - Currently marked as TODO in `constants.ts`
  - Add theme toggle
  - Store preference in localStorage
  - Update CSS custom properties

- [ ] **Add password strength meter**
  - Visual indicator during password creation
  - Show strength criteria (length, numbers, special chars)
  - Files: `SignIn.tsx`, `ResetPassword.tsx`

---

## 📊 **Priority Matrix**

### Do First (Critical + Quick)
1. Create root `.gitignore`
2. Verify `.env` files security
3. Fix admin ID fallback
4. Add Error Boundary to app

### Do Next (Critical + Time-Consuming)
1. Add input sanitization (DOMPurify)
2. Implement rate limiting
3. Add file upload validation

### Schedule (Important + Quick)
1. Add loading skeletons
2. Configure Prettier
3. Add image lazy loading

### Plan (Important + Time-Consuming)
1. Set up testing framework
2. Implement error tracking
3. Create CI/CD pipeline
4. Add PWA support

---

## 🎯 **Weekly Sprint Suggestions**

### Week 1 - Security Hardening
- ✅ Root `.gitignore`
- ✅ Environment variable audit
- ✅ Admin ID fix
- ✅ Input sanitization setup

### Week 2 - User Safety & Monitoring
- ✅ Rate limiting
- ✅ File upload validation
- ✅ Error Boundary implementation
- ✅ Sentry setup

### Week 3 - Performance Optimization
- ✅ Image optimization
- ✅ Loading skeletons
- ✅ React.memo implementation
- ✅ Bundle analysis

### Week 4 - Testing & CI/CD
- ✅ Testing framework setup
- ✅ Write critical tests
- ✅ GitHub Actions workflow
- ✅ Deployment configuration

### Week 5+ - Polish & Features
- ✅ SEO implementation
- ✅ PWA setup
- ✅ Dark mode
- ✅ Newsletter feature

---

## 📝 **Notes**

- **Before Production Deploy**: Complete all 🔴 CRITICAL items
- **For MVP Launch**: Complete 🔴 CRITICAL + 🟡 HIGH PRIORITY items
- **For Full Launch**: Complete through 🟢 MEDIUM PRIORITY items
- **For Excellence**: Complete all items including 🔵 LOW PRIORITY

---

## ✅ **Completed Items**

### Previous Code Review Fixes (October 2025)
- ✅ Centralized admin user ID in constants
- ✅ Removed console.log statements
- ✅ Created logger utility
- ✅ Environment-aware logging

---

## 🔗 **Related Documents**

- `README.md` - Project overview
- `docs/CODE-REVIEW.md` - Detailed code review
- `frontend/docs/CODE-REVIEW-IMPLEMENTATION.md` - Previous fixes
- `data/README.md` - Data pipeline documentation

---

**Remember:** Quality over speed. Each improvement makes the project more maintainable, secure, and user-friendly! 🚀
