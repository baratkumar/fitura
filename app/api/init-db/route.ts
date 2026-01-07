import { NextResponse } from 'next/server'
import { initDatabase } from '@/lib/db'

export async function GET() {
  try {
    await initDatabase()
    return NextResponse.json({ message: 'Database initialized successfully' })
  } catch (error: any) {
    console.error('Error initializing database:', error)
    return NextResponse.json(
      { error: 'Failed to initialize database', details: error.message },
      { status: 500 }
    )
  }
}








