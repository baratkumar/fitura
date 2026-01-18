# 🚀 Quick Start: Deploy to Vercel

## Step 1: Deploy (5 minutes)

1. **Go to [vercel.com](https://vercel.com)** and sign in
2. **Click "Add New Project"**
3. **Import from GitHub**: Select `baratkumar/fitura`
4. **Click "Deploy"** (we'll add environment variables next)

## Step 2: Add Environment Variables (2 minutes)

In Vercel Dashboard → Your Project → Settings → Environment Variables, add:

```
NEXT_PUBLIC_SUPABASE_URL = https://oyhjmwkrpdgwrbufgucg.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY = sb_publishable_qtlP4EsDCZ_jLcpJg7PtfQ_HfUK7Xj0
DB_PASSWORD = [Get from Supabase Dashboard → Settings → Database → Connection string]
NODE_ENV = production
```

**Get DB_PASSWORD:**
- Supabase Dashboard → Settings → Database
- Copy password from connection string: `postgresql://postgres:[PASSWORD]@...`

## Step 3: Redeploy (1 minute)

- Go to Deployments tab
- Click "..." on latest deployment → "Redeploy"

## Step 4: Initialize Database (30 seconds)

Visit: `https://your-app.vercel.app/api/init-db`

Or use the script:
```bash
./scripts/init-db.sh https://your-app.vercel.app
```

## ✅ Done!

Your app is now live! Login with:
- Email: `admin@fitura.com`
- Password: `admin123`

---

📖 **Full Guide**: See `VERCEL_DEPLOYMENT.md` for detailed instructions
🔧 **Environment Variables**: See `ENV_VARIABLES.md` for complete reference





