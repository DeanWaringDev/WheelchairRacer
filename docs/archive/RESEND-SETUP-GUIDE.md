# Resend Setup Guide for Contact Form

This guide walks you through setting up Resend to handle contact form submissions.

## Prerequisites

- Supabase CLI installed (`npm install -g supabase`)
- Supabase account with your project
- Git bash or terminal access

## Step 1: Create a Resend Account

1. Go to [https://resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

## Step 2: Get Your Resend API Key

1. Log into Resend dashboard
2. Go to **API Keys** section
3. Click **Create API Key**
4. Give it a name like "Wheelchair Racer Contact Form"
5. Copy the API key (starts with `re_...`)
6. **IMPORTANT**: Save this key somewhere safe - you won't be able to see it again!

## Step 3: Add Domain (Optional but Recommended)

For production use, you should verify your domain:

1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `wheelchairracer.com`)
4. Follow the DNS verification steps
5. Wait for verification (can take a few minutes to 24 hours)

**For testing**: You can skip this step and use Resend's test domain, but emails will only be sent to the email address associated with your Resend account.

## Step 4: Link Supabase CLI to Your Project

Open your terminal and navigate to your project:

```bash
cd "c:/Users/deanw/Desktop/Wheelchair Racer/WheelchairRacer"
```

Link to your Supabase project:

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

**To find your PROJECT_REF**:
1. Go to your Supabase dashboard
2. Select your project
3. Go to Settings → General
4. Copy the "Reference ID"

## Step 5: Set the Resend API Key as a Secret

Set your Resend API key as a Supabase secret:

```bash
supabase secrets set RESEND_API_KEY=your_actual_api_key_here
```

Replace `your_actual_api_key_here` with the API key you copied from Resend.

**Verify it was set**:
```bash
supabase secrets list
```

You should see `RESEND_API_KEY` in the list.

## Step 6: Deploy the Edge Function

Deploy the contact email function:

```bash
supabase functions deploy send-contact-email
```

You should see output like:
```
Deploying Function send-contact-email (project-ref: xxxxx)
...
Deployed Function send-contact-email (project-ref: xxxxx)
```

## Step 7: Test the Contact Form

1. Start your frontend (if not already running):
   ```bash
   cd frontend
   npm run dev
   ```

2. Navigate to the Contact page: `http://localhost:5173/contact`

3. Fill out the form and submit

4. Check your email inbox (the email you used for Resend account)

## Troubleshooting

### Error: "Invalid API key"
- Make sure you copied the full API key from Resend
- Re-run: `supabase secrets set RESEND_API_KEY=your_key`
- Redeploy: `supabase functions deploy send-contact-email`

### Error: "Failed to deploy function"
- Make sure you're linked to the correct project: `supabase link --project-ref YOUR_REF`
- Check you have the Supabase CLI installed: `supabase --version`

### Error: "Domain not verified"
If you added a custom domain but it's not verified yet:
- **Option 1**: Wait for DNS verification to complete
- **Option 2**: Use `onboarding@resend.dev` as the `from` email temporarily
- **Option 3**: Only test with the email address linked to your Resend account

### Not receiving emails
- Check Resend dashboard → **Emails** section to see if emails were sent
- Check spam folder
- If domain not verified, emails only go to your Resend account email
- Try with a verified domain or `onboarding@resend.dev`

## Customization

### Change the "From" Email

Edit `supabase/functions/send-contact-email/index.ts`:

```typescript
from: 'notifications@yourdomain.com', // Change this
```

### Change the "To" Email

The form already sends to `contact@wheelchairracer.com`, but you can change it in the Edge Function:

```typescript
to: 'youremail@example.com', // Change this
```

### Customize Email Template

Edit the `html` field in the Edge Function to match your branding.

## Cost Information

Resend Free Tier:
- 100 emails per day
- 3,000 emails per month
- 1 verified domain

This should be more than enough for a contact form!

## Next Steps

After successful setup:
1. ✅ Contact form sends emails via Resend
2. ✅ No email client popup needed
3. ✅ Professional email delivery
4. ✅ Track emails in Resend dashboard

## Security Notes

- Never commit your Resend API key to git
- Always use `supabase secrets` for sensitive data
- The Edge Function is server-side, so your API key is safe
- Consider adding rate limiting for production use

## Support

- Resend Documentation: https://resend.com/docs
- Supabase Edge Functions: https://supabase.com/docs/guides/functions
- GitHub Issues: Open an issue in your repository
