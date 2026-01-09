# Environment Variables Reference

## Required Environment Variables for Vercel

Copy these variables to your Vercel project settings (Settings → Environment Variables):

### Supabase Configuration
```
NEXT_PUBLIC_SUPABASE_URL=https://oyhjmwkrpdgwrbufgucg.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_qtlP4EsDCZ_jLcpJg7PtfQ_HfUK7Xj0
```

### Database Configuration
```
DB_PASSWORD=your_supabase_database_password_here
```

**How to get DB_PASSWORD:**
1. Go to Supabase Dashboard
2. Navigate to: Settings → Database
3. Find "Connection string" section
4. Copy the password from the connection string:
   - Format: `postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres`
   - Extract the `[PASSWORD]` part

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

## Quick Setup Checklist

- [ ] `NEXT_PUBLIC_SUPABASE_URL` added to Vercel
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` added to Vercel
- [ ] `DB_PASSWORD` added to Vercel (from Supabase)
- [ ] `NODE_ENV` set to `production` for production environment
- [ ] All variables added to Production, Preview, and Development environments
- [ ] Application redeployed after adding variables
- [ ] Database initialized via `/api/init-db` endpoint


