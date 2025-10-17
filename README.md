# Wheelchair Racer

A comprehensive wheelchair racing platform featuring user authentication, blog system, forum, contact forms, and more.

## 📋 Documentation

All setup guides and documentation can be found in the [`docs/`](docs/) folder:

### Setup & Configuration
- **[SETUP_GUIDE.md](docs/SETUP_GUIDE.md)** - Initial project setup and configuration
- **[RESEND-SETUP-GUIDE.md](docs/RESEND-SETUP-GUIDE.md)** - Email setup with Resend for contact forms
- **[PASSWORD-RESET-SETUP.md](docs/PASSWORD-RESET-SETUP.md)** - Password reset functionality setup
- **[CONTACT-FORM-READY.md](docs/CONTACT-FORM-READY.md)** - Contact form configuration and testing

### Forum System
- **[FORUM-SETUP.md](docs/FORUM-SETUP.md)** - Complete forum system setup instructions
- **[FORUM-QUICK-REFERENCE.md](docs/FORUM-QUICK-REFERENCE.md)** - Quick reference for forum features
- **[FORUM-SUMMARY.md](docs/FORUM-SUMMARY.md)** - Forum architecture and features summary

### Maintenance
- **[CLEANUP-SUMMARY.md](docs/CLEANUP-SUMMARY.md)** - Recent cleanup and organization summary

## 🏗️ Project Structure

```
WheelchairRacer/
├── frontend/              # React + TypeScript frontend
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── lib/          # Utilities & Supabase client
│   │   └── App.tsx       # Main app component
│   └── package.json
│
├── backend/              # Backend services (if any)
│
├── supabase/             # Supabase Edge Functions
│   └── functions/
│       └── send-contact-email/  # Contact form email handler
│
├── supabase-migrations/  # Database migration scripts
│   ├── forum-schema.sql
│   ├── blog-likes-comments.sql
│   └── add-multiple-images.sql
│
└── docs/                 # Additional documentation
```

## 🚀 Features

### ✅ Implemented
- **Authentication** - Sign up, login, password reset via Supabase Auth
- **Blog System** - Create, edit, delete posts with images
- **Forum** - Categories, topics, replies with admin controls
- **Contact Form** - Email delivery via Resend
- **User Profiles** - Profile management and customization
- **Admin Tools** - Content moderation and management

### 🔄 In Progress
- Domain verification for custom email addresses
- Additional forum features

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS, Vite
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Email:** Resend API
- **Deployment:** [TBD]

## 📧 Contact

For issues or questions, use the contact form or reach out to contact@wheelchairracer.com

## 📝 License

[Your License Here]
