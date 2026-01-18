# Vercel Blob Storage Setup for Profile Images

The application uses Vercel Blob Storage to store client profile images. All images are automatically:
- Resized to 1080x1920 pixels
- Converted to JPEG format (90% quality)
- Stored with public access
- Limited to 10MB file size

## Setup Instructions

### 1. Create a Blob Store in Vercel

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Navigate to: **Storage** → **Create Database** → **Blob**
4. Create a new blob store
5. Copy the `BLOB_READ_WRITE_TOKEN` from the store settings

### 2. Configure Environment Variable

Add the token to your environment variables:

**For Local Development (.env.local):**
```env
BLOB_READ_WRITE_TOKEN=vercel_blob_xxxxxxxxxxxxx
```

**For Vercel Deployment:**
1. Go to your project settings in Vercel
2. Navigate to **Settings** → **Environment Variables**
3. Add `BLOB_READ_WRITE_TOKEN` with your token value
4. Select all environments (Production, Preview, Development)
5. Redeploy your application

### 3. Verify Setup

After setting up the token:
1. Restart your development server: `npm run dev`
2. Try uploading a profile image when creating/editing a client
3. Check the browser console for any errors

## How It Works

### Upload Flow

1. **User selects an image** in the client form
2. **Image is validated** (type, size)
3. **Image is resized** to 1080x1920 using Sharp
4. **Image is uploaded** to Vercel Blob Storage via `/api/upload`
5. **Blob URL is returned** and saved to the client record

### API Endpoint

**POST `/api/upload`**
- Accepts: `FormData` with `file` field
- Returns: `{ url: string, filename: string }`
- Validates: Image type, 10MB max size
- Processes: Resizes to 1080x1920, converts to JPEG

### Storage Structure

Images are stored in Vercel Blob with the following path:
```
client-photos/{timestamp}-{originalName}.jpg
```

Example: `client-photos/1704067200000-john-doe.jpg`

## Troubleshooting

### Error: "BLOB_READ_WRITE_TOKEN is not configured"
- **Solution**: Add the token to your `.env.local` file and restart the dev server

### Error: "Failed to upload file"
- **Check**: Token is valid and has write permissions
- **Check**: File size is under 10MB
- **Check**: File is a valid image format (JPG, PNG, GIF, etc.)

### Images not displaying
- **Check**: Blob URL is accessible (public access is enabled)
- **Check**: Network tab in browser dev tools for 404 errors

## Features

✅ Automatic image resizing (1080x1920)
✅ Format conversion to JPEG
✅ File size validation (10MB max)
✅ Public access URLs
✅ Error handling with user-friendly messages
✅ Graceful fallback (form can be submitted without photo if upload fails)

## Notes

- Images are stored permanently in Vercel Blob
- Old images are not automatically deleted when clients are updated
- Consider implementing image cleanup for deleted clients if needed
- All images are publicly accessible via their blob URLs


