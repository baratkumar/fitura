# Use MongoDB on Vercel

Set the following environment variable in your Vercel project so the app uses the cluster at `cluster1.kv00l1p.mongodb.net`.

## Variable

| Name          | Value                                                                 |
|---------------|-----------------------------------------------------------------------|
| `MONGODB_URI` | `mongodb+srv://vercel-admin-user:e6lDe8o8vdbCKv62@cluster1.kv00l1p.mongodb.net/test` |

The `/test` at the end is the database name (where the migration script wrote the data). Change it to another database name if you use a different one.

## How to set in Vercel

1. Open your project on [vercel.com](https://vercel.com) → **Settings** → **Environment Variables**.
2. Add:
   - **Name:** `MONGODB_URI`
   - **Value:** `mongodb+srv://vercel-admin-user:e6lDe8o8vdbCKv62@cluster1.kv00l1p.mongodb.net/test`
   - **Environments:** Production, Preview, and Development (as needed).
3. Save and redeploy the project so the new variable is used.

## Optional: Vercel CLI

```bash
vercel env add MONGODB_URI production
# When prompted, paste: mongodb+srv://vercel-admin-user:e6lDe8o8vdbCKv62@cluster1.kv00l1p.mongodb.net/test
```

Then redeploy.
