# Environment Variables Reference

## Required Environment Variables for Vercel

Copy these variables to your Vercel project settings (Settings → Environment Variables):

### Supabase Configuration
```
NEXT_PUBLIC_SUPABASE_URL=https://oyhjmwkrpdgwrbufgucg.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_qtlP4EsDCZ_jLcpJg7PtfQ_HfUK7Xj0
```

### Database Configuration

**Option 1: Use DATABASE_URL (Recommended for local development)**
```
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.oyhjmwkrpdgwrbufgucg.supabase.co:5432/postgres
```

**Option 2: Use separate variables**
```
DB_PASSWORD=your_supabase_database_password_here
```

**How to get connection details:**
1. Go to Supabase Dashboard
2. Navigate to: Settings → Database
3. Find "Connection string" section
4. Copy the entire connection string for `DATABASE_URL`, or just the password for `DB_PASSWORD`
   - Format: `postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres`
   
**Note:** If you're having DNS resolution issues locally, use `DATABASE_URL` with the full connection string instead.

### Environment Configuration
```
NODE_ENV=production
```

**For different environments:**
- Production: `NODE_ENV=production` → Tables: `FT_PRD_*`
- Staging: `NODE_ENV=staging` → Tables: `FT_STG_*`
- Development: `NODE_ENV=local` → Tables: `FT_LCL_*`

## Vercel Environment Variable Setup

1. Go to your Vercel project dashboard
2. Navigate to: Settings → Environment Variables
3. Add each variable:
   - **Name**: Variable name (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
   - **Value**: Variable value
   - **Environment**: Select all (Production, Preview, Development)
4. Click "Save"
5. Redeploy your application for changes to take effect

## Optional: Vercel Blob Storage (for client photos)

If you want to enable photo uploads:
```
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

To get this token:
1. Go to Vercel Dashboard
2. Navigate to: Storage → Create Database → Blob
3. Create a blob store
4. Copy the `BLOB_READ_WRITE_TOKEN` from the store settings

## Optional: WhatsApp Cloud API

If you want to send WhatsApp messages from your API:
```
WHATSAPP_PHONE_NUMBER_ID=your_meta_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_meta_access_token
```

How to get these values:
1. Open your Meta Developer App and go to WhatsApp > API Setup
2. Copy the `Phone number ID`
3. Generate or copy a permanent access token for your app/system user
4. Optional but recommended for scheduled jobs:
```
CRON_SECRET=your_long_random_secret
```

Endpoint added in this project:
- `POST /api/whatsapp/send`
- Body:
```
{
  "to": "919876543210",
  "message": "Hello from Fitura",
  "previewUrl": false
}
```

Scheduled job endpoint (for daily cron):
- `GET /api/jobs/absent-reminders` (or `POST`)
- Optional query: `thresholdDays=3`
- If `CRON_SECRET` is set, pass either:
  - Header: `Authorization: Bearer <CRON_SECRET>`
  - Or query: `?key=<CRON_SECRET>`
- This repo includes `vercel.json` cron config using:
  - `/api/jobs/absent-reminders?thresholdDays=3&key=$CRON_SECRET`

## Quick Setup Checklist

- [ ] `NEXT_PUBLIC_SUPABASE_URL` added to Vercel
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` added to Vercel
- [ ] `DB_PASSWORD` added to Vercel (from Supabase)
- [ ] `NODE_ENV` set to `production` for production environment
- [ ] All variables added to Production, Preview, and Development environments
- [ ] Application redeployed after adding variables
- [ ] Database initialized via `/api/init-db` endpoint


