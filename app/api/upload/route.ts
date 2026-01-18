import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import sharp from 'sharp'

const TARGET_WIDTH = 1080
const TARGET_HEIGHT = 1920

export async function POST(request: NextRequest) {
  try {
    // Check if BLOB_READ_WRITE_TOKEN is configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('BLOB_READ_WRITE_TOKEN is not configured')
      return NextResponse.json(
        { 
          error: 'Blob storage is not configured. Please set BLOB_READ_WRITE_TOKEN environment variable.',
          details: 'In development, you can set this in your .env.local file. In production, set it in your Vercel project settings.'
        },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type (images only)
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      )
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Resize image to 1080x1920 using sharp
    let resizedBuffer: Buffer
    try {
      resizedBuffer = await sharp(buffer)
        .resize(TARGET_WIDTH, TARGET_HEIGHT, {
          fit: 'cover', // Cover the entire area, may crop to maintain aspect ratio
          position: 'center', // Center the image when cropping
        })
        .jpeg({ quality: 90 }) // Convert to JPEG with 90% quality
        .toBuffer()
    } catch (resizeError: any) {
      console.error('Error resizing image:', resizeError)
      return NextResponse.json(
        { error: 'Failed to process image. Please ensure the file is a valid image.' },
        { status: 400 }
      )
    }

    // Generate unique filename with .jpg extension
    const timestamp = Date.now()
    const originalName = file.name.replace(/\.[^/.]+$/, '') // Remove original extension
    const filename = `client-photos/${timestamp}-${originalName}.jpg`

    // Create a new File object from the resized buffer
    const resizedFile = new File([resizedBuffer], `${originalName}.jpg`, {
      type: 'image/jpeg',
    })

    // Upload to Vercel Blob
    const blob = await put(filename, resizedFile, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })

    return NextResponse.json({
      url: blob.url,
      filename: blob.pathname,
    })
  } catch (error: any) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { 
        error: 'Failed to upload file', 
        details: error.message || 'Unknown error occurred',
        hint: error.message?.includes('token') ? 'Please check your BLOB_READ_WRITE_TOKEN environment variable' : undefined
      },
      { status: 500 }
    )
  }
}


