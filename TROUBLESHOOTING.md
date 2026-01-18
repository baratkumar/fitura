# Database Connection Troubleshooting

## Current Issue: DNS Resolution Failure

The error `ENOTFOUND db.oyhjmwkrpdgwrbufgucg.supabase.co` indicates that the hostname cannot be resolved.

## Solutions

### 1. Restart Your Dev Server

**Important:** Next.js only loads `.env.local` when the server starts. After adding `DATABASE_URL`, you must restart:

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

### 2. Verify Supabase Project Status

The DNS failure suggests your Supabase project might be **paused**. 

1. Go to https://supabase.com/dashboard
2. Check if your project `oyhjmwkrpdgwrbufgucg` is active
3. If paused, click "Resume" to activate it

### 3. Use Connection Pooler (Recommended for Serverless)

For Next.js (serverless), Supabase recommends using the **transaction mode pooler** on port **6543** instead of the direct connection on port 5432.

Update your `.env.local`:

```env
# Use transaction mode pooler (port 6543) - better for serverless
DATABASE_URL=postgresql://postgres:LXJn4hDwRmGh5LwE@db.oyhjmwkrpdgwrbufgucg.supabase.co:6543/postgres
```

**Note:** Change `:5432` to `:6543` in your connection string.

### 4. Verify Connection String

Get the correct connection string from Supabase:

1. Go to your Supabase project dashboard
2. Click **Settings** → **Database**
3. Under **Connection string**, select **Transaction mode** (for serverless)
4. Copy the connection string
5. Replace `[YOUR-PASSWORD]` with your actual password: `LXJn4hDwRmGh5LwE`

### 5. Check Environment Variables

Verify that `DATABASE_URL` is being loaded:

1. Check `.env.local` exists and contains `DATABASE_URL`
2. Restart the dev server
3. Look for this log message: `✓ DATABASE_URL found, using connection string`

If you see `✗ DATABASE_URL is not set`, the variable isn't being loaded.

### 6. Alternative: Use Supabase Client Library

If direct PostgreSQL connection continues to fail, consider using the Supabase JavaScript client library instead of direct `pg` connections.

## Current Configuration

Your `.env.local` should contain:

```env
NEXT_PUBLIC_SUPABASE_URL=https://oyhjmwkrpdgwrbufgucg.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_qtlP4EsDCZ_jLcpJg7PtfQ_HfUK7Xj0
DATABASE_URL=postgresql://postgres:LXJn4hDwRmGh5LwE@db.oyhjmwkrpdgwrbufgucg.supabase.co:5432/postgres
NODE_ENV=local
```

## Next Steps

1. **First:** Restart your dev server
2. **If still failing:** Try port 6543 (connection pooler)
3. **If still failing:** Check Supabase dashboard to ensure project is active
4. **If still failing:** Verify the connection string in Supabase dashboard



