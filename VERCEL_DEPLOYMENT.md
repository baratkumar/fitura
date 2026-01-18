# Vercel Deployment Guide for Fitura

This guide will help you deploy the Fitura application to Vercel.

## Prerequisites

- GitHub repository: `https://github.com/baratkumar/fitura.git`
- Supabase project with database credentials
- Vercel account (sign up at [vercel.com](https://vercel.com))

## Step 1: Deploy to Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Sign in or create an account

2. **Import Project**
   - Click "Add New Project" or "Import Project"
   - Select "Import Git Repository"
   - Choose `baratkumar/fitura` from your GitHub repositories
   - Click "Import"

3. **Configure Project**
   - **Framework Preset**: Next.js (should be auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

4. **Add Environment Variables**
   Click "Environment Variables" and add the following:

   | Variable Name | Value | Environment |
   |-------------|-------|-------------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://oyhjmwkrpdgwrbufgucg.supabase.co` | Production, Preview, Development |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | `sb_publishable_qtlP4EsDCZ_jLcpJg7PtfQ_HfUK7Xj0` | Production, Preview, Development |
   | `DB_PASSWORD` | `[Your Supabase Database Password]` | Production, Preview, Development |
   | `NODE_ENV` | `production` | Production |
   | `NODE_ENV` | `staging` | Preview (optional) |
   | `NODE_ENV` | `local` | Development (optional) |

   **Important**: 
   - Get your `DB_PASSWORD` from Supabase Dashboard → Settings → Database → Connection string
   - The password is in the connection string: `postgresql://postgres:[PASSWORD]@...`
   - Make sure to add variables to all environments (Production, Preview, Development)

5. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete
   - Your app will be available at `https://your-project-name.vercel.app`

### Option B: Via Vercel CLI

```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Follow the prompts to configure your project
```

## Step 2: Initialize Database

After deployment, you need to initialize the database tables:

1. **Visit the initialization endpoint**:
   ```
   https://your-project-name.vercel.app/api/init-db
   ```

2. **Or use curl**:
   ```bash
   curl https://your-project-name.vercel.app/api/init-db
   ```

3. **Verify tables are created**:
   - Check your Supabase Dashboard → Table Editor
   - You should see tables with prefix `FT_PRD_`:
     - `FT_PRD_memberships`
     - `FT_PRD_clients`
     - `FT_PRD_attendance`

## Step 3: Verify Deployment

1. **Test the application**:
   - Visit your deployed URL
   - Test login: `admin@fitura.com` / `admin123`
   - Check dashboard, clients, and attendance pages

2. **Check logs** (if issues occur):
   - Go to Vercel Dashboard → Your Project → Deployments
   - Click on a deployment → View Function Logs

## Environment-Specific Table Prefixes

The application uses environment-based table prefixes:

- **Production** (`NODE_ENV=production`): `FT_PRD_`
- **Staging** (`NODE_ENV=staging`): `FT_STG_`
- **Local** (`NODE_ENV=local`): `FT_LCL_`

This allows you to have separate databases for different environments.

## Troubleshooting

### Build Errors

1. **Check build logs** in Vercel Dashboard
2. **Verify environment variables** are set correctly
3. **Check Node.js version** (should be 18.x or higher)

### Database Connection Errors

1. **Verify `DB_PASSWORD`** is correct
2. **Check Supabase database** is accessible
3. **Verify `NEXT_PUBLIC_SUPABASE_URL`** is correct
4. **Check network restrictions** in Supabase (allow Vercel IPs if needed)

### Runtime Errors

1. **Check function logs** in Vercel Dashboard
2. **Verify database tables** are initialized
3. **Check environment variables** are available at runtime

## Continuous Deployment

Once connected to GitHub:
- **Automatic deployments** on every push to `main` branch
- **Preview deployments** for pull requests
- **Production deployments** can be set to auto-deploy or manual

## Additional Configuration

### Custom Domain

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

### Environment Variables for Different Branches

You can set different environment variables for:
- Production (main branch)
- Preview (other branches)
- Development (local)

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check Supabase database logs
3. Verify all environment variables are set correctly
4. Ensure database tables are initialized





